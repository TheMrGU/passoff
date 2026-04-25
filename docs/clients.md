# MCP Client Setup

Passoff speaks the standard MCP stdio transport. Any client that supports MCP servers can use it.

## Claude Code

```bash
claude mcp add passoff -- npx -y passoff serve
```

After restart, Claude Code exposes the five `passoff_*` tools. When you type `/passoff` or say "pass off to Cursor", Claude will call `passoff_create`.

**Scope:** the command above adds at user scope. Use `--scope project` to pin per-repo and write `.mcp.json`.

## Cursor

`.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "passoff": {
      "command": "npx",
      "args": ["-y", "passoff", "serve"]
    }
  }
}
```

## Codex

`~/.codex/config.toml`:

```toml
[mcp_servers.passoff]
command = "npx"
args = ["-y", "passoff", "serve"]
```

Optional Codex slash commands:

```bash
passoff install --client codex
```

This installs a local Codex plugin that exposes:

- `/passoff:create`
- `/passoff:load`
- `/passoff:list`
- `/passoff:search`

Use `--scope project` to install those Codex commands into a specific repo instead of your home directory.

## Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "passoff": {
      "command": "npx",
      "args": ["-y", "passoff", "serve"]
    }
  }
}
```

## Any other MCP client

Invoke `passoff serve` with stdio. No env vars required. Optional:

- `PASSOFF_DB_PATH` - override the default `~/.passoff/db.sqlite`.
- `PASSOFF_PROJECT_ROOT` - pin the project slug. Otherwise it is auto-resolved from the nearest `.git` root.

## Verifying the wire-up

After adding to your client:

```bash
passoff doctor
```

Prints the DB path, current project slug, row counts, and a copy of the MCP config snippet for reference.

After wiring MCP, you can also install client-native command templates:

- `passoff install --client claude`
- `passoff install --client cursor`
- `passoff install --client codex`
- `passoff install` for all supported clients

## How Passoff knows which client is calling

Every MCP session begins with an `initialize` handshake where the client declares its `clientInfo: { name, version }`. Passoff captures that and stamps it on every `passoff_create` as `from_client` / `from_client_ver`, and on every `passoff_load` as `to_client` / `to_client_ver`. You do not configure this - it is pulled from the protocol layer.

## Model self-declaration

The MCP protocol does not expose which model is running inside a client. Passoff accepts an optional `from_model` argument on `passoff_create` and the tool description asks the AI to fill it in, for example `"claude-opus-4-7"`, `"gpt-5"`, or `"gemini-pro"`.
