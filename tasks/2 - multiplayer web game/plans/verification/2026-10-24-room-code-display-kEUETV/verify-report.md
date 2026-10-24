# Independent verification report — room-code display

**Verdict: BLOCKED (blocked/unverified browser proof; no product-code FAIL)**  
**Declared scope:** local room-code display only. This report does not verdict the whole MVP, S10, gameplay, reconnect, deployment, origin defaults, launcher, or server lifecycle.

## Revisions and provenance

- Baseline: `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`
- Candidate: `10fab9395979a76c076c6c5474a5b1b0dce2177c`
- Baseline worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-room-code-baseline-20261024-kEUETV\project`
- Candidate worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-room-code-fix-20261024-kEUETV\project`
- Candidate changed-file receipt remains limited to `public/dom-renderer.js` and `test/client/room-code-display.test.js`.
- Browser run source hashes recorded in the preserved run result: baseline renderer `8ed0a11d23777c0fc3aa9e7a254d59148fa0dc05652fca5d340aff730affa878`; candidate renderer `13c13904fc5e27697a21439d6ca3c744e56fd2b9955a1b486cc541035dcb8da5`.

## Native RED/GREEN measurements

All commands were finite Node 22.12.0 commands. No product file, test file, server, browser, package installation, network, or full suite was run or changed by this verifier.

| Arm/check | Command/evidence | Exit/result | Failure identity |
|---|---|---:|---|
| Baseline change-defining probe | Frozen owner direct probe, temporary import of baseline `public/dom-renderer.js`; log [`native-baseline-direct-probe.txt`](evidence/native-baseline-direct-probe.txt) | **1 (RED)** | `AssertionError [ERR_ASSERTION]`; `actual: ''`, `expected: 'AB12CD34'`, at probe line 7. The baseline renderer leaves the header empty/stale. |
| Candidate change-defining probe | Same frozen probe, temporary import of candidate renderer; log [`native-candidate-direct-probe.txt`](evidence/native-candidate-direct-probe.txt) | **0 (GREEN)** | No failure. Header and lobby source both equal `AB12CD34`. |
| Candidate focused regression | `node --test test/client/room-code-display.test.js`; log [`native-candidate-focused-test.txt`](evidence/native-candidate-focused-test.txt) | **0** | 2 tests passed, 0 failed. Covers cold `--------`, both display surfaces, repeated render consistency, and model-derived copy invite. |
| Baseline named guards | `node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js`; log [`native-baseline-client-guards.txt`](evidence/native-baseline-client-guards.txt) | **0** | 8 tests passed, 0 failed. |
| Candidate named guards | Same exact guard command; log [`native-candidate-client-guards.txt`](evidence/native-candidate-client-guards.txt) | **0** | 8 tests passed, 0 failed; no new failure identity. |

The native evidence therefore proves the renderer change itself is RED on the immutable baseline and GREEN on the candidate, with the named guard set unchanged.

## Preserved real-browser evidence and image inspection

The parent-run browser probe used Playwright 1.56.1, installed Chrome, headless 1440x900, device scale 1, separate in-process arms, and the actual server path. Its preserved result is [`evidence/run-result.json`](evidence/run-result.json), with parent conduit exit `1` in [`conduit-output.txt`](conduit-output.txt). I did not rerun browser/server work because the fresh reservation explicitly permitted native checks and saved-evidence inspection only.

I inspected **all four** saved screenshots:

- [`screenshots/baseline-before.png`](evidence/screenshots/baseline-before.png): cold entry dialog; header room field visibly shows `--------`.
- [`screenshots/baseline-after.png`](evidence/screenshots/baseline-after.png): `ROOM CREATED` dialog and header both visibly retain `--------`; `Ready up` and connected room state are present.
- [`screenshots/candidate-before.png`](evidence/screenshots/candidate-before.png): same cold entry state and `--------` placeholder.
- [`screenshots/candidate-after.png`](evidence/screenshots/candidate-after.png): `ROOM CREATED` dialog and header both visibly show the same eight-character code `BIQ7CKZS`; `Ready up` and connected room state are present.

