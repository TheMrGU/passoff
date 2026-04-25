import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

export type Client = 'claude' | 'cursor' | 'codex';
export type Scope = 'user' | 'project';

export interface CliTargetOpts {
  client?: string;
  scope?: Scope;
  project?: string;
}

export function commandsRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, '../../commands'),
    resolve(here, '../commands'),
    resolve(here, '../../../commands'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error(`Could not locate bundled commands/ directory near ${here}`);
}

export function resolveClients(client?: string): Client[] {
  if (!client || client === 'all') return ['claude', 'cursor', 'codex'];
  return [client as Client];
}

export function resolveProjectDir(project?: string): string {
  return project ? resolve(project) : process.cwd();
}

export function clientTargetDir(client: Exclude<Client, 'codex'>, scope: Scope, projectDir: string): string {
  if (client === 'claude') {
    return scope === 'user'
      ? join(homedir(), '.claude', 'commands')
      : join(projectDir, '.claude', 'commands');
  }
  return scope === 'user'
    ? join(homedir(), '.cursor', 'commands')
    : join(projectDir, '.cursor', 'commands');
}

export function codexMarketplacePath(scope: Scope, projectDir: string): string {
  return scope === 'user'
    ? join(homedir(), '.agents', 'plugins', 'marketplace.json')
    : join(projectDir, '.agents', 'plugins', 'marketplace.json');
}

export function codexPluginDir(scope: Scope, projectDir: string): string {
  return scope === 'user'
    ? join(homedir(), 'plugins', 'passoff')
    : join(projectDir, 'plugins', 'passoff');
}
