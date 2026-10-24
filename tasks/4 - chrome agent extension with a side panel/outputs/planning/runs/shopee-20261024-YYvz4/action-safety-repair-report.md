# Action-safety repair report — Shopee Malaysia side-panel agent

**Status:** amended candidate complete for the scoped repair; independently unverified and live-unverified.

**Source directory:** `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/ui-privacy-20261024-YYvz4/extension`

**Report scope:** This implementer repaired the still-material preliminary-audit findings 3, 4, 5, 6, and 8 in the privacy-amended fork. The existing Malaysia-only origin, direct masked key setup, all-permitted-model picker, trusted minimal session storage, memory-only raw context, and lifecycle changes were preserved. No original/main worktree, owner plan, audit/verifier record, or port 31417 was touched.

## Actual source and test diff

- `bridge.js` — expanded rendered observation to emit product candidates with visible title, link, price/currency, fingerprint, rendered variant evidence, selected options, positive quantity evidence, cart messages/fingerprint, content fingerprint, and target context. Target metadata now includes autocomplete/form sensitivity, page-local sensitive context, explicit public-shopping classification, add-to-cart role, and viewport state. Fill returns only a boolean value-match signal; click remains unknown until engine post-observation.
- `core/policy.js` — add-to-cart controls require a `cartIntent`; exact item ID/label/link, variant ID/label with rendered evidence, positive quantity, region, target fingerprint, and expected result are checked against the current snapshot. Cart intent is rejected when model-invented or ambiguous. Sensitive checkout, payment, login, identity, address/contact, OTP/verification, and generic continuation/confirmation controls are blocked. Clicks are limited to explicitly rendered public search/shopping controls.
- `core/engine.js` — approval dispatch now performs a fresh same-origin observation, target-fingerprint comparison, real policy evaluation, and cart-evidence recheck before executing. Any changed/ambiguous state returns `NEEDS_USER` with no effect. Post-action status is derived from a fresh observation and an expected-condition/evidence delta; unknown clicks remain unknown. Added known-reference validation for finish evidence.
- `worker.js` — finish proposals obtain a fresh bridge observation, require same-origin current evidence and known snapshot/action evidence references, reject invented refs, and never turn a model finish into completion. The existing worker approval path now uses the engine’s fresh pre-dispatch gate.
- `tests/safety-repair.test.mjs` — added focused boundary tests for missing/model-invented cart evidence, origin/target change before approved dispatch, observed post-action delta, generic/sensitive controls, and invented finish refs.
- `tests/engine.test.mjs` — updated fixtures for exact Malaysia origin, fresh snapshot/target binding, required scroll expected condition, and fail-closed malformed cart behavior.
- `tests/policy.test.mjs` — updated the legacy add-to-cart assertion to require exact cart intent rather than approving a bare cart click.
- Task-root `outputs/planning/runs/shopee-20261024-YYvz4/how-to-try.md` — updated only for the changed bridge evidence, explicit public-control click boundary, fresh approval/post-action behavior, and the actual 31-test/live-unverified status.

## TDD and verification outputs

### Focused RED before fixes

Command:

```powershell
node --test .\\tests\\safety-repair.test.mjs
```

Result: **5 failed, 0 passed, 0 skipped**. The expected failures were:

1. bare add-to-cart click was incorrectly approved;
2. approved dispatch executed after origin change;
3. post-action rendered delta was not promoted to verified;
4. generic Proceed/sensitive controls were not blocked comprehensively;
5. finish evidence validation helper did not exist.

### Focused GREEN after fixes

Command:

```powershell
node --test .\\tests\\safety-repair.test.mjs
```

Result: **5 passed, 0 failed, 0 skipped**.

### Intermediate full-suite boundary result

The first full run after code changes reported **28 passed, 3 failed**. The three failures were stale legacy expectations that asserted the now-prohibited behavior: bare add-to-cart approval, a malformed cart fixture being treated as an uncertain dispatch, and a scroll fixture without the required expected condition/fresh URL-target context. The tests were corrected to assert the tightened contract; source behavior was not weakened.

### Final full suite and syntax

Command:

```powershell
$files = Get-ChildItem .\\tests\\*.test.mjs | Sort-Object Name | ForEach-Object { $_.FullName }
node --test @files
$testExit = $LASTEXITCODE
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
$syntaxExit = $LASTEXITCODE
Write-Output "testExit=$testExit syntaxExit=$syntaxExit"
```

Final result: **31 passed, 0 failed, 0 skipped; `testExit=0`; `syntaxExit=0`**. All test and syntax processes exited normally; no background process was left by this repair.

The final suite includes the prior model, logger, manifest, privacy/lifecycle, Shopee evidence, and engine/policy coverage plus the five new safety-repair boundaries.

## Requirement findings repaired

**Finding 3 — rendered cart provenance:** fixed in bridge and policy. The model cannot supply a plausible item/options/quantity alone. The cart target must be an explicit public add-to-cart control, and all bound fields must match current rendered product-card/selected-option/quantity evidence. Missing or ambiguous evidence stops with `NEEDS_USER` before effects. The approval preview remains supplied by the existing panel from the exact action annotation; no fabricated proof is created by bridge or worker.

**Finding 4 — semantic post-action observation:** fixed in engine and bridge. Bridge click execution returns only “action sent; awaiting fresh post-action observation.” The engine observes after the effect and marks verified only when the current expected condition and a real URL/text/cart/viewport/value evidence delta are observed. Otherwise it records `unknown` / unverified; promise completion or a fixture return is not success.

