# Verifier-fix retry report — Shopee Malaysia side-panel candidate

**Work item:** `shopee-20261024-YYvz4`  
**Retry lane:** single code retry after independent verifier failure  
**Candidate source:** `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/ui-privacy-20261024-YYvz4/extension`  
**Status:** code findings repaired locally; native/live verification remains blocked. **No PASS claim is made.**  
**Baseline identity retained:** detached baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; no candidate commit was created.

## Scope and constraints honored

The retry read `verify-report.md` first, then `plan.md`, `requirement-delta.md`, and the candidate fork. Edits were confined to the prepared complete fork. No commit, merge, publish, dependency installation, native browser action, OpenRouter/provider request, Shopee navigation, cart mutation, checkout, payment, key access, or external agent was used.

The exact Malaysia origin (`https://shopee.com.my`), direct key/session-only storage path, all permitted model UI and exclusions, manual checkout/payment boundary, exact cart evidence requirement, unknown/no-replay behavior, sensitive-control blocks, and budgets were not broadened or weakened. The stale `parallel-snapshot.json` was retained as historical input only; the fresh final identity below is computed from the actual candidate tree.

## Independent RED findings addressed

The independent report recorded these pre-repair observations:

1. The captured OpenRouter body had `providerPayloadHasProductCards=false`, `providerPayloadHasSelectedOptions=false`, `providerPayloadHasQuantityEvidence=false`, and `providerPayloadHasCartEvidence=false` because `core/model.js` serialized only URL/title/text/targets.
2. With a realistic separate product-card fingerprint (`href|label|price`) and add-button fingerprint (`BUTTON|label|`), cart policy returned `block` because the product fingerprint was compared directly with the control fingerprint.
3. Replacing document/snapshot identity while retaining origin, URL, target ID, and target fingerprint still executed the approved action (`sameTargetChangedSnapshotExecuted=true`, `resultPhase=RUNNING`, `resultStatus=verified`).

## Minimal diff and repairs

- `core/model.js`: added an in-memory bounded/sanitized evidence projection. The provider request now carries bounded `productCards`, each card’s bounded variant evidence, `selectedOptions`, scalar `quantityEvidence`, and bounded `cartEvidence` under `renderedPage`. It does not write this projection to session state or logs.
- `core/shopee.js`: retained the product-card `fingerprint` and added a required exact add-control `controlFingerprint` to `makeCartIntent`.
- `core/policy.js`: requires `controlFingerprint` to equal the fresh rendered target fingerprint and requires the item fingerprint to equal the fresh rendered product-card fingerprint, in addition to label, href, variant, quantity, region, and expected-result checks.
- `bridge.js`: derives a stable per-document nonce and a content/evidence-bound snapshot identity. Unchanged rendered evidence can remain executable after a fresh observation; changed URL, target/card/options/quantity/cart evidence, or document identity produces a different binding.
- `core/engine.js`: recomputes `approvalDigest(run, action, freshSnapshot)` during fresh approval checking and blocks dispatch when the stored approval digest no longer binds the fresh document/snapshot. Value/viewport postconditions use the fresh observation itself rather than requiring an artificial new snapshot ID.
- `tests/model.test.mjs`: added a provider-body capture regression with oversized realistic evidence, asserting all four evidence collections are present and bounded.
- `tests/safety-repair.test.mjs`: added realistic bridge-shaped separate card/control fingerprints, same-target replaced-document/snapshot rejection, and a positive unchanged-page approved-action dispatch test.
- `tests/shopee.test.mjs`: updated the exact cart-intent contract to include the separate control fingerprint.
- `tests/engine.test.mjs`: updated the positive dispatch fixture to use a real approval digest.

## RED → GREEN evidence

The RED state is the independent verifier’s captured runtime-wiring output above. The focused regressions added in this retry now pass:

- `providerIncludesBoundedRenderedCartEvidenceInMemory`: confirms 24 bounded product cards, 24 bounded variants per card, 24 selected options, scalar quantity evidence, and 20 bounded cart messages in the captured request body.
- `cart-add-control-requires-rendered-exact-intent`: confirms a separate realistic card fingerprint plus add-button fingerprint approves valid exact evidence and blocks an invented item label.
- `same-target-replaced-document-and-snapshot-invalidates-approval`: confirms the same target and same-origin URL cannot dispatch after replacement document/snapshot IDs.
- `unchanged-page-approval-remains-executable`: confirms a legitimate approval whose fresh page identity is unchanged still executes.
- `post-action-success-requires-fresh-observed-delta`: confirms cart success still requires the fresh post-action rendered delta.

## Full test and syntax commands

Executed from the candidate directory:

```powershell
$ErrorActionPreference='Stop';
$tests=Get-ChildItem .\tests\*.test.mjs | Sort-Object Name;
node --test @($tests.FullName);
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE };
Get-ChildItem -Recurse -Filter *.js | ForEach-Object {
  node --check $_.FullName;
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Final output summary:

```text
TAP version 13
1..34
tests 34
pass 34
fail 0
cancelled 0
skipped 0

