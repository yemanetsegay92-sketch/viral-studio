# 🎬 VIRAL

## AI Amharic Short Studio

VIRAL is a web application designed to transform legally reusable short-film scenes into engaging Amharic short-form videos.

---

## V1

The first version provides:

- Video upload
- Video preview
- Scene selection
- 30–45 second duration validation
- AI analysis interface
- Amharic narration interface
- Subtitle preparation

---

## Roadmap

### V1
Upload → Trim → Analyze

### V2
Real AI video/scene analysis

### V3
Amharic storytelling generation

### V4
Amharic AI voice

### V5
Automatic subtitles

### V6
9:16 vertical video rendering

### V7
Open-license film discovery

### V8
Human approval workflow

### V9
Publishing automation

---

## Copyright

Only use videos that you have permission to use.

The system should record:

- Original title
- Original source
- License
- Attribution requirements
- Source URL
- Selected section

for every imported film.

---

## Project

VIRAL

AI Amharic Short Studio
## 2026-09-02 FFmpeg test fix

The Smart Crop FFmpeg test in `studio.html` was using the old FFmpeg.js API (`createFFmpeg`, `FS`, `run`) while the bundled local library is the modern `@ffmpeg/ffmpeg` 0.12-style API exposed as `window.FFmpegWASM.FFmpeg`.

The test now uses the same API as `js/renderer.js`: `new FFmpeg()`, `load()`, `writeFile()`, `exec()`, and `readFile()`. Smart Crop coordinates are still passed to FFmpeg as the crop filter.

## Final integrated build — 2026-09-02

This build is the production-oriented version, not a Smart Crop test page.

- Scene selection extracts representative frames and displays them in the Scene Analysis area.
- The same local frame extraction remains available to the optional Vision AI analysis path.
- Smart Crop is integrated into the final renderer.
- Smart Crop coordinates are validated, cropped in original-video pixels, then scaled to 1080x1920.
- If Smart Crop cannot produce a valid rectangle, rendering automatically falls back to the normal center crop.
- The renderer uses the bundled modern FFmpegWASM API (`window.FFmpegWASM.FFmpeg`).
- The old `createFFmpeg()` Smart Crop test page has been removed.

## VIRAL V6 — Logo + Subtitle Controls

Added while preserving the V5 renderer pipeline:
- Optional logo/watermark image overlay (PNG/JPEG/WebP)
- Logo position: top-left, top-right, bottom-left, bottom-right
- Logo size and opacity controls
- Subtitle position: top, middle, bottom
- Subtitle text color control
- Existing subtitle styles and size control remain
- Existing Smart Crop, audio modes, volume controls, narration upload, URL importer, and local FFmpeg rendering remain
- Narration accepts common browser audio formats; FFmpeg normalizes/resamples audio during final render

No paid rendering service is required.

## V7 — Character Voice Studio

V7 builds on V6 without removing the existing FFmpeg, Smart Crop, logo, subtitle, source-importer, or audio-choice systems.

### New feature
- One approved Amharic recording can be split using the subtitle timings.
- Each subtitle line can use one of 10 local FFmpeg voice styles:
  Narrator, Deep, Child, High, Old, Robot, Echo, Funny, Strong, Soft.
- The processed segments are joined back into one narration track before the existing audio mix.
- Original sound + character-style narration remains supported.
- No paid voice API is required for these effects.

### Important limitation
These are local voice *styles/effects*, not identity cloning of another real person. Best results come when the single recording follows the same timing as the subtitle segments.

## V10 — Vercel compressed WASM build

- Includes the V9 manual output selector: TikTok / YouTube Shorts 9:16 or YouTube 16:9.
- Includes `ffmpeg/ffmpeg-core.wasm.gz` instead of the uncompressed WASM.
- `renderer.js` loads the compressed WASM path.
- `vercel.json` sends `Content-Type: application/wasm` and `Content-Encoding: gzip` for the compressed WASM.
- The legacy `ffmpeg-old` WASM is removed to keep the repository small.
- FFmpeg JavaScript/core files and rendering functionality are otherwise preserved.


V11 — Scene Frame Export + Landscape Subtitle Fix
-------------------------------------------------
- Added Share Frames and Open Frames controls to the scene-frame gallery.
- Representative frames can be shared as image files using the browser/Android share sheet.
- Open Frames creates a simple full-screen gallery for manual saving.
- Fixed YouTube 16:9 subtitles: subtitle PNGs now use the full 1920×1080 canvas in landscape mode instead of a 1080px-wide canvas.
- Subtitle positioning and wrapping now adapt to the selected 9:16 or 16:9 output.
- 9:16 remains 1080×1920 with Smart Crop.
- 16:9 remains 1920×1080 with centered fill crop.
- FFmpeg and compressed WASM setup from V10 are preserved.

## Caption editor, drafts and fast export

- Choose **Add subtitles only** to caption an existing video without narration.
  The default keeps the original shape, uses the whole video, preserves the original
  audio at its original volume, and supports videos with no audio track. Audio is
  encoded to AAC in the exported MP4; video is re-encoded to burn in captions.
- Paste text, one caption per line, or import SRT. Estimated timing is weighted by
  word count; it does not transcribe or align speech automatically. Edit each
  caption's text and start/end times, or use the video playhead. Times are relative
  to the selected scene. Captions must be ordered, non-overlapping, and inside it.
- Preview captions while playing the scene. In narration mode, approved narration
  can play alongside it; character voice processing is heard in the final export.
- **Save draft** and debounced autosave use IndexedDB in the same browser and origin.
  Drafts include source video, narration, optional music/logo, text, caption timing,
  trim range, and export/style settings. Media are stored separately and only rewritten
  when changed. A draft is shown as saved only after its transaction completes.
  Reopen a saved draft from the project selector. Drafts are not cloud synced and
  clearing this browser's site data removes them. Storage errors retain the open project.
- **Fast** uses 720p, H.264 ultrafast / CRF 28; **High quality** uses 1080p,
  veryfast / CRF 23. Original-shape exports cap the shorter side without upscaling.
  Subtitle canvases match the export dimensions. Export supports cancellation, checks
  silent source media in mixed audio mode, and releases temporary FFmpeg files.
- One editor now owns subtitle generation/approval. The legacy demo story and
  subtitle modules are no longer loaded by the studio. Scene frames remain available;
  frame extraction is separate from optional AI voice generation.

Validation: `node --test tests/*.test.cjs` (7 checks). Also verified in headless
Chromium using the actual bundled FFmpeg.wasm: edited caption playback, draft
reload including video/voice/music/logo, subtitles-only MP4 with audio, silent
source export, cancellation and restart. Native FFmpeg checks covered 720p/1080p,
vertical/landscape output and mixed narration with timeline gaps. Exported MP4s
were inspected with ffprobe. A bundled OFL Ethiopic font supports caption graphics
without requiring a system font. Serve the project with the gzip headers
from `vercel.json` when testing FFmpeg in a browser.


### Floating timing preview

The source video automatically floats below the header when its original location
scrolls off screen. The same video element continues playing, with captions,
play/pause, a scene-relative clock, and a precise seek slider visible beside the
caption editor. Use **Use playhead** to capture start/end times. **Back to video**
returns to its original position, and the checkbox disables floating if preferred.
The player adapts to portrait video, small screens and the on-screen keyboard.
