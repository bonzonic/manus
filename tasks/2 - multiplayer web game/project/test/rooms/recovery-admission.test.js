import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoom, handleHello, handleReady, tickRooms } from '../../server/rooms/room-manager.js';

test('default room-code generation always returns eight uppercase alphanumeric characters', () => {
  const manager = createRoom();
  for (let index = 0; index < 12; index += 1) {
    const welcome = handleHello(manager, {}, { v: 1, type: 'hello', requestId: `default-${index}`, mode: 'CREATE' })[0];
    assert.match(welcome.roomCode, /^[A-Z0-9]{8}$/);
  }
});

test('room admission creates an eight-character guest code, allows exactly two seats, and starts only after both Ready', () => {
  const manager = createRoom({ codeSource: () => 'AB12CD34', nowTick: 0 });
  const p1 = { id: 'socket-1' };
  const created = handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' });
  assert.equal(created[0].type, 'welcome');
  assert.match(created[0].roomCode, /^[A-Z0-9]{8}$/);
  const code = created[0].roomCode;
  const p2 = { id: 'socket-2' };
  const joined = handleHello(manager, p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: code });
  assert.equal(joined[0].seat, 'P2');
  const p3 = { id: 'socket-3' };
  assert.equal(handleHello(manager, p3, { v: 1, type: 'hello', requestId: 'h3', mode: 'JOIN', roomCode: code })[0].code, 'ROOM_FULL');
  const room = manager.rooms.get(code);
  handleReady(manager, p1, { v: 1, type: 'ready', requestId: 'r1', roundId: room.roundId, epoch: 1 });
  assert.equal(room.phase, 'LOBBY');
  handleReady(manager, p2, { v: 1, type: 'ready', requestId: 'r2', roundId: room.roundId, epoch: 1 });
  assert.equal(room.phase, 'COUNTDOWN');
  tickRooms(manager, 180);
  assert.equal(room.phase, 'PLAYING');
});
