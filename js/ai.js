"use strict";

/*
============================================================
VIRAL — AI SCENE ANALYSIS
V2C
REAL VISION AI CONNECTION
============================================================
*/

window.ViralAI = {

    analyzing: false,
    initialized: false,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        /*
        Prevent duplicate initialization
        */

        if (this.initialized) {

            console.log(
                "🤖 VIRAL AI already initialized"
            );

            return;

        }

        this.initialized = true;


        console.log(
            "🤖 VIRAL AI V2C LOADED"
        );


        const button =
            document.getElementById(
                "analyzeBtn"
            );


        if (!button) {

            console.warn(
                "⚠️ analyzeBtn not found"
            );

            return;

        }


        button.addEventListener(
            "click",
            () => {

                console.log(
                    "🔥 ANALYZE BUTTON CLICKED"
                );

                this.analyze();

            }
        );

    },


    /*
    ========================================================
    ANALYZE SCENE
    ========================================================
    */

    analyze: async function () {

        if (this.analyzing) {

            return;

        }


        this.analyzing = true;


        this.setButtonState(
            true
        );


        try {

            /*
            =================================================
            CHECK VIDEO SYSTEM
            =================================================
            */

            if (
                !window.ViralVideo
            ) {

                throw new Error(
                    "ViralVideo is not available."
                );

            }


            if (
                !ViralVideo.video
            ) {

                throw new Error(
                    "No video is loaded."
                );

            }


            /*
            =================================================
            GET SELECTION
            =================================================
            */

            const selection =
                ViralVideo.getSelection();


            console.log(
                "🎬 Selected scene:",
                selection
            );


            if (
                !selection ||
                selection.duration <= 0
            ) {

                throw new Error(
                    "Please select a video scene first."
                );

            }


            /*
            =================================================
            EXTRACT FRAMES
            =================================================
            */

            this.setStatus(
                "🎞️ Extracting scene frames..."
            );


            const frames =
                await ViralVideo.extractFrames();


            if (
                !frames ||
                frames.length === 0
            ) {

                throw new Error(
                    "No frames were extracted."
                );

            }


            console.log(
                "🖼️ FRAMES READY:",
                frames.length
            );


            /*
            =================================================
            SEND TO VISION AI
            =================================================
            */

            this.setStatus(
                "🤖 Sending "
                + frames.length
                + " frames to Vision AI..."
            );


            console.log(
                "🚀 POST /api/analyze STARTING..."
            );


            const response =
                await fetch(
                    "/api/analyze",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                frames:
                                    frames

                            })

                    }
                );


            console.log(
                "📡 API STATUS:",
                response.status
            );


            /*
            =================================================
            READ RESPONSE
            =================================================
            */

            const data =
                await response.json();


            console.log(
                "🤖 API RESPONSE:",
                data
            );


            /*
            =================================================
            SERVER ERROR
            =================================================
            */

            if (!response.ok) {

                throw new Error(

                    data.error ||
                    (
                        "API request failed. HTTP "
                        + response.status
                    )

                );

            }


            if (
                !data.success
            ) {

                throw new Error(
                    data.error ||
                    "AI analysis failed."
                );

            }


            if (
                !data.analysis
            ) {

                throw new Error(
                    "AI returned no analysis."
                );

            }


            /*
            =================================================
            DISPLAY
            =================================================
            */

            this.displayAnalysis(
                data.analysis
            );


            this.setStatus(
                "✅ Vision AI analysis complete."
            );


            console.log(
                "🎉 VIRAL V2C COMPLETE:",
                data.analysis
            );

        }


        catch (error) {

            console.error(
                "❌ VIRAL AI ERROR:",
                error
            );


            this.setStatus(
                "❌ " +
                error.message
            );

        }


        finally {

            this.analyzing =
                false;

            this.setButtonState(
                false
            );

        }

    },


    /*
    ========================================================
    DISPLAY ANALYSIS
    ========================================================
    */

    displayAnalysis: function (
        analysis
    ) {

        console.log(
            "📋 DISPLAYING ANALYSIS:",
            analysis
        );


        /*
        ====================================================
        CHARACTERS
        ====================================================
        */

        const characters =
            document.getElementById(
                "characters"
            );


        if (characters) {

            characters.textContent =
                this.formatArray(
                    analysis.characters
                );

        }


        /*
        ====================================================
        WHAT IS HAPPENING?
        ====================================================
        */

        const description =
            document.getElementById(
                "sceneDescription"
            );


        if (description) {

            description.textContent =
                this.formatActions(
                    analysis.actions
                );

        }


        /*
        ====================================================
        STORY INTERPRETATION
        ====================================================
        */

        const story =
            document.getElementById(
                "storyInterpretation"
            );


        if (story) {

            story.textContent =
                analysis.story_opportunity ||
                analysis.setting ||
                "No story interpretation available.";

        }


        /*
        ====================================================
        SHOW RESULT
        ====================================================
        */

        const result =
            document.getElementById(
                "analysisResult"
            );


        const empty =
            document.getElementById(
                "analysisEmpty"
            );


        if (result) {

            result.classList.remove(
                "hidden"
            );

        }


        if (empty) {

            empty.style.display =
                "none";

        }

    },


    /*
    ========================================================
    FORMAT ARRAY
    ========================================================
    */

    formatArray: function (
        value
    ) {

        if (
            !Array.isArray(value) ||
            value.length === 0
        ) {

            return "None identified.";

        }


        return value.join(
            ", "
        );

    },


    /*
    ========================================================
    FORMAT ACTIONS
    ========================================================
    */

    formatActions: function (
        value
    ) {

        if (
            !Array.isArray(value) ||
            value.length === 0
        ) {

            return "No important actions identified.";

        }


        return value.join(
            " "
        );

    },


    /*
    ========================================================
    BUTTON STATE
    ========================================================
    */

    setButtonState: function (
        busy
    ) {

        const button =
            document.getElementById(
                "analyzeBtn"
            );


        if (!button) {

            return;

        }


        button.disabled =
            busy;


        if (busy) {

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "🤖 Analyzing...";

        }

        else {

            button.textContent =
                button.dataset.originalText ||
                "🤖 Analyze Scene";

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

        console.log(
            message
        );


        if (
            window.ViralVideo &&
            typeof ViralVideo.setStatus ===
                "function"
        ) {

            ViralVideo.setStatus(
                message
            );

        }

    }

};


/*
============================================================
START AI SYSTEM
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ViralAI.init();

    }
);