# Candidate file manifest — isolated grammar repair

**Candidate directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp`  
**Worktree HEAD:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Manifest source:** candidate `SHA256SUMS.txt` (SHA-256 `f212da6fec5232eddb436e01cfb83c9220f167f5d685a0ecbb0b0ba08b8251a3`)

| Relative file | Absolute path | SHA-256 | Bytes | Lines | Provenance |
|---|---|---|---:|---:|---|
| `Launch-VoiceMvp.cmd` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\Launch-VoiceMvp.cmd` | `5104684196d8205e543091ff22e1fcf36069f195df430cb3b56591f64c96f2c0` | 266 | 7 | unchanged canonical copy |
| `README.md` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\README.md` | `23e4e98a884064171fcfe4da0b7a3eae6f40289d0c8f5f96dc51ccb268f7ad23` | 6077 | 82 | updated root cause/regression/physical-test limitation |
| `SHA256SUMS.txt` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\SHA256SUMS.txt` | `f212da6fec5232eddb436e01cfb83c9220f167f5d685a0ecbb0b0ba08b8251a3` | 426 | 5 | recomputed candidate manifest; self-hash recorded here |
| `Test-VoiceMvpGrammar.ps1` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\Test-VoiceMvpGrammar.ps1` | `13341d92c28321ebac574b33146b3fc19cddf21b30a6f3c1f2a1680ef518894a` | 2871 | 57 | new fake-only baseline-red/candidate-green wrapper |
| `Test-VoiceMvpNoMic.ps1` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\Test-VoiceMvpNoMic.ps1` | `b9dca8c1c82cae8edcb942992ff5181cc771e6c7d505fcf5782a45f4dbd48514` | 726 | 9 | unchanged canonical copy |
| `VoiceMvp.ps1` | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\VoiceMvp.ps1` | `b43cfcfb5c9a7be7c7b9b5be1b37d0202b2a6961faa236667d9fe3d38eb90894` | 27300 | 619 | minimal grammar/load-order and stage-diagnostic repair |

## Changed files relative to canonical `mvp/`

- `mvp\VoiceMvp.ps1`: changed; exact source hash above. Changed ranges: 3–6, 106, 147–189, 364–375, 514–565, plus the `-GrammarSelfTest` dispatch immediately before the retained no-mic dispatch.
- `mvp\Test-VoiceMvpGrammar.ps1`: new; fake provider records baseline `engine-created>input-bound` red and candidate `engine-created>grammar-loaded>input-bound>recognition-started` green.
- `mvp\README.md`: changed at lines 40–71 and delivered-file list line 80.
- `mvp\SHA256SUMS.txt`: changed to include every delivered file except the self-referential manifest entry, including the new regression script.

`mvp\Launch-VoiceMvp.cmd` and `mvp\Test-VoiceMvpNoMic.ps1` are unchanged canonical copies. No dependency outside the candidate `mvp` folder was added.
