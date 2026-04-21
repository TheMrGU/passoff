import { z } from 'zod';
import type Database from 'better-sqlite3';
import { newHandoffId } from '../lib/ids.js';
import { resolveProject } from '../lib/project.js';
import type { ClientInfo } from '../lib/client-info.js';

export const CreateInputSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  parent_id: z.string().optional(),
  project: z.string().optional(),
  from_model: z.string().optional(),
});

export type CreateInput = z.infer<typeof CreateInputSchema>;

export interface CreateResult {
  id: string;
  created_at: number;
  project: string;
}

export function createHandoff(
  db: Database.Database,
  input: CreateInput,
  client: ClientInfo,
): CreateResult {
  const parsed = CreateInputSchema.parse(input);
  const project = parsed.project ?? resolveProject().slug;
  const id = newHandoffId();
  const created_at = Date.now();

  if (parsed.parent_id) {
    const parent = db
      .prepare('SELECT id FROM handoffs WHERE id = ?')
      .get(parsed.parent_id);
    if (!parent) {
      throw new Error(`parent_id not found: ${parsed.parent_id}`);
    }
  }

  db.prepare(
    `INSERT INTO handoffs (
      id, project, title, content, tags,
      from_client, from_client_ver, from_model,
      parent_id, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
  ).run(
    id,
    project,
    parsed.title,
    parsed.content,
    parsed.tags ? JSON.stringify(parsed.tags) : null,
    client.name,
    client.version ?? null,
    parsed.from_model ?? null,
    parsed.parent_id ?? null,
    created_at,
  );

  return { id, created_at, project };
}
