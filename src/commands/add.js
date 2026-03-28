'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const logger = require('../logger');

const TEMPLATES_DIR = path.join(__dirname, '../../templates');

async function addAgent(name, options) {
  const targetDir = path.resolve(options.dir || process.cwd());

  if (!name || !name.trim()) {
    logger.error('Please provide an agent name.');
    console.log(chalk.dim('  Example: claudeforge add agent api-reviewer'));
    process.exit(1);
  }

  const slug = toKebab(name);
  const destPath = path.join(targetDir, '.claude/agents', `${slug}.md`);

  await assertNotExists(destPath, options.force);

  const description = options.description || `Use this agent to [describe when Claude should invoke ${slug}].`;
  const model = options.model || 'sonnet';
  const color = options.color || 'blue';

  const content = `---
name: ${slug}
description: ${description}
model: ${model}
color: ${color}
---

# ${toTitle(name)} Agent

<!-- Replace this with the agent's system prompt. Be specific about:
  - What the agent specializes in
  - What inputs it expects from the caller
  - What output format it produces
  - Any rules or constraints it follows
-->

You are a specialized agent for [task].

## Instructions

1. [Step 1]
2. [Step 2]

## Output Format

[Describe the expected output]
`;

  await fs.ensureFile(destPath);
  await fs.writeFile(destPath, content, 'utf8');

  console.log('');
  console.log(`  ${chalk.green('✓')} Created ${chalk.cyan(`.claude/agents/${slug}.md`)}`);
  logger.hints('What to do next:', [
    { cmd: `open .claude/agents/${slug}.md`,           note: 'edit the system prompt — be specific about what it reviews' },
    { cmd: `/review-pr`,                               note: 'test the agent by having it review your current branch' },
    { cmd: `claudeforge status`,                   note: 'confirm the agent appears in your project' },
  ]);
}

async function addCommand(name, options) {
  const targetDir = path.resolve(options.dir || process.cwd());

  if (!name || !name.trim()) {
    logger.error('Please provide a command name.');
    console.log(chalk.dim('  Example: claudeforge add command deploy'));
    process.exit(1);
  }

  const slug = toKebab(name);
  const destPath = path.join(targetDir, '.claude/commands', `${slug}.md`);

  await assertNotExists(destPath, options.force);

  const description = options.description || `[Describe what /${slug} does]`;

  const content = `---
description: ${description}
allowed-tools: Bash, Read, Edit
---

## Context

<!-- Add dynamic context using !command syntax if needed -->
<!-- Example: - Git status: !\`git status\` -->

## Task

<!-- Describe what Claude should do when this command is invoked. -->
<!-- Be specific: what to read first, what to check, what to produce. -->

[Instructions for Claude when /${slug} is invoked]

## Rules

- [Rule 1]
- [Rule 2]
`;

  await fs.ensureFile(destPath);
  await fs.writeFile(destPath, content, 'utf8');

  console.log('');
  console.log(`  ${chalk.green('✓')} Created ${chalk.cyan(`.claude/commands/${slug}.md`)}`);
  logger.hints('What to do next:', [
    { cmd: `open .claude/commands/${slug}.md`,         note: 'edit the ## Task section — add real instructions' },
    { cmd: `/${slug}`,                                 note: 'run in Claude Code chat to test it' },
    { cmd: `claudeforge add command <name>`,       note: 'add another command for your workflow' },
  ]);
}

async function addSkill(name, options) {
  const targetDir = path.resolve(options.dir || process.cwd());

  if (!name || !name.trim()) {
    logger.error('Please provide a skill name.');
    console.log(chalk.dim('  Example: claudeforge add skill database-patterns'));
    process.exit(1);
  }

  const slug = toKebab(name);
  const skillDir = path.join(targetDir, '.claude/skills', slug);
  const destPath = path.join(skillDir, 'SKILL.md');

  await assertNotExists(destPath, options.force);

  const description = options.description || `Apply ${toTitle(name)} patterns and conventions. Invoke when [specific trigger condition].`;
  const userInvocable = options.userInvocable !== false;

  const content = `---
name: ${slug}
description: ${description}
user-invocable: ${userInvocable}
---

# ${toTitle(name)} Skill

<!-- Define what Claude should know and do when this skill is active. -->
<!-- Be specific: which files to read, patterns to follow, rules to apply. -->

## When to Apply

[Describe the exact conditions under which this skill should be active]

## Instructions

1. Read [relevant files or context first]
2. Apply [specific patterns or conventions]
3. [Additional steps]

## Rules

- [Rule 1 — specific to this skill]
- [Rule 2]

## Do Not

- [Common mistake to avoid]
`;

  await fs.ensureDir(skillDir);
  await fs.writeFile(destPath, content, 'utf8');

  console.log('');
  console.log(`  ${chalk.green('✓')} Created ${chalk.cyan(`.claude/skills/${slug}/SKILL.md`)}`);
  logger.hints('What to do next:', [
    { cmd: `open .claude/skills/${slug}/SKILL.md`,     note: 'fill in the Instructions section with specific conventions' },
    { cmd: `claudeforge status`,                   note: 'verify the skill appears in your project summary' },
    { cmd: `/project-health`,                          note: 'run in Claude Code chat to audit your full setup' },
  ]);
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function assertNotExists(filePath, force) {
  if (!force && await fs.pathExists(filePath)) {
    logger.error(`File already exists: ${path.relative(process.cwd(), filePath)}`);
    console.log(chalk.dim('  Use --force to overwrite.'));
    process.exit(1);
  }
}

function toKebab(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toTitle(str) {
  return str
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

module.exports = { addAgent, addCommand, addSkill };
