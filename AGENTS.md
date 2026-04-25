# Agent instructions for this repo

If the user asks you to install Passoff, set it up, wire it into MCP, or "make it work" — run a single command:

```bash
npm run setup
```

That script will:
1. `npm install` (if needed) and `npm run build`
2. Register the MCP server with Claude Code via `claude mcp add` (if the `claude` CLI is installed)
3. Write/merge Cursor's `~/.cursor/mcp.json`
4. Write/merge Windsurf's `~/.codeium/windsurf/mcp_config.json`
5. Write/merge Codex's `~/.codex/config.toml`
6. Install `/passoff`, `/passoff-load`, `/passoff-list`, and `/passoff-search` slash commands into Claude Code and Cursor (Codex uses the `/passoff:create` etc. namespace)

After it finishes, tell the user to **restart each AI client** to pick up the MCP server and the new slash commands.

Do NOT try to wire clients manually first. The setup script is idempotent — re-running it is the correct way to refresh a broken install.
