import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { loadHandoff } from '../src/tools/load.ts';
import { memDb, claudeCode, cursor } from './helpers.ts';

describe('loadHandoff', () => {
  it('loads by id and stamps to_client + loaded_at + status', () => {
    const db = memDb();
    const c = createHandoff(db, { title: 't', content: 'c', project: 'p' }, claudeCode);
    const h = loadHandoff(db, { id: c.id }, cursor);
    expect(h.id).toBe(c.id);
    expect(h.to_client).toBe('cursor');
    expect(h.to_client_ver).toBe('0.50');
    expect(h.status).toBe('loaded');
    expect(h.loaded_at).not.toBeNull();
  });

  it('loads latest open in project', () => {
    const db = memDb();
    createHandoff(db, { title: 'first', content: 'x', project: 'p' }, claudeCode);
    const second = createHandoff(db, { title: 'second', content: 'y', project: 'p' }, claudeCode);
    const h = loadHandoff(db, { latest: true, project: 'p' }, cursor);
    expect(h.id).toBe(second.id);
  });

  it('errors helpfully when no open handoffs', () => {
    const db = memDb();
    expect(() => loadHandoff(db, { latest: true, project: 'empty' }, cursor)).toThrow(
      /No open handoffs/,
    );
  });

  it('errors when neither id nor latest given', () => {
    const db = memDb();
    expect(() => loadHandoff(db, {}, cursor)).toThrow(/Must provide/);
  });

  it('errors on unknown id', () => {
    const db = memDb();
    expect(() => loadHandoff(db, { id: 'ph_nope' }, cursor)).toThrow(/not found/);
  });

  it('returns parsed tags array', () => {
    const db = memDb();
    const c = createHandoff(
      db,
      { title: 't', content: 'c', project: 'p', tags: ['refactor', 'auth'] },
      claudeCode,
    );
    const h = loadHandoff(db, { id: c.id }, cursor);
    expect(h.tags).toEqual(['refactor', 'auth']);
  });
});
