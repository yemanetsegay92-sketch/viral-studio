"use strict";

/*
============================================================
VIRAL — VIDEO SYSTEM
STEP 01
Stable local video + scene frame extraction
============================================================
*/

window.ViralVideo = {

    video: null,
    videoFile: null,
    videoUrl: null,

    startRange: null,
    endRange: null,
    startValue: null,
    endValue: null,
    durationValue: null,
    status: null,

    init: function () {
      console.log(
    "🔥🔥🔥 VIRAL VIDEO UPDATED VERSION LOADED 🔥🔥🔥"
);

        console.log("🎬 VIRAL Video system starting...");

        this.video =
            document.getElementById("videoPreview");

        this.startRange =
            document.getElementById("startRange");

        this.endRange =
            document.getElementById("endRange");

        this.startValue =
            document.getElementById("startValue");

        this.endValue =
            document.getElementById("endValue");

        this.durationValue =
            document.getElementById("durationValue");

        this.status =
            document.getElementById("status");


        /*
        ========================================================
        REQUIRED ELEMENTS
        ========================================================
        */

        if (!this.video) {
            console.error(
                "❌ videoPreview not found"
            );
            return;
        }

        if (!this.startRange || !this.endRange) {
            console.error(
                "❌ Range sliders not found"
            );
            return;
        }


        /*
        ========================================================
        CHANGE VIDEO
        ========================================================
        */

        const changeButton =
            document.getElementById("changeVideo");

        if (changeButton) {

            changeButton.addEventListener(
                "click",
                () => {

                    console.log(
                        "📂 Change video clicked"
                    );

                    const picker =
                        document.getElementById(
                            "hiddenVideoInput"
                        );

                    if (picker) {
                        picker.click();
                    }

                }
            );

        }


        /*
        ========================================================
        UPLOAD VIDEO BUTTON
        ========================================================
        */

        const uploadButton =
            document.getElementById(
                "uploadVideoInside"
            );

        if (uploadButton) {

            uploadButton.addEventListener(
                "click",
                () => {

                    console.log(
                        "📤 Upload video clicked"
                    );

                    const picker =
                        document.getElementById(
                            "hiddenVideoInput"
                        );

                    if (picker) {
                        picker.click();
                    }

                }
            );

        }


        /*
        ========================================================
        FILE PICKER
        ========================================================
        */

        const fileInput =
            document.getElementById(
                "hiddenVideoInput"
            );

        if (!fileInput) {

            console.error(
                "❌ hiddenVideoInput not found"
            );

            return;
        }


        fileInput.addEventListener(
            "change",
            async (event) => {

                const file =
                    event.target.files &&
                    event.target.files[0];

                if (!file) {
                    return;
                }


                /*
                ------------------------------------------------
                ACCEPT VIDEO FILES
                ------------------------------------------------
                */

                if (
                    !file.type ||
                    !file.type.startsWith("video/")
                ) {

                    this.setStatus(
                        "❌ Please select a video file."
                    );

                    return;
                }


                // Copy immediately so Android/Acode cannot invalidate the
                // original picker File reference before final rendering.
                try {
                    const buffer = await file.arrayBuffer();
                    this.videoFile = new File([buffer], file.name || "viral-input-video", {
                        type: file.type || "video/webm"
                    });
                } catch (copyError) {
                    console.error("❌ Could not copy selected video:", copyError);
                    this.setStatus("❌ Could not read the selected video. Please choose it again.");
                    return;
                }


                console.log(
                    "🎥 Selected:",
                    file.name
                );

                console.log(
                    "📦 Type:",
                    file.type
                );

                console.log(
                    "📦 Size:",
                    file.size
                );


                /*
                ------------------------------------------------
                CLEAN OLD OBJECT URL
                ------------------------------------------------
                */

                if (this.videoUrl) {

                    try {
                        URL.revokeObjectURL(
                            this.videoUrl
                        );
                    }
                    catch (error) {
                        console.warn(
                            "⚠️ Could not revoke old video URL",
                            error
                        );
                    }

                    this.videoUrl = null;
                }


                /*
                ------------------------------------------------
                CREATE NEW LOCAL URL
                ------------------------------------------------
                */

                const url =
                    URL.createObjectURL(file);

                this.videoUrl = url;


               /*
------------------------------------------------
LOAD SELECTED VIDEO
------------------------------------------------
*/

this.video.pause();

/*
Do NOT remove src and reload the video.
The Blob URL is already valid.
*/

this.video.src = this.videoUrl;

this.video.load();

                /*
                ------------------------------------------------
                SHOW VIDEO
                ------------------------------------------------
                */

                this.video.style.display =
                    "block";


                const empty =
                    document.getElementById(
                        "videoEmpty"
                    );

                if (empty) {

                    empty.style.display =
                        "none";

                }


                /*
                ------------------------------------------------
                RESET UI
                ------------------------------------------------
                */

                this.startRange.value =
                    0;

                this.endRange.value =
                    0;

                this.startValue.textContent =
                    "0:00";

                this.endValue.textContent =
                    "0:00";

                this.durationValue.textContent =
                    "0.0 sec";


                this.setStatus(
                    "🎬 Loading video..."
                );

            }
        );


        /*
        ========================================================
        LOADED METADATA
        ========================================================
        */

        this.video.addEventListener(
            "loadedmetadata",
            () => {

                console.log(
                    "✅ Video metadata loaded"
                );

                console.log(
                    "Duration:",
                    this.video.duration
                );

                console.log(
                    "Video size:",
                    this.video.videoWidth,
                    "x",
                    this.video.videoHeight
                );

                this.setupRanges();

            }
        );


        /*
        ========================================================
        CAN PLAY
        ========================================================
        */

        this.video.addEventListener(
            "canplay",
            () => {

                console.log(
                    "▶️ Video can play"
                );

            }
        );


        /*
        ========================================================
        VIDEO ERROR
        ========================================================
        */

        this.video.addEventListener(
            "error",
            () => {

                const error =
                    this.video.error;

                console.error(
                    "❌ Video loading error",
                    error
                );

                let message =
                    "❌ The video could not be loaded.";

                if (error) {

                    if (error.code === 1) {
                        message =
                            "❌ Video loading was aborted.";
                    }

                    if (error.code === 2) {
                        message =
                            "❌ Network error while loading video.";
                    }

                    if (error.code === 3) {
                        message =
                            "❌ Video decoding failed. Try another video format.";
                    }

                    if (error.code === 4) {

    message =
        "❌ Browser could not decode this video. " +
        "The file may be temporarily unavailable or " +
        "the WebM codec may not be supported.";

}

                }

                this.setStatus(message);

            }
        );


        /*
        ========================================================
        RANGE CONTROLS
        ========================================================
        */

        this.startRange.addEventListener(
            "input",
            () => {

                this.update();

            }
        );


        this.endRange.addEventListener(
            "input",
            () => {

                this.update();

            }
        );


        console.log(
            "✅ VIRAL Video system ready"
        );

    },


    /*
    ============================================================
    SETUP RANGES
    ============================================================
    */

    setupRanges: function () {

        const duration =
            this.video.duration;


        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            this.setStatus(
                "⚠️ Video duration could not be detected."
            );

            return;
        }


        /*
        --------------------------------------------------------
        USE REAL VIDEO DURATION
        --------------------------------------------------------
        */

        this.startRange.min =
            0;

        this.startRange.max =
            duration;

        this.startRange.step =
            0.1;


        this.endRange.min =
            0;

        this.endRange.max =
            duration;

        this.endRange.step =
            0.1;


        /*
        --------------------------------------------------------
        DEFAULT SELECTION
        --------------------------------------------------------
        */

        this.startRange.value =
            0;


        this.startRange.value = 0;

this.endRange.value =
    Math.min(
        30,
        duration
    );


/*
--------------------------------------------------------
INITIAL SAVE
--------------------------------------------------------
*/

this.selectedStart =
    0;

this.selectedEnd =
    Math.min(
        30,
        duration
    );

this.selectedDuration =
    this.selectedEnd -
    this.selectedStart;


this.update();


        this.update();


        this.setStatus(
            "✅ Video loaded — " +
            this.formatTime(duration) +
            " total"
        );

    },


    /*
    ============================================================
    UPDATE SELECTION
    ============================================================
    */

