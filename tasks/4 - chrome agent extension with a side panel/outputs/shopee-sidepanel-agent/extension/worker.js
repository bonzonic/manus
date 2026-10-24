import { normalizeRegion } from './core/shopee.js';
import { loadModelCatalog, chooseCheapestAllowed } from './core/model-catalog.js';
import { propose } from './core/model.js';
import { createStore } from './core/store.js';
import { createRunLogger } from './core/logger.js';
import { advanceRun, approvePending, dispatchApproved, pauseRun, cancelRun, validateFinishEvidence } from './core/engine.js';
import { installPanelStartup } from './core/startup.js';
import { admitSnapshot } from './core/admission.js';

const store = createStore();
let config = { region: null, modelId: null, catalog: null, apiKey: null };
let run = null;
const logger = createRunLogger({});
const log = (event, fields = {}) => { logger.add({ event, ...fields }); if (run) run.log = logger.entries(); };
const safeOrigin = (url) => { try { return new URL(url).origin; } catch { return null; } };
const responseState = () => ({ config: { region: config.region, modelId: config.modelId, catalog: config.catalog ? { refreshedAt: config.catalog.refreshedAt, models: config.catalog.models } : null, keyConfigured: Boolean(config.apiKey) }, run: run ? { schemaVersion: run.schemaVersion, runId: run.runId, tabId: run.tabId, origin: run.origin, regionId: run.regionId, phase: run.phase, stepIndex: run.stepIndex, pendingAction: run.pendingAction ?? null, approval: run.approval ? { digest: run.approval.digest, approved: Boolean(run.approval.approved) } : null, result: run.result ? { status: run.result.status } : null, log: logger.entries() } : null });
const resetState = async () => { await store.clear(); config = { region: null, modelId: null, catalog: null, apiKey: null }; run = null; logger.clear(); };
const sessionReady = (async () => {
  const area = globalThis.chrome?.storage?.session;
  try {
    await area?.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' });
    const saved = await store.loadConfig();
    if (saved) { config = { region: saved.region ? normalizeRegion(saved.region) : null, modelId: saved.modelId || null, catalog: null, apiKey: typeof saved.apiKey === 'string' ? saved.apiKey : null }; }
    const stale = await store.loadRun();
    if (stale) { run = { ...stale, phase: 'INTERRUPTED', pendingAction: null, approval: null, result: { status: 'interrupted' } }; log('interrupted', { status: 'interrupted', reason: 'Worker restarted; raw intent and page context were discarded; start a new run' }); }
  } catch { config = { region: null, modelId: null, catalog: null, apiKey: null }; run = null; }
})();
globalThis.chrome?.runtime?.onStartup?.addListener?.(resetState);
globalThis.chrome?.runtime?.onInstalled?.addListener?.(resetState);
async function bridgeCall(tabId, command) {
  if (!chrome?.scripting?.executeScript) throw new Error('Scoped page access is unavailable; invoke the extension from the target tab');
  await chrome.scripting.executeScript({ target: { tabId, frameIds: [0] }, files: ['bridge.js'] });
  const results = await chrome.scripting.executeScript({ target: { tabId, frameIds: [0] }, func: (value) => globalThis.__SHOPEE_AGENT_BRIDGE__?.[value.kind]?.(value.arg), args: [{ kind: command.type === 'observe' ? 'observe' : 'execute', arg: command.type === 'observe' ? command.intent ?? '' : command }] });
  return results?.[0]?.result ?? { status: 'unknown', evidence: ['bridge returned no result'] };
}
async function activeTab() { const tabs = await chrome.tabs.query({ active: true, currentWindow: true }); return tabs?.[0] ?? null; }
async function handle(message, sender) {
  await sessionReady;
  switch (message?.type) {
    case 'GET_STATE': return responseState();
    case 'CONFIGURE_MODEL': {
      if (message.region) config.region = normalizeRegion(message.region);
      config.apiKey = typeof message.apiKey === 'string' && message.apiKey.length ? message.apiKey : config.apiKey;
      config.modelId = typeof message.modelId === 'string' ? message.modelId : config.modelId;
      await store.saveConfig(config);
      log('settings-updated'); return responseState();
    }
    case 'LOAD_CATALOG': {
      config.catalog = await loadModelCatalog(fetch);
      const cheap = chooseCheapestAllowed(config.catalog.models, {}); if (!config.modelId && cheap) config.modelId = cheap.id;
      log('catalog-refreshed', { modelId: config.modelId, reason: `${config.catalog.models.length} eligible text-chat models; live prices and capability labels shown` }); return responseState();
    }
    case 'START': {
      if (run?.phase === 'INTERRUPTED') throw new Error('Previous run was interrupted; start a fresh run and re-approve every action');
      const tab = sender?.tab ?? await activeTab(); if (!tab?.id || !tab.url) throw new Error('No authorized active tab is available');
      let parsed; try { parsed = new URL(tab.url); } catch { throw new Error('Invoke on a valid ordinary HTTP(S) tab'); }
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('Browser Task Agent supports ordinary HTTP(S) tabs only; open a normal web page and invoke again');
      const snapshot = await bridgeCall(tab.id, { type: 'observe', intent: message.intent });
      const admission = admitSnapshot(snapshot, parsed.origin);
      if (!admission.ok) throw new Error(admission.reason);
      run = { schemaVersion: 1, runId: crypto.randomUUID(), tabId: tab.id, origin: parsed.origin, regionId: config.region?.id ?? null, phase: 'PLANNING', stepIndex: 0, generation: 1, activeElapsedMs: 0, intent: String(message.intent ?? '').slice(0, 2000), snapshot, plan: [], log: [] };
      log('observe', { status: 'verified', targetLabel: parsed.origin }); await store.saveRun(run); return responseState();
    }
    case 'RUN_PLAN': if (!run) throw new Error('Start a run first'); run.plan = Array.isArray(message.plan) ? message.plan.slice(0, 8) : []; run.phase = 'RUNNING'; log('plan-ready', { status: 'running' }); return responseState();
    case 'ADVANCE': {
      if (!run || !config.catalog || !config.modelId || !config.apiKey) throw new Error('Configure a session key, live catalog, and permitted text model first');
      if (run.phase === 'AWAITING_APPROVAL') return responseState();
      let currentSnapshot = null; try { currentSnapshot = await bridgeCall(run.tabId, { type: 'observe', intent: run.intent }); } catch {}
      const admission = admitSnapshot(currentSnapshot, run.origin);
      if (!admission.ok) { run.phase = 'NEEDS_USER'; run.result = { status: 'blocked', evidence: [admission.reason] }; log('pre-model-admission', { status: 'blocked', reason: admission.reason }); await store.saveRun(run); return responseState(); }
      run.snapshot = currentSnapshot;
      const proposal = await propose({ intent: run.intent, plan: run.plan, snapshot: run.snapshot, results: run.results ?? [], model: config.modelId, apiKey: config.apiKey, catalog: config.catalog });
      if (proposal.type === 'finish') {
        let fresh = null; try { fresh = await bridgeCall(run.tabId, { type: 'observe', intent: run.intent }); } catch { fresh = null; }
        const check = validateFinishEvidence(proposal, { snapshotId: fresh?.snapshotId, results: run.results });
        if (!fresh || safeOrigin(fresh.url) !== run.origin || !check.valid) {
          run.phase = 'NEEDS_USER'; run.result = { status: 'blocked', evidence: ['finish evidence did not bind to a fresh same-origin observation or known action result'] }; log('finish-rejected', { status: 'blocked', modelId: config.modelId }); await store.saveRun(run); return responseState();
        }
        run.snapshot = fresh; run.phase = 'PARTIAL'; run.result = { status: 'partial', evidenceRefs: [...proposal.evidenceRefs], evidence: ['finish references matched fresh observed evidence; completion remains user-confirmed'] }; log('finish-requested', { status: 'partial', modelId: config.modelId }); await store.saveRun(run); return responseState();
      }
      if (proposal.type === 'ask') { run.phase = 'NEEDS_USER'; run.result = { status: 'needs-user', evidence: [proposal.question] }; return responseState(); }
      if (proposal.type === 'plan') { run.plan = proposal.steps; return responseState(); }
      run = await advanceRun(run, proposal, { snapshot: run.snapshot, save: store.saveRun.bind(store), execute: (action) => bridgeCall(run.tabId, action), observe: () => bridgeCall(run.tabId, { type: 'observe', intent: run.intent }) });
      if (run.snapshot?.url && new URL(run.snapshot.url).origin !== run.origin) { run.phase = 'NEEDS_USER'; run.result = { status: 'blocked', evidence: ['origin changed; invoke again on the new explicit HTTP(S) tab'] }; }
      log(proposal.action.type, { status: run.phase, modelId: config.modelId, targetLabel: proposal.action.targetId }); await store.saveRun(run); return responseState();
    }
    case 'APPROVE': if (!run) throw new Error('No pending action'); run = await approvePending(run, message.digest); if (run.approval?.approved) run = await dispatchApproved(run, { execute: (action) => bridgeCall(run.tabId, action), observe: () => bridgeCall(run.tabId, { type: 'observe', intent: run.intent }) }); log('approval/action', { status: run.result?.status ?? run.phase, targetLabel: run.pendingAction?.targetId }); await store.saveRun(run); return responseState();
    case 'PAUSE': run = pauseRun(run); log('paused', { status: 'paused' }); return responseState();
    case 'RESUME': if (run?.phase === 'PAUSED') { run.phase = 'RUNNING'; run.approval = null; run.pendingAction = null; if (run.tabId) run.snapshot = await bridgeCall(run.tabId, { type: 'observe', intent: run.intent }); log('resumed', { status: 'running' }); } return responseState();
    case 'CANCEL': run = cancelRun(run); log('cancelled', { status: 'cancelled' }); await store.saveRun(run); return responseState();
    case 'CLEAR_SESSION': await resetState(); return responseState();
    case 'EXPORT_LOG': return { json: logger.exportJson() };
    default: throw new Error('Unsupported message');
  }
}
chrome?.runtime?.onMessage?.addListener((message, sender, sendResponse) => { handle(message, sender).then(sendResponse).catch((error) => sendResponse({ error: error?.message || 'Operation failed', ...responseState() })); return true; });
installPanelStartup(chrome, (error) => log('startup-failure', { status: 'blocked', reason: error?.message || 'Side Panel startup failed' }));
