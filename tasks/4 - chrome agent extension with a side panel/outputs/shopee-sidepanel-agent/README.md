# Browser Task Agent 0.2.0

**Private local test build, not a fully verified release.** Independent final code checks: 41 Node tests passed, 0 failed, exit0; targeted generic suite7 passed; JavaScript syntax checks passed. Empty-page admission, file-picker blocking, visible/usable mutation targets and bounded fill previews were independently rechecked. **An actual Chrome toolbar click opening the native Side Panel remains UNVERIFIED.** The opening path was changed to the official `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` API. Puppeteer24.26.1/CFT141 was installed and attempted, but native attach/path/profile problems and the unavailable native toolbar driver prevented proof. Ordinary panel-page or mock-API checks are not native evidence.

## Quick reload

If your installation points to the original task folder `outputs/shopee-sidepanel-agent/extension`, the packaging step updates that unchanged original folder to this new neutral build when its baseline hashes still match. Open `chrome://extensions` and click **Reload** on the currently installed extension card (it may still show the old name until reloaded). After reload, confirm **Browser Task Agent**, version **0.2.0**. Do not remove the existing installation first. Its folder name is retained only for update compatibility; the product is not Shopee-specific.

If that folder was not updated, or you unpacked elsewhere: extract `browser-task-agent-0.2.0.zip`, use **Load unpacked**, and select the extracted **extension** subfolder containing `manifest.json`, not the ZIP or its parent folder. Pin this installation if it is a new path. Avoid running both old and new copies simultaneously.

Open an ordinary HTTP(S) page, then click the extension's toolbar icon. The intended behavior is the native Side Panel opening; this still needs your Chrome click check. If it does not open, inspect the extension card's **Errors** or **service worker** link and report the exact error without credentials. No account login or API key is required merely to check panel opening.

## First use and controls

1. In **Setup**, enter your own masked **OpenRouter session key (masked; never packaged)** and click **Save session settings**. No key is bundled; it is session-only and must be reentered after clearing/reload/startup.
2. Click **Refresh live model catalog** and choose a permitted text-chat model. The inexpensive default preference does not restrict the full permitted catalog. GPT generation6+ and literal Claude Fable generation5+ are excluded. Model capability/price labels come from the catalog; no paid model call was used in QA.
3. In **Task**, describe a bounded public-page task, then click **Observe selected tab**. There is no required country or Shopee setup. Examples include documentation search, reading/scrolling an article, or a public conversion tool; these are example task shapes, not a promise every website works.
4. Click **Run plan / advance**. Review **Exact approval** including action, origin, target, expected condition and bounded non-sensitive fill value. Use **Approve this one action** only when the proposal is correct. Every click/fill requires one exact approval.
5. **Intended action and progress** shows intent, phase and result. **Pause** and **Cancel** stop progression. Unknown outcomes are not silently called success or replayed.
6. **Timeline** contains bounded sanitized events; use **Export sanitized timeline** for debugging and **Clear session** to remove extension-local key/config/run state. Never include an API key in a screenshot or chat.

## Scope, safety and privacy

The four tools are observe, bounded scroll, safe public fill and safe public same-origin click. Work stays bound to the selected ordinary HTTP(S) tab and exact origin, using fresh top-frame rendered target evidence rather than model selectors or code. Offscreen mutations require scrolling/re-observation first. Empty unsupported pages, missing access, stale targets, changed origin, cross-origin/new-tab actions and native/file-dialog controls stop or require manual action. Shopee remains only an optional shopping example/adapter with exact cart approval; checkout and payment are always manual.

Login/password/OTP/CAPTCHA, identity/contact/payment, destructive or irreversible actions and unsupported sensitive controls remain manual or blocked. No CSS/XPath/scripts/coordinates/endpoints from a model or webpage are executed. No real account/cart/payment/provider-credit operations were performed during these checks.

Each user supplies their key locally. Trusted `chrome.storage.session` keeps minimal session state; raw snapshots/prompts/field values remain memory-only, with bounded sanitized logs and no extension database, persistent user history, analytics or bundled token. Scoped page context is sent to OpenRouter/the selected provider for inference. Clearing extension-local state does **not** control or promise universal provider-side zero retention.

Manifest permissions remain `sidePanel`, `activeTab`, `scripting`, `storage`, plus only `https://openrouter.ai/*` host access. No all-sites permanent permission, cookies, debugger, webRequest or remote executable code was added.

## Verification record

The final report is in the task folder at `outputs/planning/verification/browser-agent-final-20261024-YYvz4/verify-report.md`. The overall verdict remains blocked/unverified because the required native toolbar/Side Panel gate was not measured. This package is a hash-checked copy of the independently code-checked candidate, not a claim that the original native symptom is conclusively fixed. Real website behavior, live OpenRouter and native panel rendering still need validation.
