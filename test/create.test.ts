import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { memDb, claudeCode } from './helpers.ts';

describe('createHandoff', () => {
  it('inserts a row and returns id/created_at/project', () => {
    const db = memDb();
    const r = createHandoff(
      db,
      { title: 'hello', content: 'body', project: 'p1', tags: ['a', 'b'], from_model: 'claude-opus-4-7' },
      claudeCode,
    );
    expect(r.id).toMatch(/^ph_/);
    expect(r.project).toBe('p1');
    const row = db.prepare('SELECT * FROM handoffs WHERE id = ?').get(r.id) as any;
    expect(row.title).toBe('hello');
    expect(row.from_client).toBe('claude-code');
    expect(row.from_client_ver).toBe('1.0.0');
    expect(row.from_model).toBe('claude-opus-4-7');
    expect(JSON.parse(row.tags)).toEqual(['a', 'b']);
    expect(row.status).toBe('open');
  });

  it('rejects missing title', () => {
    const db = memDb();
    expect(() =>
      createHandoff(db, { title: '', content: 'x', project: 'p' } as any, claudeCode),
    ).toThrow();
  });

  it('errors on unknown parent_id', () => {
    const db = memDb();
    expect(() =>
      createHandoff(
        db,
        { title: 't', content: 'c', project: 'p', parent_id: 'ph_missing' },
        claudeCode,
      ),
    ).toThrow(/parent_id not found/);
  });

  it('accepts a valid parent_id', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: 'a', project: 'p' }, claudeCode);
    const b = createHandoff(
      db,
      { title: 'b', content: 'b', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const row = db.prepare('SELECT parent_id FROM handoffs WHERE id = ?').get(b.id) as any;
    expect(row.parent_id).toBe(a.id);
  });
});
