Full-text search across Passoff handoffs in this project.

1. Use the user's query (everything after `/passoff-search`). If empty, ask for keywords — don't search blank.
2. Call the `passoff_search` MCP tool with `{ "query": "<their text>" }`. Project-scoped by default.
3. Show ranked hits: id, title, snippet, status, created_at (relative).
4. If no hits, suggest broadening the query or `/passoff-list` to browse.
5. Do not auto-load — let the user confirm, then run `/passoff-load` with the id.
