# Parking Navigator — Agent Dispatch Kit

Planning-only deliverable. Updated: 2026-10-24. No agents have been launched.

[Implementation plan](../plans/plan.md) · [Specification](../architecture/architecture.md) · [Contract v1](../architecture/contracts.md)

## Coordinator instructions

Complete/review Task 0 first, then send Tasks 1–5 concurrently in **separate verified implementation copies**. All start from the same accepted contract/config/fixture baseline. Task 6 integrates accepted owned changes; Task 7 is a fresh read-only final verifier. Do not send every worker the whole conversation or ask them to re-plan the app.

Before dispatch, replace `<implementation-copy>` and `<report-path>` with real paths on the child's actual device. If files are not shared, attach them through the runtime's supported input-file mechanism. Do not assume Windows paths exist in a child sandbox. Verify isolation and obtain the live orchestration schema before launch. Without isolation, keep code-writing agents sequential; read-only reviews can still run in parallel.

The planning documents remain in their existing task directories. During execution, reports/ledger live in the task's `.work/parking-plan/` area; each agent gets a distinct report filename. Do not create implementation copies/worktrees or commit in this planning turn.

## Common preamble — attach to each implementation brief

> Build exactly the assigned task for Parking Navigator, a plain-local React/Vite/TypeScript website and Node/Express/TypeScript/`ws` backend. Read the specification, Contract v1 and your exact task in the implementation plan first. Your application root is `<implementation-copy>`; the coordinator provides the accepted T0 freeze identity and available commands. Follow the current Manus runtime and selected local-only route. Do not initialise a Manus-managed project, install global tools, change device, deploy, commit or delegate another worker.
>
> Modify only your allowed files. Contracts/root configs/lockfiles are read-only. Use injected interfaces and contract-correct test fakes for modules being built by other agents. Report a contract problem to the coordinator; do not redefine it or duplicate another module. Apply focused TDD: record behavioural RED, implement, record GREEN and self-review. A missing dependency is a blocker, not evidence of the intended failing behaviour.
>
> Return status `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT` or `BLOCKED`; changed file paths; RED/GREEN commands, exit statuses and results; contract-change requests; limitations; and `<report-path>`. Do not claim browser/Docker/hosted checks that did not run. No reservations, waiting-car detection, OKU policy, GPS, 3D or automatic rerouting.

## Task 0 — Foundation owner

> Execute Task 0 only. Own root configs/manifest/lockfile/ignore rules, `shared/contracts/**`, deterministic JSON fixtures, `client/ui-contracts.ts` and `client/styles/tokens.css`. Implement the shared validators, canonicalisation/warnings and declared schemas—not routing, CSV parsing, transport or the final shell. Establish the npm scoped scripts and exact compatible dependency versions. Verify the two-way direct Ground↔5 ramp and hand-calculated F1=90 s versus F5=60 s fixtures. Return the contract freeze and isolated-copy prerequisites for five consumers. Release no wave until the fresh foundation review is accepted.

## Task 1 — Routing agent

> Execute Task 1 only. Own `shared/routing/{index,min-heap,routing.test}.ts`. Export `routing: RoutingPort`. Use Dijkstra over positive travel seconds, respect edge direction/disabled state, include terminal parking access, exclude occupied/closed/unreachable spaces, and deterministically resolve ties. Prove direct Ground→5 does not create intermediate exits, descent works, and lower time wins over physical proximity/floor number. No network, renderer, CSV, occupancy mutation or reservation work.

## Task 2 — CSV agent

> Execute Task 2 only. Own `shared/csv/index.ts` and `csv.test.ts`. Export `csv: CsvPort` using the exact mixed-record header/rules and T0 parser dependency. Prove lossless canonical round-trip for labels, ramps, all directions/statuses and floating-point values. Reject malformed/unknown/oversized/structurally invalid inputs atomically with physical row/column errors. Return a serializer-generated seed CSV as a module artifact for the integrator, not an edit to `public/`. Do not implement HTTP import or builder UI.

