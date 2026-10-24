---
status: ready-for-implementation-contract
owner: om-feature
work_item: shopee-20261024-YYvz4
updated: 2026-10-24
prior_architecture: ../../research.md
prior_plan: ../../plan.md
intake: ../../coordination/shopee-20261024-YYvz4/details.md
---

# Shopee browsing/product-search/add-to-cart owner plan

This amendment preserves the prior architecture and plan; it does not overwrite them. It narrows the first useful slice around a configurable Shopee region and records the user’s OpenRouter, model, logging, and privacy requirements. Product code remains in the prepared detached worktree, not beside this record.

## 1. Problem statement

The approved Chrome MV3 side-panel agent has no product implementation and therefore cannot browse Shopee, search for requested products, or help a user add an approved product to a cart. The primary use case needs ordinary rendered-page DOM observation and a bounded, supervised action loop, not a hidden Shopee API or unattended shopping. The user’s country/domain is pending, so the region must be configurable rather than guessed. “Add” is defined for this slice as add-to-cart only after the user approves the exact item, selected variant/options, and quantity; checkout, payment, purchase confirmation, and final order submission are never automated.

OpenRouter is the selected provider. The key is expected to be supplied locally through a `.env`, but the transport decision is still pending: the recommended choice is a local development import or explicit in-panel entry into trusted extension session storage, never embedding an extractable key in the package. The panel needs a cheap default chosen from the live text catalog, user-selectable eligible models, enforcement of the user’s GPT-6+ and Claude Fable-5+ exclusions, and sanitized chronological logs.

## 2. Architecture changes

Keep the prior dependency-free vanilla JavaScript ES-module architecture: `extension/manifest.json`, `panel.html/css/js`, `worker.js`, `bridge.js`, and `core/{contracts,policy,engine,model,store}.js`. Do not add a framework, bundler, backend, debugger permission, `<all_urls>`, remote code, or a second executor.

Add four small seams:

1. **OpenRouter catalog and policy.** `core/model-catalog.js` loads the public `GET https://openrouter.ai/api/v1/models?output_modalities=text&sort=pricing-low-to-high` response, accepts only text-output, text-input, non-expired entries that support the proposal JSON mode (`structured_outputs` or `response_format`), and computes a live estimated cost from prompt/completion prices. `isAllowedModel(entry)` is shared by catalog UI and the outgoing `propose` path. The outgoing path fails closed if the selected model is absent from the latest catalog or matches an exclusion.
2. **Shopee DOM adapter.** `core/shopee.js` is data/policy only; the existing top-frame bridge observes rendered search controls, product cards, product detail, option controls, quantity, and cart confirmation. It must not call undocumented endpoints, inspect cookies/local storage, defeat CAPTCHAs, or use debugger/CDP. Synthetic DOM support is **live-unverified** until the coordinator obtains actual browser evidence.
3. **Exact cart intent.** A cart action remains a validated `click`, but carries `cartIntent: {itemId, itemLabel, variantId, variantLabel, quantity, expected}`. Missing or ambiguous item, variant, or quantity is `NEEDS_USER`/blocked. Its preview must show all three exact values and the Shopee region before one-use approval. There is no checkout action.
4. **Sanitized logger.** `core/logger.js` records bounded per-run events in session state and renders them as text in the panel. It stores timestamps, phase, action type, target label, model ID, status, and safe reason only; it never stores API keys, Authorization headers, raw page snapshots, full prompts, existing field values, payment/identity data, or unredacted secrets.

Configurable region is a user setting such as `{id, origin, searchPathTemplate, currencyLabel}`. The initial list may contain common Shopee country domains, but the selected origin must be explicit and validated; no country is the default by inference. A region change invalidates the active run and requires a fresh toolbar invocation on that origin.

## 3. User flow

