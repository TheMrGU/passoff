import { z } from 'zod';
import type Database from 'better-sqlite3';
import { resolveProject } from '../lib/project.js';
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
  const project = parsed.project ?? resolveProject().slug;

  let row: HandoffRow | undefined;

  if (parsed.id) {
    row = db.prepare('SELECT * FROM handoffs WHERE id = ?').get(parsed.id) as HandoffRow | undefined;
    if (!row) throw new Error(`Handoff not found: ${parsed.id}`);
  } else if (parsed.latest) {
    row = db
      .prepare(
        `SELECT * FROM handoffs WHERE project = ? AND status = 'open'
         ORDER BY created_at DESC, rowid DESC LIMIT 1`,
      )
      .get(project) as HandoffRow | undefined;
    if (!row) {
      throw new Error(
        `No open handoffs for project '${project}'. Try passoff_list to see loaded/archived handoffs, or create one with passoff_create.`,
      );
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
