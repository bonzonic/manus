# How to try the supervised Shopee/OpenRouter slice

## Candidate path

Load this exact directory as an unpacked Chrome extension:

`C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/ui-privacy-20261024-YYvz4/extension`

In Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the `extension` directory. No ZIP or shipping package was created in this implementation stage.

## Setup in the panel

1. Invoke the extension from the toolbar while the active tab is already on the selected Shopee region. The extension does not guess a country and `activeTab` access is scoped to that invocation.
2. In **Shopee region (required)**, choose the only supported origin: `Shopee Malaysia (https://shopee.com.my)`. The adapter rejects every other origin, redirect, or changed-origin navigation.
3. In **OpenRouter session key (masked; never packaged)**, paste a locally supplied key only if you deliberately choose to test the provider. Press **Save session settings**. The key is sent to the trusted worker’s session state; it is not rendered back, logged, embedded, or written to `.env`.
4. Press **Refresh live model catalog**. The picker lists every permitted live text-chat record with model name/ID, prompt/completion/request prices, structured-output/response-format capability or an explicit limited warning, and refresh timestamp. The cheapest structured-capable eligible live value is preferred as the automatic default without hiding other permitted text models. GPT generation 6+ and the exact Claude Fable generation 5+ are filtered and rechecked before a request.
5. Press **Observe selected Shopee tab**, enter the public request in **Request**, and choose **Run plan / advance**. The worker remains the only action authority.

## Supervised action flow

The panel shows the intended action before dispatch, current progress, outcome/uncertainty, and a timeline of observation, plan, approval, action, result, pause, cancellation, and error events. The bridge observation supplies rendered product cards, visible price/currency, variant/option evidence, selected options, quantity evidence, cart messages/fingerprint, and target fingerprints. Every click/fill presents an **Exact approval** preview. For a cart action the preview includes **SITE/REGION**, **ITEM**, **ITEM ID**, **OPTIONS**, **QUANTITY**, **EXPECTED**, and the target fingerprint. Approve only when all values exactly match the current rendered item. A changed target, option, quantity, region, document, origin, or expected result is freshly rechecked and fails closed with a new-approval request. Clicks are limited to explicit rendered public search/shopping controls; generic continuation, checkout, payment, identity, address/contact, login, verification, and order controls are blocked.

**Pause** prevents the next dispatch; **Resume** re-observes and invalidates pending approval; **Cancel** stops future advancement but does not claim to undo a dispatched action. Approval dispatch always re-observes the same-origin target and cart policy before effects. Post-action verification uses a fresh observation and evidence delta; an uncertain click remains `unknown` / “action sent; outcome unverified” and is never retried automatically. **Export sanitized timeline** exports bounded safe fields only. **Clear session** removes the run/session state.

There is no checkout, buy-now, payment, login, CAPTCHA bypass, order submission, arbitrary selector, arbitrary JavaScript, hidden Shopee endpoint, cookie read, local/sync storage, telemetry, analytics, or remote history. Raw snapshots, prompts, page text, existing field values, and shopping details remain in runtime memory only. Extension-local **Clear session** removes the key and state; it does not claim universal zero-retention by OpenRouter or other providers. Shopee support is **live-unverified** until a fresh coordinator/verifier obtains browser evidence.

## Tests on the bound Windows device

From the prepared worktree:

```powershell
cd "C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/ui-privacy-20261024-YYvz4/extension"
node --test .\tests\*.test.mjs
Get-ChildItem . -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

The final run completed with **31 passed, 0 failed, 0 skipped** and `syntax-check: PASS` on Node `v22.12.0`. No real provider request, browser navigation, cart mutation, key read, packaging, or live Shopee verification was performed; Shopee selectors, native side-panel loading, redirects, anti-bot/login/CAPTCHA behavior, and real cart confirmation remain live-unverified.

## Private unpacked-key caveat

This is a local/private development path, not a secret vault. An extension key entered in a browser session can be extracted by the machine owner or developer tools, and Chrome’s unpacked directory is readable. Never commit, publish, screenshot, paste into chat, or include a real key in the extension directory or ZIP. No `.env` importer is included and no `.env` was read. Use a low-limit development key, keep the unpacked directory private, rotate the key if exposure is suspected, and clear/close the extension session after testing. A future public/private store distribution should move provider custody to an authenticated backend rather than relying on a client-side key.
