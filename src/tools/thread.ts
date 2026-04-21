import { z } from 'zod';
import type Database from 'better-sqlite3';
import { rowToHandoff, type Handoff, type HandoffRow } from '../types.js';

export const ThreadInputSchema = z.object({
  id: z.string(),
  direction: z.enum(['ancestors', 'descendants', 'both']).optional(),
});

export type ThreadInput = z.infer<typeof ThreadInputSchema>;

export function threadHandoff(db: Database.Database, input: ThreadInput): Handoff[] {
  const parsed = ThreadInputSchema.parse(input);
  const direction = parsed.direction ?? 'both';

  const anchor = db
    .prepare('SELECT * FROM handoffs WHERE id = ?')
    .get(parsed.id) as HandoffRow | undefined;
  if (!anchor) throw new Error(`Handoff not found: ${parsed.id}`);

  const ancestors: HandoffRow[] = [];
  if (direction !== 'descendants') {
    let cur: HandoffRow | undefined = anchor;
    const seen = new Set<string>();
    while (cur && cur.parent_id && !seen.has(cur.parent_id)) {
      seen.add(cur.parent_id);
      const parent = db
        .prepare('SELECT * FROM handoffs WHERE id = ?')
        .get(cur.parent_id) as HandoffRow | undefined;
      if (!parent) break;
      ancestors.unshift(parent);
      cur = parent;
    }
  }

  const descendants: HandoffRow[] = [];
  if (direction !== 'ancestors') {
    const queue: string[] = [anchor.id];
    const seen = new Set<string>([anchor.id]);
    while (queue.length) {
      const parentId = queue.shift()!;
      const children = db
        .prepare('SELECT * FROM handoffs WHERE parent_id = ? ORDER BY created_at ASC')
        .all(parentId) as HandoffRow[];
      for (const c of children) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        descendants.push(c);
        queue.push(c.id);
      }
    }
  }

  return [...ancestors, anchor, ...descendants].map(rowToHandoff);
}
