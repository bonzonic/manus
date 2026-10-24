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

All five roles must produce their documents under `C:\Users\wongn\Documents\Obsidian Vault\Interviews\Manus`. This user-selected destination overrides older vault paths, repository-local document defaults, and output locations in inherited prompts unless the user explicitly requests another destination. Read the shared guide's Document destination section for the per-task layout and collision rules. Agent definitions and product code stay in their existing locations.

The parent/coordinator assigns the absolute task-document folder before dispatch and includes it in every handoff. Coordination records use their own `coordination/<task-key>/` folder; each child retains its distinct feature/task/research folder and parent linkage. Verification of a feature or defect uses that child's same task folder with a unique verifier-owned subfolder. If the destination cannot be written, report the access blocker; do not silently deliver somewhere else.

## Role separation

Feature/task ownership, implementation, and verification are distinct responsibilities. The owner writes the contract; Codex or a separate implementation agent writes product code; a fresh `om-verifier` judges it. Neither owner nor implementation agent may substitute its own approval for independent verification. If a required participant or capability is unavailable, return the blocker rather than collapse the roles.

When dispatching, include the complete role instructions and shared safeguards, the exact repository and task, baseline/target commits, acceptance criteria or reproduction steps, permitted operations, unique evidence paths, time budget, and expected output. A role label alone does not configure a subagent. Keep the owner informed and wait for the independent verifier's final result before shipping. Subagents report questions to the parent, which handles user decisions.

## Coordination and load

Use `om-coordinator` when the request needs orchestrated stages or multiple independent feature slices. It owns intake, durable queue state, stage joins, resource admission and user steering, not product investigation, implementation or grading. Keep one owner per slice across the arc and exactly one dispatcher per stage. Require fresh independent verification for every feature/defect; no trivial-tier bypass.

Check device-wide CPU and memory before dispatch and before descendant builds, implementation attempts and verification. Follow the coordinator's compatible-gate or conservative Windows fallback policy; account for process families and the user's work, not just owner count. Queue under pressure or unknown telemetry, preserve priority/dependencies, serialize conflicting environments/review writes, and release only task-owned resources. Multiple lightweight owners may run while heavy stages wait. This setup does not start monitoring or dispatch actual work.

No task is assigned by this setup. Creating these files is not authorization to open or push a review, merge, deploy, change production, or run unattended watchers.
