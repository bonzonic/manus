# B0 offline speech/audio feasibility — owner handoff

**Work item:** `b0-offline-L7GDB`  
**Owner status:** contract frozen; ready for distinct implementer and fresh verifier admission; no product PASS.  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Owner worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB`  
**Canonical task documents:** root `research.md`, `decision.md`, `implementation-plan.md`, `offline-speech-models.md`  
**Frozen contract:** [`contract-version.md`](contract-version.md)  
**Six-section plan:** [`plan.md`](plan.md)  
**Toolchain metadata proposal:** [`toolchain-amendment-proposal-v2.md`](toolchain-amendment-proposal-v2.md)  
**Implementer packet:** [`implementer-packet.md`](implementer-packet.md)  
**Verifier packet:** [`verifier-packet.md`](verifier-packet.md)  
**Provenance:** [`evidence/provenance.md`](evidence/provenance.md)

## Mission

Prove only the local speech/audio boundary for the approved offline-first product:

1. NAudio shared-mode microphone capture with copied, owned, bounded frames.
2. sherpa-onnx bilingual online Paraformer partial/revision/final events on Windows x64.
3. Ordered final-segment aggregation with partials overlay-only.
4. Stop/final/cancel fencing against late/stale callbacks and exactly one terminal outcome.
5. Explicit local-only mic-level behavior with zero recognizer/file/history sink.
6. A consented 30/30/30 English/Mandarin/mixed benchmark with quality, latency, punctuation, CPU/RAM and model/runtime provenance.
7. Complete capture-to-final execution with networking disabled after assets are installed.

Do not implement the tray shell, global hotkey, overlay, focus/insertion, recovery, onboarding, DPAPI UI, cloud provider or production source tree in this slice. Do not replace live partials with final-only Whisper.

## Admission sequence

1. Parent records fresh device/resource admission for toolchain v2 metadata and separately for implementation. B0-T v1 remains frozen; the toolchain owner must freeze actual v2 identities before the implementer builds.
2. Parent confirms the implementer is distinct from this owner, uses the assigned offline worktree, and writes only the implementation report/manifests under this work item.
3. Parent admits model/runtime asset preparation and any real microphone/corpus benchmark separately. Network preparation is not proof of network-disabled inference.
4. Parent dispatches the fresh verifier only after implementation evidence is complete. Verifier uses its own report/evidence path and does not edit this handoff or owner provenance.
5. Parent joins B0-W and offline B0-S independently. No offline speech result can substitute for the named cross-app input matrix; no input result can substitute for model/network/quality evidence.

## Current status and blockers

`OFFLINE_B0_BLOCKED_PENDING_TOOLCHAIN_V2_ASSET_MANIFEST_LOCAL_CORPUS_AND_HARDWARE_MEASUREMENT`. The local model/runtime, exact package/native graph, model hashes/licenses, microphone permission result, corpus and desktop quality/latency are unknown. Missing corpus is a pending quality gate, not permission to skip measurement. No Azure key, paid service, cloud consent or cloud request is needed for this path. No implementation, install, model download, build, mic call or benchmark was performed by this owner.

## Exit packet

The implementer returns `plans/runs/b0-offline-L7GDB/evidence/implementation-report.md`, source/build/test/model/native/license/network manifests and per-gate statuses. The verifier returns `plans/verification/<unique-b0-offline-verifier-id>/report.md` and verifier-owned evidence. Neither packet may claim product PASS, release PASS, M1–M9 completion, safe insertion, or accuracy beyond the measured corpus.


## Addendum: local consent relay (2026-10-24 17:11:30 +08:00)

**Record:** [`local-consent-record.md`](local-consent-record.md)  
**Consent ID:** `b0-local-consent-20261024-171130`  
**Exact user response:** “Yes—guided local recording later, only when I explicitly start it, under those retention terms”

The response relays conditional consent for one future, guided, operator-only local Windows benchmark covering exactly 90 read-sheet utterances: 30 English, 30 Mandarin and 30 mixed Mandarin-English. The scope is bounded to the offline B0 benchmark, with no bystanders, no idle capture, no cloud upload, no model training and no product-history use. It does not authorize public-audio download, TTS generation or any other corpus source.

**Start guard:** `capture_started: false`. This note is not a start command. No microphone, recorder, session, audio file, runtime evaluation or benchmark was started. The future session remains `WAITING_FOR_EXPLICIT_USER_START` until the user visibly starts guided recording after the recorder/model path is ready. There is no automatic recording service. SDK/model setup may continue independently, but real audio/runtime evaluation has a separate admission and explicit start cue.

**Retention guard:** If the future session is explicitly started, newly captured benchmark audio may live only in the separately admitted benchmark folder until the benchmark report is complete, then that newly captured benchmark audio must be deleted. Do not delete anything now; do not broaden deletion to user files, source/public assets or any other data. Audio remains excluded from cloud upload, model training, product history, ordinary logs and unrelated folders.

**Pending gates:** explicit user-start cue; separately admitted bounded benchmark folder and deletion boundary; microphone/device permission and validated PCM format; toolchain-v2/model/runtime asset manifest; capture-to-final offline runtime and benchmark evidence; and fresh independent verification. No data was deleted and the original handoff/provenance remains preserved.
