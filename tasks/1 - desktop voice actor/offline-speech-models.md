# Offline speech recognition for desktop dictation

**Decision amendment — 2026-10-24 16:15:39+08:00:** “Offline-first; preserve live partials and benchmark bilingual streaming Paraformer.” This resolves the former focused question in favor of a local **sherpa-onnx bilingual streaming Paraformer** feasibility path. It supersedes the earlier recommendation to benchmark Whisper first and the statement that offline recognition was deferred. It does not authorize silent final-only Whisper, cloud/provider calls, paid services, model/runtime installation, or a product-quality claim.

**Current status:** The model weights, ONNX runtime, sherpa native libraries, microphone package, punctuation assets and SDK are **not installed, restored, or benchmarked**. Corpus quality, CPU/GPU suitability, memory, latency, punctuation fidelity, licenses and network-disabled execution remain unknown. A separate toolchain owner is diagnosing official SDK download connectivity; the toolchain v1 contract/reports remain frozen. The offline B0 owner must use the separately versioned toolchain-amendment proposal and a fresh v2 toolchain freeze before implementation.

## What offline means

Offline models can listen to microphone audio and transcribe it locally without Azure or another recognition API fee after model weights and required runtime assets have been downloaded, verified and installed. sherpa-onnx documents local ONNX speech recognition on Windows [7] [9]. Subsequent decoding can avoid a cloud API, but “offline” is not “zero download” or cost-free: first deployment still needs model files, native/runtime libraries, verification, disk space, updates, and license review. CPU/GPU time, electricity, packaging and support remain.

Offline execution does not promise perfect accuracy, unlimited hardware-free work, faithful punctuation or reliable Mandarin-English code switching. Whisper can hallucinate or repeat text, and any local decoder can emit unsafe or empty output; emitted text must not reach insertion without the existing no-speech, cancellation, finalization, focus and safe-insertion safeguards. No audio, transcript or history is written by default.

## Chosen first feasibility candidate: online Paraformer

Use **`sherpa-onnx-streaming-paraformer-bilingual-zh-en`** as the first CPU-first local benchmark candidate when resources are separately admitted. The official catalog identifies Chinese-English streaming, shows a mixed-language result, provides Windows execution guidance, and documents online endpoint/finalization behavior [10]. The reviewed model card declares Apache-2.0 for the model repository [12]. These are source-level capability and provenance claims, not measured product quality.

The documented int8 candidate has approximately 158 MB encoder plus 68 MB decoder files, about 226 MB before tokens, runtime/native libraries, allocator peaks, audio buffers or an optional punctuation stage [10]. These are catalog artifact sizes, not this desktop's resident-memory or real-time measurements. The exact official archive file list, release revision, SHA-256 manifest, tokens, package/native payloads, notices and license text must be captured during an admitted preparation step. No guessed filenames, package versions or hashes are a substitute.

The provider boundary remains separate from audio and input. `AudioFrame` values are owned copies from microphone callbacks; the local provider emits session-scoped revised partials, final segments, no-speech/errors and terminal status; the aggregator orders final segments; and a Stop/finalization/cancel fence prevents stale or partial text from insertion. The local recognizer must never write target text directly. B0 evidence is benchmark/contract evidence only, not product source or product PASS.

## Exact first local streaming benchmark

The first benchmark must use bounded, owned PCM frames and a CPU-first configuration. It must record only content-minimizing provenance and metrics by default, with explicit local consent for any microphone recording or evaluation corpus. The required sequence is:

