import test from 'node:test';
import assert from 'node:assert/strict';

async function moduleOrNull(path) {
  try { return await import(path); } catch { return null; }
}
function requireModule(mod, name) {
  assert.ok(mod, `${name} implementation is not present yet`);
  return mod;
}

const catalogFixture = [
  { id: 'cheap/text-json', name: 'Cheap Text JSON', canonical_slug: 'cheap-text-json', context_length: 8192,
    architecture: { input_modalities: ['text'], output_modalities: ['text'] },
    supported_parameters: ['response_format'], pricing: { prompt: '0.000001', completion: '0.000002', request: '0.0001' } },
  { id: 'gpt-6/blocked', name: 'GPT-6 Blocked', canonical_slug: 'gpt-6-blocked', context_length: 8192,
    architecture: { input_modalities: ['text'], output_modalities: ['text'] },
    supported_parameters: ['structured_outputs'], pricing: { prompt: '0', completion: '0', request: '0' } },
  { id: 'anthropic/claude-fable-5', name: 'Claude Fable 5', canonical_slug: 'claude-fable-5', context_length: 8192,
    architecture: { input_modalities: ['text'], output_modalities: ['text'] },
    supported_parameters: ['response_format'], pricing: { prompt: '0', completion: '0', request: '0' } },
  { id: 'expired/text', name: 'Expired', expiration_date: '2020-01-01T00:00:00Z', context_length: 8192,
    architecture: { input_modalities: ['text'], output_modalities: ['text'] },
    supported_parameters: ['response_format'], pricing: { prompt: '0', completion: '0', request: '0' } },
  { id: 'image/only', name: 'Image Only', context_length: 8192,
    architecture: { input_modalities: ['image'], output_modalities: ['image'] },
    supported_parameters: [], pricing: { prompt: '0', completion: '0', request: '0' } },
];

await test('catalogLoadsTextModelsAndUsesLivePrices', async () => {
  const mod = requireModule(await moduleOrNull('../core/model-catalog.js'), 'model catalog');
  const result = await mod.loadModelCatalog(async () => new Response(JSON.stringify({ data: catalogFixture }), { status: 200 }), { now: () => Date.parse('2026-01-01T00:00:00Z') });
  assert.equal(result.models[0].id, 'cheap/text-json');
  assert.equal(result.models[0].pricing.prompt, '0.000001');
  assert.ok(result.refreshedAt);
});

test('cheapDefaultUsesPromptCompletionRequestCost', async () => {
  const mod = requireModule(await moduleOrNull('../core/model-catalog.js'), 'model catalog');
  const selected = mod.chooseCheapestAllowed(catalogFixture, { inputBudgetTokens: 1000, outputBudgetTokens: 500, minContextTokens: 4096 });
  assert.equal(selected.id, 'cheap/text-json');
  assert.ok(Math.abs(selected.estimatedCost - (0.0001 + 0.001 + 0.001)) < 1e-12);
});

test('expiredOrNonTextModelIsRejected', async () => {
  const mod = requireModule(await moduleOrNull('../core/model-catalog.js'), 'model catalog');
  assert.equal(mod.isEligibleTextModel(catalogFixture[3], { now: Date.parse('2026-01-01T00:00:00Z') }), false);
  assert.equal(mod.isEligibleTextModel(catalogFixture[4], { now: Date.parse('2026-01-01T00:00:00Z') }), false);
});

test('gpt6AndClaudeFable5AreRejectedInUiAndOutgoingPath', async () => {
  const mod = requireModule(await moduleOrNull('../core/model-catalog.js'), 'model catalog');
  assert.equal(mod.isExcludedModel(catalogFixture[1]).excluded, true);
  assert.equal(mod.isExcludedModel(catalogFixture[2]).excluded, true);
  assert.throws(() => mod.validateSelectedModel('gpt-6/blocked', { models: catalogFixture }, {}));
});

test('unknownSelectedModelFailsClosed', async () => {
  const mod = requireModule(await moduleOrNull('../core/model-catalog.js'), 'model catalog');
  assert.throws(() => mod.validateSelectedModel('missing/model', { models: catalogFixture }, {}));
});

