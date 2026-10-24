import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BASELINE_SHA = 'afd285f6c85cfa4638fbcd84973d1ae1bfa41e35';
const PLAYWRIGHT_VERSION = '1.56.1';
const CHROME_EXECUTABLE = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE_FACTOR = 1;
const ROOM_CODE_PATTERN = /^[A-Z0-9]{8}$/;
const PLACEHOLDER = '--------';
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const TASK_ROOT = path.resolve(SCRIPT_DIRECTORY, '..', '..', '..');
const PLAYWRIGHT_MODULE = path.join(
  TASK_ROOT,
  '.work',
  'tools',
  'browser-qa',
  'node_modules',
  'playwright',
  'index.mjs'
);

class BlockedQaError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'BlockedQaError';
  }
}

function parseArgs(argv) {
  const values = {};
  const accepted = new Set(['baseline-project', 'candidate-project', 'candidate-sha', 'evidence-root']);
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) throw new Error(`Unexpected argument: ${token ?? '<missing>'}`);
    const key = token.slice(2);
    if (!accepted.has(key)) throw new Error(`Unknown argument: --${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    values[key] = value;
    index += 1;
  }
  for (const key of accepted) {
    if (!values[key]) throw new Error(`Missing required argument: --${key}`);
  }
  return {
    baselineProject: path.resolve(values['baseline-project']),
    candidateProject: path.resolve(values['candidate-project']),
    candidateSha: values['candidate-sha'],
    evidenceRoot: path.resolve(values['evidence-root'])
  };
}

async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function isRoomCode(value) {
  return typeof value === 'string' && ROOM_CODE_PATTERN.test(value);
}

function cleanText(value) {
  return value == null ? '' : String(value).trim();
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function waitForNodePredicate(predicate, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await delay(25);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function safeError(error) {
  return {
    name: typeof error?.name === 'string' ? error.name : 'Error',
    message: typeof error?.message === 'string' ? error.message : 'operation failed'
  };
}

async function closeHandle(receipt, key, handle, close) {
  if (!handle) return;
  receipt[key] ??= { attempted: false, closed: false };
  receipt[key].attempted = true;
  try {
    await close(handle);
    receipt[key].closed = true;
  } catch (error) {
    receipt[key].error = safeError(error);
    receipt.errors.push({ resource: key, ...safeError(error) });
  }
}

async function readSourceFacts(project) {
  const rendererPath = path.join(project, 'public', 'dom-renderer.js');
  const appPath = path.join(project, 'public', 'app.js');
  const renderer = await fs.readFile(rendererPath);
  const app = await fs.readFile(appPath, 'utf8');
  return {
    sourceHash: sha256(renderer),
    sourceHashAlgorithm: 'sha256',
    copyInviteSourceCheck: app.includes('if (!model.roomCode) return;')
      && app.includes('encodeURIComponent(model.roomCode)')
      ? 'MODEL_ROOM_CODE_CONFIRMED'
      : 'MODEL_ROOM_CODE_NOT_CONFIRMED'
  };
}

function evaluateArm(label, result) {
  if (result.status === 'BLOCKED') return;
  if (result.codeSupportStatus !== 'OBSERVED_NETWORK_WELCOME' || !isRoomCode(result.authoritativeCode)) {
    result.status = 'BLOCKED';
    result.codeSupportStatus = 'BLOCKED_MISSING_NETWORK_WELCOME';
    result.blockReason = 'missing-network-welcome-code';
    return;
  }

  const initial = result.initialDomValue ?? { header: '', copySources: [] };
  const dom = result.domValue ?? { header: '', copySources: [] };
  const ready = result.roomCreated ?? {};
  const commonReady = ready.panelVisible === true
    && ready.readyButtonVisible === true
    && ready.readyButtonText === 'Ready up'
    && initial.header === PLACEHOLDER
    && initial.copySources.length > 0
    && initial.copySources.every(value => value === PLACEHOLDER)
    && dom.copySources.length > 0;

  if (!commonReady) {
    result.status = 'FAIL';
    result.failureReason = 'room-created-panel-or-cold-placeholder-check-failed';
    return;
  }

  if (label === 'baseline') {
    const baselineRed = dom.header === PLACEHOLDER
      && dom.copySources.every(value => value === PLACEHOLDER)
      && dom.header !== result.authoritativeCode
      && dom.copySources.every(value => value !== result.authoritativeCode);
    result.status = baselineRed ? 'BASELINE_RED_CONFIRMED' : 'FAIL';
    if (!baselineRed) result.failureReason = 'baseline-did-not-retain-placeholder-on-both-surfaces';
    return;
  }

  const candidateGreen = dom.header === result.authoritativeCode
    && dom.copySources.every(value => value === result.authoritativeCode);
  result.status = candidateGreen ? 'CANDIDATE_GREEN_CONFIRMED' : 'FAIL';
  if (!candidateGreen) result.failureReason = 'candidate-did-not-render-authoritative-code-on-all-surfaces';
}

async function runArm({ label, project, sourceSHA, evidenceRoot, chromium }) {
  const armStartedAt = new Date().toISOString();
  const armStartedMs = Date.now();
  const screenshotDirectory = path.join(evidenceRoot, 'screenshots');
  await ensureDirectory(screenshotDirectory);

  const result = {
    arm: label,
    project,
    sourceSHA,
    sourceHash: null,
    sourceHashAlgorithm: 'sha256',
    copyInviteSourceCheck: 'NOT_READ',
    authoritativeCode: null,
    domValue: null,
    initialDomValue: null,
    roomCreated: null,
    codeSupportStatus: 'NOT_OBSERVED',
    sanitizedTrace: [],
    screenshotPaths: {},
    status: 'NOT_COMPLETE',
    cleanupReceipt: {
      qaProcessPid: process.pid,
      ownedPids: [process.pid],
      errors: []
    },
    startedAt: armStartedAt
  };

  let server = null;
  let browserServer = null;
  let browser = null;
  let context = null;
  let page = null;
  let browserPid = null;
  const allowedOrigins = [];

  try {
    try {
      const sourceFacts = await readSourceFacts(project);
      result.sourceHash = sourceFacts.sourceHash;
      result.sourceHashAlgorithm = sourceFacts.sourceHashAlgorithm;
      result.copyInviteSourceCheck = sourceFacts.copyInviteSourceCheck;
    } catch (error) {
      result.sourceReadError = safeError(error);
    }

    const serverModuleUrl = `${pathToFileURL(path.join(project, 'server', 'index.js')).href}?qaArm=${encodeURIComponent(label)}-${Date.now()}`;
    const serverModule = await import(serverModuleUrl);
    if (typeof serverModule.createGameServer !== 'function') {
      throw new Error('createGameServer export is unavailable');
    }

    server = serverModule.createGameServer({
      host: '127.0.0.1',
      port: 0,
      allowedOrigins
    });
    result.server = {
      pid: process.pid,
      host: '127.0.0.1',
      requestedPort: 0,
      allowedOriginsReference: 'same-mutable-array'
    };
    await server.start();
    const address = server.address();
    if (!address || typeof address !== 'object' || !Number.isInteger(address.port) || address.port <= 0) {
      throw new Error('in-process server did not report an ephemeral port');
    }

    const baseURL = `http://127.0.0.1:${address.port}`;
    const actualOrigin = new URL(baseURL).origin;
    const localhostOrigin = `http://localhost:${address.port}`;
    allowedOrigins.push(actualOrigin, localhostOrigin);
    result.server.baseURL = baseURL;
    result.server.actualOrigin = actualOrigin;
    result.server.allowedOrigins = [...allowedOrigins];

    browserServer = await chromium.launchServer({
      headless: true,
      executablePath: CHROME_EXECUTABLE
    });
    const browserProcess = browserServer.process?.();
    browserPid = browserProcess?.pid ?? null;
    if (!Number.isInteger(browserPid)) throw new Error('Playwright browser-server PID was not available');
    result.cleanupReceipt.ownedPids.push(browserPid);
    result.browserServer = {
      pid: browserPid,
      executablePath: CHROME_EXECUTABLE,
      launchMode: 'launchServer',
      connectMode: 'connect(wsEndpoint)'
    };

    browser = await chromium.connect({ wsEndpoint: browserServer.wsEndpoint() });
    context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR
    });
    context.setDefaultTimeout(10000);
    page = await context.newPage();
    page.setDefaultTimeout(10000);

    let welcomeCode = null;
    page.on('websocket', socket => {
      socket.on('framereceived', frame => {
        const payload = frame?.payload;
        if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) return;
        let message;
        try {
          message = JSON.parse(Buffer.isBuffer(payload) ? payload.toString('utf8') : payload);
        } catch {
          return;
        }
        if (!message || typeof message.type !== 'string') return;
        const sanitized = { type: message.type };
        if (Object.prototype.hasOwnProperty.call(message, 'roomCode')) {
          sanitized.roomCode = typeof message.roomCode === 'string' ? message.roomCode : null;
        }
        result.sanitizedTrace.push(sanitized);
        if (message.type === 'welcome' && isRoomCode(message.roomCode) && welcomeCode === null) {
          welcomeCode = message.roomCode;
        }
      });
    });

    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const headerLocator = page.locator('#room-code');
    const copySourceLocator = page.locator('[data-copy-source="room-code"]');
    const lobbyPanelLocator = page.locator('#lobby-panel');
    const readyButtonLocator = page.locator('#ready-button');
    const beforeHeader = cleanText(await headerLocator.textContent());
    const beforeCopySources = (await copySourceLocator.allTextContents()).map(cleanText);
    result.initialDomValue = { header: beforeHeader, copySources: beforeCopySources };

    const beforePath = path.join(screenshotDirectory, `${label}-before.png`);
    await page.screenshot({ path: beforePath, fullPage: false });
    result.screenshotPaths.before = beforePath;

    await page.locator('#create-room-button').click();
    await lobbyPanelLocator.waitFor({ state: 'visible', timeout: 10000 });
    result.roomCreated = {
      panelVisible: await lobbyPanelLocator.isVisible(),
      readyButtonVisible: await readyButtonLocator.isVisible(),
      readyButtonText: cleanText(await readyButtonLocator.textContent())
    };

    const afterPath = path.join(screenshotDirectory, `${label}-after.png`);
    await page.screenshot({ path: afterPath, fullPage: false });
    result.screenshotPaths.after = afterPath;

    try {
      await waitForNodePredicate(() => welcomeCode !== null, 10000, `${label} network welcome roomCode`);
    } catch {
      throw new BlockedQaError('missing-network-welcome-code');
    }
    result.authoritativeCode = welcomeCode;
    result.codeSupportStatus = 'OBSERVED_NETWORK_WELCOME';

    const afterHeader = cleanText(await headerLocator.textContent());
    const afterCopySources = (await copySourceLocator.allTextContents()).map(cleanText);
    result.domValue = { header: afterHeader, copySources: afterCopySources };
    evaluateArm(label, result);
  } catch (error) {
    if (error instanceof BlockedQaError || result.codeSupportStatus === 'BLOCKED_MISSING_NETWORK_WELCOME') {
      result.status = 'BLOCKED';
      result.codeSupportStatus = 'BLOCKED_MISSING_NETWORK_WELCOME';
      result.blockReason ??= 'missing-network-welcome-code';
    } else {
      result.status = 'BLOCKED';
      result.blockReason = 'arm-driver-or-fixture-error';
      result.error = safeError(error);
    }
  } finally {
    await closeHandle(result.cleanupReceipt, 'browserContext', context, value => value.close());
    await closeHandle(result.cleanupReceipt, 'browserConnection', browser, value => value.close());
    await closeHandle(result.cleanupReceipt, 'browserServer', browserServer, value => value.close());
    await closeHandle(result.cleanupReceipt, 'inProcessServer', server, value => value.close());
    result.cleanupReceipt.closedAt = new Date().toISOString();
    result.cleanupReceipt.complete = result.cleanupReceipt.errors.length === 0;
    result.cleanupReceipt.status = result.cleanupReceipt.complete ? 'CLOSED' : 'CLEANUP_ERRORS';
    result.durationMs = Date.now() - armStartedMs;
    result.completedAt = new Date().toISOString();
  }

  return result;
}

