# Chrome Side Panel Agent — Approval Sheet

**Recommendation:** spend the 20-minute build on a supervised, single-tab agent that genuinely performs a short browser workflow. Do not spend it on a general-purpose autonomous browser, a backend, or a chat platform.

Read the [full architecture](research.md) for the module boundaries and future roadmap, or the [20-minute build plan](plan.md) for the ordered implementation/test checklist. All task documents now live under your selected task folder, `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel`; these planning files are grouped in `outputs/planning/` with their evidence alongside them.

## Must-have — build all six

1. **Installable Chrome Side Panel.** Toolbar-triggered access to the current page, first-use disclosure, and a working local model connection.
2. **Useful page context.** Bounded visible text, headings, and clickable/simple input targets, without collecting existing field values or credentials.
3. **Live multi-step agent.** Natural-language request → short plan → Run → repeated observe/scroll/click/fill decisions, one action at a time.
4. **Progress and truthful results.** Plan/current step/action log, fresh observations, and success based on actual page evidence rather than the model's claim.
5. **User control and safety.** Exact approval before every click/fill, Pause/Resume/Cancel, and manual handoff for sensitive or high-impact actions.
6. **Basic recovery.** One stale-target refresh, same-origin navigation handling, clear unsupported-page errors, and interrupted worker state without blindly replaying actions.

## Nice-to-have — defer

Tab management and cross-site journeys; vision/CDP and iframe support; streamed chat and editable plans; smarter automatic approval policies; task history and browser-restart resumption; hosted model proxy, accounts, multiple providers, analytics, and Chrome Web Store publishing.

## Proposed architecture

```text
Side Panel -> service-worker engine/policy -> scoped DOM bridge
                         |
                         -> one live model adapter
                         -> session checkpoint
```

Use Manifest V3, plain JavaScript and CSS, and no bundler or backend. This keeps the build small and leaves clean seams for new tools/providers later. Code belongs in the already-created isolated worktree; the original checkout stays untouched.

## Demonstration and limits

On a public docs page, ask the agent to find a topic, follow a link, and scroll to the relevant section. Require at least three consecutive live-model tool actions including click and scroll. Separately check benign field filling without submitting, cancellation, and a blocked sensitive action.

Only ordinary, public, top-frame pages in one authorized tab are supported initially. Purchases, deletion, messaging, login, CAPTCHA, and sensitive final submissions are not automated. Every click/fill is supervised because even apparently harmless site controls can have side effects.

The 20-minute allocation is approximately 3 minutes contracts/policy, 6 minutes bridge/engine, 6 minutes model/panel, and 5 minutes independent checks/package. It is a time box, not a tested delivery guarantee. If a must-have or live check is blocked, I will name it rather than call a fixture or unverified package complete.

## Prerequisite and decision

You confirmed that you can enter an API key locally in the extension. Provider, model, and endpoint selection remain open; no secret should be pasted into chat. Architecture approval is still pending, and implementation has not started. A working live connection must be verified before claiming a live-agent demo is complete.

**Do you approve this six-feature MVP and architecture for the 20-minute build?**

No code, live API call, browser mutation, commit, merge, deployment, or board update has been performed during planning.
