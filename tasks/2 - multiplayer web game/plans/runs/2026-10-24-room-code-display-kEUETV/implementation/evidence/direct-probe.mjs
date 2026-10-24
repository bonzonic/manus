import assert from 'node:assert/strict';
import { renderPhase } from '../../../../../.work/worktrees/snake-room-code-fix-20261024-kEUETV/project/public/dom-renderer.js';
const nodes = new Map(['room-code', 'round-phase', 'countdown-label'].map(id => [id, { textContent: '' }]));
const lobby = { textContent: '--------' };
const doc = { getElementById: id => nodes.get(id), querySelectorAll: selector => selector === '[data-copy-source="room-code"]' ? [lobby] : [] };
renderPhase({ roomId: 'room-1', roomCode: 'AB12CD34', phase: 'LOBBY', players: [] }, doc);
assert.equal(nodes.get('room-code').textContent, 'AB12CD34');
assert.equal(lobby.textContent, 'AB12CD34');
