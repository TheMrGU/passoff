import { describe, it, expect } from 'vitest';
import { openDb } from '../src/db.ts';

describe('db', () => {
  it('creates schema on open', () => {
    const db = openDb(':memory:');
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type IN ('table','view') ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('handoffs');
    expect(names).toContain('handoffs_fts');
    db.close();
  });

  it('inserts and retrieves a row', () => {
    const db = openDb(':memory:');
    db.prepare(
      `INSERT INTO handoffs (id, project, title, content, from_client, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`
    ).run('ph_test01', 'proj', 'hello', 'body', 'claude-code', Date.now());
    const row = db.prepare('SELECT id, title FROM handoffs WHERE id = ?').get('ph_test01') as any;
    expect(row.title).toBe('hello');
    db.close();
  });

  it('FTS mirrors inserts', () => {
    const db = openDb(':memory:');
    db.prepare(
      `INSERT INTO handoffs (id, project, title, content, from_client, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`
    ).run('ph_fts01', 'proj', 'refactor auth', 'rewrote login flow', 'claude-code', Date.now());
    const hit = db
      .prepare('SELECT id FROM handoffs_fts WHERE handoffs_fts MATCH ?')
      .all('login') as any[];
    expect(hit.length).toBe(1);
    expect(hit[0].id).toBe('ph_fts01');
    db.close();
  });
});
