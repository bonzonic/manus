#!/usr/bin/env node
/**
 * Independent verifier conduit for the immutable Snake candidate v2.
 *
 * This file is measurement code, not a verdict and not a product test endpoint.
 * It adapts the v1 real-browser driver and adds runtime admission, snapshot-rate,
 * cold invite, authoritative lifecycle/HUD, and process-ownership evidence.
 *
 * The parent must execute this only against an immutable v2 candidate project and
 * must provide --expected-sha explicitly. No credential is printed or persisted.
 * No page.evaluate, raw CDP, injected state, fake result, bot client, or product
 * debug endpoint is used. The only non-browser socket is a transport-only Origin
 * admission probe using the candidate's installed ws library.
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const FROZEN_IDS = [
  'app-shell', 'room-code', 'copy-invite', 'round-phase', 'countdown-label',
  'connection-chip', 'latency-note', 'entry-panel', 'create-room-button',
  'join-room-panel', 'join-room-code', 'paste-invite-link', 'lobby-panel',
  'player-one-card', 'player-two-card', 'ready-button', 'countdown-overlay',
  'arena-frame', 'arena-canvas', 'arena-focus-target', 'game-announcement',
  'hud', 'length-player-one', 'apples-player-one', 'boost-player-one',
  'length-player-two', 'apples-player-two', 'boost-player-two', 'turn-queue',
  'keyboard-help', 'direction-pad', 'pause-overlay', 'pause-title',
  'pause-message', 'results-panel', 'result-title', 'result-reason',
  'result-player-one', 'result-player-two', 'rematch-panel', 'rematch-button',
  'rematch-status', 'error-panel', 'error-title', 'error-message',
  'error-action', 'modal-layer'
];

const VIEWPORT = { width: 1440, height: 900 };
const NARROW_VIEWPORT = { width: 390, height: 844 };
const DEFAULT_RTT_MS = 150;
const DEFAULT_JITTER_MS = 25;
const DEFAULT_MAX_SECONDS = 180;
const BASELINE_SHA = '0c3155d560692d4042c5fdb7cb6a569cbf4c0cee';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') { args.help = true; continue; }
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { args[key] = next; i += 1; }
    else args[key] = true;
  }
  return args;
}

function required(args, key) {
  const value = args[key];
  if (!value || value === true) throw new Error(`Missing required --${key}`);
  return String(value);
}

function numberArg(args, key, fallback, min, max) {
  const value = Number(args[key] ?? fallback);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`--${key} must be in [${min}, ${max}]`);
  }
  return value;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function nowIso() { return new Date().toISOString(); }
function fileUrl(file) { return pathToFileURL(path.resolve(file)).href; }
function clone(value) { return structuredClone(value); }
function safeText(value, limit = 300) { return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function sameCell(a, b) { return a?.[0] === b?.[0] && a?.[1] === b?.[1]; }

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = /credential|token|authorization|cookie|password|secret/i.test(key)
        ? '[REDACTED]' : redact(child);
    }
    return result;
  }
  return value;
}

function sanitizeUrl(value) {
  try {
    const url = new URL(String(value));
    for (const key of [...url.searchParams.keys()]) {
      if (/credential|token|authorization|cookie|password|secret/i.test(key)) {
        url.searchParams.set(key, '[REDACTED]');
      }
    }
    return url.toString();
  } catch {
    return safeText(value, 500).replace(/(credential|token|secret|password)=[^&\s]+/gi, '$1=[REDACTED]');
  }
}

function messageSummary(raw) {
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  try {
    const body = redact(JSON.parse(text));
    return {
      encoding: 'json',
      bytes: Buffer.byteLength(text, 'utf8'),
      type: body?.type ?? null,
      mode: body?.mode ?? null,
      phase: body?.phase ?? null,
      roomId: body?.roomId ?? null,
      roundId: body?.roundId ?? null,
      revision: body?.revision ?? null,
      serverTick: body?.serverTick ?? null,
      activeTicks: body?.activeTicks ?? null,
      requestId: body?.requestId ?? null,
      disposition: body?.disposition ?? null,
      code: body?.code ?? null,
      seat: body?.seat ?? null,
      epoch: body?.epoch ?? null,
      body
    };
  } catch {
    return {
      encoding: 'non-json', bytes: Buffer.byteLength(text, 'utf8'), type: null,
      mode: null, phase: null, roomId: null, roundId: null, revision: null,
      serverTick: null, activeTicks: null, requestId: null, disposition: null,
      code: null, seat: null, epoch: null, body: '[NON_JSON_REDACTED]'
    };
  }
}

async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }
async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function gitHead(project) {
  try {
    return execFileSync('git', ['-C', path.resolve(project, '..'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function printHelp() {
  console.log(`Independent Snake verifier conduit v2\n\nRequired:\n  --candidate-project <absolute-path>\n  --evidence-root <absolute-path>\n  --playwright-root <absolute-path>\n  --expected-sha <40-hex-v2-sha>\n\nOptional:\n  --rtt-ms <100..200>       RTT target, default ${DEFAULT_RTT_MS}\n  --jitter-ms <0..100>      RTT jitter bound, default ${DEFAULT_JITTER_MS}\n  --max-seconds <60..240>   hard bound, default ${DEFAULT_MAX_SECONDS}\n  --help\n\nThe conduit is local measurement only. It never converts localhost HTTP/WS into S10 public HTTPS/WSS evidence.\n`);
}

function check(record, checks, name, status, detail = {}) {
  const item = { name, status, ...detail };
  checks.push(item);
  record('measurement', item);
  return item;
}

function eventMatches(event, direction, type, predicate = () => true, role = null) {
  return event.kind === 'ws-message-forwarded'
    && event.direction === direction
    && event.type === type
    && (!role || event.role === role)
    && predicate(event);
}

function hasForwarded(events, direction, type, predicate = () => true, role = null) {
  return events.some(event => eventMatches(event, direction, type, predicate, role));
}

function countForwarded(events, direction, type, predicate = () => true, role = null) {
  return events.filter(event => eventMatches(event, direction, type, predicate, role)).length;
}

async function importCandidate(project, relative) {
  return import(fileUrl(path.join(project, relative)));
}

async function runPureFixtures(project, record) {
  const fixtureResults = [];
  const run = async (name, fn) => {
    try {
      await fn();
      fixtureResults.push({ name, status: 'PASS' });
      record('pure-fixture', { name, status: 'PASS' });
    } catch (error) {
      fixtureResults.push({ name, status: 'FAIL', error: safeText(error?.message) });
      record('pure-fixture', { name, status: 'FAIL', error: safeText(error?.message) });
    }
  };

  const [{ createRound, acceptTurn, step }, arena, validate, rooms] = await Promise.all([
    importCandidate(project, 'server/game/rules.js'),
    importCandidate(project, 'server/game/arena.js'),
    importCandidate(project, 'server/protocol/validate.js'),
    importCandidate(project, 'server/rooms/room-manager.js')
  ]);

  await run('arena-bounds-and-legal-food', () => {
    const policy = arena.createArenaPolicy({ width: 4, height: 3 });
    assert(arena.containsCell(policy, [0, 0]) && arena.containsCell(policy, [3, 2]), 'valid cells rejected');
    assert(!arena.containsCell(policy, [-1, 0]) && !arena.containsCell(policy, [4, 2]), 'out-of-bounds cell accepted');
    const state = {
      board: { w: 4, h: 3 },
      snakes: { P1: { body: [[0, 0]] }, P2: { body: [[3, 2]] } },
      food: { apples: [{ cell: [1, 1] }], mushrooms: [] }
    };
    const legal = arena.legalFoodCells(state).map(arena.cellKey);
    assert(!legal.includes('0,0') && !legal.includes('3,2') && !legal.includes('1,1'), 'occupied or food cell returned');
  });

  await run('round-shape-and-mirrored-spawn', () => {
    const state = createRound({ roundId: 'fixture-round', phase: 'PLAYING', appleCount: 0, mushroomCount: 0 }, () => 0.25);
    assert(state.board.w === 40 && state.board.h === 24, 'board dimensions drifted');
    assert(state.snakes.P1.body.length === 5 && state.snakes.P2.body.length === 5, 'spawn length drifted');
    assert(state.food.apples.length === 0 && state.food.mushrooms.length === 0, 'food count override ignored');
  });

  await run('turn-queue-reversal-and-cap', () => {
    const state = createRound({ phase: 'PLAYING', appleCount: 0, mushroomCount: 0 });
    const first = acceptTurn(state, 'P1', { seq: 1, dir: 'UP' });
    const second = acceptTurn(first.state, 'P1', { seq: 2, dir: 'LEFT' });
    const reversal = acceptTurn(second.state, 'P1', { seq: 3, dir: 'RIGHT' });
    const third = acceptTurn(second.state, 'P1', { seq: 3, dir: 'DOWN' });
    assert(first.disposition === 'ACCEPTED' && second.disposition === 'ACCEPTED', 'legal turns rejected');
    assert(reversal.disposition === 'REJECTED' && reversal.reasonCode === 'BAD_DIRECTION', 'exact reversal accepted');
    assert(third.disposition === 'REJECTED' && third.reasonCode === 'QUEUE_FULL', 'third future turn accepted');
  });

  await run('apple-growth-exactly-one', () => {
    const state = createRound({
      width: 10, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0,
      food: { apples: [{ id: 'apple-a', cell: [3, 1] }], mushrooms: [] },
      snakes: {
        P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 },
        P2: { body: [[8, 4], [7, 4]], dir: 'LEFT', movementCredit: 0 }
      }
    });
    const before = state.snakes.P1.body.length;
    const result = step(state, 1);
    assert(result.state.snakes.P1.body.length === before + 1, 'apple did not add one segment');
    assert(result.state.snakes.P1.apples === 1, 'apple score did not increment once');
    assert(result.events.filter(event => event.kind === 'APPLE_COLLECTED').length === 1, 'apple event count drifted');
  });

  await run('mushroom-boost-refresh-and-pause-freeze', () => {
    const state = createRound({
      width: 10, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0,
      food: { apples: [], mushrooms: [{ id: 'mushroom-a', cell: [3, 1] }] },
      snakes: {
        P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 },
        P2: { body: [[8, 4], [7, 4]], dir: 'LEFT', movementCredit: 0 }
      }
    });
    const result = step(state, 1);
    assert(result.state.snakes.P1.body.length === 2, 'mushroom changed length');
    assert(result.state.snakes.P1.boostUntilTick === 241, 'boost duration is not 240 ticks');
    const paused = clone(result.state); paused.phase = 'PAUSED';
    const frozen = step(paused, 2);
    assert(JSON.stringify(frozen.state) === JSON.stringify(paused), 'paused step mutated body/boost/time');
  });

  await run('head-swap-and-terminal-pickup-suppression', () => {
    const state = createRound({
      width: 8, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0,
      food: { apples: [{ id: 'terminal-apple', cell: [3, 1] }], mushrooms: [] },
      snakes: {
        P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 },
        P2: { body: [[4, 1], [3, 1]], dir: 'LEFT', movementCredit: 54 }
      }
    });
    const result = step(state, 1);
    assert(result.state.phase === 'RESULTS' && result.state.outcome?.reason === 'HEAD_SWAP', 'head swap was not terminal');
    assert(result.events.length === 0 && result.state.snakes.P1.apples === 0, 'terminal step awarded food');
  });

  await run('protocol-message-size-origin-and-authority-boundary', () => {
    const valid = validate.parseClientMessage(JSON.stringify({
      v: 1, type: 'turn', requestId: 't-1', roundId: 'r-1', epoch: 1, seq: 1, dir: 'UP'
    }));
    assert(valid.type === 'turn', 'valid turn rejected');
    assert(validate.parseClientMessage(JSON.stringify({
      v: 1, type: 'turn', requestId: 't-2', roundId: 'r-1', epoch: 1,
      seq: 2, dir: 'UP', body: [[1, 1]]
    })) === 'BAD_MESSAGE', 'claimed body accepted');
    assert(validate.parseClientMessage('x'.repeat(4097)) === 'MESSAGE_TOO_LARGE', 'oversized input accepted');
    assert(validate.validateOrigin('http://127.0.0.1', ['http://127.0.0.1']) === true
      && validate.validateOrigin('https://evil.example', ['http://127.0.0.1']) === false, 'origin boundary drifted');
  });

  await run('room-admission-ready-rematch-and-expiry-fixture', () => {
    const manager = rooms.createRoom({ codeSource: () => 'AB12CD34', countdownTicks: 2, graceTicks: 3 });
    const p1 = {}, p2 = {}, p3 = {};
    const w1 = rooms.handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' })[0];
    const w2 = rooms.handleHello(manager, p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: w1.roomCode })[0];
    const full = rooms.handleHello(manager, p3, { v: 1, type: 'hello', requestId: 'h3', mode: 'JOIN', roomCode: w1.roomCode });
    const room = manager.rooms.get(w1.roomCode);
    assert(w2.seat === 'P2' && full[0].code === 'ROOM_FULL', 'two-seat admission boundary drifted');
    rooms.handleReady(manager, p1, { requestId: 'r1', roundId: w1.roundId, epoch: w1.epoch });
    rooms.handleReady(manager, p2, { requestId: 'r2', roundId: w2.roundId, epoch: w2.epoch });
    assert(room.phase === 'COUNTDOWN', 'both ready did not create countdown');
    rooms.tickRooms(manager, 2);
    assert(room.phase === 'PLAYING', 'countdown did not start play');
    rooms.disconnectSeat(manager, p1, 3);
    assert(room.phase === 'PAUSED', 'disconnect did not pause');
    rooms.tickRooms(manager, 7);
    assert(room.phase === 'RESULTS', 'one-seat expiry did not forfeit');
  });

  return { passed: fixtureResults.every(item => item.status === 'PASS'), fixtures: fixtureResults };
}

async function runLifecycleSeamChecks(project, record, checks) {
  let rooms;
  try {
    rooms = await importCandidate(project, 'server/rooms/room-manager.js');
  } catch (error) {
    check(record, checks, 'lifecycle-seam-import', 'UNVERIFIED', { error: safeText(error?.message) });
    return;
  }
  if (typeof rooms.createRoom !== 'function' || typeof rooms.handleHello !== 'function') {
    check(record, checks, 'lifecycle-seam-exports', 'UNVERIFIED', { reason: 'required public room seam unavailable' });
    return;
  }

  const manager = rooms.createRoom({
    codeSource: () => 'V2SEAM01',
    countdownTicks: 2,
    graceTicks: 2,
    maxInterruptions: 2
  });
  const oldSocket = {};
  const p2 = {};
  const w1 = rooms.handleHello(manager, oldSocket, {
    v: 1, type: 'hello', requestId: 'seam-create', mode: 'CREATE'
  })[0];
  const w2 = rooms.handleHello(manager, p2, {
    v: 1, type: 'hello', requestId: 'seam-join', mode: 'JOIN', roomCode: w1.roomCode
  })[0];
  const room = manager.rooms.get(w1.roomCode);
  const ready1 = rooms.handleReady(manager, oldSocket, { requestId: 'seam-ready-1', roundId: w1.roundId, epoch: w1.epoch });
  const ready2 = rooms.handleReady(manager, p2, { requestId: 'seam-ready-2', roundId: w2.roundId, epoch: w2.epoch });
  rooms.tickRooms(manager, 2);

  const wrongEpoch = rooms.handleHello(manager, {}, {
    v: 1, type: 'hello', requestId: 'seam-wrong-epoch', mode: 'RESUME',
    credential: w1.credential, epoch: Math.max(0, Number(w1.epoch) - 1)
  });
  const wrongEpochCode = wrongEpoch.find(message => message?.type === 'error')?.code ?? null;
  check(record, checks, 'stale-epoch-resume-rejected',
    ['STALE_EPOCH', 'CREDENTIAL_INVALID'].includes(wrongEpochCode) ? 'PASS' : 'FAIL',
    { observedCode: wrongEpochCode });

  const disconnectOne = rooms.disconnectSeat(manager, oldSocket, 3);
  const resumedSocket = {};
  const resumed = rooms.handleHello(manager, resumedSocket, {
    v: 1, type: 'hello', requestId: 'seam-resume', mode: 'RESUME',
    credential: w1.credential, epoch: w1.epoch
  });
  const resumeWelcome = resumed.find(message => message?.type === 'welcome');
  check(record, checks, 'same-seat-epoch-advances-on-resume',
    resumeWelcome && Number(resumeWelcome.epoch) > Number(w1.epoch) ? 'PASS' : 'FAIL',
    { oldEpoch: w1.epoch, newEpoch: resumeWelcome?.epoch ?? null, phase: room?.phase ?? null });

  let staleOldSocketMessages = [];
  try {
    staleOldSocketMessages = rooms.handleReady(manager, oldSocket, {
      requestId: 'seam-old-ready', roundId: w1.roundId, epoch: w1.epoch
    });
  } catch (error) {
    staleOldSocketMessages = [{ type: 'exception', message: safeText(error?.message) }];
  }
  const staleOldCode = staleOldSocketMessages.find(message => message?.type === 'error')?.code ?? null;
  check(record, checks, 'old-socket-control-rejected-after-resume',
    staleOldCode || staleOldSocketMessages.some(message => message?.type === 'exception') ? 'PASS' : 'FAIL',
    { observedCode: staleOldCode, responseTypes: staleOldSocketMessages.map(message => message?.type ?? null) });

  let episode = 1;
  let currentConnection = resumedSocket;
  let currentEpoch = resumeWelcome?.epoch ?? w1.epoch;
  let thirdInterruptionRejectedOrTerminal = false;
  for (; episode <= 3; episode += 1) {
    rooms.disconnectSeat(manager, currentConnection, 10 + episode);
    const replacement = {};
    const response = rooms.handleHello(manager, replacement, {
      v: 1, type: 'hello', requestId: `seam-episode-${episode}`, mode: 'RESUME',
      credential: w1.credential, epoch: currentEpoch
    });
    const nextWelcome = response.find(message => message?.type === 'welcome');
    const errorCode = response.find(message => message?.type === 'error')?.code ?? null;
    if (episode === 3) {
      thirdInterruptionRejectedOrTerminal = Boolean(errorCode)
        || ['RESULTS', 'ABANDONED', 'LOBBY'].includes(room?.phase);
      check(record, checks, 'third-interruption-cap-enforced',
        thirdInterruptionRejectedOrTerminal ? 'PASS' : 'FAIL',
        { episode, observedCode: errorCode, phase: room?.phase ?? null });
      break;
    }
    if (!nextWelcome) break;
    currentConnection = replacement;
    currentEpoch = nextWelcome.epoch;
  }

  const abandonManager = rooms.createRoom({ codeSource: () => 'V2ABND01', countdownTicks: 1, graceTicks: 2 });
  const absent1 = {};
  const absent2 = {};
  const aw1 = rooms.handleHello(abandonManager, absent1, { v: 1, type: 'hello', requestId: 'ab-create', mode: 'CREATE' })[0];
  const aw2 = rooms.handleHello(abandonManager, absent2, { v: 1, type: 'hello', requestId: 'ab-join', mode: 'JOIN', roomCode: aw1.roomCode })[0];
  rooms.handleReady(abandonManager, absent1, { requestId: 'ab-ready-1', roundId: aw1.roundId, epoch: aw1.epoch });
  rooms.handleReady(abandonManager, absent2, { requestId: 'ab-ready-2', roundId: aw2.roundId, epoch: aw2.epoch });
  rooms.tickRooms(abandonManager, 1);
  rooms.disconnectSeat(abandonManager, absent1, 2);
  rooms.disconnectSeat(abandonManager, absent2, 2);
  rooms.tickRooms(abandonManager, 8);
  const abandonedRoom = abandonManager.rooms.get(aw1.roomCode);
  check(record, checks, 'both-absent-expiry-does-not-fabricate-winner',
    abandonedRoom && ['ABANDONED', 'RESULTS', 'LOBBY'].includes(abandonedRoom.phase)
      && (abandonedRoom.outcome?.winner == null) ? 'PASS' : 'FAIL',
    { phase: abandonedRoom?.phase ?? null, winner: abandonedRoom?.outcome?.winner ?? null });

  record('lifecycle-seam-summary', {
    readyResponseTypes: [...ready1, ...ready2].map(message => message?.type ?? null),
    disconnectResponseTypes: disconnectOne.map(message => message?.type ?? null),
    roomPhase: room?.phase ?? null,
    note: 'Uses the candidate room-manager public seam only; no fake browser client or product endpoint.'
  });
}

function routeDelayMs(rttMs, jitterMs) {
  return Math.max(0, Math.round(rttMs / 2 + (Math.random() * 2 - 1) * (jitterMs / 2)));
}

function waitForCondition(predicate, timeoutMs, label, deadline = Number.POSITIVE_INFINITY) {
  const bounded = Math.min(timeoutMs, Math.max(1, deadline - Date.now()));
  const end = Date.now() + bounded;
  return (async () => {
    let lastError = '';
    while (Date.now() < end) {
      try {
        if (await predicate()) return true;
      } catch (error) {
        lastError = safeText(error?.message);
      }
      await sleep(80);
    }
    throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError}` : ''}`);
  })();
}

async function locatorText(locator) {
  try { return safeText(await locator.innerText({ timeout: 2000 })); }
  catch { try { return safeText(await locator.textContent({ timeout: 2000 })); } catch { return ''; } }
}

async function visible(locator) {
  try { return await locator.isVisible({ timeout: 1500 }); } catch { return false; }
}

async function enabled(locator) {
  try { return await locator.isEnabled({ timeout: 1500 }); } catch { return false; }
}

async function capture(page, evidenceRoot, name, record) {
  const file = path.join(evidenceRoot, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  record('screenshot', { name, file });
  return file;
}

async function checkFrozenDom(page, role, record) {
  const missing = [];
  for (const id of FROZEN_IDS) {
    const count = await page.locator(`#${id}`).count();
    if (count !== 1) missing.push({ id, count });
  }
  record('dom-contract', {
    role, expected: FROZEN_IDS.length, missing,
    status: missing.length ? 'FAIL' : 'PASS'
  });
  return missing;
}

function installDiagnostics(page, role, record) {
  page.on('console', message => record('console', {
    role, level: message.type(), text: safeText(message.text())
  }));
  page.on('pageerror', error => record('page-error', {
    role, error: safeText(error?.message)
  }));
  page.on('requestfailed', request => record('request-failed', {
    role, method: request.method(), url: sanitizeUrl(request.url()),
    error: safeText(request.failure()?.errorText)
  }));
}

async function installLatency(page, role, config, record, timerSet) {
  if (typeof page.routeWebSocket !== 'function') {
    throw new Error('Playwright 1.56 routeWebSocket is unavailable; no CDP/eval substitute is allowed');
  }
  await page.routeWebSocket('**/ws', browserSocket => {
    const serverSocket = browserSocket.connectToServer();
    const forward = (direction, message, send) => {
      const delayMs = routeDelayMs(config.rttMs, config.jitterMs);
      const meta = messageSummary(message);
      record('ws-message-scheduled', {
        role, direction, delayMs, ...meta,
        transportTime: nowIso()
      });
      const timer = setTimeout(() => {
        timerSet.delete(timer);
        try {
          send(message);
          record('ws-message-forwarded', { role, direction, delayMs, ...meta });
        } catch (error) {
          record('ws-forward-error', { role, direction, error: safeText(error?.message) });
        }
      }, delayMs);
      timerSet.add(timer);
    };
    browserSocket.onMessage(message => forward('browser-to-server', message, value => serverSocket.send(value)));
    serverSocket.onMessage(message => forward('server-to-browser', message, value => browserSocket.send(value)));
    record('ws-route-installed', {
      role, pattern: '**/ws', rttMs: config.rttMs, jitterMs: config.jitterMs,
      model: 'real routeWebSocket forwarding with symmetric per-message one-way delay'
    });
  });
}

