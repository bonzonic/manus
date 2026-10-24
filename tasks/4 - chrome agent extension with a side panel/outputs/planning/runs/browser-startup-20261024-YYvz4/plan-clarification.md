# Plan clarification — startup criterion and neutral identity

**Date:** 2026-10-24  
**Work item:** `browser-startup-20261024-YYvz4`  
**Change type:** dated clarification; does not rewrite the frozen startup root-cause contract.

## Superseded literal

The inherited startup plan's candidate heading expectation, **`Supervised Shopee helper`**, is superseded for the common product flow by the generic owner/user-steering identity **`Browser Task Agent`**. This is the only startup-plan criterion amended by this clarification. The optional Shopee adapter may remain named in adapter-specific code or fixtures, but it is not the common product identity.

## Behavioral criterion unchanged

The change-defining check remains binary and native:

- Load the prepared candidate as an unpacked MV3 extension in a fresh synthetic Chrome profile.
- Use a supported native toolbar action route.
- Verify that the actual Chrome native Side Panel opens and renders the packaged panel.
- Verify the neutral visible heading **`Browser Task Agent`** in that native panel.
- Do not count `panel.html` opened as an ordinary extension tab.
- Do not infer native success from source scans, Side Panel API state, fixture behavior, or a screenshot of an extension tab.

The startup root cause is unchanged: the old worker click handler awaits `sidePanel.setOptions()` before `sidePanel.open()` and swallows the resulting failure. The implementer must still use the official toolbar behavior API or preserve the direct user gesture for `open()` without an awaited API before it.

## Relationship to the generic contract

This clarification joins the startup defect contract to `browser-general-20261024-YYvz4` only for the literal common-flow identity. The generic contract still owns neutral naming, ordinary HTTP(S) selected-tab grounding, bounded rendered controls, privacy/model boundaries, and optional adapter separation. The startup owner still owns native worker/action/Side Panel behavior and must not duplicate generic-browser implementation work.

## Runtime limitation recorded

Puppeteer `24.26.1` and bundled CFT `141.0.7390.122` were inspected. No documented Puppeteer `extension.action`, `triggerAction`, or native browser-toolbar click capability exists. The isolated CFT probe failed before exposing a service-worker target, so native toolbar and Side Panel behavior remain **NOT RUN**. This clarification does not convert that limitation into a pass or a baseline red result.
