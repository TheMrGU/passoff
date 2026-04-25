import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { commandsRoot, resolveClients, resolveProjectDir, clientTargetDir, type CliTargetOpts } from './clients.js';
import { installCodexPlugin } from './codex.js';

function copyCommands(srcDir: string, destDir: string): string[] {
  mkdirSync(destDir, { recursive: true });
  const copied: string[] = [];
  for (const name of readdirSync(srcDir)) {
    if (!name.endsWith('.md')) continue;
    copyFileSync(join(srcDir, name), join(destDir, name));
    copied.push(name);
  }
  return copied;
}

export function cliInstall(opts: CliTargetOpts): void {
  const clients = resolveClients(opts.client);
  const scope = opts.scope ?? 'user';
  const projectDir = resolveProjectDir(opts.project);
  const root = commandsRoot();

  for (const client of clients) {
    if (client === 'codex') {
      installCodexPlugin(root, scope, projectDir);
      continue;
    }

    const src = join(root, client);
    if (!existsSync(src)) {
      console.error(`skip ${client}: no bundled templates at ${src}`);
      continue;
    }
    const dest = clientTargetDir(client, scope, projectDir);
    const copied = copyCommands(src, dest);
    console.log(`${client} (${scope}): wrote ${copied.length} -> ${dest}`);
    for (const f of copied) console.log(`  - ${f}`);
  }

  console.log('\nDone. Restart your client to pick up the new commands.');
}
