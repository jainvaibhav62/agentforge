---
description: Generate a standup update from recent git commits, open issues, and current working state. Optionally pass a date range: /standup "last 3 days"
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(git branch:*), Bash(gh issue:*), Bash(gh pr:*)
---

## Context

- Recent commits: !`git log --oneline --since="yesterday" --author="$(git config user.name)" 2>/dev/null || git log --oneline -10`
- Current branch: !`git branch --show-current 2>/dev/null`
- Working state: !`git status --short 2>/dev/null`
- Open PRs (if gh available): !`gh pr list --author "@me" --state open 2>/dev/null || echo "(gh not available)"`

**Date range**: $ARGUMENTS

## Task

Write a concise standup update with these three sections:

### Yesterday / Since last standup
Summarize what was actually done based on the git log. Group related commits into themes rather than listing every commit individually. Be specific about what changed.

### Today / Next
Based on the in-progress work (current branch, uncommitted changes, open PRs), describe what's planned next.

### Blockers
Only include this section if there are actual blockers visible (failing tests, unresolved merge conflicts, unclear requirements, etc.). Otherwise omit it.

---

**Format rules:**
- Each section: 1–4 bullet points max
- Plain language — no jargon, readable by anyone on the team
- Skip the section headers if a section is empty
- Total length: under 150 words