## Task 3 — Builder and SVG agent

> Execute Task 3 only. Own `client/builder/**` and `client/map/**`. Export `BuilderView` and `MapCanvas` with the accepted React prop contracts. Use injected fake CSV/API ports. Build road junction authoring, explicit road-space attachment/splitting, arbitrary-floor ramp wizard, editing/undo/cancel, draft import/export/save/conflict handling and floor-specific SVG rendering. Provide meaningful keyboard inspector alternatives, not toolbar focus alone. Preserve dirty drafts on live changes/409 and never connect crossing lines or skipped floors implicitly. Do not edit the shell, driver, API client, contracts, global tokens or server.

## Task 4 — Backend agent

> Execute Task 4 only. Own the assigned `server/` module/test files, excluding `server/index.ts`. Implement `createMapSession`, stores, `createServer`, every REST route and `/ws` protocol with injected `RoutingPort`/`CsvPort`. Serialise/persist before publishing; retain state on persistence failure; reject stale versions and unauthorised writes. Prove two real socket clients receive committed availability, REST and WS share one rule path, initial subscription loses no snapshot, and restart changes epoch. Never hardcode/log a token. Do not implement real routing/CSV modules or deployment wiring.

## Task 5 — Driver and live-client agent

> Execute Task 5 only. Own `client/driver/**` and `client/integration/**`. Export `DriverView`, `createParkingApi` and `createLiveMapClient`. Inject the map renderer for independence from Task 3. Build start selection, fastest-destination result, floor/ramp directions, optional node-step advancement, explicit recalculation and clear no-route/error states. Implement backoff/resubscribe/resync and strict epoch/revision handling. Stale/disconnected routes cannot be advanced; late requests cannot overwrite new snapshots. No target reservation or automatic destination change. Do not edit builder/renderer, shell, server or contracts.

## Task 6 — Integrator

> Execute Task 6 only after all five module reviews are accepted. Own the integration shell, production entrypoint, public seed/manifest, integration tests and local/Render documentation/configuration. Wire the actual injected ports/renderer, keep authoritative snapshot/token in the shell, and prove the complete real HTTP/WS/routing/CSV flow. Run the full tests/typecheck/build and local production smoke checks. Prepare Render files but do not create accounts/deploy. Preserve every accepted module's ownership; coordinate any contract/root changes explicitly. Record actual evidence and any unavailable browser/Docker checks for the final verifier.

## Fresh module reviewer — parameterised for Tasks 0–6

> Review Task `<N>` read-only against its exact plan task, specification, frozen contracts and immutable candidate/diff. You are not the implementer. Return separate specification-compliance and code-quality verdicts, severity-ranked findings with file/line evidence, relevant test/evidence gaps and explicit blockers. Do not expand scope, edit code, dispatch another agent or blindly repeat every suite. Use a focused executable check when a concrete doubt requires it. Report concerns that affect a consumer before the coordinator accepts the module.

## Task 7 — Final verifier

> Execute Task 7 read-only against the final integrated candidate and its ledger/reports. Trace the real builder→CSV→graph→routing→renderer flow and management REST/WS→authoritative state→two clients. Check nonconsecutive-floor ramps, illegal/unreachable spaces, auth, persistence rollback, draft conflicts and stale routes. Run fresh complete tests/typecheck/build when available. Return the final review report with evidence-backed requirement coverage and unmet/blocked checks. No fixes, feature expansion, deployment or unsupported compliance claims.

## Returned report template

```text
Task / owner / accepted freeze identity:
Status:
Implementation copy:
Changed files (owned paths only):
RED command / exit / observed behavioural failure:
GREEN command / exit / result:
Other checks actually run:
Contract requests or none:
Known concerns / blocked checks:
Report path:
```

No fixed provider/model is part of these briefs. At execution time the coordinator composes supported internal workflow units, counts implementation/review/fix calls, and follows the current approval/concurrency contracts.
