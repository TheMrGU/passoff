import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Scope } from './clients.js';
import { codexMarketplacePath, codexPluginDir } from './clients.js';

interface MarketplaceEntry {
  name: string;
  source: {
    source: 'local';
    path: string;
  };
  policy: {
    installation: 'AVAILABLE' | 'INSTALLED_BY_DEFAULT' | 'NOT_AVAILABLE';
    authentication: 'ON_INSTALL' | 'ON_USE';
  };
  category: string;
}

interface MarketplaceFile {
  name: string;
  interface?: {
    displayName?: string;
  };
  plugins: MarketplaceEntry[];
}

function defaultMarketplace(): MarketplaceFile {
  return {
    name: 'passoff-local',
    interface: { displayName: 'Passoff Local' },
    plugins: [],
  };
}

function readMarketplace(path: string): MarketplaceFile {
  if (!existsSync(path)) return defaultMarketplace();
  return JSON.parse(readFileSync(path, 'utf-8')) as MarketplaceFile;
}

function writeMarketplace(path: string, data: MarketplaceFile): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function installCodexPlugin(root: string, scope: Scope, projectDir: string): void {
  const src = join(root, 'codex');
  const pluginDir = codexPluginDir(scope, projectDir);
  const marketplacePath = codexMarketplacePath(scope, projectDir);

  mkdirSync(dirname(pluginDir), { recursive: true });
  cpSync(src, pluginDir, { recursive: true, force: true });

  const marketplace = readMarketplace(marketplacePath);
  const entry: MarketplaceEntry = {
    name: 'passoff',
    source: { source: 'local', path: './plugins/passoff' },
    policy: { installation: 'INSTALLED_BY_DEFAULT', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  };

  marketplace.plugins = marketplace.plugins.filter(p => p.name !== 'passoff');
  marketplace.plugins.push(entry);
  writeMarketplace(marketplacePath, marketplace);

  console.log(`codex (${scope}): wrote plugin -> ${pluginDir}`);
  console.log(`codex (${scope}): updated marketplace -> ${marketplacePath}`);
  console.log('  - /passoff:create');
  console.log('  - /passoff:load');
  console.log('  - /passoff:list');
  console.log('  - /passoff:search');
}

export function uninstallCodexPlugin(scope: Scope, projectDir: string): void {
  const pluginDir = codexPluginDir(scope, projectDir);
  const marketplacePath = codexMarketplacePath(scope, projectDir);

  if (existsSync(pluginDir)) {
    rmSync(pluginDir, { recursive: true, force: true });
    console.log(`codex (${scope}): removed plugin from ${pluginDir}`);
  } else {
    console.log(`codex (${scope}): no plugin found at ${pluginDir}`);
  }

  if (!existsSync(marketplacePath)) {
    console.log(`codex (${scope}): no marketplace found at ${marketplacePath}`);
    return;
  }

  const marketplace = readMarketplace(marketplacePath);
  const before = marketplace.plugins.length;
  marketplace.plugins = marketplace.plugins.filter(p => p.name !== 'passoff');
  writeMarketplace(marketplacePath, marketplace);
  console.log(`codex (${scope}): removed ${before - marketplace.plugins.length} marketplace entries from ${marketplacePath}`);
}

export function upsertMarketplaceForTest(path: string, entryName = 'passoff'): void {
  const marketplace = readMarketplace(path);
  marketplace.plugins = marketplace.plugins.filter(p => p.name !== entryName);
  marketplace.plugins.push({
    name: entryName,
    source: { source: 'local', path: `./plugins/${entryName}` },
    policy: { installation: 'INSTALLED_BY_DEFAULT', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  });
  writeMarketplace(path, marketplace);
}

export function removeMarketplaceEntryForTest(path: string, entryName = 'passoff'): void {
  const marketplace = readMarketplace(path);
  marketplace.plugins = marketplace.plugins.filter(p => p.name !== entryName);
  writeMarketplace(path, marketplace);
}
