import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveProject } from '../src/lib/project.ts';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('resolveProject', () => {
  const saved = process.env.PASSOFF_PROJECT_ROOT;
  afterEach(() => {
    if (saved === undefined) delete process.env.PASSOFF_PROJECT_ROOT;
    else process.env.PASSOFF_PROJECT_ROOT = saved;
  });

  it('honors PASSOFF_PROJECT_ROOT', () => {
    process.env.PASSOFF_PROJECT_ROOT = '/tmp/some-proj';
    const p = resolveProject();
    expect(p.slug).toMatch(/^some-proj-[0-9a-f]{6}$/);
  });

  it('finds nearest .git upward', () => {
    delete process.env.PASSOFF_PROJECT_ROOT;
    const base = mkdtempSync(join(tmpdir(), 'passoff-'));
    mkdirSync(join(base, '.git'));
    const child = join(base, 'pkg', 'src');
    mkdirSync(child, { recursive: true });
    const p = resolveProject(undefined, child);
    expect(p.root).toBe(base);
    rmSync(base, { recursive: true, force: true });
  });

  it('produces stable slug for same path', () => {
    const a = resolveProject('x', '/irrelevant');
    const b = resolveProject('x', '/irrelevant');
    expect(a.slug).toBe(b.slug);
  });

  it('override bypasses env + git', () => {
    process.env.PASSOFF_PROJECT_ROOT = '/anything';
    const p = resolveProject('custom');
    expect(p.slug).toBe('custom');
    expect(p.root).toBe('custom');
  });
});
