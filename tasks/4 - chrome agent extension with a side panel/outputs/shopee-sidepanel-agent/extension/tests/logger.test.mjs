import test from 'node:test';
import assert from 'node:assert/strict';
async function moduleOrNull(path) { try { return await import(path); } catch { return null; } }
function requireModule(mod, name) { assert.ok(mod, `${name} implementation is not present yet`); return mod; }

test('logsContainTimelineButNoSecretsOrRawSnapshot', async () => {
  const mod = requireModule(await moduleOrNull('../core/logger.js'), 'logger');
  let now = 10;
  const logger = mod.createRunLogger({ clock: () => ++now, maxEntries: 3, maxBytes: 10000 });
  const secret = ['fixture', 'secret', '12345678'].join('-');
  const bearer = ['Bearer', secret].join(' ');
  logger.add({ level: 'info', event: 'provider-error', modelId: 'cheap/text-json', reason: `${bearer} page snapshot secret=value https://x.test?a=secret` });
  const exported = logger.exportJson();
  assert.match(exported, /provider-error/);
  assert.doesNotMatch(exported, new RegExp(`${secret}|Bearer|secret=value|\\?a=`));
  assert.equal(logger.entries().length, 1);
  logger.add({ event: 'a' }); logger.add({ event: 'b' }); logger.add({ event: 'c' });
  assert.equal(logger.entries().length, 3);
});
