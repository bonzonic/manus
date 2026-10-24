# Shopee feature implementation handoff

**Owner contract:** [plan.md](plan.md)  
**Prior architecture:** [../../research.md](../../research.md)  
**Prior plan:** [../../plan.md](../../plan.md)  
**Intake:** [../../coordination/shopee-20261024-YYvz4/details.md](../../coordination/shopee-20261024-YYvz4/details.md)  
**Target worktree:** `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/architecture-20261024-YYvz4`

## Implementation packet

Build only in the prepared detached worktree. Do not read or print `.env`, do not embed a key, do not install a framework, do not use hidden Shopee APIs, and do not bypass CAPTCHA/bot defenses. The coordinator owns live browser decisions. Keep the original four-tool architecture and preserve all prior approval/recovery boundaries.

1. **Minutes 0–3 — contract and manifest.** Implement `model-catalog.js`, contracts for model/region/cart intent/log entries, and manifest host permission for `https://openrouter.ai/*` only. Add tests for scoped permissions, model exclusions, and cart approval binding.
2. **Minutes 3–7 — provider adapter.** Implement catalog fetch and `chooseCheapestAllowed()`. Use `GET /api/v1/models?output_modalities=text&sort=pricing-low-to-high`; filter text input/output, non-expired, adequate context, and `structured_outputs` or `response_format`. Estimate cost as `promptPrice * inputBudget + completionPrice * outputBudget + requestPrice`, with deterministic documented budgets. Default to the lowest eligible live value; if catalog fetch fails, require explicit user selection and show the stale/unavailable state. Before every POST, reload/validate the selected catalog entry and apply exclusions again.
3. **Minutes 7–13 — Shopee DOM slice.** Add `core/shopee.js` and bridge observation metadata for region, search control, product cards, detail variants, quantity, and cart feedback. Keep selectors/labels conservative and local to rendered DOM. Add no API client, cookie/storage read, debugger call, or cross-origin fetch. Treat support as live-unverified until coordinator browser evidence.
4. **Minutes 13–17 — UI and logs.** Add region selector, live model list with prices/capabilities/timestamp, first-use disclosure, safe key setup state, exact search/product/cart previews, and pause/cancel. Render all dynamic text with `textContent`. Add a bounded sanitized logger and clear/export only sanitized events. Do not persist raw page snapshots or secrets.
5. **Minutes 17–20 — scoped tests/package handoff.** Run explicit Node tests only; do not claim live checks. Produce a file list and hashes for the verifier. If time expires, mark unverified criteria rather than weakening them.

## Exact interfaces

```js
// core/model-catalog.js
export async function loadModelCatalog(fetchFn, {
  endpoint = 'https://openrouter.ai/api/v1/models?output_modalities=text&sort=pricing-low-to-high',
  now = Date.now,
  fetchTimeoutMs = 10_000,
} = {}) -> Promise<{ refreshedAt, models: ModelCatalogEntry[] }>;

export function isExcludedModel(entryOrId) -> { excluded: boolean, reason?: string };
export function isEligibleTextModel(entry, policy) -> boolean;
export function chooseCheapestAllowed(models, { inputBudgetTokens, outputBudgetTokens, minContextTokens }) -> ModelCatalogEntry | null;
export function validateSelectedModel(modelId, catalog, policy) -> ModelCatalogEntry;

// ModelCatalogEntry is derived from OpenRouter fields:
// { id, name, canonical_slug, expiration_date, architecture,
//   pricing: { prompt, completion, request }, supported_parameters,
//   context_length, top_provider }
```

`isExcludedModel` must use normalized `id`, `canonical_slug`, and display name. Exclude GPT family generation `>= 6` (`gpt-6`, `gpt-6.1`, etc.) and the exact Claude Fable family generation `>= 5` (`claude-fable-5`, etc.). Do not broaden the latter to all Claude 5 products without a new decision. Apply this predicate both when rendering options and immediately before the outgoing Chat Completions request. Unknown model metadata fails closed.

```js
// core/model.js
export async function propose({ intent, plan, snapshot, results, model, apiKey, catalog, fetchFn }, signal) -> Promise<Proposal>;
// POST https://openrouter.ai/api/v1/chat/completions
// headers: Authorization: Bearer <session-only key>, Content-Type: application/json
// body: { model, messages, stream: false, max_tokens/max_completion_tokens,
//         response_format when supported }
```

Never log `apiKey`, Authorization, complete messages, page snapshot text, or field values. On the wire, validate origin and model ID locally; proposals are data only and go through `validateProposal`/`evaluateAction`.

```js
// core/shopee.js
export function normalizeRegion(input) -> ShopeeRegion | ValidationError;
export function classifyShopeePage({ url, title, document }) -> { region, kind };
export function extractProductCandidates(snapshot) -> ProductCandidate[];
export function makeCartIntent({ item, variant, quantity, expected, region }) -> CartIntent | ValidationError;

// ShopeeRegion: { id, origin, displayName, currencyLabel? }
// ProductCandidate: { itemId, label, href, priceText, currencyText, variants[], fingerprint }
// CartIntent: { regionId, itemId, itemLabel, href, variantId, variantLabel,
//               quantity, expected }
```

Cart intent is an extension-side action annotation on the existing validated click. `evaluateAction()` returns `block` when item/variant/quantity is absent, ambiguous, non-positive, or changed. `approvalDigest()` binds all cart fields, target fingerprint, document/snapshot, run/step, and expected result. There is no `checkout`, `buyNow`, `payment`, or `submitOrder` action.

