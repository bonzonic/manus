---
title: Free hosting for multiplayer Snake
status: recommendation-awaiting-provider-decision
author: Manus AI
researched: 2026-10-24
---

**Recommend Render Free for a small team demo.** It can run the proposed Node/WebSocket server without a backend rewrite, offers recurring free hosting, and provides a public URL. Teammates can be given one browser link; only an owner/deployer needs to set up hosting. The trade-off is roughly a one-minute wake-up after inactivity, possible restarts and finite usage allowances—not guaranteed always-on service. [1] [2] [3]

[Short hosting decision](decision.md). This recommendation does not select a provider, approve billing or establish a working deployment.

## Render: the simplest first deployment

Render supports free Node web services and public secure WebSockets. Its Free service has 0.1 CPU and 512 MB RAM, one instance, and a recurring allowance of **750 running instance-hours per workspace per calendar month**. It is explicitly intended for hobby/testing use rather than production. That is a reasonable category for this small team/interview demo, but not evidence that our proposed 60 Hz simulation or ten-room cap has been measured. [1] [2] [5]

The important catch: a Free web service sleeps after **15 minutes without inbound traffic**, including incoming WebSocket messages. The next request/new connection wakes it, taking **about one minute** according to Render. Normal player input contributes inbound activity, but outgoing snapshots alone must not be assumed to prevent sleep. Render may also restart a Free service at any time. Our process-memory rooms are therefore disposable when the process is lost; clients must show an interrupted match rather than fabricate a result. [1] [2]

The Hobby workspace includes **5 GB/month outbound bandwidth**, shared by the frontend and backend. Browser downloads and public WebSocket responses count toward usage. With no payment method, reaching chargeable allowances can suspend services or disable new builds rather than bill overages; with a payment method linked, overage billing is possible. The free tutorial says, “No payment is required,” but live signup/account prompts were not tested. We should choose only free resources, check the actual account settings and not add a card just to proceed. [1] [3] [6] [7]

### One link for teammates; one initial owner setup

The proposed deployment consists of a **free static site for the browser game** and a **free Node web service for rooms**. Render documents both free service types. The static site is served over its content-delivery network, independently of the backend process. It can display the game UI and “Starting game server…” while the backend wakes. Both still share bandwidth/build allowances. [1] [3]

The owner would create/use Render and a supported Git-provider account, connect the prepared game repository, review a prepared Blueprint deployment and choose the free resources. Render Blueprints describe multiple services in one configuration file and support a free Node web service. This is a low-touch dashboard workflow once the source/configuration are prepared, **not zero account setup and not a promise that one button completes every step**. No terminal should be needed for the owner's documented dashboard path after preparation. [3] [4] [5]

Teammates would open the frontend URL, create or join a room, and play. They would not install Node/Godot, run a server, configure ports or own Render accounts. That is the proposed guest-game design layered onto a public URL; it still needs an actual two-browser acceptance test. If teammates also need their own deployment, each copy needs its own owner account/repository connection and the same prepared template. [2] [3] [4]

## Other free-host candidates

### Cloudflare: credible alternative, but a different backend

Workers Free and SQLite-backed Durable Objects have recurring free quotas. A Durable Object can coordinate one room, and Workers can serve static assets and accept WebSocket upgrades. The specific Durable Objects pricing page gives **100,000 request-equivalents/day and 13,000 GB-seconds/day**; exceeding a free dimension causes further operations of that type to fail until reset. A GB-second measures allocated memory multiplied by active time—it is not a bandwidth allowance. [8] [9]

This is not a drop-in deployment of Node's `ws` server. We would replace process-global rooms with Durable Object room identities and adapt admission, sockets and state recovery to Cloudflare APIs. A continuously ticking 60 Hz room cannot use idle WebSocket hibernation savings because scheduled timers prevent hibernation. That does **not** rule out a small free game; it means active rooms consume finite duration/request budgets and need measurement. [9] [10]

Cloudflare offers a Deploy button that provisions declared resources from a public GitHub/GitLab repository into the owner's accounts. Teammates can subsequently use the public URL. The reviewed sources did not settle whether free-account/SQLite-DO activation requires a payment card. Treat Cloudflare as a viable architecture alternative, not the easiest implementation of the current Node/ws plan or an unlimited-free promise. [11]

### Koyeb: same-runtime alternative with a card catch

Koyeb has one recurring free Web Service with 0.1 vCPU, 512 MB RAM and 2 GB SSD, limited to Frankfurt or Washington, D.C. A held Internet WebSocket is explicitly part of the condition that prevents scale-to-zero; an otherwise idle free service sleeps after one hour. A Deploy button can simplify setup. [12] [13] [15]

However, Koyeb explicitly requires a credit card and documents a **$29 temporary authorization hold**. Its FAQ also describes charging the selected account plan during signup, while saying the free Web Service itself is never charged. That makes account-plan review essential and means I would not recommend it as an unqualified zero-payment/no-card choice for this request. Its free instance is also described as hobby/testing, not production. [12] [14]

