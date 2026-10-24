# Implementation handoff — Browser Task Agent general slice

**Work item:** `browser-general-20261024-YYvz4`  
**Owner contract:** [`plan.md`](plan.md)  
**Prepared source:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension`  
**Baseline:** detached `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, recorded in `toolbar-baseline.json`  
**Mode:** implementation contract only; do not treat this handoff as test/build/browser evidence.

## Objective and hard boundaries

Implement one bounded general-browser slice under the neutral **Browser Task Agent** identity. On a user-invoked selected ordinary HTTP(S) tab, support rendered top-frame observe, bounded scroll, safe public text/search fill, and safe public same-origin click. Keep exact preview, one-use approval, fresh evidence, digest binding, and honest unknown outcomes. Keep the existing OpenRouter key/model/exclusion/session-only/privacy contracts. Shopee is only an optional example adapter; it must not be the product name or required setup.

Do not repair the startup/toolbar/Side Panel bootstrap in this slice. The parallel defect owner owns that root cause. Do not add broad permissions, a backend, arbitrary selectors, cross-tab behavior, silent cross-origin navigation, cookies, debugger, webRequest, bundled keys, local/sync/database/history, real accounts, live carts, checkout/payment/order behavior, or provider-credit QA. Do not install dependencies or claim tests here unless the separate implementation/verifier lanes actually run them.

## Current source trace to preserve or generalize

- `manifest.json:3-7`: product is Shopee-branded and currently has the least-privilege permission set plus only OpenRouter host access. Rename identity, not permission scope.
- `panel.html:2,5-19`: title, heading, disclosure, required Shopee region selector, Malaysia cart copy, and task buttons need neutral UI/origin-status treatment.
- `panel.js:1-3,12-17`: imports/populates `SHOPEE_REGIONS`, renders Malaysia wording, and sends region-bound START/RUN_PLAN/ADVANCE messages. Replace common setup with invocation-origin status while retaining optional adapter display only when applicable.
- `worker.js:1,9,40-57`: config and START currently require `normalizeRegion` and exact configured origin. General START should validate ordinary HTTP(S), capture exact `tabId`/origin, and bind the run to them. Leave `worker.js:16-27` lifecycle and `worker.js:88-89` startup/toolbar bootstrap to the parent/parallel defect contract; do not use this handoff to fix bootstrap.
- `bridge.js:10-12,27-40`: current sensitive/autocomplete checks and bounded target registry are valuable; `publicShoppingControl` and product-only extraction are too narrow. Emit generic conservative control class/public-action evidence while keeping top frame, visibility, enabled state, local context, same-origin metadata, bounded text, and fingerprints.
- `bridge.js:47-50`: preserve stale fingerprint rejection and post-action `unknown` behavior. Never turn a target ID into a selector or execute model-provided code.
- `core/policy.js:2,4-5,25-44`: replace the shopping-only public-control gate with generic classification, retaining/expanding sensitive and destructive deny behavior. Keep exact cart validation behind the optional adapter.
- `core/contracts.js:1-50`: action vocabulary remains only `observe`, `scroll`, `click`, `fill`; keep bounds and expected-condition validation. Add fail-closed checks for selector/CSS/XPath/JS/script/coordinate/endpoint fields rather than passing them through.
- `core/engine.js:18-21,57-73`: preserve fresh post-action evidence and approval recheck. Change only Malaysia-specific error text/assumptions to captured-origin wording; digest must continue to bind run, tab, origin, document nonce, snapshot, URL, canonical target, action, and expected result.
- `core/model.js:29-47`: retain bounded rendered evidence, non-streaming OpenRouter call, strict proposal validation, and provider errors. Update the system contract to generic public pages and target IDs only; explicitly forbid selectors, scripts, coordinates, endpoint changes, secrets, account/payment/identity/defense controls, and cross-origin actions.
- `core/model-catalog.js:1-54`, `core/store.js:1-15`, `core/logger.js:1-8`: preserve live all-permitted text catalog, cheap/default preference, exact GPT/Claude Fable exclusions, direct masked key/session behavior, minimal metadata, bounded sanitized logs, and memory-only raw context.
- `core/shopee.js:1-32`: keep as an optional adapter/example boundary. Its exact Malaysia origin and cart-intent checks are historical adapter rules, not common Browser Task Agent setup.

## Exact implementation checklist

### 1. Manifest/package and user-visible naming

- Change manifest `name`, `description`, package `name`, panel `<title>`, `<h1>`, status strings, button labels, and default download/log filename to neutral Browser Task Agent language.
- Remove Shopee/Malaysia from the common disclosure, setup heading, task placeholder, run button, and idle status. The first-use disclosure must still explain scoped page-context provider processing, per-action supervision, extension-local clearing versus provider retention, and manual/blocked sensitive actions.
- Keep MV3, `sidePanel`, `activeTab`, `scripting`, `storage`, and exact OpenRouter host permission only. Do not add `<all_urls>`, `tabs` for convenience, cookies, debugger, webRequest, wildcard hosts, or remote code.

### 2. Setup, invocation, and run origin

