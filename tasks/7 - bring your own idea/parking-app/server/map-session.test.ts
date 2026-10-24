import { describe, expect, it } from 'vitest';
import { createMapSession } from './map-session';
import { MemoryMapStore } from './memory-store';
import type { ParkingMap } from '../shared/contracts';

const map: ParkingMap = {
  schemaVersion: 1, id: 'lot', name: 'Lot',
  floors: [{ id: 'f0', label: 'Ground', level: 0, elevationMeters: 0 }],
  nodes: [
    { id: 'entry', label: 'Entry', kind: 'entrance', floorId: 'f0', x: 0, y: 0, headingDegrees: 0 },
    { id: 'space', label: 'A1', kind: 'space', floorId: 'f0', x: 3, y: 0, headingDegrees: 0, status: 'free' }
  ],
  edges: [{ id: 'access', label: 'Access', kind: 'parking_access', fromNodeId: 'entry', toNodeId: 'space', direction: 'forward', enabled: true, lengthMeters: 3, speedMps: 1 }]
};

describe('map session', () => {
  it('starts at revision one, detaches reads, and broadcasts committed changes', async () => {
    const session = await createMapSession({ store: new MemoryMapStore(), seedMap: map, newEpoch: () => 'epoch-a' });
    const initial = session.getSnapshot();
    initial.map.name = 'mutated outside session';
    expect(session.getSnapshot().map.name).toBe('Lot');
    const events: string[] = [];
    session.subscribe((snapshot, reason) => events.push(`${reason}:${snapshot.revision}`));
    const changed = await session.setAvailability({ expectedEpoch: 'epoch-a', expectedRevision: 1, spaceId: 'space', status: 'occupied' });
    expect(changed.revision).toBe(2);
    expect(events).toEqual(['availability:2']);
  });

  it('checks the version even for no-op availability writes', async () => {
    const session = await createMapSession({ store: new MemoryMapStore(), seedMap: map, newEpoch: () => 'epoch-b' });
    const noOp = await session.setAvailability({ expectedEpoch: 'epoch-b', expectedRevision: 1, spaceId: 'space', status: 'free' });
    expect(noOp.revision).toBe(1);
    await expect(session.setAvailability({ expectedEpoch: 'stale', expectedRevision: 1, spaceId: 'space', status: 'occupied' })).rejects.toMatchObject({ code: 'VERSION_CONFLICT', status: 409 });
  });
});
