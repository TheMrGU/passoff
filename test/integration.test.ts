import { describe, it, expect } from 'vitest';
import { createHandoff } from '../src/tools/create.ts';
import { loadHandoff } from '../src/tools/load.ts';
import { listHandoffs } from '../src/tools/list.ts';
import { searchHandoffs } from '../src/tools/search.ts';
import { threadHandoff } from '../src/tools/thread.ts';
import { memDb, claudeCode, cursor, codex } from './helpers.ts';

describe('integration: create → list → load → search → thread', () => {
  it('full handoff lifecycle across three clients', () => {
    const db = memDb();
    const project = 'integration-proj';

    // Claude Code creates a handoff
    const first = createHandoff(
      db,
      {
        title: 'Refactor auth middleware',
        content:
          '## State\nrewrote token validation\n## Next\nwire into /login',
        project,
        tags: ['auth', 'refactor'],
        from_model: 'claude-opus-4-7',
      },
      claudeCode,
    );

    // list shows one open
    let items = listHandoffs(db, { project });
    expect(items.length).toBe(1);
    expect(items[0].status).toBe('open');
    expect(items[0].from_client).toBe('claude-code');

    // Cursor loads it
    const loaded = loadHandoff(db, { latest: true, project }, cursor);
    expect(loaded.id).toBe(first.id);
    expect(loaded.to_client).toBe('cursor');
    expect(loaded.from_model).toBe('claude-opus-4-7');

    // Cursor creates a child handoff, referencing the first
    const second = createHandoff(
      db,
      {
        title: 'Wired auth into login',
        content: 'finished the /login integration, tests still red',
        project,
        parent_id: first.id,
        from_model: 'gpt-5',
      },
      cursor,
    );

    // Codex loads it by id
    const loaded2 = loadHandoff(db, { id: second.id }, codex);
    expect(loaded2.to_client).toBe('codex');
    expect(loaded2.parent_id).toBe(first.id);

    // Codex creates a third handoff
    const third = createHandoff(
      db,
      {
        title: 'Fixed login tests',
        content: 'all green now, ready to ship',
        project,
        parent_id: second.id,
      },
      codex,
    );

    // Thread shows the 3-step chain
    const chain = threadHandoff(db, { id: second.id });
    expect(chain.map(h => h.id)).toEqual([first.id, second.id, third.id]);
    expect(chain.map(h => h.from_client)).toEqual(['claude-code', 'cursor', 'codex']);
    expect(chain[0].to_client).toBe('cursor');
    expect(chain[1].to_client).toBe('codex');

    // Search finds them
    const hits = searchHandoffs(db, { query: 'login', project });
    expect(hits.length).toBeGreaterThanOrEqual(2);

    // List status filters work
    const loadedItems = listHandoffs(db, { project, status: 'loaded' });
    expect(loadedItems.length).toBe(2);
    const openItems = listHandoffs(db, { project, status: 'open' });
    expect(openItems.length).toBe(1);
    expect(openItems[0].id).toBe(third.id);
  });
});
