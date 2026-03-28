'use strict';

const path = require('path');
const chalk = require('chalk');
const scaffolder = require('../scaffolder');
const logger = require('../logger');
const fs = require('fs-extra');

/**
 * Files that are infrastructure templates (always safe to upgrade).
 * User-edited files like CLAUDE.md are excluded by default.
 */
const UPGRADEABLE = [
  // Infrastructure — always safe to re-apply
  { src: 'claude/settings.local.json.tpl',  dest: '.claude/settings.local.json' },
  { src: 'claude/README.md.tpl',            dest: '.claude/README.md' },
  { src: 'claude/hooks/pre-tool-use.sh.tpl',  dest: '.claude/hooks/pre-tool-use.sh' },
  { src: 'claude/hooks/post-tool-use.sh.tpl', dest: '.claude/hooks/post-tool-use.sh' },
  { src: 'claude/rules/no-sensitive-files.md.tpl', dest: '.claude/rules/no-sensitive-files.md' },
  { src: 'claude/skills/project-conventions/SKILL.md.tpl', dest: '.claude/skills/project-conventions/SKILL.md' },
  { src: 'memory/MEMORY.md.tpl',            dest: 'memory/MEMORY.md' },
  // Built-in AI slash commands — safe to upgrade (project-specific ones in USER_OWNED)
  { src: 'claude/commands/setup-project.md.tpl',    dest: '.claude/commands/setup-project.md' },
  { src: 'claude/commands/memory-sync.md.tpl',      dest: '.claude/commands/memory-sync.md' },
  { src: 'claude/commands/project-health.md.tpl',   dest: '.claude/commands/project-health.md' },
  { src: 'claude/commands/standup.md.tpl',          dest: '.claude/commands/standup.md' },
  { src: 'claude/commands/explain-codebase.md.tpl', dest: '.claude/commands/explain-codebase.md' },
  { src: 'claude/commands/fix-issue.md.tpl',        dest: '.claude/commands/fix-issue.md' },
  { src: 'claude/commands/scaffold-structure.md.tpl', dest: '.claude/commands/scaffold-structure.md' },
];

/**
 * User-owned files — only upgraded with --all flag.
 */
const USER_OWNED = [
  { src: 'CLAUDE.md.tpl',               dest: 'CLAUDE.md' },
  { src: 'CLAUDE.local.md.tpl',         dest: 'CLAUDE.local.md' },
  { src: '.env.example.tpl',            dest: '.env.example' },
  { src: 'mcp.json.tpl',                dest: '.mcp.json' },
  { src: '.gitignore.tpl',              dest: '.gitignore' },
  { src: 'claude/settings.json.tpl',    dest: '.claude/settings.json' },
  { src: 'claude/agents/code-reviewer.md.tpl', dest: '.claude/agents/code-reviewer.md' },
  { src: 'claude/commands/commit.md.tpl',     dest: '.claude/commands/commit.md' },
  { src: 'claude/commands/review-pr.md.tpl',  dest: '.claude/commands/review-pr.md' },
  { src: 'memory/feedback_communication.md.tpl', dest: 'memory/feedback_communication.md' },
  { src: 'memory/project_ai_workflow.md.tpl',   dest: 'memory/project_ai_workflow.md' },
  { src: 'memory/user_profile.md.tpl',          dest: 'memory/user_profile.md' },
];

async function upgrade(options) {
  const targetDir = path.resolve(options.dir || process.cwd());
  const includeAll = options.all || false;
  const dryRun = options.dryRun || false;

  if (!await fs.pathExists(path.join(targetDir, '.claude'))) {
    logger.error('No .claude/ directory found. Run `agentforge init` first.');
    process.exit(1);
  }

  console.log('');
  console.log(chalk.bold.cyan('  agentforge') + chalk.dim('  —  Upgrade Templates'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  if (dryRun) console.log(chalk.bold.yellow('  [DRY RUN] No files will be written'));
  if (includeAll) console.log(chalk.yellow('  [--all] Including user-owned files (CLAUDE.md, settings.json, etc.)'));
  console.log('');

  const templatesDir = path.join(__dirname, '../../templates');
  const manifest = includeAll ? [...UPGRADEABLE, ...USER_OWNED] : UPGRADEABLE;

  const stats = { updated: 0, skipped: 0 };

  for (const entry of manifest) {
    const srcAbs = path.join(templatesDir, entry.src);
    const destAbs = path.join(targetDir, entry.dest);

    const result = await scaffolder.writeFile(srcAbs, destAbs, { force: true, dryRun });

    if (dryRun) {
      console.log(`  ${chalk.cyan('~')}  ${chalk.dim(entry.dest)}  ${chalk.cyan('would update')}`);
    } else {
      console.log(`  ${chalk.yellow('↺')}  ${chalk.dim(entry.dest)}`);
    }
    stats.updated++;
  }

  // Re-chmod hooks
  if (!dryRun) {
    await scaffolder.chmod(path.join(targetDir, '.claude/hooks/pre-tool-use.sh'), 0o755);
    await scaffolder.chmod(path.join(targetDir, '.claude/hooks/post-tool-use.sh'), 0o755);
  }

  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));

  if (dryRun) {
    console.log(chalk.cyan(`  Dry run: ${stats.updated} file(s) would be updated.`));
    console.log('');
  } else {
    console.log(chalk.green(`  ✓ ${stats.updated} infrastructure file(s) updated to latest templates.`));
    if (!includeAll) {
      console.log('');
      console.log(chalk.dim('  User-owned files (CLAUDE.md, settings.json, agents, commands) were NOT touched.'));
      console.log(chalk.dim('  Use --all to force-update everything (will overwrite your edits).'));
    }
    console.log('');
    console.log(chalk.bold('  What to do next:'));
    console.log('');
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('/project-health')}     ${chalk.dim('audit your setup to see if anything else needs attention')}`);
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('agentforge status')}      ${chalk.dim('verify the updated files look correct')}`);
    console.log('');
  }
}

module.exports = upgrade;