The screenshots are valid visual evidence of the baseline/candidate display difference, but they are not authoritative network-payload evidence. In the preserved `run-result.json`, both arms have `initialDomValue` `{header: "--------", copySources: ["--------"]}` and visible room-created state (`panelVisible: true`, `readyButtonVisible: true`, `readyButtonText: "Ready up"`). However, both arms incorrectly record `authoritativeCode: null`, `sanitizedTrace: []`, and `codeSupportStatus: "BLOCKED_MISSING_NETWORK_WELCOME"`. Thus the required real-network welcome measurement is absent even though the candidate screenshot visibly contains `BIQ7CKZS`.

The source-string field `copyInviteSourceCheck: "MODEL_ROOM_CODE_CONFIRMED"` is present for both arms, but I did not treat that static check as behavioral proof. The candidate native test independently confirms the unchanged model-based invite behavior.

## Diagnosed parent browser exit-1 cause

This is a **QA fixture/checker assumption**, not a demonstrated product mismatch. The original [`room-code-browser-check.mjs`](room-code-browser-check.mjs) installs:

```js
socket.on('framereceived', payload => {
  if (typeof payload !== 'string') return;
  message = JSON.parse(payload);
});
```

The pinned Playwright declaration at `.work\\tools\\browser-qa\\node_modules\\playwright-core\\types\\types.d.ts:21493-21498` defines the callback argument as an object `{ payload: string | Buffer }`. Therefore the original callback sees an object, immediately returns, records no received frames, and never sets `welcomeCode`. That exactly explains the preserved `sanitizedTrace: []`, `authoritativeCode: null`, and the parent conduit exit 1. The candidate screenshot and native RED/GREEN proof are consistent with the renderer fix; the browser checker simply failed to observe the authoritative frame.

I preserved the original script and created the syntax-checked QA-only correction [`room-code-browser-check-frame-payload-corrected.mjs`](room-code-browser-check-frame-payload-corrected.mjs). Its only change reads `frame.payload`, accepting either the documented string or Buffer and parsing the resulting payload. `node --check` exited 0. Original script SHA-256 is `55B55E7225CB4C5D8442A260B0E6AA72D8E2212ABAE86E50BDDE8F63124A5751`; corrected-copy SHA-256 is `1523C4CA43EA6B10047460C185BB6FEBBFAA470C5CF0F70132F9B0A03D75E24C`.

## Exact QA-only correction command

Run only after a fresh browser/server reservation is granted, writing to a new evidence root so the original evidence remains immutable:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-room-code-display-kEUETV\room-code-browser-check-frame-payload-corrected.mjs" `
  --baseline-project "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-room-code-baseline-20261024-kEUETV\project" `
  --candidate-project "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-room-code-fix-20261024-kEUETV\project" `
  --candidate-sha "10fab9395979a76c076c6c5474a5b1b0dce2177c" `
  --evidence-root "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-room-code-display-kEUETV\evidence\frame-payload-corrected-rerun"
```

The browser verdict must remain pending until that corrected run records an observed eight-character `welcome.roomCode` on both arms, baseline DOM placeholders on both surfaces, candidate exact-code DOM values on both surfaces, and clean arm/top-level cleanup receipts.

## Cleanup receipts and uncertainty

- Preserved parent browser receipts are complete: baseline and candidate arm receipts each report browser context, browser connection, browser server, and in-process server closed with no errors; the top-level receipt reports `processesRemaining: []`. See [`run-result.json`](evidence/run-result.json) and [`qa-process-receipt.json`](evidence/qa-process-receipt.json).
- This verifier started no browser or server. Native test/probe commands and `node --check` all returned finitely. Temporary baseline/candidate probe files were removed; the temp-probe count was 0 after cleanup.
- No OS clipboard was touched. No unknown PID was killed. Original screenshots, original `run-result.json`, original process receipt, original conduit output, and original QA script were preserved.
- **Uncertainty/blocker:** the candidate's authoritative welcome code was not captured in the preserved browser result; `BIQ7CKZS` is screenshot-visible only. Consequently this report does not claim browser PASS, despite the native renderer proof and visual candidate evidence.

