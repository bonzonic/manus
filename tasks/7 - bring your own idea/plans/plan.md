# Parking Navigator Implementation Plan

> **For implementation workers:** Use checkbox (`- [ ]`) syntax for tracking. The selected execution design is workflow-orchestrated parallel work after a foundation gate, but this document does not launch it. Read the current `workflow-composer` skill and inspect the live `workflow/run` schema at execution time. Apply `manus-subagent-driven-development` for implementation/review orchestration. Never assume a model, unsupported messaging/resume API, shared repository access, or permission to commit/publish.

**Goal:** Build a portable 2D parking-lot authoring and driver-guidance app with round-trip CSV, arbitrary-floor ramps, live management integration and fastest-available-space routing.

**Architecture:** A shared validated graph and fixed interfaces let pure routing, CSV exchange, authoring, server transport and driver UI be built independently. The backend owns the saved map and revisions; the builder owns an editable draft. The integrator injects actual implementations after independent module tests pass.

**Tech Stack:** React/TypeScript/Vite, Node/TypeScript/Express, `ws`, SVG, npm, a runtime schema library, a CSV parser, Vitest and React Testing Library. Local file persistence with an in-memory test adapter. Render-compatible Node deployment later; no Manus-managed services. Exact dependency versions are a T0 deliverable.

**Spec:** [Product and architecture](../architecture/architecture.md) and [Contract v1](../architecture/contracts.md).

Status: reduced-scope prototype implemented under the user's 30-minute deadline instruction. See [run instructions](../parking-app/README.md) and [verified handoff](../outputs/verification.md). Original optional work below remains a roadmap, not a claim that every checkbox was completed. Updated: 2026-10-24.

## Global Constraints

- Plain-local website + backend, with React/Vite + Node/Express + `ws`; no managed project initialization, service account or publishing.
- Implement 2D authoring for roads and parking spaces; transfer the entire graph through one CSV file.
- Ramps connect explicit source/destination landings on arbitrary different floors, including Ground↔Floor 5. No implicit exits on skipped floors.
- Dijkstra minimises positive `lengthMeters / speedMps` travel seconds. Spaces are terminal; only free reachable spaces qualify. Guidance does not reserve a space.
- Synthetic data only. Waiting vehicles, OKU allocation, active space-taking detection, 3D, GPS, automatic rerouting and production scaling remain out of scope.
- Use exact IDs, schemas, props, error codes, revision semantics and transport messages from Contract v1. No independent redefinitions.
- CSV/JSON input ≤2 MiB, floors ≤32, nodes ≤5,000, edges ≤10,000. Invalid input never partially changes a draft/live map.
- Dirty drafts survive conflicts; server mutations are authenticated, revision-checked, serialised and persisted before success/broadcast.
- No tokens in code, URLs, logs, build-time frontend configuration, localStorage or CSV.
- No two implementation agents write into the same working tree. Use verified isolated copies/worktrees after execution is authorised; otherwise execute writes sequentially. File ownership alone does not make shared-tree parallel implementation safe.
- Only the coordinator modifies contracts, manifests, lockfiles, root configs, the integration shell and execution ledger. Workers do not delegate other workers or commit/merge/push/deploy without explicit execution-time authority.

## Review Focus

1. Floor-crossing shortcuts → direct Ground→5 has no exits at 1–4; `routing.test.ts::expressRampDoesNotCreateIntermediateExits` in T1 and `builder.test.tsx::createsDirectRampToFloor5` in T3.
2. Visually close but unreachable/illegal spaces → excluded, with distinct no-route outcomes; `routing.test.ts::ignoresDisconnectedAndOneWayBlockedSpaces` in T1.
3. CSV appears successful but loses graph meaning → exact canonical round-trip plus rejected partial/quoted/duplicate inputs; `csv.test.ts` in T2.
4. Live races erase work or falsely acknowledge writes → conflict preserves draft, persistence failure emits nothing, stale/duplicate socket snapshots ignored; T3/T4/T5 tests below.
5. Driver follows an old destination after availability changes → stale route visibly invalidated without reservation/automatic reroute; `driver.test.tsx::invalidatesRouteOnNewSnapshot` and `ignoresLateRouteResult` in T5.

## Repository evidence and proposed app structure

