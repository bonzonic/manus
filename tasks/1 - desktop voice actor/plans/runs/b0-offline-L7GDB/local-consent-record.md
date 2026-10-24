# Local benchmark consent record

**Work item:** `b0-offline-L7GDB`  
**Record type:** lightweight local-consent relay; no capture action  
**Owner role:** SAME-ROLE SUCCESSOR OFFLINE FEATURE OWNER  
**Recorded:** 2026-10-24 17:11:30 +08:00 (Asia/Taipei)  
**Consent ID:** `b0-local-consent-20261024-171130` (non-content identifier)  
**Source record:** `plans/coordination/implementation-20261024-L7GDB/tasks.json`  
**Related terms:** [`corpus-preparation.md`](corpus-preparation.md)

## Exact user response

> Yes—guided local recording later, only when I explicitly start it, under those retention terms

## Approved scope

This response relays conditional consent for one future, guided, operator-only local Windows benchmark session covering exactly **90 read-sheet utterances**: **30 English, 30 Mandarin and 30 mixed Mandarin-English**. The session is limited to the bounded offline B0 benchmark. It excludes bystanders, idle capture, cloud upload, model training and product-history use. No public audio, TTS audio or other corpus source is authorized by this record.

## Start guard

This is **not** a start command. `capture_started: false`. No microphone was opened; no audio, transcript, manifest, model/runtime evaluation, or session was created by this relay. A future session remains **WAITING_FOR_EXPLICIT_USER_START** until the operator separately and visibly starts guided recording after the recorder/model path is ready. There is no automatic recording service and no inference that setup, consent, or this note starts capture.

Before that future start cue, the parent must separately admit the bounded benchmark folder and recording/evaluation run, confirm the selected device and microphone permission, validate the actual PCM format, and preserve the existing read-sheet/manifest terms. SDK/model setup may continue independently, but real audio and runtime evaluation have a separate admission and explicit start cue.

## Retention and privacy guard

If and only if the future guided session is explicitly started, newly captured benchmark audio may be written only to the separately admitted benchmark folder and retained only until the benchmark report is complete. After the report is complete, the **newly captured benchmark audio** is to be deleted under the recorded retention terms. This guard does not authorize deletion now, deletion of user files, deletion of source/public assets, or deletion of any data outside the newly captured benchmark audio. Audio must not be uploaded to a cloud service, used for model training, or written to product history, ordinary logs or unrelated folders.

## Current state

- `capture_started: false`
- Microphone/session action: not performed
- Audio files: none created by this relay
- Runtime/model evaluation: not performed by this relay
- Automatic recording: prohibited
- Current status: `CONSENT_RELAYED_WAITING_FOR_EXPLICIT_USER_START`

## Pending gates

- `PENDING_EXPLICIT_USER_START_CUE` — the user must explicitly start the future guided recording session.
- `PENDING_BOUNDED_BENCHMARK_FOLDER_ADMISSION` — separately admit the folder and retention/deletion boundary before any audio is written.
- `PENDING_MICROPHONE_DEVICE_PERMISSION_AND_VALIDATED_PCM_FORMAT` — confirm the selected Windows capture device and record the actual validated format.
- `PENDING_TOOLCHAIN_V2_MODEL_RUNTIME_ASSET_MANIFEST` — SDK/model/runtime identities, hashes, licenses/notices and readiness remain separate setup work.
- `PENDING_CAPTURE_TO_FINAL_OFFLINE_RUNTIME_EVIDENCE` — real audio/runtime evaluation, network-disabled execution, quality, latency and resource measurements remain unrun.
- `PENDING_INDEPENDENT_VERIFICATION` — a fresh verifier must inspect the complete benchmark manifest and evidence; this consent relay is not a PASS.

No data was deleted, no canonical corpus-preparation text was rewritten, and no original provenance was replaced.
