---
work_item: 2026-10-24-snake-mvp-kEUETV
parent: om-coordinator
contract: ../plan.md
implementation_handoff: ../handoff.md
route: B — standalone HTML/JavaScript client plus Node.js + ws server
status: ready for parent dispatch; no product code written here
---

# Parallel implementation handoff — Snake MVP Route B

## 1. Shared dispatch rules

The parent `om-coordinator` is the sole dispatcher. The frozen owner plan and handoff remain the source of truth; this document only records the Route B setup amendment and divides implementation ownership. Both lanes must use the exact project roots below and must not write into the shared checkout, owner documents, the other lane, or verifier records.

- **Application lane worktree/project:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-backend-20261024-kEUETV\project`
- **Static lane worktree/project:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-ui-20261024-kEUETV\project`
- **Later integrator candidate:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV\project`
- **Owner records:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\runs\2026-10-24-snake-mvp-kEUETV`

The parent gives the application lane the sole heavy reservation. That reservation covers dependency installation, test execution, any server process, and any later browser-capable check. The static lane has no process reservation and performs only text artifact writes. The parent must admit the application lane with a fresh device-wide capacity check before it starts; a child must not self-admit, queue a watcher, or kill unrelated work.

Both lanes read `plan.md`, `handoff.md`, `route-b-setup-amendment.md`, `wire-contract.md`, and the UI/Render supporting briefs before editing. They preserve S1–S10 and the original rules. No lane changes the plan, weakens S10, deploys, pushes, opens a review, merges, purchases hosting, or claims a public route.

## 2. Application lane packet — complete behavioral package

**Dispatch to:** one distinct implementation agent, not the owner and not the verifier.

**Mission:** In the application worktree, create the smallest complete Route B source package: server-authoritative rules, room/lifecycle controller, bounded WebSocket transport, native browser JavaScript client, focused tests, package manifest/scripts, and Render packaging documentation. The static shell is supplied by the static lane; do not edit its HTML, CSS, SVG, or web manifest.

### Application-owned paths

The application lane may create or modify only these paths under its `project` root:

```text
package.json
package-lock.json                         # only after the admitted install resolves it
.gitignore
server/index.js
server/authoritative-server.js
server/protocol/validate.js
server/game/arena.js
server/game/rules.js
server/rooms/room-manager.js
server/rooms/lifecycle.js
shared/protocol.json
shared/constants.js
shared/fixtures/*.json
public/app.js
public/client-model.js
public/protocol-client.js
public/board-renderer.js
public/dom-renderer.js
public/README-behavior.md
public/manifest-bridge.js                 # optional only if needed by app.js; no UI markup
scripts/check-package.js                  # only if a no-bundler package check is needed
test/rules/*.test.js
test/rooms/*.test.js
test/transport/*.test.js
test/client/*.test.js
test/security/*.test.js
test/fixtures/*.json
docs/implementation.md
docs/render.md
render.yaml
README.md
```

`public/manifest-bridge.js` is not required for visual presentation; it may be omitted. The application lane must not modify `public/index.html`, `public/styles.css`, `public/assets/shapes.svg`, or `public/manifest.webmanifest`. If a browser module needs a missing selector, report the seam to the parent; do not silently edit the static lane's files.

### Application packet and TDD order

1. **Inspect first.** Confirm the target `project` root and actual package state. Record the discovered commands in the implementation report. Current read-only discovery found Node `v22.12.0`, npm `10.9.0`, Corepack `0.29.4`, and no pnpm/yarn/bun; do not assume a pre-existing manifest or starter.
2. **Choose the smallest toolchain.** Use native Node ESM (`"type": "module"`), built-in `node:test`, built-in `http`, `crypto`, `fs`, `url`, and `path`, plus one exact-pinned runtime dependency: `ws`. Do not add a framework, bundler, database, Redis, physics engine, icon package, or static-server dependency unless a discovered blocker is documented and the parent approves it. Use browser-native ESM; there is no compile/build step in the minimal design.
3. **Write failing tests before behavior.** Start with the protocol/rules fixtures, then rooms/transport, then client model/render seams. Run only the changed test directories/files after each group. The full shared-repository suite is forbidden. The application lane's scoped commands are the proposed commands below, subject to confirming the actual manifest:
   - `node --test test/rules`
   - `node --test test/rooms`
   - `node --test test/transport`
   - `node --test test/client`
   - `node --test test/security`
   - integration join/play/rematch tests by their exact changed file path
