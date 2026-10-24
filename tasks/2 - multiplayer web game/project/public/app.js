import { createClientModel, applyWelcome, applySnapshot, applyInputAck, applyEffect, applyResult, applyError, queueTurn } from './client-model.js';
import { connectSocket, sendHello, sendTurn, sendReady, sendRematch } from './protocol-client.js';
import { renderBoard } from './board-renderer.js';
import { renderPhase, renderHud, renderAnnouncement, renderResult, renderConnection } from './dom-renderer.js';

export function startApp(document = globalThis.document, location = globalThis.location) {
  if (!document) return null;
  let model = createClientModel();
  let controller = null;
  let queuedHello = null;
  const render = () => {
    renderPhase(model, document);
    renderHud(model, document);
    renderAnnouncement(model, document);
    renderResult(model, document);
    renderConnection(model, document);
    if (model.authoritative) renderBoard(document.getElementById('arena-canvas'), model.authoritative, model);
  };
  const handle = message => {
    if (message.type === 'welcome') model = applyWelcome(model, message);
    else if (message.type === 'snapshot') model = applySnapshot(model, message);
    else if (message.type === 'inputAck') model = applyInputAck(model, message);
    else if (message.type === 'effect') model = applyEffect(model, message);
    else if (message.type === 'result') model = applyResult(model, message);
    else if (message.type === 'error') model = applyError(model, message);
    render();
  };
  const socketUrl = `${location?.protocol === 'https:' ? 'wss:' : 'ws:'}//${location?.host ?? 'localhost'}/ws`;
  const connect = () => {
    controller = connectSocket(socketUrl, {
      onOpen: active => {
        model = { ...model, connection: 'CONNECTED' };
        render();
        if (queuedHello) {
          const hello = queuedHello;
          queuedHello = null;
          sendHello(active, hello);
        }
      },
      onMessage: handle,
      onError: error => { model = applyError(model, error); render(); },
      onClose: () => { model = { ...model, connection: 'DISCONNECTED' }; render(); }
    });
    return controller;
  };
  const sendHelloWhenReady = message => {
    queuedHello = message;
    if (!controller) connect();
    if (controller?.socket?.readyState === 1 && queuedHello) {
      const hello = queuedHello;
      queuedHello = null;
      sendHello(controller, hello);
    }
  };
  const submitTurn = dir => {
    if (!controller || !model.roundId || model.phase !== 'PLAYING') return;
    const next = queueTurn(model, dir, Date.now());
    if (next === model) return;
    model = next;
    const turn = model.pendingTurns.at(-1);
    sendTurn(controller, { v: 1, type: 'turn', requestId: `t-${turn.seq}`, roundId: model.roundId, epoch: model.epoch, seq: turn.seq, dir });
    render();
  };
  document.getElementById('create-room-button')?.addEventListener('click', () => {
    sendHelloWhenReady({ v: 1, type: 'hello', requestId: `h-${Date.now()}`, mode: 'CREATE' });
  });
  document.getElementById('join-room-panel')?.addEventListener('submit', event => {
    event.preventDefault();
    const roomCode = document.getElementById('join-room-code')?.value?.trim().toUpperCase() ?? '';
    if (!/^[A-Z0-9]{8}$/.test(roomCode)) {
      model = applyError(model, { v: 1, type: 'error', code: 'ROOM_INVALID', message: 'Enter an eight-character room code.', retryable: false });
      render();
      return;
    }
    sendHelloWhenReady({ v: 1, type: 'hello', requestId: `h-${Date.now()}`, mode: 'JOIN', roomCode });
  });
  document.getElementById('paste-invite-link')?.addEventListener('click', () => {
    const form = document.getElementById('join-room-panel');
    const input = document.getElementById('join-room-code');
    if (form) form.hidden = false;
    input?.focus?.();
  });
  document.getElementById('copy-invite')?.addEventListener('click', async () => {
    if (!model.roomCode) return;
    const origin = location?.origin ?? `${location?.protocol ?? 'http:'}//${location?.host ?? 'localhost'}`;
    const invite = `${origin}/?room=${encodeURIComponent(model.roomCode)}`;
    try { await globalThis.navigator?.clipboard?.writeText?.(invite); } catch { /* clipboard is optional */ }
  });
  document.getElementById('ready-button')?.addEventListener('click', () => {
    if (!controller || !model.roundId) return;
    sendReady(controller, { v: 1, type: 'ready', requestId: `ready-${Date.now()}`, roundId: model.roundId, epoch: model.epoch });
  });
  document.getElementById('rematch-button')?.addEventListener('click', () => {
    if (!controller || !model.roundId) return;
    sendRematch(controller, { v: 1, type: 'rematch', requestId: `again-${Date.now()}`, roundId: model.roundId, epoch: model.epoch });
  });
  document.querySelectorAll?.('[data-direction]')?.forEach(button => {
    button.addEventListener('click', () => submitTurn(button.dataset?.direction));
  });
  document.addEventListener?.('keydown', event => {
    const dir = { ArrowUp: 'UP', w: 'UP', ArrowRight: 'RIGHT', d: 'RIGHT', ArrowDown: 'DOWN', s: 'DOWN', ArrowLeft: 'LEFT', a: 'LEFT' }[event.key];
    if (dir) submitTurn(dir);
  });
  render();
  const inviteValue = new URLSearchParams(location?.search ?? '').get('room');
  if (inviteValue !== null) {
    const roomCode = inviteValue.trim().toUpperCase();
    if (/^[A-Z0-9]{8}$/.test(roomCode)) {
      sendHelloWhenReady({ v: 1, type: 'hello', requestId: `h-${Date.now()}`, mode: 'JOIN', roomCode });
    } else {
      model = applyError(model, { v: 1, type: 'error', code: 'ROOM_INVALID', message: 'Enter an eight-character room code.', retryable: false });
      render();
    }
  }
  return { getModel: () => model, connect, handleMessage: handle };
}
if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', () => startApp());
