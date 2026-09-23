# VFX Tools

Offline-first acquisition for VFX on set. This mobile redesign builds on stable v0.1 (`0527a11`) and keeps its client-side architecture and existing data.

## Run

Serve this directory over HTTP on localhost, or deploy the static files over HTTPS. There is no install or build step and no runtime dependency. Open `index.html` through the server, not `file://`. After the first successful load, the service worker caches the application for offline use.

## What changed

- Full-screen navigation for projects, shots, equipment, measurements and capture cataloging.
- Large current take, inline camera-state autosave and a persistent capture control within thumb reach.
- New shots inherit camera state by default, with an explicit source UUID and per-field provenance.
- Camera, lens, gamma, FPS, white balance, shutter, ND and movement presets, plus custom values.
- Photo/video and metadata commit in one IndexedDB transaction before cataloging. Failed captures remain available for retry or file download.
- Per-take notes, structured measurements and additive SI normalization.
- Safe project deletion with a typed code; equipment deletion unassigns every shot reference.
- Green/blue screen assets, tracking patterns, PNG/share/fullscreen, printable markers, distortion grids and scale references.
- Reports print inside the same document. No pop-up windows.
- Metadata JSON, shot CSV and a JSON backup that embeds original media as data URLs.

## Data compatibility

The database stays `slyhigh-vfx-data`, version 1, with stores `kv` and `media`. Export schema stays `slyhigh.vfxdata` / `0.1.0`. Existing project/day/scene/setup/shot UUIDs and original fields remain intact. UI build version is separately `0.2.2`.

New optional fields include `inherited_from`, `cameraProvenance`, equipment `provenance`, `si`, `nd`, `sensorMode`, `nextMarkerId`, and timestamps. Media records normally retain the existing Blob representation; in storage contexts that reject Blob/File preparation, an optional `bytes` ArrayBuffer is used and reconstructed when read. Earlier plates and voice recordings remain accessible under Previous captures; this version does not offer new plate/audio recording workflows.

Deploy updates at the existing origin. Browser storage does not transfer between origins. The production URL and repository name do not need to change when the app's display name changes.

## Known limits

- The supplied banner and icon are used unchanged, including the PWA manifest, browser icon and Apple touch icon. Both are cached offline.
- Web Share, camera/Files handoff, standalone safe areas, system keyboard dictation and physical print scaling need final verification on an actual iPhone/iPad/printer. Browser emulation cannot prove these device behaviors.
- Backups embed media in a single JSON file and can use substantial memory for large video projects. They are portable data exports; a backup-import UI is outside this redesign.
- Generic lens families and cameras with mount/sensor variants intentionally leave ambiguous details empty. Preset gamma values are editable starting points, not observations of the camera's recording configuration.

See `DESIGN.md` for the experience system and `VALIDATION.md` for verified behavior.

## v0.2.1 refinements

The layout adapts to phone, iPad portrait/landscape and split view. Navigation fills the viewport with larger controls; the capture dock follows its measured height. Shot identity uses a slate-inspired arrangement and wider screens separate camera state from notes/capture. Camera and lens lists use separate columns on tablets.

Shot dates come from the device and live under a secondary disclosure. Correcting an existing date moves only that shot to the matching day/scene/setup, preserving its UUID and records. Shot types use native dropdowns while retaining multiple classifications.

Shutter supports angle or reciprocal seconds. The existing `camera.shutter` stays an angle; additive `shutterMode` and `shutterFraction` retain the chosen representation and denominator. FPS is required to convert between representations. If FPS changes, the selected unit stays fixed and its equivalent is recalculated. CSV includes explicit mode, fraction denominator and seconds.

Project PDF is the primary report and includes every shot across days/scenes/setups. Current-shot PDF remains a separate explicit action. Distortion grids are image assets with fullscreen, share and PNG export, including custom dimensions and uniform square cells.


## v0.2.2

VFX Tools uses the supplied new banner and app icon. Spanish and English follow the device language by default; the header selector stores an explicit preference locally. Translation happens only on interface strings before user data is interpolated. Equipment names, notes, identifiers and enum values stay intact.

New projects only ask for a name and operator; a unique code is generated internally. New shot immediately creates an editable slate with a unique sequential shot name, today's date and camera/context inherited from the previous shot. Scene and setup remain blank when no real context exists. Editing scene/setup moves only the current shot. Clearing inherited values preserves fields already entered by the operator. Type dropdowns have explicit add/remove controls. Capture is available once in the persistent dock.

Project reports include every shot, the brand banner, camera values, notes, measurements and reference photos. Image decoding finishes before printing; missing/unsupported images are explicitly labeled. Videos are listed with their take and caption and remain available in the original-media backup. Large reports flow across pages. The original database name and export schema remain unchanged.
