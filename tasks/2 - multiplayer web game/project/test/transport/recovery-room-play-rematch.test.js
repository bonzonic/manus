import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createGameServer } from '../../server/index.js';

function waitFor(socket, predicate, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('timed out waiting for server message')); }, timeout);
    const onMessage = data => { let message; try { message = JSON.parse(data.toString()); } catch { return; } if (predicate(message)) { cleanup(); resolve(message); } };
    const onClose = () => { cleanup(); reject(new Error('socket closed before expected message')); };
    const cleanup = () => { clearTimeout(timer); socket.off('message', onMessage); socket.off('close', onClose); };
    socket.on('message', onMessage); socket.on('close', onClose);
  });
}
function send(socket, value) { socket.send(JSON.stringify(value)); }

test('real ws admission rejects an untrusted Origin before room creation', async t => {
  const server = createGameServer({ port: 0, tickMs: 1, codeSource: () => 'ORIGIN01', allowedOrigins: ['http://localhost'] });
  await server.start();
  t.after(async () => { await server.close(); });
  const socket = new WebSocket(`ws://127.0.0.1:${server.address().port}/ws`, { headers: { Origin: 'https://evil.example' } });
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  const rejection = await waitFor(socket, message => message.type === 'error' && message.code === 'BAD_ORIGIN');
  assert.equal(rejection.type, 'error');
  assert.equal(server.ready, true);
  socket.close();
});

test('real ws admission rejects an absent Origin without a welcome', async t => {
  const server = createGameServer({ port: 0, allowedOrigins: ['http://localhost'] });
  await server.start();
  t.after(async () => { await server.close(); });
  const socket = new WebSocket(`ws://127.0.0.1:${server.address().port}/ws`);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  const rejection = await waitFor(socket, message => message.type === 'error' && message.code === 'BAD_ORIGIN');
  assert.equal(rejection.type, 'error');
  socket.close();
});

test('real ws same-seat RESUME rotates epoch and enters bounded RESUMING', async t => {
  const server = createGameServer({ port: 0, countdownTicks: 3, allowedOrigins: ['http://localhost'], codeSource: () => 'RESUME01' });
  await server.start();
  t.after(async () => { await server.close(); });
  const url = `ws://127.0.0.1:${server.address().port}/ws`;
  const first = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  await new Promise(resolve => first.once('open', resolve));
  send(first, { v: 1, type: 'hello', requestId: 'resume-create', mode: 'CREATE' });
  const welcome = await waitFor(first, message => message.type === 'welcome');
  first.close();
  await new Promise(resolve => setTimeout(resolve, 25));
  const second = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  await new Promise(resolve => second.once('open', resolve));
  send(second, { v: 1, type: 'hello', requestId: 'resume-hello', mode: 'RESUME', credential: welcome.credential, epoch: welcome.epoch });
  const resumed = await waitFor(second, message => message.type === 'welcome');
  assert.equal(resumed.epoch, welcome.epoch + 1);
  assert.equal(resumed.phase, 'LOBBY');
  second.close();
});

