import { openDb } from '../src/db.ts';
import type { ClientInfo } from '../src/lib/client-info.ts';

export function memDb() {
  return openDb(':memory:');
}

export const claudeCode: ClientInfo = { name: 'claude-code', version: '1.0.0' };
export const cursor: ClientInfo = { name: 'cursor', version: '0.50' };
export const codex: ClientInfo = { name: 'codex', version: '0.1' };
