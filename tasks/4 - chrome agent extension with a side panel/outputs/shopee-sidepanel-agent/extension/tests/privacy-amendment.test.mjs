import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('exactMalaysiaRegionOnlyAndChangedOriginsStop', async () => {
  const mod = await import('../core/shopee.js');
  assert.deepEqual(mod.SHOPEE_REGIONS.map((r) => r.origin), ['https://shopee.com.my']);
  assert.equal(mod.normalizeRegion({ id: 'my', origin: 'https://shopee.com.my' }).origin, 'https://shopee.com.my');
  assert.throws(() => mod.normalizeRegion({ id: 'sg', origin: 'https://shopee.sg' }), /not allowed/);
  assert.equal(mod.classifyShopeePage({ url: 'https://shopee.sg/search?q=x' }).kind, 'unsupported');
});

test('allPermittedTextModelsVisibleWhileStructuredDefaultIsPreferred', async () => {
  const { isEligibleTextModel, chooseCheapestAllowed } = await import('../core/model-catalog.js');
  const limited = { id: 'limited/text', name: 'Limited Text', context_length: 8192, architecture: { input_modalities: ['text'], output_modalities: ['text'] }, supported_parameters: [], pricing: { prompt: '0.000001', completion: '0.000001', request: '0' } };
  const structured = { ...limited, id: 'structured/text', supported_parameters: ['response_format'], pricing: { prompt: '0.000002', completion: '0.000002', request: '0' } };
  assert.equal(isEligibleTextModel(limited, { now: Date.now() }), true);
  assert.equal(chooseCheapestAllowed([limited, structured], { inputBudgetTokens: 1, outputBudgetTokens: 1 }).id, 'structured/text');
});

test('sessionLifecycleAndUIDiscloseProviderProcessingAndIntent', async () => {
  const [store, worker, panel] = await Promise.all([
    fs.readFile(new URL('./core/store.js', root), 'utf8'),
    fs.readFile(new URL('./worker.js', root), 'utf8'),
    fs.readFile(new URL('./panel.html', root), 'utf8'),
  ]);
  assert.doesNotMatch(store, /storage\.(local|sync)/);
  assert.match(worker, /startup|stale|interrupted|clear/i);
  assert.match(panel, /OpenRouter.*provider processing/i);
  assert.match(panel, /Intended action|progress|outcome/i);
});
