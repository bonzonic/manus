---
task_id: 8
status: draft
updated: 2026-10-24
---

# Product promo video Implementation Plan

**Spec:** [Production architecture](../architecture/architecture.md)

**Goal:** Produce a truthful, re-editable promo package after product, storyboard, asset rights and production scope are approved.

**Architecture:** Approved brief/shot list → real product capture and licensed sources → Video Editor project → captions/audio/claim/privacy review → approved master and manifest.

**Proposed production tools:** Manus Video Editor [1], approved capture tools, timed-caption source, asset/claim registers and the actual export route. Proposed defaults are a 30-second 16:9 interview/portfolio cut for first-time prospective users; no brand, audience or channel has been selected.

> For workers: keep unchecked boxes until artifacts/check evidence exist. Read the current Video Editor skill/tools at production time; narration, music or generated media require their relevant routes and approval. A separate production worker edits, and a fresh `om-verifier` independently inspects the result. No capture, paid generation, export or publication happens in this documentation pass.

## Global constraints

Only the title is confirmed. Product/storyboard approval precedes production. Product behavior and claims must be real or clearly labeled conceptual. Source access and asset rights must be documented. Use a re-editable project, not only a final render. Protect private data and notifications. Software TDD is not the acceptance method for an editorial timeline.

## Review focus

1. Unknown product/audience/claims → `ScopeApprovalCheck`, `ClaimTruthCheck` in M1/M2.
2. Missing source rights or private-data exposure → `LicenseRegisterCheck`, `FootagePrivacyCheck` in M2/M3.
3. Illegible/unsynchronized captions → `CaptionReadabilityCheck` in M4.
4. Audio clipping, bad cuts or unreadable product evidence → `EditorialPlaybackCheck` in M4.
5. Uneditable/broken project or wrong export → `ProjectReopenCheck`, `ExportManifestCheck` in M3–M5.

## Milestones

### M1 — Select the product and approve the editorial brief

**Artifacts:** task-local `decisions.md`, `approved-brief.md`, `script.md`, `shot-list.md`, `storyboard.md`, `claim-ledger.csv`.

**Consumes:** title-only proposal, product evidence and audience/channel decisions. **Produces:** an approved truthful concept and production boundary.

- [ ] Confirm product, audience, desired action, duration/aspect ratio, brand, channel, caption languages and available source access.
- [ ] Inspect the current Video Editor route and relevant project/assets, recording unavailable tools rather than inventing commands.
- [ ] Apply `ScopeApprovalCheck` and `ClaimTruthCheck`. Missing product or storyboard approval blocks production; every claim needs evidence or removal.

A proposed 30-second starting shot order, to be replaced/approved for the actual product:

- 0–4 seconds: one concrete user problem, no unsupported market claim.
- 4–8 seconds: show the real product and the entry action.
- 8–20 seconds: demonstrate one end-to-end workflow with readable product evidence.
- 20–26 seconds: show the observable result/benefit, not a fabricated metric.
- 26–30 seconds: approved product name and call to action/end card.

### M2 — Source capture and rights/privacy review

**Artifacts:** task-local `artifacts/source/`, `asset-license-register.csv`, capture log and source references.

**Consumes:** approved shot list, synthetic data and authorized source assets. **Produces:** clean footage and traceable rights/source records.

- [ ] Capture the approved product path in a sanitized environment; suppress notifications and exclude credentials, unrelated windows and customer data.
- [ ] Run `FootagePrivacyCheck` on every selected shot and `LicenseRegisterCheck` for footage, graphics, fonts, music and voice rights. Unknown rights block use.
- [ ] Record source IDs and approval; no paid generation or publishing is implied by an asset list.

### M3 — Assemble the re-editable timeline

**Artifacts:** Video Editor project, timeline/asset metadata, caption source and review master under task-local `artifacts/`.

**Consumes:** approved script, footage, brand and licensed audio. **Produces:** a source-preserving editable cut through the Video Editor route [1].

- [ ] Assemble the approved narrative with meaningful before/result evidence; use conceptual visuals only when clearly labeled.
- [ ] Create caption and audio tracks with editable source, not just burned-in text. Retain source links and version references.
- [ ] Run `ProjectReopenCheck`: reopen the project and resolve its media/timeline dependencies. Missing source assets or a render-only deliverable fail this gate.

### M4 — Editorial, captions, audio and claim review

**Artifacts:** task-local `review/qa.md`, revised master, timed captions and issue record.

**Consumes:** full cut and claim/rights records. **Produces:** reviewed or blocked cut with precise issues.

- [ ] Watch/listen to the entire cut. Run `EditorialPlaybackCheck` for readable product UI, cut continuity, CTA visibility, audio clipping and unintended private content.
- [ ] Run `CaptionReadabilityCheck`: captions represent speech and relevant non-speech audio, are synchronized and legible, and do not obscure essential product evidence [2]. Check beginning, middle and end as well as actual transitions.
- [ ] Repeat `ClaimTruthCheck`, `FootagePrivacyCheck` and `LicenseRegisterCheck`. Changes reopen the relevant gates; acceptance is not a blanket copyright/accessibility certification.

### M5 — Independent verification, export and handoff

**Artifacts:** task-local `verification/<run-id>/verify-report.md`, approved master, captions, `export-manifest.json` and handoff notes.

- [ ] Have a fresh verifier inspect the editable project, full cut, source/rights records and named checks without relying on the editor's assertion.
- [ ] After export scope/settings are approved, run `ExportManifestCheck`: record duration, dimensions, audio/caption behavior, source/project references and a full playback check of the actual file. Use approved platform encoding guidance if applicable [3].
- [ ] Package the project, required source dependencies, caption source, reviewed master and manifest. Do not upload/publish without separate authorization.

## Acceptance and handoff

The approved story is visible in a complete playable cut, supported claims match real evidence, private data is absent from inspected footage, captions/audio are usable, rights records exist and the project reopens with its dependencies. Proposed duration/aspect ratio must match the final approved brief, not an arbitrary default. A missing approval/rights/caption/project dependency blocks acceptance.

Handoff includes the approved brief/storyboard, registers, editable project, captions, actual reviewed export and independent report. All artifacts/checks here are planned; no video, audio, footage, paid media or upload was produced.

Sources consulted 2026-10-24.

## References

[1]: https://manus.im/features/video-editor "Manus Video Editor"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html "W3C understanding captions for prerecorded content"
[3]: https://support.google.com/youtube/answer/1722171?hl=en "YouTube recommended upload encoding settings"