4. **Implement the authoritative core.** Export the APIs in `wire-contract.md`; keep rules free of sockets and DOM. Use the frozen pre-step collision order, integer movement credit, two-command queue, bounded food, timeout, board-full, and deterministic random source.
5. **Implement rooms and transport.** Validate origin, membership, payload size, rate, round, epoch, and sequences; issue tab-scoped 256-bit credentials only through WSS messages; bound snapshots/output queues; make duplicate ready/rematch idempotent; make old sockets lose control; never turn disconnect/server loss into a fabricated win.
6. **Implement browser behavior.** `public/app.js` may bind the static lane's IDs, connect same-origin `wss`/`ws` for local development, render confirmed snapshots, show at most 150 ms presentation-only turn intent, and reconcile only unacknowledged turns. It must never award growth/boost/death/victory locally. `public/board-renderer.js` may draw procedural canvas shapes; it must not change the HTML/CSS/SVG ownership boundary.
7. **Render documentation.** `render.yaml` and `docs/render.md` must describe one `type: web`, Node, Free service, one HTTP port, `/healthz`, `0.0.0.0`, `process.env.PORT`, and same-origin `/ws`, while clearly marking the file as a proposed future configuration. Do not include a fabricated service name, credential, account, deployment result, or uptime promise.
8. **Stop conditions.** If the empty source root, Node version, package registry, or one-service design cannot support the frozen contract, write `BLOCKED.md` in the application worktree and stop. Do not substitute a local-only mock or weaken S10.

### Proposed application manifest/scripts

The first manifest is proposed, not pre-created by this owner. Once the parent admits the lane, pin `ws` to the exact version actually resolved and commit the lockfile only if commit authority is granted. The intended shape is:

```json
{
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0 <23" },
  "scripts": {
    "start": "node server/index.js",
    "test:rules": "node --test test/rules",
    "test:rooms": "node --test test/rooms",
    "test:transport": "node --test test/transport",
    "test:client": "node --test test/client",
    "test:security": "node --test test/security",
    "test": "node --test test"
  },
  "dependencies": { "ws": "<exact pinned registry version discovered by the lane>" }
}
```

The `test` script exists for a later integrator/verifier but the application lane must not use it as a full-suite shortcut. There is no proposed build script because native browser ESM is served directly. If Render requires a build command after the package is inspected, record the actual command and lockfile provenance in `docs/render.md`; do not assume a generic command is evidence.

### Application completion report

Return to the parent: changed-file list restricted to the application paths, baseline/candidate identity supplied by the parent, exact scoped commands and results, failed/red-to-green TDD cases, unrun checks, package/lockfile provenance, Render documentation status, security-limit evidence, and any blocker. State explicitly that no full suite, S10 public route, deployment, push, or independent verification was performed. A passing implementer run is not a verifier verdict.

## 3. Static presentation lane packet — HTML/CSS/original shapes only

**Dispatch to:** a separate text-only implementation agent. No behavioral JavaScript is allowed in this lane.

**Mission:** Create the accessible static shell and visual system for the Wayfinder Grid client. The shell must contain the stable DOM IDs in `wire-contract.md`, reference the application lane's `/app.js` entry without embedding behavior, and use only original CSS/inline SVG/procedural-shape-friendly presentation. It must not implement networking, state transitions, keyboard handlers, timers, DOM mutation, canvas simulation, or client-side rules.

### Static-owned paths

The static lane may create or modify only:

```text
public/index.html
public/styles.css
public/assets/shapes.svg
public/manifest.webmanifest
```

It must not touch any server, shared protocol, test, package, Render, documentation, or JavaScript file. It may place semantic `data-*` hooks and an inert `<script type="module" src="/app.js"></script>` tag in `index.html`; all behavior belongs to the application lane.

### Required static structure

Provide these exact stable IDs (additional presentational descendants are allowed, but do not rename these):

```text
#app-shell
#room-code
#copy-invite
#round-phase
#countdown-label
#connection-chip
#latency-note
#entry-panel
#create-room-button
#join-room-panel
#join-room-code
#paste-invite-link
#lobby-panel
#player-one-card
#player-two-card
#ready-button
#countdown-overlay
#arena-frame
#arena-canvas
#arena-focus-target
#game-announcement
#hud
#length-player-one
#apples-player-one
#boost-player-one
#length-player-two
#apples-player-two
#boost-player-two
#turn-queue
#keyboard-help
#direction-pad
#pause-overlay
#pause-title
#pause-message
#results-panel
#result-title
#result-reason
#result-player-one
#result-player-two
#rematch-panel
#rematch-button
#rematch-status
#error-panel
#error-title
#error-message
#error-action
#modal-layer
```

