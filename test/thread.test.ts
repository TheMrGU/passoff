import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { threadHandoff } from '../src/tools/thread.ts';
import { memDb, claudeCode } from './helpers.ts';

describe('threadHandoff', () => {
  it('returns ancestors → anchor → descendants in order', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: '.', project: 'p' }, claudeCode);
    const b = createHandoff(
      db,
      { title: 'b', content: '.', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const c = createHandoff(
      db,
      { title: 'c', content: '.', project: 'p', parent_id: b.id },
      claudeCode,
    );
    const chain = threadHandoff(db, { id: b.id });
    expect(chain.map(h => h.id)).toEqual([a.id, b.id, c.id]);
  });

  it('ancestors only', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: '.', project: 'p' }, claudeCode);
    const b = createHandoff(
      db,
      { title: 'b', content: '.', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const chain = threadHandoff(db, { id: b.id, direction: 'ancestors' });
    expect(chain.map(h => h.id)).toEqual([a.id, b.id]);
  });

  it('descendants only', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: '.', project: 'p' }, claudeCode);
    const b = createHandoff(
      db,
      { title: 'b', content: '.', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const chain = threadHandoff(db, { id: a.id, direction: 'descendants' });
    expect(chain.map(h => h.id)).toEqual([a.id, b.id]);
  });

  it('handles branching (multiple children)', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: '.', project: 'p' }, claudeCode);
    const b = createHandoff(
      db,
      { title: 'b', content: '.', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const c = createHandoff(
      db,
      { title: 'c', content: '.', project: 'p', parent_id: a.id },
      claudeCode,
    );
    const chain = threadHandoff(db, { id: a.id, direction: 'descendants' });
    const ids = chain.map(h => h.id);
    expect(ids[0]).toBe(a.id);
    expect(ids).toContain(b.id);
    expect(ids).toContain(c.id);
  });

  it('errors on unknown id', () => {
    const db = memDb();
    expect(() => threadHandoff(db, { id: 'ph_missing' })).toThrow(/not found/);
  });
});
