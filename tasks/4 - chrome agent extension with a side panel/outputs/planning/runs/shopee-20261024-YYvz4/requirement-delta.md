# Requirement delta — Shopee Malaysia side-panel agent

**Work item:** `shopee-20261024-YYvz4`  
**Accepted:** 2026-10-24  
**Status:** contract amendment only; no implementation or verification performed here.

This delta is a file-backed successor to the existing `plan.md`/`handoff.md` owner contract, not a competing owner. Preserve all prior frozen criteria and history. The following accepted decisions supersede only the pending region/credential/model-retention interpretations.

## Numbered checks

1. **Exact origin:** accept and automate only `https://shopee.com.my`; block unselected origins, redirects, changed origins, and cross-origin navigation.
2. **Add-to-cart boundary:** add-to-cart is the terminal automated action. There is no checkout, buy-now, payment, purchase confirmation, order submission, or final transaction tool.
3. **Direct key entry:** collect each user’s OpenRouter key via a masked extension field. No `.env` read/importer, bundled token, packaged secret, or key publication.
4. **Trusted session storage:** use `chrome.storage.session` only from trusted extension contexts for minimal run metadata and sanitized log/key state. Never use `storage.local`, `storage.sync`, telemetry, analytics, a database, remote task history, or user-history storage.
5. **Memory-only sensitive context:** raw page snapshots, prompts, page text, existing field values, and shopping details stay in memory; they do not enter logs or session storage.
6. **Clear lifecycle:** Clear session removes key and session run state. Startup/reload/update/disable and browser restart must not restore key or user data; initialize by clearing stale session state.
7. **Disclosure:** first use says scoped page context is sent to OpenRouter/provider processing. Extension-local clearing is not a promise about provider retention; never claim universal zero-retention.
8. **Pre-dispatch transparency:** Side Panel shows intended action before dispatch, then progress and outcome/uncertainty, with exact item, variant/options, quantity, region, and expected result for cart approval.
9. **All-model UI:** expose all permitted live text-chat catalog entries, not a handpicked shortlist. Show ID/name, prices, refresh timestamp, and actual structured-output/response-format and other compatibility limits.
10. **Default versus choice:** cheapest-default eligibility may prefer structured-capable models, but that preference must not hide other permitted catalog choices. Non-structured choices must be accurately labeled and handled according to real adapter limits, never silently treated as fully compatible.
11. **Outgoing exclusions:** revalidate the selected live catalog entry immediately before the request. Reject GPT generation `>=6` and the literal Claude Fable generation `>=5` in UI and outgoing path; do not generalize the Claude rule to all Claude models.
12. **Evidence boundary:** implementer may change product code only in the prepared worktree; verifier must separately inspect package/source and fresh evidence. Keep Shopee support live-unverified until actual browser evidence proves it.

## Actual implementation follow-up

- Update the region policy/adapter and origin checks to the exact Malaysia origin; add a changed-origin stop path.
- Replace any pending `.env`/import decision with masked in-panel entry and trusted-context `chrome.storage.session`; add explicit clear-on-start/session lifecycle handling and ensure no prohibited storage API is imported or called.
- Keep raw snapshots/prompts/field values in runtime memory only; pass sanitized summaries to logs and retain only minimal run metadata. Audit all serialization, export, error, and UI paths for key/raw-data leakage.
- Add first-use disclosure copy that names OpenRouter/provider processing and distinguishes extension-local retention from provider retention.
- Add a pre-dispatch intent panel and exact cart preview; keep checkout/payment/order controls blocked and absent.
- Change catalog rendering from a curated shortlist to every permitted text-chat entry. Add capability badges/compatibility warnings, preserve structured-capable preference only for cheapest-default calculation, and apply the exact generation predicates immediately before provider dispatch.
- Add or extend focused checks for items 1–12, then hand the candidate and this delta to the independent verifier. Do not claim tests, builds, browser checks, provider calls, or implementation completion from this document.
