import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer } from './app';
import { createMapSession } from './map-session';
import { FileMapStore } from './file-store';
import { makeDemoMap } from '../shared/fixtures/demo';
import { makeSimpleLayouts } from '../shared/fixtures/simple-layouts';
import { routing } from '../shared/routing';
import { csv } from '../shared/csv';

if (existsSync('.env')) process.loadEnvFile('.env');
const built = process.argv[1]?.replaceAll('\\', '/').includes('/dist/server/') ?? false;
const production = built || process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? (production ? 3000 : 3001));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
const host = process.env.HOST ?? '127.0.0.1';
const directory = resolve(process.env.DATA_DIR ?? '.data');
await mkdir(directory, { recursive: true });
let managementToken = process.env.MANAGEMENT_TOKEN;
if (!managementToken) {
  const keyPath = resolve(directory, 'management.key');
  try { managementToken = (await readFile(keyPath, 'utf8')).trim(); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (!managementToken) {
    managementToken = randomBytes(32).toString('hex');
    await writeFile(keyPath, managementToken + '\n', { mode: 0o600 });
  }
}
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(v => v.trim()).filter(Boolean) ?? [
  'http://127.0.0.1:5173', 'http://localhost:5173',
  `http://127.0.0.1:${port}`, `http://localhost:${port}`
];
const session = await createMapSession({ store: new FileMapStore(resolve(directory, 'map.json')), seedMap: makeDemoMap(), newEpoch: randomUUID });
const demoSessions = process.env.DEMO_MODE === '0' ? undefined : Object.fromEntries(await Promise.all(makeSimpleLayouts().map(async map => [map.id, await createMapSession({ store: new FileMapStore(resolve(directory, 'demos', `${map.id}.json`)), seedMap: map, newEpoch: randomUUID })] as const)));
const server = createServer({ session, routing, csv, managementToken, allowedOrigins, demoSessions, ...(production ? { staticDir: resolve('dist/client') } : {}) });
try { await server.listen({ host, port }); }
catch (error) { await server.close(); throw error; }
console.log(`Parking Navigator ${production ? 'website + backend' : 'backend'} ready at http://127.0.0.1:${port}`);
console.log('Local management key: .data/management.key (load this file in the website; the value is not logged).');
const stop = async () => { await server.close(); process.exit(0); };
process.once('SIGINT', stop); process.once('SIGTERM', stop);
