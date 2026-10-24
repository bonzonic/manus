# Fresh B0 offline speech verifier packet

**Role:** fresh independent verifier; must not have authored this plan or the implementation.  
**Verifier report:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\<unique-b0-offline-verifier-id>\report.md`  
**Verifier evidence:** beneath the same unique verifier directory only.  
**Owner contract:** [`contract-version.md`](contract-version.md)  
**Implementer packet:** [`implementer-packet.md`](implementer-packet.md)

## Admission and independence

Parent admission is required before any restore, build, test, model load, network-isolation observation, microphone open or corpus run. Use a separate report/evidence directory and, where the coordinator requires it, a fresh verifier worktree. Read the implementer report/manifests without editing them. Compare the claimed baseline, source bytes, package graph, model/native/asset hashes and build stamp. Reject missing provenance or any product-scope creep.

The verifier must not use Azure credentials, paid services, cloud calls or a final-only fallback. Local evaluation recordings/corpus use requires explicit local consent and fresh admission. The verifier issues only offline B0 `PASS`, `FAIL`, `BLOCKED` or `PENDING`; no product/release PASS and no M1–M9 completion claim.

## Independent checks

1. **Toolchain/assets:** independently inspect task-local .NET 10/WPF, `net10.0-windows`, `win-x64`, exact `NAudio.Wasapi`, exact sherpa C# package/native payload, resolved ONNX runtime identity, model/token/punctuation file hashes, architecture, notices and licenses. Confirm v2 toolchain metadata does not require Azure payloads.
2. **Deterministic audio:** rerun callback-copy, two-second bound, contiguous accepted sequence, overload, microphone-not-loopback, cancellation, device-loss and disposal tests. Confirm no audio file sink.
3. **Deterministic speech:** rerun revised partial overlay-only, ordered unique final aggregation, no-speech/empty/error typing, Stop/final fence, cancel/seal late-event rejection, stale session rejection and exactly-one terminal outcome.
4. **Local-only mic:** confirm settings construction does not open capture; explicit Start only; spy recognizer receives zero frames; no transcript/audio/history/content log; cancel/timeout/device-loss closes without restart.
5. **Benchmark:** validate exactly 30 English/30 Mandarin/30 mixed unique IDs and explicit local consent. Recompute WER/CER/mixed-token/name/severe-error metrics and p95 first partial/final-ready metrics using the recorded definitions. Keep punctuation and formatter results separate.
6. **Network-disabled proof:** after assets are installed, run the complete capture-to-final path with networking disabled. Independently observe no runtime fetch/socket/telemetry and record how the observation was made. A documentation statement alone is insufficient.
7. **Safety boundary:** confirm speech evidence does not claim input insertion, clipboard mutation, forced refocus, Enter/Tab, target reactivation or any replacement of the B0-W cross-app matrix.

## Verdict rules

- `PASS` only when every admitted mandatory offline B0 gate has reproducible evidence, local model/runtime assets are exact and network-disabled execution succeeds; this is still not a product PASS.
- `FAIL` when an implemented gate violates the frozen contract, such as stale final leakage, silent frame drop, unsafe hallucinated output or network-dependent inference.
- `BLOCKED` when a required toolchain/native/model/asset/corpus/admission prerequisite is unavailable or the implementation cannot be rerun.
- `PENDING` for live quality/latency only when the implementation is sound but explicitly consented corpus or hardware run is not yet admitted; never turn it into PASS.

Report each A–G gate, the exact evidence path, baseline/candidate/build identity, rerun commands, observed limitations and whether the full product suite was not run. Preserve the owner/implementer records unchanged.
