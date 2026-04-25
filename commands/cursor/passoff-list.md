List recent Passoff handoffs so the user can pick one.

1. Call the `passoff_list` MCP tool. Default returns the 10 most recent in this project across all statuses. Pass `status` (open, loaded, archived, all) or `project` only if the user named one.
2. Render a compact table: id, title, status, from_client → to_client, created_at (relative).
3. If empty, say so and suggest `/passoff` to create one or `/passoff-load` for the latest across projects.
4. Do not auto-load — the user picks.
