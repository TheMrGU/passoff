import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { removeMarketplaceEntryForTest, upsertMarketplaceForTest } from '../src/cli/codex.ts';

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe('codex marketplace helpers', () => {
  it('creates a marketplace file with a passoff entry', () => {
    const dir = mkdtempSync(join(tmpdir(), 'passoff-codex-'));
    tempDirs.push(dir);
    const path = join(dir, 'marketplace.json');

    upsertMarketplaceForTest(path);

    const data = JSON.parse(readFileSync(path, 'utf-8'));
    expect(data.name).toBe('passoff-local');
    expect(data.plugins).toHaveLength(1);
    expect(data.plugins[0].name).toBe('passoff');
    expect(data.plugins[0].source.path).toBe('./plugins/passoff');
    expect(data.plugins[0].policy.installation).toBe('INSTALLED_BY_DEFAULT');
  });

  it('replaces an existing passoff entry without duplicating it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'passoff-codex-'));
    tempDirs.push(dir);
    const path = join(dir, 'marketplace.json');

    upsertMarketplaceForTest(path);
    upsertMarketplaceForTest(path);

    const data = JSON.parse(readFileSync(path, 'utf-8'));
    expect(data.plugins.filter((p: any) => p.name === 'passoff')).toHaveLength(1);
  });

  it('removes only the targeted marketplace entry', () => {
    const dir = mkdtempSync(join(tmpdir(), 'passoff-codex-'));
    tempDirs.push(dir);
    const path = join(dir, 'marketplace.json');

    upsertMarketplaceForTest(path);
    upsertMarketplaceForTest(path, 'other-plugin');
    removeMarketplaceEntryForTest(path);

    const data = JSON.parse(readFileSync(path, 'utf-8'));
    expect(data.plugins.find((p: any) => p.name === 'passoff')).toBeUndefined();
    expect(data.plugins.find((p: any) => p.name === 'other-plugin')).toBeTruthy();
  });
});
