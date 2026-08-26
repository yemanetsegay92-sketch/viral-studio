"use strict";

/*
============================================================
VIRAL — FINAL RENDERER
STEP 06

REAL LOCAL MP4 RENDERING

Pipeline:

Selected video
      +
Selected scene
      +
Approved voice
      +
Approved Amharic subtitles
      ↓
FFmpeg.wasm
      ↓
9:16 vertical
      ↓
H.264 MP4
      ↓
Final video

NO paid rendering API.
NO video upload to our server.

AI voice and recorded voice are treated identically:
both arrive as ViralProject.voiceBlob.
============================================================
*/

window.ViralRenderer = {

    initialized: false,

    ffmpeg: null,

    ffmpegLoaded: false,

    loadingFFmpeg: false,

    finalVideoBlob: null,

    finalVideoUrl: null,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.log(
            "🎬 VIRAL FINAL RENDERER READY"
        );

        this.setupEvents();

    },


    /*
    ========================================================
    EVENTS
    ========================================================
    */

    setupEvents: function () {

        const renderButton =
            document.getElementById(
                "renderVideoBtn"
            );

        if (renderButton) {

            renderButton.addEventListener(
                "click",
                () => {

                    this.render();

                }
            );

        }


        const downloadButton =
            document.getElementById(
                "downloadFinalVideoBtn"
            );

        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                () => {

                    this.downloadFinalVideo();

                }
            );

        }

    },


    /*
    ========================================================
    SHOW
    ========================================================
    */

    show: function () {

        const section =
            document.getElementById(
                "renderSection"
            );

        if (!section) {

            console.warn(
                "⚠️ renderSection not found."
            );

            return;

        }

        section.style.display =
            "block";

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    },


    /*
    ========================================================
    MAIN RENDER
    ========================================================
    */

    render: async function () {

        console.log(
            "🎬 FINAL MP4 RENDER STARTED"
        );


        try {

            /*
            =================================================
            VALIDATE PIPELINE
            =================================================
            */

            const videoFile =
                this.getVideoFile();


            if (!videoFile) {

                throw new Error(
                    "Please select a video first."
                );

            }


            const selection =
                this.getSelection();


            if (
                !selection ||
                selection.duration <= 0
            ) {

                throw new Error(
                    "Please select a valid scene."
                );

            }


            const project =
                window.ViralProject;


            if (
                !project ||
                !project.voiceBlob ||
                !project.voiceApproved
            ) {

                throw new Error(
                    "Please approve the narration voice first."
                );

            }


            if (
                !project.subtitles ||
                !project.subtitlesApproved
            ) {

                throw new Error(
                    "Please approve the subtitles first."
                );

            }


            /*
            =================================================
            DISABLE BUTTON
            =================================================
            */

            const renderButton =
                document.getElementById(
                    "renderVideoBtn"
                );

            if (renderButton) {

                renderButton.disabled =
                    true;

                renderButton.dataset.originalText =
                    renderButton.textContent;

                renderButton.textContent =
                    "🎬 Rendering...";

            }


            this.setProgress(
                5,
                "Preparing video..."
            );


            /*
            =================================================
            LOAD FFMPEG
            =================================================
            */

            await this.loadFFmpeg();


            /*
            =================================================
            WRITE INPUT VIDEO
            =================================================
            */

            this.setProgress(
                15,
                "Loading selected video..."
            );


            await this.ffmpeg.writeFile(
                "input-video",
                await this.fetchFile(
                    videoFile
                )
            );


            /*
            =================================================
            WRITE VOICE
            =================================================
            */

            this.setProgress(
                25,
                "Loading approved narration..."
            );


            const voiceExtension =
                this.getAudioExtension(
                    project.voiceBlob
                );


            await this.ffmpeg.writeFile(
                "voice" +
                voiceExtension,
                await this.fetchFile(
                    project.voiceBlob
                )
            );


            /*
            =================================================
            CREATE SUBTITLE IMAGE FILES
            =================================================

            We create subtitle PNGs in the browser.

            This is important for Amharic because the
            browser can render Ethiopic text correctly,
            while relying on an FFmpeg-installed font
            inside WebAssembly is unreliable.
            =================================================
            */

            this.setProgress(
                35,
                "Preparing Amharic subtitles..."
            );


            const subtitleFiles =
                await this.createSubtitleImages(
                    project.subtitles,
                    selection.duration
                );


            /*
            =================================================
            BUILD FILTER GRAPH
            =================================================
            */

            this.setProgress(
                45,
                "Building vertical video..."
            );


            const filterData =
                await this.buildFilterGraph(
                    project.subtitles,
                    subtitleFiles,
                    selection.duration
                );


            /*
            =================================================
            BUILD FFMPEG COMMAND
            =================================================
            */

            const args =
                this.buildFFmpegArguments(
                    selection,
                    voiceExtension,
                    subtitleFiles,
                    filterData
                );


            console.log(
                "🎬 FFMPEG COMMAND:",
                args
            );


            /*
            =================================================
            RENDER
            =================================================
            */

            this.setProgress(
                55,
                "Rendering MP4..."
            );


            await this.ffmpeg.exec(
                args
            );


            /*
            =================================================
            READ RESULT
            =================================================
            */

            this.setProgress(
                90,
                "Preparing final MP4..."
            );


            const output =
                await this.ffmpeg.readFile(
                    "viral-final.mp4"
                );


            if (
                !output ||
                !output.length
            ) {

                throw new Error(
                    "FFmpeg produced an empty video."
                );

            }


            this.finalVideoBlob =
                new Blob(
                    [output.buffer],
                    {
                        type:
                            "video/mp4"
                    }
                );


            /*
            =================================================
            CREATE PREVIEW
            =================================================
            */

            if (this.finalVideoUrl) {

                URL.revokeObjectURL(
                    this.finalVideoUrl
                );

            }


            this.finalVideoUrl =
                URL.createObjectURL(
                    this.finalVideoBlob
                );


            const preview =
                document.getElementById(
                    "finalVideoPreview"
                );


            if (preview) {

                preview.src =
                    this.finalVideoUrl;

                preview.load();

            }


            const wrapper =
                document.getElementById(
                    "finalVideoWrap"
                );


            if (wrapper) {

                wrapper.style.display =
                    "block";

            }


            this.setProgress(
                100,
                "✅ Final MP4 created successfully!"
            );


            console.log(
                "🎉 VIRAL FINAL MP4 READY",
                this.finalVideoBlob.size,
                "bytes"
            );


        }


        catch (error) {

            console.error(
                "❌ FINAL RENDER ERROR:",
                error
            );


            this.setStatus(
                "❌ " +
                (
                    error.message ||
                    "Final rendering failed."
                )
            );

        }


        finally {

            const renderButton =
                document.getElementById(
                    "renderVideoBtn"
                );

            if (renderButton) {

                renderButton.disabled =
                    false;

                renderButton.textContent =
                    renderButton.dataset.originalText ||
                    "🎬 Render Final Video";

            }

        }

    },


    /*
    ========================================================
    GET VIDEO FILE
    ========================================================
    */

    getVideoFile: function () {

        if (
            window.ViralVideo &&
            ViralVideo.videoFile
        ) {

            return ViralVideo.videoFile;

        }


        return null;

    },


    /*
    ========================================================
    GET SELECTION
    ========================================================
    */

    getSelection: function () {

        if (
            window.ViralVideo &&
            typeof ViralVideo.getSelection ===
                "function"
        ) {

            return ViralVideo.getSelection();

        }


        return null;

    },


    /*
    ========================================================
    LOAD FFMPEG
    ========================================================
    */

    loadFFmpeg: async function () {

        if (this.ffmpegLoaded) {

            return;

        }


        if (this.loadingFFmpeg) {

            while (
                this.loadingFFmpeg
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            100
                        )
                );

            }

            return;

        }


        this.loadingFFmpeg =
            true;


        try {

            this.setProgress(
                8,
                "Loading local video engine..."
            );


            /*
            ------------------------------------------------
            FFmpeg globals
            ------------------------------------------------

            These are expected to be exposed by the
            FFmpeg browser library.
            ------------------------------------------------
            */

            if (
                typeof FFmpeg ===
                "undefined"
            ) {

                throw new Error(
                    "FFmpeg library is not loaded. Check the FFmpeg scripts in studio.html."
                );

            }


            if (
                typeof FFmpeg.FFmpeg !==
                "function"
            ) {

                throw new Error(
                    "FFmpeg browser engine was not found."
                );

            }


            this.ffmpeg =
    new FFmpeg.FFmpeg({
        classWorkerURL:
            window.ViralFFmpegWorkerURL
    });


            /*
            ------------------------------------------------
            LOGGING
            ------------------------------------------------
            */

            this.ffmpeg.on(
                "log",
                ({
                    message
                }) => {

                    console.log(
                        "FFmpeg:",
                        message
                    );

                }
            );


            /*
            ------------------------------------------------
            PROGRESS
            ------------------------------------------------
            */

            this.ffmpeg.on(
                "progress",
                ({
                    progress
                }) => {

                    const percent =
                        50 +
                        (
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    progress
                                )
                            ) * 40
                        );

                    this.setProgress(
                        percent,
                        "🎬 Encoding MP4..."
                    );

                }
            );


            /*
            ------------------------------------------------
            LOAD CORE
            ------------------------------------------------
            */

            const baseURL =
                "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";


            if (
                typeof FFmpegUtil ===
                "undefined"
            ) {

                throw new Error(
                    "FFmpeg utility library is not loaded."
                );

            }


            const coreURL =
                await FFmpegUtil.toBlobURL(
                    baseURL +
                    "/ffmpeg-core.js",
                    "text/javascript"
                );


            const wasmURL =
                await FFmpegUtil.toBlobURL(
                    baseURL +
                    "/ffmpeg-core.wasm",
                    "application/wasm"
                );


            await this.ffmpeg.load({

                coreURL:
                    coreURL,

                wasmURL:
                    wasmURL

            });


            this.ffmpegLoaded =
                true;


            console.log(
                "✅ FFmpeg.wasm loaded"
            );

        }


        finally {

            this.loadingFFmpeg =
                false;

        }

    },


    /*
    ========================================================
    FETCH FILE
    ========================================================
    */

    fetchFile: async function (
        file
    ) {

        if (!file) {

            throw new Error(
                "Missing file."
            );

        }


        if (
            typeof FFmpegUtil !==
            "undefined" &&
            typeof FFmpegUtil.fetchFile ===
            "function"
        ) {

            return FFmpegUtil.fetchFile(
                file
            );

        }


        if (
            file instanceof Blob
        ) {

            return new Uint8Array(
                await file.arrayBuffer()
            );

        }


        throw new Error(
            "Could not read media file."
        );

    },


    /*
    ========================================================
    AUDIO EXTENSION
    ========================================================
    */

    getAudioExtension: function (
        blob
    ) {

        const type =
            blob &&
            blob.type
                ? blob.type
                : "";


        if (
            type.includes(
                "mpeg"
            ) ||
            type.includes(
                "mp3"
            )
        ) {

            return ".mp3";

        }


        if (
            type.includes(
                "wav"
            )
        ) {

            return ".wav";

        }


        if (
            type.includes(
                "ogg"
            )
        ) {

            return ".ogg";

        }


        if (
            type.includes(
                "mp4"
            ) ||
            type.includes(
                "m4a"
            )
        ) {

            return ".m4a";

        }


        if (
            type.includes(
                "webm"
            )
        ) {

            return ".webm";

        }


        return ".audio";

    },


    /*
    ========================================================
    CREATE SUBTITLE IMAGES
    ========================================================
    */

    createSubtitleImages: async function (
        subtitles,
        duration
    ) {

        const files = [];


        if (
            !Array.isArray(
                subtitles
            )
        ) {

            return files;

        }


        for (
            let i = 0;
            i < subtitles.length;
            i++
        ) {

            const subtitle =
                subtitles[i];


            if (
                !subtitle ||
                !subtitle.text ||
                !subtitle.text.trim()
            ) {

                continue;

            }


            const canvas =
                document.createElement(
                    "canvas"
                );


            /*
            ------------------------------------------------
            1080 x 1920 = standard 9:16
            ------------------------------------------------
            */

            canvas.width =
                1080;

            canvas.height =
                1920;


            const ctx =
                canvas.getContext(
                    "2d"
                );


            /*
            ------------------------------------------------
            TRANSPARENT BACKGROUND
            ------------------------------------------------
            */

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
            ------------------------------------------------
            STYLE
            ------------------------------------------------
            */

            const style =
                document.getElementById(
                    "subtitleStyle"
                )?.value ||
                "clean";


            const size =
                Number(
                    document.getElementById(
                        "subtitleSize"
                    )?.value ||
                    28
                );


            const fontSize =
                Math.max(
                    48,
                    size * 2.5
                );


            ctx.font =
                "700 " +
                fontSize +
                "px " +
                "\"Noto Sans Ethiopic\", " +
                "\"Noto Sans\", " +
                "sans-serif";


            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            /*
            ------------------------------------------------
            WRAP TEXT
            ------------------------------------------------
            */

            const lines =
                this.wrapText(
                    ctx,
                    subtitle.text,
                    900
                );


            const lineHeight =
                fontSize * 1.25;


            const totalHeight =
                lines.length *
                lineHeight;


            /*
            ------------------------------------------------
            POSITION
            ------------------------------------------------
            */

            const centerY =
                1600;


            /*
            ------------------------------------------------
            STYLE BACKGROUND
            ------------------------------------------------
            */

            if (
                style ===
                "bold"
            ) {

                this.drawSubtitleBox(
                    ctx,
                    lines,
                    centerY,
                    lineHeight,
                    fontSize
                );

            }


            if (
                style ===
                "story"
            ) {

                this.drawSubtitleBox(
                    ctx,
                    lines,
                    centerY,
                    lineHeight,
                    fontSize,
                    true
                );

            }


            /*
            ------------------------------------------------
            TEXT
            ------------------------------------------------
            */

            ctx.lineWidth =
                12;

            ctx.strokeStyle =
                "rgba(0,0,0,0.85)";

            ctx.fillStyle =
                "#ffffff";


            lines.forEach(
                (
                    line,
                    index
                ) => {

                    const y =
                        centerY -
                        (
                            totalHeight /
                            2
                        ) +
                        (
                            index *
                            lineHeight
                        ) +
                        (
                            lineHeight /
                            2
                        );


                    ctx.strokeText(
                        line,
                        540,
                        y
                    );


                    ctx.fillText(
                        line,
                        540,
                        y
                    );

                }
            );


            const blob =
                await new Promise(
                    resolve => {

                        canvas.toBlob(
                            resolve,
                            "image/png"
                        );

                    }
                );


            if (!blob) {

                continue;

            }


            const filename =
                "subtitle-" +
                i +
                ".png";


            await this.ffmpeg.writeFile(
                filename,
                await this.fetchFile(
                    blob
                )
            );


            files.push({

                filename:
                    filename,

                start:
                    Math.max(
                        0,
                        Number(
                            subtitle.start
                        ) || 0
                    ),

                end:
                    Math.min(
                        duration,
                        Number(
                            subtitle.end
                        ) || duration
                    )

            });

        }


        return files;

    },


    /*
    ========================================================
    DRAW SUBTITLE BOX
    ========================================================
    */

    drawSubtitleBox: function (
        ctx,
        lines,
        centerY,
        lineHeight,
        fontSize,
        storyMode
    ) {

        const maxWidth =
            930;


        const height =
            (
                lines.length *
                lineHeight
            ) +
            55;


        const top =
            centerY -
            height / 2;


        ctx.save();


        ctx.fillStyle =
            storyMode
                ? "rgba(0,0,0,0.55)"
                : "rgba(0,0,0,0.72)";


        ctx.beginPath();

        ctx.roundRect(
            540 -
                maxWidth / 2,
            top,
            maxWidth,
            height,
            30
        );

        ctx.fill();


        ctx.restore();

    },


    /*
    ========================================================
    WRAP TEXT
    ========================================================
    */

    wrapText: function (
        ctx,
        text,
        maxWidth
    ) {

        const words =
            String(text)
                .split(/\s+/);


        const lines = [];

        let current =
            "";


        words.forEach(
            word => {

                const test =
                    current
                        ? current +
                          " " +
                          word
                        : word;


                if (
                    ctx.measureText(
                        test
                    ).width >
                    maxWidth
                ) {

                    if (current) {

                        lines.push(
                            current
                        );

                    }

                    current =
                        word;

                }

                else {

                    current =
                        test;

                }

            }
        );


        if (current) {

            lines.push(
                current
            );

        }


        return lines;

    },


    /*
    ========================================================
    BUILD FILTER GRAPH
    ========================================================
    */

    buildFilterGraph: async function (
        subtitles,
        subtitleFiles,
        duration
    ) {

        /*
        ----------------------------------------------------
        The actual filter graph is assembled later by
        buildFFmpegArguments().
        ----------------------------------------------------
        */

        return {

            subtitles:
                subtitles,

            subtitleFiles:
                subtitleFiles,

            duration:
                duration

        };

    },


    /*
    ========================================================
    BUILD FFMPEG ARGUMENTS
    ========================================================
    */

    buildFFmpegArguments: function (
        selection,
        voiceExtension,
        subtitleFiles,
        filterData
    ) {

        const args = [];


        /*
        ====================================================
        INPUT VIDEO
        ====================================================
        */

        args.push(
            "-ss",
            String(
                Math.max(
                    0,
                    selection.start
                )
            ),

            "-t",
            String(
                selection.duration
            ),

            "-i",
            "input-video"
        );


        /*
        ====================================================
        INPUT VOICE
        ====================================================
        */

        args.push(
            "-i",
            "voice" +
            voiceExtension
        );


        /*
        ====================================================
        INPUT SUBTITLE PNGS
        ====================================================
        */

        subtitleFiles.forEach(
            file => {

                args.push(
                    "-loop",
                    "1",
                    "-i",
                    file.filename
                );

            }
        );


        /*
        ====================================================
        VIDEO FILTER
        ====================================================

        Crop the original video to the central 9:16 area.

        Example:

        1920x1080
             ↓
        crop 607x1080
             ↓
        scale 1080x1920
        ====================================================
        */

        let filter =
            "[0:v]" +
            "crop=" +
            "ih*9/16:ih," +
            "scale=1080:1920:force_original_aspect_ratio=decrease," +
            "pad=1080:1920:(ow-iw)/2:(oh-ih)/2" +
            "[base]";


        let last =
            "[base]";


        /*
        ====================================================
        OVERLAY SUBTITLES
        ====================================================
        */

        subtitleFiles.forEach(
            (
                file,
                index
            ) => {

                const input =
                    "[" +
                    (
                        index + 2
                    ) +
                    ":v]";


                const output =
                    "[v" +
                    index +
                    "]";


                filter +=
                    input +
                    "format=rgba" +
                    "[sub" +
                    index +
                    "];" +
                    last +
                    "[sub" +
                    index +
                    "]" +
                    "overlay=0:0:" +
                    "enable='between(t," +
                    file.start +
                    "," +
                    file.end +
                    ")'" +
                    output +
                    ";";


                last =
                    output;

            }
        );


        /*
        ====================================================
        FINAL VIDEO FORMAT
        ====================================================
        */

        filter +=
            last +
            "format=yuv420p" +
            "[vout]";


        /*
        ====================================================
        AUDIO
        ====================================================

        Trim/pad the narration to the scene duration.
        ====================================================
        */

        filter +=
            ";[1:a]" +
            "apad=" +
            "pad_dur=" +
            selection.duration +
            "," +
            "atrim=0:" +
            selection.duration +
            "[aout]";


        args.push(
            "-filter_complex",
            filter
        );


        /*
        ====================================================
        MAP
        ====================================================
        */

        args.push(
            "-map",
            "[vout]",

            "-map",
            "[aout]"
        );


        /*
        ====================================================
        VIDEO ENCODER
        ====================================================
        */

        args.push(
            "-c:v",
            "libx264",

            "-preset",
            "veryfast",

            "-crf",
            "23"
        );


        /*
        ====================================================
        AUDIO ENCODER
        ====================================================
        */

        args.push(
            "-c:a",
            "aac",

            "-b:a",
            "128k"
        );


        /*
        ====================================================
        OUTPUT
        ====================================================
        */

        args.push(
            "-movflags",
            "+faststart",

            "-t",
            String(
                selection.duration
            ),

            "viral-final.mp4"
        );


        return args;

    },


    /*
    ========================================================
    DOWNLOAD
    ========================================================
    */

    downloadFinalVideo: function () {

        if (
            !this.finalVideoBlob
        ) {

            this.setStatus(
                "❌ No final video is available yet."
            );

            return;

        }


        const url =
            this.finalVideoUrl ||
            URL.createObjectURL(
                this.finalVideoBlob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "viral-amharic-short.mp4";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        console.log(
            "⬇️ MP4 DOWNLOAD STARTED"
        );

    },


    /*
    ========================================================
    PROGRESS
    ========================================================
    */

    setProgress: function (
        percent,
        message
    ) {

        const progress =
            document.getElementById(
                "renderProgress"
            );


        const text =
            document.getElementById(
                "renderProgressText"
            );


        const wrap =
            document.getElementById(
                "renderProgressWrap"
            );


        if (wrap) {

            wrap.style.display =
                "block";

        }


        if (progress) {

            progress.value =
                Math.round(
                    percent
                );

        }


        if (text) {

            text.textContent =
                Math.round(
                    percent
                ) +
                "%";

        }


        this.setStatus(
            message
        );

    },


    /*
    ========================================================
    STATUS
    ========================================================
    */

    setStatus: function (
        message
    ) {

        const element =
            document.getElementById(
                "renderStatus"
            );


        if (element) {

            element.textContent =
                message;

        }


        console.log(
            message
        );

    }

};


/*
============================================================
START
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ViralRenderer.init();

    }
);