### Railway and Fly.io: not the first choice for ongoing free use

Railway does have a recurring Free allowance: a one-time 30-day/$5 trial followed by **$1 credit per month**, not trial-only hosting. But an always-available Node room server fitting that allowance has not been demonstrated. Use it for bounded experiments rather than assume a lasting free game host. [16]

Fly.io explicitly says new organizations have **no ongoing free tier**. Its new-user trial is up to two VM-hours or seven days, whichever comes first. Legacy allowances do not establish eligibility for a new account. It therefore does not meet our ongoing-free-hosting goal. [17]

## What changes in our Snake plan

The [current Snake architecture](../../../architecture.md) proposes a Godot Web client, a Node/ws authoritative server and ephemeral rooms. Render preserves the server/runtime design. The hosting change affects endpoint configuration, allowed Origins, startup UI, build/export packaging, deployment manifests and hosting acceptance—not apples, mushrooms or classic grid turns.

The first version should add a clear startup/wake state, bounded connection retries and a useful quota/unavailable message. Initial server wake-up must not be confused with the in-match 15-second reconnect grace. Both players must be admitted before starting; if a host restart loses the room, offer create/join again without inventing a winner. Measure snapshot/download bandwidth and loop performance before choosing a room limit.

Prepare an exported browser bundle plus the locked Node service, a free-resource deployment configuration and a short screenshot-based owner guide. Keep the Godot exporter in the development process; do not assume the free Node builder already has it installed. A public URL, actual browser export, correct security/MIME headers and two-client WSS play all remain acceptance gates. No hosting manifest, deployment or source package has been built by this research.

**The managed-workflow constraint still needs resolution.** The installed Manus Game route currently requires a selected Cloud Computer before initialization. Its documentation does not establish a native Render/Cloudflare substitute. Free provider support is real, but this research cannot promise that the current managed setup can publish to it directly. An allowed external deployment/export/source-deliverable route must be agreed before implementation; do not rent a paid computer merely to bypass the user's zero-cost requirement. [Local capability evidence](evidence/intake.md).

This is a short deployment/packaging work chain for Render after the product exists; Cloudflare adds a separate backend adaptation chain. Neither is a hosting action already completed. There is no need for a database, external uptime watcher or artificial traffic just to keep a free service awake.

**Teammate requirement confirmed:** players only need to use one shared game link; they do not need to deploy individual copies. Only the owner/deployer needs initial hosting setup. **Decision:** use Render Free for the first team demo, accepting approximately one-minute idle wake-up and hobby-service limits, or investigate the Cloudflare backend alternative further?

## References

Official sources were retrieved 2026-10-24. Retained detailed evidence: [Render](evidence/render.md), [frontend follow-up](evidence/frontend.md), [Cloudflare](evidence/cloudflare.md), [Koyeb](evidence/koyeb.md), [Railway](evidence/railway.md), [Fly.io](evidence/fly.md). No signup, billing, deployment or capacity test was performed.

[1]: https://render.com/docs/free "Render free web services and static sites"
[2]: https://render.com/docs/websocket "Render public WebSocket connections and lifecycle"
[3]: https://render.com/docs/your-first-deploy "Render first free deployment tutorial"
[4]: https://render.com/docs/infrastructure-as-code "Render Blueprint deployment workflow"
[5]: https://render.com/docs/blueprint-spec "Render Blueprint specification and compute plans"
[6]: https://render.com/docs/outbound-bandwidth "Render outbound bandwidth allowances"
[7]: https://render.com/docs/faq "Render billing behavior without a payment method"
[8]: https://developers.cloudflare.com/workers/platform/pricing/ "Cloudflare Workers Free pricing and static assets"
[9]: https://developers.cloudflare.com/durable-objects/platform/pricing/ "Cloudflare Durable Objects Free quotas"
[10]: https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/ "Durable Object lifecycle and timer-related hibernation conditions"
[11]: https://developers.cloudflare.com/workers/platform/deploy-buttons/ "Deploy to Cloudflare owner-account workflow"
[12]: https://www.koyeb.com/docs/reference/instances "Koyeb free instance resources and allowed regions"
[13]: https://www.koyeb.com/docs/run-and-scale/scale-to-zero "Koyeb scale-to-zero and held WebSocket behavior"
[14]: https://www.koyeb.com/docs/faqs/pricing "Koyeb card validation and account-plan billing"
[15]: https://www.koyeb.com/docs/build-and-deploy/deploy-to-koyeb-button "Deploy to Koyeb workflow"
[16]: https://railway.com/pricing "Railway recurring Free credit after trial"
[17]: https://docs.fly.io/about/pricing "Fly.io new-account trial and absence of ongoing free tier"
