# Scoped Review — Five-Family Model Picker

## Status

**Scoped ready:** PASS for the candidate five-family picker and its tested worker/panel fake-boundary wiring. The frozen four-file scope is verified, with the targeted and full test suites passing, syntax checks passing, and the expected four-file hash delta confirmed.

**Blocking status:** No additional blocker within this scoped candidate behavior. This is not a native or whole-product readiness decision: browser execution, the real Chrome Side Panel, live catalog, real key, paid provider call, deployment, and native whole-product flow were not run.

## Short model UI instructions

- After **Reload**, use **Refresh live model catalog** before choosing a model.
- The five-family picker is ordered and limited to: **GPT mini, Claude Haiku, Gemini Flash, DeepSeek, and Qwen**.
- Live availability may omit any of those five families; omitted families should not appear as fabricated or duplicate entries.
- The cheap default, live prices/context/capability badges, configured-ID exclusions, and stale/hidden-ID rejection behavior remain in force.

No native PASS or public-ship claim is made.