function serverConfirmedBothReady(events, roundId = null) {
  return events.some(event => event.kind === 'ws-message-forwarded'
    && event.direction === 'server-to-browser'
    && ['welcome', 'snapshot'].includes(event.type)
    && (!roundId || event.roundId === roundId)
    && Array.isArray(event.body?.players)
    && ['P1', 'P2'].every(seat => event.body.players.some(player => player.seat === seat
      && player.connected === true && player.ready === true)));
}

function authoritativeBoostSnapshot(events) {
  return events.find(event => event.kind === 'ws-message-forwarded'
    && event.direction === 'server-to-browser'
    && event.type === 'snapshot'
    && Array.isArray(event.body?.snakes)
    && event.body.snakes.some(snake => Number.isFinite(Number(snake.boostUntilTick))
      && Number(snake.boostUntilTick) > Number(event.body.serverTick ?? 0)));
}

function serverPhases(events, role = null) {
  return [...new Set(events.filter(event => event.kind === 'ws-message-forwarded'
    && event.direction === 'server-to-browser'
    && event.type === 'snapshot'
    && (!role || event.role === role)
    && event.phase).map(event => event.phase))];
}

function measureSnapshotCadence(events, record, checks) {
  const snapshotEvents = events.filter(event => event.kind === 'ws-message-scheduled'
    && event.direction === 'server-to-browser' && event.type === 'snapshot'
    && event.roomId);
  const groups = new Map();
  for (const event of snapshotEvents) {
    const room = String(event.roomId);
    if (!groups.has(room)) groups.set(room, []);
    groups.get(room).push(event);
  }
  let worst = { count: 0, roomId: null, startMs: null };
  for (const [roomId, entries] of groups) {
    const unique = new Map();
    for (const event of entries) {
      const key = event.revision == null ? `${event.elapsedMs}:${event.role}` : String(event.revision);
      if (!unique.has(key)) unique.set(key, event);
    }
    const points = [...unique.values()].sort((a, b) => a.elapsedMs - b.elapsedMs);
    for (let i = 0; i < points.length; i += 1) {
      let j = i;
      while (j < points.length && points[j].elapsedMs - points[i].elapsedMs <= 1000) j += 1;
      const count = j - i;
      if (count > worst.count) worst = { count, roomId, startMs: points[i].elapsedMs };
    }
  }
  const oversized = snapshotEvents.filter(event => Number(event.bytes) > 32768);
  check(record, checks, 'full-snapshot-cadence-at-most-15-per-second',
    worst.count > 0 && worst.count <= 15 ? 'PASS' : 'FAIL', {
      maxUniqueSnapshotsInOneSecond: worst.count,
      roomId: worst.roomId,
      windowStartMs: worst.startMs,
      observedScheduledMessages: snapshotEvents.length,
      method: 'server-to-browser routeWebSocket scheduled events, unique revision per room',
      note: 'Authoritative tick cadence is not inferred from renderer count.'
    });
  check(record, checks, 'snapshot-size-at-most-32-kib',
    oversized.length === 0 && snapshotEvents.length > 0 ? 'PASS' : (snapshotEvents.length ? 'FAIL' : 'UNVERIFIED'), {
      maxBytes: snapshotEvents.reduce((max, event) => Math.max(max, Number(event.bytes) || 0), 0),
      oversizedCount: oversized.length
    });
  return { worst, observed: snapshotEvents.length, oversized: oversized.length };
}

