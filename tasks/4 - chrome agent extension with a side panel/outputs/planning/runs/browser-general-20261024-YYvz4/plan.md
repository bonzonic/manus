---
status: ready-for-implementation-contract
owner: om-feature
work_item: browser-general-20261024-YYvz4
updated: 2026-10-24
source_worktree: C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\4 - chrome agent extension with a side panel\\.work\\worktrees\\toolbar-20261024-YYvz4
baseline_sha: 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee
scope: planning-only
---

# Browser Task Agent — bounded general-browser feature plan

This is a new owner contract for the user-steered general-browser slice. It does not rewrite the prior Shopee-only owner record. The dated Malaysia-only amendment in `outputs/planning/runs/shopee-20261024-YYvz4/plan.md` §7–§8 and `requirement-delta.md` remains a frozen historical contract for that adapter/example; its exact-origin guard cases are not silently changed. The new contract changes the product identity and common execution boundary, while retaining the optional exact-cart adapter and all safety, credential, model, and retention constraints. No product code, tests, browser session, provider request, or native startup claim was performed by this planning stage.

## 1. Problem statement

The prepared MV3 package is branded and wired around a single Shopee region. `manifest.json:3-5` names the product “Supervised Shopee Side Panel Agent”; `panel.html:2,5-19` exposes Shopee-only title, region setup, task copy, and Malaysia cart language; `panel.js:1-3,12-17` populates only `SHOPEE_REGIONS` and starts a Shopee plan. In the common path, `worker.js:1,9,40-57` requires `normalizeRegion()` and rejects any tab whose origin is not the configured region. The DOM bridge labels targets as `publicShoppingControl` (`bridge.js:12,32`) and only product URLs are extracted as product cards (`bridge.js:35`). `policy.js:2,31,41` consequently blocks ordinary public controls unless they look like shopping controls.

The requested identity is a neutral **Browser Task Agent**. Its first useful slice is deliberately bounded: on a user-invoked selected ordinary `http://` or `https://` tab, it can observe rendered top-frame content, scroll, fill a non-sensitive public text/search field, and click a non-sensitive public same-origin control after the existing preview and one-use approval. It must be useful on ordinary non-shopping pages without promising arbitrary website automation. The run is grounded to one selected tab and the origin captured at invocation; it does not silently open tabs, cross origins, use privileged URLs, or control a second tab.

Sensitive account, login, identity/contact, payment/financial, verification/CAPTCHA, and destructive controls remain manual or blocked. Model output may name only observed target IDs; CSS/XPath selectors, JavaScript, arbitrary coordinates, endpoints, and page-provided instructions are never executable. The OpenRouter key remains user-entered and session-only; live eligible text models, exact generation exclusions, bounded sanitized logs, and memory-only raw context remain unchanged.

The startup/toolbar/Side Panel root cause is owned by the parallel defect task. This feature plan must not repair worker bootstrap or claim native Side Panel success; the parent joins the startup and feature contracts for one distinct implementer in the shared candidate.

## 2. Architecture changes

1. **Neutral product surface.** Rename the user-facing manifest name/description, package name, panel title/header, setup labels, buttons, status copy, and generated log filename to Browser Task Agent terminology. No product-facing header or setup copy may identify Shopee. Keep `core/shopee.js` only as an internal optional shopping/example adapter (or move it behind an adapter boundary); it is not the common identity or required setup state.

2. **Selected-tab/run-origin grounding.** Replace the required region selector with a read-only run-origin status. On an explicit user invocation, accept only a normal `http:` or `https:` tab URL with a non-empty host; capture `tabId` and `new URL(tab.url).origin` in the run. A run may observe or act only on that tab and exact origin. A changed origin, redirect to another origin, closed tab, new-tab target, iframe-only target, or unavailable `activeTab` access stops with a concrete user-action message and clears pending approval. There is no inferred country/region and no default shopping domain. An adapter may carry its own optional region metadata only when the user intentionally selects that adapter; the generic setup does not require it.

