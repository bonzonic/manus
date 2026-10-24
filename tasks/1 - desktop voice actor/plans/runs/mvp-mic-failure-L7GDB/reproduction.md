# Reproduction and evidence request

## Current reproduction status

The incident is **not reproducible from retained evidence** because the report omits the exact UI error and Start/Listening state. The prior verification did not start a real session; its `PASS_NO_MIC_MVP_SMOKE` verdict is not a microphone pass.

## Safe cold-start reproduction packet for the reporter

This is a user-started manual diagnostic only; the investigator must not start the live microphone session on the reporter's behalf.

1. Open `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30\Launch-VoiceMvp.cmd` and wait for the window to show `Idle`.
2. Record the selected installed language text. Do not change the default Windows device or any permission for this diagnostic.
3. Click **Start once**. If the status becomes `Listening`, say one short test phrase, click **Stop**, and report the final visible status and whether any transcript appeared. Do not provide the phrase/audio.
4. If the status becomes `Error`, record the **complete visible error text exactly**, including any exception text/HRESULT, and do not retry. A screenshot of only the app window is acceptable if copying text is inconvenient; redact unrelated personal content.
5. Close the window normally. Do not use `Cancel` or change system settings unless separately authorized.

## Expected versus actual

- **Expected:** after explicit Start, status `Listening - microphone is open only because Start was clicked.`; after Stop, `Ready` with recognizer-produced text or a visible no-hypothesis notice.
- **Actual reported:** reporter could not say anything because the app “didn't manage to detect my mic.” Exact state, error, and whether Start was clicked are missing.

## Minimum question to resolve the defect

What exact text did the app show immediately after the one Start click: did it remain `Starting`, reach `Listening`, or show `Error - ...`? Please provide the full visible message/screenshot, with no audio or transcript content.
