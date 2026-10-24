const VERSION = 1;
const memory = new Map();
const backend = () => globalThis.chrome?.storage?.session;
const valid = (run) => run && run.schemaVersion === VERSION && typeof run.runId === 'string' && typeof run.phase === 'string';
const safeEntry = (entry) => { const out = {}; for (const key of ['ts', 'level', 'event', 'actionType', 'modelId', 'targetLabel', 'status', 'reason']) if (entry?.[key] !== undefined) out[key] = String(entry[key]).slice(0, 300); return out; };
const minimal = (run) => ({ schemaVersion: VERSION, runId: String(run.runId), tabId: Number(run.tabId) || 0, origin: String(run.origin || ''), regionId: String(run.regionId || ''), phase: String(run.phase), stepIndex: Number(run.stepIndex) || 0, generation: Number(run.generation) || 0, activeElapsedMs: Number(run.activeElapsedMs) || 0, modelId: run.modelId ? String(run.modelId) : undefined, log: Array.isArray(run.log) ? run.log.slice(-64).map(safeEntry) : [] });
export function createStore(area = backend()) {
  const target = area;
  return {
    async loadRun() { const value = target ? (await target.get('runState')).runState : memory.get('runState'); return valid(value) ? value : null; },
    async saveRun(run) { if (!valid(run)) throw new Error('Run state is invalid'); const safe = minimal(run); if (JSON.stringify(safe).length > 64 * 1024) throw new Error('Run metadata is too large'); if (target) await target.set({ runState: safe }); else memory.set('runState', structuredClone(safe)); },
    async saveConfig(config) { const safe = { modelId: config?.modelId ?? null, region: config?.region ?? null, apiKey: typeof config?.apiKey === 'string' ? config.apiKey : null }; if (target) await target.set({ modelConfig: safe }); else memory.set('modelConfig', structuredClone(safe)); },
    async loadConfig() { const value = target ? (await target.get('modelConfig')).modelConfig : memory.get('modelConfig'); return value && typeof value === 'object' ? value : null; },
    async clear() { if (target) await target.clear(); else memory.clear(); },
  };
}
export const loadRun = async () => createStore().loadRun();
export const saveRun = async (run) => createStore().saveRun(run);
