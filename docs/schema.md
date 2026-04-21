# Database Schema

Passoff stores everything in a single SQLite file at `~/.passoff/db.sqlite` (override with `PASSOFF_DB_PATH`). The schema is applied idempotently at every `openDb()` call, so the file self-migrates.

## `handoffs`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | `ph_` + 8-char nanoid (e.g. `ph_Mo12sReh`) |
| `project` | TEXT NOT NULL | Project slug (e.g. `my-app-083a4c`) |
| `title` | TEXT NOT NULL | ≤ 120 chars, human-readable summary |
| `content` | TEXT NOT NULL | Full markdown body |
| `tags` | TEXT | JSON array of strings, nullable |
| `from_client` | TEXT NOT NULL | MCP `clientInfo.name` of creator (e.g. `claude-code`) |
| `from_client_ver` | TEXT | MCP `clientInfo.version` of creator |
| `from_model` | TEXT | Self-declared model id (e.g. `claude-opus-4-7`) |
| `to_client` | TEXT | Null until loaded |
| `to_client_ver` | TEXT | Null until loaded |
| `to_model` | TEXT | Reserved — not currently stamped |
| `parent_id` | TEXT | FK → `handoffs.id`, for lineage |
| `created_at` | INTEGER NOT NULL | Unix ms |
| `loaded_at` | INTEGER | Unix ms, null until loaded |
| `status` | TEXT NOT NULL | `'open'` \| `'loaded'` \| `'archived'` |

### Indexes

- `idx_handoffs_project (project, created_at DESC)` — powers `list` and `load latest`.
- `idx_handoffs_status (status)` — powers status filters.
- `idx_handoffs_parent (parent_id)` — powers `thread` descendant traversal.

## `handoffs_fts`

FTS5 virtual table mirroring `title`, `content`, `tags`. Kept in sync via three triggers (`handoffs_ai`, `handoffs_ad`, `handoffs_au`) on INSERT / DELETE / UPDATE.

### Query shape (see `src/tools/search.ts`)

```sql
SELECT h.id, h.title,
       snippet(handoffs_fts, 2, '[', ']', '…', 12) AS snippet,
       h.created_at, h.from_client, h.status
FROM handoffs_fts
JOIN handoffs h ON h.rowid = handoffs_fts.rowid
WHERE handoffs_fts MATCH ? AND h.project = ?
ORDER BY rank
LIMIT ?;
```

Query tokens are quoted individually (`"token1" "token2"`) so multi-word searches behave as implicit AND across the title/content/tags columns.

## Status lifecycle

```
  passoff_create           passoff_load           passoff archive
(nothing) ────────▶ open ───────────────▶ loaded ────────────▶ archived
                         \___________________________________▶ archived
                              (passoff clear / archive)
```

`delete` bypasses the lifecycle and hard-removes the row (and the FTS mirror via the delete trigger).

## Ordering invariant

All list / latest queries use `ORDER BY created_at DESC, rowid DESC` so two rows inserted within the same millisecond still have a deterministic order (newer insert wins).

## Inspecting the DB directly

```bash
sqlite3 ~/.passoff/db.sqlite
sqlite> .mode column
sqlite> .headers on
sqlite> SELECT id, project, status, from_client, to_client, title FROM handoffs;
```
