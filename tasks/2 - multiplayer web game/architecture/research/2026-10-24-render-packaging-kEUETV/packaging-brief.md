# Render packaging brief — Snake source-package route

**Status:** supporting architecture recommendation only. No product code, `render.yaml`, account, deployment, runtime, or hosting mutation was performed. This brief does not change the frozen Snake contract or decide whether the parent selects the managed Game route or the explicit source-code route.

## Recommendation: `render-one-service`

If the parent selects **Route B — explicit source-code deliverable**, use one Render **Web Service** on the Free plan. The Node process should serve the standalone HTML/JS client and static assets over HTTP, and accept the authoritative game WebSocket upgrade at `/ws` on the same HTTP server and public port. Teammates receive one HTTPS `onrender.com` link; the browser derives `wss://<current-host>/ws` from that link.

This is the least-owner-work option for the requested “one shared game link.” It needs one repository connection, one service, one public URL, one build/start configuration, and one origin. Same-origin client and WebSocket traffic avoids a second backend URL, cross-origin frontend configuration, and a second deployment surface. Render documents that Node is a supported web-service runtime, that a web service must bind to `0.0.0.0` and the `PORT` environment variable, that only one public HTTP port is forwarded, and that WebSockets are supported [1]. Render’s Node guide gives `npm install`/`npm start` as examples while allowing the repository’s actual package commands [2].

This is a hobby/demo fit, not an always-on or production promise. The supplied [existing Render evidence](../2026-10-24-free-hosting/evidence/render.md) records Free capacity as 0.1 CPU/512 MB, one Free instance, 750 Free instance-hours per workspace per month, and the current Hobby outbound allowance as 5 GB/month. It also records that Free services can spin down after 15 minutes without inbound traffic, take about one minute to wake, restart at any time, and lose process-memory rooms when the process ends. Those constraints require cold-start and room-loss UI; they do not justify an artificial keepalive, a paid database, a disk, or a hidden uptime promise [6] [8].

The recommendation applies only after the parent explicitly selects Route B. Route A still requires the selected Cloud Computer and the managed Game capability gate. Render documentation does not prove Manus-managed Game integration.

## Ours — constraints already frozen

The authoritative source is the [frozen Snake implementation handoff](../../../plans/runs/2026-10-24-snake-mvp-kEUETV/handoff.md), not the older Treasure Sprint drafts in `architecture.md` and `plans/plan.md`. The hosting package must preserve these settled constraints:

- exactly two guest seats, one room, server-authoritative simulation, versioned JSON over WebSocket, and the specified room/lifecycle/result/rematch behavior;
- one shared browser link, with no teammate hosting account, software installation, or deployment;
- ephemeral room state is acceptable for this demo, but server loss must never invent a winner;
- tab-scoped 256-bit seat credentials must not be put in invitation/query strings or logs, and trusted Origins, payload limits, rate limits, membership, round/epoch checks, and bounded output remain required;
- no database, persistent disk, Redis/Key Value service, account system, peer framework, or optional unlimited-space mode may be added without a new contract decision.

The unresolved standalone-HTML/JS-plus-Node source-package question remains a parent route decision. This brief supplies the hosting recommendation only.

## Theirs — decisive Render facts

Render’s official Web Services documentation says every web service receives a public `onrender.com` subdomain, must bind the application to host `0.0.0.0`, and should use the injected `PORT` variable (default `10000`). Render forwards public traffic to one HTTP port per service, and lists WebSocket connections as a supported capability [1]. Therefore the future Node server should attach HTTP static-file handling and the `/ws` upgrade to one server; it should not expose a second public WebSocket port.

The official Node quickstart uses a Node language runtime and repository-specific build/start commands. The future package must use the package manager and scripts actually discovered in the selected source tree; `npm install` and `npm start` are examples, not permission to invent commands before source inspection [2].

The Blueprint specification supports a service with `type: web`, `runtime: node`, `plan: free`, `buildCommand`, `startCommand`, `envVars`, and `healthCheckPath`. For a web service, `free` is documented as 0.1 CPU and 512 MB [3]. Render’s health-check documentation says an HTTP health path can return any 2xx or 3xx status and must respond within five seconds; it shows `healthCheckPath: /health` in a Node web-service Blueprint example [4].

Render’s WebSocket guidance says to use `wss` for public connections, and the supplied evidence records that public WebSocket responses count as outbound bandwidth. The client must use the deployed HTTPS origin and `/ws`, not a hard-coded `ws://localhost` URL or a separate public port [5].

## Delta — packaging options

| Option | Benefits | Costs and risks | Decision |
|---|---|---|---|
| **A. One Free Node Web Service serving client + `/ws`** | One shared URL; same-origin WebSocket; one Blueprint service; no CORS/backend URL wiring; no DB or disk; least owner and teammate work. | One Free process is the static server and authoritative room server. Cold starts, restarts, Free limits, and in-memory room loss affect both page load and play. Capacity for the 60 Hz simulation is not promised and must be measured later. | **Recommend for Route B.** |
| **B. Free static site + Free Node Web Service backend** | Static assets are separated from the realtime process; frontend delivery can be independent. | Two services, two deployment/configuration surfaces, a backend URL in the client, explicit trusted-Origin/CORS handling, more owner steps, and separate lifecycle/budget/cold-start concerns. It does not remove backend cold starts or room loss. | Reject for this MVP unless the single-service packaging proves technically impossible. |

