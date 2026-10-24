---
work_item: 2026-10-24-room-code-display-kEUETV
record_type: original-defect-details
status: preserved
---

# Original defect details

## User report

After a successful room creation, the room-created dialog is shown, but the code field still displays its dashed placeholder rather than the server-issued eight-character room code. The parent-visible screenshot shows:

- `ROOM CREATED`
- `Your field is ready`
- copy/share instruction for the eight-character code
- code value rendered as eight dashes
- `Ready up` action

The parent also reports that the previous `npm start` bad-origin issue is known and already has an explicit `createGameServer` origin workaround. That configuration issue is not this defect.

## Scope decision

Investigate only the welcome-to-model-to-DOM display path, including the duplicated header code and existing copy-invite consistency. Do not widen to lifecycle, gameplay, origin launcher, server protocol, reconnect, or whole-MVP acceptance.

## Baseline context

- Baseline SHA: `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`
- Baseline worktree: `.work/worktrees/snake-room-code-baseline-20261024-kEUETV/project`
- Fix worktree reserved for distinct implementation: `.work/worktrees/snake-room-code-fix-20261024-kEUETV/project`
- Shared source equivalence: 39 source files match baseline
- Existing user server: untouched
- Owner stage: source/metadata/documentation only; no test, server, browser, install, build, process, commit, merge, push, or deploy activity

## Mechanism summary

`buildWelcome` includes `roomCode`; `applyWelcome` stores it in `model.roomCode`; `app.js` calls the render pipeline after welcome. `dom-renderer.js` never writes the header or lobby data-source element, whose static placeholders therefore remain visible. The copy handler reads the model directly and is not the source of the display defect.
