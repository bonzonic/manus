# Shopee extension build — coordinator intake

Run: shopee-20261024-YYvz4. Device: device:26d10d73-0966-4b78-b72f-9a97d38e8663. Started: 2026-10-24 16:13:55 +08:00.

The user approved building the prior must-have plan and made Shopee shopping the primary use case: browse/search for requested products and help add products. They selected OpenRouter, will provide the API token in a local .env, want a cheap default model, user-selectable models, and logs. Their exclusions are “gpt-6 and newer” and “claude fable 5 and newer products.” They asked about making the Chrome extension private and proposed shipping the token inside it. They explicitly requested that the parent act as coordinator and use subagents.

All documents must remain under C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel. This explicit user destination overrides the current repository role-pack defaults. Existing architecture/plan: ../../research.md and ../../plan.md. Product code remains in the already-created detached worktree under .work/worktrees/architecture-20261024-YYvz4, not in the original checkout.

Coordinator responsibilities: intake, stage/resource admission, dispatch, user decisions, and records. Feature owner writes technical contract; a distinct implementer writes code; a fresh verifier checks it. No parent product-code edits or self-verification. No commits/merge/deploy/publication authorized. No actual purchases or real cart modifications are authorized merely by the build request; execution requires specific in-extension approval.

Questions sent to the user: Shopee country/domain; whether “add” means cart with checkout/payment manual; private local key import versus explicitly embedding an extractable key in a package. While pending, owner may prepare a conditional contract; implementation must not publish/share credentials. No .env was present in task root or worktree at intake (existence check only; no secret contents read).

Budget: carry forward the user's 20-minute development time box, report gaps honestly rather than claim fixture-only success. Device capacity and toolchain access must be admitted separately for implementation and verification. Parent-only control of any live browser/user decisions. No CAPTCHA/bot-defense bypass, credential extraction, browser-profile cloning, or unattended automation.
