import { openDb } from '../db.js';

export function cliArchive(id: string): void {
  const db = openDb();
  try {
    const r = db.prepare("UPDATE handoffs SET status = 'archived' WHERE id = ?").run(id);
    if (r.changes === 0) {
      console.error(`Handoff not found: ${id}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Archived ${id}`);
  } finally {
    db.close();
  }
}
