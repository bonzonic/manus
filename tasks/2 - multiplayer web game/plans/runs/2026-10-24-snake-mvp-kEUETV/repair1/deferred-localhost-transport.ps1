$ErrorActionPreference = 'Stop'
$project = 'C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-repair-20261024-kEUETV\project'
Set-Location $project
# Parent-side only: run in an admitted environment that permits task-owned localhost sockets.
node --test test/transport/recovery-room-play-rematch.test.js
