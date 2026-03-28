# [Project Name]

> One-line description of what this project does.

---

## Commands

Replace these with your project's actual commands.

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run test suite |
| `npm run lint` | Lint and type-check |

---

## Architecture

```
<project-root>/
  src/          # Application source code
  tests/        # Test files
  .claude/      # Claude Code configuration (agents, commands, hooks, skills)
  memory/       # Persistent project memory for Claude
  .mcp.json     # MCP server configuration (team-shared)
  CLAUDE.md     # This file — Claude's project context
```

> Update this tree to reflect the actual structure after scaffolding.

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — project context loaded by Claude automatically |
| `CLAUDE.local.md` | Personal context (gitignored) |
| `.claude/settings.json` | Claude Code permissions, model, and hooks (team-shared) |
| `.claude/settings.local.json` | Personal Claude settings override (gitignored) |
| `.mcp.json` | MCP server definitions (team-shared) |
| `memory/MEMORY.md` | Index of persistent memory files |

---

## Code Style

> Add your project's conventions here. Claude reads this before writing code.

- [ ] Language and version (e.g., TypeScript 5.x, Python 3.12)
- [ ] Formatter and rules (e.g., Prettier with 2-space indent, ESLint)
- [ ] Naming conventions (e.g., `camelCase` functions, `PascalCase` components)
- [ ] Import style (e.g., named exports only, no default exports)
- [ ] Test framework and patterns (e.g., Vitest, co-located `*.test.ts`)

---

## Environment Variables

Required variables (see `.env.example` for the full list):

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |

Copy `.env.example` → `.env` and fill in values before running locally.

---

## Claude Workflow

### Slash Commands

| Command | When to use |
|---------|------------|
| `/commit` | After completing a feature — stages and commits with conventional message |
| `/review-pr` | Before opening a PR — reviews the diff and flags issues |

### Agents

| Agent | When to use |
|-------|------------|
| `code-reviewer` | After implementing a feature, before creating a PR |

### Memory

Claude maintains persistent memory in `memory/`. Tell Claude to "remember" facts
and it will update the appropriate file. These persist across sessions.

---

## Gotchas

> Non-obvious things that cause issues. Add them as you discover them.

- [ ] Add known pitfalls here
- [ ] e.g., "Service X requires VPN — requests silently fail without it"
- [ ] e.g., "Always run migrations before starting the dev server"

---

## Resources

> Links to internal docs, design docs, runbooks, etc.

- [ ] Architecture decision records (ADRs)
- [ ] API documentation
- [ ] Deployment runbook
