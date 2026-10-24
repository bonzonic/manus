import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('manifestUsesMV3SidePanelAndNoBroadOrSecretAccess', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.side_panel.default_path, 'panel.html');
  assert.deepEqual(new Set(manifest.permissions), new Set(['sidePanel', 'activeTab', 'scripting', 'storage']));
  assert.deepEqual(manifest.host_permissions, ['https://openrouter.ai/*']);
  assert.equal(JSON.stringify(manifest).includes('sk-'), false);
  assert.equal(JSON.stringify(manifest).includes('<all' + '_urls>'), false);
});