update: function () {

    let start =
        Number(
            this.startRange.value
        );

    let end =
        Number(
            this.endRange.value
        );


    if (!Number.isFinite(start)) {
        start = 0;
    }

    if (!Number.isFinite(end)) {
        end = 0;
    }


    /*
    --------------------------------------------------------
    KEEP VALUES INSIDE VIDEO
    --------------------------------------------------------
    */

    if (
        this.video &&
        Number.isFinite(
            this.video.duration
        )
    ) {

        start =
            Math.max(
                0,
                Math.min(
                    start,
                    this.video.duration
                )
            );

        end =
            Math.max(
                0,
                Math.min(
                    end,
                    this.video.duration
                )
            );

    }


    /*
    --------------------------------------------------------
    START CANNOT PASS END
    --------------------------------------------------------
    */

    if (start > end) {

        end = start;

        this.endRange.value =
            end;

    }


    /*
    --------------------------------------------------------
    CALCULATE DURATION
    --------------------------------------------------------
    */

    const duration =
        Math.max(
            0,
            end - start
        );


    /*
    --------------------------------------------------------
    SAVE REAL SELECTION
    --------------------------------------------------------
    */

    this.selectedStart =
        start;

    this.selectedEnd =
        end;

    this.selectedDuration =
        duration;


    /*
    --------------------------------------------------------
    UPDATE UI
    --------------------------------------------------------
    */

    this.startValue.textContent =
        this.formatTime(start);

    this.endValue.textContent =
        this.formatTime(end);

    this.durationValue.textContent =
        duration.toFixed(1) +
        " sec";


    console.log(
        "🎯 SELECTION UPDATED:",
        start,
        "→",
        end,
        "(",
        duration,
        "sec )"
    );

},


    /*
    ============================================================
    FORMAT TIME
    ============================================================
    */

    formatTime: function (seconds) {

        if (
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            seconds = 0;
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        const secs =
            Math.floor(
                seconds % 60
            );


        return (
            minutes +
            ":" +
            String(secs).padStart(
                2,
                "0"
            )
        );

    },


    /*
============================================================
GET SELECTION
============================================================
*/

getSelection: function () {

    console.log(
        "🚨 VIRAL VIDEO getSelection() WAS CALLED 🚨"
    );

    console.log(
        "================================================"
    );

    console.log(
        "🎯 VIRAL VIDEO GET SELECTION"
    );


    /*
    --------------------------------------------------------
    ALWAYS READ THE CURRENT SLIDER VALUES
    --------------------------------------------------------
    */

    const startElement =
        document.getElementById("startRange");

    const endElement =
        document.getElementById("endRange");


    if (!startElement || !endElement) {

        console.error(
            "❌ Scene range sliders not found."
        );

        return null;

    }


    let start =
        Number(
            startElement.value
        );

    let end =
        Number(
            endElement.value
        );


    console.log(
        "🎚️ CURRENT START SLIDER:",
        startElement.value
    );

    console.log(
        "🎚️ CURRENT END SLIDER:",
        endElement.value
    );


    /*
    --------------------------------------------------------
    VALIDATE
    --------------------------------------------------------
    */

    if (!Number.isFinite(start)) {

        start = 0;

    }

    if (!Number.isFinite(end)) {

        end = 0;

    }


    /*
    --------------------------------------------------------
    VIDEO DURATION
    --------------------------------------------------------
    */

    const videoDuration =
        this.video &&
        Number.isFinite(this.video.duration)
            ? this.video.duration
            : 0;


    /*
    --------------------------------------------------------
    CLAMP
    --------------------------------------------------------
    */

    if (videoDuration > 0) {

        start =
            Math.max(
                0,
                Math.min(
                    start,
                    videoDuration
                )
            );

        end =
            Math.max(
                0,
                Math.min(
                    end,
                    videoDuration
                )
            );

    }


    /*
    --------------------------------------------------------
    FIX ORDER
    --------------------------------------------------------
    */

    if (end < start) {

        end = start;

    }


    /*
    --------------------------------------------------------
    DURATION
    --------------------------------------------------------
    */

    const duration =
        Math.max(
            0,
            end - start
        );


    /*
    --------------------------------------------------------
    SAVE CURRENT SELECTION
    --------------------------------------------------------
    */

    this.selectedStart =
        start;

    this.selectedEnd =
        end;

    this.selectedDuration =
        duration;


    const selection = {

        start:
            Number(
                start.toFixed(3)
            ),

        end:
            Number(
                end.toFixed(3)
            ),

        duration:
            Number(
                duration.toFixed(3)
            )

    };


    console.log(
        "🎯 FINAL VIRAL SELECTION:",
        selection
    );

    console.log(
        "🎞️ START:",
        selection.start
    );

    console.log(
        "🎞️ END:",
        selection.end
    );

    console.log(
        "⏱️ DURATION:",
        selection.duration
    );

    console.log(
        "================================================"
    );


    return selection;

},


    /*
    ============================================================
    STATUS
    ============================================================
    */

    setStatus: function (message) {

        if (this.status) {

            this.status.textContent =
                message;

        }

    },


    /*
    ============================================================
    EXTRACT SCENE FRAMES
    ============================================================
    */

    extractFrames: async function () {

        console.log(
            "🎞️ Extracting scene frames..."
        );


        const selection =
            this.getSelection();


        const start =
            selection.start;

        const end =
            selection.end;

        const duration =
            selection.duration;


        /*
        --------------------------------------------------------
        VALIDATE
        --------------------------------------------------------
        */

        if (
            !this.video ||
            !this.videoFile
        ) {

            throw new Error(
                "No video has been selected."
            );

        }


        if (
            !Number.isFinite(
                this.video.duration
            )
        ) {

            throw new Error(
                "Video duration is unavailable."
            );

        }


        if (
            !this.video.videoWidth ||
            !this.video.videoHeight
        ) {

            throw new Error(
                "Video dimensions are unavailable."
            );

        }


        if (duration <= 0) {

            throw new Error(
                "Please select a scene longer than 0 seconds."
            );

        }


        /*
        --------------------------------------------------------
        FRAME COUNT
        --------------------------------------------------------
        */

        const frameCount =
            Math.min(
                10,
                Math.max(
                    6,
                    Math.ceil(
                        duration / 5
                    )
                )
            );


        console.log(
            "🎞️ Frame count:",
            frameCount
        );

        console.log(
            "⏱️ Scene:",
            start,
            "→",
            end
        );


        /*
        --------------------------------------------------------
        CANVAS
        --------------------------------------------------------
        */

        const canvas =
            document.createElement(
                "canvas"
            );


        const context =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: false
                }
            );


        if (!context) {

            throw new Error(
                "Could not create canvas."
            );

        }


        const width =
            this.video.videoWidth;

        const height =
            this.video.videoHeight;


        const maxWidth =
            768;


        const scale =
            Math.min(
                1,
                maxWidth / width
            );


        canvas.width =
            Math.max(
                1,
                Math.round(
                    width * scale
                )
            );


        canvas.height =
            Math.max(
                1,
                Math.round(
                    height * scale
                )
            );


        /*
        --------------------------------------------------------
        SAVE CURRENT POSITION
        --------------------------------------------------------
        */

        const originalTime =
            Number.isFinite(
                this.video.currentTime
            )
                ? this.video.currentTime
                : 0;


        this.video.pause();


        const frames = [];


        /*
        --------------------------------------------------------
        IMPORTANT:
        Never seek exactly to the video's duration.
        --------------------------------------------------------
        */

        const safeEnd =
            Math.max(
                start,
                Math.min(
                    end,
                    this.video.duration - 0.05
                )
            );


        for (
            let i = 0;
            i < frameCount;
            i++
        ) {

            const progress =
                frameCount === 1
                    ? 0
                    : i /
                      (frameCount - 1);


            let timestamp =
                start +
                (
                    (safeEnd - start) *
                    progress
                );


            /*
            Never exceed video duration.
            */

            timestamp =
                Math.max(
                    0,
                    Math.min(
                        timestamp,
                        this.video.duration - 0.05
                    )
                );


            console.log(
                "🎞️ Seeking to:",
                timestamp
            );


            this.setStatus(
                "🎞️ Extracting frame " +
                (i + 1) +
                " of " +
                frameCount +
                "..."
            );


            await this.seekTo(
                timestamp
            );


            /*
            Give browser one rendering frame.
            */

            await new Promise(
                resolve => {
                    requestAnimationFrame(
                        resolve
                    );
                }
            );


            context.drawImage(
                this.video,
                0,
                0,
                canvas.width,
                canvas.height
            );


            const image =
                canvas.toDataURL(
                    "image/jpeg",
                    0.72
                );


            frames.push({

                time:
                    Number(
                        timestamp.toFixed(2)
                    ),

                image:
                    image

            });

        }


        /*
        --------------------------------------------------------
        RESTORE ORIGINAL POSITION
        --------------------------------------------------------
        */

        try {

            const restoreTime =
                Math.min(
                    originalTime,
                    this.video.duration - 0.05
                );

            await this.seekTo(
                Math.max(
                    0,
                    restoreTime
                )
            );

        }
        catch (restoreError) {

            console.warn(
                "⚠️ Could not restore original video position",
                restoreError
            );

        }


        this.setStatus(
            "✅ " +
            frames.length +
            " scene frames extracted."
        );


        console.log(
            "✅ Frames extracted:",
            frames.length
        );


        return frames;

    },


    /*
    ============================================================
    SAFE SEEK
    ============================================================
    */

    seekTo: function (time) {

        return new Promise(
            (resolve, reject) => {

                if (!this.video) {

                    reject(
                        new Error(
                            "Video element unavailable."
                        )
                    );

                    return;
                }


                /*
                ------------------------------------------------
                SAFE TIME
                ------------------------------------------------
                */

                const duration =
                    this.video.duration;


                let target =
                    Number(time);


                if (!Number.isFinite(target)) {
                    target = 0;
                }


                if (
                    Number.isFinite(duration)
                ) {

                    target =
                        Math.min(
                            target,
                            Math.max(
                                0,
                                duration - 0.05
                            )
                        );

                }


                target =
                    Math.max(
                        0,
                        target
                    );


                /*
                ------------------------------------------------
                ALREADY THERE
                ------------------------------------------------
                */

                if (
                    Math.abs(
                        this.video.currentTime -
                        target
                    ) < 0.03
                ) {

                    requestAnimationFrame(
                        () => resolve()
                    );

                    return;

                }


                let finished =
                    false;


                const cleanup =
                    () => {

                        this.video.removeEventListener(
                            "seeked",
                            onSeeked
                        );

                        this.video.removeEventListener(
                            "error",
                            onError
                        );

                        clearTimeout(
                            timeout
                        );

                    };


                const complete =
                    () => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        cleanup();

                        resolve();

                    };


                const fail =
                    (error) => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        cleanup();

                        reject(error);

                    };


                const onSeeked =
                    () => {

                        complete();

                    };


                const onError =
                    () => {

                        fail(
                            new Error(
                                "Video seek failed."
                            )
                        );

                    };


                const timeout =
                    setTimeout(
                        () => {

                            fail(
                                new Error(
                                    "Video seek timed out at " +
                                    target.toFixed(2) +
                                    " seconds."
                                )
                            );

                        },
                        8000
                    );


                this.video.addEventListener(
                    "seeked",
                    onSeeked
                );


                this.video.addEventListener(
                    "error",
                    onError
                );


                try {

                    this.video.currentTime =
                        target;

                }
                catch (error) {

                    fail(error);

                }

            }
        );

    }

};
/* ============================================================
   VIRAL — DIRECT VIDEO URL IMPORT
   Loads a direct media URL into the existing local scene engine.
   No arbitrary webpage scraping is attempted in the browser.
============================================================ */

