---
description: Load the latest handoff for this project and resume where the previous agent left off
allowed-tools: mcp__passoff__passoff_load, mcp__passoff__passoff_list
---

Load the most recent Passoff handoff for the current project.

1. Call the `passoff_load` MCP tool with `{ "latest": true }`. This returns the most recent active (non-archived) handoff **across all projects** — handoffs often move you between projects, which is the point. The same handoff can be re-loaded across sessions until it's archived.
2. Read the returned handoff carefully — especially **Current state**, **Next steps**, and **Gotchas**.
3. Confirm to the user in 2–3 sentences: who handed off (from_client + from_model), when, and what the next step is.
4. Do NOT start executing the next step until the user confirms you should proceed.

If no handoff is returned, tell the user there are no active handoffs and offer to run `/passoff list` alternatives.