3. **Bounded generic control classification.** Replace the shopping-only `publicControl`/`publicShoppingControl` gate with a conservative rendered-control classification, keeping the current top-frame registry and fingerprint mechanism:
   - `readOnly`: observe and bounded scroll; no mutation.
   - `publicText`: visible `input` of type text/search/url or `textarea`/equivalent plain text control, with no password, sensitive autocomplete, sensitive name/id/label/context, file upload, hidden state, or account/identity/contact semantics. Fill remains exact-value preview plus one-use approval.
   - `publicClick`: visible same-origin button or link, or a clearly labeled non-destructive public control, with no sensitive/destructive/transaction/defense semantics. Click remains exact target preview plus one-use approval.
   - `manualOrBlocked`: sensitive, ambiguous, unsupported widget, cross-origin/new-tab, native dialog, file chooser, content that is not represented by the observed target registry, or a control whose safety class cannot be established.

   Classification is based on fresh rendered evidence (role, tag/type, label, href, autocomplete, local context, visibility, enabled state, and same-origin result), never on arbitrary model selectors. Keep `bridge.js:47-50` stale-target and post-action behavior; no action can bypass the registry.

4. **Policy and engine preservation.** Generalize `policy.js` so non-shopping `publicClick` controls can be approved, but retain the sensitive deny list and add explicit destructive/manual words such as delete, remove, discard, unsubscribe, deactivate, terminate, transfer, publish, or irreversible confirmation. Keep login/sign-in/register, password/OTP/CAPTCHA/verification, email/phone/address/identity, payment/card/CVV/billing, checkout/purchase/order, and account/profile controls blocked or manual. Keep `engine.js:57-73` fresh same-origin approval checks, target fingerprint comparison, document/snapshot identity, digest binding, no-replay behavior, and post-action outcome verification. Generic runs must use the captured `run.origin` in the same checks; do not weaken them to “same site,” URL prefix, selector matching, or stale evidence.

5. **Minimal permissions and data boundaries.** Retain `sidePanel`, `activeTab`, `scripting`, and `storage` only, plus the exact OpenRouter host needed by the provider. Do not add `<all_urls>`, `tabs` solely for convenience, cookies, debugger, webRequest, broad host permissions, remote code, or a new backend. Preserve user invocation as the authorization boundary. Keep `store.js:5-14` minimal metadata/session-only behavior, `logger.js:1-7` sanitized bounded entries, masked direct OpenRouter key entry, live catalog/all permitted model choices, GPT generation `>=6` and literal Claude Fable generation `>=5` exclusions, and raw snapshots/prompts/page text/field values/shopping detail in memory only.

6. **Optional shopping adapter.** The exact item/variant/quantity cart preview and add-to-cart approval in `core/shopee.js:22-32` may remain as an adapter-specific path. It must not widen the generic policy, expose checkout/payment/order tools, or become a required region setup. Historical Shopee adapter tests and Malaysia-only guard cases remain separately labeled and are not rewritten to make the new generic criteria appear satisfied.

## 3. User flow

From a cold install, the user invokes the toolbar/Side Panel on the selected ordinary HTTP(S) page. The neutral header says **Browser Task Agent**. Setup shows the current invocation/origin status (or “Invoke on an ordinary HTTP(S) tab to begin”), masked OpenRouter key entry, Refresh live model catalog, and all permitted text-chat model choices with IDs, prices, refresh time, and actual structured-output compatibility. The disclosure still says scoped rendered page context is sent to OpenRouter/provider processing, clearing is extension-local, and provider retention is not universally controlled.

The user enters a request such as “search the documentation for cancellation policy” or “convert 5 km to miles.” Start/Observe captures only the selected top-frame document and run origin. The model receives bounded rendered evidence and may return a plan or one action using an observed target ID only. Observe and bounded scroll are read-only; a fill or click displays the exact intended action, origin, target label/fingerprint, bounded value where safe, and expected result before one-use approval. After approval, the bridge rechecks the fresh target, document nonce, snapshot, origin, and digest, dispatches once, re-observes, and reports verified, unknown, blocked, or manual follow-up. No uncertain action is retried.

