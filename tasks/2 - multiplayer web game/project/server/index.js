import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createRoom, handleHello, handleReady, handleRematch, handleLeave, disconnectSeat, tickRooms } from './rooms/room-manager.js';
import { acceptTurn, step } from './game/rules.js';
import { parseClientMessage, validateOrigin } from './protocol/validate.js';
import { buildWelcome, buildInputAck, buildSnapshot, buildEffect, buildResult, MAX_OUTPUT_BYTES } from './authoritative-server.js';
import { MAX_MESSAGE_BYTES, MAX_SNAPSHOT_BYTES, PROTOCOL_VERSION, TICK_RATE } from '../shared/constants.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const roundKeys = ['roundId', 'board', 'phase', 'serverTick', 'activeTicks', 'timeoutTicks', 'snakes', 'food', 'outcome', 'foodTarget'];
const roundOf = room => Object.fromEntries(roundKeys.map(key => [key, room[key]]));
function errorMessage(code, requestId) { return { v: PROTOCOL_VERSION, type: 'error', code, message: code.replaceAll('_', ' ').toLowerCase(), retryable: ['RATE_LIMIT', 'SERVER_UNAVAILABLE'].includes(code), ...(requestId ? { requestId } : {}) }; }
function publicSend(connection, message) {
  if (!connection?.socket || connection.socket.readyState !== WebSocket.OPEN) return false;
  const payload = JSON.stringify(message);
  if (Buffer.byteLength(payload) > MAX_SNAPSHOT_BYTES || connection.socket.bufferedAmount + Buffer.byteLength(payload) > MAX_OUTPUT_BYTES) { connection.socket.close(1009, 'output bound'); return false; }
  connection.socket.send(payload); return true;
}
function broadcast(room, message) { for (const seat of ['P1', 'P2']) publicSend(room.seats[seat].connection, message); }
function assignRound(room, round) { for (const key of roundKeys) room[key] = round[key]; room.revision = room.serverTick; }
const SNAPSHOT_INTERVAL_MS = 1000 / 15;
function sendRoomSnapshot(room, nowMs = Date.now()) {
  if (room._lastSnapshotAt != null && nowMs - room._lastSnapshotAt < SNAPSHOT_INTERVAL_MS) return false;
  room._lastSnapshotAt = nowMs;
  broadcast(room, buildSnapshot(room));
  return true;
}

