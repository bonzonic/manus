# Independent verification report — Browser Task Agent

**Verdict: BLOCKED / UNVERIFIED overall**  
**Category:** blocked/unverified, with separate code findings below  
**Run:** `browser-agent-20261024-YYvz4`  
**Verified at:** 2026-10-24 17:59 +08:00  
**Candidate source:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension`

## Candidate identity

- Git `HEAD`: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (the recorded baseline SHA; candidate changes are an uncommitted source tree in this prepared extension directory).
- Candidate tree: 25 files, verifier recomputation `TREE_SHA256=3e91246d100b4a2ee8d74797500fad417f8f815f28ea497c09805539d319fb6c` using sorted relative paths, NUL separators, and file bytes. The owner record's separately formatted tree stamp was `32C1F33D4CA59720B6315077241C1528B5A7B2CEE742BAD10AA6B5E70DD20876`; both refer to the same frozen 25-file candidate tree but use different serialization.
- Key SHA-256s: `worker.js` `1b0002a85182fc3006158cb25a7c724152dbced06023f44d0a897bbc3981c756`; `bridge.js` `178c09029c9467558d341978fc0b44fccc7b8e89da9bb7d3d09a78058d125f8e`; `core/engine.js` `327298dc12576b3975914eaca1d8a690086ff46169712724fdb161e2187b40f2`; `core/policy.js` `5783ce87332d849a3fc3ca3be61b8f9611eeb08b41849247d363cb7a791787eb`; `core/contracts.js` `608101afc10db1aada4489d613ce6f6601558db62fc4d086aa50159292d602c8`; `core/startup.js` `9b83903ad3f5abb8be60a5177aa2a417d61aa40000ec136f2026734f42a6bfab`; `manifest.json` `eee99a3dc3d1a43edffe062f483359e63d677b4353d450a9bf239fe2003860c7`.
- Scope inspection found the intended neutral manifest, MV3/module-worker/side-panel wiring, least-privilege permissions, panel bridge, generic core, startup module, and focused test additions. No product files were changed by this verifier.

## Checks run independently

| Check | Expected | Observed | Result |
|---|---|---|---|
| `node --test` from candidate extension | Full available Node suite passes with no new failures | 37 passed, 0 failed, 0 skipped, 0 cancelled; exit 0 | PASS |
| Recursive `node --check` for JavaScript | No syntax errors | All JavaScript files checked; exit 0 | PASS |
| Fake-Chrome sender-less panel `START` | Extension-page message without `sender.tab` falls back to active selected ordinary HTTP(S) tab, binds exact origin/tab, and worker initializes startup | `https://docs.example/search` produced `tabId=7`, origin `https://docs.example`, phase `PLANNING`; startup/installed/action listeners registered; exit 0 | PASS |
| End-to-end fake provider + fake Chrome | Non-shopping model → worker → engine/policy → bridge dispatch, with exact approval and fresh verification | On `https://docs.example`, approved search fill and same-origin “Next article” click both reached `RUNNING` with `result.status=verified`; no external network (catalog/completion responses were local fakes); exit 0 | PASS |
| Generic safety contracts | Ordinary public fill/click approved; sensitive/destructive/cross-origin and selector/script/code/coordinates/endpoint fields blocked | Focused generic tests and legacy safety/privacy/cart/model tests passed | PASS |
| Native cold install / real toolbar action / actual Side Panel | Baseline and candidate must show real toolbar action opening native Chrome Side Panel, not a normal panel tab | Not run in this verifier. Existing handoff explicitly records no native target, no toolbar click, no Side Panel API state, and no documented Puppeteer native-toolbar driver; prior capped probe was BLOCKED/NOT_RUN, not a pass | **BLOCKER / UNVERIFIED** |

## Findings

### F-01 — Required native Side Panel criterion remains unverified (release blocker)

- **Expected:** From fresh synthetic Load unpacked installs, a real toolbar action opens the actual native Chrome Side Panel with packaged panel UI; baseline and candidate are measured under identical fresh-profile conditions.
- **Observed:** No native-capable toolbar driver was available. The prior capped CFT probe recorded no browser target, manifest observation, service-worker target, Side Panel API state, panel message, or native toolbar click. No ordinary `panel.html` tab was counted as evidence.
- **Classification/severity:** blocked/unverified, critical. This is not evidence that candidate code is incorrect, but it prevents an overall PASS.
- **Next action:** Obtain an approved native-toolbar-capable driver and rerun baseline and candidate on fresh synthetic profiles; capture service-worker bootstrap, `setPanelBehavior`, actual toolbar click, native Side Panel heading, and sender-less panel messaging. Do not infer native success from fixture or source tests.

