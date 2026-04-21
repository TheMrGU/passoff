import { openDb } from '../db.js';
import { resolveProject } from '../lib/project.js';
import { createInterface } from 'node:readline/promises';

export interface ClearOpts {
  project?: string;
  yes?: boolean;
}

export async function cliClear(opts: ClearOpts): Promise<void> {
  const db = openDb();
  try {
    const project = opts.project ?? resolveProject().slug;
    const openCount = (
      db
        .prepare("SELECT COUNT(*) AS n FROM handoffs WHERE project = ? AND status = 'open'")
        .get(project) as { n: number }
    ).n;
    if (openCount === 0) {
      console.log(`No open handoffs in project '${project}'.`);
      return;
    }
    if (!opts.yes) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const ans = await rl.question(
        `Archive ${openCount} open handoff(s) in project '${project}'? Type 'yes' to confirm: `,
      );
      rl.close();
      if (ans.trim().toLowerCase() !== 'yes') {
        console.log('Aborted.');
        return;
      }
    }
    const r = db
      .prepare("UPDATE handoffs SET status = 'archived' WHERE project = ? AND status = 'open'")
      .run(project);
    console.log(`Archived ${r.changes} handoff(s) in project '${project}'.`);
  } finally {
    db.close();
  }
}
