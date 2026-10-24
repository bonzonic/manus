import test from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../../public/app.js';

class FakeSocket {
  static instances = [];
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.listeners = new Map();
    FakeSocket.instances.push(this);
  }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }
  emit(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
  open() {
    this.readyState = 1;
    this.emit('open', {});
  }
  send(payload) {
    this.sent.push(JSON.parse(payload));
  }
  close() {
    this.readyState = 3;
    this.emit('close', {});
  }
}

function documentStub() {
  const ids = [
    'entry-panel', 'lobby-panel', 'countdown-overlay', 'pause-overlay',
    'results-panel', 'error-panel', 'ready-button', 'rematch-button',
    'arena-canvas', 'create-room-button', 'join-room-panel', 'join-room-code',
    'paste-invite-link', 'copy-invite', 'direction-pad', 'round-phase',
    'countdown-label', 'connection-chip', 'latency-note', 'game-announcement',
    'length-player-one', 'apples-player-one', 'boost-player-one',
    'length-player-two', 'apples-player-two', 'boost-player-two', 'turn-queue',
    'result-title', 'result-reason', 'result-player-one', 'result-player-two',
    'error-title', 'error-message', 'error-action', 'modal-layer'
  ];
  const nodes = new Map(ids.map(id => [id, {
    id, hidden: id !== 'entry-panel', disabled: false, value: '', textContent: '', listeners: new Map(),
    addEventListener(type, listener) {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    }
  }]));
  nodes.get('join-room-panel').hidden = true;
  nodes.get('countdown-overlay').hidden = true;
  nodes.get('pause-overlay').hidden = true;
  nodes.get('results-panel').hidden = true;
  nodes.get('error-panel').hidden = true;
  nodes.get('ready-button').disabled = true;
  nodes.get('rematch-button').disabled = true;
  const directions = ['UP', 'LEFT', 'DOWN', 'RIGHT'].map(direction => ({
    dataset: { direction }, disabled: true, listeners: new Map(),
    addEventListener(type, listener) {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    }
  }));
  nodes.get('arena-canvas').width = 400;
  nodes.get('arena-canvas').height = 240;
  nodes.get('arena-canvas').getContext = () => ({ fillStyle: '', strokeStyle: '', lineWidth: 1, fillRect() {}, strokeRect() {}, beginPath() {}, arc() {}, fill() {} });
  const documentListeners = new Map();
  return {
    nodes,
    directions,
    getElementById: id => nodes.get(id),
    querySelectorAll: selector => selector === '[data-direction]' ? directions : [],
    addEventListener: (type, listener) => documentListeners.set(type, listener),
    emit: (type, event = {}) => documentListeners.get(type)?.(event),
    submit: (id, event = {}) => { for (const listener of nodes.get(id)?.listeners.get('submit') ?? []) listener(event); },
  };
}

function click(node) {
  for (const listener of node.listeners.get('click') ?? []) listener({ preventDefault() {} });
}

const welcome = {
  v: 1, type: 'welcome', roomId: 'room-1', roomCode: 'AB12CD34', seat: 'P1',
  credential: 'credential', epoch: 1, roundId: 'round-1', phase: 'LOBBY', serverTick: 0,
  board: { w: 40, h: 24 }, rules: {}, players: []
};

test('browser seam binds lifecycle surfaces, join form, socket-open hello, and direction controls', () => {
  FakeSocket.instances.length = 0;
  const previous = globalThis.WebSocket;
  globalThis.WebSocket = FakeSocket;
  try {
    const document = documentStub();
    const app = startApp(document, { protocol: 'http:', host: 'localhost', origin: 'http://localhost' });
    assert.equal(document.nodes.get('entry-panel').hidden, false);
    assert.equal(document.nodes.get('lobby-panel').hidden, true);
    assert.equal(document.nodes.get('ready-button').disabled, true);
    assert.ok(document.directions.every(button => button.disabled));

    click(document.nodes.get('create-room-button'));
    const socket = FakeSocket.instances[0];
    assert.equal(socket.url, 'ws://localhost/ws');
    socket.open();
    assert.equal(socket.sent[0]?.mode, 'CREATE');
    socket.emit('message', { data: JSON.stringify(welcome) });
    assert.equal(document.nodes.get('entry-panel').hidden, true);
    assert.equal(document.nodes.get('lobby-panel').hidden, false);
    assert.equal(document.nodes.get('ready-button').disabled, false);

    socket.emit('message', { data: JSON.stringify({
      v: 1, type: 'snapshot', roomId: 'room-1', roundId: 'round-1', phase: 'PLAYING',
      revision: 1, serverTick: 1, activeTicks: 1, board: { w: 40, h: 24 },
      snakes: [], food: { apples: [], mushrooms: [] }, outcome: null
    }) });
    click(document.directions[0]);
    assert.equal(socket.sent.at(-1)?.type, 'turn');
    assert.equal(socket.sent.at(-1)?.dir, 'UP');
    assert.equal(app.getModel().phase, 'PLAYING');
  } finally {
    globalThis.WebSocket = previous;
  }
});

test('join form submits the entered room code through the same-origin socket', () => {
  FakeSocket.instances.length = 0;
  const previous = globalThis.WebSocket;
  globalThis.WebSocket = FakeSocket;
  try {
    const document = documentStub();
    startApp(document, { protocol: 'http:', host: 'localhost', origin: 'http://localhost' });
    document.nodes.get('join-room-code').value = 'ZX90QWER';
    const event = { preventDefault() {} };
    document.submit('join-room-panel', event);
    const socket = FakeSocket.instances[0];
    assert.ok(socket, 'join form should open a same-origin socket');
    socket.open();
    assert.equal(socket.sent[0]?.mode, 'JOIN');
    assert.equal(socket.sent[0]?.roomCode, 'ZX90QWER');
  } finally {
    globalThis.WebSocket = previous;
  }
});

test('cold startup consumes one valid room query as a JOIN and never CREATEs', () => {
  FakeSocket.instances.length = 0;
  const previous = globalThis.WebSocket;
  globalThis.WebSocket = FakeSocket;
  try {
    const document = documentStub();
    startApp(document, { protocol: 'http:', host: 'localhost', origin: 'http://localhost', search: '?room=ZX90QWER' });
    const socket = FakeSocket.instances[0];
    assert.ok(socket, 'invite startup should open a same-origin socket');
    socket.open();
    assert.equal(socket.sent.filter(message => message.type === 'hello').length, 1);
    assert.equal(socket.sent[0]?.mode, 'JOIN');
    assert.equal(socket.sent[0]?.roomCode, 'ZX90QWER');
    assert.equal(socket.sent.some(message => message.mode === 'CREATE'), false);
  } finally {
    globalThis.WebSocket = previous;
  }
});

test('cold startup rejects malformed room query without opening a create flow', () => {
  FakeSocket.instances.length = 0;
  const previous = globalThis.WebSocket;
  globalThis.WebSocket = FakeSocket;
  try {
    const document = documentStub();
    const app = startApp(document, { protocol: 'http:', host: 'localhost', origin: 'http://localhost', search: '?room=bad' });
    assert.equal(FakeSocket.instances.length, 0);
    assert.equal(app.getModel().error.code, 'ROOM_INVALID');
  } finally {
    globalThis.WebSocket = previous;
  }
});
