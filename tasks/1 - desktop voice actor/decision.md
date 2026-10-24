---
title: Desktop voice input — approval packet
status: approved-amended
updated: 2026-10-24
---

# Desktop voice input — approval packet

> **Approved amendment — 2026-10-24 16:15:39+08:00:** “Offline-first; preserve live partials and benchmark bilingual streaming Paraformer.” This supersedes the Azure-only-first-release/provider-approval posture. Initial recognition is local sherpa-onnx with the bilingual streaming Paraformer candidate. The model weights/runtime are not installed or benchmarked yet, so this is a revised feasibility contract, not a product PASS or an accuracy promise.

Build a Windows-native tray app with **C# / .NET 10 LTS / WPF**, a provider-neutral core, and clipboard-free Unicode insertion into tested applications. Ordinary use is: focus a field → Ctrl+Alt+Space → speak → Ctrl+Alt+Space → final written text. Escape is consumed only while a session is active and cancels before dispatch; idle Escape passes through normally. A failed cancellation registration blocks microphone-open. Unsupported or changed targets get an editable recovery preview, never a blind paste. The initial provider is local sherpa-onnx online Paraformer; inference must continue with networking disabled after verified assets are installed.

The complete first release is still **all M1–M9** below. Nice-to-haves remain deferred. The local model/runtime, exact package/native graph, hardware performance, corpus quality and punctuation fidelity are unknown until separately admitted evaluation. No Azure credentials, paid service, cloud account, cloud consent or provider call is required for the initial path. Azure/cloud may be added later only as an optional provider with a new data-handling decision and protected credentials.

**Full architecture, contracts, acceptance gates and retained evidence:** [research.md](research.md) · [Retained source evidence](evidence/source-excerpts.md) · [Offline model evidence](offline-speech-models.md)

## Must-have: the complete initial build

- **M1:** Single-instance tray app, configurable global toggle shortcut, conflict handling and working active-only cancellation.
- **M2:** Local model/device/shortcut setup, verified asset manifest, explicit Windows microphone permission, device selection/level test, and a successful guided local practice session.
- **M3:** Non-focus-stealing recording/processing feedback, microphone level, **live partial preview**, revised-partial handling, and keyboard-operable controls.
- **M4:** Faithful English, Mandarin with Simplified Chinese output, and measured mixed Chinese-English recognition from the local streaming Paraformer candidate; no silent final-only Whisper fallback.
- **M5:** Caret/selection-safe insertion into Notepad, Edge text fields and VS Code plain-text editing; refuse unsafe, sensitive or changed targets.
- **M6:** Editable, session-only recovery with explicit Copy/Discard and no automatic duplicate retry.
- **M7:** No idle capture, no default audio/history files, local inference with no runtime network/telemetry/model fetch, explicit local permission/privacy disclosure, content-free diagnostics, and protected future cloud credentials only if a cloud provider is later approved.
- **M8:** One bounded session, timeouts, device/model/runtime recovery, cancellation and rejection of stale results.
- **M9:** Runnable Windows x64 artifact, local model/runtime/asset notices and hashes, network-disabled execution proof, instructions and independent real-mic/cross-app acceptance.

**All nine are mandatory.** If the bilingual, live-partial, offline-execution or insertion spike fails, return the measured blocker rather than silently shipping a subset, lowering thresholds, or switching providers. “Any app” means a cross-application input workflow with tested coverage and explicit fallback, not an unqualified promise that every Windows control supports automatic injection.

## Nice-to-have: explicitly later

Push-to-talk, personal vocabulary UI, optional grammar/tone rewriting, voice paragraph/formatting commands, optional encrypted history, more languages, startup integration, app profiles, automatic clipboard-assisted paste, TSF/input-method integration, public signing/updating, accounts/managed credentials, optional Azure/cloud providers and other operating systems are deferred. They must attach to the existing provider, session, focus and insertion boundaries.

## Material choices in this proposal

**Deployment:** A local-first Windows x64 build with no product backend and no cloud prerequisite. Model/runtime assets are downloaded and verified during setup or a separately admitted preparation step, then inference must run without network access. No audio, transcript or history is written by default. Explicit local evaluation recordings require clear local consent and bounded evidence handling; they are not product history.

**Provider:** The initial provider is **sherpa-onnx `sherpa-onnx-streaming-paraformer-bilingual-zh-en`**, CPU-first, through its C# binding and Windows x64 native runtime. The official catalog's Chinese-English streaming example and documented partial/final lifecycle establish a benchmark candidate, not product quality. Exact NuGet/native/model/punctuation versions, hashes, license notices, .NET 10 compatibility, CPU/RAM, quality and latency remain to be measured. A separate local punctuation model is optional only within the benchmark, with its own license/hash/latency/revision evidence; punctuation must not be hand-waved. Azure/cloud is an optional later adapter, not an initial gate or fallback.

**Compatibility:** Start with the three proposed external app surfaces. Direct Unicode input is the preferred path; explicit manual Copy is the recovery path. Automatic clipboard paste is deferred unless a gate reveals it is necessary and the added adapter scope is separately approved. No elevated apps, terminals or remote-desktop typing, no Enter/message submission, no forced refocus and no automatic undo.

**Release gates:** Zero observed misses/incorrect insertions in 60 positive attempts, 20 per app surface, plus at least 40 refusal/race/cancel cases with zero wrong-target/duplicate writes. OS event acceptance alone is not a pass. Proposed recognition limits are ≤15% normalized error for each of English, Mandarin and mixed conditions, ≥90% designated proper-name recognition and at most one severe semantic error in 30 mixed utterances. Performance targets are p95 first partial ≤1.2 seconds from speech onset and final text ready ≤2.5 seconds from Stop, with a 15-second finalization timeout as a failure boundary. Measure punctuation separately. These are proposed thresholds to measure, not achieved results.

## Build order and approval boundary

First run **B0 local offline feasibility**: task-local SDK/toolchain and exact package/native graph, model asset installation/verification boundaries, bounded PCM capture, hotkey/cancel, overlay, target/caret evidence, direct insertion, live partial revisions, Stop/final/cancel fencing, CPU-first bilingual benchmark, punctuation assessment and real network-disabled execution. Then build **B1 session core → B2 native adapters/shell and local audio → B3 sherpa-onnx recognition → B4 insertion/recovery → B5 local onboarding/privacy → B6 independent acceptance/runnable handoff**. Test deterministic behavior before implementation and verify the real microphone/local-model/app loop before release.

The 30-minute budget applied to the planning task, not a commitment to complete the product. Planning used a detached worktree and preserved the original pre-amendment drafts byte-for-byte. No product implementation, package/model installation, provider call, account setup, commit, push or deployment has started in this amendment. Any later cloud provider requires a new provider-specific consent/data-handling decision; it is not needed to proceed with local feasibility.

The offline-first decision is approved for revised feasibility planning. This packet does not authorize downloads, installs, builds, microphone/model calls, cloud calls or product implementation without separate coordinator/resource admission.
