"use strict";

/*
============================================================
VIRAL — FINAL VIDEO RENDERER
STEP 06

REAL LOCAL VIDEO RENDERING

PIPELINE

Selected video
      +
Selected scene
      +
Approved narration
      +
Approved Amharic subtitles
      ↓
FFmpeg.wasm
      ↓
9:16 vertical video
      ↓
H.264 + AAC
      ↓
viral-final.mp4

IMPORTANT
------------------------------------------------------------
• No paid rendering API
• No video upload to server
• FFmpeg runs locally in browser
• Original video file is preserved
• Supports many video formats as long as the bundled
  FFmpeg build can decode them
• Subtitle text is rendered by browser Canvas
  so Amharic/Ethiopic characters work reliably
============================================================
*/


window.ViralRenderer = {

    initialized: false,

    ffmpeg: null,

    ffmpegLoaded: false,

    loadingFFmpeg: false,

    finalVideoBlob: null,

    finalVideoUrl: null,

    videoInputName: null,

    voiceInputName: null,
    musicInputName: null,

    logoInputName: null,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        console.log(
            "🔥 VIRAL Renderer starting..."
        );

        if (this.initialized) {

            console.log(
                "⚠️ Renderer already initialized."
            );

            return;
        }

        this.initialized = true;

        this.setupEvents();

        console.log(
            "🎬 VIRAL Final Renderer ready."
        );

    },


    /*
    ========================================================
    EVENTS
    ========================================================
    */

    setupEvents: function () {

        console.log(
            "🔥 Setting up renderer events..."
        );


        const renderButton =
            document.getElementById(
                "renderVideoBtn"
            );


        if (!renderButton) {

            console.warn(
                "⚠️ renderVideoBtn not found."
            );

        }
        else {

            renderButton.addEventListener(
                "click",
                () => {

                    console.log(
                        "🖱️ FINAL RENDER BUTTON CLICKED"
                    );

                    this.render();

                }
            );


            console.log(
                "✅ Render button connected."
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

                    console.log(
                        "⬇️ DOWNLOAD FINAL VIDEO CLICKED"
                    );

                    this.downloadFinalVideo();

                }
            );


            console.log(
                "✅ Download button connected."
            );

        }

    },


    /*
    ========================================================
    SHOW RENDER SECTION
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
            "================================================"
        );

        console.log(
            "🎬 VIRAL FINAL RENDER STARTED"
        );

        console.log(
            "================================================"
        );


        try {

            /*
            ==================================================
            1. VIDEO
            ==================================================
            */

            const videoFile =
                this.getVideoFile();


            if (!videoFile) {

                throw new Error(
                    "Please select a video first."
                );

            }


            console.log(
                "🎥 VIDEO FILE:",
                videoFile.name
            );

            console.log(
                "🎥 VIDEO TYPE:",
                videoFile.type || "unknown"
            );

            console.log(
                "🎥 VIDEO SIZE:",
                this.formatBytes(
                    videoFile.size
                )
            );


            /*
            ==================================================
            2. SCENE
            ==================================================
            */

            const selection =
                this.getSelection();


            if (!selection) {

                throw new Error(
                    "Could not read the selected scene."
                );

            }


            if (
                !Number.isFinite(
                    selection.duration
                ) ||
                selection.duration <= 0
            ) {

                throw new Error(
                    "Please select a valid scene longer than 0 seconds."
                );

            }


            console.log(
                "🎞️ SCENE:",
                selection.start,
                "→",
                selection.end
            );

            console.log(
                "⏱️ SCENE DURATION:",
                selection.duration
            );


            /*
            ==================================================
            3. PROJECT
            ==================================================
            */

            const project =
                window.ViralProject;


            if (!project) {

                throw new Error(
                    "ViralProject is not available."
                );

            }


            /*
            ==================================================
            4. VOICE
            ==================================================
            */

            const audioMode = project.audioMode || "narration";

            const needsNarration =
                audioMode === "narration" ||
                audioMode === "original_narration";

            if (needsNarration) {

                if (!project.voiceBlob) {
                    throw new Error("No narration audio is available.");
                }

                if (!project.voiceApproved) {
                    throw new Error("Please approve the narration voice first.");
                }

                console.log("🔊 APPROVED VOICE:", project.voiceBlob.type || "unknown");
            }

            console.log("🔊 AUDIO MODE:", audioMode);


            /*
            ==================================================
            5. SUBTITLES
            ==================================================
            */

            if (
                !Array.isArray(
                    project.subtitles
                ) ||
                project.subtitles.length === 0
            ) {

                throw new Error(
                    "No subtitles are available."
                );

            }


            if (
                !project.subtitlesApproved
            ) {

                throw new Error(
                    "Please approve the subtitles first."
                );

            }


            console.log(
                "📝 SUBTITLE COUNT:",
                project.subtitles.length
            );


            /*
            ==================================================
            6. DISABLE RENDER BUTTON
            ==================================================
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


            /*
            ==================================================
            7. START
            ==================================================
            */

            this.setProgress(
                2,
                "🎬 Preparing final video..."
            );


            /*
            ==================================================
            8. LOAD FFMPEG
            ==================================================
            */

            await this.loadFFmpeg();


            /*
            ==================================================
            9. CLEAN OLD FILES
            ==================================================
            */

            this.setProgress(
                10,
                "🧹 Preparing FFmpeg workspace..."
            );


            await this.cleanupFFmpegFiles();


            /*
            ==================================================
            10. WRITE VIDEO
            ==================================================
            */

            this.setProgress(
                15,
                "📁 Loading selected video..."
            );


            const videoInputName =
                this.getVideoInputName(
                    videoFile
                );


            console.log(
                "📁 FFmpeg video filename:",
                videoInputName
            );


            const videoData =
                await this.fetchFile(
                    videoFile
                );


            if (
                !videoData ||
                !videoData.length
            ) {

                throw new Error(
                    "Video file is empty or could not be read."
                );

            }


            this.setProgress(
                18,
                "📁 Writing video into FFmpeg..."
            );


            await this.ffmpeg.writeFile(
                videoInputName,
                videoData
            );


            this.videoInputName =
                videoInputName;


            console.log(
                "✅ VIDEO WRITTEN TO FFMPEG"
            );


            /*
            ==================================================
            11. WRITE VOICE WHEN NEEDED
            ==================================================
            */

            let voiceInputName = null;

            if (needsNarration) {

                this.setProgress(
                    22,
                    "🔊 Loading approved narration..."
                );

                const voiceExtension =
                    this.getAudioExtension(
                        project.voiceBlob
                    );

                voiceInputName =
                    "voice-input" +
                    voiceExtension;

                const voiceData =
                    await this.fetchFile(
                        project.voiceBlob
                    );

                if (!voiceData || !voiceData.length) {
                    throw new Error(
                        "Narration audio is empty."
                    );
                }

                await this.ffmpeg.writeFile(
                    voiceInputName,
                    voiceData
                );

                this.voiceInputName =
                    voiceInputName;

                console.log(
                    "✅ VOICE WRITTEN TO FFMPEG:",
                    voiceInputName
                );
            }


            /*
            ==================================================
            12. WRITE OPTIONAL BACKGROUND MUSIC
            ==================================================
            */

            let musicInputName = null;

            if (project.backgroundMusicBlob) {
                this.setProgress(26, "🎵 Loading background music...");

                const musicExtension = this.getAudioExtension(project.backgroundMusicBlob);
                musicInputName = "background-music-input" + musicExtension;
                const musicData = await this.fetchFile(project.backgroundMusicBlob);

                if (!musicData || !musicData.length) {
                    throw new Error("Background music is empty or could not be read.");
                }

                await this.ffmpeg.writeFile(musicInputName, musicData);
                this.musicInputName = musicInputName;
                console.log("✅ BACKGROUND MUSIC WRITTEN TO FFMPEG:", musicInputName);
            }


            /*
            ==================================================
            13. WRITE OPTIONAL LOGO
            ==================================================
            */

            let logoInputName = null;

            if (project.logoBlob) {

                this.setProgress(28, "🏷️ Loading logo...");

                const logoType = String(project.logoBlob.type || "image/png").toLowerCase();
                let logoExt = ".png";
                if (logoType.includes("jpeg") || logoType.includes("jpg")) logoExt = ".jpg";
                else if (logoType.includes("webp")) logoExt = ".webp";

                logoInputName = "viral-logo" + logoExt;
                const logoData = await this.fetchFile(project.logoBlob);

                if (!logoData || !logoData.length) {
                    throw new Error("Logo image is empty or could not be read.");
                }

                await this.ffmpeg.writeFile(logoInputName, logoData);
                this.logoInputName = logoInputName;

                console.log("✅ LOGO WRITTEN TO FFMPEG:", logoInputName);
            }


            /*
            ==================================================
            13. CREATE SUBTITLE IMAGES
            ==================================================
            */

            this.setProgress(
                30,
                "📝 Creating Amharic subtitle graphics..."
            );


            const subtitleFiles =
                await this.createSubtitleImages(
                    project.subtitles,
                    selection.duration
                );


            console.log(
                "📝 SUBTITLE IMAGE COUNT:",
                subtitleFiles.length
            );


            /*
            ==================================================
            13. BUILD FILTER
            ==================================================
            */

            this.setProgress(
                40,
                project.outputAspectRatio === "16:9"
                    ? "🎬 Building 16:9 YouTube video..."
                    : "🎬 Building 9:16 vertical video..."
            );


            /*
            ==================================================
            13. SMART CROP
            ==================================================
            Analyze the selected scene locally, then pass the
            resulting crop rectangle into the final FFmpeg
            filter graph. If Smart Crop fails, use the normal
            center crop fallback instead of stopping the render.
            */

            this.setProgress(
                45,
                "🧠 Finding the best 9:16 crop..."
            );

            let smartCrop = null;
            const outputAspectRatio = project.outputAspectRatio === "16:9" ? "16:9" : "9:16";

            try {

                if (
                    outputAspectRatio === "9:16" &&
                    window.ViralSmartCrop &&
                    typeof ViralSmartCrop.analyze === "function"
                ) {

                    smartCrop =
                        await ViralSmartCrop.analyze(
                            window.ViralVideo.video
                        );

                    console.log(
                        "🧠 SMART CROP RESULT:",
                        smartCrop
                    );

                }

            }
            catch (cropError) {

                console.warn(
                    "⚠️ Smart Crop failed; using center crop fallback.",
                    cropError
                );

                smartCrop = null;

            }


            const filterData =
                await this.buildFilterGraph(
                    project.subtitles,
                    subtitleFiles,
                    selection.duration,
                    smartCrop,
                    logoInputName,
                    outputAspectRatio
                );

            filterData.musicInputName = musicInputName;


            /*
            ==================================================
            14. BUILD COMMAND
            ==================================================
            */

            const args =
                this.buildFFmpegArguments(
                    selection,
                    voiceInputName,
                    subtitleFiles,
                    filterData,
                    logoInputName
                );


            console.log(
                "================================================"
            );

            console.log(
                "🎬 FFMPEG COMMAND"
            );

            console.log(
                args
            );

            console.log(
                "================================================"
            );


            /*
            ==================================================
            15. RENDER
            ==================================================
            */

            this.setProgress(
                50,
                "🎬 Rendering final MP4..."
            );


            const result =
    await this.ffmpeg.exec(
        args
    );


