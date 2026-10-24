import { describe, it, expect } from 'vitest';
import { makeDemoMap } from '../fixtures/demo';
import { routing } from './index';

describe('Dijkstra parking routes', () => {
  it('chooses the 60-second Floor 5 route rather than the 90-second Floor 1 route', () => {
    const map = makeDemoMap();
    const result = routing.findFastestAvailable(map, { startNodeId: 'entrance' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.route.destinationSpaceId).toBe('space-f5-target');
      expect(result.route.totalDurationSeconds).toBeCloseTo(60);
      expect(result.route.edgeIds).toContain('edge-express-ramp');
      expect(result.route.segments.filter(s => s.kind === 'ramp')).toHaveLength(1);
      expect(result.route.segments.find(s => s.kind === 'ramp')?.movement).toBe('up');
    }
  });
  it('ignores occupied and unconnected spaces and chooses Floor 1 after availability changes', () => {
    const map = makeDemoMap();
    map.nodes.find(n => n.id === 'space-f5-target')!.status = 'occupied';
    const before = JSON.stringify(map);
    const result = routing.findFastestAvailable(map, { startNodeId: 'entrance' });
    expect(result.ok && result.route.destinationSpaceId).toBe('space-f1-target');
    if (result.ok) expect(result.route.totalDurationSeconds).toBeCloseTo(90);
    expect(JSON.stringify(map)).toBe(before);
  });
  it('handles descending ramps and respects forbidden reverse traversal', () => {
    const map = makeDemoMap();
    for (const n of map.nodes) if (n.kind === 'space') n.status = 'occupied';
    map.nodes.find(n => n.id === 'space-0-0-a')!.status = 'free';
    const route = routing.findFastestAvailable(map, { startNodeId: 'landing-5' });
    expect(route.ok && route.route.totalDurationSeconds).toBeCloseTo(52);
    if (route.ok) expect(route.route.segments[0].movement).toBe('down');
    for (const e of map.edges) if (e.kind === 'ramp') e.enabled = e.id === 'edge-express-ramp';
    map.edges.find(e => e.id === 'edge-express-ramp')!.direction = 'forward';
    expect(routing.findFastestAvailable(map, { startNodeId: 'landing-5' })).toMatchObject({ ok: false, code: 'NO_REACHABLE_SPACE' });
  });
  it('distinguishes invalid starts, no free spaces and disconnected free spaces', () => {
    const map = makeDemoMap();
    expect(routing.findFastestAvailable(map, { startNodeId: 'missing' })).toMatchObject({ code: 'INVALID_START' });
    for (const n of map.nodes) if (n.kind === 'space') n.status = 'closed';
    expect(routing.findFastestAvailable(map, { startNodeId: 'entrance' })).toMatchObject({ code: 'NO_AVAILABLE_SPACE' });
    map.nodes.find(n => n.id === 'unconnected-space')!.status = 'free';
    expect(routing.findFastestAvailable(map, { startNodeId: 'entrance' })).toMatchObject({ code: 'NO_REACHABLE_SPACE' });
  });
});
