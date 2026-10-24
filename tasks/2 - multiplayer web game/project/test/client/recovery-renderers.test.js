import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBoard } from '../../public/board-renderer.js';
import { renderPhase, renderHud, renderResult, renderConnection } from '../../public/dom-renderer.js';

function canvas() {
  const calls = [];
  const ctx = { fillStyle: '', strokeStyle: '', lineWidth: 1, fillRect: (...args) => calls.push(['fillRect', ...args]), strokeRect: (...args) => calls.push(['strokeRect', ...args]), beginPath() {}, arc() {}, fill() {}, stroke() {} };
  return { width: 400, height: 240, getContext: () => ctx, calls };
}
function documentStub() {
  const nodes = new Map();
  for (const id of ['round-phase', 'countdown-label', 'length-player-one', 'apples-player-one', 'boost-player-one', 'length-player-two', 'apples-player-two', 'boost-player-two', 'result-title', 'result-reason', 'result-player-one', 'result-player-two', 'connection-chip', 'latency-note']) nodes.set(id, { textContent: '', hidden: false, dataset: {}, className: '' });
  for (const id of ['player-one-card', 'player-two-card']) {
    const children = new Map([['.player-name', { textContent: '' }], ['.player-state span:last-child', { textContent: '' }]]);
    nodes.set(id, { textContent: '', hidden: false, dataset: {}, className: '', querySelector: selector => children.get(selector), children });
  }
  return { getElementById: id => nodes.get(id), nodes };
}

test('board renderer draws the 40 by 24 authoritative board and food', () => {
  const target = canvas();
  renderBoard(target, { board: { w: 40, h: 24 }, snakes: [{ seat: 'P1', body: [[1, 1]], dir: 'RIGHT' }, { seat: 'P2', body: [[3, 2]], dir: 'LEFT' }], food: { apples: [{ id: 'a', cell: [5, 5] }], mushrooms: [{ id: 'm', cell: [6, 6] }] } }, {});
  assert.ok(target.calls.some(call => call[0] === 'fillRect'));
});

test('DOM renderers write lifecycle, HUD, result, and connection to stable IDs', () => {
  const doc = documentStub();
  const model = { phase: 'PLAYING', serverTick: 1, countdown: 0, players: [{ seat: 'P1', label: 'Ada', connected: true, ready: true }, { seat: 'P2', label: 'Bea', connected: false, ready: false }], authoritative: { serverTick: 1, snakes: [{ seat: 'P1', length: 5, apples: 2, boostUntilTick: null }, { seat: 'P2', length: 6, apples: 1, boostUntilTick: 241 }] }, result: { reason: 'HEAD_ON', winner: null, final: { P1: { length: 5, apples: 2 }, P2: { length: 6, apples: 1 } } }, connection: 'CONNECTED', latencyMs: 120 };
  renderPhase(model, doc); renderHud(model, doc); renderResult(model, doc); renderConnection(model, doc);
  assert.equal(doc.nodes.get('round-phase').textContent, 'PLAYING');
  assert.equal(doc.nodes.get('length-player-one').textContent, '5');
  assert.equal(doc.nodes.get('apples-player-two').textContent, '1');
  assert.equal(doc.nodes.get('player-one-card').querySelector('.player-name').textContent, 'Ada');
  assert.equal(doc.nodes.get('player-two-card').querySelector('.player-state span:last-child').textContent, 'Not connected');
  assert.equal(doc.nodes.get('boost-player-two').textContent, 'BOOST 4s');
  const paused = { ...model, phase: 'PAUSED', serverTick: 1, authoritative: { ...model.authoritative, phase: 'PAUSED', serverTick: 1 } };
  renderHud(paused, doc);
  assert.equal(doc.nodes.get('boost-player-two').textContent, 'BOOST 4s');
  assert.equal(doc.nodes.get('result-reason').textContent, 'HEAD_ON');
  assert.equal(doc.nodes.get('connection-chip').textContent, 'CONNECTED');
});
