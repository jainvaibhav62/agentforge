---
description: Update the memory files based on what you learned this session. Run at the end of a work session to persist context across future sessions.
allowed-tools: Read, Write, Edit
---

## Context

Read the current memory files to understand what's already recorded:

- Memory index: !`cat memory/MEMORY.md 2>/dev/null || echo "(not found)"`
- User profile: !`cat memory/user_profile.md 2>/dev/null || echo "(not found)"`
- Communication feedback: !`cat memory/feedback_communication.md 2>/dev/null || echo "(not found)"`
- Project workflow: !`cat memory/project_ai_workflow.md 2>/dev/null || echo "(not found)"`

## Task

Review this conversation and update the memory files with anything worth persisting.

### What to look for:

**user_profile.md** — Update if you learned:
- The user's role, team, or background
- Technical areas they're strong or weak in
- Working preferences they've stated or implied
- Communication style they prefer

**feedback_communication.md** — Update if you noticed:
- Something the user corrected ("don't do X", "stop doing Y")
- An approach they confirmed works well ("yes, exactly", "keep doing that")
- Response format preferences (terse vs. detailed, bullet lists vs. prose, etc.)
- Any non-obvious preferences worth remembering

**project_ai_workflow.md** — Update if you learned:
- New agents or commands created this session
- Project-specific conventions discovered while working
- External systems, APIs, or tools integrated
- Important architectural decisions made this session
- Deadlines, freezes, or priorities with dates

### Rules for updating memory:

1. **Lead with the rule/fact**, then add **Why:** and **How to apply:** lines
2. **Don't duplicate** — check if the fact is already recorded before adding
3. **Be specific** — "user prefers terse responses" is better than "user has preferences"
4. **Convert relative dates** to absolute dates (e.g., "Thursday" → the actual date)
5. **Update or remove** stale entries rather than appending contradictions
6. **Keep MEMORY.md index concise** — one line per file, under 150 chars

After updating, print a brief summary of what was added or changed.
