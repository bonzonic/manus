# Shopee/OpenRouter implementation report

**Status:** implemented in the prepared detached worktree; **not independently verified, not packaged for shipping, and live-unverified**.

**Source directory:** `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/architecture-20261024-YYvz4/extension`

**Baseline:** detached clean `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`

**Candidate identity:** uncommitted `extension/` product tree on the detached baseline above. `git status --short` reports only `?? extension/`; no commit, branch switch, merge, push, publication, dependency installation, or root shared-checkout edit was performed.

## Implemented files

- `manifest.json`, `package.json`: MV3 side panel with `sidePanel`, `activeTab`, `scripting`, `storage`, and only `https://openrouter.ai/*` host access.
- `core/contracts.js`: bounded Proposal/Action/Expected validation; only observe/scroll/click/fill.
- `core/policy.js`: sensitive-control blocking, exact click/fill approval, cart field checks, SHA-256 binding over run/step/tab/origin/document/snapshot/action/target/cart data.
- `core/engine.js`: pause/cancel handling, one pending action, one-use approval, checkpoint-before-dispatch, no-replay interrupted state, and honest unknown outcomes.
- `core/store.js`: schema-checked `chrome.storage.session` wrapper with bounded in-memory test fallback.
- `core/model-catalog.js`: live OpenRouter catalog endpoint, text/capability/expiry/context filters, deterministic prompt+completion+request cost estimate, cheap eligible default, GPT-6+ and exact Claude Fable-5+ exclusion, fail-closed selection.
- `core/model.js`: fixed OpenRouter Chat Completions endpoint, Bearer header, bounded non-streaming request, JSON proposal validation, sanitized errors, and revalidation through the selected live catalog.
- `core/shopee.js`: explicit region list/normalization, rendered-page classification, product candidate evidence, variant evidence retention, exact cart intent, and sensitive-label policy.
- `core/logger.js`: bounded sanitized timeline and JSON export; no bearer/key-like strings, query URLs, raw snapshot, or field-value logging.
- `bridge.js`: isolated top-frame rendered-DOM observation and private snapshot registry for the four tools; no cookies/storage/debugger/hidden endpoint access.
- `worker.js`: sole action authority for session configuration, catalog, region/origin checks, injected bridge calls, proposals, approvals, pause/resume/cancel, session state, and log state.
- `panel.html`, `panel.css`, `panel.js`: accessible utility panel, explicit region selector, masked session key entry, live model/pricing/capability list, first-use disclosure, exact cart preview, pause/cancel, and sanitized export using `textContent` for dynamic data.
- `tests/*.test.mjs`: focused contract tests for manifest, provider/catalog, Shopee evidence/cart, policy, engine, logger, and required safety names.

## TDD evidence

### RED

At 16:21:04 +08:00, the explicit command below ran 23 tests. All 23 failed through the test helper’s explicit “implementation is not present yet” assertions (with the manifest absent), rather than a missing runner or dependency:

```powershell
node --test .\extension\tests\model.test.mjs .\extension\tests\shopee.test.mjs .\extension\tests\policy.test.mjs .\extension\tests\logger.test.mjs .\extension\tests\engine.test.mjs .\extension\tests\manifest.test.mjs
```

### GREEN

The same explicit suite finished **23 passed, 0 failed, 0 skipped** at 16:24:44 +08:00. The same run then checked all `*.js` files with `node --check`; result: `syntax-check: PASS`.

The final suite covers: catalog live-price parsing, prompt/completion/request cost, expired/non-text rejection, GPT-6+/Claude Fable-5+ UI/outgoing exclusion, unknown model fail-closed, Bearer header and sanitized provider errors, scoped manifest, explicit region, variant evidence, exact cart item/variant/quantity approval, stale fingerprint invalidation, blocked checkout/payment/login/CAPTCHA, pause/cancel/no-replay, unknown cart outcome, sanitized logs, oversized proposal rejection, and untrusted tool rejection.

No real OpenRouter request, real Shopee navigation, cart mutation, login, CAPTCHA interaction, checkout, payment, `.env` read, or key packaging was performed. The provider and browser boundaries are dependency-injected in tests only.

## Audit result

