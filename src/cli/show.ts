import { openDb } from '../db.js';
import { formatHandoff } from '../lib/formatting.js';
import { rowToHandoff, type HandoffRow } from '../types.js';

export function cliShow(id: string): void {
  const db = openDb();
  try {
    const row = db.prepare('SELECT * FROM handoffs WHERE id = ?').get(id) as
      | HandoffRow
      | undefined;
    if (!row) {
      console.error(`Handoff not found: ${id}`);
      process.exitCode = 1;
      return;
    }
    console.log(formatHandoff(rowToHandoff(row)));
  } finally {
    db.close();
  }
}