console.log(
    "🔥 FFMPEG EXEC RESULT:",
    result
);


/*
========================================================
FFMPEG EXIT CODE CHECK
========================================================

0 = success
Anything else = FFmpeg failed.

IMPORTANT:
Do NOT continue to read viral-final.mp4 when FFmpeg
already reported a failure.
========================================================
*/

if (
    Number(result) !== 0
) {

    throw new Error(
        "FFmpeg rendering failed with exit code " +
        result +
        ". Check the FFmpeg log above for the actual error."
    );

}


console.log(
    "✅ FFMPEG EXEC COMPLETED SUCCESSFULLY"
);


            /*
            ==================================================
            16. READ OUTPUT
            ==================================================
            */

            this.setProgress(
                90,
                "📦 Reading final MP4..."
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
                    "FFmpeg finished but produced an empty MP4."
                );

            }


            console.log(
                "✅ OUTPUT SIZE:",
                output.length
            );


            /*
            ==================================================
            17. CREATE BLOB
            ==================================================
            */

            this.finalVideoBlob =
                new Blob(
                    [
                        output
                    ],
                    {
                        type:
                            "video/mp4"
                    }
                );


            /*
            ==================================================
            18. CREATE URL
            ==================================================
            */

            if (
                this.finalVideoUrl
            ) {

                try {

                    URL.revokeObjectURL(
                        this.finalVideoUrl
                    );

                }
                catch {}

            }


            this.finalVideoUrl =
                URL.createObjectURL(
                    this.finalVideoBlob
                );


            /*
            ==================================================
            19. PREVIEW
            ==================================================
            */

            const preview =
                document.getElementById(
                    "finalVideoPreview"
                );


            if (preview) {

                preview.pause();

                preview.src =
                    this.finalVideoUrl;

                preview.load();

                preview.style.display =
                    "block";


                console.log(
                    "✅ FINAL VIDEO PREVIEW READY"
                );

            }


            /*
            ==================================================
            20. SHOW WRAPPER
            ==================================================
            */

            const wrapper =
                document.getElementById(
                    "finalVideoWrap"
                );


            if (wrapper) {

                wrapper.style.display =
                    "block";

            }


            /*
            ==================================================
            21. ENABLE DOWNLOAD
            ==================================================
            */

            const downloadButton =
                document.getElementById(
                    "downloadFinalVideoBtn"
                );


            if (downloadButton) {

                downloadButton.disabled =
                    false;

                downloadButton.style.display =
                    "inline-block";

            }


            /*
            ==================================================
            22. SUCCESS
            ==================================================
            */

            this.setProgress(
                100,
                "✅ Final video rendered successfully!"
            );


            console.log(
                "================================================"
            );

            console.log(
                "🎉 VIRAL FINAL VIDEO READY"
            );

            console.log(
                "📦 SIZE:",
                this.formatBytes(
                    this.finalVideoBlob.size
                )
            );

            console.log(
                "🎬 FORMAT: MP4 / H.264 / AAC"
            );

            console.log(
                "================================================"
            );

        }


        catch (error) {

            console.error(
                "================================================"
            );

            console.error(
                "❌ FINAL RENDER FAILED"
            );

            console.error(
                error
            );

            console.error(
                "================================================"
            );


            this.setProgress(
                0,
                "❌ Final rendering failed."
            );


            this.setStatus(
                "❌ " +
                (
                    error &&
                    error.message
                        ? error.message
                        : "Final rendering failed."
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

    console.log("🔎 RENDERER: Checking ViralVideo...");

    if (
        !window.ViralVideo
    ) {

        console.error(
            "❌ window.ViralVideo does not exist."
        );

        return null;

    }


    console.log(
        "🔎 ViralVideo:",
        window.ViralVideo
    );


    console.log(
        "🔎 ViralVideo.getSelection:",
        typeof window.ViralVideo.getSelection
    );


    if (
        typeof window.ViralVideo.getSelection !==
            "function"
    ) {

        console.error(
            "❌ ViralVideo.getSelection() is not a function."
        );

        return null;

    }

console.log(
    "🔴 BEFORE CALL — startRange:",
    window.ViralVideo.startRange
        ? window.ViralVideo.startRange.value
        : "MISSING"
);

console.log(
    "🔴 BEFORE CALL — endRange:",
    window.ViralVideo.endRange
        ? window.ViralVideo.endRange.value
        : "MISSING"
);

console.log(
    "🔴 BEFORE CALL — video duration:",
    window.ViralVideo.video
        ? window.ViralVideo.video.duration
        : "MISSING"
);
    const selection =
        window.ViralVideo.getSelection();


    console.log(
        "🎯 RENDERER RECEIVED SELECTION:",
        selection
    );


    if (selection) {

        console.log(
            "🎞️ RENDERER START:",
            selection.start
        );

        console.log(
            "🎞️ RENDERER END:",
            selection.end
        );

        console.log(
            "⏱️ RENDERER DURATION:",
            selection.duration
        );

    }


    return selection;

},

    /*
    ========================================================
    CREATE VIDEO INPUT NAME
    ========================================================
    */

    getVideoInputName: function (
        file
    ) {

        /*
        ----------------------------------------------------
        Preserve the original extension.

        Example:

        movie.mp4
        movie.webm
        movie.mov
        movie.mkv
        movie.avi
        ----------------------------------------------------
        */

        let extension =
            "";


        if (
            file &&
            file.name &&
            file.name.includes(".")
        ) {

            extension =
                file.name
                    .substring(
                        file.name.lastIndexOf(".")
                    )
                    .toLowerCase();

        }


        /*
        ----------------------------------------------------
        Remove dangerous characters.
        ----------------------------------------------------
        */

        extension =
            extension.replace(
                /[^a-z0-9.]/gi,
                ""
            );


        /*
        ----------------------------------------------------
        If extension is missing, use .bin.

        FFmpeg will probe the file contents.
        ----------------------------------------------------
        */

        if (
            !extension ||
            extension.length > 10
        ) {

            extension =
                ".bin";

        }


        return (
            "input-video" +
            extension
        );

    },


    /*
    ========================================================
    LOAD FFMPEG
    ========================================================
    */

loadFFmpeg: async function () {

    console.log("========================================");
    console.log("🔥 FFMPEG LOAD START");
    console.log("========================================");

    if (
        this.ffmpegLoaded &&
        this.ffmpeg
    ) {
        console.log("✅ FFmpeg already loaded.");
        return;
    }

    if (this.loadingFFmpeg) {

        console.log(
            "⏳ FFmpeg is already loading..."
        );

        const waitStart = Date.now();
        const maxWait = 30000;

        while (
            this.loadingFFmpeg &&
            Date.now() - waitStart < maxWait
        ) {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 100)
            );

        }

        if (
            this.ffmpegLoaded &&
            this.ffmpeg
        ) {

            console.log(
                "✅ Existing FFmpeg load completed."
            );

            return;

        }

        this.loadingFFmpeg = false;
        this.ffmpegLoaded = false;
        this.ffmpeg = null;

    }

    this.loadingFFmpeg = true;

    try {

        this.setProgress(
            5,
            "⚙️ Loading FFmpeg..."
        );

        /*
        ====================================================
        CHECK LOCAL FFMPEG LIBRARY
        ====================================================
        */

        if (
            !window.FFmpegWASM
        ) {

            throw new Error(
                "FFmpegWASM is not available. Make sure ffmpeg.js is loaded before renderer.js."
            );

        }

        if (
            typeof window.FFmpegWASM.FFmpeg !==
            "function"
        ) {

            throw new Error(
                "FFmpeg class was not found inside FFmpegWASM."
            );

        }

        console.log(
            "✅ FFmpegWASM library found."
        );

        /*
        ====================================================
        CREATE INSTANCE
        ====================================================
        */

        console.log(
            "🧱 Creating FFmpeg instance..."
        );

        this.ffmpeg =
            new window.FFmpegWASM.FFmpeg();

        console.log(
            "✅ FFmpeg instance created."
        );

        /*
        ====================================================
        LOG EVENTS
        ====================================================
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
        ====================================================
        PROGRESS EVENTS
        ====================================================
        */

        this.ffmpeg.on(
            "progress",
            ({
                progress
            }) => {

                const p =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            Number(progress) || 0
                        )
                    );

                const percent =
                    50 + p * 40;

                this.setProgress(
                    percent,
                    "🎬 Encoding final MP4..."
                );

            }
        );

        /*
        ====================================================
        BUILD ABSOLUTE LOCAL URLS
        ====================================================
        */

        const coreURL =
            new URL(
                "./ffmpeg/ffmpeg-core.js",
                window.location.href
            ).href;

        const wasmURL =
            new URL(
                "./ffmpeg/ffmpeg-core.wasm.gz",
                window.location.href
            ).href;

        console.log(
            "📦 CORE:",
            coreURL
        );

        console.log(
            "📦 WASM:",
            wasmURL
        );

        /*
        ====================================================
        VERIFY FILES FIRST
        ====================================================
        */

        console.log(
            "🔎 Checking ffmpeg-core.js..."
        );

        const coreResponse =
            await fetch(
                coreURL
            );

        if (
            !coreResponse.ok
        ) {

            throw new Error(
                "Could not load ffmpeg-core.js. HTTP " +
                coreResponse.status
            );

        }

        console.log(
            "✅ ffmpeg-core.js reachable."
        );

        console.log(
            "🔎 Checking ffmpeg-core.wasm.gz..."
        );

        const wasmResponse =
            await fetch(
                wasmURL
            );

        if (
            !wasmResponse.ok
        ) {

            throw new Error(
                "Could not load ffmpeg-core.wasm.gz. HTTP " +
                wasmResponse.status
            );

        }

        console.log(
            "✅ ffmpeg-core.wasm.gz reachable."
        );

        /*
        ====================================================
        LOAD
        ====================================================
        */

        console.log(
            "🔥 Calling ffmpeg.load()..."
        );

        await this.ffmpeg.load({

            coreURL:
                coreURL,

            wasmURL:
                wasmURL

        });

        /*
        ====================================================
        SUCCESS
        ====================================================
        */

        this.ffmpegLoaded =
            true;

        console.log(
            "========================================"
        );

        console.log(
            "✅ LOCAL FFMPEG LOADED SUCCESSFULLY"
        );

        console.log(
            "========================================"
        );

        this.setProgress(
            10,
            "✅ FFmpeg ready."
        );

    }

    catch (error) {

        this.ffmpegLoaded =
            false;

        this.ffmpeg =
            null;

        console.error(
            "========================================"
        );

        console.error(
            "❌ FFMPEG LOAD ERROR"
        );

        console.error(
            error
        );

        console.error(
            "========================================"
        );

        throw error;

    }

    finally {

        this.loadingFFmpeg =
            false;

    }

},


    /*
    ========================================================
    CLEAN FFMPEG WORKSPACE
    ========================================================
    */

    cleanupFFmpegFiles: async function () {

        if (
            !this.ffmpeg
        ) {

            return;

        }


        const files = [

            "viral-final.mp4",

            "voice-input.mp3",

            "voice-input.wav",

            "voice-input.ogg",

            "voice-input.m4a",

            "voice-input.webm",

            "voice-input.audio",
            "background-music-input.mp3",
            "background-music-input.wav",
            "background-music-input.ogg",
            "background-music-input.m4a",
            "background-music-input.webm",
            "background-music-input.audio",

            "input-video.mp4",

            "input-video.webm",

            "input-video.mov",

            "input-video.mkv",

            "input-video.avi",

            "input-video.m4v",

            "input-video.mpeg",

            "input-video.mpg",

            "input-video.bin"

        ];


        for (
            const filename of files
        ) {

            try {

                await this.ffmpeg.deleteFile(
                    filename
                );

            }
            catch {}

        }


        /*
        ----------------------------------------------------
        Remove previous subtitle images.
        ----------------------------------------------------
        */

        try { await this.ffmpeg.deleteFile("viral-logo.png"); } catch {}
        try { await this.ffmpeg.deleteFile("viral-logo.jpg"); } catch {}
        try { await this.ffmpeg.deleteFile("viral-logo.webp"); } catch {}

        for (
            let i = 0;
            i < 100;
            i++
        ) {

            try {

                await this.ffmpeg.deleteFile(
                    "subtitle-" +
                    i +
                    ".png"
                );

            }
            catch {}

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
            throw new Error("Missing media file.");
        }

        if (typeof Blob !== "undefined" && file instanceof Blob) {
            try {
                const buffer = await file.arrayBuffer();
                return new Uint8Array(buffer);
            } catch (error) {
                console.error("❌ Blob/File read failed:", error);
                throw new Error("The selected media could not be read. Please choose the file again.");
            }
        }

        if (file instanceof Uint8Array) return file;
        if (file instanceof ArrayBuffer) return new Uint8Array(file);

        if (typeof FFmpegUtil !== "undefined" && typeof FFmpegUtil.fetchFile === "function") {
            return await FFmpegUtil.fetchFile(file);
        }

        throw new Error("Could not read media file.");
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
            (
                blob &&
                blob.type
                    ? blob.type
                    : ""
            ).toLowerCase();


        if (
            type.includes("mpeg") ||
            type.includes("mp3")
        ) {

            return ".mp3";

        }


        if (
            type.includes("wav") ||
            type.includes("wave")
        ) {

            return ".wav";

        }


        if (
            type.includes("ogg") ||
            type.includes("opus")
        ) {

            return ".ogg";

        }


        if (
            type.includes("mp4") ||
            type.includes("m4a") ||
            type.includes("aac")
        ) {

            return ".m4a";

        }


        if (
            type.includes("webm")
        ) {

            return ".webm";

        }


        if (
            type.includes("flac")
        ) {

            return ".flac";

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
                !String(
                    subtitle.text
                ).trim()
            ) {

                continue;

            }


            /*
            ==================================================
            CANVAS
            ==================================================
            */

            const canvas =
                document.createElement(
                    "canvas"
                );


            const renderAspect = window.ViralProject?.outputAspectRatio === "16:9" ? "16:9" : "9:16";
            const canvasWidth = renderAspect === "16:9" ? 1920 : 1080;
            const canvasHeight = renderAspect === "16:9" ? 1080 : 1920;

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;


            const ctx =
                canvas.getContext(
                    "2d"
                );


            if (!ctx) {

                throw new Error(
                    "Could not create subtitle canvas."
                );

            }


            /*
            ==================================================
            TRANSPARENT BACKGROUND
            ==================================================
            */

            ctx.clearRect(
                0,
                0,
                canvasWidth,
                canvasHeight
            );


            /*
            ==================================================
            SETTINGS
            ==================================================
            */

            const style =
                document.getElementById(
                    "subtitleStyle"
                )?.value ||
                "clean";

            const subtitlePosition =
                document.getElementById("subtitlePosition")?.value || "bottom";

            const subtitleColor =
                document.getElementById("subtitleColor")?.value || "#ffffff";


            const size =
                Number(
                    document.getElementById(
                        "subtitleSize"
                    )?.value ||
                    28
                );


            const fontScale = renderAspect === "16:9" ? 3.8 : 2.5;
            const fontSize =
                Math.max(48, size * fontScale);


            /*
            ==================================================
            FONT
            ==================================================
            */

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
            ==================================================
            WRAP
            ==================================================
            */

            const lines =
                this.wrapText(
                    ctx,
                    String(
                        subtitle.text
                    ),
                    Math.round(canvasWidth * 0.84)
                );


            const lineHeight =
                fontSize *
                1.25;


            const totalHeight =
                lines.length *
                lineHeight;


            /*
            ==================================================
            POSITION
            ==================================================
            */

            let centerY;
            if (subtitlePosition === "top") {
                centerY = Math.round(canvasHeight * 0.14);
            } else if (subtitlePosition === "middle") {
                centerY = Math.round(canvasHeight * 0.50);
            } else {
                centerY = Math.round(canvasHeight * 0.86);
            }


            /*
            ==================================================
            BACKGROUND
            ==================================================
            */

            if (
                style === "bold"
            ) {

                this.drawSubtitleBox(
                    ctx,
                    lines,
                    centerY,
                    lineHeight,
                    fontSize,
                    false,
                    canvasWidth
                );

            }


            if (
                style === "story"
            ) {

                this.drawSubtitleBox(
                    ctx,
                    lines,
                    centerY,
                    lineHeight,
                    fontSize,
                    true,
                    canvasWidth
                );

            }


            /*
            ==================================================
            TEXT
            ==================================================
            */

            ctx.lineWidth =
                12;


            ctx.strokeStyle =
                "rgba(0,0,0,0.85)";


            ctx.fillStyle =
                subtitleColor;


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
                        canvasWidth / 2,
                        y
                    );


                    ctx.fillText(
                        line,
                        canvasWidth / 2,
                        y
                    );

                }
            );


            /*
            ==================================================
            CANVAS → PNG
            ==================================================
            */

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

                throw new Error(
                    "Could not create subtitle PNG."
                );

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


            /*
            ==================================================
            TIMING
            ==================================================
            */

            let start =
                Number(
                    subtitle.start
                );


            let end =
                Number(
                    subtitle.end
                );


            if (
                !Number.isFinite(start)
            ) {

                start = 0;

            }


            if (
                !Number.isFinite(end)
            ) {

                end =
                    duration;

            }


            start =
                Math.max(
                    0,
                    Math.min(
                        start,
                        duration
                    )
                );


            end =
                Math.max(
                    start,
                    Math.min(
                        end,
                        duration
                    )
                );


            files.push({

                filename:
                    filename,

                start:
                    start,

                end:
                    end

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
        storyMode,
        canvasWidth = 1080
    ) {

        const maxWidth =
            Math.min(
                canvasWidth * 0.86,
                canvasWidth - 80
            );


        const height =
            (
                lines.length *
                lineHeight
            ) +
            55;


        const top =
            centerY -
            (
                height / 2
            );


        ctx.save();


        ctx.fillStyle =
            storyMode
                ? "rgba(0,0,0,0.55)"
                : "rgba(0,0,0,0.72)";


        ctx.beginPath();


        /*
        ----------------------------------------------------
        roundRect may not exist in some older browsers.
        ----------------------------------------------------
        */

        if (
            typeof ctx.roundRect ===
                "function"
        ) {

            ctx.roundRect(
                (canvasWidth / 2) -
                    (maxWidth / 2),
                top,
                maxWidth,
                height,
                30
            );

        }
        else {

            ctx.rect(
                (canvasWidth / 2) -
                    (maxWidth / 2),
                top,
                maxWidth,
                height
            );

        }


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
            String(
                text
            ).split(
                /\s+/
            );


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

                    if (
                        current
                    ) {

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


        if (
            current
        ) {

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

    /*
    ========================================================
    CHARACTER VOICE FILTERS
    ========================================================

    One approved recording is split using subtitle timings.
    Each segment receives a local FFmpeg voice style, then
    the pieces are joined back into one narration track.
    ========================================================
    */

    buildCharacterVoiceFilter: function (subtitles, duration, masterVolume) {

        const items = Array.isArray(subtitles) && subtitles.length
            ? subtitles
            : [{ start: 0, end: duration, voiceProfile: "narrator" }];

        const graphs = [];
        const labels = [];

        const profiles = {
            narrator: { pitch: 1.00, volume: 1.00 },
            deep:     { pitch: 0.82, volume: 1.05 },
            child:    { pitch: 1.35, volume: 0.95 },
            high:     { pitch: 1.22, volume: 1.00 },
            old:      { pitch: 0.90, volume: 0.90 },
            robot:    { pitch: 1.00, volume: 0.95, extra: "aecho=0.8:0.88:55:0.28" },
            echo:     { pitch: 1.00, volume: 0.95, extra: "aecho=0.8:0.82:180:0.35" },
            funny:    { pitch: 1.16, volume: 1.00 },
            strong:   { pitch: 0.88, volume: 1.10 },
            soft:     { pitch: 1.04, volume: 0.48, extra: "highpass=180" }
        };

        items.forEach((item, index) => {
            const start = Math.max(0, Number(item.start) || 0);
            const end = Math.min(Number(duration) || 0.1, Math.max(start + 0.01, Number(item.end) || start + 0.01));
            const p = profiles[item.voiceProfile] || profiles.narrator;
            const pitch = p.pitch;
            const restoreTempo = (1 / pitch).toFixed(5);
            const label = "[cv" + index + "]";
            let chain = "[1:a]atrim=start=" + this.escapeFilterNumber(start) + ":end=" + this.escapeFilterNumber(end) + ",asetpts=PTS-STARTPTS";

            if (Math.abs(pitch - 1) > 0.001) {
                chain += ",asetrate=44100*" + pitch.toFixed(4) + ",aresample=44100,atempo=" + restoreTempo;
            }

            if (p.extra) chain += "," + p.extra;
            chain += ",volume=" + p.volume.toFixed(3) + label + ";";
            graphs.push(chain);
            labels.push(label);
        });

        let out = ";" + graphs.join("");
        if (labels.length === 1) {
            out += labels[0] + "volume=" + Math.max(0, Number(masterVolume) || 1).toFixed(3) + ",aresample=async=1,apad,atrim=duration=" + this.escapeFilterNumber(duration) + "[aout]";
        } else {
            out += labels.join("") + "concat=n=" + labels.length + ":v=0:a=1,volume=" + Math.max(0, Number(masterVolume) || 1).toFixed(3) + ",aresample=async=1,apad,atrim=duration=" + this.escapeFilterNumber(duration) + "[aout]";
        }

        return out;
    },

    buildFilterGraph: async function (
        subtitles,
        subtitleFiles,
        duration,
        smartCrop = null,
        logoInputName = null,
        outputAspectRatio = "9:16"
    ) {

        return {

            subtitles:
                subtitles,

            subtitleFiles:
                subtitleFiles,

            duration:
                duration,

            smartCrop: smartCrop,
            logoInputName: logoInputName,
            outputAspectRatio: outputAspectRatio === "16:9" ? "16:9" : "9:16",

            audioMode: window.ViralProject?.audioMode || "narration",
            narrationVolume: Number(window.ViralProject?.narrationVolume) || 1,
            originalVolume: Number(window.ViralProject?.originalVolume) || 0.35,
            backgroundMusicVolume: Number(window.ViralProject?.backgroundMusicVolume) || 0.20,
            musicInputName: null

        };

    },


    /*
    ========================================================
    BUILD FFMPEG ARGUMENTS
    ========================================================
    */

    buildFFmpegArguments: function (
    selection,
    voiceInputName,
    subtitleFiles,
    filterData,
    logoInputName = null
) {

    const args = [];

    const audioMode = filterData?.audioMode || "narration";
    const needsNarration = audioMode === "narration" || audioMode === "original_narration";
    const narrationVolume = Math.max(0, Number(filterData?.narrationVolume) || 1);
    const originalVolume = Math.max(0, Number(filterData?.originalVolume) || 0.35);
    const musicInputName = filterData?.musicInputName || null;
    const musicVolume = Math.max(0, Number(filterData?.backgroundMusicVolume) || 0.20);

    /*
    ========================================================
    VIDEO INPUT
    ========================================================
    */

    const start =
        Math.max(
            0,
            Number(selection.start) || 0
        );

    const duration =
        Math.max(
            0.1,
            Number(selection.duration) || 0.1
        );

    args.push(
        "-ss",
        String(start),

        "-t",
        String(duration),

        "-i",
        this.videoInputName
    );


    /*
    ========================================================
    VOICE INPUT
    ========================================================
    */

    if (needsNarration) {
        args.push("-i", voiceInputName);
    }

    let subtitleInputStart = needsNarration ? 2 : 1;

    if (musicInputName) {
        args.push("-i", musicInputName);
        subtitleInputStart += 1;
    }

    if (logoInputName) {
        args.push("-loop", "1", "-i", logoInputName);
        subtitleInputStart += 1;
    }


    /*
    ========================================================
    SUBTITLE INPUTS
    ========================================================
    */

    subtitleFiles.forEach(
        file => {

            const subtitleDuration =
                Math.max(
                    0.1,
                    Number(
                        file.end - file.start
                    ) || 0.1
                );

            args.push(
                "-loop",
                "1",

                "-t",
                String(subtitleDuration),

                "-i",
                file.filename
            );

        }
    );


    /*
    ========================================================
    FILTER GRAPH
    ========================================================

    Convert original video to exactly:

        1080 x 1920

    No pad filter is used.

    This works for landscape and portrait video.
    ========================================================
    */

    let filter;

    const renderAspect = filterData?.outputAspectRatio === "16:9" ? "16:9" : "9:16";

    /*
    --------------------------------------------------------
    OUTPUT FORMAT
    --------------------------------------------------------
    9:16: Smart Crop when available, then 1080x1920.
    16:9: centered fill crop, then 1920x1080.
    --------------------------------------------------------
    */

    if (renderAspect === "16:9") {

        filter =
            "[0:v]" +
            "scale=1920:1080:" +
            "force_original_aspect_ratio=increase," +
            "crop=1920:1080," +
            "setsar=1" +
            "[base];";

        console.log(
            "🖥️ FINAL RENDER: YouTube 16:9 center-crop"
        );

    } else if (
        crop &&
        Number.isFinite(Number(crop.x)) &&
        Number.isFinite(Number(crop.y)) &&
        Number.isFinite(Number(crop.width)) &&
        Number.isFinite(Number(crop.height)) &&
        Number(crop.width) > 0 &&
        Number(crop.height) > 0 &&
        Number(crop.x) >= 0 &&
        Number(crop.y) >= 0 &&
        (!sourceWidth || Number(crop.x) + Number(crop.width) <= sourceWidth + 1) &&
        (!sourceHeight || Number(crop.y) + Number(crop.height) <= sourceHeight + 1)
    ) {

        const x = Math.max(0, Math.floor(Number(crop.x)));
        const y = Math.max(0, Math.floor(Number(crop.y)));
        const w = Math.max(2, Math.floor(Number(crop.width) / 2) * 2);
        const h = Math.max(2, Math.floor(Number(crop.height) / 2) * 2);

        filter =
            "[0:v]" +
            "crop=" + w + ":" + h + ":" + x + ":" + y + "," +
            "scale=1080:1920," +
            "setsar=1" +
            "[base];";

        console.log(
            "✂️ FINAL SMART CROP:",
            { x, y, width: w, height: h }
        );

    } else {

        filter =
            "[0:v]" +
            "scale=1080:1920:" +
            "force_original_aspect_ratio=increase," +
            "crop=1080:1920," +
            "setsar=1" +
            "[base];";

        console.log(
            "✂️ FINAL RENDER: 9:16 center-crop fallback"
        );

    }


    /*
    ========================================================
    OPTIONAL LOGO / WATERMARK
    ========================================================
    */

    let last =
        "[base]";

    if (logoInputName) {

        const logoIndex = subtitleInputStart - 1;
        const position = window.ViralProject?.logoPosition || "top-right";
        const sizePct = Math.max(8, Math.min(35, Number(window.ViralProject?.logoSize) || 18));
        const opacity = Math.max(0.2, Math.min(1, Number(window.ViralProject?.logoOpacity) || 0.85));
        const logoWidth = Math.round(1080 * sizePct / 100);
        let x = "W-w-36";
        let y = "36";
        if (position === "top-left") { x = "36"; y = "36"; }
        else if (position === "bottom-left") { x = "36"; y = "H-h-36"; }
        else if (position === "bottom-right") { x = "W-w-36"; y = "H-h-36"; }

        filter += "[" + logoIndex + ":v]format=rgba,colorchannelmixer=aa=" + opacity + ",scale=" + logoWidth + ":-1[logo];";
        filter += last + "[logo]overlay=" + x + ":" + y + ":shortest=1[vlogo];";
        last = "[vlogo]";
    }


    /*
    ========================================================
    SUBTITLE OVERLAYS
    ========================================================
    */


    subtitleFiles.forEach(
        (
            file,
            index
        ) => {

            const inputIndex = index + subtitleInputStart;

            const input =
                "[" +
                inputIndex +
                ":v]";

            const subtitleLabel =
                "[sub" +
                index +
                "]";

            const outputLabel =
                "[v" +
                index +
                "]";


            /*
            ------------------------------------------------
            Prepare subtitle image.
            ------------------------------------------------
            */

            filter +=
                input +
                "format=rgba" +
                subtitleLabel +
                ";";


            /*
            ------------------------------------------------
            Overlay subtitle.
            ------------------------------------------------
            */

            filter +=
                last +
                subtitleLabel +
                "overlay=0:0:" +
                "enable='between(t," +
                this.escapeFilterNumber(
                    file.start
                ) +
                "," +
                this.escapeFilterNumber(
                    file.end
                ) +
                ")'" +
                outputLabel +
                ";";


            last =
                outputLabel;

        }
    );


    /*
    ========================================================
    FINAL VIDEO
    ========================================================
    */

    filter +=
        last +
        "format=yuv420p" +
        "[vout]";


    /*
    ========================================================
    AUDIO
    ========================================================
    */

    const audioLabels = [];

    if (audioMode === "narration" || audioMode === "original_narration") {
        const characterAudio = this.buildCharacterVoiceFilter(
            filterData?.subtitles || [],
            duration,
            narrationVolume
        );
        // Give the character-processed narration a unique label so it can
        // safely be mixed with original sound and/or background music.
        filter += characterAudio.replace(/\[aout\]\s*$/, "[narration]");
        audioLabels.push("[narration]");
    }

    if (audioMode === "original" || audioMode === "original_narration") {
        filter += ";[0:a]volume=" + originalVolume + ",aresample=async=1,apad,atrim=duration=" + this.escapeFilterNumber(duration) + "[orig]";
        audioLabels.push("[orig]");
    }

    if (musicInputName) {
        const musicIndex = needsNarration ? 2 : 1;
        filter += ";[" + musicIndex + ":a]volume=" + musicVolume + ",aresample=async=1,aloop=loop=-1:size=2e+09,atrim=duration=" + this.escapeFilterNumber(duration) + "[music]";
        audioLabels.push("[music]");
    }

    if (audioLabels.length === 1) {
        filter += ";" + audioLabels[0] + "aresample=async=1,apad,atrim=duration=" + this.escapeFilterNumber(duration) + "[aout]";
    } else if (audioLabels.length > 1) {
        filter += ";" + audioLabels.join("") + "amix=inputs=" + audioLabels.length + ":duration=longest:dropout_transition=0,atrim=duration=" + this.escapeFilterNumber(duration) + ",aresample=async=1[aout]";
    }


    /*
    ========================================================
    FILTER COMPLEX
    ========================================================
    */

    args.push(
        "-filter_complex",
        filter
    );


    /*
    ========================================================
    MAP VIDEO + AUDIO
    ========================================================
    */

    args.push("-map", "[vout]");

    args.push("-map", "[aout]");


    /*
    ========================================================
    VIDEO ENCODER
    ========================================================
    */

    args.push(
        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "23",

        "-pix_fmt",
        "yuv420p"
    );


    /*
    ========================================================
    AUDIO ENCODER
    ========================================================
    */

    args.push(
        "-c:a",
        "aac",

        "-b:a",
        "128k",

        "-ar",
        "44100"
    );


    /*
    ========================================================
    OUTPUT
    ========================================================
    */

    args.push(
        "-t",
        String(duration),

        "-movflags",
        "+faststart",

        "-y",

        "viral-final.mp4"
    );


    /*
    ========================================================
    DEBUG
    ========================================================
    */

    console.log(
        "================================================"
    );

    console.log(
        "🔥 FINAL FILTER GRAPH:"
    );

    console.log(
        filter
    );

    console.log(
        "================================================"
    );


    return args;

},


    /*
    ========================================================
    ESCAPE FILTER NUMBER
    ========================================================
    */

    escapeFilterNumber: function (
        value
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "0";

        }


        return number.toFixed(
            3
        );

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


        let url =
            this.finalVideoUrl;


        let temporary =
            false;


        if (!url) {

            url =
                URL.createObjectURL(
                    this.finalVideoBlob
                );

            temporary =
                true;

        }


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


        if (
            temporary
        ) {

            setTimeout(
                () => {

                    try {

                        URL.revokeObjectURL(
                            url
                        );

                    }
                    catch {}

                },
                1000
            );

        }


        console.log(
            "⬇️ FINAL MP4 DOWNLOAD STARTED"
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


        const safePercent =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        percent
                    ) || 0
                )
            );


        if (progress) {

            progress.value =
                Math.round(
                    safePercent
                );

        }


        if (text) {

            text.textContent =
                Math.round(
                    safePercent
                ) +
                "%";

        }


        if (message) {

            this.setStatus(
                message
            );

        }

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

    },


    /*
    ========================================================
    FORMAT BYTES
    ========================================================
    */

    formatBytes: function (
        bytes
    ) {

        if (
            !Number.isFinite(
                bytes
            ) ||
            bytes <= 0
        ) {

            return "0 B";

        }


        const units = [
            "B",
            "KB",
            "MB",
            "GB"
        ];


        const index =
            Math.min(
                Math.floor(
                    Math.log(bytes) /
                    Math.log(1024)
                ),
                units.length - 1
            );


        return (
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(
                index === 0
                    ? 0
                    : 2
            )
            +
            " " +
            units[index]
        );

    }

};


/*
============================================================
START
============================================================
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            ViralRenderer.init();

        }
    );

}
else {

    ViralRenderer.init();

}