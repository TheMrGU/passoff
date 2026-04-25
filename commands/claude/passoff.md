---
description: Create a handoff summarizing this conversation for the next AI agent
allowed-tools: mcp__passoff__passoff_create
---

Create a Passoff handoff capturing the current state of this conversation so another AI agent (Cursor, Codex, a fresh Claude session, etc.) can pick up cleanly.

Call the `passoff_create` MCP tool with:

- **title**: one-line summary, ≤120 chars, action-oriented (e.g. "Wired up auth middleware, tests failing on refresh flow")
- **content**: a structured markdown body covering:
  - **Goal** — what we're trying to accomplish
  - **Current state** — what's done, what's in progress
  - **Next steps** — the immediate next thing to do
  - **Gotchas** — anything non-obvious the next agent needs to know (failing tests, weird state, decisions made and why)
  - **Files touched** — key paths with one-line descriptions
- **tags**: 2–5 short tags (e.g. `["auth", "bug"]`)
- **from_model**: `"claude-opus-4-7"` (or whichever model you actually are)

After it returns, print the handoff id so the user can reference it.
