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

  const entry = join(__dirname, '..', 'index.js');
  const entryJson = JSON.stringify(entry);

  console.log('');
  console.log('MCP client config — copy/paste to wire any AI to this install:');
  console.log('');
  console.log('  Claude Code (one-shot):');
  console.log(`    claude mcp add passoff -- node ${entry} serve`);
  console.log('');
  console.log('  Cursor  (.cursor/mcp.json  or  ~/.cursor/mcp.json):');
  console.log('    {');
  console.log('      "mcpServers": {');
  console.log('        "passoff": {');
  console.log('          "command": "node",');
  console.log(`          "args": [${entryJson}, "serve"]`);
  console.log('        }');
  console.log('      }');
  console.log('    }');
  console.log('');
  console.log('  Codex  (~/.codex/config.toml):');
  console.log('    [mcp_servers.passoff]');
  console.log('    command = "node"');
  console.log(`    args = [${entryJson}, "serve"]`);
  console.log('    # optional Codex slash commands: passoff install --client codex');
  console.log('');
  console.log('  Windsurf / any other MCP client:  same command/args pair as above.');
  console.log('');
  console.log('After wiring a client, restart it, then run:  passoff install');
  console.log('to install Claude/Cursor command files and Codex /passoff:create, /passoff:load, /passoff:list, /passoff:search plugin commands.');
}
