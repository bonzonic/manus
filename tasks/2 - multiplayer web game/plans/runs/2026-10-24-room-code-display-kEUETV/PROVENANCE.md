---
work_item: 2026-10-24-room-code-display-kEUETV
record_type: owner-investigation-provenance
status: source-proven / ready for distinct implementation
---

# Provenance note

## Repository and revisions

- Target repository: `C:\\Users\\wongn\\Documents\\Interview\\Manus`
- Baseline SHA: `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`
- Baseline project: `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-baseline-20261024-kEUETV\\project`
- Reserved implementation project: `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-fix-20261024-kEUETV\\project`
- Shared project: `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\project`
- Inherited provenance JSON: `PROVENANCE.json` in this same work-item directory; preserved and not overwritten.
- Parent-recorded facts preserved: 39 shared source files match baseline and the existing user localhost:10000 server is untouched.

## Investigation boundary

This owner stage was limited to source, metadata, and document reading/writing. No product files were edited. No tests, server, browser, install, build, process, commit, merge, push, or deployment operation was performed. No owner browser reproduction is claimed.

## Source evidence inspected

- `server/authoritative-server.js:7-11`: welcome contains `roomCode`.
- `server/rooms/room-manager.js:124-165`: CREATE/JOIN returns the welcome after assigning the room.
- `public/client-model.js:8-10`: `applyWelcome` stores `message.roomCode`.
- `public/app.js:19-27`: welcome handling calls the render pipeline.
- `public/dom-renderer.js:17-37`: render path omits room-code DOM writes.
- `public/index.html:21-24`: header `#room-code` starts at `--------`.
- `public/index.html:163-168`: lobby `[data-copy-source="room-code"]` starts at `--------`.
- `public/app.js:83-87`: copy invite is model-based and remains a regression guard.
- `server/index.js:33-38`: known origin defaults; no origin change is part of this fix.

## Evidence classification

- Reporter screenshot: `reporter-observed-screenshot`, parent-visible and not reopened locally.
- Static mechanism: `owner-source-proof`, reproducible from the baseline source and line references above.
- Runtime behavior: not measured by owner; independent verifier must supply native-DOM and real-headless-browser evidence.

## Operational dependency gap

The named `.claude/skills/om-bug-loop/references/tdd.md` file was not present at its requested path. The available investigation, browser-driving, measurement, capture, shipping-invariants, role, and repository guidance were read. This missing reference does not prevent the frozen source-level contract, but it is recorded for the parent.

## Next authorized stage

Parent/coordinator may admit a distinct implementer against the frozen `plan.md` and `handoff.md`. Independent verification must use separate records under the designated verifier directory and must not be replaced by owner numbers or the reporter screenshot.
