---
description: Stage relevant changes and create a conventional git commit with a well-formed message
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

## Context

Review the current repository state before committing:

- Working tree status: !`git status`
- Full diff (staged + unstaged): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits (for message style reference): !`git log --oneline -10`

## Task

Analyze the changes above and create a single commit:

1. **Stage** only the files relevant to the current change (avoid staging unrelated files)
2. **Write a commit message** following Conventional Commits format:
   ```
   type(scope): short description under 72 chars

   Optional body explaining WHY, not what (the diff shows the what).
   ```
   Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
3. **Run the commit** in a single `git commit -m "..."` call

## Rules

- Never use `git add .` or `git add -A` — stage files by name
- Never skip hooks with `--no-verify`
- If the diff is empty or nothing relevant is staged, report that instead of committing
- Subject line must be under 72 characters
