---
status: draft
updated: 2026-10-24
---

# Manus interview tasks

Each numbered task has its own folder, containing `architecture/architecture.md` and `plans/plan.md`. The number follows the supplied screenshot. Folder 1 uses the user's requested spelling, **1 - desktop voice actor**; its documents cover the screenshot's **Desktop voice input** task.

## Task documents

1. **1 - desktop voice actor** — [Architecture](1%20-%20desktop%20voice%20actor/architecture/architecture.md) · [Plan](1%20-%20desktop%20voice%20actor/plans/plan.md).
2. **2 - multiplayer web game** — [Architecture](2%20-%20multiplayer%20web%20game/architecture/architecture.md) · [Plan](2%20-%20multiplayer%20web%20game/plans/plan.md).
3. **3 - local harness with plugins** — [Architecture](3%20-%20local%20harness%20with%20plugins/architecture/architecture.md) · [Plan](3%20-%20local%20harness%20with%20plugins/plans/plan.md).
4. **4 - chrome agent extension with a side panel** — [Architecture](4%20-%20chrome%20agent%20extension%20with%20a%20side%20panel/architecture/architecture.md) · [Plan](4%20-%20chrome%20agent%20extension%20with%20a%20side%20panel/plans/plan.md).
5. **5 - mcp server terminal controller** — [Architecture](5%20-%20mcp%20server%20terminal%20controller/architecture/architecture.md) · [Plan](5%20-%20mcp%20server%20terminal%20controller/plans/plan.md).
6. **6 - p2p encrypted chat room** — [Architecture](6%20-%20p2p%20encrypted%20chat%20room/architecture/architecture.md) · [Plan](6%20-%20p2p%20encrypted%20chat%20room/plans/plan.md).
7. **7 - bring your own idea** — [Architecture-selection scaffold](7%20-%20bring%20your%20own%20idea/architecture/architecture.md) · [Conditional plan](7%20-%20bring%20your%20own%20idea/plans/plan.md).
8. **8 - product promo video** — [Production architecture](8%20-%20product%20promo%20video/architecture/architecture.md) · [Production plan](8%20-%20product%20promo%20video/plans/plan.md).

## Locations and status

The canonical collection is `C:\Users\wongn\Documents\Obsidian Vault\Interviews\Manus\Tasks`. A matching snapshot is provided in `C:\Users\wongn\Documents\Interview\Manus\tasks`. These are ordinary files, not an automatic synchronization service. Continue document edits in the Obsidian copies and refresh the workspace snapshot deliberately.

Only Desktop Voice Input had a detailed local brief. Tasks 2–8 are explicitly labeled proposals based on the supplied titles. Attach the full briefs and reconcile assumptions before implementation. Task 7 still needs an idea decision; Task 8 still needs a product/storyboard decision. All plans are drafts and their checkboxes are pending. No product was built, service started, test suite run, security audit performed, media generated or submission made.

The original first-task source file remains inside the renamed workspace folder `1 - desktop voice actor`. The original workspace folder `2-MultiplayerWebGame` was locked by another process during the rename, so it and its source file were left untouched. The numbered `2 - multiplayer web game` folder contains the requested documentation; inspect the existing working copy and its declarations before initializing or relocating an implementation project. No unrelated process was interrupted.

## Using the local agents

Start with the [workspace agent routing guide](C:/Users/wongn/Documents/Interview/Manus/AGENTS.md), [shared agent instructions and role links](C:/Users/wongn/Documents/Interview/Manus/outputs/manus-agents/README.md), and [exact task-folder registry](C:/Users/wongn/Documents/Interview/Manus/outputs/manus-agents/TASK-FOLDERS.md). These now resolve task numbers/titles directly to the folders linked above and require reading the existing architecture and plan first. The user does not need to repeat the destination path.

For example: “Read AGENTS.md and use om-feature to refine task 1's plan,” or “Use om-research for task 6's encryption design.” Research is saved beneath the selected task's `architecture/research/<work-item-key>/`; owner contracts and handoffs beneath `plans/runs/<work-item-key>/`; verifier reports beneath `plans/verification/<run-id>/`; coordination beneath `plans/coordination/<run-id>/`. The dispatch packet carries the resolved absolute paths and each role's distinct work-item/run ownership.

Ask the owner to reconcile drafts with the full brief and actual repository; use a separate implementation worker and fresh `om-verifier` for product work. Role names and document routing do not register Agent Profiles, start services, approve a draft or authorize external actions. Preserve existing notes, frozen contracts and active repositories.

For this task collection, retain the user-requested task-name layout: owner documents in the chosen task's `architecture` or `plans` folder, and verifier records in a unique subfolder beneath that task's `plans/verification/`. Explicitly include the chosen absolute task folder in dispatch packets. Keep product repositories, process ownership and documentation paths distinct. No implementation is requested by creating this collection.
