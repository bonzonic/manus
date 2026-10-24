import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('joined package documents one proposed Render service and provider-safe runtime wiring', () => {
  const render = read('render.yaml');
  const server = read('server/index.js');
  const docs = read('docs/render.md');
  const readme = read('README.md');
  assert.equal((render.match(/^\s*- type: web$/gm) ?? []).length, 1);
  assert.match(render, /^\s*rootDir:\s*\.\s*$/m);
  assert.match(render, /HOST[\s\S]*0\.0\.0\.0/);
  assert.match(render, /healthCheckPath:\s*\/healthz/);
  assert.match(render, /ALLOWED_ORIGINS/);
  assert.match(server, /process\.env\.PORT/);
  assert.match(server, /0\.0\.0\.0/);
  assert.match(docs, /rootDir/i);
  assert.match(docs, /0\.0\.0\.0/);
  assert.match(docs, /process\.env\.PORT/);
  assert.match(readme, /static HTML\/CSS\/SVG\/manifest shell.*included/i);
  assert.match(readme, /Cycle F[\s\S]*1 test[\s\S]*0 failures[\s\S]*exit 0/i);
});