From a cold install, the user loads the unpacked `extension/`, opens the panel from the toolbar on the selected Shopee region, and sees the first-use disclosure: page text is sent to the selected model, every click/fill is supervised, add-to-cart is not checkout, and CAPTCHA/login/payment/order controls stay with the user. The user chooses a Shopee region/domain and configures OpenRouter using the pending safe key path. The panel loads a live catalog, displays the current cheap eligible default and selectable eligible alternatives, and reports connection/auth/network errors without exposing the key.

The user enters a request such as “find a black medium backpack under my budget.” The agent observes only the authorized top-frame rendered DOM, proposes a short plan, and waits for **Run plan**. It may fill the public search field and click search only after the normal exact approval. It may scroll and inspect rendered product cards. Product results are presented with title, displayed price/currency, seller/shipping text when visible, product link/target fingerprint, and confidence/ambiguity notes; page content is treated as untrusted data, not instructions.

Before any cart mutation, the panel shows a dedicated preview: region/site, exact item title/link or fingerprint, exact variant/options (or “not selected”), exact quantity, expected cart result, and the fact that checkout/payment will not run. The user must explicitly approve this one action. After the click, the bridge obtains a fresh observation and the engine marks it verified only if a new cart count/message or equivalent expected rendered change is observed; otherwise it reports “action sent; outcome unverified.” The user can cancel at any boundary.

Empty, narrow, offline, missing-access, changed-origin, closed-tab, login, CAPTCHA, verification-code, payment, checkout, and ambiguous-variant flows stop with a concrete next action. The extension never retries an uncertain cart click, never follows a new tab/cross-origin page silently, and never treats synthetic DOM success as a native browser guarantee.

## 4. Solution chosen

Use the existing one-tab, top-frame, four-tool model (`observe`, bounded `scroll`, approved `click`, exact `fill`) with a Shopee-specific interpretation layer. Keep the service worker authoritative for model selection, exclusion enforcement, policy, approval binding, logging, and dispatch. Use OpenRouter’s OpenAI-compatible HTTPS Chat Completions endpoint from the worker, with strict proposal JSON validation and no model execution authority. Use a live public catalog rather than hardcoding every model; default selection is the cheapest currently eligible text model that supports the required JSON capability and minimum context, with a visible price/capability label.

Rejected alternatives: (a) embedding the `.env` token in a packaged extension, because an extension owner or DevTools can extract it and OpenRouter warns against client-side exposure; (b) a hosted proxy, because it is outside this 20-minute local MVP and changes credential custody; (c) hidden Shopee APIs, because they are undocumented, brittle, and could bypass site controls; (d) broad host permissions, because the prior activeTab contract intentionally limits page access; and (e) Playwright/CDP/debugger, because they add runtime and permission scope without yielding this native side panel in the time box.

**Pending security choice (must remain visibly labeled):** local `.env` import into trusted extension `storage.session` versus explicit user entry at setup. No token has been read, printed, committed, or packaged. Until resolved, implement only a safe explicit/session path and leave any `.env` importer development-only, local, and excluded from the package.

## 5. Acceptance criteria (frozen, observable, binary)

The following change-defining criteria are frozen before implementation. Baseline is the verified state described by the prior plan: no `extension/` product package exists, so each feature criterion fails on baseline. Existing architecture behavior is a regression guard, not proof of these changes.