function loadWebSocketConstructor(moduleNamespace) {
  return moduleNamespace?.default?.WebSocket
    ?? moduleNamespace?.default
    ?? moduleNamespace?.WebSocket
    ?? moduleNamespace;
}

async function transportOriginProbe(WebSocket, wsUrl, origin, label, record) {
  return new Promise(resolve => {
    const messages = [];
    let opened = false;
    let settled = false;
    let socket;
    const finish = detail => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket?.close(); } catch { /* exact probe handle is already closing */ }
      const result = { label, origin: origin ?? '[ABSENT]', opened, messages, ...detail };
      record('origin-probe', {
        label, origin: origin ?? '[ABSENT]', opened,
        closeCode: detail.closeCode ?? null,
        closeReason: detail.closeReason ?? null,
        messages: messages.map(message => ({ type: message.type, code: message.code, bytes: message.bytes }))
      });
      resolve(result);
    };
    const timer = setTimeout(() => finish({ timedOut: true }), 3500);
    try {
      const options = origin ? { origin } : {};
      socket = new WebSocket(wsUrl, options);
      socket.on('open', () => {
        opened = true;
        try {
          socket.send(JSON.stringify({
            v: 1, type: 'hello', requestId: `origin-${label}`, mode: 'CREATE'
          }));
        } catch (error) {
          finish({ sendError: safeText(error?.message) });
        }
      });
      socket.on('message', data => {
        const summary = messageSummary(data.toString());
        messages.push(summary);
        if (summary.type === 'error' && summary.code === 'BAD_ORIGIN') {
          finish({ timedOut: false });
        }
      });
      socket.on('close', (code, reason) => finish({
        timedOut: false, closeCode: code, closeReason: safeText(reason?.toString())
      }));
      socket.on('error', error => record('origin-probe-error', {
        label, origin: origin ?? '[ABSENT]', error: safeText(error?.message)
      }));
    } catch (error) {
      finish({ constructionError: safeText(error?.message) });
    }
  });
}

