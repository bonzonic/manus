export const SHOPEE_REGIONS = Object.freeze([
  { id: 'my', origin: 'https://shopee.com.my', displayName: 'Shopee Malaysia', currencyLabel: 'MYR' },
]);
const fail = (message) => { throw new Error(message); };
export function normalizeRegion(input) {
  if (!input || typeof input !== 'object') return fail('Shopee region must be selected explicitly');
  const found = SHOPEE_REGIONS.find((r) => r.id === input.id && r.origin === input.origin);
  if (!found) return fail('Shopee region origin is not allowed');
  return { ...found };
}
export function classifyShopeePage({ url, title = '', document } = {}) {
  let parsed; try { parsed = new URL(url); } catch { return { region: null, kind: 'unknown' }; }
  const region = SHOPEE_REGIONS.find((r) => r.origin === parsed.origin) ?? null;
  if (!region) return { region: null, kind: 'unsupported' };
  const path = parsed.pathname.toLowerCase(); const text = `${title} ${document?.title ?? ''}`.toLowerCase();
  return { region, kind: path.includes('/cart') || text.includes('cart') ? 'cart' : path.includes('/product/') ? 'detail' : path.includes('/search') || parsed.search ? 'search' : 'home' };
}
export function extractProductCandidates(snapshot = {}) {
  const cards = Array.isArray(snapshot.productCards) ? snapshot.productCards : [];
  return cards.map((card, index) => ({ itemId: String(card.itemId ?? `rendered-${index}`), label: String(card.label ?? '').trim(), href: String(card.href ?? ''), priceText: String(card.priceText ?? '').trim(), currencyText: String(card.currencyText ?? '').trim(), variants: Array.isArray(card.variants) ? card.variants.map((v) => ({ id: String(v.id ?? ''), label: String(v.label ?? '').trim(), renderedEvidence: String(v.renderedEvidence ?? '').trim() })) : [], fingerprint: String(card.fingerprint ?? `product-${index}`) })).filter((card) => card.label && card.href && card.priceText && card.fingerprint);
}
export function makeCartIntent({ item, variant, control, controlFingerprint, quantity, expected, region } = {}) {
  const normalized = normalizeRegion(region);
  if (!item || !item.itemId || !item.label || !item.href || !item.fingerprint) return fail('Exact cart item evidence is required');
  const exactControlFingerprint = controlFingerprint || control?.fingerprint;
  if (!exactControlFingerprint) return fail('Exact add-to-cart control evidence is required');
  if (!variant || !variant.id || !variant.label) return fail('Exact cart variant/options selection is required');
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) return fail('Cart quantity must be a positive integer');
  if (typeof expected !== 'string' || !expected.trim()) return fail('Expected cart result is required');
  return { regionId: normalized.id, itemId: String(item.itemId), itemLabel: String(item.label), href: String(item.href), variantId: String(variant.id), variantLabel: String(variant.label), quantity, expected: expected.trim(), fingerprint: String(item.fingerprint), controlFingerprint: String(exactControlFingerprint) };
}
export function isCartSensitiveLabel(label = '') { return /checkout|buy\s*now|payment|pay\b|login|sign\s*in|captcha|verification|submit\s*order|purchase/i.test(String(label)); }
