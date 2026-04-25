---
description: Load the latest or a specific passoff handoff into the current Codex session.
---

# Passoff Load

Load prior handoff context using the configured `passoff_*` MCP tools.

## Preflight

1. Confirm the passoff MCP tools are available in this session.
2. Inspect any inline argument after the slash command.
3. If the argument looks like a handoff id, load that id.
4. If no specific id is provided, load the latest handoff.

## Plan

1. Determine whether to load by `id` or `latest: true`.
2. Call `passoff_load`.
3. Summarize the loaded handoff into actionable context for the current session.

## Commands

- If the user supplied a likely handoff id such as `ph_...`, call `passoff_load` with that `id`.
- Otherwise call `passoff_load` with `latest: true`.

After loading:

- Present the title, status, timestamps, and project if returned.
- Summarize `Current State`, `Decisions Made`, `Open Questions`, and `Next Steps`.
- Treat the loaded handoff as working context for follow-up requests.

## Verification

1. Confirm the tool call succeeded.
2. If no handoff is found, state that explicitly.
3. Confirm which handoff id was loaded.

## Summary

- Report the loaded handoff id
- Report whether it was loaded by explicit id or by latest
- Report the highest-signal next actions pulled from the handoff

## Next Steps

- Ask the user what they want to do with the loaded context only if the next action is not already obvious.
- Otherwise continue directly with the requested work using the loaded handoff as context.