async function runOriginProbes(project, port, record, checks) {
  let WebSocket;
  try {
    const wsModule = await import(fileUrl(path.join(project, 'node_modules', 'ws', 'index.js')));
    WebSocket = loadWebSocketConstructor(wsModule);
  } catch (error) {
    check(record, checks, 'runtime-origin-rejection', 'UNVERIFIED', {
      reason: 'candidate-local ws library could not be loaded', error: safeText(error?.message)
    });
    return;
  }
  const wsUrl = `ws://127.0.0.1:${port}/ws`;
  const probes = await Promise.all([
    transportOriginProbe(WebSocket, wsUrl, 'https://evil.example', 'evil-origin', record),
    transportOriginProbe(WebSocket, wsUrl, null, 'absent-origin', record)
  ]);
  const passes = probes.every(probe => {
    const hasBadOrigin = probe.messages.some(message => message.type === 'error' && message.code === 'BAD_ORIGIN');
    const hasWelcome = probe.messages.some(message => message.type === 'welcome');
    return hasBadOrigin && !hasWelcome;
  });
  check(record, checks, 'runtime-origin-rejection', passes ? 'PASS' : 'FAIL', {
    wsUrl: sanitizeUrl(wsUrl),
    probes: probes.map(probe => ({
      label: probe.label,
      origin: probe.origin,
      opened: probe.opened,
      badOrigin: probe.messages.some(message => message.type === 'error' && message.code === 'BAD_ORIGIN'),
      welcome: probe.messages.some(message => message.type === 'welcome'),
      closeCode: probe.closeCode ?? null
    })),
    note: 'Transport-only admission probes; no room or gameplay state is injected.'
  });
}

