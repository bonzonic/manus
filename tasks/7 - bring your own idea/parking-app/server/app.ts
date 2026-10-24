import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { resolve } from 'node:path';
import express from 'express';
import { WebSocketServer, WebSocket, type RawData } from 'ws';
import {
  SessionError,
  type AvailabilityCommand,
  type CsvPort,
  type ExpectedVersion,
  type MapSession,
  type RouteRequest,
  type RoutingPort,
  type Snapshot,
  type WsClientMessage,
  type WsServerMessage,
  type ParkingStatus
} from '../shared/contracts';
import { validateMap } from '../shared/contracts';

const MAX_BODY = 2 * 1024 * 1024;
const MAX_WS_MESSAGE = 64 * 1024;
const statuses = new Set<ParkingStatus>(['free', 'occupied', 'closed']);
const clone = <T>(value: T): T => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)) as T;
class TransportError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}

type ServerOptions = {
  session: MapSession;
  routing: RoutingPort;
  csv: CsvPort;
  managementToken: string;
  allowedOrigins: string[];
  staticDir?: string;
  demoSessions?: Record<string, MapSession>;
};
export type ServerHandle = {
  httpServer: ReturnType<typeof createHttpServer>;
  listen(options: { host: string; port: number }): Promise<void>;
  close(): Promise<void>;
};

type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject => !!value && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value: JsonObject, keys: string[]): boolean => Object.keys(value).sort().join('|') === [...keys].sort().join('|');
const issue = (message: string) => [{ code: 'INVALID_INPUT', path: '$', message }];
const version = (value: JsonObject): value is JsonObject & ExpectedVersion => typeof value.expectedEpoch === 'string' && Number.isSafeInteger(value.expectedRevision) && (value.expectedRevision as number) > 0;
const bearer = (request: IncomingMessage): string | null => {
  const value = request.headers.authorization;
  if (!value || !value.startsWith('Bearer ')) return null;
  return value.slice(7);
};