Observed during planning: existing `architecture/architecture.md` and `plans/plan.md` were selection scaffolds, not app code. This pass replaces them with the selected idea. No package manifest, app framework, established test script or Git root was found in the task folder. Tool versions observed: Node 22.12.0, npm 10.9.0, Git 2.47.1; pnpm did not resolve in this terminal. Use npm, not a new globally installed package manager. Do not claim that project test/build commands have already run.

Proposed application root: `parking-app/` under the current task folder. Do not create it until implementation starts. Existing planning docs stay in place. Module tests live beside their modules to preserve ownership.

```text
parking-app/
  package.json, package-lock.json, tsconfig*.json, vite.config.ts, vitest.config.ts
  shared/
    contracts/{model,validation,routing,csv,transport,client,index}.ts  # T0
    routing/{index,min-heap,routing.test}.ts                         # T1
    csv/{index,csv.test}.ts                                         # T2
    fixtures/{demo-map.json,routing-cases.json}                     # T0
  client/
    ui-contracts.ts, styles/tokens.css                              # T0
    builder/{BuilderView,editor-state,geometry,builder.test}.*      # T3
    map/{MapCanvas,viewport,map.test,map.css}.*                     # T3
    driver/{DriverView,driver-state,driver.test,driver.css}.*        # T5
    integration/{api-client,live-map-client,client.test}.*           # T5
    App.tsx, main.tsx                                               # T6
  index.html                                                       # T6, Vite HTML entry
  server/
    {app,map-session,memory-store,file-store,auth,ws}.ts             # T4
    {session,rest,websocket,store}.test.ts                           # T4
    index.ts                                                       # T6
  public/{demo-lot.csv,manus-routes.json}                            # T6
  tests/integration/{flow,live-updates}.test.ts                     # T6
  README.md, Dockerfile, render.yaml, .env.example, .gitignore      # T6/T0 as specified
  docs/{integration,render,limitations}.md                          # T6
  .data/                                                         # runtime only, ignored
```

Paths with grouped names are expanded by their owner; actual code files are `.ts`/`.tsx` as appropriate, not literal `.*` names. T0 owns `.gitignore`; T6 requests any needed changes through that owner/coordinator. `public/manus-routes.json` is a simple optional page manifest (`/` only) and does not register a Manus-managed project.

## Parallel execution map

```text
T0 — foundation + contract freeze + fixtures
       ├─ T1 routing engine ───────────┐
       ├─ T2 CSV module ───────────────┤
       ├─ T3 builder + SVG renderer ───┤
       ├─ T4 backend + management API ─┤
       └─ T5 driver + live client ─────┘
                                      ↓
                               T6 integration + local/Render package
                                      ↓
                               T7 independent final review
```

T1–T5 can run concurrently **after T0 is accepted**, against injected interfaces/test fakes. Backend T4 does not wait for T1/T2 because it receives `RoutingPort`/`CsvPort`. Driver T5 does not wait for T3 because it receives `MapRenderer`. Builder T3 does not wait for T4 because it receives `ParkingApi`. Never solve an unfinished dependency by copying its implementation.

Each implementer performs TDD/self-review and returns its report. Each module then gets a fresh read-only, module-scoped specification + quality review. Reviewers may run concurrently against immutable review packages. The coordinator imports accepted owned changes into the integration copy; cross-module integration waits for all accepted modules. No automatic Git/worktree creation occurs in this planning pass.

## Command contract to establish in T0

The following are **planned scripts**, not existing verified commands. T0 must create them and prove their invocation before dispatching other workers. From `parking-app/` in PowerShell:

```powershell
npm ci
npm run test:contracts
npm run test:routing
npm run test:csv
npm run test:builder
npm run test:server
npm run test:driver
npm run test:integration
npm test
npm run typecheck
npm run build
npm run dev
npm start
```

Each scoped test script selects only its owner's test files. `npm test` runs all non-interactive tests once; missing tests are not treated as passes. `typecheck` checks client/shared/server; `build` produces `dist/client` and a bundled Node entry at `dist/server/index.js` with package externalisation handled explicitly. Development runs Vite on loopback port 5173 with strict-port behaviour and Express on loopback 3001; the Vite proxy upgrades `/ws`. Production honours `PORT`, defaults to 3000 and binds `0.0.0.0`, serving static frontend plus REST/WS from one origin. If a proposed port is occupied, report/agree on the change rather than silently moving it. Test servers use ephemeral loopback ports.

For Windows, quote absolute `Set-Location` paths. `npm ci` requires a committed/generated lockfile and runs only after T0 creates it. Project dependency installation is part of later implementation, not the plan. If native/browser tooling is needed, inspect the actual executable/dependency failure before requesting any machine-level repair.

