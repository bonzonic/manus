---
work_item: 2026-10-24-room-code-display-kEUETV
status: source-proven / runtime reproduction pending independent verifier
baseline_sha: afd285f6c85cfa4638fbcd84973d1ae1bfa41e35
---

# Room-code display defect — reproduction

## Evidence labels

- **reporter-observed-screenshot:** parent-visible screenshot supplied with the report. It shows a successful `ROOM CREATED` dialog, `Your field is ready`, the invite-copy instruction, an eight-dash code value, and enabled-looking `Ready up` flow. I did not reopen the attachment with a file tool.
- **owner-source-proof:** baseline source inspection recorded here. This proves the data-path mechanism but is not a browser reproduction.
- **owner-browser-reproduction:** not run. The assigned stage explicitly permits source/metadata/document work only and forbids browser/server/test execution.
- **independent-verifier-runtime-proof:** pending; must use the separate verifier path and evidence directory.

## Cold-start steps for the verifier

Use a fresh baseline or candidate project arm and the real server implementation. Do not reuse a stale running bundle and do not replace the server with a fake local WebSocket.

1. Start the arm's `server/index.js` through a task-owned QA fixture using an explicit `allowedOrigins` list containing the browser's actual origin, including the port. Do not alter product defaults and do not stop or restart the user's existing localhost:10000 server.
2. Open the arm's actual origin in a fresh headless Chrome page at the fixed verification viewport.
3. Confirm the cold entry surface is visible and the static room-code placeholders are `--------` in the header and lobby markup.
4. Click `#create-room-button` once.
5. Wait for the real WebSocket welcome to make `#lobby-panel` visible. Read `#room-code`, `[data-copy-source="room-code"]`, and the browser's observed WebSocket welcome payload or app model through a non-mutating probe.
6. Click `#copy-invite` only after the room is visible. Record the URL passed to the clipboard stub/intercept without changing product code.

### Expected behavior

After the successful welcome, both visible code surfaces show the same eight-character uppercase room code from the server, for example `AB12CD34`. The invite action uses that same value and retains the existing same-origin `?room=AB12CD34` shape. Before welcome, both static surfaces retain `--------`.

### Reporter-actual behavior

The reporter reached the created lobby but the dialog code field remained `--------`. The screenshot also motivates checking the duplicated header field; the baseline has the same stale placeholder risk there. This is the user-observed reproduction, not an owner runtime claim.

## Source proof on the baseline

1. `server/authoritative-server.js:7-11` includes `roomCode` in every welcome built from a room.
2. `server/rooms/room-manager.js:124-165` handles CREATE/JOIN, calls `buildWelcome`, sets epoch/players, and returns the welcome.
3. `public/client-model.js:8-10` stores `message.roomCode` in `model.roomCode`.
4. `public/app.js:19-27` applies the message and calls `render()` after the welcome.
5. `public/dom-renderer.js:17-37` updates lifecycle DOM but has no write to `#room-code` and no query/update for `[data-copy-source="room-code"]`.
6. `public/index.html:21-24` and `public/index.html:163-168` seed both surfaces with dashes.
7. `public/app.js:83-87` creates the invite from `model.roomCode`, so a stale display does not imply that the authoritative room code was lost.

## Frozen baseline RED commands

The owner did not execute these commands. They are frozen for the implementer and independent verifier.

```powershell
# Direct native-DOM change-defining probe; expected to fail on baseline.
node --input-type=module -e 'import assert from "node:assert/strict"; import { renderPhase } from "./public/dom-renderer.js"; const nodes=new Map(["room-code","round-phase","countdown-label"].map(id=>[id,{textContent:""}])); const lobby={textContent:"--------"}; const doc={getElementById:id=>nodes.get(id),querySelectorAll:selector=>selector==="[data-copy-source=\"room-code\"]"?[lobby]:[]}; renderPhase({roomId:"room-1",roomCode:"AB12CD34",phase:"LOBBY",players:[]},doc); assert.equal(nodes.get("room-code").textContent,"AB12CD34"); assert.equal(lobby.textContent,"AB12CD34");'

# Persisted focused regression to be added by the distinct implementer.
node --test test/client/room-code-display.test.js

# Existing client guards.
node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js
```

Expected baseline result for the direct probe is an assertion failure because the renderer leaves the room-code nodes at their empty/dashed values. No baseline command result is claimed here; the exact failure set must be measured independently.

## Non-goals

Do not treat this record as proof of the whole multiplayer game, origin configuration, gameplay, reconnect, result, S10, deployment, or a successful browser run. Those are pre-existing or separate concerns and remain outside this defect.
