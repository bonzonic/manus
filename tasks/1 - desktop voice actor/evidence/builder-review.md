# Independent builder review

Reviewed 2026-10-24 by a fresh Windows desktop engineer, before final user approval. This is a design builder check, not a product test or security verification. The following returned review is preserved unchanged; owner resolutions are recorded separately in the architecture.

## Assessment

Three material planning clarifications remain. The proposal is otherwise explicit on the hard mixed-language gate, no privilege escalation, one-session/no-mid-session insertion, cancellation invalidation after dispatch, manual-only clipboard recovery, and the portable runnable-artifact scope. No implementation, build, product test, or pass claim was made.

## Ranked questions

### 1. Safety and acceptance contract

**Question:** Before B0, what is the acceptance meaning of M5 when SendInput reports accepted events but cannot prove that the intended field mutated and focus can race after the last UI Automation check: must the supported matrix have zero observed missed insertions, or is InputSent an acceptable best-effort outcome?

**Why it matters:** The design correctly distinguishes InputSent from Verified and Uncertain, but M5 says text must reach the intended caret while the safety gates specify zero wrong-target mutations, duplicates, and submissions without specifying an allowed missed-insertion rate. Accepting InputSent as success can report success with no text; requiring zero misses may make UIA plus SendInput insufficient and require post-dispatch verification or per-application adapters.

**Recommended resolution:** Freeze one contract before B0. Prefer zero observed misses in the named matrix, with post-dispatch verification wherever an adapter can provide it. If best-effort InputSent is accepted, label it as non-verification, define the permitted miss/recovery behavior, and explicitly approve any stronger per-app adapter, clipboard, or TSF scope rather than adding clipboard paste implicitly.

### 2. Safety and interaction contract

**Question:** Is bare Escape allowed to be consumed globally only while a session is active, and what is the fail-closed behavior if that registration is unavailable or conflicts with target semantics: refuse start as written, or support a separately configurable cancellation shortcut?

**Why it matters:** The proposal requires a working advertised cancellation path and says not to start without one, but it also describes only one configurable global shortcut and does not state Escape ownership/pass-through or an alternate binding. This changes the hotkey implementation, whether the target application receives Escape, onboarding copy, and cancellation tests. The post-dispatch no-retraction boundary is stated, but the registration and ownership contract is not.

**Recommended resolution:** Specify the contract before implementation: while active, Escape is consumed for cancellation and while idle it passes through; failed registration blocks microphone-open unless a pre-approved second cancellation hotkey exists. Keep cancellation effective before the at-most-once dispatch fence and report too-late/no-retry after accepted input.

### 3. Provider, privacy, and release-scope decision

**Question:** Is the release contract Azure-only with a user-supplied key and region, or must it remain provider-neutral so B0 may select a challenger if Azure misses the hard mixed-language gate; and what onboarding state is permitted when the credential is absent or consent is denied?

**Why it matters:** M4 correctly forbids silently shipping English-only and permits a challenger, while M2, M7, and B5 hard-code Azure consent/indicator/key onboarding. A challenger changes credential fields, consent and data-handling disclosures, region policy, and potentially the protected-credential schema. Independently, no-key/no-consent behavior must not accidentally permit cloud capture or a misleading first-use success path.

**Recommended resolution:** Choose one before the full build: freeze Azure-only and make a mixed-language failure a terminal release blocker, or pre-authorize a named challenger and define a provider-neutral consent/credential contract. Explicitly define no-key/no-consent as either mic-only/preview-only or blocked, with no upload and no cloud insertion until valid provider-specific consent and credentials exist.

## Coverage notes

The one-session rule is sufficiently explicit for planning: no mid-session insertion, ordered finalized segments aggregate into one commit, and cancellation/late-final fences suppress stale results; provider-specific joining remains a builder/B3 detail. Elevated/protected/unknown targets are refused without privilege escalation. Automatic clipboard paste is explicitly deferred; manual Copy is the only normal recovery exposure. M9 already states a portable self-contained Windows x64 folder/zip with required native dependencies, while signing, MSIX, and update services are deferred; the remaining release question is only the exact clean-machine prerequisite baseline if the owner wants a stricter artifact claim.