---

## Task 0: Foundation, validated contracts and deterministic fixtures

**Owner:** coordinator/foundation implementer. **Dependencies:** implementation authorisation and accepted plan. **Files:** create root manifests/configs/`.gitignore`, `shared/contracts/**`, `shared/fixtures/demo-map.json`, `shared/fixtures/routing-cases.json`, `shared/contracts/contracts.test.ts`, `client/ui-contracts.ts`, `client/styles/tokens.css`. Do not implement T1–T5 or an alternative application shell.

**Interfaces:** consumes the specification/Contract v1; produces every shared type, runtime validator, `canonicalizeMap`, `getMapWarnings`, React-only view props, scoped test scripts and fixtures. Shared package has no React/server imports. Fixture exports are data, not a second routing implementation.

- [ ] Write failing contract tests: reject cross-floor roads, non-space status, invalid access direction, duplicate IDs, missing references, negative/non-finite weights, oversized collections and too-short ramp; accept empty/partially disconnected maps and valid Ground→5.
- [ ] Create compatible manifests/configs/lockfile and run `npm run test:contracts`; establish that behaviour tests fail because validation/functions are not implemented, not merely because of a missing dependency.
- [ ] Implement declared schemas/types and validation/canonical warnings. Freeze the exact public export surface; populate meaningful compile-time consumer examples.
- [ ] Define numeric routing fixtures with hand-calculated expected totals: F1 candidate 90 seconds versus F5 60 seconds; descent; one-way forbidden reverse; no-space/unreachable; stable-ID tie. Include an ordinary multi-floor chain and unconnected free space. Verify the graph is structurally valid and expected totals are sums, without using T1 to manufacture expected answers.
- [ ] Run contract tests and baseline typecheck. Publish a freeze report with Node/dependency versions, exact scripts and fixture IDs. Other suites may still be absent: report that honestly, do not run the whole future command list and claim success.
- [ ] Establish verified isolated implementation copies only when execution-time isolation/Git authority permits; otherwise stop parallel writing and use a parent-coordinated sequential fallback. Run fresh contract review before releasing T1–T5.

**Acceptance:** every worker can import the exact contracts and run its scoped tests without editing root configuration or waiting for another module's code.

## Task 1: Fastest reachable available-space routing

**Owner:** routing agent. **Dependencies:** T0 freeze only. **Files:** `shared/routing/index.ts`, `min-heap.ts`, `routing.test.ts`.

**Interfaces:** consumes `ParkingMap`, `RouteRequest`, `RouteOutcome`; exports `routing: RoutingPort` as specified. No network/persistence/UI/CSV ownership.

- [ ] Write failing tests `choosesFloor5ExpressByTime`, `routesDownRamp`, `expressRampDoesNotCreateIntermediateExits`, `ignoresDisconnectedAndOneWayBlockedSpaces`, `neverTransitsThroughSpace`, `excludesOccupiedClosedAndDisabled`, `returnsDistinctEmptyOutcomes`, `tieUsesStableDestinationId`, and `doesNotMutateMap` using T0 fixtures.
- [ ] Run `npm run test:routing` and record the expected behavioural RED output.
- [ ] Implement adjacency generation, positive time weights, min-heap Dijkstra and segment reconstruction. Include the final access segment in totals. Process equal best-cost destinations before stable-ID selection; no screen-distance heuristic.
- [ ] Run the same tests GREEN and scoped typecheck; compare totals to hand-authored expected numbers. Add a deterministic 5,000-node smoke case that confirms termination/valid output without a machine-specific timing assertion.
- [ ] Self-review and return report for a fresh module reviewer; do not add A*, congestion or reservations.

**Acceptance:** legal fastest-time results and all declared failure outcomes, including direct ascent/descent and no intermediate express-ramp exits.

## Task 2: Lossless CSV import/export

**Owner:** CSV agent. **Dependencies:** T0 freeze only. **Files:** `shared/csv/index.ts`, `csv.test.ts`.

**Interfaces:** consumes shared schemas; exports `csv: CsvPort`. Does not own HTTP upload or file-dialog UI.