Use `aria-live="polite"` for `#game-announcement`, `aria-live="assertive"` for terminal error/result copy only, labelled real buttons in `#direction-pad`, visible focus treatment for `#arena-focus-target`, and text/ARIA labels for apples, mushrooms, player markers, connection state, and boost. Keep the 40:24 arena ratio, board-first narrow layout, reduced-motion rules, paper/ink/slate/coral/mint/saffron/orchid palette, and no external assets. The static SVG may contain original apple/mushroom/marker paths; it must not be a downloaded asset or icon package.

The static lane may use CSS state classes and inert attributes such as `data-phase="LOBBY"`, but it must not add scripts that change them. It qualifies for the narrow owner-authorized TDD exception: no executable behavior means no behavioral red/green test is meaningful. The lane still performs a deterministic textual compliance review of every required ID, no forbidden script/event attribute, accessible labels, and reduced-motion CSS. If it adds behavioral JS, a timer, event handler, network call, or dynamic state, stop and return the work to the application lane, where real TDD is mandatory.

### Static completion report

Return the four-file list, a short ID/accessibility/forbidden-behavior checklist, and any seam request. Do not run a process, package install, test runner, browser, build, or server. Do not claim S1–S10 or a visual acceptance pass; the static lane only supplies presentation inputs for the later candidate and independent verifier.

## 4. Ownership matrix and no-conflict rule

| Area | Application lane | Static lane |
|---|---|---|
| HTML shell and stable DOM IDs | read-only contract | owns `public/index.html` |
| CSS/layout/reduced motion | read-only contract | owns `public/styles.css` |
| Original SVG shapes/visual assets | may consume paths; no edits | owns `public/assets/shapes.svg` |
| Web manifest | read-only | owns `public/manifest.webmanifest` |
| Browser behavior/model/transport/renderer | owns listed `public/*.js` | forbidden |
| Rules/arena/rooms/WSS/security | owns `server/**`, `shared/**` | forbidden |
| Tests/fixtures | owns `test/**` | forbidden |
| Package/lock/scripts | owns `package*.json`, `.gitignore` | forbidden |
| Render/implementation docs | owns `render.yaml`, `docs/**`, root README | forbidden |

The only intentional cross-lane seam is selector/path compatibility: the application lane consumes the IDs and `/app.js` entry defined by the static lane, and the static lane can reference those names without implementing them. A mismatch is reported to the parent and resolved during integration; neither lane edits the other's files.

## 5. Later distinct integration in the candidate worktree

A separate integrator, not either lane author and not the verifier, performs the merge-by-copy after both lane reports are accepted. The integrator works only in:

`C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV\project`

1. Confirm the candidate starts from the recorded baseline and inspect its status without stashing or overwriting unrelated changes. Read both lane reports and compare every changed path against the ownership matrix.
2. Copy only the application-owned paths from `snake-mvp-backend-20261024-kEUETV\project` and only the four static-owned paths from `snake-mvp-ui-20261024-kEUETV\project`. Do not use a broad repository copy. Preserve any candidate-only scaffolding and stop on an ownership collision.
3. Check the seam: `public/index.html` has every required ID and `/app.js` entry; application selectors match the exact names; CSS classes and SVG references resolve; no static file contains behavioral JavaScript; `shared/protocol.json` matches `wire-contract.md`; `render.yaml` remains proposed and one-service only.
4. Run only the application lane's changed/scoped tests in the candidate, for example `node --test test/rules`, `node --test test/rooms`, `node --test test/transport`, `node --test test/client`, and `node --test test/security`, plus exact failing-file reruns. Do not run the full shared-repository suite. The static checklist is file inspection, not a substitute for server/client behavioral tests.
5. If a commit is authorized, read and apply the current Manus attribution guidance, stage exact candidate paths only, and record the candidate commit/build identity. Do not carry forward the historical no-AI-attribution rule. If no commit is authorized, leave the candidate uncommitted and report its exact status.
6. Deliver the candidate to a fresh verifier in the separate verifier worktree. The verifier must independently test S1–S10 and must not reuse the application lane's results as its verdict. Public HTTPS/WSS, 100–200 ms RTT/jitter, Render cold start, and S10 remain unverified until separately authorized and evidenced.

No deployment, remote push, review opening, merge, unattended watcher, or account action is part of this integration packet.
