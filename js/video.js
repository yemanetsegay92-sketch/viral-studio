"use strict";

window.ViralVideo = {

    video: null,
    startRange: null,
    endRange: null,
    startValue: null,
    endValue: null,
    durationValue: null,
    status: null,

    init: function () {

        console.log("🎬 VIRAL Video system starting...");

        this.video = document.getElementById("videoPreview");
        this.startRange = document.getElementById("startRange");
        this.endRange = document.getElementById("endRange");
        this.startValue = document.getElementById("startValue");
        this.endValue = document.getElementById("endValue");
        this.durationValue = document.getElementById("durationValue");
        this.status = document.getElementById("status");


        /*
        =================================================
        CHECK REQUIRED ELEMENTS
        =================================================
        */

        if (!this.video) {
            console.error("❌ videoPreview not found");
            return;
        }

        if (!this.startRange || !this.endRange) {
            console.error("❌ Range sliders not found");
            return;
        }


        /*
        =================================================
        CHANGE VIDEO BUTTON
        =================================================
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

        } else {

            console.warn(
                "⚠️ changeVideo button not found"
            );

        }


        /*
        =================================================
        UPLOAD VIDEO INSIDE PREVIEW
        =================================================
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

        } else {

            console.warn(
                "⚠️ uploadVideoInside button not found"
            );

        }


        /*
        =================================================
        VIDEO FILE PICKER
        =================================================
        */

        const fileInput =
            document.getElementById(
                "hiddenVideoInput"
            );

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                (event) => {

                    const file =
                        event.target.files[0];

                    if (!file) {
                        return;
                    }

                    console.log(
                        "🎥 Selected:",
                        file.name
                    );

                    /*
                    Create local URL.
                    */

                    const url =
                        URL.createObjectURL(
                            file
                        );

                    /*
                    Load video.
                    */

                    this.video.src = url;

                    this.video.load();

                    /*
                    Show video.
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

                    this.setStatus(
                        "🎬 Loading video..."
                    );

                }
            );

        } else {

            console.error(
                "❌ hiddenVideoInput not found"
            );

        }


        /*
        =================================================
        VIDEO METADATA
        =================================================
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

                this.setupRanges();

            }
        );


        /*
        =================================================
        VIDEO ERROR
        =================================================
        */

        this.video.addEventListener(
            "error",
            () => {

                console.error(
                    "❌ Video loading error",
                    this.video.error
                );

                this.setStatus(
                    "❌ The video could not be loaded."
                );

            }
        );


        /*
        =================================================
        RANGE CONTROLS
        =================================================
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


        /*
        =================================================
        ANALYZE BUTTON
        =================================================
        */

        const analyzeButton =
            document.getElementById(
                "analyzeBtn"
            );

        if (analyzeButton) {

            analyzeButton.addEventListener(
                "click",
                () => {

                    ViralAI.analyze();

                }
            );

        }


        console.log(
            "✅ VIRAL Video system ready"
        );

    },


    /*
    =================================================
    SETUP RANGE SLIDERS
    =================================================
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
        Use the actual video duration.
        */

        this.startRange.max =
            duration;

        this.endRange.max =
            duration;


        /*
        Start at 0.
        */

        this.startRange.value =
            0;


        /*
        Default to 30 seconds,
        unless the video is shorter.
        */

        this.endRange.value =
            Math.min(
                30,
                duration
            );


        this.update();


        this.setStatus(
            "✅ Video loaded — "
            + this.formatTime(duration)
            + " total"
        );

    },


    /*
    =================================================
    UPDATE TIME DISPLAY
    =================================================
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


        if (end < start) {

            end = start;

            this.endRange.value =
                end;

        }


        this.startValue.textContent =
            this.formatTime(start);

        this.endValue.textContent =
            this.formatTime(end);


        const duration =
            end - start;


        this.durationValue.textContent =
            duration.toFixed(1)
            + " sec";

    },


    /*
    =================================================
    FORMAT TIME
    =================================================
    */

    formatTime: function (seconds) {

        const minutes =
            Math.floor(
                seconds / 60
            );

        const secs =
            Math.floor(
                seconds % 60
            );

        return (
            minutes
            + ":"
            + String(secs).padStart(
                2,
                "0"
            )
        );

    },


    /*
    =================================================
    GET CURRENT SELECTION
    =================================================
    */

    getSelection: function () {

        const start =
            Number(
                this.startRange.value
            );

        const end =
            Number(
                this.endRange.value
            );

        return {

            start: start,
            end: end,
            duration: end - start

        };

    },


    /*
    =================================================
    STATUS MESSAGE
    =================================================
    */

    setStatus: function (message) {

        if (this.status) {

            this.status.textContent =
                message;

        }

    },


    /*
    =================================================
    EXTRACT FRAMES
    =================================================
    */

    extractFrames: async function () {

        const selection =
            this.getSelection();

        const start =
            selection.start;

        const duration =
            selection.duration;


        /*
        6–10 frames.
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


        const canvas =
            document.createElement(
                "canvas"
            );

        const context =
            canvas.getContext(
                "2d"
            );


        const width =
            this.video.videoWidth;

        const height =
            this.video.videoHeight;


        if (!width || !height) {

            throw new Error(
                "Video dimensions unavailable."
            );

        }


        const maxWidth = 768;

        const scale =
            Math.min(
                1,
                maxWidth / width
            );


        canvas.width =
            Math.round(
                width * scale
            );

        canvas.height =
            Math.round(
                height * scale
            );


        const frames = [];

        const originalTime =
            this.video.currentTime;


        this.video.pause();


        for (
            let i = 0;
            i < frameCount;
            i++
        ) {

            const progress =
                i /
                (frameCount - 1);


            const timestamp =
                start +
                (
                    duration *
                    progress
                );


            await this.seekTo(
                timestamp
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

                image: image

            });


            this.setStatus(
                "🎞️ Extracting frame "
                + (i + 1)
                + " of "
                + frameCount
                + "..."
            );

        }


        await this.seekTo(
            originalTime
        );


        this.setStatus(
            "✅ "
            + frames.length
            + " scene frames extracted."
        );


        return frames;

    },


    /*
    =================================================
    SEEK VIDEO
    =================================================
    */

    seekTo: function (time) {

        return new Promise(
            resolve => {

                const handler =
                    () => {

                        this.video.removeEventListener(
                            "seeked",
                            handler
                        );

                        requestAnimationFrame(
                            resolve
                        );

                    };


                this.video.addEventListener(
                    "seeked",
                    handler
                );


                this.video.currentTime =
                    time;

            }
        );

    }

};