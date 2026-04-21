import { z } from 'zod';
import type Database from 'better-sqlite3';
import { resolveProject } from '../lib/project.js';

export const SearchInputSchema = z.object({
  query: z.string().min(1),
  project: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;

export interface SearchHit {
  id: string;
  title: string;
  snippet: string;
  created_at: number;
  from_client: string;
  status: string;
}

function escapeFts(query: string): string {
  // Wrap each token in double quotes for literal-phrase matching;
  // FTS5 treats tokens separated by whitespace as AND by default.
  return query
    .split(/\s+/)
    .filter(Boolean)
    .map(t => `"${t.replace(/"/g, '""')}"`)
    .join(' ');
}

export function searchHandoffs(db: Database.Database, input: SearchInput): SearchHit[] {
  const parsed = SearchInputSchema.parse(input);
  const project = parsed.project ?? resolveProject().slug;
  const limit = parsed.limit ?? 10;
  const match = escapeFts(parsed.query);

  const rows = db
    .prepare(
      `SELECT h.id AS id, h.title AS title,
              snippet(handoffs_fts, 2, '[', ']', '…', 12) AS snippet,
              h.created_at AS created_at, h.from_client AS from_client, h.status AS status
       FROM handoffs_fts
       JOIN handoffs h ON h.rowid = handoffs_fts.rowid
       WHERE handoffs_fts MATCH ? AND h.project = ?
       ORDER BY rank
       LIMIT ?`,
    )
    .all(match, project, limit) as SearchHit[];

  return rows;
}
