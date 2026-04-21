import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { loadHandoff } from '../src/tools/load.ts';
import { listHandoffs } from '../src/tools/list.ts';
import { memDb, claudeCode, cursor } from './helpers.ts';

describe('listHandoffs', () => {
  it('returns recent first, scoped by project', () => {
    const db = memDb();
    createHandoff(db, { title: 'a', content: '1', project: 'p1' }, claudeCode);
    createHandoff(db, { title: 'b', content: '2', project: 'p1' }, claudeCode);
    createHandoff(db, { title: 'other', content: 'x', project: 'p2' }, claudeCode);
    const res = listHandoffs(db, { project: 'p1' });
    expect(res.map(r => r.title)).toEqual(['b', 'a']);
  });

  it('filters by status', () => {
    const db = memDb();
    const a = createHandoff(db, { title: 'a', content: '1', project: 'p' }, claudeCode);
    createHandoff(db, { title: 'b', content: '2', project: 'p' }, claudeCode);
    loadHandoff(db, { id: a.id }, cursor);
    const open = listHandoffs(db, { project: 'p', status: 'open' });
    const loaded = listHandoffs(db, { project: 'p', status: 'loaded' });
    expect(open.map(r => r.title)).toEqual(['b']);
    expect(loaded.map(r => r.title)).toEqual(['a']);
  });

  it('respects limit', () => {
    const db = memDb();
    for (let i = 0; i < 5; i++) {
      createHandoff(db, { title: `t${i}`, content: 'c', project: 'p' }, claudeCode);
    }
    const res = listHandoffs(db, { project: 'p', limit: 2 });
    expect(res.length).toBe(2);
  });

  it('excludes content body', () => {
    const db = memDb();
    createHandoff(db, { title: 't', content: 'secret body', project: 'p' }, claudeCode);
    const res = listHandoffs(db, { project: 'p' });
    expect((res[0] as any).content).toBeUndefined();
  });
});
