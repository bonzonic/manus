import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPhase } from '../../public/dom-renderer.js';
import { startApp } from '../../public/app.js';

const welcome = {
  v: 1,
  type: 'welcome',
  roomId: 'room-1',
  roomCode: 'AB12CD34',
  seat: 'P1',
  credential: 'credential',
  epoch: 1,
  roundId: 'round-1',
  phase: 'LOBBY',
  serverTick: 0,
  board: { w: 40, h: 24 },
  rules: {},
  players: []
};

function rendererDocument() {
  const nodes = new Map([
    ['room-code', { textContent: '--------' }],
    ['round-phase', { textContent: '' }],
    ['countdown-label', { textContent: '' }],
    ['entry-panel', { hidden: false }],
    ['lobby-panel', { hidden: true }],
    ['countdown-overlay', { hidden: true }],
    ['pause-overlay', { hidden: true }],
    ['results-panel', { hidden: true }],
    ['error-panel', { hidden: true }],
    ['ready-button', { disabled: true }],
    ['rematch-button', { disabled: true }]
  ]);
  const displayNodes = [{ textContent: '--------' }, { textContent: '--------' }];
  const selectors = [];
  return {
    nodes,
    displayNodes,
    selectors,
    getElementById: id => nodes.get(id),
    querySelectorAll: selector => {
      selectors.push(selector);
      return selector === '[data-copy-source="room-code"]' ? displayNodes : [];
    }
  };
}

test('renderPhase preserves the cold placeholder and keeps every room-code surface consistent across updates', () => {
  const document = rendererDocument();
  const coldModel = { roomId: null, roomCode: null, phase: 'LOBBY', players: [] };

  renderPhase(coldModel, document);
  assert.equal(document.nodes.get('room-code').textContent, '--------');
  assert.deepEqual(document.displayNodes.map(node => node.textContent), ['--------', '--------']);

  renderPhase({ ...coldModel, ...welcome }, document);
  assert.equal(document.nodes.get('room-code').textContent, 'AB12CD34');
  assert.deepEqual(document.displayNodes.map(node => node.textContent), ['AB12CD34', 'AB12CD34']);
  assert.ok(document.selectors.includes('[data-copy-source="room-code"]'));

  renderPhase({ ...welcome, roomCode: 'ZX90QWER', phase: 'PLAYING', players: [{ seat: 'P1', connected: true, ready: true }] }, document);
  assert.equal(document.nodes.get('room-code').textContent, 'ZX90QWER');
  assert.deepEqual(document.displayNodes.map(node => node.textContent), ['ZX90QWER', 'ZX90QWER']);

  renderPhase({ ...welcome, phase: 'LOBBY', players: [] }, document);
  assert.equal(document.nodes.get('room-code').textContent, 'AB12CD34');
  assert.deepEqual(document.displayNodes.map(node => node.textContent), ['AB12CD34', 'AB12CD34']);
});

function appDocument() {
  const ids = [
    'entry-panel', 'lobby-panel', 'countdown-overlay', 'pause-overlay', 'results-panel', 'error-panel',
    'ready-button', 'rematch-button', 'arena-canvas', 'create-room-button', 'join-room-panel',
    'join-room-code', 'paste-invite-link', 'copy-invite', 'round-phase', 'countdown-label',
    'connection-chip', 'latency-note', 'game-announcement', 'length-player-one', 'apples-player-one',
    'boost-player-one', 'length-player-two', 'apples-player-two', 'boost-player-two', 'turn-queue',
    'result-title', 'result-reason', 'result-player-one', 'result-player-two', 'error-title', 'error-message',
    'room-code'
  ];
  const nodes = new Map(ids.map(id => [id, {
    id,
    hidden: id !== 'entry-panel',
    disabled: false,
    value: '',
    textContent: '',
    listeners: new Map(),
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }
  }]));
  const displayNodes = [{ textContent: '' }, { textContent: '' }];
  nodes.get('arena-canvas').width = 400;
  nodes.get('arena-canvas').height = 240;
  const documentListeners = new Map();
  return {
    nodes,
    displayNodes,
    getElementById: id => nodes.get(id),
    querySelectorAll: selector => selector === '[data-copy-source="room-code"]' ? displayNodes : [],
    addEventListener: (type, listener) => documentListeners.set(type, listener)
  };
}

test('copy invite remains derived from the model room code after both display surfaces update', async () => {
  const document = appDocument();
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  let copiedInvite = null;
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText: invite => { copiedInvite = invite; return Promise.resolve(); } } }
  });

  try {
    const app = startApp(document, { protocol: 'http:', host: 'localhost', origin: 'http://localhost' });
    app.handleMessage(welcome);
    const copyInviteListeners = document.nodes.get('copy-invite').listeners.get('click');
    assert.equal(document.nodes.get('room-code').textContent, 'AB12CD34');
    assert.deepEqual(document.displayNodes.map(node => node.textContent), ['AB12CD34', 'AB12CD34']);
    assert.equal(copyInviteListeners.length, 1);
    await copyInviteListeners[0]();
    assert.equal(copiedInvite, 'http://localhost/?room=AB12CD34');
  } finally {
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else delete globalThis.navigator;
  }
});