(function () {
    const originalInit = window.ViralVideo && window.ViralVideo.init;
    if (!originalInit) return;

    const originalInitFn = originalInit.bind(window.ViralVideo);

    window.ViralVideo.init = function () {
        originalInitFn();

        const urlInput = document.getElementById("videoUrlInput");
        const loadButton = document.getElementById("loadVideoUrl");
        const urlStatus = document.getElementById("videoUrlStatus");
        const caminandesButton = document.getElementById("loadCaminandesSource");

        if (!urlInput || !loadButton) return;

        const setUrlStatus = (message) => {
            if (urlStatus) urlStatus.textContent = message;
        };

        if (caminandesButton) {
            caminandesButton.addEventListener("click", async () => {
                const freeUrl = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Caminandes_-_Gran_Dillama_-_Blender_Foundation%27s_new_Open_Movie.webm";
                urlInput.value = freeUrl;
                setUrlStatus("⏳ Loading verified free-source example...");
                caminandesButton.disabled = true;
                try {
                    await window.ViralVideo.loadVideoFromURL(freeUrl);
                    setUrlStatus("✅ Caminandes loaded. License: CC BY-SA 3.0. Verify attribution before publishing.");
                } catch (error) {
                    console.error("Caminandes source import failed:", error);
                    setUrlStatus("❌ The free-source server did not allow browser download. Use the direct file link in the browser or upload the file locally.");
                } finally {
                    caminandesButton.disabled = false;
                }
            });
        }

        loadButton.addEventListener("click", async () => {
            const raw = (urlInput.value || "").trim();

            if (!raw) {
                setUrlStatus("❌ Paste a direct video URL first.");
                return;
            }

            let url;
            try {
                url = new URL(raw, window.location.href);
            } catch (e) {
                setUrlStatus("❌ That is not a valid URL.");
                return;
            }

            if (!/^https?:$/.test(url.protocol)) {
                setUrlStatus("❌ Please use an http:// or https:// video URL.");
                return;
            }

            setUrlStatus("⏳ Loading video link...");
            loadButton.disabled = true;

            try {
                await window.ViralVideo.loadVideoFromURL(url.href);
                setUrlStatus("✅ Video loaded. Select the scene below.");
            } catch (error) {
                console.error("URL video import failed:", error);
                setUrlStatus(
                    "❌ Could not load this link. It must point directly to a browser-readable video and allow cross-origin loading (CORS)."
                );
            } finally {
                loadButton.disabled = false;
            }
        });
    };

    window.ViralVideo.loadVideoFromURL = async function (url) {
        const video = this.video || document.getElementById("videoPreview");
        if (!video) throw new Error("videoPreview not found");

        if (this.videoUrl) {
            try { URL.revokeObjectURL(this.videoUrl); } catch (_) {}
            this.videoUrl = null;
        }

        // A URL-backed File is preferable because the existing renderer,
        // frame extractor and FFmpeg pipeline all expect videoFile.
        let file;
        try {
            const response = await fetch(url, { mode: "cors" });
            if (!response.ok) throw new Error("HTTP " + response.status);

            const blob = await response.blob();
            if (!blob.type.startsWith("video/")) {
                throw new Error("URL did not return a video file");
            }

            const pathname = new URL(url).pathname;
            const extMatch = pathname.match(/\.(webm|mp4|mov|m4v|ogg|ogv|mkv)(?:$|\?)/i);
            const ext = extMatch ? extMatch[1].toLowerCase() : (blob.type.includes("webm") ? "webm" : "mp4");
            const safeName = "viral-source." + ext;
            file = new File([blob], safeName, { type: blob.type });
        } catch (error) {
            // Do not silently pretend a cross-origin URL worked. A plain video
            // element may play some URLs, but the local frame/FFmpeg pipeline
            // needs actual bytes and therefore needs CORS-enabled fetching.
            throw error;
        }

        this.videoFile = file;
        this.videoUrl = URL.createObjectURL(file);

        video.pause();
        video.src = this.videoUrl;
        video.load();
        video.style.display = "block";

        const empty = document.getElementById("videoEmpty");
        if (empty) empty.style.display = "none";

        this.startRange.value = 0;
        this.endRange.value = 0;
        this.startValue.textContent = "0:00";
        this.endValue.textContent = "0:00";
        this.durationValue.textContent = "0.0 sec";

        this.setStatus("🎬 Loading linked video...");

        await new Promise((resolve, reject) => {
            const onMeta = () => {
                cleanup();
                resolve();
            };
            const onError = () => {
                cleanup();
                reject(new Error("Browser could not decode linked video"));
            };
            const cleanup = () => {
                video.removeEventListener("loadedmetadata", onMeta);
                video.removeEventListener("error", onError);
            };
            video.addEventListener("loadedmetadata", onMeta, { once: true });
            video.addEventListener("error", onError, { once: true });
        });

        this.setupRanges();
    };
})();