- [ ] Write failing tests `roundTripsCanonicalMap`, `preservesRampsDirectionsAndStatuses`, `handlesQuotesUtf8AndMultilineLabels`, `acceptsBomAndReorderedHeader`, `reportsPhysicalRowAndColumn`, `rejectsMalformedOrUnknownFields`, `rejectsUnsupportedVersionAndDanglingIds`, and `rejectsWholeFileWithoutMutation`.
- [ ] Run `npm run test:csv` and preserve RED evidence.
- [ ] Implement the exact mixed-record format using the T0-approved CSV parser; validate all rows and the full graph before returning. Use round-trip-safe numbers and canonical row ordering.
- [ ] Run GREEN tests and scoped typecheck. Serialize/reparse the T0 demo; prove canonical equality, including ramp lower-bound geometry and every enabled/direction/status field.
- [ ] Return the serializer-generated demo CSV as an owned module artifact for T6 to install; do not edit `public/` during this parallel wave. Self-review and request module review through the coordinator.

**Acceptance:** one portable CSV round-trips the complete lot; invalid files produce actionable errors and no partial model.

## Task 3: 2D builder and reusable SVG map

**Owner:** builder/map agent. **Dependencies:** T0 freeze only; injected `CsvPort`/`ParkingApi` fakes. **Files:** `client/builder/BuilderView.tsx`, `editor-state.ts`, `geometry.ts`, `builder.test.tsx`, `builder.css`; `client/map/MapCanvas.tsx`, `viewport.ts`, `map.test.tsx`, `map.css`.

**Interfaces:** exports `BuilderView(BuilderViewProps)` and `MapCanvas(MapCanvasProps)`. Uses global tokens read-only. All draft edits are validated atomic transactions.

- [ ] Write failing tests `buildsConnectedRoadAndSpace`, `splitsRoadPreservingDirection`, `leavesFarSpaceUnconnected`, `crossingsRequireSharedJunction`, `createsDirectRampToFloor5`, `rejectsTooShortRampAfterNodeMove`, `undoesWholeTransaction`, `csvImportIsDraftOnly`, `preservesDirtyDraftOn409AndLiveUpdate`, and `keyboardInspectorCanCreateRamp`.
- [ ] Run `npm run test:builder` and preserve RED output.
- [ ] Implement floor management, select/drag/coordinate-edit nodes, road drawing, parking attachment/splitting, ramp wizard, direction/speed/enabled/status inspector, confirmed cascading delete, pan/zoom, cancel, undo/redo and localStorage draft recovery.
- [ ] Implement CSV import/export controls through the injected port. Show warnings before explicit save. Save against the draft's base epoch/revision and preserve edits on conflict; clean drafts may follow newer snapshots.
- [ ] Implement floor-specific renderer: directed roads, labelled status-symbol spaces, linked ramp endpoints and route segments/markers. Pointer coordinates convert through the SVG viewport before metre/grid geometry. Never show a cross-floor straight road; never inject labels as HTML.
- [ ] Run GREEN tests/scoped typecheck; inspect small-screen overflow, focus, status symbols and reduced-motion handling. Document browser checks only if actually performed with available tools.
- [ ] Self-review and return owned changes/report; do not edit shell, API client, driver, server, root CSS/configs or contracts.

**Acceptance:** an operator can build and edit a complete connected lot including nonconsecutive-floor ramps, and another view can reuse the same map renderer.

## Task 4: Authoritative backend, persistence, REST and WebSockets

**Owner:** backend agent. **Dependencies:** T0 freeze only; fake routing/CSV ports. **Files:** `server/app.ts`, `map-session.ts`, `memory-store.ts`, `file-store.ts`, `auth.ts`, `ws.ts`, `session.test.ts`, `rest.test.ts`, `websocket.test.ts`, `store.test.ts`.

**Interfaces:** `createMapSession`, `MapSession`, `createServer`, `MemoryMapStore`/`FileMapStore` adapters and `ServerHandle` from Contract v1. No concrete import of T1/T2; no production entrypoint yet.

