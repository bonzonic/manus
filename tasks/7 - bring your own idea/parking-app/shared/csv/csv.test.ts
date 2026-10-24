import { describe, it, expect } from 'vitest';
import { makeDemoMap } from '../fixtures/demo';
import { canonicalizeMap } from '../contracts/validation';
import { csv } from './index';

describe('Parking CSV exchange', () => {
  it('round-trips the complete multi-floor graph and quoted UTF-8 labels', () => {
    const map = makeDemoMap();
    map.name = 'Parking, "Demo"\n楼';
    const text = csv.serialize(map);
    const result = csv.parse(text);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(canonicalizeMap(map));
    expect(text).toContain('record_type,schema_version');
    expect(csv.parse('\ufeff' + text).ok).toBe(true);
  });
  it('rejects unknown columns, wrong booleans and dangling graph references atomically', () => {
    const text = csv.serialize(makeDemoMap());
    expect(csv.parse(text.replace('record_type,', 'extra_column,')).ok).toBe(false);
    expect(csv.parse(text.replace(',true\r\n', ',maybe\r\n')).ok).toBe(false);
    const map = makeDemoMap(); map.edges[0].toNodeId = 'missing';
    const result = csv.parse(csv.serialize(map));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some(e => e.row !== undefined)).toBe(true);
  });
  it('rejects unsupported versions and oversized files with useful errors', () => {
    const text = csv.serialize(makeDemoMap());
    const result = csv.parse(text.replace('map,1,', 'map,2,'));
    expect(result.ok).toBe(false);
    expect(csv.parse('x'.repeat(2 * 1024 * 1024 + 1)).ok).toBe(false);
  });
});
