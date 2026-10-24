# Pending decision: independent extension QA

Recommendation: Option A, a Playwright bundled-Chromium deterministic test baseline, with a separately authorized Puppeteer/Chrome-for-Testing experiment only for native action-to-Side-Panel validation. See [the source-backed recommendation](research.md).

Use a new implementation worktree and an isolated temporary browser profile. Do not use the user’s daily browser profile, real login, API key, or real cart in the deterministic fixture baseline. Mock OpenRouter with synthetic responses. Keep fixture-origin/test-manifest and extension-tab checks explicitly below a whole-production-native PASS.

A separately permitted CI or controlled browser-test execution environment must be configured before claiming the agents can execute this route. Nothing has been installed or run, no environment has been switched, and the current native/live status remains blocked/unverified.

Decision question: authorize a separate controlled browser-test runner, treating native toolbar permissions and actual Side Panel UI as distinct gates, before another user acceptance test?
