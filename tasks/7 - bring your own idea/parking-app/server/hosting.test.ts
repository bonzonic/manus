import { it, expect } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from './app';
import { createMapSession } from './map-session';
import { MemoryMapStore } from './memory-store';
import { makeDemoMap } from '../shared/fixtures/demo';
import { routing } from '../shared/routing';
import { csv } from '../shared/csv';

it('serves the built website and API from the same HTTP origin', async () => {
  const directory = await mkdtemp(resolve('.test-static-'));
  await writeFile(resolve(directory, 'index.html'), '<!doctype html><title>Parking demo</title>');
  const session = await createMapSession({ store: new MemoryMapStore(), seedMap: makeDemoMap(), newEpoch: () => 'hosting-test' });
  const options = { session, routing, csv, managementToken: 'test-only-key', allowedOrigins: [], staticDir: directory };
  const handle = createServer(options);
  try {
    await handle.listen({ host: '127.0.0.1', port: 0 });
    const address = handle.httpServer.address(); if (!address || typeof address === 'string') throw new Error('Expected TCP port');
    const base = `http://127.0.0.1:${address.port}`;
    const page = await fetch(base + '/');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('Parking demo');
    expect((await fetch(base + '/health')).status).toBe(200);
    expect((await fetch(base + '/api/missing')).status).toBe(404);
  } finally { await handle.close(); await rm(directory, { recursive: true, force: true }); }
});
