# Confirmed user decisions — 2026-10-24 16:19:44 +08:00

This instruction supersedes the pending region and credential decisions in the owner packet.

- Target Shopee Malaysia: https://shopee.com.my.
- Product additions mean add-to-cart only. Checkout is always manual; no buy-now, payment, purchase, or final order submission tool.
- Each user enters their own OpenRouter API key inside the extension. No bundled key or .env; no local environment-file importer is needed.
- The Side Panel must show what the agent is trying to do before actions, plus current progress/outcome and exact add-to-cart preview.
- Session-only storage. The extension must not persist browsing/shopping history, raw page content, field values, messages, prompts, tokens, or shopping details to disk, sync, telemetry, or a database. Necessary live working context exists only during the active session; keep snapshots/prompt values in memory and minimal run metadata/logs/key in trusted-context chrome.storage.session, clearing on Clear session, reload/update/disable, or browser restart. No storage.local, storage.sync, analytics, remote task store, or server history. Clarify that scoped page context is sent to the chosen OpenRouter model for processing; extension-local retention is not a guarantee about provider retention.

Previous approvals and exclusions remain: exact click/fill approval; exact cart item/options/quantity and no blind retry of uncertain effects; GPT-6+ and literal Claude Fable-5+ excluded on both catalog UI and outgoing request; cheap default and user model choice; sanitized session logs. Product code stays in the prepared worktree and all documents stay in this task folder. No real cart item mutation is authorized by building the feature; the user approves each concrete action in the extension.

Build authorization is confirmed. No key embedding or publication is authorized. Native unpacked personal installation is the delivery target; private store distribution remains explanatory, not an instruction to publish.