**Product change needed:** `false` for the currently evidenced renderer defect; the next required action is a corrected QA-only browser rerun, not a product retry.


---

# Corrected-proof addendum — independent final review (2026-10-24)

**Superseding verdict for the scoped display defect: PASS.** This addendum supersedes the prior browser-proof blocker only for the room-code display defect after review of the fresh corrected-QA rerun. The earlier `BLOCKED` verdict and its evidence remain preserved as historically accurate: that run did not observe a welcome because its frame listener read the wrong payload shape. The correction was QA-only; this review did not run new browser, server, process, or product tests and did not revise the earlier evidence as though it had been valid then. This is not a verdict on the whole MVP, public/S10 deployment, gameplay, reconnect, lifecycle, or any excluded area.

## Fresh raw result and revision/source mapping

Reviewed `evidence/frame-payload-corrected-rerun/run-result.json` and its colocated process receipt. The corrected run reports `status: PASS`, with baseline SHA `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35` and candidate SHA `10fab9395979a76c076c6c5474a5b1b0dce2177c`, matching the frozen plan and immutable candidate receipt. The arms point to the corresponding baseline and candidate worktrees. Recorded SHA-256 renderer source hashes are baseline `8ed0a11d23777c0fc3aa9e7a254d59148fa0dc05652fca5d340aff730affa878` and candidate `13c13904fc5e27697a21439d6ca3c744e56fd2b9955a1b486cc541035dcb8da5`. Driver provenance is Playwright 1.56.1 with installed Chrome, headless at 1440×900 and device scale 1; each arm's actual browser origin is listed in the raw result and is included in that arm's allowed origins.

The authoritative observed network welcome codes are baseline **`YYCHABXV`** and candidate **`4MW7YG9Q`**. Each is explicitly recorded as `OBSERVED_NETWORK_WELCOME` in the trace and equals that arm's authoritative code. Baseline DOM after create has header `--------` and `copySources: ["--------"]`; candidate DOM has header `4MW7YG9Q` and `copySources: ["4MW7YG9Q"]`, exactly matching its welcome. Both initial DOM states retain the placeholders. Both arms report the created panel visible, ready button visible, and button text `Ready up`.

## Independent inspection of both after screenshots

I opened and visually inspected both files in `evidence/frame-payload-corrected-rerun/screenshots/` at 1440×900. `baseline-after.png` shows the `ROOM CREATED` dialog and top header both retaining the dashed placeholder, with the lobby panel and `Ready up` state visible. `candidate-after.png` shows `4MW7YG9Q` in the top header and dialog room-code field, with the same created-panel and `Ready up` state. The screenshot observations agree with the raw network and DOM payloads; neither image is being used as a substitute for network proof.

## Prior native proof, scope, and cleanup

The preserved native report remains RED on baseline / GREEN on candidate: the frozen change-defining probe failed baseline with empty header versus expected `AB12CD34`, passed candidate with both display nodes correct; candidate focused regression passed 2/2; named client guards passed 8/8 on both arms with no new failure identity. These are the existing recorded native measurements, not new tests performed for this addendum. The immutable candidate receipt lists exactly two changed files—`public/dom-renderer.js` and `test/client/room-code-display.test.js`—which are the only approved product-change files under the frozen scope; no out-of-scope candidate file is reported.

Both arm cleanup receipts say complete/`CLOSED`, with browser context, browser connection, browser server, and in-process server each attempted and closed, and no errors. The top-level cleanup receipt is complete/`CLOSED` with `processesRemaining: []`; the separate process receipt identifies the QA PID and invocation. Thus the supplied receipts show complete task-run cleanup and no remaining process.

**Final conclusion:** the corrected network evidence, matching candidate DOM values, baseline placeholders, same-state screenshots, existing native RED/GREEN proof, revision/source mapping, and clean receipts satisfy the frozen acceptance criteria for this display defect. Only the renderer and focused test may be applied to the shared project, subject to the parent’s integration controls. No broader MVP acceptance is implied.
