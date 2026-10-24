# Frozen handoff: five-family model shortlist

**Status:** ready for separate implementation; no product code, browser action, CLI test, paid provider call, or secret access was performed by this owner.

## Problem and chosen scope

`model-catalog.js` already loads the live OpenRouter catalog, keeps eligible text-in/text-out models with pricing and enough context, rejects expired entries, and preserves the outgoing GPT-6+ and literal Claude Fable-5+ exclusions. `worker.js` currently defaults from the full eligible catalog, while `panel.js` renders every eligible model. The requested change is a small presentation/defaulting slice: show a maximum of five recognizable model families, not an all-model picker. This is a product shortlist, not an objective popularity ranking.

Keep the candidate neutral `Browser Task Agent` at version `0.2.0`; a `0.2.1` bump is optional bookkeeping after implementation and verification, not part of this feature. Startup, action/approval, origin, storage, provider-retention notice, key handling, privacy, and all other behavior remain unchanged. Do not add native Side Panel claims or Puppeteer experiments.

## Frozen family order and runtime selectors

Use this fixed order and one entry per family. The exact IDs are small preferred lookup hints only: they must be selected **only when present and eligible in the current live catalog**. If a preferred ID is absent, use the family selector against the normalized live `id`, `canonical_slug`, and `name` fields; never invent an ID or placeholder.

| Family label | Preferred IDs, in order | Fallback selector |
|---|---|---|
| OpenAI GPT mini | `openai/gpt-4o-mini`, `openai/gpt-4.1-mini` | provider/name text contains `openai`, `gpt`, and `mini` |
| Anthropic Claude Haiku | `anthropic/claude-3.5-haiku`, `anthropic/claude-3-haiku` | provider/name text contains `anthropic`, `claude`, and `haiku` |
| Google Gemini Flash | `google/gemini-2.0-flash-001`, `google/gemini-1.5-flash` | provider/name text contains `google`, `gemini`, and `flash` |
| DeepSeek | `deepseek/deepseek-chat`, `deepseek/deepseek-v3-0324` | provider/name text contains `deepseek` and (`chat` or `v3`) |
| Qwen | `qwen/qwen-2.5-72b-instruct`, `qwen/qwen-2.5-32b-instruct` | provider/name text contains `qwen` and (`instruct` or `chat`) |

The selectors are family fallbacks, not availability claims. Apply the existing `isEligibleTextModel` predicate first, so expiration, text modalities, context minimum, numeric pricing, and GPT-6+/Claude Fable-5+ policy continue to govern every candidate. For a family with multiple selector matches, prefer the first live preferred ID; otherwise select the lowest estimated-cost match with deterministic ID tie-breaking. Never let one model satisfy two families.

When all five families have at least one eligible live match, the shortlist has exactly five entries. If a family is absent, omit it, show the missing family label in the catalog status, and do not duplicate another family or silently select an expensive substitute. The shortlist order is the table order and is stable independent of catalog response order.

## Selection, pricing, and capability policy

Build the shortlist from the full live catalog, but expose only the shortlist in the panel. Preserve the full refreshed catalog internally for validation. The default must be the lowest estimated-cost entry **among the displayed shortlist only**, using the existing input/output/request price fields and token budgets; it must never be selected from a hidden sixth model. Keep the selection deterministic on equal cost. Do not broaden the catalog endpoint or add a second provider.

Each displayed choice must carry its live normalized metadata: family label, model name/ID, prompt/completion/request pricing, context length, and compact capability badges derived from the entry rather than hardcoded claims. At minimum, show `structured` when `supported_parameters` contains `structured_outputs` or `response_format`, otherwise `no structured output`; include the live context value and text input/output indication where available. A missing family is an availability state, not a fabricated model.

The visible selected ID must be checked against the current shortlist before dispatch. A stale, hidden, or manually supplied ID must not bypass the shortlist: reject it before the provider call. The existing `propose()`/`validateSelectedModel()` path must still validate the same ID against the refreshed eligible catalog, including expiry and GPT-6+/literal Claude Fable-5+ exclusions. Do not weaken outgoing validation merely because the panel has fewer choices.

## Small implementation handoff

Limit product changes to these three files plus one focused existing catalog/panel test file:

1. `extension/core/model-catalog.js`: add the frozen family descriptors, deterministic live-catalog shortlist builder, and a shortlist-scoped cheap-default helper or equivalent option. Keep `isExcludedModel`, `isEligibleTextModel`, `validateSelectedModel`, pricing normalization, and current catalog loading semantics intact; allow validation to accept a shortlist ID set if the existing contract needs that explicit guard.
2. `extension/worker.js`: retain the full live catalog for outgoing validation, expose the computed shortlist in the state response, default only within that shortlist, and reject a configured model that is no longer one of the shown IDs before `propose()`. Do not change startup, session reset, run phases, bridge access, approvals, action execution, or privacy behavior.
3. `extension/panel.js`: render only `catalog.shortlist`, with family labels, current pricing, and live capability badges. Keep the existing select, refresh, save, run, approval, timeline, export, and clear-session flow; update only the catalog status/option text needed to explain `shown/eligible` counts and omitted family labels. No picker rewrite and no `panel.html` architecture change is needed.
4. Extend the repository's existing focused model-catalog/panel test location rather than introducing a new harness.

## Focused acceptance checks

- A full eligible catalog containing more than five families renders exactly five entries, one per family, in fixed order; entries and chosen IDs are stable when input order changes.
- All five live families produce five choices. Removing one family produces four (or fewer if more are absent), names the omitted family, and never duplicates or fabricates a choice.
- The default is the cheapest displayed eligible entry under the existing budget formula, not a cheaper hidden catalog entry and not an automatic expensive fallback.
- A live entry with a GPT-6+ identifier/name or literal Claude Fable-5+ identifier/name is absent and is rejected by outgoing validation even if a family selector could otherwise match it.
- Options expose live prompt/completion/request prices, context, text modality, and structured-output/no-structured-output badges from the selected catalog entry; no hardcoded availability or capability is displayed.
- Refresh, save, start, run/advance, exact approval, pause/cancel, export, clear-session, and startup behavior remain unchanged apart from the model shortlist/status text. A stale configured ID is rejected against both the refreshed eligible catalog and the shown shortlist before any paid call.

This handoff is frozen for implementation and independent verification; it does not claim shipment or verification.