- [ ] Write failing tests `persistsBeforeBroadcast`, `persistenceFailureKeepsState`, `serialisesConcurrentWritesAndRejectsStale`, `restartChangesEpoch`, `requiresManagementToken`, `restAndWsShareAvailabilityRules`, `twoClientsReceiveUpdate`, `initialSubscriptionHasNoSnapshotGap`, `badMessageDoesNotMutate`, and `fileStoreSurvivesLocalReload`.
- [ ] Run `npm run test:server` and preserve RED output. REST tests use real ephemeral HTTP; WebSocket tests use real `ws` clients, not mocked “connected” labels.
- [ ] Implement map-session serial mutation, no-op semantics, detached reads, atomic file persistence and failure rollback. Inject epochs/stores/clocks as needed for deterministic tests.
- [ ] Implement every declared route, body validation/status code, management bearer checks, origin rules and generic internal errors. CSV import is an authenticated revision-checked replacement; route requests require a matching version.
- [ ] Implement subscription/snapshot ordering, auth control message, shared availability-command path, request-correlated replies, size/version/type checks, heartbeat and cleanup. Never put auth tokens in websocket URLs.
- [ ] Run GREEN server suite/scoped typecheck; assert real two-client update, stale write 409, unauthorised 401, oversize 413 and failed store write with no event. Document single-process and ephemeral hosted storage limits.
- [ ] Self-review and return report for module review. Do not create accounts, publish, change root manifests or implement the routing/CSV module behind a fake seam.

**Acceptance:** management integration is a working REST/WS backend, not UI-only fake availability; authoritative state survives local file-store reload and rejects conflicting writes.

## Task 5: Driver guidance and live REST/WebSocket client

**Owner:** driver/integration-client agent. **Dependencies:** T0 freeze only; injected renderer/API fakes for view tests. **Files:** `client/driver/DriverView.tsx`, `driver-state.ts`, `driver.test.tsx`, `driver.css`; `client/integration/api-client.ts`, `live-map-client.ts`, `client.test.ts`.

**Interfaces:** exports `DriverView(DriverViewProps)`, `createParkingApi`, `createLiveMapClient`; consumes Snapshot/RouteResponse and injected `MapRenderer`, never imports T3 implementation.

- [ ] Write failing tests `showsFastestDestinationAndRampSteps`, `selectsFloorForRouteStep`, `advancesOnlyToGraphNodes`, `explainsEmptyAndUnreachableStates`, `invalidatesRouteOnNewSnapshot`, `invalidatesRouteOnDisconnect`, `ignoresLateRouteResult`, `ignoresOldAndDuplicateSnapshots`, `reconnectsResubscribesAndResyncs`, and `cleansUpTimersAndSockets`.
- [ ] Run `npm run test:driver` and preserve RED output; fake time/random/network for deterministic reconnect tests.
- [ ] Implement start selection, route request with current expected version, destination/time/distance display, ordered ramp directions, floor/step selection and explicit recalculation. Keep the current position distinct from the chosen destination; no reservation or automatic reroute.
- [ ] Implement structured REST errors, same-origin URLs, reconnect/backoff/jitter, fresh snapshot resync and strict epoch/revision handling. Drop duplicate/outdated messages and responses; never show “live” before a valid fresh snapshot is applied.
- [ ] Run GREEN tests/scoped typecheck; verify stale routes cannot be advanced, conflicts ask for reload/recalculate, and unmount cleans timers/listeners. Review phone layout and text alternatives without claiming unperformed browser checks.
- [ ] Self-review and return report. Do not edit builder/map implementation, contracts, production shell or backend.

**Acceptance:** the driver sees a legal, floor-aware route based on current authoritative availability and is clearly told when that guidance is stale.

## Task 6: Integrate, demonstrate and package portable local/Render operation

**Owner:** integrator/coordinator-owned implementation copy. **Dependencies:** T1–T5 accepted reviews. **Files:** `index.html`, `client/App.tsx`, `main.tsx`, `server/index.ts`, `public/demo-lot.csv`, `public/manus-routes.json`, `tests/integration/flow.test.ts`, `live-updates.test.ts`, `README.md`, `Dockerfile`, `render.yaml`, `.env.example`, `docs/integration.md`, `render.md`, `limitations.md`. Root config changes remain coordinator-owned.

**Interfaces:** inject `routing`, `csv` and the chosen MapStore into `createServer`; inject actual MapCanvas/API/live adapter into the views. Shell owns saved snapshot, connection state, management token and mode selection. No duplicated domain logic in App or entrypoint.

