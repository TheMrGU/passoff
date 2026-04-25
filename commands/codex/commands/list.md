---
description: List recent passoff handoffs in the current project so the user can pick one to load.
---

# Passoff List

Browse recent handoffs using the configured `passoff_*` MCP tools.

## Preflight

1. Confirm the passoff MCP tools are available in this session.
2. Inspect any inline argument: a status filter (open, loaded, archived, all) or a project slug.

## Plan

1. Call `passoff_list`. Default returns the 10 most recent handoffs in the current project across all statuses.
2. Pass `status` or `project` only if the user named one.
3. Render the result so the user can choose what to load.

## Commands

Call the `passoff_list` MCP tool with optional `status`, `project`, and `limit`.

## Verification

1. Confirm the tool call succeeded.
2. If no handoffs match, state that explicitly and suggest creating one with `/passoff:create` or loading the latest cross-project with `/passoff:load`.

## Summary

For each row, show: id, title, status, from_client → to_client, and relative created_at.

## Next Steps

- Do not auto-load any handoff. Wait for the user to pick one, then continue with `/passoff:load` using the chosen id.
