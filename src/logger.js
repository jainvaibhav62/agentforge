'use strict';

const chalk = require('chalk');

const ICONS = { created: '✓', skipped: '○', overwritten: '↺', dir: '⌂' };
const COLORS = {
  created: chalk.green,
  skipped: chalk.gray,
  overwritten: chalk.yellow,
  dir: chalk.blue,
};

function banner(dryRun) {
  console.log('');
  console.log(chalk.bold.cyan('  claudeforge') + chalk.dim('  —  Claude Code Project Scaffolder'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  if (dryRun) console.log(chalk.bold.yellow('  [DRY RUN] No files will be written'));
  console.log('');
}

function info(msg) {
  console.log(chalk.dim('  →') + ' ' + chalk.white(msg));
}

function fileResult(result, relPath, dryRun) {
  if (dryRun && result !== 'skipped') {
    console.log(`  ${chalk.cyan('~')}  ${chalk.dim(relPath)}  ${chalk.cyan('would create')}`);
    return;
  }
  const icon = COLORS[result](ICONS[result]);
  console.log(`  ${icon}  ${chalk.dim(relPath)}  ${chalk.dim(result)}`);
}

function dirResult(relPath, dryRun) {
  if (dryRun) {
    console.log(`  ${chalk.cyan('~')}  ${chalk.dim(relPath + '/')}  ${chalk.cyan('dir')}`);
    return;
  }
  console.log(`  ${COLORS.dir(ICONS.dir)}  ${chalk.dim(relPath + '/')}  ${chalk.blue('dir')}`);
}

function summary(stats, dryRun) {
  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));

  if (dryRun) {
    console.log(chalk.cyan(`  Dry run complete.  ${stats.created} file(s) would be created,  ${stats.skipped} would be skipped.`));
    console.log('');
    return;
  }

  console.log(
    chalk.green('  Done!') +
    chalk.dim(`  ${stats.created} created,  ${stats.overwritten} overwritten,  ${stats.skipped} skipped.`)
  );
  console.log('');
  _hints('What to do next:', [
    { cmd: 'claudeforge project "describe your project"', note: 'prepares AI context for the IDE' },
    { cmd: '/setup-project "describe your project"',          note: 'run in Claude Code chat — fills in everything' },
    { cmd: '/scaffold-structure',                             note: 'run in Claude Code chat — creates src/, tests/, etc.' },
    { cmd: 'claudeforge status',                          note: 'see everything configured so far' },
  ]);
}

function error(msg) {
  console.error(chalk.red('  ✗  Error: ') + msg);
}

// ── Shared hint box ───────────────────────────────────────────────────────────

/**
 * Print a contextual "What's next?" hint box.
 * @param {string} title
 * @param {Array<{cmd: string, note: string}>} hints
 */
function hints(title, hintList) {
  _hints(title, hintList);
}

function _hints(title, hintList) {
  console.log(chalk.bold(`  ${title}`));
  console.log('');
  for (const h of hintList) {
    console.log(`  ${chalk.dim('›')} ${chalk.cyan(h.cmd)}`);
    if (h.note) console.log(`    ${chalk.dim(h.note)}`);
  }
  console.log('');
}

module.exports = { banner, info, fileResult, dirResult, summary, error, hints };
