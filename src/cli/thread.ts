import { openDb } from '../db.js';
import { threadHandoff } from '../tools/thread.js';
import { formatThread } from '../lib/formatting.js';

export interface ThreadOpts {
  direction?: 'ancestors' | 'descendants' | 'both';
}

export function cliThread(id: string, opts: ThreadOpts): void {
  const db = openDb();
  try {
    const chain = threadHandoff(db, { id, direction: opts.direction });
    console.log(formatThread(chain, id));
  } catch (e: any) {
    console.error(e.message ?? String(e));
    process.exitCode = 1;
  } finally {
    db.close();
  }
}
