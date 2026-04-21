import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { searchHandoffs } from '../src/tools/search.ts';
import { memDb, claudeCode } from './helpers.ts';

describe('searchHandoffs', () => {
  it('finds matches in title and content', () => {
    const db = memDb();
    createHandoff(
      db,
      { title: 'Refactor auth', content: 'rewrote the login flow', project: 'p' },
      claudeCode,
    );
    createHandoff(
      db,
      { title: 'Rename vars', content: 'cleaned snake_case to camel', project: 'p' },
      claudeCode,
    );
    const hits = searchHandoffs(db, { query: 'login', project: 'p' });
    expect(hits.length).toBe(1);
    expect(hits[0].title).toBe('Refactor auth');
    expect(hits[0].snippet).toContain('[login]');
  });

  it('scopes by project', () => {
    const db = memDb();
    createHandoff(db, { title: 'auth', content: 'token stuff', project: 'p1' }, claudeCode);
    createHandoff(db, { title: 'auth', content: 'token stuff', project: 'p2' }, claudeCode);
    const hits = searchHandoffs(db, { query: 'token', project: 'p1' });
    expect(hits.length).toBe(1);
  });

  it('returns empty when no match', () => {
    const db = memDb();
    createHandoff(db, { title: 'a', content: 'b', project: 'p' }, claudeCode);
    const hits = searchHandoffs(db, { query: 'zzzzzz', project: 'p' });
    expect(hits).toEqual([]);
  });

  it('handles multi-word queries as AND', () => {
    const db = memDb();
    createHandoff(
      db,
      { title: 'x', content: 'the quick brown fox', project: 'p' },
      claudeCode,
    );
    createHandoff(db, { title: 'y', content: 'quick only', project: 'p' }, claudeCode);
    const hits = searchHandoffs(db, { query: 'quick brown', project: 'p' });
    expect(hits.length).toBe(1);
    expect(hits[0].title).toBe('x');
  });
});