### F-02 — Empty/no-body pages are admitted instead of stopping before a run

- **Expected:** The frozen generic contract requires empty pages or empty target sets to stop with a concrete manual action before useful execution.
- **Observed:** `worker.js:52-59` accepts the bridge result after URL validation and creates a `PLANNING` run without checking that the snapshot has a body/content or any targets. `bridge.js` explicitly returns an empty snapshot for a missing body. This means `START` can succeed on a no-body/zero-target page.
- **Classification/severity:** code finding, high. Existing tests do not cover this acceptance criterion.
- **Next action:** Validate the observed snapshot at `START` (and before model advancement), requiring a valid same-origin snapshot and a non-empty supported target/content condition; return a blocked/needs-user response with the manual next step before creating an executable run.

### F-03 — File-input click can be approved and invoke a native file chooser

- **Expected:** File/native-dialog controls are manual or blocked and must never be dispatched by the generic path.
- **Observed:** In `bridge.js:29-33`, an `input[type=file]` is classified as role `textbox`; unless separately marked sensitive, `publicControl` can be true. `policy.js:33-46` restricts file inputs for `fill`, but has no equivalent `click` rejection for `inputType === 'file'`. A generic click can therefore pass policy and `bridge.js:50` calls `.click()`, potentially opening a native file chooser.
- **Classification/severity:** code finding, high safety boundary.
- **Next action:** Mark file controls unsupported in bridge evidence and reject both fill and click for file/native-dialog controls in policy before approval.

### F-04 — Visibility evidence is emitted but not enforced for mutations

- **Expected:** Generic public controls must be visibly rendered/usable; the contract explicitly excludes hidden or ambiguous controls.
- **Observed:** `bridge.js:33` emits `inViewport`, but `publicControl()` does not use it, and `policy.js:30-46` does not require `target.inViewport === true`. An offscreen button/textbox can therefore be classified public and approved.
- **Classification/severity:** code finding, medium/high. This is a correctness gap in the rendered-evidence contract.
- **Next action:** Require a fresh visible/in-viewport, enabled target for fill/click approval and recheck it in `freshApprovalCheck`; add an offscreen-control regression test.

### F-05 — Fill preview omits the exact bounded requested value

- **Expected:** The contract requires the exact intended fill action to be previewed before one-use approval, with a bounded/redacted value policy for safe public fields.
- **Observed:** `panel.js:9` displays action type, origin, target, and expected condition but omits `action.value` entirely. This is safer than leaking it, but does not satisfy the specified exact fill preview contract.
- **Classification/severity:** code/UX contract finding, medium.
- **Next action:** Add a bounded display for non-sensitive public fill values (with length cap/redaction policy) and a focused panel-contract test; continue blocking sensitive fields.

## Coverage and limits

The full available Node suite, syntax checks, generic policy/engine/contracts, model/provider sanitization, manifest/privacy/safety/cart regressions, startup initialization/error reporting, sender-less worker admission, and a bounded local fake-provider end-to-end docs-search flow were measured by this verifier. The end-to-end probe used only fake Chrome APIs and local fake catalog/completion responses; it did not call OpenRouter or any external account/site.

Native Chrome toolbar/Side Panel behavior, real browser worker bootstrap, real panel rendering at 320 CSS pixels, live provider/catalog behavior, real website DOM effects, and baseline-versus-candidate runtime comparison remain unverified. No real Chrome profile, Manus browser, account, credential, provider key, cart, checkout, payment, CAPTCHA, or product action was used. The native requirement therefore prevents a release PASS even though the code-level suite and bounded fake integration are green.

## Process state

This verifier launched only finite Node/check commands; they exited. No native browser launch was attempted or repeated. The inherited native probe's Windows process enumeration/cleanup was explicitly not independently confirmed in the owner record, so native task-process exit is not asserted here.

## Recommended next actions

1. Fix F-02 through F-04 (and F-05 if the exact preview requirement remains in scope), add regression tests, and rerun the scoped suite.
2. Run the required native baseline and candidate cold-install toolbar/Side Panel proof with a capable driver on fresh synthetic profiles.
3. Re-freeze candidate hashes/tree identity after any code fix and issue a fresh independent verification; do not mark the project complete from this report.
