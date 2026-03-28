# .claude/ — Claude Code Configuration

This directory configures Claude Code for this project.
It is **team-shared** (committed to git), except for `settings.local.json`.

---

## Directory Structure

| Path | Purpose |
|------|---------|
| `settings.json` | Team settings: model, permissions, hooks |
| `settings.local.json` | Personal overrides — **gitignored, never commit** |
| `agents/` | Sub-agent definitions (`.md` files invoked via the Agent tool) |
| `commands/` | Slash command scripts — invoke with `/command-name` in Claude Code |
| `hooks/` | Shell scripts run automatically on tool events (PreToolUse, PostToolUse) |
| `rules/` | Reusable rule files referenced by agents or hooks |
| `skills/` | Skill definitions — each skill is a subdirectory containing `SKILL.md` |

---

## Settings Priority

Claude Code merges settings in this order (later wins):

1. **Global** — `~/.claude/settings.json`
2. **Project shared** — `.claude/settings.json` ← this file
3. **Project local** — `.claude/settings.local.json` ← personal overrides (gitignored)

---

## Adding Slash Commands

Create a `.md` file in `commands/` with optional YAML frontmatter:

```markdown
---
description: What this command does (shown in the command palette)
allowed-tools: Bash(git:*), Read, Edit
---

Instructions for Claude when this command is invoked...
```

Invoke with `/command-name` in the Claude Code chat.

---

## Adding Sub-Agents

Create a `.md` file in `agents/` with YAML frontmatter:

```markdown
---
name: my-agent
description: When Claude should use this agent and what it does — be specific
model: sonnet
color: blue
---

Agent system prompt here...
```

Claude will automatically invoke agents when their description matches the task.

---

## Adding Skills

Create `skills/<skill-name>/SKILL.md` with frontmatter:

```markdown
---
name: skill-name
description: Specific trigger condition — when should Claude invoke this skill?
user-invocable: true
---

Skill instructions...
```

---

## Hook Scripts

Hook scripts in `hooks/` receive a JSON blob on `stdin` describing the tool event
and can output JSON to `stdout` to influence Claude's behavior:

- `{"decision": "block", "reason": "..."}` — prevents the tool from running
- `{"decision": "warn", "reason": "..."}` — shows a warning but allows the tool
- `{"systemMessage": "..."}` — injects a message into Claude's context (PostToolUse)
- Empty output — allows the tool to proceed normally

See [Claude Code Hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) for the full schema.