- [ ] Write failing integration tests for seed→route→status update→stale route→explicit recalculation, draft→save→CSV export→reimport equality, stale-save preservation, restart resync and both no-route outcomes. Assert real server sockets and real routing/CSV ports together.
- [ ] Run `npm run test:integration` and record RED evidence for missing wiring/behaviour.
- [ ] Wire the actual modules and development proxy; install T2's CSV fixture. Serve the frontend, health, REST and WS from one production origin. Generate a local management token outside tracked files and explain how management enters it; do not put a secret in `.env.example`.
- [ ] Add Render-compatible start/build configuration (`npm ci`, `npm run build`, `npm start`), HTTPS/WSS URL handling, health endpoint and correct `PORT`/host behaviour. Test the local production Node output. Docker build verification is conditional on Docker actually being available; label it unrun otherwise.
- [ ] Document local start, drawing/attachment, long-ramp authoring, CSV schema, REST/WS examples, version conflicts, reconnects, data persistence and free-hosting sleep/ephemeral-disk limitations. No account creation or deployment.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, then a production-start health/CSV/API/WS smoke test. Demonstrate the specification's happy path and failure recovery with actual artefacts; report browser/manual checks only if performed. Collect full commands, exit status and limitations.
- [ ] Hand off an immutable review package/diff, execution ledger and evidence to T7. Request authorisation separately for any commit/merge/push/public deployment not already covered by the execution method.

**Acceptance:** one documented local command flow opens the app; the builder, CSV, backend, sockets and routing work together. Optional hosting files are prepared, not deployed or claimed tested remotely.

## Task 7: Independent read-only final specification and quality review

**Owner:** fresh verifier, not a module implementer. **Dependencies:** T6 candidate/evidence. **Files:** read all application code/spec/contracts/plan; create only `.work/parking-plan/reports/final-review.md` relative to the task folder.

**Interfaces:** consumes immutable final candidate and evidence; produces findings with severity, requirement, file/line, reproduction/check and verdict. Does not fix or expand scope.

- [ ] Compare every user requirement and deferred boundary against the candidate; trace real CSV→graph→route→render and real management update→broadcast→client paths.
- [ ] Inspect ramp ascent/descent, directed access, terminal spaces, input rejection, token/origin handling, conflict preservation, file durability and stale-route presentation. Check for duplicated contracts or fake integrations.
- [ ] Run fresh complete tests/typecheck/build on the final candidate when the environment supports it; compare results to the implementer's evidence. Record failures, skipped checks and unavailable browser/Docker/hosted checks explicitly.
- [ ] Return a read-only report. Coordinator sends all significant fixes as one focused implementer brief, then requests a scoped re-review. Open load-bearing issues block a completion claim; parked limitations must be stated.

**Acceptance:** independent evidence supports the first-version requirements, or the handoff clearly lists unmet requirements. Passing unit tests alone is not a product verdict.

## Dispatch, reporting and contract changes

Use [ready-to-send briefs](../outputs/agent-briefs.md), each pointing to its exact plan task and contracts. Supply those documents as actual `input_files` when the current runtime requires transfer; a path in a prompt is not proof the child can access it. Verify each child's device/workspace before sending Windows paths. Fetch the current `workflow/run` schema and server concurrency contract at execution time; no workflow API payload is hardcoded in this plan.

Each implementer returns: status `DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED`; exact owned changed files; RED and GREEN commands/results; dependency/version evidence; interface changes requested (normally none); concerns; report path. Each fresh module reviewer returns spec-compliance and quality verdicts with file/line evidence. No worker launches other workers.

Keep a plan-scoped ledger at `.work/parking-plan/ledger.md` in the task folder. First line: `# SDD ledger — plan: plans/plan.md`. Record every task's base/freeze identity, isolation path, owner, status, changed files, test outputs, reviewer verdict and coordinator rulings. Status updates do not erase acceptance criteria from this plan.

One proposed normal execution contains **7 implementation units** (T0–T6), **7 fresh module reviews**, and **1 final verifier** (T7): **15 agent calls** if all those roles are delegated separately. This count excludes retries/fix units and is a planning estimate, not a submitted tool budget. The coordinator may implement T0/T6 directly, reducing calls. At launch, count actual selected units and review/fix allowance honestly; budgets above the host's confirmation threshold must use its approval flow. Do not submit a workflow in this planning pass.

## Handoff and scope coverage

The requested road/space builder is T3, CSV exchange is T2+T3+T6, 2D drawing is T3, arbitrary-floor ramps are T0+T1+T3, management REST/WS is T4+T5+T6, and fastest routing is T1+T5. T6 joins them; T7 checks them. 3D and enhanced parking policy are consciously deferred, not silently claimed delivered.

Review these documents before implementation. The most consequential proposed defaults are explicit graph-node starts rather than GPS, travel-time weighting, separate draft/live state, revision-checked writes, and a single-process local backend. Parallel work starts only after the T0 contract freeze and verified isolation; integration starts only after the five module reviews are accepted.
