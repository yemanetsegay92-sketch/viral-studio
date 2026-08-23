"use strict";


window.ViralAI = {

    /*
    ====================================================
    VIRAL AI SYSTEM
    V2A — FRAME EXTRACTION
    ====================================================
    */


    init: function () {

        /*
         * Nothing to initialize yet.
         *
         * Real AI connection comes in V2B.
         */

    },


    /*
    ====================================================
    ANALYZE SCENE
    ====================================================
    */

    analyze: async function () {

        const selection =
            ViralVideo.getSelection();


        /*
        ================================================
        CHECK VIDEO
        ================================================
        */

        if (
            !ViralVideo.video ||
            !ViralVideo.video.src
        ) {

            ViralVideo.setStatus(
                "⚠️ Please upload a video first."
            );

            return;

        }


        /*
        ================================================
        CHECK DURATION
        ================================================
        */

        if (
            selection.duration < 30 ||
            selection.duration > 45
        ) {

            ViralVideo.setStatus(
                "⚠️ Please select between 30 and 45 seconds."
            );

            return;

        }


        /*
        ================================================
        START
        ================================================
        */

        ViralVideo.setStatus(
            "🤖 Preparing scene..."
        );


        try {

            /*
            ============================================
            EXTRACT FRAMES
            ============================================
            */

            const frames =
                await ViralVideo.extractFrames();


            /*
            ============================================
            CHECK RESULT
            ============================================
            */

            if (
                !frames ||
                frames.length === 0
            ) {

                throw new Error(
                    "No frames were extracted."
                );

            }


            /*
            ============================================
            SHOW RESULTS
            ============================================
            */

            this.showFrameResults(
                frames
            );


            /*
            ============================================
            FUTURE AI STEP
            ============================================

            Later:

                frames
                    ↓
                Backend
                    ↓
                Vision AI
                    ↓
                Scene analysis
            ============================================
            */


            ViralVideo.setStatus(
                "✅ "
                + frames.length
                + " scene frames ready for AI."
            );


        }

        catch (error) {

            console.error(
                "VIRAL frame extraction error:",
                error
            );


            ViralVideo.setStatus(
                "❌ Could not extract scene frames."
            );

        }

    },


    /*
    ====================================================
    SHOW FRAME RESULTS
    ====================================================
    */

    showFrameResults: function (
        frames
    ) {

        const empty =
            document.getElementById(
                "analysisEmpty"
            );


        const result =
            document.getElementById(
                "analysisResult"
            );


        /*
        Hide empty state.
        */

        empty.classList.add(
            "hidden"
        );


        /*
        Show analysis section.
        */

        result.classList.remove(
            "hidden"
        );


        /*
        ================================================
        BASIC V2A INFORMATION
        ================================================
        */

        document.getElementById(
            "characters"
        ).textContent =
            "Waiting for Vision AI...";


        document.getElementById(
            "sceneDescription"
        ).textContent =
            frames.length
            + " representative frames have been extracted from the selected scene.";


        document.getElementById(
            "storyInterpretation"
        ).textContent =
            "These frames will be sent to the AI in the next VIRAL version so it can understand the scene and create an Amharic story."


        /*
        ================================================
        DISPLAY FRAMES
        ================================================
        */

        this.displayFrames(
            frames
        );

    },


    /*
    ====================================================
    DISPLAY FRAME GALLERY
    ====================================================
    */

    displayFrames: function (
        frames
    ) {

        /*
        Find existing gallery.
        */

        let gallery =
            document.getElementById(
                "viralFrameGallery"
            );


        /*
        Create gallery if it doesn't exist.
        */

        if (!gallery) {

            gallery =
                document.createElement(
                    "div"
                );


            gallery.id =
                "viralFrameGallery";


            /*
            Add heading.
            */

            const heading =
                document.createElement(
                    "div"
                );


            heading.textContent =
                "🎞️ Extracted Scene Frames";


            heading.style.margin =
                "20px 0 10px";


            heading.style.fontWeight =
                "800";


            /*
            Add gallery container.
            */

            gallery.style.display =
                "grid";


            gallery.style.gridTemplateColumns =
                "repeat(2, 1fr)";


            gallery.style.gap =
                "8px";


            /*
            Insert after analysis result.
            */

            const result =
                document.getElementById(
                    "analysisResult"
                );


            result.appendChild(
                heading
            );


            result.appendChild(
                gallery
            );

        }


        /*
        Clear old frames.
        */

        gallery.innerHTML =
            "";


        /*
        ================================================
        CREATE FRAME CARDS
        ================================================
        */

        frames.forEach(
            (frame, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.style.background =
                    "#171c26";


                card.style.border =
                    "1px solid #252c38";


                card.style.borderRadius =
                    "10px";


                card.style.overflow =
                    "hidden";


                /*
                Image
                */

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    frame.image;


                image.alt =
                    "Scene frame "
                    + (index + 1);


                image.style.width =
                    "100%";


                image.style.display =
                    "block";


                /*
                Timestamp
                */

                const time =
                    document.createElement(
                        "div"
                    );


                time.textContent =
                    "Frame "
                    + (index + 1)
                    + " • "
                    + this.formatTime(
                        frame.time
                    );


                time.style.padding =
                    "7px";


                time.style.fontSize =
                    "11px";


                time.style.color =
                    "#9da5b5";


                /*
                Add to card.
                */

                card.appendChild(
                    image
                );


                card.appendChild(
                    time
                );


                gallery.appendChild(
                    card
                );

            }
        );

    },


    /*
    ====================================================
    FORMAT TIME
    ====================================================
    */

    formatTime: function (
        seconds
    ) {

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
            + String(
                secs
            ).padStart(
                2,
                "0"
            )
        );

    }

};