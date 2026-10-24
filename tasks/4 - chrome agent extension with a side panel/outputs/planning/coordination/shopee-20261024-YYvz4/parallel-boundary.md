# Parallel acceleration boundary

Requested by user 2026-10-24 16:24:38 +08:00. Main implementer 7be9330b3a04_a0 was at final test/hash/report stage at 16:25:15; no additional feature edits are being assigned to it.

Created second detached worktree at C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/ui-privacy-20261024-YYvz4 from baseline 0c3155d. Copied the main implementation's entire 21-file extension directory into it at 16:25:27 and retained SHA-256 source/copied hashes in that worktree's parallel-snapshot.json. The next implementer works only in the second worktree, applying the owner-authored final user-decision delta. Main code is not overwritten or concurrently edited.

To avoid unsafe last-minute cherry-picking of live files, the complete second worktree becomes the candidate after its scoped fixes and tests. It contains the main implementation snapshot plus isolated privacy/UI/runtime amendments. Fresh independent verification must inspect this exact complete candidate and the snapshot provenance, not a mixed collection of files. No Git commit or merge is authorized. Both worktrees are retained for follow-up.

Coordinator owns the boundary, resource checks, and records—not product edits. Extra lightweight agents may inspect documentation in parallel, but tests/build/browser heavy stages remain serialized until current process families have ended.
