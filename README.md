# passoff

> Context Passoff — structured handoffs between AI coding agents via MCP

Memory tools store everything. **Passoff marks the moments that matter** — one command to pass the baton between Claude Code, Cursor, Codex, and any MCP client, with full provenance of which AI sent what to whom.

- **Local-first.** SQLite at `~/.passoff/db.sqlite`. No cloud, no accounts, no API keys.
- **Provenance built in.** Every handoff records `from_client`, `from_model`, `to_client`, timestamps.
- **Lineage built in.** Handoffs can reference a parent, forming a traceable chain across multiple AIs.
- **One job.** Handoffs. Not memory, not orchestration, not a dashboard.

## Install

```bash
npm i -g passoff
```

Requires Node 20+.

## Wire it into your MCP client

### Claude Code
```bash
claude mcp add passoff -- npx -y passoff serve
```

### Cursor — `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "passoff": { "command": "npx", "args": ["-y", "passoff", "serve"] }
  }
}
```

### Codex, Windsurf, others
Same stdio pattern — see [docs/clients.md](docs/clients.md).

## The workflow

**In Claude Code, finishing a session:**

> You: `/passoff — I'm switching to Cursor`
>
> Claude calls `passoff_create` with a structured markdown body (current state, decisions, open questions, next steps). Returns `{ id: "ph_aB3x9K" }`.

**In Cursor, starting a session:**

> You: `pick up the latest passoff`
>
> Cursor calls `passoff_load({ latest: true })`. Receives the markdown and resumes mid-thought.

**Inspect from the terminal:**

```
$ passoff list
Project: my-app-083a4c
ID           CREATED           STATUS    FROM → TO                 TITLE
------------------------------------------------------------------------
ph_T0s2ZQvD  2026-04-21 09:03  open      codex → —                 Fixed login tests
ph_GuqtDKDO  2026-04-21 09:03  loaded    cursor → codex            Wired auth into login
ph_Mo12sReh  2026-04-21 09:03  loaded    claude-code → cursor      Refactor auth middleware

$ passoff thread ph_GuqtDKDO
┌─○ ph_Mo12sReh  Refactor auth middleware
│  claude-code → cursor  [loaded]
│
├─● ph_GuqtDKDO  Wired auth into login
│  cursor → codex  [loaded]
│
├─○ ph_T0s2ZQvD  Fixed login tests
│  codex  [open]
```

## MCP tools

| Tool | Purpose |
|---|---|
| `passoff_create` | Outgoing AI writes a structured handoff |
| `passoff_load`   | Incoming AI loads by `id` or `latest: true` |
| `passoff_list`   | Browse handoffs in a project (metadata only) |
| `passoff_search` | Full-text search across handoffs (FTS5) |
| `passoff_thread` | Show the lineage chain of a handoff |

## Operator CLI

```
passoff serve                   # run MCP server (stdio) — invoked by clients
passoff list [--project X]      # recent handoffs table
passoff show <id>               # full markdown + metadata
passoff thread <id>             # lineage tree
passoff archive <id>            # mark archived
passoff delete <id>             # hard delete (confirms)
passoff clear [--project X]     # archive all open in a project (confirms)
passoff doctor                  # DB path, version, row counts, MCP config hints
```

## Storage & scoping

- **DB location:** `~/.passoff/db.sqlite` (override with `PASSOFF_DB_PATH`).
- **Project scoping:** derived from `PASSOFF_PROJECT_ROOT`, else the nearest `.git` directory, else `cwd`. Slug is `<dir>-<6char hash>` so two `api/` directories don't collide.
- **No telemetry.** No network calls. Open `~/.passoff/db.sqlite` in any SQLite browser.

## Why handoffs, not shared memory?

See [docs/design.md](docs/design.md) for the full positioning. Short version: you don't want every AI to remember everything. You want to explicitly mark a moment as *"here's the baton"* and have the next AI pick it up cleanly, with the chain of who-decided-what preserved.

## License

MIT — see [LICENSE](LICENSE).