1. Verify the task-local .NET 10/WPF/Windows x64 toolchain, exact `NAudio.Wasapi` microphone package, exact `org.k2fsa.sherpa.onnx` C# package/native payload, ONNX runtime dependency identity, model archive revision and model/token hashes. Do not infer compatibility from the older examples' `net6.0` target.
2. Install/prepare model and runtime assets only in the admitted owner boundary. Validate expected files, sizes, SHA-256, architecture, license/notice metadata and absence of runtime remote-fetch configuration. Model installation is a preparation boundary, not a product history feature.
3. Capture shared-mode microphone audio only, at the validated PCM format, copying callback bytes into a bounded queue of at most two seconds. Use the same `AudioFrame` contract for deterministic and real runs; no loopback, unbounded buffering, silent drops or default audio files.
4. Start one online Paraformer stream. Record first non-empty partial from speech onset, every partial revision as content-free event metadata, segment/final ordering, endpoint behavior and final-ready time. Partials remain overlay-only. Stop closes capture; final aggregation occurs once after the fence; cancel seals the session and rejects late events.
5. Run English, Mandarin and mixed Mandarin-English cases using the 90-item release corpus: exactly 30 English, 30 Mandarin and 30 mixed, including names, numbers, dates, negations, technical terms, punctuation and switching boundaries. Missing corpus or consent is `PENDING`, never a synthetic pass.
6. Compute the unchanged proposed thresholds: English WER ≤15%, Mandarin CER ≤15%, mixed-token error ≤15%, designated proper-name exact rate ≥90%, and at most one severe meaning-changing error in 30 mixed utterances. Compute p95 first partial ≤1.2 seconds from speech onset and p95 final-ready ≤2.5 seconds from Stop; a 15-second finalization timeout is a failure boundary, not a latency pass.
7. Run the same capture-to-final benchmark with networking disabled after asset installation. Prove no network socket/remote fetch/telemetry path is used during inference and that a complete local session still works. Record CPU, peak memory, warm/cold model-load time, audio queue duration, p95 partial/final latency and failures.
8. Report punctuation separately. First measure raw Paraformer output. If a separate local punctuation model is evaluated, record exact model/package/native files, hashes, license/notice, input/output revision behavior, CPU/RAM cost and added p95 latency. It must not be silently added to the release path and cannot repair ASR errors by paraphrasing.

The benchmark must include no-speech/silence, short utterance, device loss, queue overload, stop/final race, cancel race, stale callback, repeated partial, duplicate final, model-load failure and network-disabled cases. A silence-only or hallucinated output must not be inserted or counted as a successful transcript.

## Live partials versus final-only output

Whisper is not true causal online decoding out of the box. whisper.cpp repeatedly samples and re-decodes short windows, so partial text can revise and needs buffering/deduplication [1] [2]. faster-whisper's core API is segment/finalization-oriented rather than a guaranteed live-partial API [3]. SenseVoiceSmall through sherpa-onnx is documented as VAD-segmented or simulated streaming, not a native causal decoder [6] [7]. Those candidates remain comparison evidence, not permission to simplify the mandatory live-partial requirement.

The online Paraformer path is selected because it is the strongest retained source match for a bilingual model with evolving streaming results. Partial revisions must be explicit, bounded and overlay-only. An implementation that captures audio and emits only a final transcript fails the M3 live-partial contract even if its final quality is good. An implementation that shows decoder text but cannot fence cancel/Stop/late events fails the safety contract.

## Language, code switching and punctuation

“Supports Chinese and English” and a mixed catalog example prove only documented capability. They do not prove faithful same-utterance code switching, Simplified-Chinese script behavior, names, numbers, negations, semantic fidelity or punctuation on the approved corpus. The 30/30/30 corpus remains the release gate; do not claim a mixed pass from a language list, model card or continuous language identifier.

Punctuation is a separate local capability. sherpa-onnx documents punctuation as a post-ASR stage and lists Chinese-English punctuation model families [11]. The ASR examples do not establish faithful punctuation/capitalization. Any punctuation asset therefore enters the benchmark with its own model/runtime files, license, hashes, latency, memory, revision and no-network evidence. The deterministic formatter must preserve recognized lexical content and never paraphrase, translate, summarize, add facts or interpret speech as commands.

## Alternatives retained for traceability

**Whisper/whisper.cpp:** multilingual local weights, Windows MSVC, CPU inference, quantization, VAD and a C API are documented [1] [2]. The earlier note proposed multilingual `large-v3-turbo-q5_0` as a CPU-first benchmark and recorded approximate catalog sizes. That recommendation is retained as historical comparison only. It is not the initial provider because the approved requirement explicitly preserves live partials and the Paraformer source evidence is a closer true-online bilingual match. Whisper remains a separately admitted challenger, not a silent fallback.

**SenseVoiceSmall:** sherpa-onnx documents local ONNX deployment, multilingual coverage and `use_itn`; its microphone path is described as simulated streaming/VAD-segmented [6] [7] [8]. It is a plausible final-after-stop candidate but is insufficiently evidenced for mandatory live partials. Its separate model-license and artifact-size caveats remain unresolved.

