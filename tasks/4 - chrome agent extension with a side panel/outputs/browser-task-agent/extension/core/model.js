import { validateSelectedModel } from './model-catalog.js';
import { validateProposal } from './contracts.js';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const safeError = (status) => status === 401 ? 'OpenRouter authentication failed (401)' : status === 402 ? 'OpenRouter credit limit rejected the request (402)' : status === 429 ? 'OpenRouter rate limit reached (429)' : `OpenRouter request failed (${status || 'network'})`;
const bounded = (value, max) => String(value ?? '').replace(/\s+/g, ' ').slice(0, max);
const boundedRenderedEvidence = (snapshot = {}) => ({
  productCards: (Array.isArray(snapshot.productCards) ? snapshot.productCards : []).slice(0, 24).map((card) => ({
    itemId: bounded(card?.itemId, 160),
    label: bounded(card?.label, 240),
    href: bounded(card?.href, 2048),
    priceText: bounded(card?.priceText, 120),
    currencyText: bounded(card?.currencyText, 20),
    fingerprint: bounded(card?.fingerprint, 500),
    variants: (Array.isArray(card?.variants) ? card.variants : []).slice(0, 24).map((variant) => ({
      id: bounded(variant?.id, 100), label: bounded(variant?.label, 240), renderedEvidence: bounded(variant?.renderedEvidence, 160),
    })),
  })),
  selectedOptions: (Array.isArray(snapshot.selectedOptions) ? snapshot.selectedOptions : []).slice(0, 24).map((option) => ({
    id: bounded(option?.id, 100), label: bounded(option?.label, 240), renderedEvidence: bounded(option?.renderedEvidence, 160),
  })),
  quantityEvidence: Number.isInteger(snapshot?.quantityEvidence?.value)
    ? { value: snapshot.quantityEvidence.value, source: bounded(snapshot.quantityEvidence.source, 120) }
    : null,
  cartEvidence: {
    fingerprint: bounded(snapshot?.cartEvidence?.fingerprint, 500),
    messages: (Array.isArray(snapshot?.cartEvidence?.messages) ? snapshot.cartEvidence.messages : []).slice(0, 20).map((message) => bounded(message, 300)),
  },
});
export async function propose({ intent, plan, snapshot, results, model, apiKey, catalog, fetchFn = globalThis.fetch }, signal) {
  if (typeof apiKey !== 'string' || apiKey.length < 8) throw new Error('OpenRouter key is missing or too short');
  const selected = validateSelectedModel(model, catalog, {});
  if (typeof fetchFn !== 'function') throw new Error('Provider network is unavailable');
  const messages = [
    { role: 'system', content: 'Return exactly one JSON object of type plan, act, ask, or finish for a bounded public web page. Allowed action types are observe, scroll, click, fill and model output may use observed target IDs only. Never request checkout, payment, login, identity, CAPTCHA, secrets, arbitrary code, selectors, coordinates, URLs, or alternate endpoints.' },
    { role: 'user', content: JSON.stringify({ intent: String(intent ?? '').slice(0, 2000), plan: Array.isArray(plan) ? plan.slice(0, 8) : [], renderedPage: { url: String(snapshot?.url ?? '').slice(0, 2048), title: String(snapshot?.title ?? '').slice(0, 500), text: String(snapshot?.text ?? '').slice(0, 16000), targets: Array.isArray(snapshot?.targets) ? snapshot.targets.slice(0, 80) : [], ...boundedRenderedEvidence(snapshot) }, priorResults: Array.isArray(results) ? results.slice(-8) : [] }) }
  ];
  const body = { model: selected.id, messages, stream: false, max_tokens: 800 };
  if (selected.supported_parameters?.includes('structured_outputs') || selected.supported_parameters?.includes('response_format')) body.response_format = { type: 'json_object' };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20_000); const onAbort = () => controller.abort(); signal?.addEventListener?.('abort', onAbort, { once: true });
  try {
    const response = await fetchFn(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    if (!response?.ok) throw new Error(safeError(response?.status));
    let payload; try { payload = await response.json(); } catch { throw new Error('OpenRouter returned malformed JSON'); }
    const content = payload?.choices?.[0]?.message?.content;
    let value; try { value = typeof content === 'string' ? JSON.parse(content) : content; } catch { throw new Error('OpenRouter proposal JSON is invalid'); }
    return validateProposal(value);
  } catch (error) { if (error?.message?.startsWith('OpenRouter')) throw error; throw new Error(error?.name === 'AbortError' ? 'OpenRouter request timed out' : 'OpenRouter returned an invalid proposal'); }
  finally { clearTimeout(timer); signal?.removeEventListener?.('abort', onAbort); }
}
export { ENDPOINT };
