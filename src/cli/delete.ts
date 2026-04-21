import { openDb } from '../db.js';
import { createInterface } from 'node:readline/promises';

export interface DeleteOpts {
  yes?: boolean;
}

export async function cliDelete(id: string, opts: DeleteOpts): Promise<void> {
  const db = openDb();
  try {
    const row = db.prepare('SELECT id, title FROM handoffs WHERE id = ?').get(id) as
      | { id: string; title: string }
      | undefined;
    if (!row) {
      console.error(`Handoff not found: ${id}`);
      process.exitCode = 1;
      return;
    }
    if (!opts.yes) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const ans = await rl.question(
        `Delete ${row.id} "${row.title}" — this is irreversible. Type 'yes' to confirm: `,
      );
      rl.close();
      if (ans.trim().toLowerCase() !== 'yes') {
        console.log('Aborted.');
        return;
      }
    }
    db.prepare('DELETE FROM handoffs WHERE id = ?').run(id);
    console.log(`Deleted ${id}`);
  } finally {
    db.close();
  }
}
