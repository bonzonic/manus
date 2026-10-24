#!/usr/bin/env node
/**
 * Independent verifier conduit for the immutable Snake candidate.
 *
 * This is measurement code, not a verdict and not a product test endpoint.
 * It starts the candidate's existing server in-process, uses two fresh
 * Playwright contexts, forwards real WebSocket traffic with symmetric
 * one-way delay, and writes sanitized evidence. It intentionally does not
 * use page.evaluate, raw CDP, injected client state, bots, or fake results.
 */
import fs from 'node:fs/promises';
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
const DEFAULT_MAX_SECONDS = 120;
const EXPECTED_SHA = 'eebdb1d9408a2002c5971d7c8b4f15ba1f558bed';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') { args.help = true; continue; }
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { args[key] = next; i += 1; } else args[key] = true;
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
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`--${key} must be in [${min}, ${max}]`);
  return value;
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function safeText(value, limit = 260) { return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit); }
function nowIso() { return new Date().toISOString(); }
function fileUrl(file) { return pathToFileURL(path.resolve(file)).href; }
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = /credential|token|authorization|cookie|password|secret/i.test(key) ? '[REDACTED]' : redact(child);
    }
    return result;
  }
  return value;
}
function messageSummary(raw) {
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  try {
    const parsed = JSON.parse(text);
    const body = redact(parsed);
    return {
      encoding: 'json', bytes: Buffer.byteLength(text, 'utf8'), type: body?.type ?? null,
      phase: body?.phase ?? null, requestId: body?.requestId ?? null,
      disposition: body?.disposition ?? null, body
    };
  } catch {
    return { encoding: 'non-json', bytes: Buffer.byteLength(text, 'utf8'), type: null, phase: null, requestId: null, disposition: null, body: '[NON_JSON_REDACTED]' };
  }
}
function clone(value) { return structuredClone(value); }
function sameCell(a, b) { return a?.[0] === b?.[0] && a?.[1] === b?.[1]; }
function assert(condition, message) { if (!condition) throw new Error(message); }
async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }
async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
function gitHead(project) {
  try { return execFileSync('git', ['-C', path.resolve(project, '..'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return null; }
}

function printHelp() {
  console.log(`Independent Snake verifier conduit\n\nRequired:\n  --candidate-project <absolute-path>\n  --evidence-root <absolute-path>\n  --playwright-root <absolute-path>\n\nOptional:\n  --expected-sha <sha>       expected immutable candidate (default ${EXPECTED_SHA})\n  --rtt-ms <100..200>       RTT target, default ${DEFAULT_RTT_MS}\n  --jitter-ms <0..100>      RTT jitter bound, default ${DEFAULT_JITTER_MS}\n  --max-seconds <30..180>   hard bound, default ${DEFAULT_MAX_SECONDS}\n  --headed                  do not use; headless is the default\n  --help\n`);
}

async function importCandidate(project, relative) {
  return import(fileUrl(path.join(project, relative)));
}

async function runPureFixtures(project, record) {
  const fixtureResults = [];
  const run = async (name, fn) => {
    try { await fn(); fixtureResults.push({ name, status: 'PASS' }); record('pure-fixture', { name, status: 'PASS' }); }
    catch (error) { fixtureResults.push({ name, status: 'FAIL', error: safeText(error?.message) }); record('pure-fixture', { name, status: 'FAIL', error: safeText(error?.message) }); }
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
    const state = { board: { w: 4, h: 3 }, snakes: { P1: { body: [[0, 0]] }, P2: { body: [[3, 2]] } }, food: { apples: [{ cell: [1, 1] }], mushrooms: [] } };
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
    const state = createRound({ width: 10, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0, food: { apples: [{ id: 'apple-a', cell: [3, 1] }], mushrooms: [] }, snakes: { P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 }, P2: { body: [[8, 4], [7, 4]], dir: 'LEFT', movementCredit: 0 } } });
    const before = state.snakes.P1.body.length;
    const result = step(state, 1);
    assert(result.state.snakes.P1.body.length === before + 1, 'apple did not add one segment');
    assert(result.state.snakes.P1.apples === 1, 'apple score did not increment once');
    assert(result.events.filter(event => event.kind === 'APPLE_COLLECTED').length === 1, 'apple event count drifted');
  });
  await run('mushroom-boost-refresh-and-pause-freeze', () => {
    const state = createRound({ width: 10, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0, food: { apples: [], mushrooms: [{ id: 'mushroom-a', cell: [3, 1] }] }, snakes: { P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 }, P2: { body: [[8, 4], [7, 4]], dir: 'LEFT', movementCredit: 0 } } });
    const result = step(state, 1);
    assert(result.state.snakes.P1.body.length === 2, 'mushroom changed length');
    assert(result.state.snakes.P1.boostUntilTick === 241, 'boost duration is not 240 ticks');
    const paused = clone(result.state); paused.phase = 'PAUSED';
    const frozen = step(paused, 2);
    assert(JSON.stringify(frozen.state) === JSON.stringify(paused), 'paused step mutated body/boost/time');
  });
  await run('head-swap-and-terminal-pickup-suppression', () => {
    const state = createRound({ width: 8, height: 6, phase: 'PLAYING', appleCount: 0, mushroomCount: 0, food: { apples: [{ id: 'terminal-apple', cell: [3, 1] }], mushrooms: [] }, snakes: { P1: { body: [[1, 1], [2, 1]], dir: 'RIGHT', movementCredit: 54 }, P2: { body: [[4, 1], [3, 1]], dir: 'LEFT', movementCredit: 54 } } });
    const result = step(state, 1);
    assert(result.state.phase === 'RESULTS' && result.state.outcome?.reason === 'HEAD_SWAP', 'head swap was not terminal');
    assert(result.events.length === 0 && result.state.snakes.P1.apples === 0, 'terminal step awarded food');
  });
  await run('protocol-message-size-origin-and-authority-boundary', () => {
    const valid = validate.parseClientMessage(JSON.stringify({ v: 1, type: 'turn', requestId: 't-1', roundId: 'r-1', epoch: 1, seq: 1, dir: 'UP' }));
    assert(valid.type === 'turn', 'valid turn rejected');
    assert(validate.parseClientMessage(JSON.stringify({ v: 1, type: 'turn', requestId: 't-2', roundId: 'r-1', epoch: 1, seq: 2, dir: 'UP', body: [[1, 1]] })) === 'BAD_MESSAGE', 'claimed body accepted');
    assert(validate.parseClientMessage('x'.repeat(4097)) === 'MESSAGE_TOO_LARGE', 'oversized input accepted');
    assert(validate.validateOrigin('http://127.0.0.1', ['http://127.0.0.1']) === true && validate.validateOrigin('https://evil.example', ['http://127.0.0.1']) === false, 'origin boundary drifted');
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
  const passed = fixtureResults.every(item => item.status === 'PASS');
  return { passed, fixtures: fixtureResults };
}

function routeDelayMs(rttMs, jitterMs) {
  return Math.max(0, Math.round(rttMs / 2 + (Math.random() * 2 - 1) * (jitterMs / 2)));
}
function waitForCondition(predicate, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  return (async () => {
    let lastError = '';
    while (Date.now() < deadline) {
      try { if (await predicate()) return true; } catch (error) { lastError = safeText(error?.message); }
      await sleep(80);
    }
    throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError}` : ''}`);
  })();
}
async function locatorText(locator) {
  try { return safeText(await locator.innerText({ timeout: 2000 })); }
  catch { try { return safeText(await locator.textContent({ timeout: 2000 })); } catch { return ''; } }
}
async function visible(locator) { try { return await locator.isVisible({ timeout: 1500 }); } catch { return false; } }
async function enabled(locator) { try { return await locator.isEnabled({ timeout: 1500 }); } catch { return false; } }
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
  record('dom-contract', { role, expected: FROZEN_IDS.length, missing, status: missing.length ? 'FAIL' : 'PASS' });
  return missing;
}
function installDiagnostics(page, role, record) {
  page.on('console', message => record('console', { role, level: message.type(), text: safeText(message.text()) }));
  page.on('pageerror', error => record('page-error', { role, error: safeText(error?.message) }));
  page.on('requestfailed', request => record('request-failed', { role, method: request.method(), url: safeText(request.url(), 500), error: safeText(request.failure()?.errorText) }));
}
async function installLatency(page, role, config, record, timerSet) {
  if (typeof page.routeWebSocket !== 'function') throw new Error('Playwright 1.56 routeWebSocket is unavailable; no CDP/eval substitute is allowed');
  await page.routeWebSocket('**/ws', browserSocket => {
    const serverSocket = browserSocket.connectToServer();
    const forward = (direction, message, send) => {
      const delayMs = routeDelayMs(config.rttMs, config.jitterMs);
      const meta = messageSummary(message);
      record('ws-message-scheduled', { role, direction, delayMs, ...meta });
      const timer = setTimeout(() => {
        timerSet.delete(timer);
        try { send(message); record('ws-message-forwarded', { role, direction, delayMs, ...meta }); }
        catch (error) { record('ws-forward-error', { role, direction, error: safeText(error?.message) }); }
      }, delayMs);
      timerSet.add(timer);
    };
    browserSocket.onMessage(message => forward('browser-to-server', message, value => serverSocket.send(value)));
    serverSocket.onMessage(message => forward('server-to-browser', message, value => browserSocket.send(value)));
    record('ws-route-installed', { role, pattern: '**/ws', rttMs: config.rttMs, jitterMs: config.jitterMs, model: 'symmetric per-message one-way delay using real routeWebSocket forwarding' });
  });
}
function forwarded(events, direction, type, predicate = () => true) {
  return events.some(event => event.kind === 'ws-message-forwarded' && event.direction === direction && event.type === type && predicate(event));
}
async function browserFlow(project, evidenceRoot, config, record, deadline) {
  const [{ createGameServer }, playwright] = await Promise.all([
    importCandidate(project, 'server/index.js'),
    import(fileUrl(path.join(config.playwrightRoot, 'index.mjs')))
  ]);
  assert(typeof playwright.chromium?.launch === 'function', 'Playwright chromium is unavailable');
  const server = createGameServer({ port: 0, host: '127.0.0.1', countdownTicks: 180, allowedOrigins: ['http://127.0.0.1', 'http://localhost'] });
  let browser;
  let context1;
  let context2;
  const timers = new Set();
  const browserSummary = { phases: [], screenshots: [], domFailures: [], inputAckAccepted: false, consoleErrors: [], pageErrors: [], reconnectObserved: false, offlineObserved: false };
  try {
    await server.start();
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/`;
    record('server-started', { baseUrl, port, candidateProject: project });
    browser = await playwright.chromium.launch({ headless: true, executablePath: config.executablePath });
    context1 = await browser.newContext({ viewport: VIEWPORT });
    context2 = await browser.newContext({ viewport: VIEWPORT });
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    installDiagnostics(page1, 'P1', record); installDiagnostics(page2, 'P2', record);
    await installLatency(page1, 'P1', config, record, timers);
    await installLatency(page2, 'P2', config, record, timers);
    const goto = async (page, role) => {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
      record('navigated', { role, url: page.url(), title: safeText(await page.title()) });
      const missing = await checkFrozenDom(page, role, record);
      if (missing.length) browserSummary.domFailures.push({ role, missing });
    };
    await goto(page1, 'P1');
    await goto(page2, 'P2');
    await capture(page1, evidenceRoot, 'p1-entry-1440x900', record);
    await page1.locator('#create-room-button').click({ timeout: config.timeoutMs });
    const roomCodeLocator = page1.locator('#room-code');
    await waitForCondition(async () => /^[A-Z0-9]{8}$/.test(await locatorText(roomCodeLocator)), config.timeoutMs, 'created room code');
    const roomCode = await locatorText(roomCodeLocator);
    record('room-created', { roomCode, linkQueryExpected: `?room=${roomCode}`, linkQueryObserved: page1.url() });
    await waitForCondition(() => visible(page1.locator('#lobby-panel')), config.timeoutMs, 'P1 lobby');
    await capture(page1, evidenceRoot, 'p1-lobby-1440x900', record);
    await page2.locator('#paste-invite-link').click({ timeout: config.timeoutMs });
    await waitForCondition(() => visible(page2.locator('#join-room-panel')), config.timeoutMs, 'P2 join form');
    await page2.locator('#join-room-code').fill(roomCode);
    await page2.locator('#join-room-panel button[type="submit"]').click({ timeout: config.timeoutMs });
    await waitForCondition(() => visible(page2.locator('#lobby-panel')), config.timeoutMs, 'P2 lobby');
    record('room-joined', { role: 'P2', roomCode, selector: '#join-room-panel button[type="submit"]' });
    await capture(page2, evidenceRoot, 'p2-lobby-1440x900', record);
    await waitForCondition(() => enabled(page1.locator('#ready-button')), config.timeoutMs, 'P1 Ready enabled');
    await waitForCondition(() => enabled(page2.locator('#ready-button')), config.timeoutMs, 'P2 Ready enabled');
    await page1.locator('#ready-button').click(); record('ready-clicked', { role: 'P1' });
    await page2.locator('#ready-button').click(); record('ready-clicked', { role: 'P2' });
    await waitForCondition(() => visible(page1.locator('#countdown-overlay')) && visible(page2.locator('#countdown-overlay')), config.timeoutMs, 'shared COUNTDOWN surface');
    browserSummary.phases.push('COUNTDOWN');
    await capture(page1, evidenceRoot, 'countdown-p1-1440x900', record);
    await capture(page2, evidenceRoot, 'countdown-p2-1440x900', record);
    await waitForCondition(async () => (await locatorText(page1.locator('#round-phase'))) === 'PLAYING' && (await locatorText(page2.locator('#round-phase'))) === 'PLAYING', config.timeoutMs + 4000, 'shared PLAYING phase');
    browserSummary.phases.push('PLAYING');
    await capture(page1, evidenceRoot, 'playing-p1-1440x900', record);
    await page1.locator('#arena-focus-target').focus(); await page1.keyboard.press('ArrowUp'); record('keyboard-action', { role: 'P1', key: 'ArrowUp' });
    await page2.locator('#arena-focus-target').focus(); await page2.keyboard.press('ArrowDown'); record('keyboard-action', { role: 'P2', key: 'ArrowDown' });
    await waitForCondition(() => forwarded(record.events, 'browser-to-server', 'turn') && forwarded(record.events, 'server-to-browser', 'inputAck', event => event.disposition === 'ACCEPTED'), config.timeoutMs, 'accepted turn acknowledgement');
    browserSummary.inputAckAccepted = true;
    await page2.setViewportSize(NARROW_VIEWPORT);
    await capture(page2, evidenceRoot, 'playing-p2-narrow-390x844', record);
    await waitForCondition(() => visible(page1.locator('#results-panel')) && visible(page2.locator('#results-panel')), config.timeoutMs + 8000, 'authoritative result on both browsers');
    browserSummary.phases.push('RESULTS');
    await capture(page1, evidenceRoot, 'results-p1-1440x900', record);
    await capture(page2, evidenceRoot, 'results-p2-narrow-390x844', record);
    await waitForCondition(() => enabled(page1.locator('#rematch-button')) && enabled(page2.locator('#rematch-button')), config.timeoutMs, 'mutual rematch controls');
    await page1.locator('#rematch-button').click(); record('rematch-clicked', { role: 'P1' });
    await page2.locator('#rematch-button').click(); record('rematch-clicked', { role: 'P2' });
    await waitForCondition(() => visible(page1.locator('#countdown-overlay')) && visible(page2.locator('#countdown-overlay')), config.timeoutMs, 'fresh round COUNTDOWN');
    browserSummary.phases.push('REMATCH_COUNTDOWN');
    await capture(page1, evidenceRoot, 'rematch-countdown-p1-1440x900', record);
    await context2.setOffline(true); record('offline-enter', { role: 'P2', mechanism: 'BrowserContext.setOffline(true)' });
    await sleep(900);
    browserSummary.offlineObserved = await visible(page1.locator('#pause-overlay')) || await visible(page2.locator('#pause-overlay'));
    await capture(page1, evidenceRoot, 'offline-p1-1440x900', record);
    await context2.setOffline(false); record('offline-exit', { role: 'P2', mechanism: 'BrowserContext.setOffline(false)' });
    await sleep(900);
    record('reconnect-observation', { observed: false, note: 'The browser app exposes no persisted credential/autoreconnect control; no reconnect was fabricated.' });
    browserSummary.serverMessageTypes = record.events.filter(event => event.kind === 'ws-message-forwarded' && event.direction === 'server-to-browser').reduce((map, event) => { map[event.type] = (map[event.type] ?? 0) + 1; return map; }, {});
    browserSummary.route = { baseUrl, rttMs: config.rttMs, jitterMs: config.jitterMs, oneWayModel: 'rtt/2 ± jitter/2', viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT };
    return browserSummary;
  } finally {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    try { await context1?.close(); } catch (error) { record('cleanup-error', { target: 'context1', error: safeText(error?.message) }); }
    try { await context2?.close(); } catch (error) { record('cleanup-error', { target: 'context2', error: safeText(error?.message) }); }
    try { await browser?.close(); } catch (error) { record('cleanup-error', { target: 'browser', error: safeText(error?.message) }); }
    try { await server.close(); record('server-stopped', {}); } catch (error) { record('cleanup-error', { target: 'server', error: safeText(error?.message) }); }
    if (Date.now() > deadline) record('budget', { status: 'EXCEEDED' });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }
  const project = path.resolve(required(args, 'candidate-project'));
  const evidenceRoot = path.resolve(required(args, 'evidence-root'));
  const playwrightRoot = path.resolve(required(args, 'playwright-root'));
  const expectedSha = String(args['expected-sha'] ?? EXPECTED_SHA);
  const rttMs = numberArg(args, 'rtt-ms', DEFAULT_RTT_MS, 100, 200);
  const jitterMs = numberArg(args, 'jitter-ms', DEFAULT_JITTER_MS, 0, 100);
  const maxSeconds = numberArg(args, 'max-seconds', DEFAULT_MAX_SECONDS, 30, 180);
  const timeoutMs = Math.min(12000, Math.max(3000, Math.round(maxSeconds * 100)));
  await ensureDir(evidenceRoot);
  const startedAt = Date.now();
  const deadline = startedAt + maxSeconds * 1000;
  const events = [];
  const record = (kind, detail = {}) => {
    const item = { ts: nowIso(), elapsedMs: Date.now() - startedAt, kind, ...detail };
    events.push(item);
    if (!['ws-message-scheduled', 'ws-message-forwarded', 'console'].includes(kind)) console.log(`[snake-verifier] ${kind}${detail.status ? ` ${detail.status}` : ''}`);
  };
  record.events = events;
  const result = {
    status: 'MEASUREMENT_PENDING', candidateSha: expectedSha, observedCandidateSha: gitHead(project), baselineSha: '0c3155d560692d4042c5fdb7cb6a569cbf4c0cee', startedAt: nowIso(), config: { project, evidenceRoot, playwrightRoot, rttMs, jitterMs, maxSeconds, viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' }, pure: null, browser: null, fatal: null, eventsFile: path.join(evidenceRoot, 'trace-sanitized.json')
  };
  try {
    assert(result.observedCandidateSha === expectedSha, `candidate SHA mismatch: observed ${result.observedCandidateSha}, expected ${expectedSha}`);
    record('identity', { candidateSha: result.observedCandidateSha, baselineSha: result.baselineSha, project });
    result.pure = await runPureFixtures(project, record);
    assert(result.pure.passed, 'one or more independent pure fixtures failed');
    result.browser = await browserFlow(project, evidenceRoot, { rttMs, jitterMs, playwrightRoot, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', timeoutMs }, record, deadline);
    result.status = 'MEASUREMENT_COMPLETE_WITH_FINDINGS_PENDING_GRADING';
  } catch (error) {
    result.status = 'MEASUREMENT_BLOCKED_OR_INCOMPLETE';
    result.fatal = { message: safeText(error?.message), stack: safeText(error?.stack, 1200) };
    record('fatal', result.fatal);
  } finally {
    result.finishedAt = nowIso(); result.durationMs = Date.now() - startedAt;
    await writeJson(path.join(evidenceRoot, 'trace-sanitized.json'), { metadata: { candidateSha: result.observedCandidateSha, baselineSha: result.baselineSha, rttMs, jitterMs, viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT, note: 'All credential-like fields are redacted. This is the verifier event trace, not a verdict.' }, events });
    await writeJson(path.join(evidenceRoot, 'run-result.json'), result);
    console.log(JSON.stringify({ status: result.status, pure: result.pure?.passed ?? false, browser: Boolean(result.browser), fatal: result.fatal?.message ?? null, evidenceRoot }, null, 2));
    if (result.status === 'MEASUREMENT_BLOCKED_OR_INCOMPLETE') process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
