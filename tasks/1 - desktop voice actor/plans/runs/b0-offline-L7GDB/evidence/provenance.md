# B0 offline speech/audio evidence and provenance

**Work item:** `b0-offline-L7GDB`  
**Recorded:** 2026-10-24 (Asia/Taipei, UTC+08:00)  
**Owner role:** offline speech feature owner  
**Status:** plan amendment and contract only; implementation, restore, model/runtime installation, microphone call, benchmark, verification and product/release PASS are not done.

## 1. Authorized paths and decision

The user explicitly made these paths authoritative:

- `TASK_DOCS_DIR`: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`
- Canonical architecture: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`
- Canonical decision: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`
- Canonical implementation plan: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\implementation-plan.md`
- Canonical offline research: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\offline-speech-models.md`
- Assigned owner worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB`
- Work item: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-offline-L7GDB`
- Coordination directory retained and not rewritten: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\coordination\implementation-20261024-L7GDB`

Decision effective at `2026-10-24 16:15:39+08:00`: “Offline-first; preserve live partials and benchmark bilingual streaming Paraformer.” It supersedes Azure-only-first-release/provider-approval posture. No renewed Azure approval question is pending; Azure/cloud is an optional later provider feature only.

## 2. Repository/worktree provenance

- Baseline SHA: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Assigned offline worktree remained detached at that SHA with empty `git status --short` after this planning work.
- Worktree contained only baseline guidance/readme files before owner planning. No product source, solution, SDK, package restore, model/runtime asset, microphone call, native probe, build, benchmark, provider call, credentials, commit, merge or push was performed.
- The separate toolchain/network diagnosis job `482643be5911` remains owned by the toolchain lane; this owner did not inspect, modify, download through, or create artifacts for that job.
- The parent remains coordinator-only. This owner authored contracts and plans only; no product code was authored. A distinct implementer and fresh verifier are required.

## 3. Exact pre-amendment preservation

Before changing canonical documents, exact bytes were copied to:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB\.work\spec-history\20261024T1618+0800-pre-offline-amendment\`

The revision manifest is [`revision-manifest.json`](../../../../.work/worktrees/voice-b0-offline-L7GDB/.work/spec-history/20261024T1618+0800-pre-offline-amendment/revision-manifest.json) and records baseline SHA, source paths, byte lengths and SHA-256 values. Preserved files are `research.md`, `decision.md`, `implementation-plan.md` and `offline-speech-models.md`; none were overwritten after preservation.

Pre-amendment SHA-256 values from the manifest:

| File | Bytes | SHA-256 |
|---|---:|---|
| `research.md` | 37,681 | `aafac5141150f09cba6d2df5427b67c36d7064e8c8d4e53fba331f93c10993bc` |
| `decision.md` | 5,747 | `9a93e18bac88809cc44d20a146ca4e33ec27a8d1ce4949f87c9bdafb99469e4a` |
| `implementation-plan.md` | 36,599 | `277371c5a86a23ae7d891ac2c4bce1ece312e015a9f49f8e681fe9a304239fa2` |
| `offline-speech-models.md` | 10,617 | `0478310916b72d83ad0c54bd236559d0db3ad36fef311e40bdf48e8c2e366ba1` |

## 4. Final canonical document hashes

Computed after amendment:

| Canonical path | Bytes | SHA-256 |
|---|---:|---|
| `research.md` | 40,537 | `75d917e9194ec4ef73d132f6cfbebd46d62311025bf6b505c0c1972da120a51a` |
| `decision.md` | 8,214 | `4ba30329638738e0fad4fcc3e01e9b5d7f7137b9ecc530452b951696ade56b23` |
| `implementation-plan.md` | 39,591 | `38444393112bb4d0a884544d5bd9ee242c7ab939006d8d16d5315c9c919a5609` |
| `offline-speech-models.md` | 15,014 | `d6cd9b6dd85f221163ac5f34d466a186113c14fcd67c65a9aeb131af4d7236b2` |

## 5. Source evidence retained and used

The amendment reused the completed local research and its retained primary source definitions without new archive/model/SDK downloads or external provider calls:

- `evidence/offline-streaming-models.md` — official sherpa C#/Windows/streaming and bilingual Paraformer catalog evidence.
- `evidence/offline-sensevoice.md` — SenseVoice simulated-streaming and license/asset boundaries.
- `evidence/offline-whisper.md` — Whisper/whisper.cpp live-partial, hallucination and packaging limitations.
- `evidence/offline-report-format-correction.md` — prior source-list integrity receipt.
- `evidence/source-excerpts.md` — retained Windows input, lifecycle, privacy, .NET and NAudio primary evidence.
- `offline-speech-models.md` — canonical synthesis with all 13 prior HTTPS reference definitions retained.

No public package/model metadata was fetched during this amendment. Exact package/model/native versions are intentionally pending the toolchain owner’s v2 restore/asset inspection.

## 6. Work-item artifacts and scope digest

- [`plan.md`](../plan.md) — six sections: Problem statement; Architecture changes; User flow; Solution chosen; Acceptance criteria; Risk.
- [`contract-version.md`](../contract-version.md) — frozen `offline-b0-speech-v1` contracts for owned frames, revised partials, final aggregation, fencing, local mic and benchmark.
- [`handoff.md`](../handoff.md) — parent relay, admission sequence and current blockers.
- [`implementer-packet.md`](../implementer-packet.md) — distinct implementer worktree/files/reports and no-code boundary.
- [`verifier-packet.md`](../verifier-packet.md) — fresh verifier path, independent checks and verdict rules.
- [`toolchain-amendment-proposal-v2.md`](../toolchain-amendment-proposal-v2.md) — dependency metadata removing mandatory Azure payload checks and identifying sherpa/ONNX/mic/native/model artifacts with pins pending restore.

The exact first benchmark requires owned bounded PCM, live partial revisions, ordered segment final aggregation, Stop/final/cancel fencing, no silence-only/hallucinated insertion, CPU-first configuration, 30/30/30 English/Mandarin/mixed metrics, punctuation measurement, model/runtime license/hash manifests, asset installation boundaries and real network-disabled proof. Input/caret/focus remains separate.

## 7. Current gates and prerequisites

Current status is `OFFLINE_B0_BLOCKED_PENDING_TOOLCHAIN_V2_ASSET_MANIFEST_LOCAL_CORPUS_AND_HARDWARE_MEASUREMENT`.

Prerequisites for parent admission:

1. Toolchain owner freezes actual v2 SDK/package/native manifest separately; do not modify the frozen v1 contract or network-diagnosis artifacts.
2. Parent admits distinct implementation and reserves a separate verifier stage/path.
3. Exact local model/runtime/token asset revision, hashes, licenses/notices and package/native graph are available through an admitted preparation step.
4. User/operator provides clear local consent for microphone/evaluation corpus use and the benchmark corpus is present or explicitly marked pending.
5. Parent admits deterministic work, asset/network preparation, local microphone use and benchmark stages separately.

No user input is requested for Azure approval. A missing corpus is a real quality-gate blocker, not permission to skip it or lower thresholds. No product PASS is claimed.
