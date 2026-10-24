# Browser verification capability — coordinator record

Checked 2026-10-24 through desktop-in-app-browser/js `iab.help()` only. No shopping page was opened or mutated. The connected SDK supports ordinary page observation and user-grounded actions. Its current guide explicitly excludes filesystem access, page evaluation, raw CDP, and Node; no native Chrome unpacked-extension installation API is documented.

This SDK alone is not evidence that the packaged extension loads or acts on Shopee in the user's Chrome. Native extension installation and a user-entered OpenRouter key may require the user's local Chrome steps. A real Shopee cart mutation needs exact concrete approval and is not authorized merely by the implementation request. Login/CAPTCHA must remain user-controlled and are never bypassed.

The coordinator will not launch a browser-heavy stage concurrently with the current implementation stage. The independent verifier must distinguish deterministic package/core tests from native Chrome/provider/Shopee checks and report any native/live check as unrun until actual evidence is available. No fixture, in-app website interaction, or public API documentation substitutes for real extension execution.
