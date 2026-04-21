import { existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

export interface ProjectInfo {
  slug: string;
  root: string;
}

function findGitRoot(start: string): string | null {
  let dir = resolve(start);
  while (true) {
    if (existsSync(resolve(dir, '.git'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function resolveProject(override?: string, cwd: string = process.cwd()): ProjectInfo {
  if (override) {
    return { slug: override, root: override };
  }
  const envRoot = process.env.PASSOFF_PROJECT_ROOT;
  const root = envRoot ? resolve(envRoot) : (findGitRoot(cwd) ?? resolve(cwd));
  const name = basename(root) || 'root';
  const hash = createHash('sha1').update(root).digest('hex').slice(0, 6);
  return { slug: `${name}-${hash}`, root };
}
