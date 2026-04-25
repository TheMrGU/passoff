Create a Passoff handoff capturing the current state of this conversation so another AI agent can pick up cleanly.

Call the `passoff_create` MCP tool with:

- **title**: one-line summary, ≤120 chars
- **content**: structured markdown with **Goal**, **Current state**, **Next steps**, **Gotchas**, **Files touched**
- **tags**: 2–5 short tags
- **from_model**: the model id you are running as

After it returns, print the handoff id.