```js
// core/logger.js
export function createRunLogger({ clock, maxEntries = 256, maxBytes = 64 * 1024 }) -> {
  add(event): void,
  entries(): SafeLogEntry[],
  clear(): void,
  exportJson(): string
};
// SafeLogEntry: { ts, level, event, actionType?, modelId?, targetLabel?, status?, reason? }
// sanitize: redact bearer/key-like strings, URLs query strings, raw page text, values, prompts.
```

## Required tests

Use dependency-injected `fetchFn`, bridge, clock, store, and model; never spend live API credits in unit tests. Add or extend:

- `catalogLoadsTextModelsAndUsesLivePrices`
- `cheapDefaultUsesPromptCompletionRequestCost`
- `expiredOrNonTextModelIsRejected`
- `gpt6AndClaudeFable5AreRejectedInUiAndOutgoingPath`
- `unknownSelectedModelFailsClosed`
- `providerUsesBearerHeaderWithoutLoggingKey`
- `providerMalformedJsonAnd401AreSanitized`
- `regionMustBeExplicitAndOriginChangeInvalidatesRun`
- `productCandidateRetainsRenderedVariantEvidence`
- `cartRequiresExactItemVariantQuantityApproval`
- `changedCartFingerprintInvalidatesApproval`
- `checkoutPaymentLoginCaptchaAreBlocked`
- `cartNoopIsUnknownNotSucceeded`
- `logsContainTimelineButNoSecretsOrRawSnapshot`
- all prior policy/engine tests named in `../../plan.md`.

The fresh verifier, not this owner or implementer, must run the candidate tests, inspect the manifest/package for secrets and wildcard access, and obtain any real browser evidence. Shopee support is **live-unverified** until that evidence exists.

## Pending decisions and blockers to relay

- **Pending security choice:** local development `.env` import into session storage versus explicit in-panel key entry. Recommended: never embed or publish; use a local/session-only path. No `.env` exists at intake and no token was read.
- **Pending Shopee region:** keep region configurable; do not default to a country.
- **No checkout/payment:** add-to-cart only, exact approval required.
- **Live verification dependency:** coordinator must control the browser and user approvals; CAPTCHA/login/payment must stop the run.


## Accepted user decisions — 2026-10-24 (supersedes pending decisions above)

The prior “Pending decisions and blockers to relay” section is retained as history but is superseded by this accepted decision set. Implement exactly the following:

1. Use the exact origin `https://shopee.com.my` only. Remove any inferred/default multi-country behavior for this slice; stop on origin mismatch, redirect, or changed origin.
2. Keep add-to-cart as the terminal automated action. Do not expose or automate checkout, buy-now, payment, purchase confirmation, final order submission, or equivalent controls.
3. Collect the OpenRouter key through a masked field inside the extension. Do not read `.env`, add an importer, bundle a token, publish a key, log it, export it, or send it to page/content contexts.
4. Use `chrome.storage.session` only in trusted extension contexts for minimal run metadata and sanitized log/key state. Do not use `storage.local`, `storage.sync`, telemetry, analytics, a remote task store, a database, or user history. Keep raw snapshots, prompts, page text, existing field values, and shopping details in memory only. Clear session state and key on Clear session and on startup/reload/update/disable/browser restart; do not restore previous user data.
5. Show the intended action before dispatch, plus live progress, outcome/uncertainty, and an exact item/variant/quantity cart preview. First use must disclose OpenRouter/provider processing of scoped page context and must not promise universal provider zero-retention.
6. Populate the model UI from all permitted live text-chat catalog entries, not a handpicked shortlist. Show pricing, refresh time, structured-output/response-format support, and other actual compatibility limits. Cheapest-default selection may prefer structured-capable entries. Preserve only the exact GPT generation `>=6` and literal Claude Fable generation `>=5` exclusions, and enforce them again on the outgoing path; do not exclude all Claude models.

## Follow-up implementer/verifier instructions

- Implementer: update the region policy, manifest/adapter checks, setup UI, session-store lifecycle, disclosure copy, model catalog rendering/default selection, outgoing model validation, and pre-dispatch intent/progress surfaces. Add targeted tests or inspection hooks for FC-15–FC-19 and the amended FC criteria. Do not weaken the pre-existing approval, sanitization, no-checkout, or uncertain-outcome boundaries.
- Implementer: ensure storage access is restricted to trusted contexts and that no raw snapshot/prompt/field-value object crosses into session storage or logs. Treat a key-presence/clear-state as sufficient UI state; never display the key value after entry.
- Implementer: make non-structured-capable models visibly “limited/incompatible for strict structured proposals” according to the actual adapter behavior; do not silently label them fully compatible or silently broaden the default filter into a hidden shortlist.
- Verifier: inspect source and packaged manifest for prohibited storage paths, importers, bundled secrets, provider-retention claims, broad origins, checkout/payment tools, and broadened Claude exclusions. Verify the exact Malaysia-origin gate and session-clear behavior with fresh evidence. Keep live Shopee support marked live-unverified unless real browser evidence exists.
- Verifier: check that the panel visibly states the intended action before dispatch and that first-use disclosure distinguishes extension-local clearing from OpenRouter/provider retention. Report implementation/verification status separately; this handoff does not claim either.