**Finding 5 — fresh approval dispatch:** fixed in engine. Before every approved click/fill/other effect, the engine re-observes, checks exact Malaysia origin, checks the bound target fingerprint, reruns policy, and for cart actions revalidates every cart field against the fresh snapshot. A redirect, target change, evidence change, ambiguity, or missing fresh observation clears approval and returns `NEEDS_USER` without dispatch or retry.

**Finding 6 — sensitive and continuation controls:** fixed in bridge and policy. Target sensitivity now considers rendered local form/ancestor context, names/IDs, autocomplete semantics, role, and page text around the control. Checkout, buy-now, confirm/order, payment, login, identity, address/contact, phone/email, password, OTP/verification, and defense controls are blocked even when surfaced as Proceed/Continue/Confirm or without the sensitive word on the visible button. Arbitrary clicks are blocked; only explicit rendered public search/shopping controls are actionable. No debugger, hidden API, cookie/storage read, or bypass was added.

**Finding 8 — finish evidence provenance:** fixed in worker and engine. A model finish is accepted only as a partial/needs-user state when every reference matches a fresh same-origin observation or a known prior action evidence reference. Invented or stale refs are rejected with a blocked `NEEDS_USER` result; no finish claim becomes completion evidence by assertion alone.

## Remaining unsupported or live-unverified checks

- No live Shopee page was opened. Actual Shopee selectors, native Chrome MV3 side-panel loading, activeTab injection, real product-card/variant/quantity markup, regional redirects, add-to-cart mutation, cart confirmation, closed-tab behavior, login/CAPTCHA/anti-bot behavior, and cross-origin navigation remain **live-unverified**.
- No real cart click, provider request, OpenRouter catalog refresh, API-key use, packaging, install, publish, commit, merge, or network action was performed.
- The bridge now has real DOM traversal code, but this report’s evidence is unit/contract-level only; a fresh independent verifier must obtain browser evidence before promoting FC-07–FC-12 or claiming shipping readiness.
- The current extension remains a local/private unpacked development path. Session key handling and extension-local clearing do not promise provider-side zero retention.

## Final SHA-256 hashes of the complete candidate extension tree

```text
A2EE70F67FA9FC09440610E6890326C2E2A5DC91A562F4BFED00C3C850ED36DF  bridge.js
567D98DE89ABBF276D76CEFD8F793BD9E99F4FF8ACD8E339EDDBB199344724A2  core/contracts.js
92F77FA374325E40BF2D6A1DBFEA0C1CFC7B8F22B2E25224C2D500E13508466E  core/engine.js
CFB854E971FF9A6B0A93F6E9708BC45DDC6D2821B6FFD7117A67EAF5DF9DBBC3  core/logger.js
D7BDB762069D624519B5A87CA48ADB116EC4A85F940FD6B1FEF72A7542BD1C26  core/model.js
97296F2CF65ED9E5CA6607BF3B5B27A8B76C9CF1D4B3C272EED22079E23EE734  core/model-catalog.js
232676A4EE6FCBDD26A2D36C17E7E564608F558978621868C1977009D453C9E8  core/policy.js
28D96F0D76371388950CC448D7FB206606CBBDA6304F3EAD0AC5C3DB9C23193D  core/shopee.js
187CD69EB04AE02F2D93290CC25DA0C90D7FD17B123F22DC414A8D9C667646D6  core/store.js
17AD950A787490AB8BA67BD9AD078DCB984842BBC572F6846DC7E6CBEC091FD5  manifest.json
4CFDB8B833AA71BB0AC020E7C82A2A7301FD1A2AF5F57A91891B82856528FD03  package.json
FA0563801EDB02ECB961BBA2FBF2878480F5CCEDD492D128089B09B13796B9C2  panel.css
2F6DB36C7BAA157DC9C23D3EB0BDE567014C4DFE9A23FF765F05D3036474F1B2  panel.html
C8BE0821C5FC771BD37B087BC1201CDF16A6859108441ECDAA5054CB8CC21BEF  panel.js
575319D1B4C682D8A3E40B241B0562F81036CD7B3886791320498654C7B47B7D  tests/engine.test.mjs
77992DF414B7CAB4B697AC068090EDDA43F8C4E6D7A711DF9DEAAD8B44EE4D48  tests/logger.test.mjs
77C282244D83E4D39746F5DD1C7A2BBFA998961A615B1BE66AF647221C2D3825  tests/manifest.test.mjs
4FD1CC59D75A57D74BF5E80D6CE2FA4BD36433A0EB17259AA35285BFF5C935D2  tests/model.test.mjs
6A244BD342F44F9AB477B5F3C0D843DDDBFDAF21D26560B02E8FF6F92FAA4425  tests/policy.test.mjs
18E1DD839843EFBB83297EA0473617D7A1A12F563B68E105EACD8DC999A10098  tests/privacy-amendment.test.mjs
A7B702E831F7D1AE474A77C494E05B99F4BCDFFD44111014AD5B670E7125AE4A  tests/safety-repair.test.mjs
F13C52F554A4924A67C57A82ABE411465E79E3BD1785017383E29CF83D27E02E  tests/shopee.test.mjs
5EA0F7BD92C00E7E475F86491270C37CB43CF5A73339E0C34F83F2849FE0E48C  worker.js
```

**Hash note:** no source file outside the listed candidate tree was used. The report and `how-to-try.md` are task-root records and are not part of the extension-tree hash list.