export function createServer(options: ServerOptions): ServerHandle {
  if (typeof options.managementToken !== 'string' || options.managementToken.length === 0) throw new Error('managementToken must be nonempty');
  const allowedOrigins = new Set(options.allowedOrigins);
  const sockets = new Set<WebSocket>();
  const socketUnsubscribe = new Map<WebSocket, () => void>();
  const socketAuth = new Set<WebSocket>();
  const socketSubscribed = new Set<WebSocket>();
  const socketSessions = new Map<WebSocket, MapSession>();
  let heartbeat: NodeJS.Timeout | undefined;

  const originAllowed = (request: IncomingMessage): boolean => {
    const origin = request.headers.origin;
    return !origin || allowedOrigins.has(origin);
  };
  const selectSession = (url: URL): MapSession => {
    const id = url.searchParams.get('layout');
    if (id === null) return options.session;
    if (!options.demoSessions || !Object.hasOwn(options.demoSessions, id)) throw new TransportError(404, 'NOT_FOUND', 'Layout not found');
    return options.demoSessions[id];
  };
  const localDemo = (request: IncomingMessage, session: MapSession): boolean => {
    const id = new URL(request.url ?? '/', 'http://localhost').searchParams.get('layout');
    if (!id || !options.demoSessions || !Object.hasOwn(options.demoSessions, id) || options.demoSessions[id] !== session) return false;
    const remote = request.socket.remoteAddress;
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote ?? '')) return false;
    try { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(`http://${request.headers.host}`).hostname); }
    catch { return false; }
  };
  const writeJson = (response: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) => {
    const text = JSON.stringify(body);
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
    response.end(text);
  };
  const apiError = (error: unknown): { status: number; body: unknown } => {
    if (error instanceof TransportError) return { status: error.status, body: { error: { code: error.code, message: error.message } } };
    if (error instanceof SessionError) {
      return { status: error.status, body: { error: { code: error.code, message: error.message, ...(error.issues ? { issues: error.issues } : {}) }, ...(error.currentVersion ? { currentVersion: error.currentVersion } : {}) } };
    }
    return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } } };
  };
  const readBody = (request: IncomingMessage): Promise<unknown> => new Promise((resolve, reject) => {
    const declared = Number(request.headers['content-length'] ?? 0);
    if (declared > MAX_BODY) { reject(new TransportError(413, 'INPUT_TOO_LARGE', 'Request body is too large')); request.resume(); return; }
    const chunks: Buffer[] = [];
    let size = 0;
    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(new TransportError(413, 'INPUT_TOO_LARGE', 'Request body is too large')); request.destroy(); return; }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new SessionError('INVALID_INPUT', 400, 'Request body must be valid JSON', { issues: issue('Invalid JSON') })); }
    });
    request.on('error', reject);
  });
  const requireMutationAuth = (request: IncomingMessage, session: MapSession): void => {
    if (localDemo(request, session)) return;
    if (bearer(request) !== options.managementToken) throw new TransportError(401, 'UNAUTHORIZED', 'Unauthorized');
  };
  function checkExpected(value: JsonObject): asserts value is JsonObject & ExpectedVersion {
    if (!version(value)) throw new SessionError('INVALID_INPUT', 400, 'Expected epoch and positive revision are required', { issues: issue('Invalid expected version') });
  }
  const checkCurrent = (expected: ExpectedVersion, current: Snapshot): void => {
    if (expected.expectedEpoch !== current.epoch || expected.expectedRevision !== current.revision) {
      throw new SessionError('VERSION_CONFLICT', 409, 'Map version is stale', { currentVersion: { epoch: current.epoch, revision: current.revision } });
    }
  };

  const httpApp = express();
  httpApp.disable('x-powered-by');
  const httpServer = createHttpServer(httpApp);
  httpApp.use(async (request, response, next) => {
    const origin = request.headers.origin;
    if (!originAllowed(request)) { writeJson(response, 403, { error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed' } }); return; }
    if (origin) response.setHeader('access-control-allow-origin', origin);
    response.setHeader('vary', 'Origin');
    if (request.method === 'OPTIONS') { response.writeHead(204, { 'access-control-allow-origin': origin ?? '', 'access-control-allow-methods': 'GET,PUT,POST,PATCH,OPTIONS', 'access-control-allow-headers': 'Authorization,Content-Type' }); response.end(); return; }
    const url = new URL(request.url ?? '/', 'http://localhost');
    try {
      const session = selectSession(url);
      if (request.method === 'GET' && url.pathname === '/health') { writeJson(response, 200, { ok: true }); return; }
      if (request.method === 'GET' && url.pathname === '/api/map') { writeJson(response, 200, session.getSnapshot()); return; }
      if (request.method === 'GET' && url.pathname === '/api/map.csv') {
        const csv = options.csv.serialize(session.getSnapshot().map);
        response.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="parking-map.csv"' }); response.end(csv); return;
      }
      if (request.method === 'PUT' && url.pathname === '/api/map') {
        requireMutationAuth(request, session); const body = await readBody(request);
        if (!isObject(body) || !exactKeys(body, ['expectedEpoch', 'expectedRevision', 'map'])) throw new SessionError('INVALID_INPUT', 400, 'Unknown or missing request fields', { issues: issue('Expected epoch, revision, and map') });
        checkExpected(body); const snapshot = await session.replace({ expectedEpoch: body.expectedEpoch, expectedRevision: body.expectedRevision, map: body.map as never }); writeJson(response, 200, snapshot); return;
      }
      if (request.method === 'POST' && url.pathname === '/api/map/import') {
        requireMutationAuth(request, session); const body = await readBody(request);
        if (!isObject(body) || !exactKeys(body, ['expectedEpoch', 'expectedRevision', 'csv']) || typeof body.csv !== 'string') throw new SessionError('INVALID_INPUT', 400, 'Unknown or missing request fields', { issues: issue('Expected epoch, revision, and csv') });
        checkExpected(body); const parsed = options.csv.parse(body.csv); if (!parsed.ok) throw new SessionError('INVALID_INPUT', 400, 'CSV is invalid', { issues: parsed.errors });
        writeJson(response, 200, await session.replace({ expectedEpoch: body.expectedEpoch, expectedRevision: body.expectedRevision, map: parsed.value })); return;
      }
      const spaceMatch = url.pathname.match(/^\/api\/spaces\/([^/]+)$/);
      if (request.method === 'PATCH' && spaceMatch) {
        requireMutationAuth(request, session); const body = await readBody(request);
        if (!isObject(body) || !exactKeys(body, ['expectedEpoch', 'expectedRevision', 'status']) || !statuses.has(body.status as ParkingStatus)) throw new SessionError('INVALID_INPUT', 400, 'Unknown or missing request fields', { issues: issue('Expected epoch, revision, and status') });
        checkExpected(body); writeJson(response, 200, await session.setAvailability({ expectedEpoch: body.expectedEpoch, expectedRevision: body.expectedRevision, spaceId: decodeURIComponent(spaceMatch[1]), status: body.status as ParkingStatus })); return;
      }
      if (request.method === 'POST' && url.pathname === '/api/route') {
        const body = await readBody(request);
        if (!isObject(body) || !exactKeys(body, ['expectedEpoch', 'expectedRevision', 'startNodeId']) || typeof body.startNodeId !== 'string') throw new SessionError('INVALID_INPUT', 400, 'Unknown or missing request fields', { issues: issue('Expected epoch, revision, and startNodeId') });
        checkExpected(body); const current = session.getSnapshot(); checkCurrent(body, current);
        const outcome = options.routing.findFastestAvailable(current.map, { startNodeId: body.startNodeId } as RouteRequest);
        writeJson(response, 200, { epoch: current.epoch, revision: current.revision, outcome }); return;
      }
      if (url.pathname === '/api' || url.pathname.startsWith('/api/') || url.pathname === '/ws') writeJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Route not found' } });
      else next();
    } catch (error) {
      const result = apiError(error); writeJson(response, result.status, result.body);
    }
  });

  if (options.staticDir) {
    httpApp.use(express.static(resolve(options.staticDir)));
    httpApp.get('/', (_request, response) => response.sendFile(resolve(options.staticDir!, 'index.html')));
  }

  const wsServer = new WebSocketServer({ noServer: true, maxPayload: MAX_WS_MESSAGE });
  const send = (socket: WebSocket, message: WsServerMessage) => { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); };
  const sendError = (socket: WebSocket, message: string, code = 'INVALID_INPUT', requestId?: string, currentVersion?: { epoch: string; revision: number }) => send(socket, { protocolVersion: 1, type: 'error', code, message, ...(requestId ? { requestId } : {}), ...(currentVersion ? { currentVersion } : {}) });
  const sessionErrorToWs = (socket: WebSocket, error: unknown, requestId?: string) => {
    if (error instanceof SessionError) sendError(socket, error.message, error.code, requestId, error.currentVersion);
    else sendError(socket, 'Internal server error', 'INTERNAL_ERROR', requestId);
  };
  const validWsEnvelope = (value: unknown): value is Record<string, unknown> => isObject(value) && value.protocolVersion === 1 && typeof value.type === 'string';
  const onWsMessage = async (socket: WebSocket, raw: RawData) => {
    if (raw.toString().length > MAX_WS_MESSAGE) { sendError(socket, 'Message is too large', 'INPUT_TOO_LARGE'); return; }
    const session = socketSessions.get(socket) ?? options.session;
    let value: unknown; try { value = JSON.parse(raw.toString()); } catch { sendError(socket, 'Message must be valid JSON'); return; }
    if (!validWsEnvelope(value)) { sendError(socket, 'Unknown message or protocol version'); return; }
    try {
      if (value.type === 'subscribe') {
        if (!exactKeys(value, ['type', 'protocolVersion'])) throw new Error('Unknown subscribe fields');
        if (!socketSubscribed.has(socket)) {
          const unsubscribe = session.subscribe((snapshot, reason) => send(socket, { type: 'map.snapshot', protocolVersion: 1, reason, snapshot }));
          socketUnsubscribe.set(socket, unsubscribe); socketSubscribed.add(socket);
        }
        send(socket, { type: 'map.snapshot', protocolVersion: 1, reason: 'initial', snapshot: session.getSnapshot() }); return;
      }
      if (value.type === 'authenticate') {
        if (!exactKeys(value, ['type', 'protocolVersion', 'token']) || typeof value.token !== 'string') throw new Error('Invalid authenticate message');
        if (value.token !== options.managementToken) { sendError(socket, 'Unauthorized', 'UNAUTHORIZED'); return; }
        socketAuth.add(socket); send(socket, { type: 'authenticated', protocolVersion: 1 }); return;
      }
      if (value.type === 'availability.set') {
        if (!exactKeys(value, ['type', 'protocolVersion', 'requestId', 'command']) || typeof value.requestId !== 'string' || !isObject(value.command)) throw new Error('Invalid availability message');
        if (!socketAuth.has(socket)) { sendError(socket, 'Unauthorized', 'UNAUTHORIZED', value.requestId); return; }
        const command = value.command;
        if (!exactKeys(command, ['expectedEpoch', 'expectedRevision', 'spaceId', 'status']) || typeof command.spaceId !== 'string' || !statuses.has(command.status as ParkingStatus) || !version(command)) throw new Error('Invalid availability command');
        try {
          const snapshot = await session.setAvailability({ expectedEpoch: command.expectedEpoch as string, expectedRevision: command.expectedRevision as number, spaceId: command.spaceId, status: command.status as ParkingStatus });
          send(socket, { type: 'command.result', protocolVersion: 1, requestId: value.requestId, snapshot });
        } catch (error) { sessionErrorToWs(socket, error, value.requestId); }
        return;
      }
      throw new Error('Unknown message type');
    } catch (error) { sendError(socket, error instanceof Error ? error.message : 'Invalid message'); }
  };
  wsServer.on('connection', (socket, request) => {
    sockets.add(socket);
    const session = selectSession(new URL(request.url ?? '/', 'http://localhost'));
    socketSessions.set(socket, session);
    if (localDemo(request, session)) socketAuth.add(socket);
    socket.on('message', (raw) => void onWsMessage(socket, raw));
    const cleanup = () => { sockets.delete(socket); socketAuth.delete(socket); socketSubscribed.delete(socket); socketSessions.delete(socket); socketUnsubscribe.get(socket)?.(); socketUnsubscribe.delete(socket); };
    socket.on('close', cleanup); socket.on('error', cleanup);
  });
  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    try { selectSession(url); } catch { socket.write('HTTP/1.1 404 Not Found\r\n\r\n'); socket.destroy(); return; }
    if (url.pathname !== '/ws' || !originAllowed(request)) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); socket.destroy(); return; }
    wsServer.handleUpgrade(request, socket, head, (client) => wsServer.emit('connection', client, request));
  });
  heartbeat = setInterval(() => {
    for (const socket of sockets) {
      if ((socket as WebSocket & { isAlive?: boolean }).isAlive === false) { socket.terminate(); continue; }
      (socket as WebSocket & { isAlive?: boolean }).isAlive = false; socket.ping();
    }
  }, 30_000);
  // Set isAlive on every connection without changing the protocol.
  wsServer.on('connection', (socket) => { (socket as WebSocket & { isAlive?: boolean }).isAlive = true; socket.on('pong', () => ((socket as WebSocket & { isAlive?: boolean }).isAlive = true)); });

  return {
    httpServer,
    listen: ({ host, port }) => new Promise((resolve, reject) => { const onError = (error: Error) => { httpServer.off('error', onError); reject(error); }; httpServer.once('error', onError); httpServer.listen(port, host, () => { httpServer.off('error', onError); resolve(); }); }),
    close: () => new Promise((resolve, reject) => {
      if (heartbeat) clearInterval(heartbeat);
      for (const unsubscribe of socketUnsubscribe.values()) unsubscribe();
      socketUnsubscribe.clear();
      for (const socket of sockets) { socket.close(1001, 'Server shutting down'); socket.terminate(); }
      wsServer.close();
      if (!httpServer.listening) { resolve(); return; }
      httpServer.close((error) => error ? reject(error) : resolve());
    })
  };
}
