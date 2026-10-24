# Offline Whisper research evidence

**Subject:** `whisper`  
**Retrieved:** 2026-10-24  
**Scope:** Read-only public-source review. No package/model installation, audio call, benchmark, build, or implementation was performed. Host telemetry reports roughly 32 GiB physical RAM; CPU and GPU model remain unverified.

## Findings

### Model family versus inference engine

OpenAI Whisper is a multilingual sequence-to-sequence ASR model family. The official repository lists multilingual `tiny`, `base`, `small`, `medium`, `large`, and `turbo` variants; the `.en` variants are English-only and therefore unsuitable as the sole model for English/Mandarin mixed speech. The same repository says local inference uses downloaded model weights and processes audio through sliding 30-second windows. [1]

`whisper.cpp` is a C/C++ inference implementation/port of Whisper. It supports Windows MSVC, CPU-only inference, integer quantization, a C API, VAD, and optional CUDA/Vulkan/other accelerator backends. Its real-time microphone example repeatedly samples short windows; this is chunked re-decoding, not proof of causal streaming. [2]

`faster-whisper` is a Python implementation using CTranslate2. Its official documentation supports CPU and NVIDIA GPU execution, with CPU INT8 and GPU INT8/FP16 options. The core API transcribes an audio source into segments; the returned generator starts work when iterated. Community real-time wrappers are listed separately and are not part of the core API guarantee. [3]

### Model size and packaging

The `whisper.cpp` model table reports approximately: tiny 75 MiB disk/~273 MB memory, base 142 MiB/~388 MB, small 466 MiB/~852 MB, medium 1.5 GiB/~2.1 GB, and large 2.9 GiB/~3.9 GB. Its model list reports multilingual `large-v3-turbo` at 1.5 GiB and `large-v3-turbo-q5_0` at 547 MiB; `.en` names are English-only and `-q5_0` names are quantized. These are project-reported model/file figures, not measurements on this desktop. [2][4]

OpenAI's table reports parameter counts and A100 relative speed/VRAM, not Windows CPU latency. `faster-whisper` reports its own comparison on an Intel i7-12700K and an RTX 3070 Ti; those results must not be represented as measurements on this machine. [1][3]

### Multilingual and mixed-language behavior

Whisper supports multilingual transcription and language identification, and the official API exposes language IDs and auto-detection. That establishes English and Mandarin coverage, not reliable same-utterance code-switching. The API's auto-detection returns a top language at an audio offset; it is not a code-switching quality guarantee. The official model card says accuracy is uneven across languages, accents, and dialects, and recommends robust evaluation in the intended context. Mixed English/Mandarin quality therefore requires the approved corpus and cannot be inferred from a language list. [1][5]

The sources do not promise faithful punctuation. Punctuation should be measured as part of the corpus gate rather than assumed from multilingual support.

### No-speech and hallucination controls

The official model card warns that weakly supervised Whisper can output text that was not spoken and can repeat text; beam search and temperature scheduling only mitigate this imperfectly. The published model-card decoding example includes `no_speech_threshold`, `logprob_threshold`, and `compression_ratio_threshold`. `faster-whisper` also documents an optional Silero VAD filter, while `whisper.cpp` documents VAD support. A safe desktop adapter should combine VAD/no-speech and low-confidence guards with an empty/aborted-result policy and must never insert decoder output solely because text was emitted. [3][5]

### Streaming versus deliberate stop

Whisper is not true online/causal decoding out of the box. OpenAI's reference implementation reads an entire file and transcribes sliding 30-second windows. `whisper.cpp` has a naive stream example that samples every half second and continuously reprocesses audio; partials can revise. `faster-whisper`'s core API is segment-oriented and finalization-oriented. This is compatible with the approved deliberate record/stop flow and final insertion after stop. Live partial overlay would be an additional buffering/revision layer, not a free property of the model. [1][2][5]

### Licensing

The OpenAI Whisper repository states that its code and model weights are released under MIT. The `whisper.cpp` and `faster-whisper` repositories also declare MIT for their software. Software-engine license and model-artifact license must still be tracked separately: a selected Hugging Face mirror/conversion can carry different metadata, and a packaged converted `ggml`/CTranslate2 artifact must be checked before redistribution. [1][2][3][4]

## Decision direction

For a future approved offline benchmark, first try `whisper.cpp` with the multilingual `large-v3-turbo-q5_0` model on Windows CPU, with unquantized `large-v3-turbo` or multilingual `small` as a quality/resource comparison. This is a benchmark recommendation only, not a local-speed or production guarantee. `whisper.cpp` has the smallest C#/.NET deployment blast radius because its public C interface can be wrapped by a Windows native DLL and called from C#; the host still needs careful unmanaged lifetime, callback, threading, raw 16 kHz PCM, cancellation, model-path, and native-DLL architecture handling.

`faster-whisper` is a credible alternative for a Python/CTranslate2 evaluation harness. In the WPF product it would normally require shipping or managing a Python runtime and CTranslate2/model environment, or a sidecar process plus IPC. GPU execution adds NVIDIA cuBLAS/cuDNN dependency constraints; CPU execution avoids NVIDIA but does not remove Python/runtime packaging. It is therefore a larger packaging and operational blast radius than a native `whisper.cpp` adapter, despite useful CPU INT8 support.

## Source excerpts and URLs

[1] OpenAI Whisper repository: multilingual model family, `.en` distinction, sliding-window transcription, model-size/VRAM table, and MIT statement.  
https://github.com/openai/whisper

[2] whisper.cpp repository: Windows MSVC, CPU/GPU backends, quantization, VAD, C API, model memory table, and real-time example.  
https://github.com/ggml-org/whisper.cpp

[3] faster-whisper repository: CTranslate2 engine, CPU/GPU requirements, project benchmark conditions, CPU INT8 example, generator behavior, VAD filter, and MIT software license.  
https://github.com/SYSTRAN/faster-whisper

[4] whisper.cpp model documentation: converted `ggml` artifacts, disk sizes, multilingual versus `.en`, and quantized model naming.  
https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md

[5] OpenAI Whisper model card: hallucination/repetition limitations, uneven language performance, no-speech/decoding controls in the official model-card example, and real-time limitation.  
https://github.com/openai/whisper/blob/main/model-card.md
