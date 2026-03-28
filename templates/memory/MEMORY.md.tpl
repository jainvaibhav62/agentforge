# Project Memory Index

This file is an **index** of persistent memory files for this project.
It is always loaded into Claude's context at the start of every session.

> **Do NOT write memory content directly here.**
> Create individual files and add a one-line pointer below.
> Lines past ~200 are truncated — keep this index concise.

---

## Memory Files

<!-- Format: - [Title](./filename.md) — one-line description (≤120 chars) -->

- [user_profile.md](./user_profile.md) — Developer role, preferences, and working style
- [feedback_communication.md](./feedback_communication.md) — How Claude should communicate in this project
- [project_ai_workflow.md](./project_ai_workflow.md) — AI tools, agents, and workflow conventions

---

## How This System Works

1. `MEMORY.md` (this file) is always loaded — keep it under 200 lines
2. Individual memory files are read on-demand when relevant to the current task
3. Claude updates memory files as it learns project context across sessions
4. Tell Claude **"Remember that [fact]"** to persist something across sessions
5. Tell Claude **"Forget that [fact]"** to remove a memory entry

## Memory File Types

| Type | Purpose |
|------|---------|
| `user` | Who you are, your role, preferences, and expertise |
| `feedback` | How Claude should behave — corrections and confirmed approaches |
| `project` | Ongoing work, goals, decisions, deadlines |
| `reference` | Where to find things in external systems |
