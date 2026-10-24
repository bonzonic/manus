# SenseVoiceSmall offline evidence

**Subject:** `sensevoice`  
**Retrieved:** 2026-10-24  
**Scope:** Read-only public-source review for the approved Windows C#/.NET 10 WPF voice-input architecture. No model, package, build, benchmark, audio call, or implementation was run on this desktop.

## What the primary sources establish

- **Model family:** The official SenseVoice repository describes the released SenseVoiceSmall checkpoint as supporting ASR and language ID for Mandarin, Cantonese, English, Japanese, and Korean, with additional emotion and audio-event tags. It documents a non-autoregressive model, `language="auto"` or an explicit language, and `use_itn` for punctuation/inverse text normalization. Long audio is segmented with FSMN-VAD; direct inference is documented for inputs of 30 seconds or less. The repository includes an ONNX export/test path and says the client/deployment ecosystem includes C#.
- **ONNX/runtime:** sherpa-onnx documents a converted SenseVoice ONNX model and APIs for C++, C, Python, C#, Go, Kotlin, JavaScript, Java, Swift, and others. It lists Windows x64, x86, and arm64 support. The sherpa-onnx project describes local ASR/VAD using ONNX Runtime without an Internet connection after required assets are available; this is offline local inference, not a cloud API. Initial model/runtime download and packaging are still required.
- **Windows C# fit:** sherpa-onnx publishes a NuGet package (`org.k2fsa.sherpa.onnx`) and pre-built C# libraries. Its C# documentation has offline and online recognizer examples plus microphone recognition. The examples target `net6.0`; compatibility and native-runtime packaging for the approved .NET 10 WPF app remain to be checked rather than assumed.
- **Output:** The SenseVoice sherpa example returns structured fields such as `lang` (for example `<|zh|>`), `emotion`, `event`, `text`, and timestamps. The documented `use_itn=1` path enables punctuation/inverse text normalization. The documentation shows a single utterance-level language field; it does not establish per-word language tags or punctuation quality on this product’s corpus.

## Streaming, VAD, and mixed speech

The sherpa SenseVoice page labels the microphone/VAD example “Real-time/Streaming,” but the model page calls the path **simulated streaming**: microphone audio is segmented by VAD and passed to the SenseVoice model. SenseVoice is not documented there as a native online/causal streaming decoder. sherpa-onnx separately supports true streaming recognizer APIs and gives online Zipformer examples, but that does not make SenseVoiceSmall itself an online model.

Therefore the realistic first integration shape is deliberate recording, VAD segmentation, and final transcription after stop (possibly with chunk-level processing). Live partial text with stable low-latency revisions is **not proven** by these sources. This can fit the approved one-active-session product if partial text is not made a release promise.

The sources prove multilingual coverage, not Mandarin–English code-switch accuracy. Neither the official SenseVoice model/repository pages nor sherpa’s SenseVoice deployment page found in this review presents a Mandarin–English same-utterance code-switch benchmark or claim. `language="auto"` and a multilingual model are insufficient evidence for the M4 mixed-speech gate. The approved corpus must measure mixed utterances directly.

## Footprint and performance evidence

The sherpa-onnx SenseVoice package listing reports a **228 MB** `model.int8.onnx` and an **894 MB** float32 `model.onnx`; the extracted package totals are shown as roughly **494 MB** for the int8 package and **2.3 GB** for the float package, including scripts, tokens, test audio and related files. A separate VAD model may also be packaged. These are artifact sizes, not resident-memory measurements.

The same page reports SenseVoice int8 RTF on an RK3588 CPU under its stated conditions: 0.436 on one Cortex-A55 thread, 0.260/0.208/0.175 on two/three/four A55 threads, and 0.099/0.065/0.049/0.049 on one/two/three/four Cortex-A76 threads. These are third-party/project-reported results on that board, not measurements here. The host has roughly 32 GiB physical RAM, but CPU/GPU are unverified and no local speed or memory claim is justified from that telemetry.

## License and local-network caveats

The SenseVoice repository code is MIT-licensed, while sherpa-onnx code is Apache-2.0. The SenseVoiceSmall model card separately displays `model-license`; the FunASR documentation states that pretrained weights have separate licenses and that the model card’s terms govern. Do not infer weight redistribution or commercial rights from the MIT/Apache code licenses. Legal review of the exact SenseVoiceSmall weight license is still required before distribution.

Using local ONNX files through sherpa-onnx avoids a recognition API call after download, according to the project’s local/offline documentation. This review did not inspect every native dependency for telemetry or prove network isolation. The product should package fixed local assets and make no remote model/code fetch at runtime; that is an integration requirement, not a claim already verified.

## Sources

1. [SenseVoice official repository](https://github.com/QwenAudio/SenseVoice) — released language set, non-autoregressive inference, FSMN-VAD segmentation, `language`/`use_itn`, ONNX export, and repository code license.
2. [SenseVoiceSmall model card](https://huggingface.co/FunAudioLLM/SenseVoiceSmall) — model-card language/benchmark context, ONNX/export references, and separate `model-license` designation.
3. [sherpa-onnx SenseVoice documentation](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html) — converted ONNX availability, supported platforms/languages, C# API availability, and deployment paths.
4. [sherpa-onnx SenseVoice pretrained models](https://k2-fsa.github.io/sherpa/onnx/sense-voice/pretrained.html) — artifact sizes, output fields/language values, `use_itn`, VAD/simulated-streaming commands, and RK3588 CPU RTF table.
5. [sherpa-onnx C# API documentation](https://k2-fsa.github.io/sherpa/onnx/csharp-api/index.html) — Windows/.NET context, NuGet/prebuilt C# libraries, and separate streaming/non-streaming/microphone examples.

## Decision implication

SenseVoiceSmall + sherpa-onnx is a realistic **offline bilingual candidate for final-after-stop recognition** in the existing provider-neutral architecture. It should remain a later, explicitly approved provider option, not replace the Azure-only B0. Promote it only after validating .NET 10 packaging, local asset/network behavior, punctuation, CPU/RAM/latency on the actual desktop, and the full English/Mandarin/code-switch acceptance corpus. If true live partial streaming is mandatory, treat SenseVoiceSmall as insufficiently evidenced and compare a genuinely online bilingual model instead.