- **FC-01 Scoped install:** Candidate loads via Chrome “Load unpacked”; manifest contains MV3, `sidePanel`, `activeTab`, `scripting`, and `storage`, plus only the exact OpenRouter host permission required by the chosen adapter. It contains no `<all_urls>`, `tabs`, `debugger`, cookies, webRequest, wildcard model endpoint, remote code, or packaged secret.
- **FC-02 Region is explicit:** Cold panel requires or clearly displays a selected Shopee region/origin; changing it invalidates the active run. A run on an unselected or changed origin is stopped rather than silently redirected.
- **FC-03 Live model catalog:** With network available, the panel loads OpenRouter’s live text catalog and shows model ID/name, prompt/completion prices, JSON capability, and refreshed timestamp. With network unavailable it shows a truthful error and does not invent a catalog.
- **FC-04 Cheap default and exclusions:** The default is computed from live prices using the documented cost rule and eligible capability filter; the UI hides/marks excluded models, and the outgoing request path independently rejects GPT generation >=6 and Claude Fable generation >=5 even if UI state or page/model text attempts to select them.
- **FC-05 Safe OpenRouter call:** A configured key produces a bounded non-streaming Chat Completions request with `Authorization: Bearer ...` in worker context only; the request contains validated proposal JSON instructions and no page-provided endpoint. Missing/invalid key, 401/402/429, timeout, or malformed JSON produces a visible sanitized error.
- **FC-06 Sanitized logs:** Every run displays a chronological log including observe/search/approval/action/result/error events and model ID; exported or stored logs contain no key, bearer token, raw prompt, raw page snapshot, payment/identity data, or existing field value. Log size is bounded and clearable.
- **FC-07 Search is real and supervised:** On an allowed rendered Shopee page, the agent can observe a public search field, fill the exact user-approved query, and click the search control only after exact approval; it refreshes observation and reports success only when the expected URL/content change is visible.
- **FC-08 Product evidence:** The candidate extracts rendered product candidates with exact visible title, price/currency, target fingerprint/link, and available variant metadata, without hidden API calls or secret/storage reads. Ambiguity is shown rather than guessed.
- **FC-09 Exact add-to-cart approval:** A cart action cannot dispatch unless one-use approval binds run, tab, document, snapshot, item ID/fingerprint and label, exact variant/options, exact positive integer quantity, expected result, and region. Replacing any field invalidates approval.
- **FC-10 No checkout/payment:** Checkout, buy-now, purchase confirmation, payment, login, identity, verification-code, and final order submission targets are blocked in policy even if the model proposes them. The package exposes no such tool.
- **FC-11 Honest uncertain outcome:** A dispatched cart click with no fresh observable cart evidence is `unknown`/“action sent; outcome unverified,” never success; changed/stale target is re-observed once and requires new approval.
- **FC-12 CAPTCHA and defenses:** CAPTCHA, bot challenge, native dialog, unsupported widget, cross-origin navigation, closed tab, or missing activeTab access stops with a user-action message; no bypass, credential extraction, profile cloning, or hidden API is attempted.
- **FC-13 Core safety regression:** Existing contract/engine tests pass for approval binding, cancellation/late replies, duplicate advance, interruption/no replay, finish evidence, budget, blocked sensitive targets, and corrupt storage. The full suite and browser checks must be reported separately.
- **FC-14 Evidence provenance:** The verifier receives the exact candidate files, source hashes, test command, browser viewport/start URL, and fresh evidence. Shopee support remains labeled live-unverified until coordinator-obtained browser evidence proves FC-07–FC-12.

## 6. Risk

The region and credential transport are pending product decisions, but planning is intentionally not blocked. The recommended credential decision is safe local/session import, not embedding. `.env` is absent at intake and must not be read or printed by this stage. Session storage is not encrypted and does not protect the machine owner; private distribution reduces audience, not extractability.

Shopee DOM markup, login state, regional redirects, anti-bot challenges, and synthetic events may prevent live verification. The adapter must fail closed and report unsupported behavior. Search and add-to-cart are not equivalent to purchase; the user must retain checkout/payment control. Live model catalog and pricing change over time, so the chosen default and timestamp must be logged and revalidated before each outgoing request. Free/cheap models may have weaker agentic JSON reliability; malformed proposals must stop, never degrade into arbitrary execution.

The remaining 20-minute build time box cannot guarantee a real Shopee browser demonstration, independent verification, packaging, and live provider access. At the deadline, hand off the package as incomplete/unverified with the exact failed criteria; do not promote fixture-only tests to live support. No product code, browser action, model request, build, commit, merge, deployment, or publication is claimed by this owner stage.


