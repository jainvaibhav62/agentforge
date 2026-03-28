---
description: Get a thorough explanation of how this codebase is structured and how the key parts work. Useful when onboarding to a new project. Pass a specific area to focus on, or leave empty for a full overview.
allowed-tools: Read, Glob, Grep, Bash(ls:*), Bash(git log:*), Bash(find:*)
---

## Context

- Project root: !`ls -la`
- Source files: !`find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | head -40`
- CLAUDE.md: !`cat CLAUDE.md 2>/dev/null || echo "(no CLAUDE.md)"`
- Recent changes: !`git log --oneline -10 2>/dev/null`
- Entry points: !`cat package.json 2>/dev/null || cat go.mod 2>/dev/null || cat pyproject.toml 2>/dev/null || echo "(no manifest found)"`

**Focus area**: $ARGUMENTS

## Task

Produce a clear explanation of this codebase tailored to someone who needs to contribute to it.

### Structure
Start with the directory layout and what each top-level folder/file does.

### How It Works
Explain the main flow: how a request/event/input enters the system and what happens to it. Trace the path through the key files.

### Key Concepts
Explain any domain-specific patterns, abstractions, or conventions that aren't obvious from the code alone. What do you need to understand to make changes confidently?

### Entry Points
Where does execution start? What are the main files someone would edit for common tasks (adding a feature, fixing a bug, adding a test)?

### What to Read First
If someone is new and wants to understand the codebase in 30 minutes, which 3–5 files should they read and in what order?

${ARGUMENTS ? `\nFocus especially on: ${ARGUMENTS}` : ''}

Keep the explanation practical — oriented toward making changes, not just describing what exists.
