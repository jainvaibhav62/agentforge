'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { detect } = require('../stack-detector');
const logger = require('../logger');

async function github(options) {
  const targetDir = path.resolve(options.dir || process.cwd());
  const dryRun = options.dryRun || false;
  const withDevcontainer = options.devcontainer !== false;
  const withPrTemplate = options.prTemplate !== false;
  const withIssueTemplates = options.issueTemplates !== false;

  // Auto-detect stack unless overridden
  let stack = options.stack;
  if (!stack) {
    const { labels } = await detect(targetDir);
    stack = detectPrimaryStack(labels);
  }

  console.log('');
  console.log(chalk.bold.cyan('  agentforge') + chalk.dim('  —  GitHub Setup'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  if (dryRun) console.log(chalk.bold.yellow('  [DRY RUN] No files will be written'));
  console.log('');
  console.log(`  ${chalk.dim('Detected stack:')} ${chalk.white(stack)}`);
  console.log('');

  const writes = [];

  // ── GitHub Actions CI ─────────────────────────────────────────────────────
  writes.push({
    dest: '.github/workflows/ci.yml',
    content: buildCI(stack),
  });

  // ── PR Template ───────────────────────────────────────────────────────────
  if (withPrTemplate) {
    writes.push({
      dest: '.github/pull_request_template.md',
      content: PR_TEMPLATE,
    });
  }

  // ── Issue Templates ───────────────────────────────────────────────────────
  if (withIssueTemplates) {
    writes.push({
      dest: '.github/ISSUE_TEMPLATE/bug_report.md',
      content: BUG_TEMPLATE,
    });
    writes.push({
      dest: '.github/ISSUE_TEMPLATE/feature_request.md',
      content: FEATURE_TEMPLATE,
    });
    writes.push({
      dest: '.github/ISSUE_TEMPLATE/config.yml',
      content: ISSUE_CONFIG,
    });
  }

  // ── CODEOWNERS ────────────────────────────────────────────────────────────
  writes.push({
    dest: '.github/CODEOWNERS',
    content: CODEOWNERS,
  });

  // ── Devcontainer ──────────────────────────────────────────────────────────
  if (withDevcontainer) {
    writes.push({
      dest: '.devcontainer/devcontainer.json',
      content: buildDevcontainer(stack),
    });
  }

  // ── Write files ───────────────────────────────────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const w of writes) {
    const destAbs = path.join(targetDir, w.dest);

    if (dryRun) {
      console.log(`  ${chalk.cyan('~')}  ${chalk.dim(w.dest)}  ${chalk.cyan('would create')}`);
      created++;
      continue;
    }

    const exists = await fs.pathExists(destAbs);
    if (exists) {
      console.log(`  ${chalk.gray('○')}  ${chalk.dim(w.dest)}  ${chalk.gray('skipped (already exists)')}`);
      skipped++;
    } else {
      await fs.ensureDir(path.dirname(destAbs));
      await fs.writeFile(destAbs, w.content, 'utf8');
      console.log(`  ${chalk.green('✓')}  ${chalk.dim(w.dest)}`);
      created++;
    }
  }

  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));

  if (dryRun) {
    console.log(chalk.cyan(`  Dry run: ${created} file(s) would be created.`));
    console.log('');
    return;
  }

  console.log(chalk.green(`  ✓ ${created} file(s) created,  ${skipped} skipped.`));
  console.log('');

  logger.hints('What to do next:', [
    { cmd: 'git add .github/ .devcontainer/',        note: 'stage the new files' },
    { cmd: '/setup-project "your description"',       note: 'run in Claude Code chat — Claude can refine the CI workflow for your stack' },
    { cmd: 'agentforge status',                       note: 'confirm full project setup' },
  ]);
}

// ── Stack detection ───────────────────────────────────────────────────────────

function detectPrimaryStack(labels) {
  const l = labels.join(' ').toLowerCase();
  if (l.includes('rust')) return 'rust';
  if (l.includes('go')) return 'go';
  if (l.includes('python') || l.includes('fastapi') || l.includes('django')) return 'python';
  if (l.includes('node') || l.includes('typescript') || l.includes('react') || l.includes('next.js')) return 'node';
  return 'generic';
}

// ── CI workflow builders ──────────────────────────────────────────────────────

function buildCI(stack) {
  if (stack === 'node') return NODE_CI;
  if (stack === 'python') return PYTHON_CI;
  if (stack === 'go') return GO_CI;
  if (stack === 'rust') return RUST_CI;
  return GENERIC_CI;
}

const NODE_CI = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Lint & Test
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Type check
        run: npm run typecheck --if-present

      - name: Test
        run: npm test

      - name: Build
        run: npm run build --if-present
