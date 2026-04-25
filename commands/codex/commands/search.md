---
description: Full-text search across passoff handoffs in the current project.
---

# Passoff Search

Find prior handoffs by keyword using the configured `passoff_*` MCP tools.

## Preflight

1. Confirm the passoff MCP tools are available in this session.
2. Take the inline argument as the search query. If empty, ask the user for keywords — do not search blank.

## Plan

1. Call `passoff_search` with `{ "query": "<user text>" }`. Project-scoped by default.
2. Render the ranked hits.

## Commands

Call the `passoff_search` MCP tool with required `query` and optional `project`, `limit`.

## Verification

1. Confirm the tool call succeeded.
2. If no hits, state that explicitly and suggest broadening the query or running `/passoff:list` to browse.

## Summary

For each hit, show: id, title, snippet, status, and relative created_at.

## Next Steps

- Do not auto-load any hit. Wait for the user to confirm, then load with `/passoff:load` using the chosen id.
