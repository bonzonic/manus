# Offline B0 evaluation corpus preparation handoff

**Work item:** `b0-offline-L7GDB`  
**Owner role:** SAME-ROLE SUCCESSOR OFFLINE FEATURE OWNER  
**Recorded:** 2026-10-24 (Asia/Taipei, UTC+08:00)  
**Status:** `PENDING_CORPUS_WITH_VIABLE_PARTIAL_ROUTE`; this is fixture/spec text only.

## Boundary and conclusion

The frozen offline contract requires exactly **90 independent utterances**: 30 English, 30 Mandarin and 30 mixed Mandarin-English, with gold transcripts and coverage of proper names, numbers, negation, punctuation and code-switch boundaries. No audio was downloaded, generated or captured in this stage. No model/runtime archive, microphone, build, benchmark or product history was touched. The official Paraformer smoke WAV examples remain smoke-only and must never be counted as independent quality items, repeated examples or slices.

A fully public, source-licensed 30/30/30 set was **not established** from the three primary-source candidates checked below. A practical lawful route is available but requires one bounded local-consent action: use 30 English and 30 Mandarin items from a pinned FLEURS release after item-level audit, and capture the 30 mixed read-sheet items locally from one explicitly consenting operator (or another explicitly authorized speaker). The local 30 are evaluation inputs only, not product history. Until the public item revision/hashes and local consent/audio exist, the quality gate remains `PENDING`; no accuracy, latency, punctuation, CPU or memory result is claimed.

Public license/permission is not microphone consent. A dataset license can govern reuse of an existing recording; it does not authorize opening this device's microphone, recording a user or bystander, or retaining new audio. Local capture must be deliberate, bounded and visibly admitted.

## Candidate source review (three primary sources only)

### 1. FLEURS — preferred public route for the two monolingual legs

**Primary sources:**

- Dataset card: <https://huggingface.co/datasets/google/fleurs>
- Paper: <https://arxiv.org/abs/2205.12446>

The Google dataset card identifies the dataset as `cc-by-4.0`, includes `en_us` and `cmn_hans_cn` configurations, and exposes `audio`, `raw_transcription` and `transcription` fields. Each configuration has train/validation/test splits; the card describes approximately 1,000 train examples and approximately 400 validation and test examples per language configuration. The paper describes FLEURS as a 102-language, n-way parallel speech dataset built from FLoRes sentences. This is enough source-level capacity for 30 distinct English and 30 distinct Mandarin test items, subject to an acquisition-time audit of item IDs, speakers, exact text and the pinned dataset revision.

Limitations: it is primarily read speech and monolingual language configurations. The source does not establish a Mandarin-English code-switching subset. Parallel English/Mandarin sentences are not mixed utterances and must not be relabelled as mixed. Attribution and the CC BY 4.0 terms/notice must be retained. The exact immutable dataset commit/archive revision, file hashes, selected item IDs, speaker uniqueness and local license notice were not captured here because audio was intentionally not downloaded; those are `PENDING_PUBLIC_ASSET_AUDIT`.

**Assessment:** viable for 30 English + 30 Mandarin after pinning and auditing; not viable for the 30 mixed items.

### 2. Mozilla Common Voice — public alternative for monolingual clips, not mixed coverage

**Primary source:** <https://commonvoice.mozilla.org/en/datasets>  
**Chinese listing observed:** <https://mozilladatacollective.com/datasets/cmu60so4600hto107mg006pl7>

Mozilla's official dataset listing identifies Common Voice ASR datasets with `CC0-1.0` licensing, including English and Chinese-language offerings in the current catalog. The listing is a public source for separate locale recordings and transcript-bearing ASR releases, but the Chinese dataset detail page is dynamically rendered and did not expose a stable row-level manifest during this review. The exact release archive, locale, transcript schema, clip hashes and attribution/notice requirements therefore remain to be checked before use.

Common Voice supplies separate language clips; the reviewed public listing does not establish 30 same-utterance Mandarin-English code-switching items with gold transcripts. Distinct clips from two locales cannot be concatenated or relabelled as mixed, and repeated/sliced clips cannot satisfy independent-utterance counting.

**Assessment:** potentially viable as a CC0 monolingual fallback after a pinned release audit; not a complete 30/30/30 route and not selected over FLEURS for the initial fixture.

### 3. SEAME / LDC2015S04 — relevant mixed source, but not public-licensed under this contract

