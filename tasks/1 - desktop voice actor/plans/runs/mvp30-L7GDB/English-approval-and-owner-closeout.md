# English approval and owner closeout — MVP30-L7GDB

**Recorded:** 2026-10-24 18:00 +08:00  
**Owner role:** Same-role successor MVP feature owner; lightweight record closeout only

## Scope authority

This is an additive closeout record. It does **not** edit or replace the frozen contract at [`frozen-mvp-contract.md`](./frozen-mvp-contract.md), and it does not reopen the original full M1–M9 scope.

The exact explicit user approval recorded in `plans/coordination/implementation-20261024-L7GDB/tasks.json` is:

> “Yes—prioritize a working English offline MVP in 30 minutes”

Approval time: `2026-10-24T17:43:30+08:00`.

Accordingly, English-only offline MVP behavior is valid for this closeout, with installed Windows SAPI 8.0 through .NET Framework `System.Speech`, Windows PowerShell 5.1/WPF, and `en-US` as the applicable language. The earlier question about selectable English, Simplified Chinese, and Japanese does not need to be repeated for this reduced MVP decision. Chinese/Japanese support, mixed-language behavior, live-partial quality, and the remainder of the original full scope remain deferred rather than approved or claimed here.

## Independent result and candidate identity

The parent-delivered independent report [`report.md`](../../verification/mvp30-L7GDB-20261024-1754/report.md) issued:

`PASS_NO_MIC_MVP_SMOKE`

The verified candidate source fingerprint is:

`VoiceMvp.ps1` SHA-256: `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`

The independent checks passed for all four non-empty hash entries, parser/load, copied launcher, no-microphone lifecycle/fence self-test, idle WPF smoke, and copied wrapper tests. The verifier reported no remaining owned persistent PIDs. The candidate bundle is being packaged by the parent; this closeout makes no candidate, README, hash, source, or verifier-report changes.

## Final disposition

**Disposition: usable experimental candidate for the reduced English offline MVP, with the no-microphone smoke checks passed.**

This is not a functional voice-recognition pass and must not be described as proof of working audio recognition, quality, latency, or live partials. Real audio testing requires an explicit user-started session: Start is the only permitted microphone-opening path. No physical microphone, Start/listening session, speech input, real Stop, real Cancel, permission prompt, recognition output, latency, accuracy, punctuation, or device-failure path was tested in this closeout.

No full-release, bilingual, mixed-language, Paraformer/sherpa-onnx, benchmark, cross-application insertion, hotkey, tray/overlay, installer, signing, or other M1–M9 claim is made. The original frozen contract and its deferred scope remain preserved.

## Remaining gates

- Obtain explicit user authorization and run a real microphone Start session.
- Exercise live recognition, partial hypotheses if available, Stop/finalization, Cancel, permission handling, and device-error behavior.
- Evaluate recognition quality, latency, punctuation, and any language behavior only if separately authorized and actually tested.
- Keep the full M1–M9 product scope and all deferred capabilities separate from this experimental MVP; reverify if candidate bytes change.
