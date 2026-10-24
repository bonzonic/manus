# Vercel hosting evidence

**Verified:** 2026-10-24, against current official Vercel documentation and changelog only.

## Decision

**Whole current game: No, not unchanged.** Vercel is now a credible host for the browser frontend and a WebSocket endpoint, including on Hobby, but the proposed Node/ws authoritative server relies on in-memory rooms and a continuously running simulation. Vercel requires Fluid Compute for WebSockets, closes connections at the function maximum duration, and explicitly requires durable room/presence/counter/pub-sub state outside the function instance. Hobby's maximum function duration is 300 seconds (5 minutes). The game could fit conditionally after a backend redesign: external shared state/coordination, reconnect and resubscription after forced connection closure, and a measured low-volume demo profile.

The frontend fit is **yes**: Vercel can serve a browser deployment, and its Functions documentation shows Node.js server frameworks using `ws`. Teammates can use a public guest-game URL once the owner deploys it, provided the application itself does not add an account gate. This does not eliminate the need to host the realtime backend.

## Exact supporting excerpts

1. The current WebSockets page states: “WebSockets are available on all plans.” It also says: “A single WebSocket connection is pinned to one Vercel Function instance,” while Fluid Compute lets one instance handle multiple connections. [1]

2. The same page documents Node.js server support with `ws`: “Node.js server frameworks such as Express, Hono, and h3 can also serve WebSocket connections on Vercel,” and gives an `http.createServer` plus `WebSocketServer` example. For Next.js it documents `upgradeWebSocket()` from `@vercel/functions` version 3.10.0 or later. [1]

3. Vercel’s state guidance is decisive for this game: “New WebSocket connections are not guaranteed to reach the same Vercel Function instance,” and “Store durable state, presence, counters, rooms, and pub/sub coordination in an external data store instead of relying on in-memory variables.” [1]

4. The connection lifetime is bounded: “WebSocket connections close when a Vercel Function reaches its maximum duration.” The page also says WebSockets “require Fluid compute to be enabled”; Fluid Compute is the default for new projects created on or after April 23, 2025. [1]

5. Vercel announced on October 20, 2026: “WebSocket support in Vercel Functions is now generally available.” The changelog explicitly names “realtime multiplayer apps” and says WebSocket connections follow “the same limits and pricing as other Function invocations.” [2]

6. Current Function limits list Hobby maximum duration as “300s (5 minutes)” and Pro/Enterprise as 800s maximum, with 1,800s only as an extended beta. The same page says Function cost is based on active CPU time and provisioned memory time. [3]

7. The Hobby page calls Hobby “free” and aimed at “developers with personal projects, and small-scale applications.” Its included monthly resources include 4 CPU-hours of Active CPU, 360 GB-hours of Provisioned Memory, the first 1,000,000 Function Invocations, 100 GB Fast Data Transfer, and 10 GB Fast Origin Transfer. [4]

8. Eligibility is conditional, not automatic: the Hobby page says it “restricts users to non-commercial, personal use only.” Vercel’s Fair Use Guidelines define commercial usage as a deployment used for financial gain of “anyone involved in any part of the production,” including a paid employee or consultant writing the code. A casual private demo with no paid/commercial purpose appears compatible; a company or paid-work/interview deliverable may not be, so that case should be confirmed with Vercel. [4] [5]

## Recommendation for the parent decision

Use Vercel alone only if the game is intentionally redesigned around Vercel’s bounded WebSocket Functions: an external room store/pub-sub layer, reconnection after the 300-second Hobby limit, and no dependence on instance-local room state. For the proposed Node/ws server with in-memory ephemeral rooms and an ongoing 60 Hz authoritative loop, answer **no as-is**. A split deployment—Vercel for the frontend and a realtime backend elsewhere—remains the simpler fit if the backend must preserve a long-lived authoritative process without forced five-minute reconnects.

## Gaps and caveats

These sources do not promise uptime, restart frequency, capacity for this exact 60 Hz/15-snapshot workload, or state persistence across crashes. No deployment, load test, account check, or provider integration was performed. External storage/pub-sub pricing and free eligibility were not researched here. Vercel’s current docs supersede the historic blanket “no WebSockets” claim, but they do not make in-memory rooms or unbounded server loops safe.

## References

[1]: https://vercel.com/docs/functions/websockets "WebSockets — Vercel Documentation"
[2]: https://vercel.com/changelog/websocket-support-is-now-generally-available "WebSocket support is now generally available — Vercel Changelog"
[3]: https://vercel.com/docs/functions/limitations "Vercel Functions Limits"
[4]: https://vercel.com/docs/plans/hobby "Vercel Hobby Plan"
[5]: https://vercel.com/docs/limits/fair-use-guidelines "Fair Use Guidelines — Vercel Documentation"
