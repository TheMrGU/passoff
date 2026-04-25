---
description: Full-text search across Passoff handoffs in this project
allowed-tools: mcp__passoff__passoff_search
---

Search prior handoffs by keyword to find the one the user is looking for.

1. Take the user's query (everything after `/passoff-search`). If they didn't supply one, ask for keywords first — do not search blank.
2. Call the `passoff_search` MCP tool with `{ "query": "<their text>" }`. Search is project-scoped by default; pass `project` only if the user explicitly named one.
3. Render the ranked hits with: id, title, snippet, status, created_at (relative).
4. If no hits, say so and suggest broadening the query or running `/passoff-list` to browse.
5. Do NOT auto-load any hit — confirm with the user, then they can run `/passoff-load` with the id.