Option A serves the user’s one-link requirement better. Option B is a reasonable later split if static caching, independent frontend releases, or measured server load requires it, but those are not current requirements.

## Future configuration requirements (text checklist, not a product manifest)

When Route B is authorized and the source package has been inspected, the owner should represent exactly one Blueprint service with these fields:

- `type: web`, `runtime: node`, and `plan: free`; omit Postgres, Key Value/Redis, worker, cron, and persistent-disk resources.
- `buildCommand`: the discovered reproducible install/build command for the selected lockfile and package manager. Do not assume `npm ci`, `npm install`, Bun, or another command until the implementation lane records the actual package scripts.
- `startCommand`: the discovered server start command, commonly an `npm start` script but not a guaranteed value.
- `healthCheckPath: /healthz` (or an equivalent fixed path). It should be a fast unauthenticated process-readiness response, independent of room state, and return 2xx within the Render health-check timeout. It must not require a database or an active game.
- The HTTP server must listen on `process.env.PORT` and host `0.0.0.0`; use Render’s default only as a fallback for local development. HTTP static serving and the `/ws` upgrade must share that server and public port.
- Public client connection scheme: HTTPS for the page and WSS for `/ws`. The client should construct the socket from the current page origin so the service URL is not duplicated in source or query strings.
- `ALLOWED_ORIGINS`: exact deployed origin, such as `https://<service-name>.onrender.com`, plus an explicitly chosen custom domain only if one is actually used. Validate the WebSocket `Origin` against this allow-list; do not use `*`, do not trust arbitrary `Host`, and do not log seat credentials. Same-origin reduces configuration but does not remove the server-side Origin and membership checks required by the frozen contract.
- A production runtime setting such as `NODE_ENV=production` may be included if the selected package uses it. Any server secret needed to mint/verify the frozen 256-bit seat credentials must be an owner-managed environment value, never a committed literal; its exact name belongs to implementation discovery, not this packaging brief.

The application must treat Render interruption as normal failure: show connecting/reconnecting state during the approximately one-minute cold start, use bounded exponential reconnect attempts, freeze or interrupt the round according to the frozen lifecycle rules, and never turn a closed socket into a win. If the process restarts or spins down, the old in-memory room and its credentials should be treated as unavailable; the client should explain that the room was lost and require a new room/join flow rather than claim that either player won. No synthetic HTTP, WebSocket, or scheduled traffic should be added to avoid Free spin-down.

## Owner dashboard flow (future, not executed)

1. First resolve Route B and the source-package format. Connect the repository containing the inspected Node package to the owner’s Render account. Render’s first-deploy tutorial says its example uses free resources and requires no payment, but that is not a universal promise about every signup or future onboarding flow [9].
2. In Render Dashboard, choose **New → Blueprint**, select the repository and intended branch, and review the proposed resources before deployment. Confirm that the review shows one `web` service, Node runtime, `free` plan, and no database, disk, Key Value, worker, cron, or paid compute.
3. Confirm the recorded build/start commands, `/healthz` path, region, and exact `ALLOWED_ORIGINS` value. Keep the payment method absent if the owner wants a hard no-charge posture; Render’s FAQ says that if a payment method is present and included limits are exceeded, supplementary charges can apply, while without one Render disables services instead of charging [7]. This still is not a promise that every account flow will never request payment details.
4. Only after the route, package, and deployment authorization are settled, click **Deploy Blueprint**. Observe build completion and health before sharing the resulting `https://<service-name>.onrender.com` link. The owner shares that one link; teammates should not need Render accounts because the application’s room/join flow is intended to be anonymous.
5. Validate the first-open cold start, create/join/start/play/result/rematch flow, normal reconnect, Render/process interruption behavior, and room-loss messaging on the deployed candidate. Do not create artificial uptime traffic. No deployment or account action was performed in this research run.

## Verified gaps and handoff boundary

Render does not publish a useful open-connection or 60 Hz Snake capacity guarantee for the Free plan. The 0.1 CPU/512 MB figures are resource limits, not a performance or concurrency promise. The approximately one-minute wake time has no latency distribution or service-level guarantee. These remain later implementation/verification measurements, not reasons to add a database or split the frontend now.

The exact package manager, Node version, build output, server entrypoint, and credential-secret name remain unknown until the source-code route is explicitly selected and the implementation lane inspects the package. No product `render.yaml` is emitted here. No board record was updated.

**Decision question for the parent:** if Route B is selected, should the coordinator freeze the packaging choice as **`render-one-service`** (one Free Node web service serving standalone client assets and authoritative `/ws`) while keeping managed Game/Cloud Computer selection as a separate prerequisite?

## References

[1]: https://render.com/docs/web-services "Web Services – Render Docs"
[2]: https://render.com/docs/deploy-node-express-app "Deploy a Node Express App on Render"
[3]: https://render.com/docs/blueprint-spec "Blueprint YAML Reference"
[4]: https://render.com/docs/health-checks "Health Checks – Render Docs"
[5]: https://render.com/docs/websocket "WebSockets on Render"
[6]: https://render.com/docs/free "Deploy for Free – Render Docs"
[7]: https://render.com/docs/faq "Render FAQ"
[8]: https://render.com/docs/outbound-bandwidth "Outbound Bandwidth – Render Docs"
[9]: https://render.com/docs/your-first-deploy "Your First Render Deploy"
