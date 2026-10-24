---
work_item: 2026-10-24-room-code-display-kEUETV
task: 2 - multiplayer web game
status: planned
role: om-task defect owner
baseline_sha: afd285f6c85cfa4638fbcd84973d1ae1bfa41e35
baseline_worktree: C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-baseline-20261024-kEUETV\\project
fix_worktree: C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-fix-20261024-kEUETV\\project
---

# Room-code display defect — root-cause plan

## Scope and report classification

The reporter states that CREATE succeeds and the room-created dialog appears, but the dialog's code field still shows eight dashes. The parent-visible reporter screenshot is labeled **reporter-observed-screenshot**; it shows `ROOM CREATED`, `Your field is ready`, the `Share eight character code` copy, an eight-dash code value, and `Ready up`. I did not reopen the attached image and have not claimed an owner browser reproduction.

This work item covers only authoritative room-code display and consistency between the duplicated header and lobby dialog fields. It does not reopen the known origin workaround, server lifecycle, invite routing, gameplay, reconnect, or whole-MVP acceptance.

## Proven root cause

The server path is correct. `server/authoritative-server.js:7-11` builds `welcome` with `roomCode: room.roomCode`; `server/rooms/room-manager.js:124-165` creates/joins the room, calls `buildWelcome`, and returns that message. The default `server/index.js:33-38` origin/port configuration is therefore not the mechanism for this display defect.

The client model is also correct: `public/client-model.js:8-10` validates a `welcome` envelope and stores `message.roomCode` as `model.roomCode`. `public/app.js:19-27` applies the welcome and immediately invokes the render pipeline.

The defect is the missing DOM write in `public/dom-renderer.js:17-37`. `renderPhase` updates player cards, phase, lifecycle surface visibility, and button state, but never calls the existing ID-based `set` helper for `#room-code` and never updates the lobby's `[data-copy-source="room-code"]` element. The static placeholders remain from `public/index.html:21-24` and `public/index.html:163-168`. This explains both the reporter's dialog symptom and the duplicated header remaining stale. It also explains why copy behavior can still be correct: `public/app.js:83-87` builds the invite from `model.roomCode`, not from either displayed DOM node.

## Frozen fix contract

On every render, derive one display value from `model.roomCode`: the eight-character authoritative code when present, otherwise the existing `--------` placeholder. Write that value to `#room-code` and to every existing lobby/display node matching `[data-copy-source="room-code"]`. The change must remain DOM-only, preserve the cold-start placeholder, and must not manufacture or normalize an authoritative code beyond the model's already validated welcome value. The existing copy-invite handler must continue to use `model.roomCode` and must not be replaced with DOM scraping.

The implementer may add a small renderer helper in `public/dom-renderer.js` and a focused client regression test. No server, protocol, origin, lifecycle, HTML, CSS, or app/model behavior change is approved unless the implementer reports a concrete contract conflict back to the parent.

## Acceptance criteria

1. Before any welcome, the existing header and lobby placeholders remain `--------`.
2. Given a valid authoritative welcome with `roomCode: "AB12CD34"`, the header `#room-code` displays exactly `AB12CD34` after the normal app render.
3. The room-created lobby display node `[data-copy-source="room-code"]` displays exactly the same `AB12CD34`; no duplicate display is left as dashes.
4. A subsequent re-render with the same model leaves both displays consistent; a room code is not cleared by phase/player/HUD rendering.
5. The copy-invite action remains based on `model.roomCode` and produces the existing same-origin `?room=AB12CD34` invite behavior; this is a regression guard, not permission to redesign invites.
6. No change is made to the authoritative welcome shape, room lifecycle, allowed origins, launcher, server port, gameplay, reconnect, results, or unrelated UI.

## Frozen change-defining RED probe (before implementation)

Run from the candidate project root in PowerShell. This is intentionally a direct native-DOM seam probe; it must fail on the current baseline because the header remains empty/stale and the lobby source remains dashed. Do not treat this document's expected failure as a run already performed.

```powershell
node --input-type=module -e 'import assert from "node:assert/strict"; import { renderPhase } from "./public/dom-renderer.js"; const nodes=new Map(["room-code","round-phase","countdown-label"].map(id=>[id,{textContent:""}])); const lobby={textContent:"--------"}; const doc={getElementById:id=>nodes.get(id),querySelectorAll:selector=>selector==="[data-copy-source=\"room-code\"]"?[lobby]:[]}; renderPhase({roomId:"room-1",roomCode:"AB12CD34",phase:"LOBBY",players:[]},doc); assert.equal(nodes.get("room-code").textContent,"AB12CD34"); assert.equal(lobby.textContent,"AB12CD34");'
```

