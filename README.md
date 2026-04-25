# passoff

> Pass the baton between AI coding agents — without losing the thread.

[![CI](https://github.com/TheMrGu/passoff/actions/workflows/ci.yml/badge.svg)](https://github.com/TheMrGu/passoff/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#status)

Memory tools store everything. **Passoff marks the moments that matter.** One command to hand off context between Claude Code, Cursor, Codex, Windsurf, and any MCP client — with full provenance of which AI sent what to whom.

<!--
SCREENSHOT: drop a hero gif or screenshot at docs/screenshots/hero.png and uncomment.
![passoff in action](docs/screenshots/hero.png)
-->

## Why

- **Local-first.** SQLite at `~/.passoff/db.sqlite`. No cloud, no accounts, no API keys, no telemetry.
- **Provenance built in.** Every handoff records `from_client`, `from_model`, `to_client`, timestamps. The MCP protocol stamps the client name — the AI can't lie about which tool wrote it.
- **Lineage built in.** Handoffs reference parents, forming a traceable chain across multiple AIs and sessions.
- **One job.** Handoffs. Not memory, not orchestration, not a dashboard.

## 30-second demo

In Claude Code, finishing a feature:

> **You:** `/passoff — switching to Cursor for the UI work`
>
> Claude writes a structured markdown handoff, returns `{ id: "ph_aB3x9K" }`.

Open Cursor, start a new chat:

> **You:** `/passoff-load`
>
> Cursor calls `passoff_load({ latest: true })`, gets the markdown, and resumes mid-thought.

Trace the chain later:

```text
$ passoff thread ph_GuqtDKDO
o ph_Mo12sReh  Refactor auth middleware
|  claude-code -> cursor  [loaded]
|
* ph_GuqtDKDO  Wired auth into login
|  cursor -> codex  [loaded]
|
o ph_T0s2ZQvD  Fixed login tests
   codex  [open]
```

<!--
SCREENSHOT: docs/screenshots/thread.png — terminal showing `passoff thread <id>` output.
SCREENSHOT: docs/screenshots/load.png — AI client reading a loaded handoff.
-->

## Install

```bash
npm i -g passoff
```

Requires **Node 20+**.

Or run from source:

```bash
git clone https://github.com/TheMrGu/passoff && cd passoff
npm install && npm run build
node dist/index.js --help
```

## One-shot setup

If the repo is checked out locally, this wires Passoff into every supported client in one step:

```bash
npm run setup
```

It runs `npm install` + `npm run build`, registers the MCP server with Claude Code (via `claude mcp add` if installed), writes/merges `~/.cursor/mcp.json`, `~/.codeium/windsurf/mcp_config.json`, `~/.codex/config.toml`, and installs the slash-command templates. **Restart each AI client afterward.**

## Wire it into your MCP client manually

### Claude Code

```bash
claude mcp add passoff -- npx -y passoff serve
```

### Cursor — `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project)

```json
{
  "mcpServers": {
    "passoff": { "command": "npx", "args": ["-y", "passoff", "serve"] }
  }
}
```

### Codex — `~/.codex/config.toml`

```toml
[mcp_servers.passoff]
command = "npx"
args = ["-y", "passoff", "serve"]
```

Install Codex-native slash commands:

```bash
passoff install --client codex
```

This registers `/passoff:create`, `/passoff:load`, `/passoff:list`, and `/passoff:search` as a local Codex plugin.

### Windsurf, others

Same stdio command pair — see [docs/clients.md](docs/clients.md).

## Slash commands

After `passoff install`, every supported client gets the same four commands (Codex uses `/passoff:create` etc.; Claude Code and Cursor use `/passoff`, `/passoff-load`, `/passoff-list`, `/passoff-search`).

| Command | What it does |
|---|---|
| `/passoff` (create) | Outgoing AI writes a structured handoff and returns its id |
| `/passoff-load` | Incoming AI loads the most recent active handoff (or one by id) |
| `/passoff-list` | Browse recent handoffs in the current project |
| `/passoff-search` | Full-text search across handoffs |

## MCP tools

| Tool | Purpose |
|---|---|
| `passoff_create` | Outgoing AI writes a structured handoff |
| `passoff_load`   | Incoming AI loads by `id` or `latest: true` |
| `passoff_list`   | Browse handoffs in a project (metadata only) |
| `passoff_search` | Full-text search across handoffs (FTS5) |
| `passoff_thread` | Show the lineage chain of a handoff |

## Operator CLI

```text
passoff serve                   # run MCP server (stdio) — invoked by clients
passoff list [--project X]      # recent handoffs table
passoff show <id>               # full markdown + metadata
passoff thread <id>             # lineage tree
passoff archive <id>            # mark archived
passoff delete <id>             # hard delete (confirms)
passoff clear [--project X]     # archive all open in a project (confirms)
passoff doctor                  # DB path, version, row counts, MCP config hints
passoff install                 # install Claude/Cursor/Codex command templates
passoff uninstall               # remove installed command templates
```

## Storage & scoping

- **DB location:** `~/.passoff/db.sqlite` (override with `PASSOFF_DB_PATH`).
- **Project scoping:** derived from `PASSOFF_PROJECT_ROOT`, else the nearest `.git` directory, else `cwd`. Slug is `<dir>-<6char hash>` so two `api/` directories never collide.
- **No telemetry.** No network calls. Open the DB in any SQLite browser.

## Passoff vs shared-memory tools

Both have a place. They solve different problems.

|  | Passoff | Shared memory tool |
|---|---|---|
| **Primitive** | Discrete, deliberate handoff event | Always-on memory pool |
| **Trigger** | You type `/passoff` | Implicit, every prompt |
| **What the next AI sees** | Exactly what the previous AI chose to pass | Whatever retrieval surfaced |
| **Provenance** | Built into the row (client, model, parent) | Bolt-on metadata |
| **Cleanup** | Archive or delete a handoff atom | Chase down embeddings |
| **Best for** | Switching tools mid-thought; tracing decisions | Recalling "what did we do six weeks ago" |

> Memory tools answer *"what might be relevant?"*. Passoff answers *"here is exactly what to load next."*

Full positioning: [docs/design.md](docs/design.md).

## FAQ

**Where does my data live?**
A single SQLite file at `~/.passoff/db.sqlite`. Open it with any SQLite browser. There is no cloud component.

**Does Passoff send anything over the network?**
No. The MCP server is stdio-only. The CLI does not phone home. The setup script writes local config files only.

**Can two projects share the same DB?**
Yes — every handoff is scoped to a project slug. The DB is global; the views are per-project by default.

**Can two AIs collide on the same handoff?**
No. Loading flips status `open → loaded` and stamps `to_client`, but the row is re-loadable across sessions until you archive it.

**Can I use it with [some other MCP client]?**
If the client speaks MCP over stdio, yes — wire it the same way. See [docs/clients.md](docs/clients.md).

**Why not just paste the conversation?**
Three reasons: (1) the receiving AI gets *exactly* what you chose to pass, not the noise; (2) the row is auditable — `from_client`, `from_model`, timestamp; (3) lineage threads across multi-step workflows.

## Status

**Alpha.** APIs and storage shape may shift before 1.0. The DB self-migrates additively, but expect occasional churn. Filing issues and PRs is welcome — see below.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). TL;DR: `npm install && npm test`, keep PRs focused, don't bundle a memory layer or an orchestrator into Passoff.

## License

MIT — see [LICENSE](LICENSE).