async function closeBrowserOwned(browser, browserServer, record) {
  try {
    await browser?.close();
    record('browser-disconnected', {});
  } catch (error) {
    record('cleanup-error', { target: 'browser-connection', error: safeText(error?.message) });
  }
  let child = null;
  try { child = browserServer?.process?.() ?? null; } catch { child = null; }
  const pid = child?.pid ?? null;
  try {
    await browserServer?.close();
    record('browser-server-close-requested', { pid });
  } catch (error) {
    record('cleanup-error', { target: 'browser-server', pid, error: safeText(error?.message) });
  }
  if (!child || pid == null) {
    record('browser-process-exit', { pid, observed: false, reason: 'Playwright did not expose an owned child process' });
    return { pid, observed: false };
  }
  if (child.exitCode != null || child.signalCode != null) {
    record('browser-process-exit', {
      pid, observed: true, exitCode: child.exitCode, signal: child.signalCode ?? null
    });
    return { pid, observed: true, exitCode: child.exitCode, signal: child.signalCode ?? null };
  }
  const exited = await new Promise(resolve => {
    let done = false;
    const finish = value => { if (!done) { done = true; resolve(value); } };
    child.once('exit', (exitCode, signal) => finish({ observed: true, exitCode, signal: signal ?? null }));
    setTimeout(() => finish({ observed: false, timedOut: true }), 5000);
  });
  record('browser-process-exit', { pid, ...exited });
  return { pid, ...exited };
}