The implementer must persist the same contract as `test/client/room-code-display.test.js` (approved new focused test path) and make this command/test pass. The existing client seam guards remain regression checks:

```powershell
node --test test/client/room-code-display.test.js
node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js
```

The current owner stage does not run these commands. Their baseline/candidate results belong to the distinct implementer inner loop and then to the independent verifier's separate measurements.

## Approved implementation scope

- `public/dom-renderer.js` — synchronize the authoritative room code to the header and all existing display-source nodes, preserving the placeholder.
- `test/client/room-code-display.test.js` — add the focused native DOM regression for placeholder preservation, welcome code propagation to both display surfaces, and repeated render consistency.

The implementer must report any unplanned file. `public/client-model.js`, `public/app.js`, `public/index.html`, `server/authoritative-server.js`, `server/rooms/room-manager.js`, `server/index.js`, protocol files, CSS, and launch/origin configuration are not approved change targets.

## Independent verification specification

The fresh verifier must measure baseline SHA `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35` and the candidate on the exact same driver, viewport, fixture, and commands. The owner has not run a browser or test and cannot substitute owner numbers.

### Native DOM regression

From each arm's project root, run the focused test and the three existing client guard files with Node 22.12+ using the package's explicit file commands. Record failure identities, not only counts. The change-defining focused assertion must fail on the baseline and pass on the candidate; pre-existing failures, if any, remain labeled regression guards.

### Real headless browser proof

Use Playwright 1.56.1 from `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\tools\\browser-qa\\node_modules\\playwright` with the installed Chrome executable, headless, same viewport (recommended 1440x900, device scale 1), two independently served arms, and no headed/focus-stealing operations. Use the actual server implementation (`server/index.js` / `createGameServer`), not a fake WebSocket or local placeholder. Start one baseline and one candidate server on task-owned ports; for each arm configure the QA fixture's `allowedOrigins` explicitly to that arm's actual browser origin, for example `http://localhost:<port>` and `http://127.0.0.1:<port>`. Do not modify the product origin defaults or touch the user's existing localhost:10000 server.

For each arm, navigate to its explicit actual origin, click `#create-room-button`, wait for `#lobby-panel` to be visible, and assert the real welcome payload path reached `#room-code` and `[data-copy-source="room-code"]`. Capture only the bounded pair for this defect: (a) room-created dialog with both code surfaces and (b) the copy-invite result/URL or a DOM assertion that the clipboard request used the same model code. Use one before/after capture per assertion, no whole-matrix sweep. Stamp each capture with arm commit, driver, viewport, actual origin, and fixture port. A browser proof is not valid if it uses the wrong origin, a stale bundle, a fake socket, or different drivers between arms.

### Evidence matrix

The verifier should retain at most six captures: native-DOM baseline/candidate result logs; browser baseline/candidate room-created dialog captures; and browser baseline/candidate invite-consistency payloads. Inspect every image before citing it. Full-suite, S10, deployment, HTTPS/WSS, gameplay, reconnect, and whole-MVP claims are explicitly outside this defect verification.

## Ruled-out explanations and risks

- **Origin rejection / missing welcome:** ruled out by the authoritative serializer and room-manager trace; the reporter reached the created dialog, and `roomCode` is in the welcome contract.
- **Model loss:** ruled out by `applyWelcome` assigning `message.roomCode` and the copy handler reading the same model field.
- **Copy-link generation:** not the reported defect; retain it as a consistency regression guard.
- **HTML identifier absence:** the header has `id="room-code"`; the lobby has an existing `data-copy-source="room-code"` marker. No HTML change is needed.
- **Lifecycle widening:** not relevant; `renderPhase` already controls lobby visibility and ready state.

The main risk is updating only the header and leaving the dialog duplicate stale, or scraping a DOM placeholder for invite generation. The fixed contract requires one model-derived value for both displays and leaves copy generation model-authoritative.

## Stage state

Owner investigation is complete and ready for the parent to admit a distinct implementer. No product diff, test run, server launch, browser launch, build, install, commit, merge, push, or deployment was performed in this stage.
