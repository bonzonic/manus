# B0 speech/audio evidence and provenance

**Work item:** `b0-speech-L7GDB`  
**Recorded:** 2026-10-24 (Asia/Taipei, UTC+08:00)  
**Owner:** `b0-speech` feature owner  
**Status:** Contract/handoff complete; implementation, provider call, live benchmark, and product verification are pending.

## 1. Scope and source provenance

The user explicitly overrode the normal task registry and made these paths authoritative:

- `TASK_DOCS_DIR`: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`
- Approved architecture: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`
- Approved scope: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`
- Original brief: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\task.md.txt`
- Retained Azure notes: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-plan-L7GDB\.work\azure-free-options-notes.md`
- Assigned worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-speech-L7GDB`
- Work-item directory: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-speech-L7GDB`

SHA-256 hashes captured before authoring this packet:

| Input | SHA-256 |
|---|---|
| `research.md` | `AAFAC5141150F09CBA6D2DF5427B67C36D7064E8C8D4E53FBA331F93C10993BC` |
| `decision.md` | `9A93E18BAC88809CC44D20A146CA4E33EC27A8D1CE4949F87C9BDAFB99469E4A` |
| `task.md.txt` | `762E07CF9D2347B71AC3B62B9FBEFEF509C125100840E06CE1EAEF7F8A1C518C` |
| retained `azure-free-options-notes.md` | `0FF67742623A66543739D0B577D4E9F4294C4B6556801543BFFDD6B3C8DFF0EA` |

The earlier `architecture/architecture.md` and `plans/plan.md` drafts were read for history and are not treated as authoritative over the approved root documents. The original checkout, unrelated changes, other worktrees, Obsidian task registry, and stale plans were not modified.

## 2. Repository/worktree baseline

- Git `HEAD`: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Branch: detached worktree; no branch name was reported.
- `git status --short`: empty at inspection time.
- Worktree file inventory at inspection:
  - `.git` — 86 bytes, SHA-256 `9C5504D84523DFCB4C3F3EAF131FB30A86B114DB42AF51AB23E5653EA39792B1`.
  - `.gitignore` — 61 bytes, SHA-256 `05F349B332CDBA77DBFD84C34DF001EC9F1996A83106D372D76D67AE555B3DB7`.
  - `AGENTS.md` — 4,485 bytes, SHA-256 `46B301EE04A2B64F0B2B6107223EF8FC71E6758D8A0AE421E7C17A610A75F9E3`.
  - `README.md` — 7 bytes, SHA-256 `2338699AB823AEF7AE9E8ABA3D61CFF5E3253862FE0E11A5B9C12A3CC9F5AB51`.
- No `.sln`, `.slnx`, `.csproj`, `.fsproj`, `.vbproj`, `global.json`, `Directory.Build.*`, package manifest, source directory, test directory, test runner, or provider adapter was found under the assigned worktree.
- No product source, project files, dependencies, SDK, build, test, provider call, mic capture, UI interaction, secret read, commit, push, merge, or deployment was performed by this owner.

**Source organization decision:** The baseline has no solution organization. The approved future organization is four projects: `VoiceInput.Core`, `VoiceInput.Windows`, `VoiceInput.Speech`, and `VoiceInput.App`, with deterministic core/Windows/speech tests. The implementer must confirm or create that layout only after coordinator admission; this packet does not fabricate a current solution or candidate identity.

## 3. Official Azure evidence retrieved 2026-10-24

All URLs below are official Microsoft/Azure sources and were followed via web fetch. They establish capability/limits; they do not prove this product's live quality or account state.

### Real-time SDK and event lifecycle

- Microsoft Speech SDK: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-sdk>
  - C# Speech SDK is supported on Windows and intended for real-time scenarios.
  - The page directs specialized fast/batch/LLM Speech scenarios to other APIs/SDKs; B0 remains on the standard real-time Speech SDK.
- How to recognize speech: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech>
  - C# `SpeechRecognizer` exposes `Recognizing` for intermediate results, `Recognized` for final results, `Canceled` for direct/transport/protocol cancellation, and `SessionStopped` for session end.
  - Continuous recognition uses `StartContinuousRecognitionAsync` / `StopContinuousRecognitionAsync`.
  - The same page documents post-stream refinement and the `SpeechServiceResponse_PostProcessingOption` property.

### Language feasibility and mixed-language blocker

- Language identification: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-identification>
  - Candidate languages use `AutoDetectSourceLanguageConfig`; at-start LID allows up to four candidates and continuous LID up to ten.
  - Continuous LID is supported by C# Speech SDK for continuous recognition.
  - The documentation explicitly says continuous LID can identify multiple languages during audio but **does not support changing languages within the same sentence**. This is the critical mixed Mandarin-English release limitation.
  - The documented C# shape uses `SpeechServiceConnection_LanguageIdMode = "Continuous"` for continuous LID.
- Language and voice support: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support>
  - `en-US` and `zh-CN` appear in the real-time speech-to-text locale table.
  - The page separates real-time transcription from post-stream refinement and labels multilingual post-stream refinement as **public preview**.
- How to recognize speech, post-stream refinement section: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech#post-stream-refinement>
  - Monolingual post-stream refinement is generally available.
  - Multilingual post-stream refinement is public preview and is described as supporting multiple languages in one session, including language switching.
  - The page states that the multilingual path uses open-range automatic language detection rather than a candidate language list.

**Interpretation frozen by this owner:** Standard F0/C# real-time recognition is a viable English/Mandarin candidate and can be tested. Continuous LID is not sufficient evidence for same-sentence code-switch support. Preview multilingual post-stream refinement is a user-decision blocker, not an authorized dependency or silent fallback.

### F0 tier and excluded paths

- Azure Speech pricing: <https://azure.microsoft.com/en-us/pricing/details/speech/>
  - Free F0 Standard Speech-to-Text allowance is **5 audio hours of real-time transcription per month**.
  - Free audio hours are shared between Standard and Custom; batch is not supported by the F0 allowance.
- Speech quotas and limits: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits>
  - F0 base-model real-time concurrent request limit is **1** and is not adjustable.
  - F0 custom endpoint concurrent request limit is also 1 and not adjustable.
  - Voice Live and Azure LLM Speech quota tables mark F0 as not applicable.
  - F0 batch transcription is not available; fast/batch limits are not the approved streaming path.

**Interpretation frozen by this owner:** Serialize live benchmark utterances; do not open parallel streams. Do not move to S0, Voice Live, Azure LLM Speech, batch, fast transcription, or a challenger merely to make B0 progress.

### Privacy boundary

- Microsoft data/privacy for Speech-to-text: <https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security>
  - Real-time speech-to-text audio is processed in Azure server memory and no data is stored at rest by the Speech service; data in transit is encrypted.
  - Microsoft states that it does not retain/store customer data for real-time speech-to-text, while the customer remains responsible for permissions and applicable privacy obligations.

This supports the approved provider disclosure but does not remove the app's obligation to obtain explicit consent, avoid local default history, and explain that cancellation cannot recall bytes already sent.

## 4. Retained research evidence used

The retained note `azure-free-options-notes.md` was read before official lookup. It records:

- F0 real-time transcription: five audio hours/month.
- F0 real-time base endpoint: one concurrent request; fast/batch unavailable for the intended path; Voice Live/LLM Speech not applicable to F0.
- F0 allowance exhaustion should reject/throttle requests until reset rather than silently charging; a paid S0 switch is explicit and user-controlled.
- The project should begin with Standard real-time F0, one stream, no Voice Live/LLM/batch/paid switch, and an explicit mixed-language feasibility gate.

The official pages above are the authoritative current evidence for the capability claims in this packet. No account, subscription, resource, key, or live endpoint was inspected.

## 5. Evidence matrix and status

| Gate | Evidence required | Owner-stage status |
|---|---|---|
| B0-A toolchain/project truth | Actual solution, SDK, package, restore/test output | `BLOCKED/PENDING`: no solution or SDK evidence in baseline; no install/build authorized. |
| B0-B bounded NAudio frames | Deterministic queue/copy tests plus admitted device test | `PENDING`: no code or capture run. |
| B0-C partial/final aggregation | Deterministic event/final-segment tests and later SDK mapping | `PENDING`: no code/provider call. |
| B0-D cancellation/final fence | Deterministic stale/late event tests | `PENDING`: no code. |
| B0-E local-only mic test | Explicit-start/no-provider/no-file tests plus optional supervised level run | `PENDING`: no mic access performed. |
| B0-F F0 90-item benchmark | Consent/corpus manifest, serialized live run, metrics report | `BLOCKED`: user key/region, cloud consent, and 90-utterance consented corpus absent. |
| Mixed-language release gate | Non-preview F0 configuration passes 30 mixed corpus with frozen thresholds | `BLOCKED/PENDING`: continuous LID has same-sentence limitation; preview path requires user decision; no live result. |

Current live recognition result is exactly: `PENDING_MISSING_USER_CREDENTIALS_AND_CONSENTED_CORPUS`.

## 6. Safe user-input route and one decision question

No agent should request, read, print, or store the Azure key. Later, the user must create/confirm an F0 Speech resource, enter the key locally into a secure app control, grant provider-specific consent, and provide/approve the 90-item corpus. The local app must protect the key with CurrentUser DPAPI in a separate blob under `%LOCALAPPDATA%\\VoiceInput` and keep it out of source/settings/logs/command lines.

**Focused user question for the parent:** When the implementer is admitted, will you provide the Azure Speech F0 key/region through the local secure setup, grant explicit cloud consent, and provide/approve the 90-utterance corpus; and if the permitted F0 path cannot meet same-sentence mixed-language quality without Microsoft’s preview or a paid tier, do you want that evaluated as a new decision rather than enabled automatically?

## 7. Owner conclusion

This is a frozen B0 implementation contract and provenance record, not a claimed product PASS. The implementer may proceed only through the separate handoff and coordinator admission. The hard mixed-language gate cannot be removed to advance B1–B6. A fresh verifier must receive the candidate revision/build manifest and use a separate verification directory; owner/implementer tests cannot substitute for independent verification.