async function browserFlow(project, evidenceRoot, config, record, deadline, checks, receipt) {
  const [{ createGameServer }, playwright] = await Promise.all([
    importCandidate(project, 'server/index.js'),
    import(fileUrl(path.join(config.playwrightRoot, 'index.mjs')))
  ]);
  assert(typeof playwright.chromium?.launchServer === 'function', 'Playwright chromium.launchServer is unavailable');

  const testAllowedOrigins = ['http://127.0.0.1', 'http://localhost'];
  const server = createGameServer({
    port: 0,
    host: '127.0.0.1',
    countdownTicks: 180,
    allowedOrigins: testAllowedOrigins
  });
  let browserServer;
  let browser;
  let context1;
  let context2;
  let page1;
  let page2;
  const timers = new Set();
  const summary = {
    phases: [], screenshots: [], domFailures: [], consoleErrors: [], pageErrors: [],
    requestFailures: [], route: { rttMs: config.rttMs, jitterMs: config.jitterMs, viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT },
    checks
  };

  try {
    await server.start();
    const address = server.address();
    const port = typeof address === 'object' ? address.port : Number(new URL(`http://${address}`).port);
    const baseUrl = `http://127.0.0.1:${port}/`;
    summary.baseUrl = baseUrl;
    testAllowedOrigins.push(new URL(baseUrl).origin);
    receipt.ownedProcesses.push({ pid: process.pid, role: 'in-process-candidate-server', start: nowIso(), exact: true });
    record('server-started', { baseUrl, port, serverPid: process.pid, conduitPid: process.pid, candidateProject: project });
    await runOriginProbes(project, port, record, checks);

    browserServer = await playwright.chromium.launchServer({ headless: true, executablePath: config.executablePath });
    const browserChild = browserServer.process?.() ?? null;
    const browserPid = browserChild?.pid ?? null;
    receipt.ownedProcesses.push({ pid: browserPid, role: 'playwright-chrome-server', start: nowIso(), exact: browserPid != null });
    record('browser-process-started', { pid: browserPid, launchMode: 'chromium.launchServer + chromium.connect', executablePath: config.executablePath });
    browser = await playwright.chromium.connect({ wsEndpoint: browserServer.wsEndpoint() });
    context1 = await browser.newContext({ viewport: VIEWPORT });
    context2 = await browser.newContext({ viewport: VIEWPORT });
    page1 = await context1.newPage();
    page2 = await context2.newPage();
    installDiagnostics(page1, 'P1', record);
    installDiagnostics(page2, 'P2', record);
    await installLatency(page1, 'P1', config, record, timers);
    await installLatency(page2, 'P2', config, record, timers);

    const gotoAndCheck = async (page, role, url) => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
      record('navigated', { role, url: sanitizeUrl(page.url()), title: safeText(await page.title()) });
      const missing = await checkFrozenDom(page, role, record);
      if (missing.length) summary.domFailures.push({ role, missing });
      return missing;
    };

    await gotoAndCheck(page1, 'P1', baseUrl);
    summary.screenshots.push(await capture(page1, evidenceRoot, 'p1-entry-1440x900', record));
    await page1.locator('#create-room-button').click({ timeout: config.timeoutMs });
    const roomCodeLocator = page1.locator('#room-code');
    await waitForCondition(async () => /^[A-Z0-9]{8}$/.test(await locatorText(roomCodeLocator)), config.timeoutMs, 'created eight-character room code', deadline);
    const roomCode = await locatorText(roomCodeLocator);
    const inviteUrl = `${baseUrl}?room=${encodeURIComponent(roomCode)}`;
    record('room-created', { roomCode, inviteUrl: sanitizeUrl(inviteUrl), linkContainsCredential: false });
    await waitForCondition(() => visible(page1.locator('#lobby-panel')), config.timeoutMs, 'P1 lobby', deadline);
    summary.screenshots.push(await capture(page1, evidenceRoot, 'p1-lobby-1440x900', record));

    const joinMarker = record.events.length;
    await gotoAndCheck(page2, 'P2', inviteUrl);
    await waitForCondition(() => visible(page2.locator('#lobby-panel')), config.timeoutMs, 'P2 cold shared-link lobby', deadline);
    const joinEvents = record.events.slice(joinMarker).filter(event => event.kind === 'ws-message-forwarded'
      && event.direction === 'browser-to-server' && event.role === 'P2' && event.type === 'hello');
    const joinCount = joinEvents.filter(event => event.mode === 'JOIN').length;
    const createCount = joinEvents.filter(event => event.mode === 'CREATE').length;
    check(record, checks, 'cold-shared-link-sends-one-join', joinCount === 1 && createCount === 0 ? 'PASS' : 'FAIL', {
      joinCount, createCount, observedModes: joinEvents.map(event => event.mode),
      url: sanitizeUrl(page2.url()), queryHasCredential: /credential|token|secret|password/i.test(page2.url())
    });
    summary.screenshots.push(await capture(page2, evidenceRoot, 'p2-cold-link-lobby-1440x900', record));

    await waitForCondition(() => enabled(page1.locator('#ready-button')) && enabled(page2.locator('#ready-button')), config.timeoutMs, 'both Ready enabled', deadline);
    await page1.locator('#ready-button').click(); record('ready-clicked', { role: 'P1' });
    await page2.locator('#ready-button').click(); record('ready-clicked', { role: 'P2' });
    await waitForCondition(() => visible(page1.locator('#countdown-overlay')) && visible(page2.locator('#countdown-overlay')), config.timeoutMs, 'shared COUNTDOWN surface', deadline);
    await waitForCondition(() => serverConfirmedBothReady(record.events), config.timeoutMs, 'server-confirmed both ready metadata', deadline);
    summary.phases.push('COUNTDOWN');
    check(record, checks, 'server-confirmed-both-ready', serverConfirmedBothReady(record.events) ? 'PASS' : 'FAIL', {
      messageCount: record.events.filter(event => event.type === 'snapshot' || event.type === 'welcome').length
    });
    summary.screenshots.push(await capture(page1, evidenceRoot, 'countdown-p1-1440x900', record));
    summary.screenshots.push(await capture(page2, evidenceRoot, 'countdown-p2-1440x900', record));

    await waitForCondition(() => locatorText(page1.locator('#round-phase')).then(value => value === 'PLAYING')
      && locatorText(page2.locator('#round-phase')).then(value => value === 'PLAYING'), config.timeoutMs + 4000, 'shared PLAYING phase', deadline);
    summary.phases.push('PLAYING');
    summary.screenshots.push(await capture(page1, evidenceRoot, 'playing-p1-1440x900', record));
    record('latency-configured', { rttMs: config.rttMs, jitterMs: config.jitterMs, mechanism: 'page.routeWebSocket', fakeData: false });
    await page1.locator('#arena-focus-target').focus();
    await page1.keyboard.press('ArrowUp');
    record('keyboard-action', { role: 'P1', key: 'ArrowUp' });
    await page2.locator('#arena-focus-target').focus();
    await page2.keyboard.press('ArrowDown');
    record('keyboard-action', { role: 'P2', key: 'ArrowDown' });
    await waitForCondition(() => hasForwarded(record.events, 'browser-to-server', 'turn', () => true, 'P1')
      && hasForwarded(record.events, 'browser-to-server', 'turn', () => true, 'P2')
      && hasForwarded(record.events, 'server-to-browser', 'inputAck', event => event.disposition === 'ACCEPTED', 'P1'), config.timeoutMs, 'server-confirmed accepted turns', deadline);
    check(record, checks, 'server-confirmed-input-ack', 'PASS', {
      p1AcceptedAcks: countForwarded(record.events, 'server-to-browser', 'inputAck', event => event.disposition === 'ACCEPTED', 'P1'),
      p2TurnMessages: countForwarded(record.events, 'browser-to-server', 'turn', () => true, 'P2')
    });

    await sleep(Math.min(2200, Math.max(1000, deadline - Date.now())));
    summary.snapshotCadence = measureSnapshotCadence(record.events, record, checks);
    const playingSnapshots = record.events.filter(event => event.type === 'snapshot' && event.phase === 'PLAYING');
    const ticks = [...new Set(playingSnapshots.map(event => Number(event.serverTick)).filter(Number.isFinite))];
    check(record, checks, 'authoritative-play-advances', ticks.length >= 2 && Math.max(...ticks) > Math.min(...ticks) ? 'PASS' : 'FAIL', {
      distinctServerTicks: ticks.length, firstServerTick: ticks[0] ?? null, lastServerTick: ticks.at(-1) ?? null
    });

    const boostBefore = record.events.length;
    await sleep(Math.min(5000, Math.max(500, deadline - Date.now())));
    const boostEvent = authoritativeBoostSnapshot(record.events.slice(boostBefore));
    if (boostEvent) {
      const boostSeat = boostEvent.body.snakes.find(snake => Number.isFinite(Number(snake.boostUntilTick))
        && Number(snake.boostUntilTick) > Number(boostEvent.body.serverTick ?? 0))?.seat;
      const boostLocator = boostSeat === 'P2' ? page2.locator('#boost-player-two') : page1.locator('#boost-player-one');
      const hudText = await locatorText(boostLocator);
      const hudVisible = await visible(boostLocator);
      check(record, checks, 'authoritative-boost-snapshot-and-hud', hudVisible && hudText.length > 0 && !/^0(?:\.0+)?s?$/i.test(hudText)
        ? 'PASS' : 'FAIL', {
        seat: boostSeat ?? null, serverTick: boostEvent.body.serverTick ?? null,
        boostUntilTick: boostEvent.body.snakes.find(snake => snake.seat === boostSeat)?.boostUntilTick ?? null,
        hudText: safeText(hudText), hudVisible
      });
      summary.screenshots.push(await capture(boostSeat === 'P2' ? page2 : page1, evidenceRoot, `boost-${String(boostSeat ?? 'unknown').toLowerCase()}-1440x900`, record));
    } else {
      check(record, checks, 'authoritative-boost-snapshot-and-hud', 'UNVERIFIED', {
        reason: 'No naturally observed authoritative mushroom pickup before the bounded live round ended; no state was injected.'
      });
    }

    const initialWelcome = record.events.find(event => event.role === 'P1' && event.direction === 'server-to-browser'
      && event.type === 'welcome' && event.body?.seat === 'P1');
    const initialEpoch = Number(initialWelcome?.body?.epoch);
    const resumeMarker = record.events.length;
    await page1.reload({ waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
    record('same-seat-refresh', { role: 'P1', url: sanitizeUrl(page1.url()) });
    await waitForCondition(() => record.events.slice(resumeMarker).some(event => event.role === 'P1'
      && event.direction === 'browser-to-server' && event.type === 'hello' && event.mode === 'RESUME'), config.timeoutMs, 'same-seat RESUME hello after refresh', deadline);
    await waitForCondition(() => visible(page1.locator('#lobby-panel')) || visible(page1.locator('#arena-frame'))
      || visible(page1.locator('#pause-overlay')) || visible(page1.locator('#results-panel')), config.timeoutMs, 'same-seat refreshed app surface', deadline);
    const resumeHello = record.events.slice(resumeMarker).find(event => event.role === 'P1'
      && event.direction === 'browser-to-server' && event.type === 'hello' && event.mode === 'RESUME');
    const resumeWelcome = record.events.slice(resumeMarker).find(event => event.role === 'P1'
      && event.direction === 'server-to-browser' && event.type === 'welcome');
    const refreshUrlHasCredential = /credential|token|secret|password/i.test(page1.url());
    const epochAdvanced = Number.isFinite(initialEpoch) && Number(resumeWelcome?.body?.epoch) > initialEpoch;
    check(record, checks, 'same-seat-refresh-resume-epoch', resumeHello && resumeWelcome && epochAdvanced && !refreshUrlHasCredential ? 'PASS' : 'FAIL', {
      oldEpoch: Number.isFinite(initialEpoch) ? initialEpoch : null,
      resumeEpoch: resumeWelcome?.body?.epoch ?? null,
      resumeHelloEpoch: resumeHello?.body?.epoch ?? null,
      url: sanitizeUrl(page1.url()), queryHasCredential: refreshUrlHasCredential,
      credentialPersistence: 'credential observed only through redacted WSS message summaries'
    });
    const resumedPhases = serverPhases(record.events.slice(resumeMarker), 'P1');
    check(record, checks, 'resume-countdown-and-paused-state', resumedPhases.includes('RESUMING') || resumedPhases.includes('PAUSED') ? 'PASS' : 'UNVERIFIED', {
      observedPhases: resumedPhases
    });

    const offlineMarker = record.events.length;
    await context2.setOffline(true);
    record('offline-enter', { role: 'P2', mechanism: 'BrowserContext.setOffline(true)' });
    await sleep(1200);
    const pausedVisible = await visible(page1.locator('#pause-overlay')) || await visible(page2.locator('#pause-overlay'));
    const pausedSnapshots = record.events.slice(offlineMarker).filter(event => event.type === 'snapshot' && event.phase === 'PAUSED');
    check(record, checks, 'disconnect-freezes-with-pause-surface', pausedVisible && pausedSnapshots.length > 0 ? 'PASS' : 'UNVERIFIED', {
      pausedVisible, pausedSnapshotCount: pausedSnapshots.length
    });
    await context2.setOffline(false);
    record('offline-exit', { role: 'P2', mechanism: 'BrowserContext.setOffline(false)' });
    await waitForCondition(() => record.events.slice(offlineMarker).some(event => event.role === 'P2'
      && event.direction === 'browser-to-server' && event.type === 'hello' && event.mode === 'RESUME'), config.timeoutMs + 2000, 'same-seat RESUME hello after offline', deadline).catch(error => {
      record('reconnect-observation', { observed: false, error: safeText(error?.message) });
    });
    const onlineResume = record.events.slice(offlineMarker).some(event => event.role === 'P2'
      && event.direction === 'browser-to-server' && event.type === 'hello' && event.mode === 'RESUME');
    check(record, checks, 'offline-reconnect-resume', onlineResume ? 'PASS' : 'UNVERIFIED', { observed: onlineResume });
    await sleep(900);

    await page2.setViewportSize(NARROW_VIEWPORT);
    summary.screenshots.push(await capture(page2, evidenceRoot, 'playing-p2-narrow-390x844', record));
    const resultsTimeout = Math.min(22000, Math.max(1000, deadline - Date.now()));
    let resultsObserved = false;
    try {
      await waitForCondition(() => visible(page1.locator('#results-panel')) && visible(page2.locator('#results-panel')), resultsTimeout, 'authoritative result on both browsers', deadline);
      resultsObserved = true;
    } catch (error) {
      record('results-observation', { observed: false, error: safeText(error?.message) });
    }
    if (resultsObserved) {
      summary.phases.push('RESULTS');
      summary.screenshots.push(await capture(page1, evidenceRoot, 'results-p1-1440x900', record));
      summary.screenshots.push(await capture(page2, evidenceRoot, 'results-p2-narrow-390x844', record));
      const resultMessages = record.events.filter(event => event.direction === 'server-to-browser' && event.type === 'result');
      check(record, checks, 'server-confirmed-result-and-frozen-play', resultMessages.length > 0
        && resultMessages.every(event => event.body?.winner === null || ['P1', 'P2'].includes(event.body?.winner)) ? 'PASS' : 'FAIL', {
        resultMessageCount: resultMessages.length,
        reasons: [...new Set(resultMessages.map(event => event.body?.reason).filter(Boolean))]
      });
      await waitForCondition(() => enabled(page1.locator('#rematch-button')) && enabled(page2.locator('#rematch-button')), config.timeoutMs, 'mutual rematch controls', deadline);
      const oldRoundIds = new Set(record.events.filter(event => event.type === 'result').map(event => event.roundId));
      await page1.locator('#rematch-button').click(); record('rematch-clicked', { role: 'P1' });
      await page2.locator('#rematch-button').click(); record('rematch-clicked', { role: 'P2' });
      await waitForCondition(() => visible(page1.locator('#countdown-overlay')) && visible(page2.locator('#countdown-overlay')), config.timeoutMs, 'fresh round COUNTDOWN', deadline);
      summary.phases.push('REMATCH_COUNTDOWN');
      const newRoundSeen = record.events.some(event => event.type === 'snapshot' && event.phase === 'COUNTDOWN'
        && event.roundId && !oldRoundIds.has(event.roundId));
      check(record, checks, 'mutual-rematch-creates-fresh-round', newRoundSeen ? 'PASS' : 'FAIL', { newRoundSeen });
      summary.screenshots.push(await capture(page1, evidenceRoot, 'rematch-countdown-p1-1440x900', record));
    } else {
      check(record, checks, 'server-confirmed-result-and-frozen-play', 'UNVERIFIED', { reason: 'bounded live run did not reach both result surfaces' });
      check(record, checks, 'mutual-rematch-creates-fresh-round', 'UNVERIFIED', { reason: 'result surface was not reached' });
    }

    const credentialLeak = record.events.some(event => JSON.stringify(event).match(/credential|password|secret|authorization/i)
      && JSON.stringify(event).includes('REDACTED') === false);
    check(record, checks, 'credential-free-links-and-trace', credentialLeak ? 'FAIL' : 'PASS', {
      credentialLeak, note: 'Trace body uses key-based redaction and URLs are query-sanitized.'
    });
    summary.serverMessageTypes = record.events.filter(event => event.kind === 'ws-message-forwarded'
      && event.direction === 'server-to-browser').reduce((map, event) => {
        map[event.type] = (map[event.type] ?? 0) + 1;
        return map;
      }, {});
    return summary;
  } finally {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    try { await context1?.close(); } catch (error) { record('cleanup-error', { target: 'context1', error: safeText(error?.message) }); }
    try { await context2?.close(); } catch (error) { record('cleanup-error', { target: 'context2', error: safeText(error?.message) }); }
    const browserExit = await closeBrowserOwned(browser, browserServer, record);
    if (browserExit.pid != null) {
      const owned = receipt.ownedProcesses.find(item => item.pid === browserExit.pid);
      if (owned) Object.assign(owned, { exit: browserExit });
    }
    try {
      await server.close();
      const serverReceipt = receipt.ownedProcesses.find(item => item.role === 'in-process-candidate-server');
      if (serverReceipt) Object.assign(serverReceipt, { exit: { observed: true, inProcessClose: true, pid: process.pid } });
      record('server-stopped', { serverPid: process.pid, exact: true });
    } catch (error) {
      record('cleanup-error', { target: 'in-process-candidate-server', pid: process.pid, error: safeText(error?.message) });
    }
    if (Date.now() > deadline) record('budget', { status: 'EXCEEDED' });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }
  const project = path.resolve(required(args, 'candidate-project'));
  const evidenceRoot = path.resolve(required(args, 'evidence-root'));
  const playwrightRoot = path.resolve(required(args, 'playwright-root'));
  const expectedSha = required(args, 'expected-sha');
  assert(/^[0-9a-f]{40}$/i.test(expectedSha), '--expected-sha must be the immutable v2 40-hex commit SHA');
  const rttMs = numberArg(args, 'rtt-ms', DEFAULT_RTT_MS, 100, 200);
  const jitterMs = numberArg(args, 'jitter-ms', DEFAULT_JITTER_MS, 0, 100);
  const maxSeconds = numberArg(args, 'max-seconds', DEFAULT_MAX_SECONDS, 60, 240);
  const timeoutMs = Math.min(12000, Math.max(3000, Math.round(maxSeconds * 100)));
  await ensureDir(evidenceRoot);

  const startedAtMs = Date.now();
  const deadline = startedAtMs + maxSeconds * 1000;
  const events = [];
  const checks = [];
  const receiptPath = path.join(evidenceRoot, 'process-receipt.json');
  const receipt = {
    status: 'STARTED', conduitPid: process.pid, parentPid: process.ppid,
    startedAt: nowIso(), finishedAt: null, exitCode: null, signal: null,
    ownedProcesses: [], note: 'Only exact task-owned handles/processes may be closed; no name-based cleanup.'
  };
  const persistReceiptSync = () => {
    try { fsSync.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8'); } catch { /* preserve original failure in run result */ }
  };
  process.on('exit', code => {
    receipt.status = 'EXITED';
    receipt.finishedAt = nowIso();
    receipt.exitCode = code;
    persistReceiptSync();
  });
  persistReceiptSync();

  const record = (kind, detail = {}) => {
    const item = { ts: nowIso(), elapsedMs: Date.now() - startedAtMs, kind, ...detail };
    events.push(item);
    if (!['ws-message-scheduled', 'ws-message-forwarded', 'console'].includes(kind)) {
      console.log(`[snake-verifier-v2] ${kind}${detail.status ? ` ${detail.status}` : ''}`);
    }
  };
  record.events = events;

  const result = {
    status: 'MEASUREMENT_PENDING',
    candidateSha: expectedSha,
    observedCandidateSha: gitHead(project),
    baselineSha: BASELINE_SHA,
    startedAt: receipt.startedAt,
    config: {
      project, evidenceRoot, playwrightRoot, rttMs, jitterMs, maxSeconds,
      viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT,
      executablePath: CHROME_PATH, latencyMechanism: 'Playwright 1.56.1 routeWebSocket',
      publicS10: 'BLOCKED_UNLESS_SEPARATE_AUTHORIZED_PUBLIC_HTTPS_WSS_EVIDENCE_IS_SUPPLIED'
    },
    pure: null,
    lifecycle: null,
    browser: null,
    checks,
    fatal: null,
    eventsFile: path.join(evidenceRoot, 'trace-sanitized.json'),
    processReceipt: receiptPath
  };

  try {
    assert(result.observedCandidateSha === expectedSha,
      `candidate SHA mismatch: observed ${result.observedCandidateSha}, expected ${expectedSha}`);
    record('identity', {
      candidateSha: result.observedCandidateSha, baselineSha: result.baselineSha,
      project, conduitPid: process.pid, parentPid: process.ppid
    });
    result.pure = await runPureFixtures(project, record);
    assert(result.pure.passed, 'one or more independent pure fixtures failed');
    await runLifecycleSeamChecks(project, record, checks);
    result.lifecycle = { status: 'MEASURED_PUBLIC_SEAM', checks: checks.filter(item => item.name.includes('epoch') || item.name.includes('interruption') || item.name.includes('expiry') || item.name.includes('old-socket')) };
    result.browser = await browserFlow(project, evidenceRoot, {
      rttMs, jitterMs, playwrightRoot, executablePath: CHROME_PATH, timeoutMs
    }, record, deadline, checks, receipt);
    check(record, checks, 's10-public-https-wss', 'BLOCKED', {
      reason: 'This run intentionally uses an in-process localhost HTTP/WS server; S10 public HTTPS/WSS is not deployed and cannot pass localhost.'
    });
    result.status = 'MEASUREMENT_COMPLETE_WITH_FINDINGS_PENDING_GRADING';
  } catch (error) {
    result.status = 'MEASUREMENT_BLOCKED_OR_INCOMPLETE';
    result.fatal = { message: safeText(error?.message), stack: safeText(error?.stack, 1600) };
    record('fatal', result.fatal);
  } finally {
    result.finishedAt = nowIso();
    result.durationMs = Date.now() - startedAtMs;
    receipt.status = 'FINISHING';
    receipt.finishedAt = result.finishedAt;
    await writeJson(path.join(evidenceRoot, 'trace-sanitized.json'), {
      metadata: {
        candidateSha: result.observedCandidateSha, baselineSha: result.baselineSha,
        rttMs, jitterMs, viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT,
        note: 'All credential-like fields are redacted. This trace is evidence, not a verdict.'
      },
      events
    });
    await writeJson(path.join(evidenceRoot, 'run-result.json'), result);
    await writeJson(receiptPath, receipt);
    console.log(JSON.stringify({
      status: result.status, pure: result.pure?.passed ?? false,
      browser: Boolean(result.browser), fatal: result.fatal?.message ?? null,
      evidenceRoot, conduitPid: process.pid
    }, null, 2));
    if (result.status === 'MEASUREMENT_BLOCKED_OR_INCOMPLETE') process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
