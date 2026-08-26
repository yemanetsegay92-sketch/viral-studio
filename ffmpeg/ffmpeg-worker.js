/*
============================================================
VIRAL — FFMPEG SAME-ORIGIN WORKER
============================================================
This file allows the FFmpeg browser wrapper to create its
Worker from our own Vercel origin instead of directly from
jsDelivr.
============================================================
*/

importScripts(
    "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js"
);