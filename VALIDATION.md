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