- Replace the required region `<select>` and `SHOPEE_REGIONS` setup flow with a current-origin status and clear instruction to invoke on an ordinary HTTP(S) selected tab. No country/region is inferred or required.
- Preserve the user’s explicit Start/Observe action. At START, accept only a valid ordinary `http:`/`https:` sender/selected-tab URL; reject browser/extension/file/other privileged URLs with a concrete message. Capture exact origin and tab ID in `run`; never silently query/control another tab or open a new one.
- Every bridge call, observation, target, approval, dispatch, and post-action result must check the same run tab and exact origin. If the page redirects/changes origin, the tab closes, activeTab access is missing, or a target is in a cross-origin iframe/new tab, stop and require fresh user invocation. Do not weaken the existing digest/fresh-target checks.
- If the startup repair requires an interface change, document the message contract for the parent; do not change the startup listener/action bootstrap in this feature diff.

### 3. Generic rendered target classification

Implement one conservative classifier, in a small generic core module or a clearly separated replacement for the current shopping predicate:

- **readOnly:** observe/scroll only.
- **publicText:** visible plain text/search/url input or textarea with a non-sensitive role/label/context; reject password/hidden/file, sensitive autocomplete, account/identity/contact/payment semantics, and ambiguous custom widgets. The value is the exact user-requested value and is shown before approval; do not log it.
- **publicClick:** visible same-origin button/link or clearly labeled ordinary control with enabled state and non-destructive public semantics. Reject account/login/registration, identity/contact, password/OTP/verification/CAPTCHA, payment/card/CVV/billing/checkout/order/purchase, delete/remove/discard/unsubscribe/deactivate/terminate/transfer/publish/irreversible confirmation, native-dialog/file controls, ambiguous “submit/confirm/send/save/continue/next” contexts, and cross-origin/new-tab hrefs.
- **manualOrBlocked:** anything outside the evidence contract. Show reason and manual next step; never ask the model for a selector fallback.

Keep target IDs assigned by the bridge and resolve actions only against the current registry/fingerprint. Model output may contain `targetId` but never CSS/XPath, JavaScript, selectors, coordinates, arbitrary URLs, or endpoint instructions. Prefer rejecting unsupported fields at proposal validation, not silently interpreting them.

### 4. Policy, approval, and outcome behavior

- `observe` and bounded `scroll` may remain read-only. Every generic `fill` and `click` must produce a preview and require exact one-use approval.
- The preview must show action type, exact run origin, target label/fingerprint, safe expected condition, and for fills a visibly bounded/redacted value policy. Do not show or persist sensitive field values because such fields must be blocked.
- Before dispatch, re-observe and verify same tab/origin, document nonce, snapshot ID, target fingerprint, action, and digest. Invalidate approval on any mismatch. Do not replay an uncertain dispatch.
- After dispatch, re-observe and mark only fresh matching evidence as verified. Otherwise show “action sent; outcome unverified”/unknown. Never convert a bridge `unknown` to success.
- Retain exact optional shopping cart approval (`itemId`, label/link/fingerprint, variant/options, positive quantity, control fingerprint, region/adapter ID, expected result) and all checkout/payment/order blocks. No generic path may create a cart action without the adapter’s complete evidence.

### 5. Model/provider/privacy regression

- Keep direct masked OpenRouter key entry, session-only key/config/minimal metadata, lifecycle clear behavior, bounded sanitized logs, and raw page snapshots/prompts/field values in memory only.
- Keep live catalog refresh, all permitted text-chat model choices, actual capability labels, cheap-default computation, and exact outgoing GPT generation `>=6` / literal Claude Fable generation `>=5` exclusions. Revalidate the selected live catalog entry immediately before every request.
- Update the model system/user contract from shopping language to bounded public-page tasks. The model is a proposal generator; only observed target IDs and the four action types are accepted. Do not allow page text to redefine policy, permissions, endpoint, origin, or approval.

### 6. Fixtures and focused verification contract

Add separate synthetic fixture/contract cases (without changing historical adapter expectations):

1. `docs-search`: public same-origin search input + Search button + same-origin result change; prove observe, approved fill, approved click, fresh result evidence.
2. `article-reader`: long text + bounded scroll + same-origin next/load-more control; prove read/scroll/click and block new-tab/cross-origin link.
3. `unit-converter`: plain value field + non-destructive Convert button + rendered result; prove generic fill/click without shopping/account/payment.

Also cover `sensitive-form` (login/password/email/card/delete/OTP/CAPTCHA controls blocked/manual), `cross-origin-link`, privileged URL/no activeTab access, empty page/no targets, stale target, changed-origin redirect, provider/catalog errors, and a 320px-wide panel with no critical horizontal overflow. Keep old `tests/shopee.test.mjs` exact Malaysia/cart assertions and old privacy/safety history as separately traceable adapter/regression records. Do not silently rewrite those tests; add a dated `browser-general` test file or copied cases for the new contract. The verifier, not this owner, must issue the pass/fail verdict.

## Handoff and evidence requirements

Return to the parent with: changed-file list, source hash/candidate identity, explicit startup-contract dependency, and a note that no native toolbar/Side Panel claim is made by fixture or panel-page evidence. The independent verifier must receive the frozen criteria in `plan.md`, exact fixture names/start URLs and viewport (including 320px panel), test commands actually run, candidate bytes/source identity, and separate evidence/report paths. Do not mark any GB criterion passed from a plan, source inspection, ordinary `panel.html` loading, or a model mock alone.

The parent must join this handoff with the parallel startup owner and dispatch one distinct implementer in the shared candidate. This owner has not edited product files, run CLI tests, installed dependencies, opened a browser, called OpenRouter, or verified native behavior.