JavaScript syntax checks: 11 files, 0 failures, exit code 0
```

An earlier local invocation had five test-helper failures because the newly added fixtures attempted to import `approvalDigest` from `engine.js` instead of its owning `policy.js`; those test-only import errors were corrected, and the complete rerun above is the final result.

## Fresh final candidate identity

Computed from the actual 23-file candidate tree after the final test/syntax run. Each line is SHA-256 of the UTF-8 file, followed by the slash-normalized relative path. The tree fingerprint is SHA-256 of the UTF-8 sorted lines in the form `SHA256  relative/path`, with a trailing newline.

```text
22CF5FA6BA7455807275317DFBC3B92FF4BD5A4B6F680CE4874607A2E29FFCA5  bridge.js
567D98DE89ABBF276D76CEFD8F793BD9E99F4FF8ACD8E339EDDBB199344724A2  core/contracts.js
327298DC12576B3975914EACA1D8A690086FF46169712724FDB161E2187B40F2  core/engine.js
CFB854E971FF9A6B0A93F6E9708BC45DDC6D2821B6FFD7117A67EAF5DF9DBBC3  core/logger.js
D1AE28430F0201308C29CC690ED8F282324BFEDAED01C3296536FDDA1C399BC7  core/model.js
97296F2CF65ED9E5CA6607BF3B5B27A8B76C9CF1D4B3C272EED22079E23EE734  core/model-catalog.js
C765F47D6BFA65A84EBF7D3D36B5069ED92FEAB9F350DDDCA7895377409FB5B0  core/policy.js
1D82392C48BD103C4F7B3A7C94453D5791CB9CF54E67EDF3EEE55CB18E535FE2  core/shopee.js
187CD69EB04AE02F2D93290CC25DA0C90D7FD17B123F22DC414A8D9C667646D6  core/store.js
17AD950A787490AB8BA67BD9AD078DCB984842BBC572F6846DC7E6CBEC091FD5  manifest.json
4CFDB8B833AA71BB0AC020E7C82A2A7301FD1A2AF5F57A91891B82856528FD03  package.json
FA0563801EDB02ECB961BBA2FBF2878480F5CCEDD492D128089B09B13796B9C2  panel.css
2F6DB36C7BAA157DC9C23D3EB0BDE567014C4DFE9A23FF765F05D3036474F1B  panel.html
C8BE0821C5FC771BD37B087BC1201CDF16A6859108441ECDAA5054CB8CC21BEF  panel.js
45628197DACFD5CC372FC0EB9A90EA2CB551056CD5C84CFE7058F4011C602D73  tests/engine.test.mjs
77992DF414B7CAB4B697AC068090EDDA43F8C4E6D7A711DF9DEAAD8B44EE4D48  tests/logger.test.mjs
77C282244D83E4D39746F5DD1C7A2BBFA998961A615B1BE66AF647221C2D3825  tests/manifest.test.mjs
D59AA902DAD6FA0450F0023A12A1B07D912515765ED0AC4705F003970BDFEE0E  tests/model.test.mjs
6A244BD342F44F9AB477B5F3C0D843DDDBFDAF21D26560B02E8FF6F92FAA4425  tests/policy.test.mjs
18E1DD839843EFBB83297EA0473617D7A1A12F563B68E105EACD8DC999A10098  tests/privacy-amendment.test.mjs
EE647DE53A65BAB10D1D8FEC43A1077BB0E083523A49A1D633EF8BB805BCC18A  tests/safety-repair.test.mjs
14FACC0B865FD13779E57C4612C3E215CD7D13C254A99963C3973E533E6E6310  tests/shopee.test.mjs
5EA0F7BD92C00E7E475F86491270C37CB43CF5A73339E0C34F83F2849FE0E48  worker.js
```

**Final tree fingerprint:** `51DF73DC2F5FEFFC946472F9A208AF976E40E20FAB3B188187A52C8BFC166E65`  
**Final file count:** `23`

## Concrete concerns and blockers

1. This report is not a whole-product PASS. The independent report’s native Chrome load-unpacked, native MV3 lifecycle, live OpenRouter catalog/provider boundary, and real Shopee DOM/search/product/cart evidence remain unavailable in this environment.
2. The repair proves the mocked/dependency-injected safety and provider contracts only. It does not claim live provider behavior, native side-panel loadability, real selectors, redirects, anti-bot behavior, or a real cart mutation.
3. The stale supplied `parallel-snapshot.json` remains historical and must not be used as final candidate identity; use the fresh hashes and tree fingerprint above.
4. No retry-started background process remains. The synchronous Node test and syntax processes exited normally with final exit code 0. No native browser/provider/cart process was started.
