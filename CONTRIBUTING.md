# Contributing to passoff

Thanks for opening Passoff. Pull requests, bug reports, and design discussions are welcome.

## Getting set up

```bash
git clone https://github.com/TheMrGU/passoff
cd passoff
npm install
npm run build
npm test
```

The test suite uses Vitest and runs against an in-memory SQLite (no `~/.passoff/db.sqlite` writes). All 40+ tests should pass on a clean checkout.

## Project layout

```
src/
  index.ts          # CLI entrypoint (commander)
  server.ts         # MCP server — registers all 5 tools
  db.ts             # SQLite open + migrations
  schema.ts         # CREATE TABLE / CREATE TRIGGER statements
  types.ts          # row → handoff conversions
  lib/              # project resolution, ids, client info
  tools/            # MCP tool implementations (create, load, list, search, thread)
  cli/              # operator subcommands (list, show, thread, archive, …)
commands/           # slash-command templates per client (claude/, cursor/, codex/)
docs/               # design.md, clients.md, schema.md
test/               # vitest suite + integration tests
scripts/setup.mjs   # one-shot installer (used by `npm run setup`)
```

## Running the MCP server locally

```bash
node dist/index.js serve
```

It speaks stdio. Wire it into your AI client per [docs/clients.md](docs/clients.md), then call the tools from inside the client.

## What's in scope

- Bug fixes in the MCP tools, CLI, or installer
- New client integrations (any MCP-over-stdio client)
- Sharper slash-command templates
- Better diagnostics in `passoff doctor`
- Schema additions that self-migrate

## What's out of scope

Passoff intentionally does **one thing**: discrete, deliberate handoffs. The following are explicitly out of scope and PRs adding them will be closed:

- A general-purpose memory layer (embeddings, ambient recall)
- Multi-agent orchestration / task routing
- A web dashboard or hosted service
- Cloud sync (single-user, single-machine in v1)

If you want those, build them on top — Passoff is a primitive, not a platform. See [docs/design.md](docs/design.md) for the positioning.

## PR checklist

- [ ] `npm test` passes
- [ ] `npm run build` is clean (no TS errors)
- [ ] New behavior has a test
- [ ] User-visible changes are reflected in the README or `docs/`
- [ ] No new runtime dependencies unless strictly necessary

## Reporting bugs

Open an issue with:
- What you ran (full command or slash command)
- Which AI client (Claude Code, Cursor, Codex, Windsurf, other)
- Output of `passoff doctor`
- Expected vs actual behavior

## Releases

This project is **alpha**. APIs and the SQLite schema may shift before 1.0. The schema self-migrates additively, but breaking changes will be called out in the release notes when they happen.
