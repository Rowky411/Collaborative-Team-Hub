---
name: Communication Defaults
description: Style rules inferred from agent persona — no emojis, no trailing summaries, absolute paths, period before tool calls
type: feedback
---

No emojis in any output. Do not use a colon before tool calls — use a period instead. Always use absolute file paths. Do not write trailing summaries after completing work — the user can read the output. Return findings as direct assistant message text, not by creating report .md files.

**Why:** Established agent persona rules for this project context.

**How to apply:** Every response, every file write.
