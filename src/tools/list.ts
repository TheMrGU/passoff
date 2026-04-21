import { z } from 'zod';
import type Database from 'better-sqlite3';
import { resolveProject } from '../lib/project.js';
import type { HandoffStatus } from '../types.js';

export const ListInputSchema = z.object({
  project: z.string().optional(),
  status: z.enum(['open', 'loaded', 'archived', 'all']).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export type ListInput = z.infer<typeof ListInputSchema>;

export interface ListItem {
  id: string;
  title: string;
  tags: string[];
  from_client: string;
  from_model: string | null;
  to_client: string | null;
  created_at: number;
  status: HandoffStatus;
}

export function listHandoffs(db: Database.Database, input: ListInput): ListItem[] {
  const parsed = ListInputSchema.parse(input);
  const project = parsed.project ?? resolveProject().slug;
  const status = parsed.status ?? 'all';
  const limit = parsed.limit ?? 10;

  const rows =
    status === 'all'
      ? (db
          .prepare(
            `SELECT id, title, tags, from_client, from_model, to_client, created_at, status
             FROM handoffs WHERE project = ?
             ORDER BY created_at DESC, rowid DESC LIMIT ?`,
          )
          .all(project, limit) as any[])
      : (db
          .prepare(
            `SELECT id, title, tags, from_client, from_model, to_client, created_at, status
             FROM handoffs WHERE project = ? AND status = ?
             ORDER BY created_at DESC, rowid DESC LIMIT ?`,
          )
          .all(project, status, limit) as any[]);

  return rows.map(r => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
  }));
}