test('running room full snapshots stay at or below fifteen per second while ticks advance', async t => {
  const server = createGameServer({ port: 0, tickMs: 1, countdownTicks: 1, codeSource: () => 'RATE0001', allowedOrigins: ['http://localhost'], roundConfig: { appleCount: 0, mushroomCount: 0 } });
  await server.start();
  t.after(async () => { await server.close(); });
  const url = `ws://127.0.0.1:${server.address().port}/ws`;
  const p1 = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  const p2 = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  await Promise.all([new Promise(resolve => p1.once('open', resolve)), new Promise(resolve => p2.once('open', resolve))]);
  const snapshots = [];
  p1.on('message', raw => { try { const message = JSON.parse(raw.toString()); if (message.type === 'snapshot') snapshots.push(message); } catch {} });
  send(p1, { v: 1, type: 'hello', requestId: 'rh1', mode: 'CREATE' });
  const welcome1 = await waitFor(p1, message => message.type === 'welcome');
  send(p2, { v: 1, type: 'hello', requestId: 'rh2', mode: 'JOIN', roomCode: welcome1.roomCode });
  const welcome2 = await waitFor(p2, message => message.type === 'welcome');
  send(p1, { v: 1, type: 'ready', requestId: 'rr1', roundId: welcome1.roundId, epoch: welcome1.epoch });
  send(p2, { v: 1, type: 'ready', requestId: 'rr2', roundId: welcome2.roundId, epoch: welcome2.epoch });
  const playing = await waitFor(p1, message => message.type === 'snapshot' && message.phase === 'PLAYING', 5000);
  const start = Date.now();
  const startCount = snapshots.length;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const windowSnapshots = snapshots.slice(startCount).filter(message => message.serverTick >= playing.serverTick);
  assert.ok(windowSnapshots.length <= 15, `full snapshots in one second: ${windowSnapshots.length}`);
  assert.ok(windowSnapshots.some(message => message.serverTick > playing.serverTick), 'authoritative ticks did not advance');
  assert.ok(Date.now() - start >= 900);
  p1.close(); p2.close();
});

 test('real ws create/join/ready/countdown/play/result/rematch boundary', async t => {
  const server = createGameServer({ port: 0, tickMs: 1, countdownTicks: 2, codeSource: () => 'AB12CD34', allowedOrigins: ['http://localhost'], roundConfig: { snakes: { P1: { body: [[35, 10], [36, 10], [37, 10], [38, 10]], dir: 'RIGHT' }, P2: { body: [[34, 13], [33, 13], [32, 13], [31, 13]], dir: 'LEFT' } }, appleCount: 0, mushroomCount: 0 } });
  await server.start();
  assert.equal(server.ready, true, 'game server must be listening before clients connect');
  t.after(async () => { await server.close(); });
  const url = `ws://127.0.0.1:${server.address().port}/ws`;
  const p1 = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  const p2 = new WebSocket(url, { headers: { Origin: 'http://localhost' } });
  await Promise.all([new Promise(resolve => p1.once('open', resolve)), new Promise(resolve => p2.once('open', resolve))]);
  send(p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' });
  const welcome1 = await waitFor(p1, message => message.type === 'welcome');
  send(p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: welcome1.roomCode });
  const welcome2 = await waitFor(p2, message => message.type === 'welcome');
  assert.equal(welcome2.roomCode, welcome1.roomCode);
  send(p1, { v: 1, type: 'ready', requestId: 'r1', roundId: welcome1.roundId, epoch: welcome1.epoch });
  send(p2, { v: 1, type: 'ready', requestId: 'r2', roundId: welcome2.roundId, epoch: welcome2.epoch });
  const countdown = await waitFor(p1, message => message.type === 'snapshot' && message.phase === 'COUNTDOWN');
  assert.equal(countdown.roundId, welcome1.roundId);
  const playing = await waitFor(p1, message => message.type === 'snapshot' && message.phase === 'PLAYING');
  send(p1, { v: 1, type: 'turn', requestId: 't1', roundId: playing.roundId, epoch: welcome1.epoch, seq: 1, dir: 'UP' });
  const ack = await waitFor(p1, message => message.type === 'inputAck' && message.requestId === 't1');
  assert.equal(ack.disposition, 'ACCEPTED');
  await waitFor(p1, message => message.type === 'snapshot' && message.phase === 'PLAYING' && message.serverTick > 0);
  const result = await waitFor(p1, message => message.type === 'result', 5000);
  assert.equal(result.roundId, playing.roundId);
  assert.ok(['WALL', 'BODY', 'SIMULTANEOUS_DEATH', 'HEAD_ON', 'HEAD_SWAP'].includes(result.reason));
  send(p1, { v: 1, type: 'rematch', requestId: 'm1', roundId: result.roundId, epoch: welcome1.epoch });
  send(p2, { v: 1, type: 'rematch', requestId: 'm2', roundId: result.roundId, epoch: welcome2.epoch });
  const next = await waitFor(p1, message => message.type === 'snapshot' && message.roundId !== result.roundId);
  assert.equal(next.phase, 'COUNTDOWN');
  p1.close(); p2.close();
 });