**Primary source:** <https://catalog.ldc.upenn.edu/LDC2015S04>  
**Access terms:** <https://catalog.ldc.upenn.edu/license/ldc-non-members-agreement.pdf>

The LDC catalog describes approximately 192 hours of Mandarin-English code-switching speech from 156 speakers, with associated UTF-8 tab-separated transcripts and selected segments, recorded at 16 kHz. This is the strongest checked source match for naturally mixed utterances, and its catalog description explicitly covers language switches and transcripts.

It is not a public-domain/Creative Commons dataset in the checked source. The catalog lists an LDC non-member agreement and view fees. The agreement limits use to non-commercial linguistic education, research and technology development, prohibits redistribution outside the named user/research group unless explicitly permitted, requires a signed agreement, and does not itself grant broad public redistribution. It also does not provide microphone consent for a new local recording. No copy was obtained.

**Assessment:** not an immediately usable public-licensed route. It becomes a possible future mixed-source route only after separate legal/access admission and item-level license review; do not silently treat it as available or free.

## Obtained now vs missing

**Obtainable now without audio/model/runtime access:**

- This report, the text-only read-sheet, and blank manifest templates.
- Public source descriptions and license/access conditions at the URLs above.
- A proposed FLEURS-first selection plan for 30 English and 30 Mandarin items.

**Missing and still required:**

- An immutable FLEURS release/commit, archive file list, SHA-256 values, license/notice copy, selected 30 English and 30 Mandarin item IDs, and an item-level audit confirming unique utterances and usable gold transcripts.
- Thirty mixed Mandarin-English audio items with gold transcripts. The supplied read-sheet is text only; it is not audio or a quality result.
- The exact operator identity/consent record, device/microphone admission, validated PCM format and bounded capture evidence for any local recording.
- Toolchain v2, exact sherpa/ONNX/native/model/token identities and hashes, microphone permission, model preparation, network-disabled execution, CPU/RAM/latency measurements and independent verification.
- Any optional punctuation asset and its own revision/license/hash/latency evidence. Raw ASR punctuation must be measured first.

## One focused local-consent question

Before any microphone or local evaluation recording, ask exactly:

> **Do you explicitly consent, as the named operator, to record these 30 English, 30 Mandarin and 30 mixed read-sheet utterances once on this Windows device for the bounded offline B0 benchmark only, with no bystanders and no idle capture, and to retain the resulting audio and gold-text manifest only in the separately admitted benchmark folder until the benchmark report is complete and the files are deleted? Please answer Yes or No.**

A `No`, an ambiguous answer, bystander speech, or a missing bounded-folder admission leaves the corpus gate `PENDING` and must not open the microphone. Consent to a public dataset license is not an answer to this question. If `Yes`, record a non-content consent ID, timestamp, operator role, retention/deletion date and manifest hash; do not put a name, raw transcript or audio in ordinary logs.

## Capture and privacy instructions

1. Keep this stage text-only until the focused question receives an explicit `Yes` and the parent separately admits bounded benchmark persistence. Do not download public audio, generate TTS, record a microphone, or use a cloud/paid service as a substitute.
2. Use only the explicitly selected microphone and `DataFlow.Capture`; never loopback/render input. Opening settings or a local level test must not send frames to the recognizer. The local level test has no transcript/file/history sink.
3. Record one item per file, one continuous utterance per file, with no concatenation, trimming into multiple items, repeated smoke WAVs, or bystander speech. Stop and discard any item with interruption, overlap, accidental hotkey speech, or an unconsented speaker. Do not silently retry it as another item.
4. Record the actual validated format in the manifest. The frozen benchmark hypothesis is 16 kHz, mono, PCM16, but it is not an assumption. Store only in the separately admitted benchmark folder; audio/transcripts remain out of product settings, ordinary logs and default history.
5. For public items, preserve the source item as one item and retain the source revision, item ID, source license, notice/attribution and audio SHA-256. Do not re-record, splice, translate, or change gold text. For local items, the read-sheet line is the gold transcript; the operator reads the words, names and numbers, not punctuation marks or quotation marks, unless a separately labelled punctuation prompt is admitted.
6. After the benchmark and independent verification, delete bounded audio and any content-bearing working manifest when the separately recorded retention date arrives. Preserve only content-minimizing aggregate metrics, provenance and consent/retention metadata.

## Manifest and uniqueness requirements

