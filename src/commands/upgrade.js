'use strict';

const path = require('path');
const chalk = require('chalk');
const scaffolder = require('../scaffolder');
const logger = require('../logger');
const fs = require('fs-extra');

// ── Infrastructure files — always safe to update ──────────────────────────────
// These are claudeforge-owned. User edits here are not expected.
const INFRASTRUCTURE = new Set([
  '.claude/README.md',
  '.claude/settings.local.json',
  '.claude/hooks/pre-tool-use.sh',
  '.claude/hooks/post-tool-use.sh',
  '.claude/rules/no-sensitive-files.md',
  '.claude/skills/project-conventions/SKILL.md',
  'memory/MEMORY.md',
  // Built-in slash commands — all claudeforge-managed
  '.claude/commands/setup-project.md',
  '.claude/commands/analyze-project.md',
  '.claude/commands/memory-sync.md',
  '.claude/commands/project-health.md',
  '.claude/commands/standup.md',
  '.claude/commands/explain-codebase.md',
  '.claude/commands/fix-issue.md',
  '.claude/commands/scaffold-structure.md',
]);

// ── User-owned files — skip unless --all ─────────────────────────────────────
// These are edited by the user after init. Only touch with explicit --all.
const USER_OWNED = new Set([
  'CLAUDE.md',
  'CLAUDE.local.md',
  '.env.example',
  '.mcp.json',
  '.gitignore',
  '.claude/settings.json',
  '.claude/agents/code-reviewer.md',
  '.claude/commands/commit.md',
  '.claude/commands/review-pr.md',
  'memory/feedback_communication.md',
  'memory/project_ai_workflow.md',
  'memory/user_profile.md',
]);

// ── Full manifest (must stay in sync with init.js) ────────────────────────────
const MANIFEST = [
  // Directories
  { type: 'dir', dest: '.claude' },
  { type: 'dir', dest: '.claude/agents' },
  { type: 'dir', dest: '.claude/commands' },
  { type: 'dir', dest: '.claude/hooks' },
  { type: 'dir', dest: '.claude/rules' },
  { type: 'dir', dest: '.claude/skills' },
  { type: 'dir', dest: '.claude/skills/project-conventions' },
  { type: 'dir', dest: 'memory' },

  // .claude/ root
  { type: 'file', src: 'claude/README.md.tpl',           dest: '.claude/README.md' },
  { type: 'file', src: 'claude/settings.json.tpl',       dest: '.claude/settings.json' },
  { type: 'file', src: 'claude/settings.local.json.tpl', dest: '.claude/settings.local.json' },

  // Agents
  { type: 'file', src: 'claude/agents/code-reviewer.md.tpl', dest: '.claude/agents/code-reviewer.md' },

  // Built-in commands
  { type: 'file', src: 'claude/commands/commit.md.tpl',            dest: '.claude/commands/commit.md' },
  { type: 'file', src: 'claude/commands/review-pr.md.tpl',         dest: '.claude/commands/review-pr.md' },
  { type: 'file', src: 'claude/commands/setup-project.md.tpl',     dest: '.claude/commands/setup-project.md' },
  { type: 'file', src: 'claude/commands/analyze-project.md.tpl',   dest: '.claude/commands/analyze-project.md' },
  { type: 'file', src: 'claude/commands/memory-sync.md.tpl',       dest: '.claude/commands/memory-sync.md' },
  { type: 'file', src: 'claude/commands/project-health.md.tpl',    dest: '.claude/commands/project-health.md' },
  { type: 'file', src: 'claude/commands/standup.md.tpl',           dest: '.claude/commands/standup.md' },
  { type: 'file', src: 'claude/commands/explain-codebase.md.tpl',  dest: '.claude/commands/explain-codebase.md' },
  { type: 'file', src: 'claude/commands/fix-issue.md.tpl',         dest: '.claude/commands/fix-issue.md' },
  { type: 'file', src: 'claude/commands/scaffold-structure.md.tpl',dest: '.claude/commands/scaffold-structure.md' },

  // Hooks
  { type: 'file', src: 'claude/hooks/pre-tool-use.sh.tpl',  dest: '.claude/hooks/pre-tool-use.sh' },
  { type: 'file', src: 'claude/hooks/post-tool-use.sh.tpl', dest: '.claude/hooks/post-tool-use.sh' },

  // Rules
  { type: 'file', src: 'claude/rules/no-sensitive-files.md.tpl', dest: '.claude/rules/no-sensitive-files.md' },

  // Skills
  { type: 'file', src: 'claude/skills/project-conventions/SKILL.md.tpl', dest: '.claude/skills/project-conventions/SKILL.md' },

  // Memory
  { type: 'file', src: 'memory/MEMORY.md.tpl',                 dest: 'memory/MEMORY.md' },
  { type: 'file', src: 'memory/user_profile.md.tpl',           dest: 'memory/user_profile.md' },
  { type: 'file', src: 'memory/feedback_communication.md.tpl', dest: 'memory/feedback_communication.md' },
  { type: 'file', src: 'memory/project_ai_workflow.md.tpl',    dest: 'memory/project_ai_workflow.md' },

  // Project root
  { type: 'file', src: 'CLAUDE.md.tpl',       dest: 'CLAUDE.md' },
  { type: 'file', src: 'CLAUDE.local.md.tpl', dest: 'CLAUDE.local.md' },
  { type: 'file', src: 'env.example.tpl',     dest: '.env.example' },
  { type: 'file', src: 'mcp.json.tpl',        dest: '.mcp.json' },
  { type: 'file', src: 'gitignore.tpl',        dest: '.gitignore' },
];