## 7. Accepted user decisions — 2026-10-24

This dated decision record is accepted into the owner contract and **supersedes** the pending region and credential choices in §1, §4, and §6, and the corresponding pending-decision bullets in `handoff.md`. The prior baseline, architecture history, frozen FC-01–FC-14 criteria, and their provenance remain intact; this section is an additive amendment, not a rewrite.

- **Exact target:** the only supported origin for this slice is `https://shopee.com.my` (Shopee Malaysia). The run must stop on an unselected origin, a changed origin, or a redirect outside the exact approved origin; do not retain a multi-country/default-region selector for this slice.
- **Action boundary:** product additions mean add-to-cart only. Checkout, buy-now, payment, purchase confirmation, order submission, and any final transaction remain manual and must not be exposed as tools or automated targets.
- **Credential path:** each user enters their own OpenRouter key directly into the extension through a masked field. There is no `.env` importer, environment-file path, bundled token, packaged secret, or key publication path. The key is never logged, exported, sent to content/page contexts, or rendered as readable text after entry.
- **Retention boundary:** no `chrome.storage.local`, `chrome.storage.sync`, telemetry, analytics, remote task store, database, or user-history store. Raw snapshots, prompts, page text, existing field values, and shopping details remain memory-only. Necessary minimal run metadata plus sanitized log/key state may use `chrome.storage.session` only from trusted extension contexts, with an explicit trusted-context access level.
- **Clearing:** Clear session removes the session key and all session run metadata/log state. Startup/reload/update/disable and browser restart must not restore the key or user data; initialization must clear any prior session state before a new run. No session state is treated as durable history.
- **Transparency:** the Side Panel must show the intended action before dispatch, current progress, outcome/uncertainty, and the exact item/variant/quantity cart preview. The first-use disclosure must state that scoped page context is sent to the selected OpenRouter model for processing and that extension-local session clearing does not guarantee zero retention by OpenRouter or another provider. Never claim universal zero-retention.
- **Model choice:** do not present a handpicked shortlist. The UI must expose all permitted text-chat catalog entries returned by the live catalog, with model ID/name, pricing, refreshed time, and actual capability/compatibility labels. The cheapest-default calculation may prefer models supporting structured output/response format, but that preference must not hide other permitted text-chat choices. GPT generation `>= 6` and the literal Claude Fable generation `>= 5` remain excluded in both UI and outgoing enforcement; do not broaden the Claude exclusion to all Claude models.

## 8. Contract amendments and implementation follow-up

The original FC-01–FC-14 list remains the frozen historical baseline and is amended only by the accepted decisions above. For implementation and verification, treat FC-02, FC-04, FC-05, FC-06, FC-09, FC-10, FC-14 and the following new binary checks as current:

- **FC-15 Exact Malaysia origin:** the manifest/adapter/policy accepts only `https://shopee.com.my`; origin mismatch, redirect, or changed-origin state blocks before observation or dispatch.
- **FC-16 Direct masked session key:** the only setup path is masked in-panel entry; no `.env` reader/importer, bundled token, or secret in source/package. Key state is trusted-context `chrome.storage.session` only and is cleared with session lifecycle events.
- **FC-17 Session-only data boundary:** no local/sync/telemetry/database/remote history path exists; raw snapshots/prompts/field values are memory-only; only minimal run metadata and sanitized log/key state may enter session storage.
- **FC-18 Intent transparency and provider disclosure:** before every dispatch the panel renders the intended action and approval payload; first use explains OpenRouter/provider processing and avoids any universal zero-retention claim.
- **FC-19 All-model catalog choice:** all permitted text-chat catalog entries are visible, while structured-output suitability and other actual compatibility limits are clearly labeled. Cheapest-default eligibility may prefer structured-capable entries. The exact generation exclusions are enforced immediately before outgoing requests.

No product implementation, browser/provider request, test, build, or verification was performed by this amendment owner stage.