The CSV and JSON templates use one row/object per item. The final manifest must have exactly 90 unique `item_id` values: `en-01` through `en-30`, `zh-01` through `zh-30`, and `mix-01` through `mix-30`. `condition` must be exactly `english`, `mandarin`, or `mixed`. Every row requires a non-empty `gold_transcript`, source/revision/license fields, audio path and SHA-256, format fields, and a non-content consent ID or a public-source permission record.

For local items, `consent_id` is required and `source_type=local_consented_read`; for public items, `source_type=public_dataset` and the source license/revision/item ID are required. A manifest with 90 rows but missing consent, missing gold text, duplicate audio, duplicated item IDs, repeated/sliced smoke examples, or unknown source revision is invalid and returns `PENDING`/`BLOCKED`, never PASS.

## Metrics and pass/fail handling

- **English:** WER over the 30 `english` rows using a documented deterministic normalization for case/whitespace; report raw punctuation separately.
- **Mandarin:** CER over the 30 `mandarin` rows using documented Han-character normalization; do not hide Latin names, digits or negation words. Report punctuation separately.
- **Mixed:** language-aware mixed-token error over the 30 `mixed` rows. Use a deterministic tokenizer documented with the report (Latin/number runs as tokens, each Han character as a token unless the chosen tokenizer records another reproducible rule). Do not translate or paraphrase.
- **Proper names:** mark designated name spans in `gold_tags`; report exact match after the declared lexical normalization and separately report punctuation/case effects. Proposed threshold remains at least 90%.
- **Severe semantic errors:** manually adjudicate only meaning-changing errors in the 30 mixed rows, especially negation, names, dates, quantities and switch boundaries. Count each item at most once; proposed limit remains at most one severe error.
- **Punctuation:** compare raw ASR punctuation/capitalization with the gold text as a separate metric. If an optional local punctuation stage is evaluated, report its exact assets, hashes, license, revision, CPU/RAM and added latency; it cannot repair lexical ASR errors by paraphrase.
- **Latency:** record first non-empty partial minus speech-onset monotonic time; report p95 over all 90 items. Record final-ready minus Stop time separately; report p95 over all 90 items. The 15-second finalization boundary is a failure boundary, not a latency target. Do not count a smoke/example run as an item.
- **Resources/provenance:** report cold/warm model load, CPU, peak memory, queue duration, failures, device class, exact toolchain/model/native hashes and the network-disabled capture-to-final observation. No accuracy or latency claim is valid without the complete admitted run.

The proposed thresholds remain unchanged: English WER <=15%, Mandarin CER <=15%, mixed-token error <=15%, designated proper-name exact rate >=90%, at most one severe mixed semantic error, p95 first partial <=1.2 s and p95 final-ready <=2.5 s. These are proposed gates, not achieved values.

## Pending checks and handoff

- `PENDING_PUBLIC_ASSET_AUDIT`: pin and hash the selected FLEURS (or CC0 Common Voice fallback) release; verify exact transcripts, distinct item IDs, license/notice and source terms.
- `PENDING_MIXED_CORPUS`: obtain 30 locally consented mixed recordings from the read-sheet, or separately admit a lawful mixed corpus such as SEAME/LDC. Do not infer mixed quality from monolingual or parallel sentences.
- `PENDING_LOCAL_CONSENT_AND_RETENTION`: obtain the single Yes/No answer above before opening the mic; separately admit bounded persistence and deletion.
- `PENDING_TOOLCHAIN_V2_ASSET_MANIFEST`: exact SDK/package/native/model/token identity, file hashes, architecture, licenses/notices and no-network preparation boundary remain with the toolchain lane.
- `PENDING_HARDWARE_AND_NETWORK_DISABLED_RUN`: microphone, quality, punctuation, partial/final latency, CPU/RAM, finalization, no-speech and no-network evidence remain unrun.
- `PENDING_INDEPENDENT_VERIFICATION`: a fresh verifier must inspect the complete manifest and evidence; this owner handoff is not a PASS.

No canonical document was rewritten, no original evidence was replaced, and no decision reapproval is requested for the already chosen local Paraformer provider.

## Source-backed status

**Viable route:** FLEURS CC BY 4.0 for 30 English + 30 Mandarin after immutable-release/item audit, plus 30 once-recorded local mixed utterances under explicit operator consent and bounded retention.  
**Gap:** no checked public-licensed source supplies the complete 30 mixed items with a ready-to-use gold-transcript set under the current contract. SEAME is relevant but permissioned through LDC, not publicly licensed.  
**Current result:** `PENDING`; no quality, accuracy, latency, resource or offline-execution result achieved.
