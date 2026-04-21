import { openDb } from '../db.js';
import { listHandoffs } from '../tools/list.js';
import { formatList } from '../lib/formatting.js';
import { resolveProject } from '../lib/project.js';

export interface ListOpts {
  project?: string;
  status?: 'open' | 'loaded' | 'archived' | 'all';
  limit?: string;
}

export function cliList(opts: ListOpts): void {
  const db = openDb();
  try {
    const project = opts.project ?? resolveProject().slug;
    const items = listHandoffs(db, {
      project,
      status: opts.status,
      limit: opts.limit ? parseInt(opts.limit, 10) : undefined,
    });
    console.log(`Project: ${project}`);
    console.log(formatList(items));
  } finally {
    db.close();
  }
}
