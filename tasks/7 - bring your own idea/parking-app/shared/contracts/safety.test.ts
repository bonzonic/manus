import { describe, it, expect } from 'vitest';
import { makeDemoMap } from '../fixtures/demo';
import { validateMap } from './validation';

describe('Graph input safety', () => {
  it('rejects overflow in travel time even when each scalar is finite', () => {
    const map = makeDemoMap();
    map.edges[0].speedMps = Number.MIN_VALUE;
    expect(validateMap(map).ok).toBe(false);
  });
  it('rejects ID collisions across entity collections', () => {
    const map = makeDemoMap();
    map.edges[0].id = map.nodes[0].id;
    expect(validateMap(map).ok).toBe(false);
  });
});
