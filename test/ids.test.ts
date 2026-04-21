import { describe, it, expect } from 'vitest';
import { newHandoffId } from '../src/lib/ids.ts';

describe('newHandoffId', () => {
  it('has ph_ prefix and 8-char body', () => {
    const id = newHandoffId();
    expect(id).toMatch(/^ph_[0-9A-Za-z]{8}$/);
  });

  it('is unique across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newHandoffId()));
    expect(ids.size).toBe(1000);
  });
});
