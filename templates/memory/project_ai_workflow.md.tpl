---
name: project-ai-workflow
description: How AI tools are integrated into this project's development workflow — agents, commands, hooks, and MCP servers in use
type: project
---

# Project AI Workflow

> Update this file as your team's AI workflow evolves.

## Slash Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/commit` | Stage and create a conventional commit | After completing a feature or fix |
| `/review-pr` | Review the current branch before opening a PR | Before `gh pr create` |

## Agents

| Agent | When Claude Uses It |
|-------|---------------------|
| `code-reviewer` | Reviewing changed code for bugs, security, and style issues |

## MCP Servers

| Server | Purpose |
|--------|---------|
| `context7` | Live documentation lookup for any library — use `use context7` in prompts |

## Active Hooks

| Hook | Trigger | Effect |
|------|---------|--------|
| `pre-tool-use.sh` | Before any Bash/Edit/Write call | Blocks `rm -rf /`, warns on `.env` edits, blocks `curl\|bash` |
| `post-tool-use.sh` | After Edit/Write/MultiEdit | Reminds Claude to run tests after editing test files |

## Project-Specific AI Context

> Add notes about what makes this project unique from an AI-assistance perspective.
> Examples:
> - "Always read `db/schema.ts` before writing any database queries"
> - "The API follows JSON:API spec — check `docs/api.md` when generating endpoints"
> - "We use a custom test helper in `tests/helpers.ts` — use it instead of raw assertions"
