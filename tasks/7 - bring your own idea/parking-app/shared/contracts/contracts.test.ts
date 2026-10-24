import { describe, expect, it } from 'vitest';
import {
  canonicalizeMap,
  demoMap,
  getMapWarnings,
  validateMap,
  type ParkingMap
} from './index';

const baseMap: ParkingMap = {
  schemaVersion: 1,
  id: 'map-test',
  name: 'Contract test map',
  floors: [
    { id: 'ground', label: 'Ground', level: 0, elevationMeters: 0 },
    { id: 'floor-1', label: 'Floor 1', level: 1, elevationMeters: 3 }
  ],
  nodes: [
    { id: 'start', label: 'Start', kind: 'entrance', floorId: 'ground', x: 0, y: 0, headingDegrees: 0 },
    { id: 'landing-ground', label: 'Ground landing', kind: 'ramp_landing', floorId: 'ground', x: 10, y: 0, headingDegrees: 0 },
    { id: 'landing-floor-1', label: 'Floor 1 landing', kind: 'ramp_landing', floorId: 'floor-1', x: 10, y: 0, headingDegrees: 0 },
    { id: 'access', label: 'Access', kind: 'junction', floorId: 'floor-1', x: 20, y: 0, headingDegrees: 0 },
    { id: 'free-space', label: 'Free space', kind: 'space', floorId: 'floor-1', x: 20, y: 1, headingDegrees: 0, status: 'free' }
  ],
  edges: [
    { id: 'road', label: 'Road', kind: 'road', fromNodeId: 'start', toNodeId: 'landing-ground', direction: 'both', enabled: true, lengthMeters: 10, speedMps: 1 },
    { id: 'ramp', label: 'Ramp', kind: 'ramp', fromNodeId: 'landing-ground', toNodeId: 'landing-floor-1', direction: 'both', enabled: true, lengthMeters: 10, speedMps: 1 },
    { id: 'floor-road', label: 'Floor road', kind: 'road', fromNodeId: 'landing-floor-1', toNodeId: 'access', direction: 'both', enabled: true, lengthMeters: 10, speedMps: 1 },
    { id: 'access-edge', label: 'Parking access', kind: 'parking_access', fromNodeId: 'access', toNodeId: 'free-space', direction: 'forward', enabled: true, lengthMeters: 1, speedMps: 1 }
  ]
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('Contract v1 validation', () => {
  it('accepts an empty map and a valid Ground-to-Floor-5 ramp', () => {
    const empty = validateMap({ schemaVersion: 1, id: 'empty', name: 'Empty', floors: [], nodes: [], edges: [] });
    expect(empty.ok).toBe(true);
    expect(validateMap(demoMap).ok).toBe(true);
  });

  it('rejects cross-floor roads and invalid access direction', () => {
    const crossFloorRoad = clone(baseMap);
    crossFloorRoad.edges[2] = { ...crossFloorRoad.edges[2], fromNodeId: 'start', toNodeId: 'access', lengthMeters: 20 };
    expect(validateMap(crossFloorRoad).ok).toBe(false);

    const badAccess = clone(baseMap);
    badAccess.edges[3] = { ...badAccess.edges[3], direction: 'both' };
    expect(validateMap(badAccess).ok).toBe(false);
  });

  it('rejects non-space status, duplicate IDs, missing references and negative/non-finite weights', () => {
    const nonSpaceStatus = clone(baseMap);
    nonSpaceStatus.nodes[0] = { ...nonSpaceStatus.nodes[0], status: 'free' };
    expect(validateMap(nonSpaceStatus).ok).toBe(false);

    const duplicate = clone(baseMap);
    duplicate.nodes[1] = { ...duplicate.nodes[1], id: 'start' };
    expect(validateMap(duplicate).ok).toBe(false);

    const missingReference = clone(baseMap);
    missingReference.edges[0] = { ...missingReference.edges[0], toNodeId: 'missing' };
    expect(validateMap(missingReference).ok).toBe(false);

    const badWeight = clone(baseMap);
    badWeight.edges[0] = { ...badWeight.edges[0], speedMps: Number.NaN };
    expect(validateMap(badWeight).ok).toBe(false);
  });

  it('rejects a ramp shorter than its 3D endpoint distance and an over-limit collection', () => {
    const shortRamp = clone(baseMap);
    shortRamp.edges[1] = { ...shortRamp.edges[1], lengthMeters: 1 };
    expect(validateMap(shortRamp).ok).toBe(false);

    const oversized = clone(baseMap);
    oversized.floors = Array.from({ length: 33 }, (_, index) => ({ id: `f-${index}`, label: `F${index}`, level: index, elevationMeters: index }));
    expect(validateMap(oversized).ok).toBe(false);
  });

  it('accepts partially disconnected maps and reports warnings instead of invalidating them', () => {
    const disconnected = clone(baseMap);
    disconnected.nodes.push({ id: 'unattached', label: 'Unattached', kind: 'space', floorId: 'floor-1', x: 90, y: 90, headingDegrees: 0, status: 'free' });
    const result = validateMap(disconnected);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const warnings = getMapWarnings(result.value);
      expect(warnings.some((warning) => warning.code === 'UNCONNECTED_SPACE' && warning.ids.includes('unattached'))).toBe(true);
    }
  });

  it('canonicalizes collection order without changing IDs or labels', () => {
    const shuffled = clone(baseMap);
    shuffled.floors.reverse();
    shuffled.nodes.reverse();
    shuffled.edges.reverse();
    const result = validateMap(shuffled);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const canonical = canonicalizeMap(result.value);
      expect(canonical.floors.map((floor) => floor.id)).toEqual(['ground', 'floor-1']);
      expect(canonical.nodes.map((node) => node.id)).toEqual([...canonical.nodes.map((node) => node.id)].sort());
      expect(canonical.edges.map((edge) => edge.id)).toEqual([...canonical.edges.map((edge) => edge.id)].sort());
    }
  });

  it('keeps the authored demo fixture totals independent of routing implementation', () => {
    const fixture = validateMap(demoMap);
    expect(fixture.ok).toBe(true);
    expect(demoMap.edges.find((edge) => edge.id === 'edge-express-ramp')?.lengthMeters).toBe(25);
    expect(demoMap.edges.find((edge) => edge.id === 'edge-f1-access')?.lengthMeters).toBe(1);
  });
});
