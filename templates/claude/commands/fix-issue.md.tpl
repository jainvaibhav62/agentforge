---
description: Investigate and fix a bug or failing test. Pass the error message, issue number, or description of the problem. Usage: /fix-issue "TypeError: cannot read property of undefined in auth.ts:42"
allowed-tools: Read, Edit, MultiEdit, Bash(git status:*), Bash(git diff:*), Bash(npm test:*), Bash(pytest:*), Bash(go test:*), Grep, Glob
---

## Context

- Working state: !`git status --short`
- Recent changes that may have introduced the bug: !`git log --oneline -5`

**Issue**: $ARGUMENTS

## Task

Investigate and fix the issue described above. Follow this process:

### 1. Understand Before Changing

- Read the error message or description carefully
- Locate the relevant files (use Grep/Glob to find them)
- Read the failing code and understand what it's supposed to do
- Check git log for when this code last changed: `git log -p --follow <file>`
- Form a hypothesis before writing any code

### 2. Minimal Fix

- Make the smallest change that fixes the root cause
- Do NOT refactor surrounding code, rename variables, or "improve" things you didn't break
- If the fix requires touching more than 3 files, pause and explain the approach first

### 3. Verify

After the fix:
- Run the relevant tests to confirm the fix works
- Check that you haven't introduced regressions in related tests
- If no tests cover this behavior, note that a test should be added

### 4. Explain

Briefly explain:
- What was wrong (root cause, not just symptom)
- What the fix does
- Whether a test should be added and why