Three synthetic non-shopping fixtures define the useful slice for the implementer/verifier (they are fixtures, not live-site proof):

- **Docs search fixture:** a public same-origin documentation page with `input[type=search]`, a “Search” button, and same-origin results. The agent observes, fills an exact query after approval, clicks Search after a separate approval, and verifies a fresh same-origin result change.
- **Article reader fixture:** a long public article page with bounded scrolling and a same-origin “Next article” or “Load more” control. The agent scrolls and clicks the ordinary control after preview/approval; it must not follow a new-tab or cross-origin link.
- **Unit converter fixture:** a public converter with a plain numeric/text field and a non-destructive “Convert” button. It demonstrates generic fill/click/result observation without shopping, account, payment, or identity fields.

Required stopped states include: privileged `chrome:`, `edge:`, `about:`, `file:`, extension, or otherwise non-HTTP(S) URL; missing/revoked activeTab access; no body/empty target set; a narrow 320 CSS-pixel panel where labels/preview must remain readable without horizontal overflow; closed tab; changed origin/redirect; cross-origin or new-tab link; cross-origin iframe-only control; stale target; offline catalog/provider, missing key, 401/402/429, timeout, or malformed proposal; and sensitive/ambiguous/destructive controls. Each state shows the reason and the next manual action, never a fabricated success or silent fallback.

## 4. Solution chosen

Use a small generic adapter seam around the existing dependency-free MV3 architecture rather than promising every website. The bridge continues to inspect only the rendered top-frame DOM and returns bounded text, target records, fingerprints, visibility, local context, and same-origin evidence. The worker remains authoritative for selected-tab/run-origin binding, model validation, policy, approval, logging, and dispatch. The model remains a proposal source, not an executor.

The implementer may add a small `core/browser.js`/classification module or generalize `core/shopee.js` exports, but must keep shopping-specific extraction behind an optional adapter. `worker.js:51-76` should validate ordinary HTTP(S) invocation and use the run origin instead of `config.region.origin`; do not change the startup listener or toolbar bootstrap owned by the parallel defect task. `panel.html/js/css` should remove required region selection and replace it with origin/status UI; the selected origin comes from the invocation, not a guessed region. The provider request continues to use the live catalog, selected model, direct session key, bounded non-streaming request, and strict proposal JSON.

Rejected alternatives: `<all_urls>` or broad host permissions (violates least privilege and activeTab/user invocation); cookies/debugger/webRequest or CDP (privileged and unnecessary); silent cross-tab/cross-origin navigation (breaks run grounding); arbitrary model-generated CSS/XPath/JavaScript selectors (unsafe and not fresh evidence); a hosted proxy or bundled key (changes credential custody); and a universal “works on every website” classifier (unverifiable and too broad for the first slice). Direct extension-side panel opening/startup repair is explicitly out of scope for this owner.

Frozen test/change handling: preserve the old Malaysia-only amendment and existing adapter/privacy/safety cases as named historical/regression coverage. Add separately named generic contract/fixture cases; do not silently rewrite an old test’s expected exact origin, Shopee label, or cart boundary. If a manifest/UI assertion must change because the neutral identity is intentionally new, copy or amend it with a dated “browser-general” change note and retain the prior guard as an adapter-specific assertion.

## 5. Acceptance criteria

These are change-defining binary checks for the new candidate. They are not claims that the baseline or candidate currently passes; this planning stage ran no tests and no browser checks.

