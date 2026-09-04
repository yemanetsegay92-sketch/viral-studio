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