**Streaming Zipformer:** the catalog lists a Chinese-English online transducer and mixed example [10-related catalog evidence in the retained source packet], but its three-component configuration and community provenance add comparison uncertainty. It may be a later controlled benchmark, not a reason to widen this stage.

## Licensing, packaging and privacy boundaries

Runtime/software licenses and model-weight licenses are separate. sherpa-onnx is Apache-2.0, and the reviewed bilingual Paraformer model repository declares Apache-2.0 [7] [12]. This is not a completed redistribution review: converted ONNX artifacts, exact weights, tokens, punctuation models, ONNX Runtime, native libraries, mirrors, notices and updates each require checking. No distribution or commercial-rights claim may be made from the engine license alone.

Initial asset download is a network operation. Before claiming privacy-preserving offline recognition, pin/checksum assets, remove runtime remote-fetch paths, run a network-disabled test after installation, and inspect native dependencies for unexpected network behavior. Local inference should emit no telemetry and retain no audio/transcript/history by default. A future Azure/cloud provider is optional later; its consent, DPAPI CurrentUser credential blob and data-handling disclosure are not initial prerequisites and must not be reintroduced as an approval gate for local feasibility.

## Decision and remaining gaps

The approved first local path is sherpa-onnx bilingual streaming Paraformer with preserved live partials and a CPU-first benchmark. The following are still gates, not assumptions: actual SDK/package/native restore; .NET 10/WPF compatibility; model asset installation and hash/license manifests; microphone permission and bounded capture; online partial revisions and final aggregation; no-speech/hallucination handling; English/Mandarin/mixed quality; punctuation faithfulness; CPU/RAM/latency; and complete network-disabled execution.

No model weights/runtime were downloaded, installed or called in this research stage. No microphone, GPU, cloud provider, credential or paid service was used. The next implementer and fresh verifier must work in separate paths, keep speech and input separate, retain the cross-app matrix and no unsafe input operations, and return `PASS`, `FAIL` or `BLOCKED` without lowering thresholds. Missing corpus or hardware evidence is a pending quality gate, not permission to skip it.

## References

[1]: https://github.com/openai/whisper "OpenAI Whisper official repository — multilingual variants, local weights, sliding-window transcription, and licensing"
[2]: https://github.com/ggml-org/whisper.cpp "ggml-org/whisper.cpp official repository — Windows MSVC, CPU backends, quantization, VAD, C API, memory figures, and stream example"
[3]: https://github.com/SYSTRAN/faster-whisper "SYSTRAN/faster-whisper official repository — CTranslate2, CPU/GPU execution, segments, VAD, benchmarks, and MIT license"
[4]: https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md "whisper.cpp model documentation — converted artifacts, sizes, multilingual versus .en, and q5_0 entries"
[5]: https://github.com/openai/whisper/blob/main/model-card.md "OpenAI Whisper official model card — uneven language performance, hallucination/repetition, decoding/no-speech controls, and real-time limits"
[6]: https://github.com/QwenAudio/SenseVoice "SenseVoice official repository — language set, non-autoregressive inference, VAD, language/use_itn, ONNX export, and code license"
[7]: https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html "sherpa-onnx SenseVoice documentation — local ONNX deployment, Windows/C#, output fields, and simulated streaming"
[8]: https://k2-fsa.github.io/sherpa/onnx/sense-voice/pretrained.html "sherpa-onnx SenseVoice pretrained models — model variants, artifact sizes, and CPU figures"
[9]: https://k2-fsa.github.io/sherpa/onnx/csharp-api/index.html "sherpa-onnx C# API documentation — Windows architectures, NuGet/libraries, streaming/non-streaming APIs, microphones, and endpoints"
[10]: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/online-paraformer/paraformer-models.html "Paraformer models — sherpa-onnx — Chinese-English streaming model, mixed example, Windows path, endpoints, and sizes"
[11]: https://k2-fsa.github.io/sherpa/onnx/punctuation/index.html "Punctuation — sherpa-onnx — punctuation as a post-ASR stage and Chinese-English model family"
[12]: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-paraformer-bilingual-zh-en "sherpa-onnx-streaming-paraformer-bilingual-zh-en model card — ONNX provenance and declared Apache-2.0 license"
[13]: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20 "sherpa-onnx-streaming-zipformer-bilingual-zh-en model card — model provenance and declared Apache-2.0 license"
