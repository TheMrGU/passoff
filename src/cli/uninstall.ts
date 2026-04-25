import { join } from 'node:path';
import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import { clientTargetDir, resolveClients, resolveProjectDir, type CliTargetOpts } from './clients.js';
import { uninstallCodexPlugin } from './codex.js';

const PASSOFF_FILES = ['passoff.md', 'passoff-load.md'];

export function cliUninstall(opts: CliTargetOpts): void {
  const clients = resolveClients(opts.client);
  const scope = opts.scope ?? 'user';
  const projectDir = resolveProjectDir(opts.project);

  for (const client of clients) {
    if (client === 'codex') {
      uninstallCodexPlugin(scope, projectDir);
      continue;
    }

    const dir = clientTargetDir(client, scope, projectDir);
    if (!existsSync(dir)) {
      console.log(`${client} (${scope}): nothing to remove at ${dir}`);
      continue;
    }
    const present = readdirSync(dir);
    let removed = 0;
    for (const name of PASSOFF_FILES) {
      if (present.includes(name)) {
        unlinkSync(join(dir, name));
        removed++;
        console.log(`  - removed ${name}`);
      }
    }
    console.log(`${client} (${scope}): removed ${removed} from ${dir}`);
  }
}