- **GB-01 Neutral identity:** manifest, package metadata, panel title/header, setup, and primary status copy use Browser Task Agent identity; no Shopee-only region selector or Malaysia-only instruction appears in the common flow. Any Shopee mention is confined to an optional adapter/fixture label.
- **GB-02 Least privilege:** manifest remains MV3 with `sidePanel`, `activeTab`, `scripting`, and `storage` plus the exact OpenRouter host only; no `<all_urls>`, cookies, debugger, webRequest, broad host permission, remote code, bundled secret, local/sync/database/history path, or silent second-tab capability.
- **GB-03 Ordinary-origin admission:** a user-invoked selected tab with an ordinary HTTP(S) URL creates a run bound to its exact `tabId` and origin; privileged/non-HTTP(S), unavailable-permission, missing-tab, or closed-tab states stop with a useful message before page action.
- **GB-04 Origin invariant:** every observation, target, approval, dispatch, and post-action result remains on the captured tab and exact origin. Changed origin, redirect, cross-origin link/new-tab, or changed document invalidates pending approval and requires fresh user invocation/approval.
- **GB-05 Generic rendered evidence:** observe returns bounded visible page text and target records for generic public buttons/links and simple text/search fields, with fresh fingerprints and no selector/script/endpoint execution. Empty, unsupported, iframe-only, or ambiguous controls are explicit manual/blocked states.
- **GB-06 Useful non-shopping actions:** the three named synthetic fixtures support useful read/scroll/fill/click flows as applicable, with exact preview and expected fresh evidence. No criterion relies on a live shopping page.
- **GB-07 Sensitive/destructive boundary:** account/login/identity/contact, password/OTP/verification/CAPTCHA, payment/financial/order, destructive/irreversible, file/native-dialog, and ambiguous controls are blocked or manual with a concrete next step; no checkout/payment/order tool is exposed.
- **GB-08 Approval and outcome regression:** every fill/click binds one-use approval to run, tab, origin, document nonce, snapshot, target fingerprint, action, and expected condition; stale/changed evidence blocks; unknown post-action evidence remains unknown and is never retried.
- **GB-09 Model boundary:** live catalog exposes all permitted text-chat entries and exact exclusions; outgoing validation rejects selectors, CSS/XPath, JavaScript, coordinates, arbitrary endpoints, and actions not represented by fresh target IDs. No raw key or sensitive/raw context enters logs/storage/export.
- **GB-10 Persistence/privacy:** direct masked key entry and minimal session-only metadata continue to work; startup/reload/clear lifecycle does not create durable user history; logs remain bounded and sanitized; raw snapshots/prompts/field values remain memory-only.
- **GB-11 Error/narrow UI:** offline/provider errors, missing access, empty page, stale target, changed origin, and 320px-wide panel states are truthful, actionable, and do not report success. Critical setup, preview, approve, cancel, and clear controls remain reachable without horizontal overflow.
- **GB-12 Frozen adapter separation:** old Malaysia-only Shopee/cart guard cases remain separately traceable and are not weakened or rewritten as generic evidence; the optional exact cart adapter still requires exact item/variant/quantity/expected-result approval and never automates checkout/payment/order.
- **GB-13 Evidence provenance:** the implementer gives the verifier exact candidate files/source identity, fixture names, test commands, viewport/start URLs, and fresh evidence. Native toolbar/Side Panel behavior and any startup repair are reported only by the parallel defect owner/verifier, not inferred from fixture or `panel.html` loading.

## 6. Risk

Generic page markup, labels, redirects, custom widgets, iframes, browser permissions, and anti-automation behavior vary widely. A conservative classifier will decline useful-looking controls when safety evidence is incomplete; that is preferred to guessed selectors or irreversible effects. The slice is intentionally not an every-website promise.

The largest integration risk is combining this contract with the parallel startup repair. The parent must join contracts for one implementer and keep startup ownership separate; no worker bootstrap rewrite belongs in this plan. Another risk is over-broad normalization of “public” labels: words such as continue, submit, send, save, confirm, or next require context and should be manual when ambiguous rather than blanket-approved.

OpenRouter catalog/pricing and model capabilities are live and can change. The UI must show refresh time and compatibility limitations, and the worker must revalidate immediately before dispatch. Provider processing and retention remain outside extension-local clearing. No real account, credential, cart, payment, or provider-credit action is authorized for this planning stage.

The package currently has a Shopee-specific source baseline and a recorded detached SHA. A candidate must be implemented only in the prepared worktree, separately inspected, and independently verified. This record is ready for implementation, not a pass, build, browser result, shipment, or native-startup verdict.
