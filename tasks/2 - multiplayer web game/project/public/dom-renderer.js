const node = (document, id) => document?.getElementById?.(id);
const set = (document, id, value) => { const el = node(document, id); if (el) el.textContent = String(value ?? ''); };
const setAll = (document, selector, value) => { document?.querySelectorAll?.(selector)?.forEach(el => { el.textContent = String(value ?? ''); }); };
function snake(model, seat) { return model.authoritative?.snakes?.find(item => item.seat === seat) ?? {}; }
function player(model, seat) { return model.players?.find(item => item.seat === seat) ?? {}; }
function renderPlayers(model, document) {
  for (const seat of ['P1', 'P2']) {
    const card = node(document, seat === 'P1' ? 'player-one-card' : 'player-two-card');
    const state = player(model, seat);
    if (!card) continue;
    const name = card.querySelector?.('.player-name');
    if (name && state.label) name.textContent = state.label;
    const stateLabel = card.querySelector?.('.player-state span:last-child');
    if (stateLabel) stateLabel.textContent = state.connected ? (state.ready ? 'Ready' : 'Not ready') : 'Not connected';
    if (card.dataset) { card.dataset.connected = String(Boolean(state.connected)); card.dataset.ready = String(Boolean(state.ready)); }
  }
}
export function renderPhase(model, document) {
  renderPlayers(model, document);
  const roomCode = model.roomCode || '--------';
  set(document, 'room-code', roomCode);
  setAll(document, '[data-copy-source="room-code"]', roomCode);
  set(document, 'round-phase', model.phase);
  set(document, 'countdown-label', model.countdown ?? '');
  const hasRoom = Boolean(model.roomId);
  const hasError = Boolean(model.error);
  const show = (id, visible) => { const el = node(document, id); if (el) el.hidden = !visible; };
  show('entry-panel', !hasRoom && !hasError);
  show('lobby-panel', hasRoom && model.phase === 'LOBBY' && !hasError);
  show('countdown-overlay', (model.phase === 'COUNTDOWN' || model.phase === 'RESUMING') && !hasError);
  show('pause-overlay', model.phase === 'PAUSED' && !hasError);
  show('results-panel', (model.phase === 'RESULTS' || Boolean(model.result)) && !hasError);
  show('error-panel', hasError);
  const ready = node(document, 'ready-button');
  if (ready) ready.disabled = !(hasRoom && model.phase === 'LOBBY' && !hasError);
  const rematch = node(document, 'rematch-button');
  if (rematch) rematch.disabled = !(hasRoom && model.phase === 'RESULTS' && !hasError);
  document?.querySelectorAll?.('[data-direction]')?.forEach(button => {
    button.disabled = !(hasRoom && model.phase === 'PLAYING' && !hasError);
  });
}
export function renderHud(model, document) {
  const serverTick = model.serverTick ?? model.authoritative?.serverTick ?? 0;
  for (const seat of ['P1', 'P2']) {
    const s = snake(model, seat); const suffix = seat === 'P1' ? 'one' : 'two';
    const remainingTicks = s.boostUntilTick == null ? 0 : Math.max(0, s.boostUntilTick - serverTick);
    set(document, `length-player-${suffix}`, s.length ?? 0);
    set(document, `apples-player-${suffix}`, s.apples ?? 0);
    set(document, `boost-player-${suffix}`, remainingTicks > 0 ? `BOOST ${Math.ceil(remainingTicks / 60)}s` : '');
  }
  set(document, 'turn-queue', model.pendingTurns?.map(item => item.dir).join(' · ') ?? '');
}
export function renderAnnouncement(model, document) {
  const result = node(document, 'game-announcement');
  if (result) result.textContent = model.error ? model.error.message : model.result ? `${model.result.reason}${model.result.winner ? ` — ${model.result.winner} wins` : ''}` : '';
  if (model.error) {
    set(document, 'error-title', model.error.code ?? 'Room signal');
    set(document, 'error-message', model.error.message ?? 'The room needs attention.');
  }
}
export function renderResult(model, document) { const result = model.result; set(document, 'result-title', result ? (result.winner ? `${result.winner} wins` : 'Draw') : ''); set(document, 'result-reason', result?.reason ?? ''); set(document, 'result-player-one', result?.final?.P1 ? `${result.final.P1.length} / ${result.final.P1.apples}` : ''); set(document, 'result-player-two', result?.final?.P2 ? `${result.final.P2.length} / ${result.final.P2.apples}` : ''); }
export function renderConnection(model, document) { set(document, 'connection-chip', model.connection ?? 'DISCONNECTED'); set(document, 'latency-note', model.latencyMs == null ? '' : `${model.latencyMs} ms`); }
