# Desktop Voice Input — Offline English MVP

A small Windows desktop prototype for speaking English, reviewing the resulting text and copying it into another application yourself.

> **Current build status:** the original ZIP has a confirmed startup bug: recognition is started without a loaded grammar. Its error incorrectly suggests a microphone problem. A narrow repair and regression test are in progress. **Wait for the repaired bundle before using this as a working dictation tool.** The original no-microphone smoke checks did not prove live recognition. See the [repair contract](plans/runs/mvp-mic-failure-L7GDB/grammar-fix-contract.md) and [progress record](coordination.md).

## What this version includes

- One window with **Start**, **Stop**, **Cancel**, **Copy** and **Clear**.
- English (`en-US`) recognition through the installed Windows SAPI / .NET Framework `System.Speech` engine.
- A text box for reviewing and editing the transcript.
- Best-effort live preview when the recognizer supplies hypotheses.
- Local processing with no application cloud/API calls or model downloads.

This is an **experimental PowerShell/WPF launcher**, not a signed installer or the complete planned desktop input method. Global hotkeys, tray/overlay, automatic insertion, bilingual Paraformer and accuracy/latency certification are deferred.

## Requirements

Use a Windows PC with:

1. **Windows PowerShell 5.1** and WPF available. Use `powershell.exe`, not PowerShell 7's `pwsh`.
2. The .NET Framework `System.Speech` assembly and an installed English (`en-US`) SAPI recognition engine. The development computer has this engine; other computers may not.
3. A working default microphone/input device and microphone permission when you choose to record.

You do **not** need the downloaded .NET 10 SDK, an Azure account, an API key, Python, Node.js or a paid recognition subscription for this MVP.

## Download

### From this task on the current computer

The original [Desktop-Voice-English-MVP.zip](outputs/Desktop-Voice-English-MVP.zip) is available, but it is the **known-bug build described above**. Do not mistake it for the upcoming repaired version.

When a verified repaired ZIP is delivered:

1. Download it and choose **Extract All** in File Explorer.
2. Open the extracted folder.
3. Keep the launcher, script, tests, README and checksum file together. Do not download or move the `.cmd` launcher by itself: it needs `VoiceMvp.ps1` next to it.
4. Double-click `Launch-VoiceMvp.cmd`.

The Git-trackable source folder is [`mvp/`](mvp/README.md). The existing local folder can be opened directly without downloading a ZIP, once its repaired source has been promoted.

### From GitHub, after the source is pushed

No GitHub upload, public release or push has been performed as part of this task. When this repository is available on GitHub:

1. Open its repository page.
2. Choose **Code → Download ZIP**, or clone it with Git.
3. Extract the repository.
4. Open `tasks/1 - desktop voice actor/mvp/`.
5. Double-click `Launch-VoiceMvp.cmd`.

The `mvp/` source files are not ignored. The `outputs/` ZIPs and `.work/` development caches **are ignored**, so a local bundle link is not a GitHub Release download. A release ZIP must be uploaded separately if you want a GitHub Releases download.

## Launch from PowerShell

After opening the `mvp/` folder in a terminal:

```powershell
.\Launch-VoiceMvp.cmd
```

Or run the script directly:

```powershell
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1
```

The launcher uses a process-only execution-policy flag; it does not change machine or user policy. If administrator or application-control policy blocks the launcher, do not disable security controls to get around it. Ask the administrator or report the exact error.

The app is designed to open **Idle**, without opening a microphone until you click Start.

## How to use it — expected flow after the repair

1. **Start:** click Start when you are ready. This is the only action that opens the default microphone and starts recognition.
2. **Speak:** say a short English sentence in a quiet environment. For example: “Please send the draft tomorrow morning.” This is an example to try, not a recorded or verified recognition result.
3. **Stop:** click Stop when finished. Allow finalization to complete before starting another session.
4. **Review:** read the transcript and correct mistakes in the text box.
5. **Copy:** click Copy, switch to the application you want and paste manually.

A session is limited to **30 seconds**; Stop finalization is bounded to **10 seconds**. Live preview is best effort, not guaranteed.

| Control | Expected behavior |
|---|---|
| Start | Start a new user-initiated recognition session using the default input device. |
| Stop | Stop listening and finalize the current session. |
| Cancel | Discard the current session and ignore its late callbacks. |
| Copy | Copy reviewed text only after your explicit click; no automatic paste. |
| Clear | Clear review text when no session is active. |
| Close window | Cancel/dispose an active session and exit; no background service is intended to remain. |

## Privacy

The application is designed to keep recognition text in memory and not save audio, transcript/history files, app telemetry or model-training data. It makes no application network/API calls and performs no automatic cross-application typing or paste.

**Copy places text on the Windows clipboard**, outside the app's private review field. Only click it when you intend to copy the text. Pasting into another app is your action.

Automated checks have not recorded audio. Real microphone access, speech quality, live Stop/Cancel, permissions and latency require a user-started test. No quality or bilingual guarantee is made.

## Troubleshooting

### “At least one grammar must be loaded before doing a recognition”

This is the confirmed application startup defect in the original bundle, not evidence that your microphone is missing. Wait for the grammar-fixed build; changing microphone permissions or the default device does not repair this code omission.

### A different microphone or permission error

First capture the exact visible error and whether the app reached **Listening**. Check whether the same microphone works in another app or moves the input meter in **Windows Settings → System → Sound → Input**. Do not assume that installed speech-engine metadata proves microphone access.

### Listening, but no transcript appears

Check the selected English language, default input and input-level meter. Report the exact state and whether you see a live preview or a final result after Stop. Recognition accuracy and event-handling behavior are not yet established by a no-microphone smoke pass.

### Launcher opens and immediately exits

Run the PowerShell command above from the extracted folder so you can see the error. Check that all files stayed together and Windows PowerShell 5.1 is being used. Do not work around a policy denial or install unrelated packages blindly.

## Safe checks that do not use the microphone

From the `mvp/` folder:

```powershell
# Simulated lifecycle/fence checks; no real microphone or clipboard writes
.\Launch-VoiceMvp.cmd -NoMicSelfTest

# Existing test wrapper
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-VoiceMvpNoMic.ps1

# Auto-closing idle-window check; Start is not clicked
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -IdleSmoke
```

Expected markers for the original safe checks include `NO_MIC_SELFTEST PASS`, `clipboard-calls=0` and `IDLE_SMOKE PASS phase=Idle`. These checks validate only their limited scope. The grammar repair must add a startup-order regression; no simulated test proves actual speech recognition.

## Source files and Git

```text
mvp/
├── VoiceMvp.ps1             # Application source and safe self-test entry point
├── Launch-VoiceMvp.cmd      # Windows PowerShell 5.1 launcher
├── Test-VoiceMvpNoMic.ps1    # Existing safe test wrapper
├── README.md               # Bundle-specific instructions and limitations
└── SHA256SUMS.txt           # Fingerprints for the matching delivered files
```

The repaired version may add its focused grammar regression file. Keep all files from a given bundle together and do not mix the original checksum manifest with repaired scripts.

From the repository root (`C:\Users\wongn\Documents\Interview\Manus`), these files can be staged normally:

```powershell
git add -- "tasks/1 - desktop voice actor/mvp" "tasks/1 - desktop voice actor/readme.md"
git diff --cached --stat
```

These are instructions, not actions already performed. No force-add, commit or push has been performed here. Do not stage `.work/`, SDK/model downloads, recordings, private content or temporary tool files.

For the future full product, see the [architecture](research.md), [scope decisions](decision.md) and [implementation plan](implementation-plan.md).
