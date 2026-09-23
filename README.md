# SLYHIGH VFX Tools

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

The database stays `slyhigh-vfx-data`, version 1, with stores `kv` and `media`. Export schema stays `slyhigh.vfxdata` / `0.1.0`. Existing project/day/scene/setup/shot UUIDs and original fields remain intact. UI build version is separately `0.2.0`.

New optional fields include `inherited_from`, `cameraProvenance`, equipment `provenance`, `si`, `nd`, `sensorMode`, `nextMarkerId`, and timestamps. Media records normally retain the existing Blob representation; in storage contexts that reject Blob/File preparation, an optional `bytes` ArrayBuffer is used and reconstructed when read. Earlier plates and voice recordings remain accessible under Previous captures; this version does not offer new plate/audio recording workflows.

Deploy updates at the existing origin. Browser storage does not transfer between origins. The production URL and repository name do not need to change when the app's display name changes.

## Known limits

- `assets/logo-mark.png` in the stable source is corrupt (PNG decoding fails). It is retained untouched for traceability but not displayed. The UI and SVG icon use a monochrome typographic brand until a valid official logo is supplied. No replacement symbol has been fabricated.
- Web Share, camera/Files handoff, standalone safe areas, system keyboard dictation and physical print scaling need final verification on an actual iPhone/printer. Browser emulation cannot prove these device behaviors.
- Backups embed media in a single JSON file and can use substantial memory for large video projects. They are portable data exports; a backup-import UI is outside this redesign.
- Generic lens families and cameras with mount/sensor variants intentionally leave ambiguous details empty. Preset gamma values are editable starting points, not observations of the camera's recording configuration.

See `DESIGN.md` for the experience system and `VALIDATION.md` for verified behavior.
