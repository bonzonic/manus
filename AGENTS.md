# Local Manus coding agents

This workspace has five reusable, file-based role definitions. Four are adapted from the existing `.claude/agents` definitions; `om-coordinator` follows the coordinator pattern in `.claude/skills/om-bug-loop/SKILL.md`. They are not registered Manus Agent Profiles, do not select a model or grant tools, and do not start background services. An agent must explicitly read its role and the shared guide; do not assume automatic discovery.

## Routing

| Role | Use for | Definition |
|---|---|---|
| `om-coordinator` | Orchestrate one or multiple feature/task owners through separate implementation and verification; queue stages according to device load | `outputs/manus-agents/om-coordinator.md` |
| `om-feature` | Missing capabilities, feature requests, UX polish | `outputs/manus-agents/om-feature.md` |
| `om-research` | Open product/design/architecture questions requiring evidence and a recommendation | `outputs/manus-agents/om-research.md` |
| `om-task` | Reproducible defects needing root-cause proof and a fix | `outputs/manus-agents/om-task.md` |
| `om-verifier` | Independent review and measurement of a feature or defect fix | `outputs/manus-agents/om-verifier.md` |

Read `outputs/manus-agents/README.md` and the selected role before starting. Read the target repository's own guidance as well. The `.claude` source files remain unchanged.

## Document destination

All five roles use `C:\Users\wongn\Documents\Obsidian Vault\Interviews\Manus\Tasks` as the canonical document root. Read the [exact task-folder registry](outputs/manus-agents/TASK-FOLDERS.md) and [Obsidian task index](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/README.md). A task number or unique title selects its existing folder; do not ask the user to supply the path again or invent a separate role-specific vault tree. This overrides older document defaults. Agent definitions and product repositories remain in their existing locations.

1. [1 - desktop voice actor](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/1%20-%20desktop%20voice%20actor/) — also resolves “desktop voice input.”
2. [2 - multiplayer web game](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/2%20-%20multiplayer%20web%20game/).
3. [3 - local harness with plugins](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/3%20-%20local%20harness%20with%20plugins/).
4. [4 - chrome agent extension with a side panel](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/4%20-%20chrome%20agent%20extension%20with%20a%20side%20panel/).
5. [5 - mcp server terminal controller](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/5%20-%20mcp%20server%20terminal%20controller/).
6. [6 - p2p encrypted chat room](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/6%20-%20p2p%20encrypted%20chat%20room/).
7. [7 - bring your own idea](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/7%20-%20bring%20your%20own%20idea/).
8. [8 - product promo video](C:/Users/wongn/Documents/Obsidian%20Vault/Interviews/Manus/Tasks/8%20-%20product%20promo%20video/).

Read the selected task's `architecture/architecture.md` and `plans/plan.md` before acting. Resolve and pass `TASK_DOCS_DIR`, `ARCH_DOCS_DIR`, `PLAN_DOCS_DIR` and the role-specific work-item/run paths in every handoff. Research lives in `architecture/research/<work-item-key>/`; owner contracts and handoffs in `plans/runs/<work-item-key>/`; independent verifier records in `plans/verification/<run-id>/`; coordinator records in `plans/coordination/<run-id>/`. Distinct slices share their mapped task folder but use distinct work-item/run namespaces. Preserve existing notes and frozen contracts, and serialize shared-document writes. If access is blocked, report it; a parent may save returned document text through the authorized permission flow at the exact destination, never silently elsewhere.

## Role separation

Feature/task ownership, implementation, and verification are distinct responsibilities. The owner writes the contract; Codex or a separate implementation agent writes product code; a fresh `om-verifier` judges it. Neither owner nor implementation agent may substitute its own approval for independent verification. If a required participant or capability is unavailable, return the blocker rather than collapse the roles.

When dispatching, include the complete role instructions and shared safeguards, the exact repository and task, baseline/target commits, acceptance criteria or reproduction steps, permitted operations, unique evidence paths, time budget, and expected output. A role label alone does not configure a subagent. Keep the owner informed and wait for the independent verifier's final result before shipping. Subagents report questions to the parent, which handles user decisions.

## Coordination and load

Use `om-coordinator` when the request needs orchestrated stages or multiple independent feature slices. It owns intake, durable queue state, stage joins, resource admission and user steering, not product investigation, implementation or grading. Keep one owner per slice across the arc and exactly one dispatcher per stage. Require fresh independent verification for every feature/defect; no trivial-tier bypass.

Check device-wide CPU and memory before dispatch and before descendant builds, implementation attempts and verification. Follow the coordinator's compatible-gate or conservative Windows fallback policy; account for process families and the user's work, not just owner count. Queue under pressure or unknown telemetry, preserve priority/dependencies, serialize conflicting environments/review writes, and release only task-owned resources. Multiple lightweight owners may run while heavy stages wait. This setup does not start monitoring or dispatch actual work.

No task is assigned by this setup. Creating these files is not authorization to open or push a review, merge, deploy, change production, or run unattended watchers.
