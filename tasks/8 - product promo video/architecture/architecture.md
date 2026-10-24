---
task_id: 8
status: draft
updated: 2026-10-24
---

# Product promo video — Architecture

[Production plan](../plans/plan.md)

## Brief and proposed scope

Only the title is confirmed. Product, audience, footage, brand, channel and duration are unknown.

A proposed interview/portfolio cut is 30 seconds, 16:9, for a first-time prospective user. These values are unapproved planning defaults. Product selection, truthful claim evidence, storyboard and rights/access decisions must precede production.

The intended package is a re-editable Video Editor project, source/rights register, timed captions, reviewed master and export manifest. Paid media generation, publishing, invented product capabilities and unapproved channel variants are not authorized by this plan.

## Production pipeline and artifact contracts

```text
Approved product brief + script/shot list
                ↓
Real product capture + licensed assets + claim evidence
                ↓
Re-editable Video Editor timeline + caption/audio sources
                ↓
Editorial / privacy / rights / export review
                ↓
Approved master + project + traceable handoff manifest
```

**Brief gate** consumes product/audience/channel decisions. It produces an approved brief, script, shot list, storyboard and claim ledger. Each spoken/on-screen claim must map to observed product behavior or an explicitly approved source.

**Capture/ingest** consumes approved shot instructions, product access and assets. It produces source references, stable asset IDs and `asset-license-register.csv`. Capture in a sanitized environment with synthetic data; do not show credentials, notifications or unrelated customer content.

**Editing stage** consumes source footage, approved brand/audio and the script. It produces a re-editable project, timeline metadata and caption source. Future production uses the Manus Video Editor route [1], after reading its current tool/skill requirements. A render-only final file is not a substitute for the editable project.

**Editorial QA/export** consumes the timeline, claim and rights records. It produces a review record, approved master, captions and manifest linking outputs to their inputs. Caption review includes speech and meaningful non-speech audio where applicable [2]. An approved YouTube export can use that platform's upload-encoding guidance [3]; no channel has yet been selected.

## Narrative and alternatives

A proposed short structure is problem → one real workflow → visible benefit → call to action. The plan contains a shot-level starting point, but final timing follows product/storyboard approval. Product footage should show the actual experience rather than a fabricated UI presented as working software.

A source-preserving edit is preferred over early generative clips because the product and claims are unknown. Generated supporting assets may be considered only after scope, cost, usage rights and the appropriate generation route are approved; none is being generated now.

## Failure and trust boundaries

A missing product decision, unsupported claim, unlicensed asset, private-data exposure or absent readable captions blocks acceptance. Changes to footage, wording, audio or assets reopen their corresponding review gates. “Reviewed” means the named checks were actually performed, not that copyright or accessibility compliance has been certified.

The public formatting reference originally associated with video/audio specifications is not a blanket copyright-clearance source. Keep rights evidence in the asset register and avoid treating platform acceptance as proof of permission.

## Decisions before production

Confirm product, audience, duration/aspect ratio, channel, CTA, brand assets, source access, music/voice, caption languages and export settings. The editing project's current capabilities and any paid-media steps require execution-time checks. No footage, audio, video, export or upload was produced.

Sources consulted 2026-10-24.

## References

[1]: https://manus.im/features/video-editor "Manus Video Editor"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html "W3C understanding captions for prerecorded content"
[3]: https://support.google.com/youtube/answer/1722171?hl=en "YouTube recommended upload encoding settings"
