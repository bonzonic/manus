import { validateAction } from './contracts.js';
import { isCartSensitiveLabel } from './shopee.js';

const sensitiveWords = /checkout|buy\s*now|payment|pay\b|login|sign\s*in|register|captcha|verification|verify|otp|one[- ]time|submit\s*order|purchase|confirm\s*order|order\s*confirmation|identity|address|contact|phone|mobile|email|password|card|cvv|billing|proceed|continue|confirm|place\s*order|delete|remove|discard|unsubscribe|deactivate|terminate|transfer|publish|irreversible/i;
const cartControl = /add\s*(?:to\s*)?cart|cart\s*add|加入购物车/i;
const stable = (value) => { if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`; if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`; return JSON.stringify(value); };
const targetFor = (snapshot, action) => snapshot?.targets?.find((t) => t.targetId === action?.targetId) ?? null;
const text = (v) => String(v ?? '').trim();
const safeOrigin = (url) => { try { return new URL(url).origin; } catch { return null; } };

function renderedCartEvidence(action, snapshot, run, target) {
  const c = action.cartIntent;
  if (!c || c.regionId !== run?.regionId || c.controlFingerprint !== target?.fingerprint) return false;
  const cards = Array.isArray(snapshot?.productCards) ? snapshot.productCards : [];
  const item = cards.find((p) => p.itemId === c.itemId || p.fingerprint === c.itemId || p.href === c.href);
  if (!item || text(item.label) !== text(c.itemLabel) || text(item.href) !== text(c.href) || text(item.fingerprint) !== text(c.fingerprint)) return false;
  const variants = [...(Array.isArray(item.variants) ? item.variants : []), ...(Array.isArray(snapshot?.selectedOptions) ? snapshot.selectedOptions : [])];
  const variant = variants.find((v) => String(v.id ?? '') === String(c.variantId) && text(v.label) === text(c.variantLabel));
  if (!variant || (variant.renderedEvidence !== undefined && !text(variant.renderedEvidence))) return false;
  const q = snapshot?.quantityEvidence?.value;
  if (!Number.isInteger(q) || q !== c.quantity) return false;
  return true;
}

export function canonicalAction(action, snapshot) { return { action, target: targetFor(snapshot, action) }; }
export function evaluateAction(action, snapshot = {}, run = {}) {
  try { validateAction(action); } catch (error) { return { decision: 'block', reason: error.message }; }
  if (['observe', 'scroll'].includes(action.type)) return { decision: 'allow', reason: 'read-only bounded action' };
  const target = targetFor(snapshot, action);
  if (!target || target.actionable === false) return { decision: 'block', reason: 'target is missing, stale, or not actionable' };
  if (target.nativeDialog === true || target.inputType === 'file') return { decision: 'block', reason: 'native file chooser controls require manual handling' };
  if (target.enabled !== true || target.inViewport !== true) return { decision: 'block', reason: 'target is not visibly rendered and enabled; scroll or invoke again before approval' };
  const label = `${target.label ?? ''} ${target.href ?? ''} ${target.formKind ?? ''} ${target.context ?? ''}`;
  if (target.sensitive || target.sensitiveContext || sensitiveWords.test(label) || isCartSensitiveLabel(label)) return { decision: 'block', reason: 'sensitive checkout, payment, account, identity, contact, verification, or defense control is blocked' };
  if (action.type === 'fill' && (target.inputType === 'password' || target.autocompleteSensitive || target.sensitive)) return { decision: 'block', reason: 'sensitive field entry is blocked' };
  if (action.type === 'fill' && !['search', 'text', 'url', ''].includes(target.inputType ?? '')) return { decision: 'block', reason: 'only simple public text/search fields are supported' };
  const isCart = action.type === 'click' && (target.cartRole === 'add-to-cart' || cartControl.test(target.label ?? ''));
  if (isCart && !action.cartIntent) return { decision: 'block', reason: 'add-to-cart requires exact rendered item, variant, quantity, region, and expected evidence' };
  if (action.cartIntent) {
    const c = action.cartIntent;
    if (!c.itemId || !c.itemLabel || !c.href || !c.variantId || !c.variantLabel || !Number.isInteger(c.quantity) || c.quantity <= 0 || !c.expected || !c.regionId || !c.fingerprint || !c.controlFingerprint) return { decision: 'block', reason: 'exact item, variant, quantity, region, item fingerprint, control fingerprint, and expected result are required' };
    if (!renderedCartEvidence(action, snapshot, run, target)) return { decision: 'block', reason: 'cart intent is not bound to fresh rendered item, option, and quantity evidence' };
  }
  if (action.type === 'click' && target.href) {
    if (safeOrigin(target.href) !== safeOrigin(snapshot?.url) || target.target === '_blank' || target.opensNewTab) return { decision: 'block', reason: 'cross-origin or new-tab navigation requires manual handling' };
  }
  if (action.type === 'click' && !target.publicControl && !target.publicShoppingControl) return { decision: 'block', reason: 'only an explicitly rendered public control may be clicked' };
  return { decision: 'approve', reason: action.type === 'fill' ? 'exact fill approval required' : 'exact click approval required' };
}
export function evidenceMatchesCart(action, snapshot, run) { const target = targetFor(snapshot, action); return !!target && renderedCartEvidence(action, snapshot, run, target); }
export async function approvalDigest(run, action, snapshot) {
  const payload = stable({ runId: run?.runId, stepIndex: run?.stepIndex, tabId: run?.tabId, origin: run?.origin, regionId: run?.regionId, documentNonce: snapshot?.documentNonce, snapshotId: snapshot?.snapshotId, url: snapshot?.url, ...canonicalAction(action, snapshot) });
  const bytes = new TextEncoder().encode(payload);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export async function approvalMatches(run, action, snapshot, approval) { return !!approval?.approved && approval.digest === await approvalDigest(run, action, snapshot); }
export { ValidationError } from './contracts.js';