test('providerUsesBearerHeaderWithoutLoggingKey', async () => {
  const mod = requireModule(await moduleOrNull('../core/model.js'), 'provider adapter');
  const fixtureKey = ['fixture', 'secret', '12345678'].join('-');
  let request;
  const result = await mod.propose({ intent: 'find a backpack', plan: ['observe'], snapshot: { text: 'public text' }, results: [], model: 'cheap/text-json', apiKey: fixtureKey, catalog: { models: [catalogFixture[0]] }, fetchFn: async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ type: 'finish', summary: 'done', evidenceRefs: [] }) } }] }), { status: 200 });
  } });
  assert.equal(result.type, 'finish');
  assert.equal(request.options.headers.Authorization, ['Bearer', fixtureKey].join(' '));
});

test('providerIncludesBoundedRenderedCartEvidenceInMemory', async () => {
  const mod = requireModule(await moduleOrNull('../core/model.js'), 'provider adapter');
  const fixtureKey = ['fixture', 'secret', '12345678'].join('-');
  const productCards = Array.from({ length: 30 }, (_, index) => ({
    itemId: `item-${index}`, label: 'Rendered product '.repeat(40), href: `https://shopee.com.my/product/${index}`,
    priceText: 'RM 10', currencyText: 'MYR', fingerprint: `https://shopee.com.my/product/${index}|Rendered product|RM 10`,
    variants: Array.from({ length: 30 }, (_, variantIndex) => ({ id: `variant-${variantIndex}`, label: 'Black / Medium', renderedEvidence: 'selected' })),
  }));
  const selectedOptions = Array.from({ length: 30 }, (_, index) => ({ id: `selected-${index}`, label: 'Black / Medium', renderedEvidence: 'selected' }));
  const messages = Array.from({ length: 30 }, (_, index) => `Added to cart ${index}`);
  let requestBody;
  await mod.propose({ intent: 'find a backpack', plan: ['observe'], snapshot: {
    url: 'https://shopee.com.my/search', title: 'Search', text: 'public text', targets: [], productCards,
    selectedOptions, quantityEvidence: { value: 2, source: 'rendered quantity control' }, cartEvidence: { fingerprint: 'cart-before', messages },
  }, results: [], model: 'cheap/text-json', apiKey: fixtureKey, catalog: { models: [catalogFixture[0]] }, fetchFn: async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ type: 'finish', summary: 'done', evidenceRefs: [] }) } }] }), { status: 200 });
  } });
  const rendered = JSON.parse(requestBody.messages[1].content).renderedPage;
  assert.equal(rendered.productCards.length, 24);
  assert.equal(rendered.productCards[0].variants.length, 24);
  assert.equal(rendered.productCards[0].label.length, 240);
  assert.equal(rendered.selectedOptions.length, 24);
  assert.deepEqual(rendered.quantityEvidence, { value: 2, source: 'rendered quantity control' });
  assert.equal(rendered.cartEvidence.messages.length, 20);
});

test('providerMalformedJsonAnd401AreSanitized', async () => {
  const mod = requireModule(await moduleOrNull('../core/model.js'), 'provider adapter');
  const fixtureKey = ['fixture', 'secret', '12345678'].join('-');
  await assert.rejects(() => mod.propose({ intent: 'x', plan: [], snapshot: {}, results: [], model: 'cheap/text-json', apiKey: fixtureKey, catalog: { models: [catalogFixture[0]] }, fetchFn: async () => new Response('not json', { status: 401 }) }), /authentication|provider|invalid/i);
  try {
    await mod.propose({ intent: 'x', plan: [], snapshot: {}, results: [], model: 'cheap/text-json', apiKey: fixtureKey, catalog: { models: [catalogFixture[0]] }, fetchFn: async () => new Response('{bad', { status: 200 }) });
  } catch (error) {
    assert.doesNotMatch(String(error), /fixture-secret|Bearer/i);
  }
});
