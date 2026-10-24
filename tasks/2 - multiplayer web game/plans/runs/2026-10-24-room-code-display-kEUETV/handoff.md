---
work_item: 2026-10-24-room-code-display-kEUETV
from_role: om-task defect owner
to_role: distinct implementer
status: ready for implementation
baseline_sha: afd285f6c85cfa4638fbcd84973d1ae1bfa41e35
---

# Implementer handoff — room-code display

## Problem

A successful `welcome` carries an authoritative eight-character `roomCode` and the browser model stores it, but the created-room dialog and duplicated header remain on their static `--------` placeholders. The user-observed screenshot is the evidence label; the owner has proven the source mechanism but has not run a browser.

## Required fix

Keep the authoritative flow unchanged. In the DOM renderer, derive the display value from `model.roomCode` on the normal render path, preserving `--------` before a room exists. Write the same value to `#room-code` and every existing `[data-copy-source="room-code"]` node. Leave copy generation in `app.js` model-based; do not read the placeholder from the DOM or invent a code client-side.

## Approved files only

1. `public/dom-renderer.js`
2. `test/client/room-code-display.test.js`

Do not edit the server, protocol, origin configuration, launcher, `public/index.html`, `public/client-model.js`, `public/app.js`, CSS, or unrelated tests. If the existing static markup or model contract appears incompatible, stop and report the concrete conflict to the parent rather than widening scope.

## Frozen native-DOM contract

Before changing the product file, run the following direct probe from the project root; it is expected to fail on the baseline and pass after the fix:

```powershell
node --input-type=module -e 'import assert from "node:assert/strict"; import { renderPhase } from "./public/dom-renderer.js"; const nodes=new Map(["room-code","round-phase","countdown-label"].map(id=>[id,{textContent:""}])); const lobby={textContent:"--------"}; const doc={getElementById:id=>nodes.get(id),querySelectorAll:selector=>selector==="[data-copy-source=\"room-code\"]"?[lobby]:[]}; renderPhase({roomId:"room-1",roomCode:"AB12CD34",phase:"LOBBY",players:[]},doc); assert.equal(nodes.get("room-code").textContent,"AB12CD34"); assert.equal(lobby.textContent,"AB12CD34");'
```

Add the equivalent focused test at `test/client/room-code-display.test.js` covering: cold placeholder semantics; welcome code rendered to the header; the lobby data-source node rendered to the same value; and a repeated render that preserves consistency. Then run the explicit client guard command:

```powershell
node --test test/client/room-code-display.test.js
node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js
```

These are implementation-stage checks, not independent verification.

## Real-browser handoff requirements

The later verifier must use the actual `server/index.js`/`createGameServer` path and a real welcome, not a fake local placeholder or fake socket. A QA fixture may pass explicit `allowedOrigins` for its task-owned port (for example both `http://localhost:<port>` and `http://127.0.0.1:<port>`); no product origin default or user localhost:10000 server may be changed. Both baseline and candidate must use Playwright 1.56.1, installed Chrome, the same viewport and separate task-owned ports/sessions.

## Return packet

Return the exact changed-file list and diff stat, the focused test output, the guard test output, and any unplanned-file or contract conflict. Do not claim browser verification, full-suite completion, deployment, merge, or shipment. The owner will compare scope before the independent verifier is admitted.