`;

const PYTHON_CI = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Lint & Test
    runs-on: ubuntu-latest

    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip

      - name: Install dependencies
        run: |
          pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt 2>/dev/null || true

      - name: Lint (ruff)
        run: ruff check . --if-present 2>/dev/null || true

      - name: Type check (mypy)
        run: mypy . --if-present 2>/dev/null || true

      - name: Test
        run: pytest -v
`;

const GO_CI = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Lint, Vet & Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: stable

      - name: Download dependencies
        run: go mod download

      - name: Vet
        run: go vet ./...

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: latest

      - name: Test
        run: go test -race -coverprofile=coverage.txt ./...

      - name: Build
        run: go build ./...
`;

const RUST_CI = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Lint, Clippy & Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Cache cargo
        uses: Swatinem/rust-cache@v2

      - name: Format check
        run: cargo fmt --check

      - name: Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings

      - name: Test
        run: cargo test --all-features

      - name: Build (release)
        run: cargo build --release
`;

const GENERIC_CI = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: |
          echo "Add your test command here"
          # e.g. make test, ./scripts/test.sh, etc.
`;

// ── Static templates ──────────────────────────────────────────────────────────

const PR_TEMPLATE = `## Summary

<!-- What does this PR do? 1-3 bullet points. -->

-
-

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI / infrastructure

## Test plan

<!-- How was this tested? -->

- [ ] Unit tests pass (\`npm test\` / \`pytest\` / \`go test\` / \`cargo test\`)
- [ ] Manually tested locally
- [ ] Added new tests for new behaviour

## Checklist

- [ ] Code follows the style guide in CLAUDE.md
- [ ] No hardcoded secrets or credentials
- [ ] CLAUDE.md / docs updated if needed
- [ ] PR title follows conventional commits (\`feat:\`, \`fix:\`, \`chore:\`, etc.)

---
> Reviewed by [code-reviewer agent](.claude/agents/code-reviewer.md) before merging.
`;

const BUG_TEMPLATE = `---
name: Bug report
about: Something is broken
title: '[Bug] '
labels: bug
assignees: ''
---

## Describe the bug

<!-- Clear description of what went wrong. -->

## To reproduce

1.
2.
3.

## Expected behaviour

## Actual behaviour

## Environment

- OS:
- Node / Python / Go / Rust version:
- Package version:

## Additional context

<!-- Logs, screenshots, etc. -->
`;

const FEATURE_TEMPLATE = `---
name: Feature request
about: Suggest an improvement or new capability
title: '[Feature] '
labels: enhancement
assignees: ''
---

## Problem

<!-- What problem would this solve? -->

## Proposed solution

## Alternatives considered

## Additional context
`;

const ISSUE_CONFIG = `blank_issues_enabled: false
contact_links:
  - name: Documentation
    url: https://github.com/your-org/your-repo#readme
    about: Read the docs first
`;

const CODEOWNERS = `# CODEOWNERS
# https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Default owners for everything
* @your-org/your-team

# Infrastructure
.github/        @your-org/platform
.devcontainer/  @your-org/platform
`;

// ── Devcontainer builder ──────────────────────────────────────────────────────

function buildDevcontainer(stack) {
  const image = {
    node:    'mcr.microsoft.com/devcontainers/javascript-node:22',
    python:  'mcr.microsoft.com/devcontainers/python:3.12',
    go:      'mcr.microsoft.com/devcontainers/go:1.22',
    rust:    'mcr.microsoft.com/devcontainers/rust:latest',
    generic: 'mcr.microsoft.com/devcontainers/base:ubuntu',
  }[stack] || 'mcr.microsoft.com/devcontainers/base:ubuntu';

  const features = [];
  if (stack !== 'node') features.push('"ghcr.io/devcontainers/features/node:1": {}');
  if (stack === 'python') features.push('"ghcr.io/devcontainers/features/python:1": {}');

  const postCreate = {
    node:    'npm install',
    python:  'pip install -r requirements.txt 2>/dev/null || true',
    go:      'go mod download',
    rust:    'rustup component add rustfmt clippy',
    generic: 'echo "Add your setup commands here"',
  }[stack] || 'echo done';

  return JSON.stringify({
    name: 'agentforge Dev Container',
    image,
    features: features.length > 0 ? Object.fromEntries(features.map(f => {
      const [key, val] = f.split(': ');
      return [key.replace(/"/g, ''), JSON.parse(val)];
    })) : undefined,
    customizations: {
      vscode: {
        extensions: [
          'anthropics.claude-code',
          'dbaeumer.vscode-eslint',
          'esbenp.prettier-vscode',
          'eamodio.gitlens',
        ],
        settings: {
          'editor.formatOnSave': true,
          'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
      },
    },
    postCreateCommand: postCreate,
    remoteUser: 'vscode',
  }, null, 2) + '\n';
}

module.exports = github;
