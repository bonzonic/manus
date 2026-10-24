# Independent verification report — five-family model picker

**Verdict: SCOPED PASS — candidate picker implementation**

This is a scoped code/test verdict for the frozen candidate worktree only. It is **not** an overall native/browser product PASS. The unchanged native Side Panel/whole-product behavior remains unverified here, as requested, and no native gate was treated as a new picker criterion.

## Identity and scope

- Candidate worktree: `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/models-five-20261024-YYvz4/extension`
- Frozen baseline manifest: `model-picker-baseline.json`, source `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/outputs/browser-task-agent/extension`.
- Baseline manifest contained 27 files. Candidate hash audit found 23 exact baseline matches and exactly 4 mismatches: `core/model-catalog.js`, `worker.js`, `panel.js`, and `tests/model.test.mjs`. This matches the frozen four-file product/test scope. The worktree is not a clean ordinary Git checkout for a useful name-only diff (`git status --short` reports the worktree as untracked from its parent), so the 27-file SHA-256 manifest was the authoritative scope check.
- The supplied handoff/implementation identity records baseline detached `HEAD 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; no candidate commit, merge, deployment, browser process, or package install was created.

## Commands and outcomes

All commands were run independently from the candidate extension directory. All task-owned processes exited.

1. `node --test tests/model.test.mjs` — exit `0`; **14 passed, 0 failed, 0 skipped**. This exercised the catalog shortlist, fixed family order, reverse-order stability, missing-family omission, no fabrication/duplicates, displayed-only cheapest default, live prices/context/capability badges, GPT-6+/Claude Fable-5+ exclusion, real worker `LOAD_CATALOG`/state/configuration/`ADVANCE` boundary wiring, and real panel render wiring with fake catalog/Chrome/DOM boundaries.
2. `node --test` — exit `0`; **47 passed, 0 failed, 0 skipped**.
3. Syntax checks: `node --check core/model-catalog.js`, `node --check worker.js`, `node --check panel.js`, and `node --check tests/model.test.mjs` — exit codes `0,0,0,0`.
4. Read-only baseline scope/hash audit over all 27 entries in `model-picker-baseline.json` — **27 present; 23 unchanged hash matches; 4 expected changed hashes**.

## Acceptance observations

The candidate tests and inspected code prove that a catalog with more than five eligible family matches yields exactly five entries in the frozen order: OpenAI GPT mini, Anthropic Claude Haiku, Google Gemini Flash, DeepSeek, Qwen. Reversing the input preserves selected IDs. Removing Qwen reports `missingFamilies: ['Qwen']`, returns four entries, and does not duplicate or fabricate the unrelated cheap sixth model.

The default is selected by `chooseCheapestDisplayed` from the displayed shortlist, so the hidden zero-cost sixth model is not selected. The normalized shortlist retains live prompt/completion/request prices, context length, text input/output indication, and structured/no-structured capability badges. Excluded GPT-6+ and literal Claude Fable-5+ entries are absent from the shortlist.

The worker exposes `catalog.shortlist` and `missingFamilies`, retains the full eligible catalog for validation, and rejects a configured hidden/stale ID before entering the provider path. The unchanged provider adapter still invokes `validateSelectedModel` against the refreshed eligible catalog before its fetch. The panel renders only `catalog.shortlist` and includes family, live ID/prices/context/capability status.

## Coverage limits and findings

- **Native/live limitation (not a picker code failure):** no browser session, real Chrome Side Panel, live OpenRouter catalog, real API key, paid/provider generation call, deployment, or native whole-product flow was used. The boundary tests intentionally use fake catalog data, fake Chrome runtime, fake DOM, and a fake provider boundary.
- **Artifact write note:** shell directory creation for the requested new report directory returned Windows `Access denied`, but direct writes to both required artifact paths succeeded and read-back verified them.
- No code failure was found in the requested candidate matrix. No product files or owner records were modified by this verifier.

## Required receipt

The 27-file SHA-256 receipt is intended at:

`C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/qa-evidence/models-five-final-hashes.json`

The receipt’s `reportPath` points to this report’s requested absolute path. Reverification is required if the candidate is rebased or any of the four scoped files changes.
