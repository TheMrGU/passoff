import { z } from 'zod';
import type Database from 'better-sqlite3';
import { rowToHandoff, type Handoff, type HandoffRow } from '../types.js';
import type { ClientInfo } from '../lib/client-info.js';

export const LoadInputSchema = z.object({
  id: z.string().optional(),
  latest: z.boolean().optional(),
  project: z.string().optional(),
});

export type LoadInput = z.infer<typeof LoadInputSchema>;

export function loadHandoff(
  db: Database.Database,
  input: LoadInput,
  client: ClientInfo,
): Handoff {
  const parsed = LoadInputSchema.parse(input);

  let row: HandoffRow | undefined;

  if (parsed.id) {
    row = db.prepare('SELECT * FROM handoffs WHERE id = ?').get(parsed.id) as HandoffRow | undefined;
    if (!row) throw new Error(`Handoff not found: ${parsed.id}`);
  } else if (parsed.latest) {
    // `latest` returns the most recent non-archived handoff. Including already-
    // loaded handoffs means the same handoff can be re-loaded across sessions
    // until the user archives it — archiving is the explicit "done with this"
    // signal.
    const scopeToProject = parsed.project && parsed.project !== '*';
    if (scopeToProject) {
      row = db
        .prepare(
          `SELECT * FROM handoffs WHERE project = ? AND status IN ('open','loaded')
           ORDER BY created_at DESC, rowid DESC LIMIT 1`,
        )
        .get(parsed.project) as HandoffRow | undefined;
      if (!row) {
        throw new Error(
          `No active handoffs for project '${parsed.project}'. Try passoff_list to see archived handoffs, or create one with passoff_create.`,
        );
      }
    } else {
      row = db
        .prepare(
          `SELECT * FROM handoffs WHERE status IN ('open','loaded')
           ORDER BY created_at DESC, rowid DESC LIMIT 1`,
        )
        .get() as HandoffRow | undefined;
      if (!row) {
        throw new Error(
          `No active handoffs found. Create one with passoff_create, or check passoff_list for archived handoffs.`,
        );
      }
    }
  } else {
    throw new Error('Must provide either `id` or `latest: true`.');
  }

  const loaded_at = Date.now();
  db.prepare(
    `UPDATE handoffs
     SET status = 'loaded', loaded_at = ?, to_client = ?, to_client_ver = ?
     WHERE id = ?`,
  ).run(loaded_at, client.name, client.version ?? null, row.id);

  const fresh = db.prepare('SELECT * FROM handoffs WHERE id = ?').get(row.id) as HandoffRow;
  return rowToHandoff(fresh);
}
