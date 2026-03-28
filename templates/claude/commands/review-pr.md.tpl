---
description: Review the current branch as a pull request — summarize changes, identify risks, and flag issues
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(gh pr:*), Read, Grep
---

## Context

- Branch diff against main: !`git diff main...HEAD`
- Commits on this branch: !`git log main..HEAD --oneline`
- Files changed: !`git diff main...HEAD --name-only`
- Current branch: !`git branch --show-current`

## Task

Review this pull request as if you were a senior engineer on the team:

### 1. Summary (2-3 sentences)
What does this PR do? What problem does it solve?

### 2. Changed Files
Group the changed files by concern (e.g., "API layer", "tests", "config").

### 3. Risk Areas
Which files or logic changes require the most careful review? Why?

### 4. Issues Found
For each issue:
```
**[SEVERITY]** `file.ts:line`
Issue: <what is wrong>
Fix: <recommendation>
```
Severity: `CRITICAL` | `WARNING` | `SUGGESTION`

### 5. Verdict
One of:
- `✓ LGTM` — ready to merge
- `~ LGTM with suggestions` — merge after addressing suggestions
- `✗ Request changes` — must address CRITICAL/WARNING items before merging

## Notes
- Check `CLAUDE.md` for project-specific conventions to enforce
- If no issues are found, say so explicitly — don't invent nitpicks
