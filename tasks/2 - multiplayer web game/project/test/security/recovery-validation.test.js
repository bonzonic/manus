import test from 'node:test';
import assert from 'node:assert/strict';
import { parseClientMessage, validateOrigin, validateRequestId, validateTurn } from '../../server/protocol/validate.js';

test('validator parses a legal turn and rejects claimed authority, malformed, and oversized input', () => {
  const valid = parseClientMessage(JSON.stringify({ v: 1, type: 'turn', requestId: 't-1', roundId: 'r-1', epoch: 2, seq: 1, dir: 'UP' }));
  assert.equal(valid.type, 'turn');
  assert.equal(parseClientMessage(JSON.stringify({ v: 1, type: 'turn', requestId: 't-2', roundId: 'r-1', epoch: 2, seq: 2, dir: 'UP', body: [[1, 1]] })), 'BAD_MESSAGE');
  assert.equal(parseClientMessage('{"v":1'), 'BAD_JSON');
  assert.equal(parseClientMessage('x'.repeat(4097)), 'MESSAGE_TOO_LARGE');
});

test('validator enforces trusted origin and bounded request IDs', () => {
  assert.equal(validateOrigin('https://play.example', ['https://play.example']), true);
  assert.equal(validateOrigin('https://evil.example', ['https://play.example']), false);
  assert.equal(validateOrigin(undefined, ['https://play.example']), false);
  assert.equal(validateRequestId('request_01'), true);
  assert.equal(validateRequestId(''), false);
  assert.equal(validateRequestId('x'.repeat(65)), false);
});

test('turn validation rejects stale round, epoch, sequence, and phase without mutating room state', () => {
  const room = { roundId: 'r-2', epoch: 4, phase: 'PLAYING', snakes: { P1: { lastAcceptedSeq: 8 } } };
  assert.deepEqual(validateTurn({ v: 1, type: 'turn', requestId: 't', roundId: 'old', epoch: 4, seq: 9, dir: 'UP' }, room), { ok: false, reasonCode: 'STALE_ROUND' });
  assert.deepEqual(validateTurn({ v: 1, type: 'turn', requestId: 't', roundId: 'r-2', epoch: 3, seq: 9, dir: 'UP' }, room), { ok: false, reasonCode: 'STALE_EPOCH' });
  assert.deepEqual(validateTurn({ v: 1, type: 'turn', requestId: 't', roundId: 'r-2', epoch: 4, seq: 8, dir: 'UP' }, room), { ok: false, reasonCode: 'BAD_SEQUENCE' });
  assert.deepEqual(validateTurn({ v: 1, type: 'turn', requestId: 't', roundId: 'r-2', epoch: 4, seq: 9, dir: 'UP' }, { ...room, phase: 'RESULTS' }), { ok: false, reasonCode: 'PHASE_REJECTED' });
});
