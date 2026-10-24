# Offline streaming ASR evidence — sherpa-onnx

**Subject:** `streaming-sherpa`  
**Retrieved:** 2026-10-24  
**Scope:** Read-only research for a later offline option. This does not change the approved Azure-only B0 or authorize implementation.

## What is available

sherpa-onnx is an inference/runtime project that advertises local speech-to-text with both streaming and non-streaming modes, Windows x64 support, C# support, and pre-trained model downloads. Its C# documentation links examples for streaming file decode and real-time microphone recognition, and publishes the `org.k2fsa.sherpa.onnx` NuGet package with pre-built C# libraries. The examples shown by the documentation target `net6.0`; compatibility with the approved .NET 10 WPF application was not built or verified.

The strongest exact match for true offline bilingual streaming is **`sherpa-onnx-streaming-paraformer-bilingual-zh-en`**. The official model page says it supports Chinese and English and explicitly shows one decoded example containing both languages in one result (`昨天是 monday today day is ...`). It also says the model does not support timestamps. The official catalog provides downloadable fp32 and int8 ONNX encoder/decoder files. The documented int8 files are approximately 158 MB encoder + 68 MB decoder; fp32 is approximately 607 MB encoder + 218 MB decoder. The page supplies a Windows executable path and microphone example.

A second option is **`sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20`**, an online transducer. The official catalog identifies it as Chinese + English and provides a Windows executable example. Its listed int8 files are approximately 174 MB encoder + 13 MB decoder + 3.1 MB joiner; fp32 is approximately 315 MB encoder + 14 MB decoder + 13 MB joiner, excluding tokens and other files. The catalog shows a mixed-language sample output (`这是第一种第二种叫呃与 ALWAYS ALWAYS什么意思啊`). It describes the model as community-contributed and trained on “tens of thousands hours of some internal dataset”; that provenance is not an independently measured quality guarantee.

The official “small models” page also lists `sherpa-onnx-streaming-zipformer-small-bilingual-zh-en-2023-02-16` as a compact bilingual streaming candidate, but the reviewed page does not give its artifact sizes or quality results.

## Streaming behavior and whether it is needed

The online recognizer is chunk-fed during capture and can expose evolving text. The official examples show a result object with `is_final: false`; the documented endpoint rules use trailing-silence thresholds and a maximum utterance rule. The C# example exposes endpoint configuration, including rules such as 2.4 seconds of trailing silence with no decoded non-silence, 1.2 seconds after decoded non-blank speech, and a 20-second utterance limit. Finalization therefore requires explicit endpoint/stop handling, stream reset, and reconciliation of revised partial text. These are true streaming semantics, not a cloud API or a final-only transcription call.

True streaming is **not necessary** for a “press Stop, then transcribe” workflow if live partial text and endpoint-driven early feedback are not required. A final-only offline recognizer can capture into bounded memory, decode after Stop, then dispose the audio and transcript according to the existing no-persistence rule. That is simpler and may allow more whole-utterance context. True streaming becomes necessary only if the approved overlay must show live partials during recording, or if the product needs bounded online decoding while the microphone remains open. The current architecture does request overlay-only live partials, so a later offline replacement preserving all of M3 would need online streaming; this research does not authorize changing B0.

## Language, punctuation, and quality limits

“Supports Chinese and English” and the mixed examples prove model capability in the narrow documentation sense, but they do **not** prove faithful intra-utterance English/Mandarin code-switch accuracy on the approved corpus. No reviewed source reports the required mixed-corpus WER, semantic-error rate, proper-name rate, or punctuation quality. The model must be evaluated on the approved English, Mandarin, and mixed utterances before any support claim.

Punctuation is a separate sherpa-onnx capability. Its official punctuation documentation says to run a punctuation model after speech-to-text and lists a Chinese-English `sherpa-onnx-punct-ct-transformer-zh-en...` model family. The ASR examples themselves do not establish faithful punctuation/capitalization. Adding punctuation would be a second local model, with its own latency, memory, output-revision, and exact-weight-license review.

## Hardware and licensing notes

The listed ONNX file sizes are artifact sizes, not RAM requirements. They do not include ONNX Runtime/native-library overhead, allocator peaks, audio buffers, tokens, or a punctuation model. The host has roughly 32 GiB physical RAM according to recent telemetry, but CPU and GPU models were not verified here; no local speed or real-time claim is made. The catalog’s reported real-time factors (for example, about 0.15 for an int8 Paraformer example and about 0.108 for a Zipformer example) are documentation-run results on unspecified machines, not measurements on this desktop.

The sherpa-onnx runtime repository is Apache-2.0. The reviewed Hugging Face cards for both the bilingual streaming Paraformer and bilingual streaming Zipformer declare Apache-2.0 for those repositories. Runtime/software licensing and model-weight licensing are separate: before redistribution or product shipment, review the exact release archive, upstream conversion/training source, punctuation model, ONNX Runtime package, and any included notices. A model-card declaration is evidence of the repository’s stated license, not a completed legal audit.

## Practical later choice

If true streaming and live partials remain mandatory, the practical first candidate for a later feasibility spike is **the int8 bilingual streaming Paraformer**: it has a direct official Chinese-English model page, a simpler two-file online model configuration than Zipformer’s encoder/decoder/joiner set, an explicit mixed-language demonstration, and a documented int8 download. Its two material ONNX files total about 226 MB before runtime and auxiliary files, and it lacks timestamps. The bilingual Zipformer remains a credible comparison, especially where its smaller variant matters, but its reviewed provenance and three-component configuration add uncertainty.

If the actual requirement is strictly “listen until Stop, then transcribe,” do not take on streaming-state complexity solely because a model is called online. Prefer a separately verified bilingual final-only model and retain the online Paraformer as the candidate only if live partials are kept. In either case, preserve deliberate capture, one active session, in-memory-only default processing, explicit finalization, safe insertion, and the approved Azure B0 boundary.

## Sources

1. https://k2-fsa.github.io/sherpa/onnx/csharp-api/index.html — Official C# API documentation: streaming/non-streaming support, microphone and file examples, NuGet package, pre-built libraries, endpoint options, and example model configuration.
2. https://k2-fsa.github.io/sherpa/onnx/pretrained_models/online-paraformer/paraformer-models.html — Official bilingual streaming Paraformer catalog: Chinese-English support, no timestamps, downloadable archive, Windows executable note, mixed-language example, endpoint configuration, and fp32/int8 file sizes.
3. https://k2-fsa.github.io/sherpa/onnx/pretrained_models/online-transducer/zipformer-transducer-models.html — Official bilingual streaming Zipformer catalog: model provenance description, downloadable archive, Windows executable note, mixed-language example, endpoint configuration, and fp32/int8 file sizes.
4. https://huggingface.co/csukuangfj/sherpa-onnx-streaming-paraformer-bilingual-zh-en — Official model repository card: converted ONNX provenance and declared Apache-2.0 license.
5. https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20 — Official model repository card: model provenance and declared Apache-2.0 license.
6. https://k2-fsa.github.io/sherpa/onnx/punctuation/index.html — Official punctuation documentation: punctuation is applied after ASR and includes a Chinese-English punctuation model family.
7. https://github.com/k2-fsa/sherpa-onnx — Official runtime repository: local/offline ASR description, Windows x64 and C# support, and repository Apache-2.0 metadata.
