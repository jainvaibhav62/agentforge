'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

async function status(options) {
  const targetDir = path.resolve(options.dir || process.cwd());

  console.log('');
  console.log(chalk.bold.cyan('  agentforge') + chalk.dim('  —  Project Status'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  console.log('');

  // ── Core scaffold check ───────────────────────────────────────────────────
  const coreFiles = [
    { path: 'CLAUDE.md',                    label: 'CLAUDE.md (project context)' },
    { path: 'CLAUDE.local.md',              label: 'CLAUDE.local.md (personal context)' },
    { path: '.claude/settings.json',        label: '.claude/settings.json' },
    { path: '.claude/settings.local.json',  label: '.claude/settings.local.json' },
    { path: '.mcp.json',                    label: '.mcp.json (MCP servers)' },
    { path: '.env.example',                 label: '.env.example' },
    { path: '.gitignore',                   label: '.gitignore' },
    { path: 'memory/MEMORY.md',             label: 'memory/MEMORY.md (index)' },
  ];

  console.log(chalk.bold('  Core Files'));
  for (const f of coreFiles) {
    const exists = await fs.pathExists(path.join(targetDir, f.path));
    const icon = exists ? chalk.green('✓') : chalk.red('✗');
    const label = exists ? chalk.dim(f.label) : chalk.red(f.label + ' — missing');
    console.log(`  ${icon}  ${label}`);
  }

  // ── Settings summary ──────────────────────────────────────────────────────
  const settingsPath = path.join(targetDir, '.claude/settings.json');
  if (await fs.pathExists(settingsPath)) {
    try {
      const settings = await fs.readJson(settingsPath);
      console.log('');
      console.log(chalk.bold('  Settings'));
      console.log(chalk.dim('  Model:   ') + chalk.white(settings.model || chalk.yellow('(not set, using global default)')));

      const allowCount = (settings.permissions?.allow || []).length;
      const denyCount = (settings.permissions?.deny || []).length;
      console.log(chalk.dim('  Perms:   ') + chalk.white(`${allowCount} allowed, ${denyCount} denied`));

      const hookCount = Object.values(settings.hooks || {}).reduce((n, arr) => n + arr.length, 0);
      console.log(chalk.dim('  Hooks:   ') + chalk.white(`${hookCount} hook rule(s) configured`));
    } catch (_) {
      console.log(chalk.yellow('  ⚠  Could not parse .claude/settings.json'));
    }
  }

  // ── MCP servers ───────────────────────────────────────────────────────────
  const mcpPath = path.join(targetDir, '.mcp.json');
  if (await fs.pathExists(mcpPath)) {
    try {
      const mcp = await fs.readJson(mcpPath);
      const servers = Object.keys(mcp.mcpServers || {});
      console.log('');
      console.log(chalk.bold('  MCP Servers'));
      if (servers.length === 0) {
        console.log(chalk.dim('  (none configured)'));
      } else {
        servers.forEach(s => console.log(chalk.dim('  •') + ' ' + chalk.white(s)));
      }
    } catch (_) {}
  }

  // ── Agents ────────────────────────────────────────────────────────────────
  const agentsDir = path.join(targetDir, '.claude/agents');
  if (await fs.pathExists(agentsDir)) {
    const agents = (await fs.readdir(agentsDir)).filter(f => f.endsWith('.md'));
    console.log('');
    console.log(chalk.bold('  Agents') + chalk.dim(` (${agents.length})`));
    if (agents.length === 0) {
      console.log(chalk.dim('  (none — run `agentforge add agent <name>`)'));
    } else {
      for (const agent of agents) {
        const name = agent.replace('.md', '');
        const desc = await readFrontmatterField(path.join(agentsDir, agent), 'description');
        console.log(chalk.dim('  •') + ' ' + chalk.cyan(name) + (desc ? chalk.dim(` — ${truncate(desc, 60)}`) : ''));
      }
    }
  }

  // ── Slash Commands ────────────────────────────────────────────────────────
  const commandsDir = path.join(targetDir, '.claude/commands');
  if (await fs.pathExists(commandsDir)) {
    const commands = (await fs.readdir(commandsDir)).filter(f => f.endsWith('.md'));
    console.log('');
    console.log(chalk.bold('  Slash Commands') + chalk.dim(` (${commands.length})`));
    if (commands.length === 0) {
      console.log(chalk.dim('  (none — run `agentforge add command <name>`)'));
    } else {
      for (const cmd of commands) {
        const name = cmd.replace('.md', '');
        const desc = await readFrontmatterField(path.join(commandsDir, cmd), 'description');
        console.log(chalk.dim('  •') + ' /' + chalk.cyan(name) + (desc ? chalk.dim(` — ${truncate(desc, 55)}`) : ''));
      }
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsDir = path.join(targetDir, '.claude/skills');
  if (await fs.pathExists(skillsDir)) {
    const skills = await fs.readdir(skillsDir);
    const skillDirs = [];
    for (const s of skills) {
      const sp = path.join(skillsDir, s, 'SKILL.md');
      if (await fs.pathExists(sp)) skillDirs.push(s);
    }
    console.log('');
    console.log(chalk.bold('  Skills') + chalk.dim(` (${skillDirs.length})`));
    if (skillDirs.length === 0) {
      console.log(chalk.dim('  (none — run `agentforge add skill <name>`)'));
    } else {
      for (const skill of skillDirs) {
        const desc = await readFrontmatterField(path.join(skillsDir, skill, 'SKILL.md'), 'description');
        console.log(chalk.dim('  •') + ' ' + chalk.cyan(skill) + (desc ? chalk.dim(` — ${truncate(desc, 55)}`) : ''));
      }
    }
  }

  // ── Memory files ──────────────────────────────────────────────────────────
  const memoryDir = path.join(targetDir, 'memory');
  if (await fs.pathExists(memoryDir)) {
    const memFiles = (await fs.readdir(memoryDir)).filter(f => f.endsWith('.md'));
    console.log('');
    console.log(chalk.bold('  Memory') + chalk.dim(` (${memFiles.length} files)`));
    for (const f of memFiles) {
      const size = (await fs.stat(path.join(memoryDir, f))).size;
      const filled = size > 200 ? chalk.green('●') : chalk.yellow('○');
      console.log(`  ${filled}  ${chalk.dim(f)}${size <= 200 ? chalk.yellow(' — empty template') : ''}`);
    }
  }

  console.log('');
  console.log(chalk.dim('  ─────────────────────────────────────────'));

  // Contextual hints based on what's missing
  const missingCore = [];
  for (const f of coreFiles) {
    if (!await fs.pathExists(path.join(targetDir, f.path))) missingCore.push(f.path);
  }

  if (missingCore.length > 0) {
    console.log(chalk.yellow(`  ⚠  ${missingCore.length} core file(s) missing. Run: `) + chalk.cyan('agentforge init'));
    console.log('');
  } else {
    console.log('');
    console.log(chalk.bold('  Productivity tips:'));
    console.log('');
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('/setup-project "description"')}   ${chalk.dim('AI-fills CLAUDE.md, agents, commands in the IDE chat')}`);
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('/scaffold-structure')}             ${chalk.dim('creates src/, tests/, and starter files in IDE chat')}`);
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('/project-health')}                 ${chalk.dim('audits your setup and suggests improvements in IDE chat')}`);
    console.log(`  ${chalk.dim('›')} ${chalk.cyan('agentforge upgrade')}              ${chalk.dim('update hook scripts and built-in commands to latest')}`);
    console.log('');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function readFrontmatterField(filePath, field) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const fm = match[1];
    const fieldMatch = fm.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    return fieldMatch ? fieldMatch[1].trim() : null;
  } catch (_) {
    return null;
  }
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

module.exports = status;
