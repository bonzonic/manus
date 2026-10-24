# Source evidence for the desktop voice-input architecture

Retrieved 2026-10-24 through official documentation/source extraction. These excerpts support the [architecture](../research.md); they do not establish measured app compatibility, recognition quality, latency or product security. Three focused research units verified native integration, speech APIs and comparable UX, with a separate synthesis. The parent resolved current-runtime, microphone API and Azure real-time privacy gaps. The independent builder review is retained separately in [builder-review.md](builder-review.md).

## Global activation

Microsoft describes RegisterHotKey as:

> Defines a system-wide hot key.

The same page documents registration failure on conflicts, WM_HOTKEY delivery and the debugger-reserved F12 shortcut. This supports global activation and collision UI, not reliable key-release behavior for push-to-talk. The active-session Escape ownership/lifetime is our proposed interaction contract, not a provider guarantee. [1]

## UI Automation and input injection

Microsoft's TextPattern overview states:

> The TextPattern classes do not provide a means to insert or modify text.

The document describes read-only text ranges/selection and distinguishes TSF's context-aware input role. Use the control identity/caret evidence where available, not TextPattern or a whole-value assignment as a universal insertion operation. Exact availability in Notepad/Edge/VS Code is untested. [2]

Microsoft's SendInput page states:

> This function fails when it is blocked by UIPI.

It limits injection to equal/lower-integrity targets and explains that the return value/GetLastError does not identify UIPI as the cause. Event acceptance is not proof that the intended field mutated; the architecture therefore distinguishes InputSent from verified insertion and requires independent target-content observations in acceptance. [3]

## Clipboard limitations

Microsoft documents one-at-a-time clipboard access, ownership, multiple formats and delayed rendering dependent on the original owner. Restoring copied values cannot promise to restore the original owner or arbitrary private/delayed-rendered behavior. The architecture avoids routine clipboard use and defers automatic clipboard-assisted paste; manual Copy is an explicit mutation. [4]

## Azure streaming and language support

Azure's speech overview describes:

> Real-time speech to text: Instant transcription with intermediate results for live audio inputs.

The continuous-recognition guide identifies `recognizing` as intermediate results and `recognized` as final recognition results. A product utterance may contain several finalized segments; our adapter must aggregate them after Stop rather than insert on the first segment. [5] [6]

Azure's locale table lists `en-US` and `zh-CN`, with support varying by functionality. Multilingual refinement is documented as public preview with limitations, including phrase-list restrictions in the referenced guide. These facts do not prove same-utterance code-switching accuracy. Azure is the sole proposed initial adapter, with a hard bilingual B0 gate; preview-only dependencies or a vendor change return for approval. [6] [7]

## Azure real-time data handling

The privacy page, last updated 2026-08-26, states:

> For real-time speech to text, audio input is processed only on the Azure's server memory, and no data is stored at rest.

It also states:

> When doing real-time speech to text, fast transcription, pronunciation assessment, and speech translation, Microsoft does not retain or store the data provided by customers.

The page says data in transit is encrypted and contrasts customer-controlled storage for batch transcription. Our claim is restricted to this documented real-time mode, not custom training, batch uploads, optional logging, clipboard managers, OS dumps or all provider contracts/features. Actual Azure resource/region configuration must still be reviewed before live use. Cancellation cannot recall already-transmitted audio. [8]

## Alternative speech provider

OpenAI's current Realtime guide states:

> The recommended model returns transcript deltas as speech arrives and a final transcript when your application commits each audio turn.

It describes delay/quality trade-offs and asks for representative microphone/accent/noise/code-switch testing. This is evidence of documented lifecycle and evaluation guidance, not benchmark superiority. OpenAI is a researched alternative only; a live challenger evaluation or vendor switch is not approved by the current Azure-only proposal. [9]

## Runtime and microphone dependency

Microsoft's .NET support page, updated 2026-10-13, lists .NET 10 as active LTS, latest listed patch 10.0.13, and support through 2028-11-14. .NET 8/9 are listed through 2026-11-10. It notes self-contained deployments are responsible for updating their bundled runtime. The proposal selects net10.0-windows; package restore/build and actual SDK presence remain implementation checks. [10]

NAudio's current repository describes NAudio 3's minimum target as net9.0 and focused packages including NAudio.Wasapi, under MIT licensing. The WasapiRecorder guide identifies it as the recommended modern WASAPI capture API. Its DataAvailable buffer span is valid only during the callback; the async capture path owns a heap copy. The guide documents microphone/default-device selection, shared-mode format requests, cancellation stopping capture and asynchronous disposal. We use bounded copied/leased microphone frames, not recording to a file or speaker loopback. No NAudio/Azure package compatibility or capture latency was measured. [11] [12]

## Comparable product affordances

Windows voice typing documents Windows+H activation, a cursor in a text box, internet/microphone requirements, language options, automatic punctuation and microphone troubleshooting. Its guide says:

> Voice typing uses online speech recognition, which is powered by Azure Speech services.

This supports the shortcut-to-text-box interaction as prior art, not the proposed app's compatibility or quality. [13]

Superwhisper documents modes separating language, voice model and AI processing:

> Modes decide what happens to your dictation. Learn the per-mode settings for language, voice model, AI processing, and auto-activation.

We adopt separation of faithful recognition from optional writing modes. No comparable application was launched or tested, and no marketing “any app” statement is treated as acceptance evidence. [14]

## References

[1]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey "Microsoft RegisterHotKey API"
[2]: https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-textpattern-overview "Microsoft UI Automation TextPattern"
[3]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput "Microsoft SendInput and UIPI"
[4]: https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-operations "Microsoft clipboard ownership and delayed rendering"
[5]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-to-text "Azure real-time speech overview"
[6]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech "Azure intermediate final events and refinement"
[7]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support "Azure supported locales and functionality"
[8]: https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security "Azure real-time speech data privacy"
[9]: https://platform.openai.com/docs/guides/realtime-transcription "OpenAI Realtime transcription"
[10]: https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core ".NET current lifecycle and self-contained servicing"
[11]: https://github.com/naudio/naudio "NAudio current packages targets and license"
[12]: https://github.com/naudio/NAudio/blob/main/Docs/WasapiRecorder.md "NAudio WasapiRecorder capture and buffer lifecycle"
[13]: https://support.microsoft.com/en-us/accessibility/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc "Windows voice typing product guide"
[14]: https://superwhisper.com/docs/modes/modes "Superwhisper optional mode separation"
