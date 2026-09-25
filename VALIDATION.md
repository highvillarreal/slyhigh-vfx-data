# Validation — 2026-09-23

## v0.2.8 — 2026-09-25

- `tests/attachments-028.cjs`, Chromium/Edge and WebKit: setup sharing across shots; separate same-name setups in different scenes; arbitrary multi-file import including unknown MIME, duplicate Unicode names and empty files; unchanged original download; reload/offline use; JSON backup originals; named ZIP download/share; missing-file export failure; batch abort rollback; WebKit byte fallback; delete cancel/failure/success; storage quota rejection; shot moves/deletion preserve setup assets; export with no remaining shots; complete project cleanup; ZIP size guard; traversal-safe filenames.
- `tests/verify-delivery.py`: independent Python ZIP decoder validates every CRC, archive path, file count, original byte identity, manifest association and PDF text/photos. Two setup inventories appear once each across all shots, including an empty setup after deleting its last shot.
- `tests/layout-027.cjs`: 192 layouts per engine pass, covering safe areas, nested overflow, long names, 30-shot vertical scrolling, fixed footer with stale body dimensions, keyboard restore, language settings and modal bounds. New screens checked at phone/tablet portrait and landscape sizes.
- `tests/ux-025.cjs` passes in both engines: camera/lens gate, named report download/share, deletion rollback and responsive footer. `tests/e2e.cjs` and `tests/edge-cases.cjs` pass in Chromium: capture/retry, metadata, measurements, equipment, offline, image tools, complete backup and deletion cleanup.
- Visually reviewed the setup attachment list and PDF inventory page. Real-device iOS storage/share limits for very large LiDAR files still depend on available device memory and storage; desktop WebKit is not a physical iPhone test.

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

## v0.2.5 — 2026-09-23

Passed ux-025.cjs in Chromium and WebKit: cannot create a shot with zero equipment or only a camera; returning from registration retains setup context; multiple cameras require explicit selection; created shots carry valid equipment IDs. Downloaded the actual generated PDF and asserted its suggested filename. Native sharing was stubbed to inspect the real File name/type/size. Confirmed that project PDF never calls window.print. Chromium generated a report after offline reload.

Checked 30 section/viewport combinations per engine, including iPhone portrait/landscape and iPad: footer bottom equals the visual viewport bottom, all four controls span the width, main content does not overlap the capture row, no horizontal overflow. Inspected the mobile footer screenshot. Physical iPhone standalone safe-area behavior still needs device verification; browser emulation cannot prove native chrome behavior.

Shot deletion tests cover cancel, deletion with media, deletion of the final shot and empty hierarchy, preservation of equipment, reload persistence and an intentionally aborted transaction that leaves the shot intact.

The downloaded two-page PDF was reopened with pypdf and rendered with PDFium. Verified project/date title, both shots, accented text, camera/lens values, photo, notes and page numbers. Inspected both rendered pages.

Updated and passed e2e.cjs, edge-cases.cjs and webkit.cjs, retaining capture retry, offline reload, backup, equipment unassignment and typed project-deletion coverage. ux-022.cjs and ux-021.cjs forward to the current UX suite.

## v0.2.6 — 2026-09-23

Replaced accumulated shell/footer overrides with layout.css. The previous shell failed a new regression test when a mocked visual viewport was 62 px shorter than the layout viewport without a keyboard. The new shell uses CSS dynamic viewport height and only uses the visual viewport during substantial keyboard occlusion. This test models the reported gap; it does not establish the user's actual device metrics.

Reproduced a second issue in WebKit at 320 px: a long lens option gave main a scrollWidth of 368 px even though the root had no overflow and the select's measured rectangle fit. Sizing the select's closed appearance removes that overflow while retaining the native picker. Inputs/grids also have explicit minimum-width constraints and wrapping for long labels.

Passed tests/layout-026.cjs in Chromium and WebKit: 192 page/size/language cases per engine across 12 portrait, landscape, phone, split-view and tablet sizes (320–1366 px). Injected safe areas include top 62, bottom 34 and landscape side 59 px. Assertions inspect the actual content scroller and child bounds, not only root width; verify footer bounds and compact height; reach the final item in a 30-shot list; preserve list position after opening a shot and returning; test long unbroken values, keyboard sizing/restoration, pinch-zoom distinction and short-window modal bounds. Visually inspected phone list and editor screenshots with simulated safe areas.

Passed ux-025.cjs in both engines, including equipment gating, named PDF download/share, shot deletion/cancel/transaction rollback and offline PDF generation in Chromium. Passed e2e.cjs for capture, forms, state, inheritance, tools and offline reload. No changes to PDF generation or equipment flow.

These are desktop browser engine tests with simulated sizes/insets/keyboard. Physical iPhone/iPad standalone behavior, system keyboard and native picker still require device verification.

## v0.2.7 — Physique OS reference and app settings

Inspected highvillarreal/physique-os index.html and styles.css and verified the published Physique OS stylesheet matches its main branch. Its viewport and Apple status-bar metadata match VFX Tools; the relevant layout difference is natural document scrolling plus position:fixed bottom navigation, without a fixed-height app shell. Adopted that pattern while preserving VFX Tools styling, safe insets, native selectors and responsive content widths. Updated navigation and language switching to restore window scroll positions.

Passed layout-027.cjs in WebKit and Chromium: 192 layout/language cases per engine, long labels, 30-shot lists, back-navigation scroll restoration, safe areas, keyboard visibility and pinch-zoom distinction, landscape dialogs. A fault-injection case constrains body height to 812 px inside an 874 px viewport: navigation still ends at 874 before and after a persisted pageshow event, without orientation changes. This verifies independence from the body height, not the physical iOS compositor.

Language is absent from the persistent header and available through Projects → App settings even with no projects. Tests switch English/System, check persistence across reload and ensure system uses es-MX in that test context. Screen diagnostics copy was stubbed and checked for build, bounded viewport samples and absence of fixture project/equipment names.

Passed ux-025.cjs in both engines and e2e.cjs in Chromium, preserving PDF, equipment gating, shot deletion, capture and offline flows. Inspected mobile list/editor screenshots. Physical iPhone standalone launch/resume still requires user verification; no claim that desktop emulation reproduces the native startup bug. layout-026.cjs now forwards to the current layout suite.
