import { afterEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { createServer } from './app';
import { createMapSession } from './map-session';
import { MemoryMapStore } from './memory-store';
import type { CsvPort, ParkingMap, RoutingPort } from '../shared/contracts';

const map: ParkingMap = {
  schemaVersion: 1, id: 'lot', name: 'Lot', floors: [{ id: 'f0', label: 'Ground', level: 0, elevationMeters: 0 }],
  nodes: [{ id: 'entry', label: 'Entry', kind: 'entrance', floorId: 'f0', x: 0, y: 0, headingDegrees: 0 }, { id: 'space', label: 'A1', kind: 'space', floorId: 'f0', x: 3, y: 0, headingDegrees: 0, status: 'free' }],
  edges: [{ id: 'access', label: 'Access', kind: 'parking_access', fromNodeId: 'entry', toNodeId: 'space', direction: 'forward', enabled: true, lengthMeters: 3, speedMps: 1 }]
};
const routing: RoutingPort = { findFastestAvailable: () => ({ ok: false, code: 'NO_REACHABLE_SPACE', message: 'none' }) };
const csv: CsvPort = { serialize: () => 'csv\r\n', parse: () => ({ ok: true, value: map }) };
const waitFor = <T>(socket: WebSocket, predicate: (value: T) => boolean): Promise<T> => new Promise((resolve, reject) => {
  const handler = (raw: WebSocket.RawData) => { const value = JSON.parse(raw.toString()) as T; if (predicate(value)) { clearTimeout(timer); socket.off('message', handler); resolve(value); } };
  const timer = setTimeout(() => { socket.off('message', handler); reject(new Error('timed out waiting for websocket message')); }, 2_000);
  socket.on('message', handler);
});

describe('server transport', () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => { await close?.(); close = undefined; });
  it('serves reads, protects writes, broadcasts availability, and closes two clients', async () => {
    const session = await createMapSession({ store: new MemoryMapStore(), seedMap: map, newEpoch: () => 'epoch-http' });
    const handle = createServer({ session, routing, csv, managementToken: 'test-only-secret', allowedOrigins: ['http://localhost'] });
    close = handle.close;
    await handle.listen({ host: '127.0.0.1', port: 0 });
    const address = handle.httpServer.address(); if (!address || typeof address === 'string') throw new Error('server did not bind');
    const base = `http://127.0.0.1:${address.port}`;
    expect((await fetch(`${base}/health`)).status).toBe(200);
    expect((await fetch(`${base}/api/spaces/space`, { method: 'PATCH', body: '{}' })).status).toBe(401);
    const one = new WebSocket(`${base.replace('http', 'ws')}/ws`), two = new WebSocket(`${base.replace('http', 'ws')}/ws`);
    await Promise.all([new Promise<void>(resolve => one.once('open', () => resolve())), new Promise<void>(resolve => two.once('open', () => resolve()))]);
    const initialOne = waitFor(one, (v: { type: string }) => v.type === 'map.snapshot');
    const initialTwo = waitFor(two, (v: { type: string }) => v.type === 'map.snapshot');
    one.send(JSON.stringify({ type:'subscribe', protocolVersion:1 })); two.send(JSON.stringify({ type:'subscribe', protocolVersion:1 }));
    await Promise.all([initialOne, initialTwo]);
    const authenticated = waitFor(one, (v: { type: string }) => v.type === 'authenticated');
    one.send(JSON.stringify({ type:'authenticate', protocolVersion:1, token:'test-only-secret' })); await authenticated;
    const broadcast = waitFor(two, (v: { type: string; reason?: string }) => v.type === 'map.snapshot' && v.reason === 'availability');
    const acknowledgement = waitFor(one, (v: { type: string; requestId?: string }) => v.type === 'command.result' && v.requestId === 'r1');
    one.send(JSON.stringify({ type:'availability.set', protocolVersion:1, requestId:'r1', command:{ expectedEpoch:'epoch-http', expectedRevision:1, spaceId:'space', status:'occupied' } }));
    await Promise.all([broadcast, acknowledgement]);
    expect(session.getSnapshot().map.nodes.find(n => n.id === 'space')?.status).toBe('occupied');
    const clientsClosed = Promise.all([one, two].map(socket => new Promise<void>(resolve => socket.once('close', () => resolve()))));
    await handle.close(); close = undefined;
    await clientsClosed;
    expect(one.readyState).not.toBe(WebSocket.OPEN); expect(two.readyState).not.toBe(WebSocket.OPEN);
  });
});
