import test from 'node:test';
import assert from 'node:assert/strict';
async function moduleOrNull(path) { try { return await import(path); } catch { return null; } }
function requireModule(mod, name) { assert.ok(mod, `${name} implementation is not present yet`); return mod; }

const product = { itemId: '1001', label: 'Black Medium Backpack', href: 'https://shopee.com.my/product/1/1001', priceText: 'RM20', currencyText: 'MYR', variants: [{ id: 'black-medium', label: 'Black / Medium', renderedEvidence: 'Black Medium selected' }], fingerprint: 'card-1001-v1' };

test('regionMustBeExplicitAndOriginChangeInvalidatesRun', async () => {
  const mod = requireModule(await moduleOrNull('../core/shopee.js'), 'Shopee adapter');
  assert.throws(() => mod.normalizeRegion(null));
  const region = mod.normalizeRegion({ id: 'my', origin: 'https://shopee.com.my', displayName: 'Shopee Malaysia', currencyLabel: 'MYR' });
  assert.equal(region.id, 'my');
  assert.throws(() => mod.normalizeRegion({ id: 'sg', origin: 'https://shopee.sg', displayName: 'Shopee Singapore' }), /not allowed/);
});

test('productCandidateRetainsRenderedVariantEvidence', async () => {
  const mod = requireModule(await moduleOrNull('../core/shopee.js'), 'Shopee adapter');
  const candidates = mod.extractProductCandidates({ productCards: [product] });
  assert.equal(candidates[0].variants[0].renderedEvidence, 'Black Medium selected');
  assert.equal(candidates[0].fingerprint, 'card-1001-v1');
});

test('cartRequiresExactItemVariantQuantityApproval', async () => {
  const mod = requireModule(await moduleOrNull('../core/shopee.js'), 'Shopee adapter');
  const intent = mod.makeCartIntent({ item: product, variant: product.variants[0], control: { fingerprint: 'BUTTON||Add to cart|' }, quantity: 2, expected: 'new cart count or confirmation', region: { id: 'my', origin: 'https://shopee.com.my', displayName: 'Shopee Malaysia' } });
  assert.deepEqual(intent, { regionId: 'my', itemId: '1001', itemLabel: 'Black Medium Backpack', href: product.href, variantId: 'black-medium', variantLabel: 'Black / Medium', quantity: 2, expected: 'new cart count or confirmation', fingerprint: 'card-1001-v1', controlFingerprint: 'BUTTON||Add to cart|' });
  assert.throws(() => mod.makeCartIntent({ item: product, variant: null, quantity: 2, expected: 'x', region: { id: 'my', origin: 'https://shopee.com.my', displayName: 'Shopee Malaysia' } }));
});
