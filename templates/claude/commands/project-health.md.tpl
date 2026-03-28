---
description: Audit the Claude Code project setup and report what's missing, incomplete, or could be improved. Run this after init to see what still needs attention.
allowed-tools: Read, Bash(ls:*), Bash(cat:*), Bash(find:*), Glob, Grep
---

## Context

Gather the current project state:

- Root files: !`ls -la`
- .claude contents: !`find .claude -type f | sort 2>/dev/null || echo "(no .claude dir)"`
- Memory files: !`find memory -type f 2>/dev/null || echo "(no memory dir)"`
- Settings: !`cat .claude/settings.json 2>/dev/null || echo "(no settings.json)"`
- MCP config: !`cat .mcp.json 2>/dev/null || echo "(no .mcp.json)"`
- CLAUDE.md: !`cat CLAUDE.md 2>/dev/null || echo "(no CLAUDE.md)"`
- .gitignore: !`cat .gitignore 2>/dev/null || echo "(no .gitignore)"`
- Git status: !`git status 2>/dev/null || echo "(not a git repo)"`

## Task

Audit the Claude Code setup and produce a **health report** with three sections:

---

### ✓ What's Working Well

List things that are properly configured. Be specific — mention file names and what's good about them.

---

### ⚠ Needs Attention

For each issue found, format as:

**[SEVERITY]** `path/to/file`
Issue: [what's wrong or missing]
Fix: [concrete action to take]

Check for:
- `CLAUDE.md` — is it still the generic template? Are commands real or placeholders?
- `.claude/settings.json` — is the model set? Are permissions appropriate for the stack?
- `.env.example` — does it have real variables or still generic?
- `.mcp.json` — is it just context7 or are there project-appropriate servers?
- `memory/` files — are they still empty templates (under 200 bytes)?
- `.claude/agents/` — are there only the defaults, or project-specific agents?
- `.claude/commands/` — are there only the defaults, or project-specific commands?
- `.claude/hooks/` — do the hook scripts exist and are they executable?
- `.gitignore` — does it cover secrets, local settings, and the tech stack?
- Missing `CLAUDE.local.md` — is the personal context file present?

---

### 🚀 Recommended Next Steps

Ordered by impact:

1. [Highest impact action]
2. [Second action]
3. [etc.]

**Quick wins** (under 5 minutes):
- [Action 1]
- [Action 2]

**Bigger improvements**:
- [Description and why it matters]

---

End with: "Run `claudeforge status` in the terminal for a machine-readable summary."
