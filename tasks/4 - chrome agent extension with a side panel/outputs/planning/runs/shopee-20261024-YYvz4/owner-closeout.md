# om-feature owner closeout — Shopee side-panel agent

**Date:** 2026-10-24  
**Work item:** `shopee-20261024-YYvz4`  
**Status:** **FAIL — blocked/unverified; local test build only.** This closeout is documentation-only. It does not change product files, run browser/provider/cart actions, create a commit, publish, or certify a ZIP.

## Actual candidate scope

The parent-provided candidate/output contains the reported 23-file MV3 side-panel extension tree for a supervised Shopee Malaysia/OpenRouter slice. Its intended implemented scope is:

- Chrome MV3 side-panel wiring with `activeTab`, `scripting`, and `storage`, plus the scoped OpenRouter host permission; no `<all_urls>`, debugger, cookies, webRequest, remote code, or packaged key.
- Exact `https://shopee.com.my` origin policy, same-origin/changed-origin stops, rendered-DOM observation, bounded observe/scroll/click/fill actions, and no hidden Shopee API.
- Masked in-panel OpenRouter session-key entry, trusted extension `chrome.storage.session` state only, clear-session handling, sanitized bounded logs, and memory-only raw page/prompt/field context.
- Live text-model catalog handling with pricing/capability labels, cheapest eligible default calculation, all permitted choices exposed, and outgoing GPT generation `>=6` plus literal Claude Fable generation `>=5` exclusions.
- Supervised search/product evidence and exact cart intent/preview binding item, variant/options, positive quantity, expected result, region, document/snapshot identity, and one-use approval. Checkout, buy-now, payment, order submission, login/identity/OTP, and CAPTCHA bypass remain unavailable.

This is the candidate scope reported by the independent recheck, not native/live proof. The owner stage itself made no product edit. The independent candidate identity was the actual uncommitted 23-file tree with fingerprint `51DF73DC2F5FEFFC946472F9A208AF976E40E20FAB3B188187A52C8BFC166E65`.

## Independent code checks retained

The independent final recheck reports:

- **34/34** candidate Node tests passed, with 0 failures and 0 skips.
- **11/11** JavaScript files passed `node --check`.
- The three prior material code findings were addressed in code-check scope: rendered cart evidence is retained in the provider projection; item and add-control fingerprints are checked separately; same-target document/snapshot replacement invalidates the old approval.
- Static/package audit found no source/package matches for prohibited local/sync storage, `.env`, `<all_urls>`, debugger, cookies, webRequest, or `eval(` in the audited non-test source; the manifest and exact Malaysia policy matched the recorded audit.
- VM bridge/provider-capture and fixture proofs were code/runtime harness evidence only, not native Chrome or live provider evidence.

The package receipt currently says **`LOCAL TEST BUILD; native Chrome/OpenRouter/Shopee unverified`**, records 23 copied files and the same fingerprint. The parent is validating/correcting the ZIP; this closeout deliberately makes no ZIP-verified claim.

## Full gate and release boundary

The independent verdict is **FAIL — blocked/unverified/native gate**, despite the green code-check result. No native Chrome load-unpacked/side-panel driver, MV3 service-worker lifecycle run, activeTab injection, real DOM walk, redirect/anti-bot/CAPTCHA/closed-tab run, viewport capture, or visual evidence was available. No live OpenRouter catalog or request was made and no live key was entered or inspected. No live `shopee.com.my` navigation, supervised search, product/variant/quantity observation, cart confirmation, or cart mutation was performed.

Therefore native/live completion is not established for the install/side-panel flow, exact-origin behavior in a real tab, live catalog/provider call, search, product evidence, exact add-to-cart dispatch/outcome, anti-bot/login/CAPTCHA/closed-tab handling, or the evidence-provenance/native gate. Fixture and VM evidence must not be promoted to those claims. Checkout/payment/order actions were intentionally not attempted and remain manual by contract.

## No public shipment

There is no public shipment, publication, merge, deployment, commit, or verified ZIP claim from this owner closeout. Treat the output as a private **LOCAL TEST BUILD**, not an all-must-haves-complete release and not a private secure vault. A browser-held client key can be extracted by the machine owner/devtools; never put a real key in chat, source, `.env`, history, telemetry, local/sync storage, screenshots, or a package. Extension-local **Clear session** cannot guarantee provider-side retention or deletion.

## Next manual test required

1. On the Windows device, open Chrome at `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the existing output `extension` subfolder. Do not use a ZIP as verified until the parent’s corrected receipt says so.
2. Navigate manually to `https://shopee.com.my`; the user handles login, CAPTCHA, verification codes, and any site challenge manually. From the toolbar, open the extension Side Panel.
3. Select **Shopee region (required)** as Shopee Malaysia, enter the user’s own low-limit OpenRouter key only in **OpenRouter session key (masked; never packaged)**, then press **Save session settings**. Never ask for or paste the key in chat.
4. Press **Refresh live model catalog** and confirm a truthful live result, all permitted model choices, prices/capabilities, refresh time, and exact exclusions. If unavailable, record the error and stop.
5. Enter a harmless natural request in **Request**, press **Observe selected Shopee tab**, then review the proposed flow and press **Run plan / advance**. At each proposed fill/click, inspect the **Exact approval** preview and approve only the intended search control or field.
6. For a cart candidate, verify the exact item, item ID/fingerprint, visible variant/options, quantity, region, expected result, and target fingerprint before approving one cart action. Confirm a fresh rendered cart change; if absent, retain **unknown / action sent; outcome unverified** and never retry automatically.
7. Test changed-origin, stale snapshot/target, login/CAPTCHA, closed-tab, pause/cancel, **Export sanitized timeline**, and **Clear session** behavior without proceeding to checkout or payment. Save screenshots and browser/provider evidence in the parent’s separately authorized verification record.

Until that manual evidence is captured and independently recorded, the truthful result remains **blocked/unverified**.
