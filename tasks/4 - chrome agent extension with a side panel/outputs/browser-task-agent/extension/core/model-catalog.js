export const CATALOG_ENDPOINT = 'https://openrouter.ai/api/v1/models?output_modalities=text&sort=pricing-low-to-high';
export const DEFAULT_BUDGETS = Object.freeze({ inputBudgetTokens: 16000, outputBudgetTokens: 800, minContextTokens: 4096 });
const num = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null; };
const text = (v) => typeof v === 'string' ? v.trim() : '';
const fields = (entry) => [entry?.id, entry?.canonical_slug, entry?.name].map((v) => text(v).toLowerCase());
export function isExcludedModel(entryOrId) {
  const values = typeof entryOrId === 'string' ? [entryOrId.toLowerCase()] : fields(entryOrId);
  for (const value of values) {
    const gpt = value.match(/\bgpt[-_ ]?(\d+(?:\.\d+)?)/i);
    if (gpt && Number(gpt[1]) >= 6) return { excluded: true, reason: 'GPT generation 6 or newer is excluded by policy' };
    const fable = value.match(/\bclaude[-_ ]?fable[-_ ]?(\d+(?:\.\d+)?)/i);
    if (fable && Number(fable[1]) >= 5) return { excluded: true, reason: 'Claude Fable generation 5 or newer is excluded by policy' };
  }
  return { excluded: false };
}
export function isStructuredCapable(entry) { return Array.isArray(entry?.supported_parameters) && (entry.supported_parameters.includes('structured_outputs') || entry.supported_parameters.includes('response_format')); }
export function isEligibleTextModel(entry, policy = {}) {
  if (!entry || typeof entry !== 'object' || !text(entry.id) || isExcludedModel(entry).excluded) return false;
  const now = typeof policy.now === 'function' ? policy.now() : (policy.now ?? Date.now());
  if (entry.expiration_date && Date.parse(entry.expiration_date) <= now) return false;
  const input = entry.architecture?.input_modalities;
  const output = entry.architecture?.output_modalities;
  if (!Array.isArray(input) || !input.includes('text') || !Array.isArray(output) || !output.includes('text')) return false;
  if (!Number.isFinite(Number(entry.context_length)) || Number(entry.context_length) < (policy.minContextTokens ?? DEFAULT_BUDGETS.minContextTokens)) return false;
  const pricing = entry.pricing;
  return !!pricing && num(pricing.prompt) !== null && num(pricing.completion) !== null && num(pricing.request ?? 0) !== null;
}
function normalize(entry) {
  const pricing = { prompt: text(entry.pricing?.prompt), completion: text(entry.pricing?.completion), request: text(entry.pricing?.request ?? '0') };
  return { id: text(entry.id), name: text(entry.name) || text(entry.id), canonical_slug: text(entry.canonical_slug), expiration_date: entry.expiration_date ?? null, architecture: entry.architecture ?? {}, pricing, supported_parameters: Array.isArray(entry.supported_parameters) ? [...entry.supported_parameters] : [], context_length: Number(entry.context_length) || 0, top_provider: entry.top_provider ?? null };
}
export async function loadModelCatalog(fetchFn = globalThis.fetch, { endpoint = CATALOG_ENDPOINT, now = Date.now, fetchTimeoutMs = 10_000 } = {}) {
  if (typeof fetchFn !== 'function') throw new Error('Catalog network is unavailable');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), fetchTimeoutMs);
  try {
    const response = await fetchFn(endpoint, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!response?.ok) throw new Error(`Catalog request failed (${response?.status || 'network'})`);
    const body = await response.json(); const data = Array.isArray(body?.data) ? body.data : [];
    const models = data.map(normalize).filter((entry) => isEligibleTextModel(entry, { now: now() }));
    return { refreshedAt: new Date(now()).toISOString(), models };
  } catch (error) { throw new Error(error?.name === 'AbortError' ? 'Catalog request timed out' : 'Catalog unavailable; select a model explicitly after reconnecting'); }
  finally { clearTimeout(timer); }
}
export function chooseCheapestAllowed(models, { inputBudgetTokens = DEFAULT_BUDGETS.inputBudgetTokens, outputBudgetTokens = DEFAULT_BUDGETS.outputBudgetTokens, minContextTokens = DEFAULT_BUDGETS.minContextTokens, now = Date.now } = {}) {
  const eligible = (Array.isArray(models) ? models : []).filter((m) => isEligibleTextModel(m, { minContextTokens, now })).map((m) => ({ ...m, estimatedCost: Number(m.pricing.prompt) * inputBudgetTokens + Number(m.pricing.completion) * outputBudgetTokens + Number(m.pricing.request ?? 0) }));
  const structured = eligible.filter(isStructuredCapable);
  return (structured.length ? structured : eligible).sort((a, b) => a.estimatedCost - b.estimatedCost || a.id.localeCompare(b.id))[0] ?? null;
}
export function validateSelectedModel(modelId, catalog, policy = {}) {
  const entry = catalog?.models?.find((m) => m.id === modelId);
  if (!entry || !isEligibleTextModel(entry, policy)) throw new Error('Selected model is unavailable or excluded; refresh the live catalog');
  return entry;
}
