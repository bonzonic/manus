# Independent extension-testing feasibility — 2026-10-24

Yes, with a separate, properly authorized browser test runner. The current Manus In-App Browser connection does not support this extension-installation route. This is a recommendation, not an installed or verified runner.

## Current evidence

The [existing independent recheck](../../recheck-shopee-20261024-YYvz4/verify-report.md) records 34/34 code/VM tests and 11/11 syntax checks. It records no native MV3 load, service-worker/Side Panel lifecycle, activeTab injection, live OpenRouter, or live Shopee evidence. Do not bypass the denied in-app chrome://extensions target by controlling that browser with another interface or reusing/extracting its profile.

## Documented testing routes

Playwright documents MV3 loading in a persistent context and recommends its bundled Chromium because branded Chrome/Edge removed the sideload flags. It can observe extension service workers and extension pages. [1] Puppeteer documents extension loading, MV3 service-worker access, and extension-action testing APIs. These are viable testing comparables, not proof this session can execute them. [2] Chrome also documents extension end-to-end testing. [3]

Chrome grants activeTab after explicit user invocation, and sidePanel.open() requires a user action. [4] [5] Opening chrome-extension://.../panel.html tests an extension page, not the browser’s actual Side Panel UI. No official Playwright Side-Panel-specific driver was verified. Puppeteer’s documented extension-action APIs still require an empirical native Side Panel check; do not promise coverage solely from the API’s existence.

## Recommended architecture

Use CI or a separately authorized test environment with a pinned browser and temporary, synthetic-data-only profile. The deterministic baseline uses Playwright bundled Chromium, a persistent context, the production MV3 manifest, controlled shopping-page fixtures, and request interception to mock OpenRouter. Mocking is documented by Playwright. [1] [6] A fixture origin or test manifest that changes production host permissions is a different contract and must be labeled fixture-only, not full production-native PASS.

Next, attempt limited public Shopee read-only smoke checks. They may be blocked by CAPTCHA or anti-bot controls. Finally, test logged-in cart behavior only after one-time user login/key setup and exact cart approval. Never check out, submit payment, or bypass CAPTCHA. Consider Puppeteer with pinned Chrome for Testing only for a separately demonstrated native action/Side Panel gate. [2] [7]

Options: A—Playwright bundled Chromium is the recommended deterministic baseline. B—Puppeteer plus pinned Chrome for Testing has relevant extension-action support, but native Side Panel behavior still needs proof. C—using the denied in-app browser or assuming control of the branded daily-use Chrome profile is not a supported route here.

No browser, package, service, user profile, login, key, cart, checkout, or CAPTCHA operation was performed by this research. No computer was allocated or switched. The execution route remains to be configured and verified.

## References

[1]: https://playwright.dev/docs/chrome-extensions "Playwright Chrome extensions"
[2]: https://pptr.dev/guides/chrome-extensions "Puppeteer Chrome extensions"
[3]: https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing "Chrome extension end-to-end testing"
[4]: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab "Chrome activeTab permission"
[5]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API"
[6]: https://playwright.dev/docs/mock "Playwright API mocking"
[7]: https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing "Chrome for Testing"
