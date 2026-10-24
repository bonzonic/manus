# Implementation report: five-family model picker

- **Source directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\models-five-20261024-YYvz4\extension`
- **Baseline:** detached `HEAD 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; candidate package version remains `0.2.0`.
- **Scope:** only `core/model-catalog.js`, `worker.js`, `panel.js`, and `tests/model.test.mjs` changed. No manifest, HTML, endpoint, bridge, policy, startup/action, privacy, storage lifecycle, or package-version changes.

## Runtime behavior

The picker now derives a deterministic maximum-five shortlist from the current eligible live catalog in fixed order:

1. OpenAI GPT mini
2. Anthropic Claude Haiku
3. Google Gemini Flash
4. DeepSeek
5. Qwen

Each family chooses the first eligible preferred ID if live; otherwise it chooses the lowest estimated-cost matching live entry with deterministic ID tie-breaking. Expired, non-text, undersized, malformed-price, GPT-6+, and literal Claude Fable-5+ entries are excluded by the existing eligibility/exclusion predicates. Missing families are omitted and reported as `missingFamilies`; no family is duplicated or fabricated.

The worker retains the full eligible catalog internally, exposes `catalog.shortlist` and `catalog.missingFamilies` through the real `GET_STATE`/`LOAD_CATALOG` path, and chooses the cheapest displayed shortlist entry only. A configured ID outside the current shortlist is rejected before the run/provider path. The panel renders only `catalog.shortlist`, including family, live name/ID, prompt/completion/request pricing, context length, text modality, and structured/no-structured capability badges, plus shown/eligible counts and omitted family labels.

## TDD and verification

- **RED first:** after adding the focused tests and before production edits, the model suite failed on the missing `buildModelShortlist` API and missing worker/panel shortlist behavior. After correcting two boundary-test doubles (Chrome `sendResponse` callback capture and `document.createElement`), the remaining product RED was the worker returning the generic setup error before stale-ID rejection; the worker ordering was then minimally fixed.
- **Focused GREEN:** `node --test tests/model.test.mjs` — **14 passed, 0 failed**, exit 0.
- **Full suite:** `node --test` — **47 passed, 0 failed**, exit 0.
- **Syntax:** `node --check core/model-catalog.js`, `worker.js`, `panel.js`, and `tests/model.test.mjs` — all passed, exit 0.
- The boundary tests use a fake catalog, fake Chrome runtime, fake DOM, and no LLM/provider calls. The worker test invokes the actual registered message callback and exercises `LOAD_CATALOG`, state exposure, configuration, and `ADVANCE` rejection; the panel test invokes the actual module render flow.

## Changed-file SHA-256

- `core/model-catalog.js`: `56603BE3E0FF4B8414C56B85D1CC256B955BFDCA9646F31DF3AED690058AA66B`
- `worker.js`: `A5C5076436463020E0A69D276E8BCE4E01D8785D63EE78DC35A102CFC6330F56`
- `panel.js`: `F47C16FD70FF9DCB3EE3EB70D1272EA7CECA45B7C4492402CB84BC91EF9F9208`
- `tests/model.test.mjs`: `B19DCA4FC2801A3E1C91EDE107DCFBED1AB1C08600CF099D0282CD89DBEDDCEA`

## Wiring limits and concerns

- No real OpenRouter key was read and no live paid/provider generation call was made; catalog tests use a deterministic fake catalog.
- No browser process, native Side Panel claim, deployment, commit, merge, or package install was performed.
- The implementation preserves full-catalog outgoing eligibility semantics and adds the shortlist guard in the worker; independent verifier review remains a separate follow-up stage.
- The Windows shell initially rejected Bash-style `&&`; the syntax/provenance checks were rerun with PowerShell-compatible sequencing and passed.

**Process status:** all task-owned test/check processes exited; no persistent process was started.
