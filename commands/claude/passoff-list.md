---
description: List recent Passoff handoffs in this project
allowed-tools: mcp__passoff__passoff_list
---

List recent Passoff handoffs so the user can pick one to load or inspect.

1. Call the `passoff_list` MCP tool. By default it returns the 10 most recent handoffs in the current project, all statuses. If the user named a status (open, loaded, archived, all) or a project, pass it through.
2. Render a compact table with: id, title, status, from_client → to_client, created_at (relative).
3. If the result is empty, say so plainly and offer `/passoff` to create one or `/passoff-load` to pull the latest from another project.
4. Do NOT auto-load any of the listed handoffs — the user picks.