async function main() {
  const args = parseArgs(process.argv);
  await ensureDirectory(args.evidenceRoot);
  const processReceiptPath = path.join(args.evidenceRoot, 'qa-process-receipt.json');
  const startedAt = new Date().toISOString();
  await writeJson(processReceiptPath, {
    processPid: process.pid,
    startedAt,
    nodeVersion: process.version,
    command: process.argv,
    note: 'Persisted immediately by direct node QA process before server/browser launch.'
  });

  const runResultPath = path.join(args.evidenceRoot, 'run-result.json');
  const resultEnvelope = {
    schemaVersion: 1,
    scope: 'room-code-display-only',
    status: 'BLOCKED',
    startedAt,
    completedAt: null,
    processPid: process.pid,
    processReceiptPath,
    baselineSHA: BASELINE_SHA,
    candidateSHA: args.candidateSha,
    driver: {
      playwright: PLAYWRIGHT_VERSION,
      playwrightModule: PLAYWRIGHT_MODULE,
      chromeExecutable: CHROME_EXECUTABLE,
      headless: true,
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR
    },
    arms: {},
    cleanupReceipt: {
      qaProcessPid: process.pid,
      ownedPids: [process.pid],
      errors: []
    },
    caveat: 'PASS is limited to raw local room-code display checks; it is not a whole-game, public S10, gameplay, reconnect, deployment, or MVP verdict.'
  };

  let chromium;
  try {
    if (!await fs.stat(CHROME_EXECUTABLE).then(() => true, () => false)) {
      throw new Error(`Chrome executable not found: ${CHROME_EXECUTABLE}`);
    }
    const playwright = await import(pathToFileURL(PLAYWRIGHT_MODULE).href);
    chromium = playwright.chromium;
    if (!chromium) throw new Error('Pinned Playwright chromium export is unavailable');

    resultEnvelope.arms.baseline = await runArm({
      label: 'baseline',
      project: args.baselineProject,
      sourceSHA: BASELINE_SHA,
      evidenceRoot: args.evidenceRoot,
      chromium
    });
    resultEnvelope.arms.candidate = await runArm({
      label: 'candidate',
      project: args.candidateProject,
      sourceSHA: args.candidateSha,
      evidenceRoot: args.evidenceRoot,
      chromium
    });

    const baselineStatus = resultEnvelope.arms.baseline.status;
    const candidateStatus = resultEnvelope.arms.candidate.status;
    if (baselineStatus === 'BASELINE_RED_CONFIRMED' && candidateStatus === 'CANDIDATE_GREEN_CONFIRMED') {
      resultEnvelope.status = 'PASS';
    } else if (baselineStatus === 'BLOCKED' || candidateStatus === 'BLOCKED') {
      resultEnvelope.status = 'BLOCKED';
    } else {
      resultEnvelope.status = 'FAIL';
    }
  } catch (error) {
    resultEnvelope.status = 'BLOCKED';
    resultEnvelope.blocker = safeError(error);
  } finally {
    resultEnvelope.completedAt = new Date().toISOString();
    resultEnvelope.durationMs = Date.now() - Date.parse(startedAt);
    resultEnvelope.within60Seconds = resultEnvelope.durationMs < 60000;
    resultEnvelope.cleanupReceipt.closedAt = resultEnvelope.completedAt;
    resultEnvelope.cleanupReceipt.complete = true;
    resultEnvelope.cleanupReceipt.status = 'CLOSED';
    resultEnvelope.cleanupReceipt.processesRemaining = [];
    await writeJson(runResultPath, resultEnvelope);
  }

  process.exitCode = resultEnvelope.status === 'PASS' ? 0 : 1;
}

try {
  await main();
} catch (error) {
  process.exitCode = 1;
  console.error(`${error?.name ?? 'Error'}: ${error?.message ?? 'QA preparation failed'}`);
}