export function createGameServer(config = {}) {
  const manager = createRoom({ ...config, nowTick: 0 });
  const allowedOrigins = config.allowedOrigins ?? ['http://localhost', 'http://127.0.0.1'];
  const host = config.host ?? process.env.HOST ?? (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
  const port = config.port ?? Number(process.env.PORT ?? 10000);
  const tickMs = config.tickMs ?? Math.round(1000 / TICK_RATE);
  let httpServer; let wsServer; let timer; let globalTick = 0; let ready = false;
  const api = { get ready() { return ready; }, address: () => httpServer?.address(), async start() {
    if (ready) return api;
    httpServer = http.createServer((req, res) => {
      if (req.url === '/healthz') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return; }
      if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
      const requested = req.url === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname;
      const target = path.resolve(publicDir, `.${requested}`);
      if (!target.startsWith(publicDir) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404); res.end('Not found'); return; }
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
      res.writeHead(200, { 'content-type': types[path.extname(target)] ?? 'application/octet-stream' }); fs.createReadStream(target).pipe(res);
    });
    wsServer = new WebSocketServer({ server: httpServer, path: '/ws', maxPayload: MAX_MESSAGE_BYTES });
    wsServer.on('connection', (socket, request) => {
      if (!validateOrigin(request?.headers?.origin, allowedOrigins)) {
        publicSend({ socket }, errorMessage('BAD_ORIGIN'));
        socket.close(1008, 'BAD_ORIGIN');
        return;
      }
      const connection = { socket, roomCode: null, seat: null, epoch: 0, messageTimes: [] };
      const sendErrors = (messages, requestId) => { for (const message of messages) publicSend(connection, message.type ? message : errorMessage(message, requestId)); };
      socket.on('message', raw => {
        const parsed = parseClientMessage(raw, { maxMessageBytes: MAX_MESSAGE_BYTES });
        if (typeof parsed === 'string') { publicSend(connection, errorMessage(parsed)); return; }
        const now = Date.now(); connection.messageTimes = connection.messageTimes.filter(value => now - value < 1000); connection.messageTimes.push(now);
        if (connection.messageTimes.length > 60) { publicSend(connection, errorMessage('RATE_LIMIT', parsed.requestId)); return; }
        if (parsed.type === 'hello') {
          const messages = handleHello(manager, connection, parsed); sendErrors(messages, parsed.requestId);
          if (connection.roomCode) { const room = manager.rooms.get(connection.roomCode); sendRoomSnapshot(room); }
          return;
        }
        const room = connection.roomCode ? manager.rooms.get(connection.roomCode) : null;
        if (!room || room.seats[connection.seat]?.connection !== connection) { publicSend(connection, errorMessage('NOT_MEMBER', parsed.requestId)); return; }
        if (parsed.type === 'turn') {
          if (parsed.roundId !== room.roundId) { publicSend(connection, buildInputAck(room, connection.seat, { ...parsed, disposition: 'REJECTED', reasonCode: 'STALE_ROUND' })); return; }
          if (parsed.epoch !== room.seats[connection.seat].epoch) { publicSend(connection, buildInputAck(room, connection.seat, { ...parsed, disposition: 'REJECTED', reasonCode: 'STALE_EPOCH' })); return; }
          if (room.phase !== 'PLAYING') { publicSend(connection, buildInputAck(room, connection.seat, { ...parsed, disposition: 'REJECTED', reasonCode: 'PHASE_REJECTED' })); return; }
          const accepted = acceptTurn(roundOf(room), connection.seat, parsed); assignRound(room, accepted.state); publicSend(connection, buildInputAck(room, connection.seat, { ...parsed, disposition: accepted.disposition, reasonCode: accepted.reasonCode })); return;
        }
        let messages = [];
        if (parsed.type === 'ready') messages = handleReady(manager, connection, parsed);
        else if (parsed.type === 'rematch') messages = handleRematch(manager, connection, parsed);
        else if (parsed.type === 'leave') messages = handleLeave(manager, connection, parsed);
        sendErrors(messages, parsed.requestId); sendRoomSnapshot(room);
      });
      socket.on('close', () => disconnectSeat(manager, connection, globalTick));
    });
    await new Promise((resolve, reject) => { httpServer.once('error', reject); httpServer.listen(port, host, resolve); });
    ready = true;
    timer = setInterval(() => tick(), tickMs);
    return api;
  }, async close() {
    if (timer) clearInterval(timer); timer = null;
    if (wsServer) for (const client of wsServer.clients) client.close();
    if (wsServer) await new Promise(resolve => wsServer.close(() => resolve()));
    if (httpServer?.listening) await new Promise(resolve => httpServer.close(() => resolve()));
    ready = false;
  } };
  function tick() {
    globalTick += 1; tickRooms(manager, globalTick);
    for (const room of manager.rooms.values()) {
      const wasResult = Boolean(room.outcome);
      if (room.phase === 'PLAYING' && !room.outcome) {
        const result = step(roundOf(room), room.serverTick + 1); assignRound(room, result.state);
        for (const event of result.events) broadcast(room, buildEffect(room, event));
        if (room.outcome && !wasResult) broadcast(room, buildResult(room));
      }
      if (room.seats.P1.connection || room.seats.P2.connection) sendRoomSnapshot(room);
    }
  }
  return api;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createGameServer(); server.start().then(() => console.log(`snake server listening on ${server.address().port}`));
}