Manifest unit tests and direct inspection pass the scoped permission contract: no `<all_urls>`, `tabs`, `debugger`, cookies, webRequest, or remote code permission; only the exact OpenRouter host permission is present. A final non-test source scan found no key-shaped literals, dynamic provider endpoint, `eval`, or hidden Shopee endpoint. One combined PowerShell regex produced a false positive on the benign panel placeholder line; individual literal checks showed no matching forbidden string.

## Fresh verifier concerns / blockers

- Chrome load/unpacked and native side-panel behavior were not run by this implementer.
- No live OpenRouter catalog/provider call was made; the coordinator/fresh verifier must supply local configuration if they choose to test it and must not treat fixture tests as live evidence.
- Shopee rendered-DOM selectors and actual search/product/cart feedback remain **live-unverified** until coordinator-controlled browser evidence.
- The candidate is not a shipping ZIP and has no independent verifier verdict. Coordinator packaging is intentionally left to the coordinator after review.
- `bridge.js` uses synthetic DOM interaction; pages that reject synthetic events are unsupported rather than bypassed.

## Frozen candidate SHA-256 hashes

```text
2C3907ED185C9F1B249B80D4D83FE59AF8EBFC8C76AF51025FBBA4505638B0D8  extension/bridge.js
567D98DE89ABBF276D76CEFD8F793BD9E99F4FF8ACD8E339EDDBB199344724A2  extension/core/contracts.js
CAE90F5986C2FAD947EA25BB88FB4550396F27A2ACC21F22DF0C4A8E42E8F34A  extension/core/engine.js
CFB854E971FF9A6B0A93F6E9708BC45DDC6D2821B6FFD7117A67EAF5DF9DBBC3  extension/core/logger.js
D7BDB762069D624519B5A87CA48ADB116EC4A85F940FD6B1FEF72A7542BD1C26  extension/core/model.js
ADE9C5FEF1763E5C528701D2B9F6458D428FC0B50DB1997CCFB20DDC3D8D3EB2  extension/core/model-catalog.js
5D4FF7E0D51B5A6B8DCAC582015CEA0D16E47C346D2D4E83782D396B5F69AC26  extension/core/policy.js
B103E52ADAFC5EA459A66208C712ABFA8D685902A1BF4D14ADF323D55FD54DCA  extension/core/shopee.js
C6A9E04285703022135A06F94FBF2CAE20B53785E560547353DB7F92389A993A  extension/core/store.js
17AD950A787490AB8BA67BD9AD078DCB984842BBC572F6846DC7E6CBEC091FD5  extension/manifest.json
4CFDB8B833AA71BB0AC020E7C82A2A7301FD1A2AF5F57A91891B82856528FD03  extension/package.json
FA0563801EDB02ECB961BBA2FBF2878480F5CCEDD492D128089B09B13796B9C2  extension/panel.css
E3BD54E56BCDC85B42BB8E0D589032A20E9D28D7B4ACCE7AF3825BC259612CAC  extension/panel.html
EAD126552F04CD1DC5B5D43AEBD14F434527FC1E6EF724D3FA6D2FDC07B8E1E3  extension/panel.js
860F9F1BA7D36790DDBA334DC3DF819651C0340AE1551D7302901CA93F3A7748  extension/tests/engine.test.mjs
77992DF414B7CAB4B697AC068090EDDA43F8C4E6D7A711DF9DEAAD8B44EE4D48  extension/tests/logger.test.mjs
77C282244D83E4D39746F5DD1C7A2BBFA998961A615B1BE66AF647221C2D3825  extension/tests/manifest.test.mjs
4FD1CC59D75A57D74BF5E80D6CE2FA4BD36433A0EB17259AA35285BFF5C935D2  extension/tests/model.test.mjs
1EE5716C22A947E97BE7E3AA861F896E56547343F51A39C6EDA86E350BD94E90  extension/tests/policy.test.mjs
2234E49FDA001FF2C8B2EF8C53724AFFB6E94AFA8E6656B84B116FBBEAC28C99  extension/tests/shopee.test.mjs
F40898F6EC0624EC7B7F21A2D5374A10513C5CA04017CE7F8A914274CD4C8F9C  extension/worker.js
```
