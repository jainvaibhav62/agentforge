'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const readline = require('readline');
const initCommand = require('./init');
const projectCommand = require('./project');
const logger = require('../logger');

// ── Readline helpers ──────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function askDefault(rl, question, defaultVal) {
  const answer = await ask(rl, question);
  return answer || defaultVal;
}

async function askChoice(rl, question, choices, defaultIdx = 0) {
  const labels = choices.map((c, i) => `${chalk.dim(`${i + 1}.`)} ${c.label}`).join('\n  ');
  const answer = await ask(rl, `${question}\n\n  ${labels}\n\n  ${chalk.dim('Enter number')} [${defaultIdx + 1}]: `);
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < choices.length) return choices[idx].value;
  return choices[defaultIdx].value;
}

async function askMultiChoice(rl, question, choices) {
  const labels = choices.map((c, i) => `${chalk.dim(`${i + 1}.`)} ${c.label}`).join('\n  ');
  const answer = await ask(rl, `${question}\n\n  ${labels}\n\n  ${chalk.dim('Enter numbers separated by commas, or press Enter to skip')}: `);
  if (!answer) return [];
  const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(i => i >= 0 && i < choices.length);
  return indices.map(i => choices[i].value);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function create(name, options) {
  const parentDir = path.resolve(options.dir || process.cwd());

  console.log('');
  console.log(chalk.bold.cyan('  agentforge') + chalk.dim('  —  Create New Project'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  console.log('');
  console.log(chalk.dim('  Answer a few questions and agentforge will scaffold a fully configured'));
  console.log(chalk.dim('  Claude Code project ready for AI-assisted development.'));
  console.log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // 1. Project name
    const defaultName = name || 'my-project';
    const projectName = await askDefault(rl, '  ' + chalk.bold('Project name') + ' ' + chalk.dim('[' + defaultName + ']') + ': ', defaultName);

    // 2. Description
    const description = await askDefault(
      rl,
      `\n  ${chalk.bold('Describe your project')} ${chalk.dim('(used to AI-configure everything)')}:\n  `,
      `${projectName} — a new project`
    );

    // 3. Stack
    const stack = await askChoice(rl, `\n  ${chalk.bold('Primary tech stack')}:`, [
      { label: 'Node.js / TypeScript',     value: 'node' },
      { label: 'Python (FastAPI / Django)', value: 'python' },
      { label: 'Go',                        value: 'go' },
      { label: 'Rust',                      value: 'rust' },
      { label: 'Other / Mixed',             value: 'generic' },
    ], 0);

    // 4. Optional features
    const features = await askMultiChoice(rl, `\n  ${chalk.bold('Optional features')} ${chalk.dim('(select all that apply)')}:`, [
      { label: 'GitHub Actions CI/CD + PR templates',   value: 'github' },
      { label: 'VS Code devcontainer',                  value: 'devcontainer' },
      { label: 'Docker + docker-compose',               value: 'docker' },
    ]);

    rl.close();

    // ── Scaffold ────────────────────────────────────────────────────────────
    const targetDir = path.join(parentDir, projectName);
    await fs.ensureDir(targetDir);

    console.log('');
    console.log(chalk.dim('  ─────────────────────────────────────────'));
    console.log('');
    console.log(`  ${chalk.green('✓')} Creating project at ${chalk.cyan(targetDir)}`);
    console.log('');

    // Run init
    await initCommand({ dir: targetDir, force: false, dryRun: false });

    // Run project
    await projectCommand(description, { dir: targetDir });

    // Optional: GitHub
    if (features.includes('github')) {
      const githubCommand = require('./github');
      await githubCommand({ dir: targetDir, dryRun: false, stack, devcontainer: features.includes('devcontainer'), prTemplate: true, issueTemplates: true });
    } else if (features.includes('devcontainer')) {
      const githubCommand = require('./github');
      await githubCommand({ dir: targetDir, dryRun: false, stack, devcontainer: true, prTemplate: false, issueTemplates: false });
    }

    // Optional: Docker stubs
    if (features.includes('docker')) {
      await writeDockerFiles(targetDir, stack, projectName);
    }

    // Final summary
    console.log('');
    console.log(chalk.dim('  ─────────────────────────────────────────'));
    console.log('');
    console.log(chalk.green.bold(`  ✓ Project "${projectName}" is ready!`));
    console.log('');
    console.log(chalk.bold('  What to do next:'));
    console.log('');
    console.log(`  ${chalk.dim('1.')} ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk.dim('2.')} Open in VS Code / your IDE with Claude Code`);
    console.log(`  ${chalk.dim('3.')} In the Claude Code chat, run:`);
    console.log(`     ${chalk.cyan.bold(`/setup-project "${truncate(description, 50)}"`)}`);
    console.log(`     ${chalk.dim('— Claude will fill in CLAUDE.md, agents, commands, and more')}`);
    console.log(`  ${chalk.dim('4.')} Then run ${chalk.cyan('/scaffold-structure')} to create src/, tests/, etc.`);
    console.log('');

  } catch (err) {
    if (!rl.closed) rl.close();
    logger.error(err.message || String(err));
    process.exit(1);
  }
}

async function writeDockerFiles(targetDir, stack, projectName) {
  const dockerfile = buildDockerfile(stack, projectName);
  const compose = buildDockerCompose(stack, projectName);
  await fs.writeFile(path.join(targetDir, 'Dockerfile'), dockerfile, 'utf8');
  await fs.writeFile(path.join(targetDir, 'docker-compose.yml'), compose, 'utf8');
  console.log(`  ${chalk.green('✓')} Written ${chalk.cyan('Dockerfile')}`);
  console.log(`  ${chalk.green('✓')} Written ${chalk.cyan('docker-compose.yml')}`);
}

function buildDockerfile(stack, name) {
  if (stack === 'node') {
    return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
  }
  if (stack === 'python') {
    return `FROM python:3.12-slim
WORKDIR /app
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
  }
  if (stack === 'go') {
    return `FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o /app/server ./cmd/server

FROM alpine:3.19
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
`;
  }
  if (stack === 'rust') {
    return `FROM rust:1.77-slim AS builder
WORKDIR /app
COPY Cargo.* ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/${name} /${name}
EXPOSE 8080
CMD ["/${name}"]
`;
  }
  return `FROM ubuntu:22.04
WORKDIR /app
COPY . .
`;
}

function buildDockerCompose(stack, name) {
  const port = stack === 'node' ? '3000' : stack === 'python' ? '8000' : '8080';
  return `services:
  app:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
`;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

module.exports = create;
