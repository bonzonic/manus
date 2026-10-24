# Browser Task Agent 0.2.0

**Private local unpacked Chrome extension.** This is not a published Chrome Web Store product or a fully verified release. The currently available download is [browser-task-agent-0.2.0.zip](../browser-task-agent-0.2.0.zip). It predates the in-progress **Observe selected tab** repair; do not treat that ZIP as containing the pending repair. The five-model candidate is independently code-checked but is not yet packaged.

## Install on Windows

1. Download and extract `browser-task-agent-0.2.0.zip` completely.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the extracted `extension` folder—the folder that directly contains `manifest.json`. Do not select the ZIP or its parent folder. If Chrome reports that `manifest.json` is missing, choose the next inner extracted directory.
4. Pin **Browser Task Agent** from the Extensions menu, then click its toolbar icon while an ordinary HTTPS page is the selected tab.

For an existing installation, use **Reload** on its extension card instead of removing and reinstalling it. Confirm the name **Browser Task Agent** and version **0.2.0** after reload. A folder retained for update compatibility is not a Shopee-specific product name.

**Important native limitation:** the actual Chrome toolbar-opened native Side Panel remains unverified, even though the extension now uses the official `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` API. The current **Observe selected tab** reporter does nothing in the affected build; repair is in progress. A panel page or mock API check is not proof that the native toolbar path works.

## First-use flow

The following is the expected supervised flow, not a claimed native walkthrough. Use an ordinary public HTTPS documentation/search page or a public unit-conversion page; no paid calls or real account/cart/payment operations are part of QA.

1. In **Setup**, optionally enter your own masked **OpenRouter session key** and click **Save session settings**. The key is never packaged. Key/model setup is for AI proposals, not a prerequisite for provider-free observation.
2. Click **Refresh live model catalog**, then select a permitted text-chat model. Live availability, prices, and the inexpensive default come from the catalog; no model is invented. GPT generation 6+ and literal Claude Fable generation 5+ are excluded. A planned familiar-family note—GPT mini, Claude Haiku, Gemini Flash, DeepSeek, and Qwen—is a pending update, not a claim that all five are currently packaged or available. Full all-model catalog coverage remains outside this guide.
3. In **Task**, describe a bounded request such as finding a public documentation page, reading/scrolling it, or converting a value.
4. Click **Observe selected tab**. In the current affected build this may do nothing; do not interpret a missing response as successful observation. If it works after the repair, it should establish the selected tab and exact origin.
5. Click **Run plan / advance**. Review **Exact approval**, including the action, origin, target, expected condition, and bounded non-sensitive fill value. Click **Approve this one action** only when it is correct. Every click or fill requires one separate approval.
6. Use **Pause** or **Cancel** to stop progression. **Timeline** shows bounded sanitized events; **Export sanitized timeline** downloads them, and **Clear session** removes extension-local session state.

## Scope and safety

The agent provides four bounded tools on the selected tab and exact origin: observe, bounded scroll, safe public fill, and safe public same-origin click. It uses fresh rendered top-frame target evidence; it does not execute model-provided CSS/XPath/scripts, coordinates, endpoints, or selectors. Stale or unknown results, changed origins, unsupported origins/pages, missing access, cross-origin or new-tab actions, and native/file-dialog controls stop or require manual action.

One-use-per-click/fill approvals prevent replay of an approved action. Login/password/OTP/CAPTCHA, identity/contact/payment fields, destructive or irreversible work, and sensitive controls remain manual or blocked. A shopping/cart example may require **Exact approval**, but checkout and payment are always manual. Never claim that a cart or checkout action succeeded without a reported result.

## Privacy and state

The user supplies a per-user key locally. Minimal session state is kept in `chrome.storage.session`; raw page context, prompts, and field values remain in memory. Logs are bounded and sanitized, with no extension database, persistent user history, analytics, or packaged token. Scoped context may be sent to OpenRouter/the selected provider for inference. **Clear session** does not control or promise universal provider-side retention. Do not put keys or raw sensitive values in screenshots, exported logs, or support messages.

The manifest permissions are `sidePanel`, `activeTab`, `scripting`, and `storage`, with only `https://openrouter.ai/*` host access. The extension does not request permanent all-sites access, cookies, debugger, webRequest, or remote executable code.

## Troubleshooting and reporting

- Start on an ordinary HTTP(S) page. Restricted URLs such as Chrome Web Store pages may not permit the temporary access needed by the selected-tab flow.
- Invoke the toolbar action again on the intended tab to request the temporary grant; do not broadly enable all-site permissions. Access denial cannot be bypassed by claiming success.
- If the panel or observation fails, record the exact visible error/status. On `chrome://extensions`, inspect the extension card’s **Errors** or **service worker** link and report its exact error with keys hidden.
- If the extension cannot load, verify that the selected unpacked folder directly contains `manifest.json`, rather than selecting the ZIP or its parent.
- Do not report a fake UI success. The native toolbar-opened Side Panel check and the current Observe repair still require verification after the updated package is available.
