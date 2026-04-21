import { openDb, resolveDbPath } from '../db.js';
import { resolveProject } from '../lib/project.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

export function cliDoctor(): void {
  const version = readVersion();
  const dbPath = resolveDbPath();
  const project = resolveProject();

  console.log(`passoff v${version}`);
  console.log('');
  console.log(`DB path:       ${dbPath}`);
  console.log(`Project slug:  ${project.slug}`);
  console.log(`Project root:  ${project.root}`);
  console.log('');

  const db = openDb();
  try {
    const totals = db.prepare('SELECT status, COUNT(*) AS n FROM handoffs GROUP BY status').all() as any[];
    const total = (db.prepare('SELECT COUNT(*) AS n FROM handoffs').get() as any).n;
    console.log(`Rows: ${total} total`);
    for (const t of totals) console.log(`  ${t.status}: ${t.n}`);
  } finally {
    db.close();
  }

  console.log('');
  console.log('MCP client config hints:');
  console.log('  Claude Code:  claude mcp add passoff -- npx -y passoff serve');
  console.log('  Cursor (.cursor/mcp.json):');
  console.log('    { "mcpServers": { "passoff": { "command": "npx", "args": ["-y", "passoff", "serve"] } } }');
}
