'use strict';

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const readline = require('readline');

// Everything claudeforge creates — safe to wipe
const CLAUDEFORGE_PATHS = [
  '.claude',
  'memory',
  'CLAUDE.md',
  'CLAUDE.local.md',
  '.mcp.json',
  'SETUP_CONTEXT.md',
  'SETUP_SUMMARY.md',
];

async function clear(options) {
  const targetDir = path.resolve(options.dir || process.cwd());
  const dryRun = options.dryRun || false;
  const force = options.force || false;

  console.log('');
  console.log(chalk.bold.cyan('  claudeforge') + chalk.dim('  —  Clear Project Structure'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  if (dryRun) console.log(chalk.bold.yellow('  [DRY RUN] No files will be deleted'));
  console.log('');

  // Check which paths actually exist
  const existing = [];
  for (const p of CLAUDEFORGE_PATHS) {
    const abs = path.join(targetDir, p);
    if (await fs.pathExists(abs)) existing.push(p);
  }

  if (existing.length === 0) {
    console.log(chalk.dim('  Nothing to clear — no claudeforge files found.'));
    console.log('');
    return;
  }

  // Show what will be removed
  console.log(chalk.bold('  The following will be permanently deleted:'));
  console.log('');
  for (const p of existing) {
    const abs = path.join(targetDir, p);
    const stat = await fs.stat(abs);
    const label = stat.isDirectory() ? chalk.yellow(p + '/') : chalk.yellow(p);
    console.log(`  ${chalk.red('✗')}  ${label}`);
  }
  console.log('');

  if (dryRun) {
    console.log(chalk.cyan(`  Dry run: ${existing.length} item(s) would be deleted.`));
    console.log(chalk.dim('  Run without --dry-run to actually delete them.'));
    console.log('');
    return;
  }

  // Confirm unless --force
  if (!force) {
    const answer = await prompt(
      chalk.red('  ⚠  This cannot be undone. Type ') +
      chalk.bold.red('yes') +
      chalk.red(' to confirm: ')
    );
    console.log('');
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log(chalk.dim('  Aborted — nothing was deleted.'));
      console.log('');
      return;
    }
  }

  // Delete
  for (const p of existing) {
    const abs = path.join(targetDir, p);
    await fs.remove(abs);
    console.log(`  ${chalk.red('✗')}  ${chalk.dim(p)}  ${chalk.red('deleted')}`);
  }

  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  console.log(chalk.green(`  ✓ ${existing.length} item(s) removed.`));
  console.log('');
  console.log(chalk.bold('  Start fresh:'));
  console.log('');
  console.log(`  ${chalk.dim('›')} ${chalk.cyan('claudeforge init')}     ${chalk.dim('re-scaffold the full structure')}`);
  console.log(`  ${chalk.dim('›')} ${chalk.cyan('claudeforge create')}   ${chalk.dim('start a new project from scratch with the wizard')}`);
  console.log('');
}

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

module.exports = clear;