async function upgrade(options) {
  const targetDir = path.resolve(options.dir || process.cwd());
  const includeAll = options.all || false;
  const dryRun = options.dryRun || false;

  if (!await fs.pathExists(path.join(targetDir, '.claude'))) {
    logger.error('No .claude/ directory found. Run `claudeforge init` first.');
    process.exit(1);
  }

  console.log('');
  console.log(chalk.bold.cyan('  claudeforge') + chalk.dim('  —  Upgrade Templates'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  if (dryRun) console.log(chalk.bold.yellow('  [DRY RUN] No files will be written'));
  if (includeAll) console.log(chalk.yellow('  [--all] Including user-owned files (CLAUDE.md, settings.json, etc.)'));
  console.log('');

  const templatesDir = path.join(__dirname, '../../templates');
  const stats = { updated: 0, created: 0, skipped: 0 };

  for (const entry of MANIFEST) {
    const destAbs = path.join(targetDir, entry.dest);

    // Always ensure directories exist
    if (entry.type === 'dir') {
      await scaffolder.ensureDir(destAbs, dryRun);
      continue;
    }

    const isInfrastructure = INFRASTRUCTURE.has(entry.dest);
    const isUserOwned = USER_OWNED.has(entry.dest);
    const alreadyExists = await fs.pathExists(destAbs);

    // Decision logic:
    // 1. Doesn't exist yet → always create (new file added in this version)
    // 2. Infrastructure     → always update
    // 3. User-owned exists  → skip unless --all
    let action;
    if (!alreadyExists) {
      action = 'create';
    } else if (isInfrastructure) {
      action = 'update';
    } else if (includeAll) {
      action = 'update';
    } else {
      action = 'skip';
    }

    if (action === 'skip') {
      console.log(`  ${chalk.dim('–')}  ${chalk.dim(entry.dest)}  ${chalk.dim('skipped (user-owned)')}`);
      stats.skipped++;
      continue;
    }

    const srcAbs = path.join(templatesDir, entry.src);

    if (dryRun) {
      const label = action === 'create' ? chalk.green('would create') : chalk.cyan('would update');
      console.log(`  ${chalk.cyan('~')}  ${chalk.dim(entry.dest)}  ${label}`);
    } else {
      await scaffolder.writeFile(srcAbs, destAbs, { force: true, dryRun: false });
      if (action === 'create') {
        console.log(`  ${chalk.green('+')}  ${chalk.dim(entry.dest)}  ${chalk.green('created (new in this version)')}`);
        stats.created++;
      } else {
        console.log(`  ${chalk.yellow('↺')}  ${chalk.dim(entry.dest)}`);
        stats.updated++;
      }
    }
  }

  // Re-chmod hooks
  if (!dryRun) {
    await scaffolder.chmod(path.join(targetDir, '.claude/hooks/pre-tool-use.sh'), 0o755);
    await scaffolder.chmod(path.join(targetDir, '.claude/hooks/post-tool-use.sh'), 0o755);
  }

  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));

  if (dryRun) {
    console.log(chalk.cyan(`  Dry run complete. Run without --dry-run to apply changes.`));
  } else {
    if (stats.created > 0) {
      console.log(chalk.green(`  ✓ ${stats.created} new file(s) created (added in this version)`));
    }
    console.log(chalk.green(`  ✓ ${stats.updated} infrastructure file(s) updated to latest templates`));
    if (stats.skipped > 0 && !includeAll) {
      console.log(chalk.dim(`  – ${stats.skipped} user-owned file(s) skipped (use --all to update them too)`));
    }
    console.log('');
    console.log(chalk.bold('  What to do next:'));
    console.log('');
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('/project-health')}     ${chalk.dim('audit your setup to see if anything else needs attention')}`);
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('claudeforge status')}  ${chalk.dim('verify the updated files look correct')}`);
  }
  console.log('');
}

module.exports = upgrade;
