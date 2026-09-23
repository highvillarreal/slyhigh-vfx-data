# Validation — 2026-09-23

Base: stable v0.1 commit `0527a11d0da82f2f90714833136734df6e7fa030`.

## Automated browser checks passed

Chromium (Microsoft Edge) and WebKit 26.5, mobile viewport 393 × 852:

- Empty-state project creation and accent/punctuation normalization of project codes.
- Camera and lens presets, editable assigned values and library persistence.
- Shot creation, camera/lens assignment, 23.976 decimal FPS and exposure fields.
- Visible take increment, per-take note persistence and inheritance of camera state only.
- New shot starts at take 1 with no notes/media/measurements; inherited UUID retained.
- Feet-to-SI measurement conversion and automatic take association.
- Capture storage before GENERAL cataloging, then tag/note updates.
- Reload persistence.
- Offline reload: Chromium context network disabled; WebKit local HTTP server stopped after service-worker activation. Both continued displaying saved data.
- Screen asset canvas, fullscreen fallback and PNG download.
- Tracking and distortion print DOM without opening a window.
- Used-camera deletion unassigns both shots and preserves focal values.

Additional Chromium checks:

- Custom 27.5 FPS; inheritance switched off; Back restores the prior shot context.
- Deliberately aborted media transaction creates no dangling reference; Retry commits successfully.
- 10 screens at 320, 375, 393, 430, 768 and 1440 px: no horizontal overflow.
- Four 200 mm markers produce four A4 PDF pages; IDs and page dimensions checked, first page visually inspected.
- Backup includes original media payloads.
- Project deletion stays disabled until the exact code is entered, then removes project and media records.
- No unexpected page errors in successful suites.

## Scope of device validation

WebKit testing is engine-level automation on Windows, not a physical iPhone. Camera launch choice, native sharing/AirDrop, installed-PWA chrome and safe areas, keyboard dictation, haptics and actual printed scale still require device checks. iOS does not expose vibration on all devices; the visual take animation and status announcement remain available.

The test runner's synthetic WebKit `setOffline(true)` navigation produced an internal engine error. The offline behavior was therefore verified by actually stopping the local HTTP server, with the service worker already active.

## Reproduce

Run the app through a localhost HTTP server on port 4173. With Node.js and Playwright installed, run `node tests/e2e.cjs`, then `node tests/edge-cases.cjs`. These use an isolated browser context and sample production data, never your normal browser profile. Use `BROWSER_CHANNEL=msedge` where only Edge is installed, or configure the browser launcher for your CI environment.

`tests/webkit.cjs` starts its own temporary local server on port 4180 to test a genuine unavailable-network-origin scenario. Its browser binary must be installed with Playwright.

## v0.2.1 validation

Passed `tests/ux-021.cjs` in Chromium and WebKit:

- Device date is prefilled but collapsed, shot code is first, and editing a date moves only the intended shot without changing its UUID or losing records.
- Native dropdowns preserve multiple shot types.
- Shutter conversions include 24 fps / 180° = 1/48 s, 1/60 s = 144° at 24 fps, and 23.976 fps / 180° = 1/47.952 s. Mode switching refuses a conversion when FPS is missing, preserving the entered value. Fractions inherit and reload correctly.
- A report fixture spanning different days/scenes includes all three shots and their unique notes; generated PDF text was inspected. Explicit current-shot export contains just the active shot and does not change selection.
- Distortion PNG dimensions, custom square output, fullscreen and the native-share call payload pass. Physical sharing remains a device check.
- Seven viewport/orientation combinations from 320 × 740 through 1366 × 1024 show no horizontal overflow across Shoot, Shot, Library, New Shot, Tools and Distortion. Navigation spans the viewport and is at least 90 px high; tablet shot panes split into two columns. Banner loads at every size.
- Original end-to-end acquisition and offline suites continue to pass. New public build is 0.2.1; schema and database versions remain unchanged.

## v0.2.2 — verified 2026-09-23

Passed the updated e2e.cjs, edge-cases.cjs and webkit.cjs suites. Passed ux-022.cjs in both Chromium and WebKit.

New coverage: es-MX/en-US automatic language selection, ES/EN/System switching and reload persistence; in-progress form preservation; literal project/operator/notes that match interface labels; automatic internal project code; direct editable shot creation and reparenting; add/remove type labels without empty stored enums; inherited-value clearing preserves user edits; no duplicate capture button; angle/fraction switching; device date correction; two-shot branded PDF with one file-backed image and one ArrayBuffer-backed image; print waits for decoded images; user HTML remains escaped; all seven iPhone/iPad widths from 320 to 1366 px remain free of horizontal overflow.

Rendered and visually inspected the final two-page A4 report, including both shots and all reference images. White paper, intact logo and readable transparent references verified. Updated icon dimensions: 768 × 768 PNG. Banner: 1004 × 192 PNG. Supplied assets are copied unchanged.

Run from repository root with a server on port 4173. Set PLAYWRIGHT_MODULE if Playwright is installed outside node_modules and BROWSER_CHANNEL=msedge for Edge. Run node tests/e2e.cjs before node tests/edge-cases.cjs (the latter uses the former's fixture). node tests/webkit.cjs starts its own server on port 4180 and tests offline reload by stopping it. Run node tests/ux-022.cjs, optionally TEST_ENGINE=webkit. ux-021.cjs forwards to the current UX suite. Physical iPhone/iPad camera, sharing and printing still need device testing.
