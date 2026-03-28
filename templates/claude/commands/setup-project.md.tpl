---
description: AI-fill the complete Claude Code project configuration. Run after `claudeforge project "description"` — or run it directly with your project description as the argument. Generates CLAUDE.md, settings, agents, commands, memory, and more.
allowed-tools: Read, Write, Edit, MultiEdit, Bash(git status:*), Bash(git log:*), Bash(ls:*), Bash(find:*), Bash(cat:*), Bash(rm:*)
---

## Step 1 — Gather All Context

Read the project setup context if it was prepared by the CLI:

!`test -f SETUP_CONTEXT.md && cat SETUP_CONTEXT.md || echo "(no SETUP_CONTEXT.md — using argument and detected files)"`

Detect the project's current state:

- Root directory: !`ls -la`
- Tech stack files: !`ls package.json requirements.txt pyproject.toml go.mod Cargo.toml pom.xml Gemfile composer.json tsconfig.json next.config.js vite.config.ts docker-compose.yml Dockerfile 2>/dev/null || echo "(none detected)"`
- package.json: !`test -f package.json && cat package.json || echo "(none)"`
- Python deps: !`test -f requirements.txt && cat requirements.txt || test -f pyproject.toml && cat pyproject.toml || echo "(none)"`
- Go module: !`test -f go.mod && cat go.mod || echo "(none)"`
- Existing CLAUDE.md: !`cat CLAUDE.md 2>/dev/null || echo "(not yet written)"`
- Git history: !`git log --oneline -5 2>/dev/null || echo "(no commits yet)"`

**My project**: $ARGUMENTS

---

## Step 2 — Fill Every Configuration File

Using all context above, generate tailored content for each file. Be specific and opinionated — no placeholders, no generic examples. Every value should reflect the actual tech stack.

### 2a. Rewrite `CLAUDE.md`

Write a complete `CLAUDE.md` that includes:

**Header**: Project name (infer from package.json/go.mod/directory name) and one-line description.

**Commands table**: Real commands for this exact stack — not placeholders. Examples:
- Python/FastAPI: `uvicorn src.main:app --reload`, `pytest`, `ruff check .`, `alembic upgrade head`
- Node.js/Next.js: `npm run dev`, `npm test`, `npm run build`, `npx prisma migrate dev`
- Go: `go run ./cmd/server`, `go test ./...`, `golangci-lint run`, `go build -o bin/app ./cmd/server`

**Architecture**: Directory tree of what the project structure should look like once scaffolded.

**Code Style**: Specific conventions — naming, imports, error handling, test patterns — for this stack.

**Environment Variables**: Table with Name, Description, Required columns — matching `.env.example`.

**Gotchas**: 3–5 non-obvious things about this stack (e.g., "FastAPI route order matters — more specific routes must be declared before generic ones").

**Workflow**: How to use `/commit`, `/review-pr`, and project-specific agents.

### 2b. Update `.claude/settings.json`

Read the current file first, then merge in stack-appropriate additions:

```
Read: .claude/settings.json
```

Add to `permissions.allow` for the detected stack:
- Python: `Bash(pytest:*)`, `Bash(ruff:*)`, `Bash(mypy:*)`, `Bash(alembic:*)`, `Bash(pip:*)`
- Node.js: `Bash(npm run:*)`, `Bash(npx:*)`, `Bash(node:*)`
- Go: `Bash(go test:*)`, `Bash(go build:*)`, `Bash(go run:*)`, `Bash(golangci-lint:*)`
- Docker: `Bash(docker-compose:*)`, `Bash(docker build:*)`, `Bash(docker run:*)`

Keep all existing keys (model, hooks, deny list).

### 2c. Write `.env.example`

Generate a real `.env.example` grouped by category. Each variable needs:
- A comment explaining what it's for and where to get it
- A realistic example value
- A `(required)` or `(optional)` marker

Include variables for: the app itself, any databases mentioned, any external APIs implied by the description, and any auth/session configuration.

### 2d. Update `.mcp.json`

Always keep `context7`. Add servers based on the stack:
- PostgreSQL mentioned → `@modelcontextprotocol/server-postgres`
- Web app with browser testing → `@playwright/mcp` or `@modelcontextprotocol/server-puppeteer`
- GitHub integration → `@modelcontextprotocol/server-github`
- File-heavy operations → `@modelcontextprotocol/server-filesystem`

### 2e. Rewrite `memory/project_ai_workflow.md`

Write a complete, project-specific workflow document:
- Which agents to use and when (be explicit: "use `api-reviewer` whenever adding a new endpoint")
- Which slash commands map to which tasks
- MCP servers available and how to invoke them
- Project-specific AI conventions (e.g., "always read `src/db/schema.py` before writing queries")
- Any architectural decisions that Claude should know and respect

### 2f. Create 2–4 Specialized Agents

Create agent files in `.claude/agents/`. Choose agents appropriate to the project type:

**For API/Backend projects:**
- `api-reviewer.md` — Reviews new endpoints: checks REST conventions, input validation, auth, error responses, OpenAPI compliance
- `db-reviewer.md` — Reviews database changes: checks query performance, migration safety, index coverage, N+1 risks

**For Frontend projects:**
- `component-reviewer.md` — Reviews UI components: checks accessibility, responsive design, prop types, performance (memo, useMemo)
- `ux-checker.md` — Reviews user-facing copy, loading states, error states, empty states

**For Data/ML projects:**
- `data-validator.md` — Validates data pipelines: schema consistency, null handling, statistical reasonableness
- `ml-reviewer.md` — Reviews model code: data leakage, correct train/val/test splits, metric definitions

