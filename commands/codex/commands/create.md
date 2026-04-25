---
description: Create a structured passoff handoff for another AI from the current Codex session.
---

# Passoff Create

Create a clean baton-pass handoff using the configured `passoff_*` MCP tools.

## Preflight

1. Confirm the passoff MCP tools are available in this session.
2. Inspect the current conversation and working context before writing the handoff.
3. If there is not enough meaningful context yet, stop and say so rather than creating a low-value handoff.

## Plan

1. Summarize the current state from the active session.
2. Capture key decisions and rationale.
3. List open questions and immediate next steps.
4. Call `passoff_create` with a terse structured markdown body.

## Commands

Call the `passoff_create` MCP tool with:

- `title`: short and action-oriented
- `content`: structured markdown with these sections in order:
  - `Current State`
  - `Decisions Made`
  - `Open Questions`
  - `Next Steps`
  - `Relevant Files`
- `from_model`: the current model id if known
- `project`: only if the project identity is clear

Be terse but specific. Include concrete file paths where useful.

## Verification

1. Confirm the tool call succeeded.
2. Verify a handoff id was returned.
3. If the call fails, report the failure plainly.

## Summary

- Report the handoff title
- Report the returned handoff id
- Report the project scope if available

## Next Steps

- Tell the user another AI can resume from the returned id.
- Suggest `/passoff:load` in Codex or the equivalent load flow in another MCP client.
