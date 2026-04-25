# Security policy

## Supported versions

Passoff is currently **alpha** (`0.x`). Only the latest published version is supported.

## Reporting a vulnerability

If you find a security issue, please **do not** open a public GitHub issue. Instead, email the maintainer directly:

**gavingoodyear852@gmail.com**

Please include:

- A description of the issue
- Steps to reproduce
- The version of Passoff you tested against (`passoff doctor` prints it)
- Any relevant logs or proof-of-concept

You should get an acknowledgement within a few days. Coordinated disclosure is appreciated — give me a reasonable window to ship a fix before publishing details.

## Threat model in brief

Passoff runs entirely on the user's machine:

- The MCP server speaks stdio only — no network listener.
- The SQLite database lives at `~/.passoff/db.sqlite` (user-readable by default).
- The CLI does not phone home.
- The installer writes only to user-scoped config files (`~/.cursor/mcp.json`, `~/.codex/config.toml`, etc.).

The handoff body is whatever the AI wrote — treat it like any other piece of model output. Don't paste credentials into a handoff and expect them to be encrypted; they aren't.
