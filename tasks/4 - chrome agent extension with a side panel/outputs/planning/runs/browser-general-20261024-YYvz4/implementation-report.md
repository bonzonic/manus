# Browser Task Agent implementation report

**Status:** frozen candidate delivered for independent verification; no commit, merge, publish, real-account action, provider-credit call, or native-toolbar pass claim.

**Source directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension`

**Baseline:** detached `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; candidate tree identity below was computed after source freeze.

## Actual changed files

1. `manifest.json`
2. `package.json`
3. `worker.js`
4. `panel.html`
5. `panel.js`
6. `bridge.js`
7. `core/contracts.js`
8. `core/policy.js`
9. `core/model.js`
10. `core/startup.js` (new)
11. `tests/browser-general.test.mjs` (new focused contract tests)

No CSS change was needed; the existing box-sizing, responsive width, wrapping, and overflow rules remain in place.

## Implementation summary

- Changed the product identity and version to **Browser Task Agent 0.2.0** while retaining MV3, `sidePanel`, `activeTab`, `scripting`, `storage`, and only `https://openrouter.ai/*` host access.
- Replaced common Shopee/Malaysia setup copy with ordinary HTTP(S) selected-tab invocation and exact run-origin status. The worker now captures the sender tab ID and exact origin and rejects privileged/non-HTTP(S) URLs before page action. The Shopee module remains available as an optional adapter and historical regression surface.
- Generalized rendered bridge evidence to conservative public controls, same-origin metadata, target/new-tab evidence, and generic `publicControl`, while retaining the legacy shopping evidence fields for the adapter path.
- Generalized policy to approve ordinary same-origin public text/click actions after exact approval, while blocking sensitive, account, payment, verification, destructive/irreversible, cross-origin, and new-tab controls. Cart actions still require the existing exact adapter evidence.
- Added fail-closed validation for model-provided `selector`, `css`, `xpath`, `script`, `code`, `coordinates`, `url`, and `endpoint` fields.
- Updated the model system contract to bounded public-page tasks and observed target IDs only.
- Repaired startup through the official `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` path and an observable error callback. The old action handler that awaited `setOptions` before `open` and swallowed rejection was removed. Native Side Panel behavior remains unverified because the available Puppeteer driver cannot perform a documented native toolbar action.

## TDD evidence

### RED

Added `tests/browser-general.test.mjs` before production changes and ran:

```powershell
node --test tests/browser-general.test.mjs
```

Observed exit `1`, 3 tests failed for the intended missing behaviors: ordinary public click was blocked by the shopping-only gate; unsupported execution fields were accepted; and `core/startup.js` did not exist.

### GREEN

After the minimal implementation changes, reran the same command. Observed exit `0`: **3 tests passed, 0 failed**.

## Complete verification

```powershell
node --test
```

Exit `0`; **37 tests passed, 0 failed, 0 skipped, 0 cancelled**.

```powershell
$files = Get-ChildItem -Recurse -File -Filter *.js | ForEach-Object { $_.FullName }
$failed = @()
foreach ($file in $files) { node --check $file; if ($LASTEXITCODE -ne 0) { $failed += $file } }
if ($failed.Count) { exit 1 }
```

Exit `0`; syntax checked **12 JavaScript files**.

There is no package test script or build/lint script in the supplied `package.json`; the repository's runnable validation is the Node built-in test suite plus syntax checks above.

## Final file hashes

SHA-256:

```text
manifest.json                  EEE99A3DC3D1A43EDFFE062F483359E63D677B4353D450A9BF239FE2003860C7
package.json                   45230FBD0B6AA6C2C7603A89465F5F6BEB08FBF000ACE05F28CA5748914BA514
worker.js                      1B0002A85182FC3006158CB25A7C724152DBCED06023F44D0A897BBC3981C756
panel.html                     B85A267007267969477426C5BF885DB5A2F67C3C8A2B1A19FA54E345B7F23CD2
panel.js                       ACF425CBB2366D562717AEFD6747C43815F64A23E1870808A6BF6D91216790A8
bridge.js                      178C09029C9467558D341978FC0B44FCCC7B8E89DA9BB7D3D09A78058D125F8E
core/contracts.js              608101AFC10DB1AADA4489D613CE6F6601558DB62FC4D086AA50159292D602C8
core/policy.js                 5783CE87332D849A3FC3CA3BE61B8F9611EE08B41849247D363CB7A791787EB
core/model.js                  D8A0A180A1CA9DD8A6466A299B157A7B7AE1A899A3FAC760EAE2C4271211DA00
core/startup.js                9B83903AD3F5ABB8BE60A5177AA2A417D61AA40000EC136F2026734F42A6BFAB
tests/browser-general.test.mjs B15C145605DEC3D17D811090092C34119DAA4BC19974C07606
```

Deterministic candidate tree identity (relative paths plus file bytes, excluding `node_modules` and `.git`):

```text
CANDIDATE_TREE_SHA256 32C1F33D4CA59720B6315077241C1528B5A7B2CEE742BAD10AA6B5E70DD20876
CANDIDATE_FILE_COUNT 25
```

## Reusable native QA command

```powershell
$env:PUPPETEER_CACHE_DIR = (Resolve-Path '.work\tools\puppeteer-cache').Path
node '.work\tools\puppeteer-startup\native-cft-startup-baseline.mjs' `
  '.work\worktrees\toolbar-20261024-YYvz4\extension' `
  '.work\profiles\toolbar-startup-cft-20261024-YYvz4-headless-candidate' `
  '.work\qa-evidence\native-candidate-evidence.json'
```

The actual invocation used absolute resolved candidate/profile/evidence paths and Puppeteer `24.26.1` with cached CFT `141.0.7390.122`.

## Native coverage and limits

The capped probe ran once and exited `0`, but its evidence is **BLOCKED / NOT_RUN**, not a product pass. It recorded:

- no browser target, manifest observation, service-worker target, Side Panel API state, panel message, or native toolbar click;
- an ENOENT while reading the CFT version manifest at the tool-provided path;
- a synthetic-profile lock error (`The browser is already running ...`);
- the documented Puppeteer API inspection result that no native toolbar-action driver is exposed;
- Windows geolocation/USB access-denied noise.

No ordinary `panel.html` tab was counted as native success. A verifier with a native-toolbar-capable driver must rerun the baseline and candidate on fresh synthetic profiles.

## Process-exit statement

The cleanup attempt targeted only the candidate synthetic profile. Windows `Get-CimInstance Win32_Process` returned `Access denied`, so no candidate-profile process could be conclusively enumerated or terminated by command. The probe's recorded `browserPid` was `null`, and no matching candidate-profile process was returned by the failed inspection path, but process exit is **not independently confirmed**. No real Chrome profile or user browser was touched.

## Concerns for verifier

- Native toolbar/actual Chrome Side Panel opening remains unverified and must not be inferred from these tests.
- The existing old Shopee adapter/privacy/safety tests remain present and passed; they are not silently rewritten.
- The candidate contains an optional Shopee adapter path by design; only the common UI, worker admission, bridge classification, and policy are neutralized.
- The task-owned process cleanup status is unconfirmed due Windows process-inspection access denial; verify no synthetic CFT process remains before any rerun.
