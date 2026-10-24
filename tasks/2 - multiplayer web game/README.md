# Multiplayer Snake — Local setup and usage

A two-player, classic grid-based Snake game. Apples make your snake longer; mushrooms give a temporary speed boost. The browser is the client, and a Node.js server controls the shared match.

## Current status

This is a local development candidate, not a deployed or fully verified release. The room-code display defect is fixed and independently verified in the local room flow. Full two-player gameplay, reconnect, and public HTTPS/WSS verification are still pending.

There is currently **no public play link**. The address `localhost:10000` only works on the computer running the server.

## Get the code

The current editable source is in [`project/`](project/). Open that folder in VS Code.

For a portable copy, download the [original source review ZIP](outputs/multiplayer-snake-source-review-candidate.zip), extract it, and open its `project` folder. **The ZIP is an older snapshot** and still has the room-code display bug. To get the verified fix, copy the current shared [`project/`](project/) folder instead.

```text
project/
├── public/          Browser page, controls, and rendering
├── server/          Authoritative game server and rooms
├── shared/          Shared protocol and constants
├── test/            Automated checks
├── docs/            Implementation and proposed hosting notes
├── package.json
├── package-lock.json
└── render.yaml
```

## Requirements

- **Node.js 22.x**, version **22.12.0 or later** within that major version. The current package requires `>=22.12.0 <23`.
- npm, included with Node.js.
- A recent desktop browser.
- Internet access for the initial dependency installation.

Check your versions in PowerShell:

```powershell
node --version
npm --version
```

## Start the game locally

### 1. Open the project folder in PowerShell

For the shared repository copy:

```powershell
cd "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\project"
```

If you extracted the ZIP elsewhere, replace this path with the extracted `project` folder.

### 2. Install the pinned dependency

```powershell
npm ci --ignore-scripts --no-audit --no-fund
```

You only need to repeat installation after the package or lockfile changes, or after deleting `node_modules`.

### 3. Start the server with the correct local Origin allowlist

If a previous game server is running in another terminal, stop it there with **Ctrl+C** first.

```powershell
node --input-type=module -e "import { createGameServer } from './server/index.js'; const server = createGameServer({ host: '127.0.0.1', port: 10000, allowedOrigins: ['http://127.0.0.1:10000', 'http://localhost:10000'] }); await server.start(); console.log('Open http://localhost:10000');"
```

**Use this command instead of `npm start` for now.** The default launcher does not configure the port-specific browser Origins correctly. The explicit command keeps Origin validation enabled and allows only the listed local addresses.

Leave this terminal open while playing.

### 4. Open the browser

Open **[http://localhost:10000](http://localhost:10000)**. Alternatively use **[http://127.0.0.1:10000](http://127.0.0.1:10000)**. Stick to one of these addresses when sharing a local room link.

Do not open `public/index.html` directly from disk. The page needs the running HTTP/WebSocket server.

## Try two players on one computer

The following is the intended flow; the complete flow is still awaiting end-to-end verification.

1. Open the game in a normal browser window for player one.
2. Open the same address in an **Incognito/InPrivate window**, or a different browser, for player two. Use an independent browser session rather than duplicating an existing game tab.
3. Player one selects **Create a room**.
4. Share the eight-character room code, or use **Copy invite** and open that link in player two's window.
5. Player two joins the same room.
6. Both players select **Ready up**. The match should start after the countdown.
7. Steer with the arrow keys or the on-screen direction buttons. Collect apples and mushrooms, and avoid collisions.
8. After a result, both players can request a rematch.

No player account is needed for this local guest-room flow. A local invite link cannot be used by someone on another computer; public shared-link play requires deployment first.

## Stop the server

Return to the PowerShell window running the server and press **Ctrl+C**.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `BAD_ORIGIN` | Stop the old server and use the explicit startup command above. Open exactly `http://localhost:10000` or `http://127.0.0.1:10000`. Do not disable Origin checks. |
| `EADDRINUSE` | Port 10000 is already in use. If it is your earlier game server, stop it in its own terminal with Ctrl+C. Do not terminate unrelated processes. |
| Cannot find package `ws` | Run the dependency installation command from inside `project/`. |
| Cannot find `server/index.js` | Check that PowerShell is in the `project` folder, not the task folder or `public/`. |
| Browser cannot connect | Keep the server terminal open and check it for startup errors. The local health endpoint is [http://localhost:10000/healthz](http://localhost:10000/healthz). |
| Room code still shows `--------` | Confirm you are running the shared `project/` copy, not the older ZIP, then force-refresh with **Ctrl+Shift+R**. If it persists, report it rather than using a guessed code. |
| npm PowerShell script is blocked | Use `npm.cmd` in place of `npm` for the installation command; no administrator permissions or system-wide policy change is needed. |

## Tests and hosting notes

The project provides named checks such as `npm run test:rules` and `npm run test:client`. A passing subset does not prove the full multiplayer product works, and some transport checks still have known fixture issues.

See [the current delivery status](plans/runs/2026-10-24-snake-mvp-kEUETV/delivery-status.md) for the broader verification limits and [`project/docs/render.md`](project/docs/render.md) for proposed Render setup. Hosting configuration files are not evidence of deployment. Do not assume that their allowlist or repository-root settings are ready for your hosting account without checking them.

After an authorized deployment and public verification, teammates should only need the resulting shared HTTPS link; they would not install Node.js or create hosting accounts.
