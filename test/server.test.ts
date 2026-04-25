import { describe, it, expect } from 'vitest';
import { ok } from '../src/server.ts';

describe('server.ok()', () => {
  it('passes objects through as structuredContent', () => {
    const r = ok({ id: 'ph_abc', title: 't' });
    expect(r.structuredContent).toEqual({ id: 'ph_abc', title: 't' });
  });

  it('wraps arrays under `items` so structuredContent is a JSON object', () => {
    // MCP requires structuredContent to be a record, not an array. Tools like
    // passoff_list / passoff_search / passoff_thread return arrays and would
    // otherwise fail strict client-side schema validation.
    const r = ok([{ id: '1' }, { id: '2' }]);
    expect(Array.isArray(r.structuredContent)).toBe(false);
    expect(r.structuredContent).toEqual({ items: [{ id: '1' }, { id: '2' }] });
    // Text content still serializes the raw payload for humans / LLMs.
    expect(JSON.parse(r.content[0].text)).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('wraps null / scalars under `items`', () => {
    expect(ok(null).structuredContent).toEqual({ items: null });
    expect(ok(42 as any).structuredContent).toEqual({ items: 42 });
  });
});
