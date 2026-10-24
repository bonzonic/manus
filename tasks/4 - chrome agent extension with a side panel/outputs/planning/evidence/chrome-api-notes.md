# Chrome API evidence

Retrieved: 2026-10-24. Author: Manus AI.

## Side Panel

Source: https://developer.chrome.com/docs/extensions/reference/api/sidePanel

Official documentation states Side Panel availability is Chrome 114+ with Manifest V3. `sidePanel.open()` is Chrome 116+ and requires a user action. Proposed baseline: Chrome 116+, use the `chrome.*` namespace and avoid newer panel lifecycle APIs. A toolbar action is the explicit entry point.

## activeTab

Source: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab

The permission is granted by invoking an extension action, context menu, shortcut, or omnibox suggestion. Merely clicking a button in an already-open panel is not documented as an activeTab grant. It survives same-origin navigation, but cross-origin navigation revokes it. Restricted pages such as chrome:// are excluded. It allows injection with `scripting` and grants the current tab's URL/title access.

## Worker lifecycle

Source: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle

Chrome can terminate extension workers after 30 seconds idle, during a request exceeding five minutes, or if a fetch response takes more than 30 seconds to arrive. Opening a port does not by itself keep a worker alive. Globals are lost at shutdown. Proposed design uses session checkpoints and marks uncertain actions interrupted rather than replaying them.

## Content bridge

Source: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

Content scripts read and modify DOM and communicate using runtime messaging. The isolated world protects JavaScript variables but does not make page content or shared DOM trustworthy. Programmatic injection requires host access or activeTab. Proposed MVP uses the top frame only, no main-world injection and no page-provided executable code.

## Storage

Source: https://developer.chrome.com/docs/extensions/reference/api/storage

storage.session is held in memory while the extension is loaded and clears on extension reload/update/disable or browser restart. It is not exposed to content scripts by default; retain TRUSTED_CONTEXTS access. Use it for run checkpoints and user-entered credentials; keep only non-sensitive settings in storage.local. This supports worker-restart recovery, not cross-browser-session resumption or encrypted credential storage.

## Tab API and network

Sources: https://developer.chrome.com/docs/extensions/reference/api/tabs and https://developer.chrome.com/docs/extensions/develop/concepts/network-requests

Most tabs operations do not require the tabs permission; that permission exposes sensitive tab metadata. MVP does not request it. Model requests belong in the extension worker, using only an approved HTTPS model origin with host permission. Content scripts must not request arbitrary cross-origin URLs. Rendering remote text through textContent avoids HTML execution.

## Repository baseline

Repository: C:/Users/wongn/Documents/Interview/Manus

Observed HEAD: 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee, main. Explicit `git -C` baseline inspection confirms .gitignore, AGENTS.md, and README.md are tracked; there is no product implementation. User working tree contains a modified .gitignore and untracked tasks/. Node 22.12.0 is available, but no existing product test/build commands are established. Existing architecture/architecture.md lines 13–17 and plans/plan.md lines 19–21 are title-only, fixture-first proposals; tasks.md.txt lines 2–12 provide the actual richer multi-action brief. An earlier provisional inventory incorrectly described only .gitignore as tracked; the final architecture uses this corrected inventory.

Created detached worktree: C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/architecture-20261024-YYvz4

No user changes were stashed, overwritten, committed, or merged. No browser or model connection was attempted.

## Executor comparators

Sources retrieved 2026-10-24:

- https://developer.chrome.com/docs/extensions/reference/api/debugger — debugger requires its own permission, carries attachment/session complexity, and can detach when DevTools is invoked. It is deferred, not a hidden fallback.
- https://playwright.dev/docs/actionability — documented clicks check uniqueness, visibility, stability, enabled state, and whether the target receives events. The proposed DOM bridge borrows a small subset, not Playwright itself or a claim of equivalent reliability.

## Available tools and gaps

Node 22.12.0, npm, and Git were discovered. Windows CIM CPU/physical-memory telemetry calls returned Access denied; the zeros in the attempted formatting were null-data artifacts, not evidence of idle capacity. No heavy implementation/build/browser process was admitted. The architecture reviewer was text-only with no device process launches. Native Chrome extension loading has not been verified through the available browser tooling; the build plan explicitly allows user-assisted local loading and marks unrun browser checks as unverified.

## User-selected document destination — 2026-10-24 update

The user explicitly requested all documents under `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel`. The five task-owned planning/evidence files were moved together to its `outputs/planning/` folder, preserving relative links and verifying SHA-256 transfer hashes. Existing task drafts were left untouched. This task-specific instruction overrides the previous repository document-location default; future documents and verification reports must remain under the selected task root. Product code remains assigned to the existing isolated worktree.

The user also confirmed local API-key entry is available; provider/model/endpoint selection and architecture approval are still pending. No secret was requested in chat and no implementation was started.
