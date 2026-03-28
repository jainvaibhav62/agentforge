---
name: project-conventions
description: Apply the coding conventions and standards defined in CLAUDE.md for this project. Invoke this skill before writing new code, creating files, or refactoring — especially when the user hasn't specified a style preference. Claude-invocable only.
user-invocable: false
---

# Project Conventions Skill

This skill reminds Claude to read and apply project-specific conventions before writing code.

## What to Read First

Before writing any code, always read:

1. **`CLAUDE.md`** — the authoritative source for this project's commands, architecture, and style
2. **Neighboring files** — files in the same directory as the file being created/edited reveal local patterns
3. **`memory/project_ai_workflow.md`** — AI-specific conventions for this project

## Core Principles

- **Match the surrounding style exactly** — if the codebase uses tabs, use tabs; if it uses `const`, use `const`
- **Read before you write** — read at least 2 existing files in the relevant module before creating anything new
- **No debug artifacts** — never commit `console.log`, `print()`, `debugger`, or commented-out blocks
- **No silent failures** — always propagate or log errors; never swallow exceptions

## Before Finishing Any Task

Run through this checklist mentally:

- [ ] Does the new code match the surrounding style?
- [ ] Are all variables and functions named consistently with the rest of the file?
- [ ] Is there any debug code or dead code to remove?
- [ ] Are there hardcoded values that should be constants or environment variables?
- [ ] Does this need a test? If yes, was one written or is one planned?

## Customizing This Skill

Update the sections above to reflect your project's actual conventions.
The more specific you are, the less correction Claude will need.
