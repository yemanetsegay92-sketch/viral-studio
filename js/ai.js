"use strict";

/*
============================================================
VIRAL — AI SCENE ANALYSIS
V2B
REAL VISION AI CONNECTION
============================================================
*/

window.ViralAI = {

    analyzing: false,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        console.log(
            "🤖 VIRAL AI V2B LOADED"
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
    ANALYZE
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
            IMPORTANT:
            WE ARE NOW ACTUALLY CALLING THE API
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


            /*
            =================================================
            API REQUEST
            =================================================
            */

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
            HANDLE ERROR
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
            DISPLAY REAL RESULT
            =================================================
            */

            this.displayAnalysis(
                data.analysis
            );


            this.setStatus(
                "✅ Vision AI analysis complete."
            );


            console.log(
                "🎉 VIRAL V2B COMPLETE:",
                data.analysis
            );

        }


        catch (error) {

            console.error(
                "❌ VIRAL AI ERROR:",
                error
            );


            this.setStatus(
                "❌ "
                + error.message
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
            "📋 DISPLAYING AI ANALYSIS",
            analysis
        );


        /*
        ====================================================
        CHARACTERS
        ====================================================
        */

        const characters =
            document.getElementById(
                "aiCharacters"
            );


        if (characters) {

            characters.textContent =
                this.formatArray(
                    analysis.characters
                );

        }


        /*
        ====================================================
        WHAT IS HAPPENING
        ====================================================
        */

        const happening =
            document.getElementById(
                "aiHappening"
            );


        if (happening) {

            happening.textContent =
                this.formatActions(
                    analysis.actions
                );

        }


        /*
        ====================================================
        SETTING
        ====================================================
        */

        const setting =
            document.getElementById(
                "aiSetting"
            );


        if (setting) {

            setting.textContent =
                analysis.setting ||
                "Not identified.";

        }


        /*
        ====================================================
        OBJECTS
        ====================================================
        */

        const objects =
            document.getElementById(
                "aiObjects"
            );


        if (objects) {

            objects.textContent =
                this.formatArray(
                    analysis.objects
                );

        }


        /*
        ====================================================
        EMOTIONS
        ====================================================
        */

        const emotions =
            document.getElementById(
                "aiEmotions"
            );


        if (emotions) {

            emotions.textContent =
                this.formatArray(
                    analysis.emotions
                );

        }


        /*
        ====================================================
        EVENTS
        ====================================================
        */

        const events =
            document.getElementById(
                "aiEvents"
            );


        if (events) {

            events.textContent =
                this.formatArray(
                    analysis.events
                );

        }


        /*
        ====================================================
        STORY OPPORTUNITY
        ====================================================
        */

        const story =
            document.getElementById(
                "aiStory"
            );


        if (story) {

            story.textContent =
                analysis.story_opportunity ||
                "No story opportunity identified.";

        }


        /*
        ====================================================
        SHOW RESULT
        ====================================================
        */

        const result =
            document.getElementById(
                "aiResult"
            );


        if (result) {

            result.style.display =
                "block";

        }

    },


    /*
    ========================================================
    ARRAY FORMATTER
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
    ACTION FORMATTER
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
    BUTTON
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
                "🤖 Sending to AI...";

        }

        else {

            button.textContent =
                button.dataset.originalText ||
                "Analyze Scene";

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
START
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ViralAI.init();

    }
);