**For all projects:**
- `security-auditor.md` — Deep security review: focuses on auth flows, input sanitization, secrets management, dependency CVEs

Each agent must have:
- Accurate `description` frontmatter (this determines when Claude invokes it automatically)
- A detailed system prompt with a numbered checklist specific to the project
- A clear output format

### 2g. Create 2–4 Slash Commands

Create command files in `.claude/commands/` specific to this workflow:

**Common by stack:**
- Python: `test.md` (runs pytest with coverage, explains failures), `migrate.md` (runs Alembic, validates schema)
- Node.js: `test.md` (runs the test suite, explains failures), `typecheck.md` (runs tsc, explains type errors)
- Any DB project: `seed.md` (seeds the database with realistic test data)
- Any deployed project: `deploy.md` (pre-deploy checklist + deploy command + smoke test)

Each command must use `!` dynamic context (e.g., `!git diff`, `!npm test 2>&1`) and have a clear `## Task` section.

### 2h. Append `.gitignore` Tech-Stack Patterns

Append a labeled section with patterns for this stack. Examples:
- Python: `__pycache__/`, `*.pyc`, `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `dist/`, `*.egg-info/`
- Node.js: already covered by base template
- Go: `bin/`, `*.exe`, `*.test`, `coverage.out`
- Rust: `target/`

---

## Step 3 — Clean Up

Delete the context file if it exists:

```bash
rm -f SETUP_CONTEXT.md
```

---

## Step 4 — Document Every File Generated

After all files are written, go back and add a documentation header to each one so users know what they're looking at and what to customize.

For each file written, prepend (or add at an appropriate location):

**CLAUDE.md** — add at the top after the title:
```
> **Setup status**: Generated by claudeforge. Update the Commands table with your actual
> project commands after verifying them. Fill in the Gotchas section as you discover them.
```

**`.claude/settings.json`** — add a `_readme` key (JSON doesn't support comments, use this):
```json
"_readme": "Team-shared Claude Code settings. Personal overrides go in settings.local.json (gitignored). See .claude/README.md for the full reference."
```

**Each agent file** — after the frontmatter, add:
```
<!-- WHAT THIS IS: A Claude sub-agent that specializes in [specific task].
     HOW TO INVOKE: Claude uses this automatically when the task matches the description.
     HOW TO CUSTOMIZE: Edit the checklist items below to match your project's specific patterns.
     THINGS TO ADD: Project-specific anti-patterns, naming conventions, architectural rules. -->
```

**Each command file** — after the frontmatter, add:
```
<!-- WHAT THIS IS: A slash command. Run it with /[name] in the Claude Code chat.
     HOW IT WORKS: Claude reads the ## Context section (! lines run as shell commands)
     then follows the ## Task instructions.
     HOW TO CUSTOMIZE: Edit the ## Task section. Add more ! context lines if needed. -->
```

**memory/project_ai_workflow.md** — add at the top:
```
<!-- Update this file as your AI workflow evolves. Claude reads it every session.
     The more specific you are, the less you'll need to re-explain things to Claude. -->
```

---

## Step 5 — Write `SETUP_SUMMARY.md`

Create a `SETUP_SUMMARY.md` in the project root:

```markdown
# Claude Code Setup Summary

Generated by `/setup-project` on [today's date].

## What Was Generated

| File | What It Does | Key Things to Customize |
|------|-------------|------------------------|
| `CLAUDE.md` | Project context loaded every session | Update Commands table with real commands; add Gotchas as you discover them |
| `.claude/settings.json` | Permissions + hooks for Claude Code | Add more allowed commands as you expand your workflow |
| `.env.example` | Documents required env vars | Update with any new vars; never commit real values |
| `.mcp.json` | MCP servers your team shares | Add connection strings to .env for any DB servers |
| `memory/project_ai_workflow.md` | AI conventions for this project | Update as your workflow evolves; Claude reads this every session |
| [agent files] | Specialized review agents | Customize checklists to add project-specific patterns |
| [command files] | Slash commands for your workflow | Edit the ## Task section to match your exact needs |

## Slash Commands Available

Run these in the Claude Code chat window:

| Command | When to Use |
|---------|------------|
| `/setup-project` | Re-run project setup with a new description |
| `/commit` | After completing a task — creates a conventional commit |
| `/review-pr` | Before opening a PR — structured diff review |
| `/project-health` | Weekly — audits your setup and suggests improvements |
| `/memory-sync` | End of session — persists what Claude learned today |
| `/standup` | Morning — generates standup from yesterday's commits |
| `/scaffold-structure` | Once — creates the src/, tests/, etc. directory structure |
| [project commands] | See .claude/commands/ for project-specific commands |

## Agents Available

Claude uses these automatically based on what you're doing:

| Agent | Invoked When |
|-------|-------------|
| `code-reviewer` | After writing code, before PR |
| [project agents] | See .claude/agents/ for project-specific agents |

## Next Steps

1. **Verify commands** in `CLAUDE.md` — run each one and confirm they work
2. **Create `.env`** from `.env.example` — fill in real values
3. **Run `/scaffold-structure`** in Claude Code chat to create the project directory layout
4. **Open Claude Code** in this directory and start building
5. Delete this file once you've read it
```

---

## Step 6 — Final Summary

Print a clear summary of everything that was done:

1. List every file written
2. List every agent created with its trigger description
3. List every slash command created with its use case
4. State the exact next step: "Run `/scaffold-structure` in Claude Code to create your project's directory structure"
