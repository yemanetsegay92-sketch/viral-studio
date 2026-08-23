"use strict";

/*
============================================================
VIRAL — AI SCENE ANALYSIS
V2B FRONTEND
============================================================

Video.js extracts the frames.

This file:
    1. Gets those frames
    2. Sends them to /api/analyze
    3. Receives the AI analysis
    4. Displays the result
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
            "🤖 VIRAL AI system ready"
        );

        const button =
            document.getElementById(
                "analyzeBtn"
            );

        if (!button) {

            console.warn(
                "⚠️ Analyze button not found"
            );

            return;

        }


        button.addEventListener(
            "click",
            () => {

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


        /*
        ====================================================
        CHECK VIDEO SYSTEM
        ====================================================
        */

        if (
            !window.ViralVideo ||
            !ViralVideo.video
        ) {

            this.showError(
                "No video system available."
            );

            return;

        }


        /*
        ====================================================
        CHECK VIDEO
        ====================================================
        */

        if (
            !ViralVideo.video.src
        ) {

            this.showError(
                "No video selected."
            );

            return;

        }


        /*
        ====================================================
        GET SELECTION
        ====================================================
        */

        const selection =
            ViralVideo.getSelection();


        if (
            selection.duration < 1
        ) {

            this.showError(
                "Please select a scene first."
            );

            return;

        }


        /*
        ====================================================
        START
        ====================================================
        */

        this.analyzing = true;

        this.setButtonState(
            true
        );


        this.setStatus(
            "🎞️ Preparing scene frames..."
        );


        try {

            /*
            ================================================
            EXTRACT FRAMES
            ================================================
            */

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
                "🖼️ Frames extracted:",
                frames.length
            );


            this.setStatus(
                "🤖 Sending "
                + frames.length
                + " frames to AI..."
            );


            /*
            ================================================
            SEND TO BACKEND
            ================================================
            */

            const response =
                await fetch(
                    "/api/analyze",
                    {

                        method: "POST",

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


            /*
            ================================================
            READ RESPONSE
            ================================================
            */

            const data =
                await response.json();


            console.log(
                "🤖 AI response:",
                data
            );


            /*
            ================================================
            SERVER ERROR
            ================================================
            */

            if (!response.ok) {

                throw new Error(

                    data.error ||
                    "AI analysis failed."

                );

            }


            if (
                !data.success ||
                !data.analysis
            ) {

                throw new Error(
                    "AI returned no analysis."
                );

            }


            /*
            ================================================
            DISPLAY
            ================================================
            */

            this.displayAnalysis(
                data.analysis
            );


            this.setStatus(
                "✅ Scene analysis complete."
            );


        }

        catch (error) {

            console.error(
                "❌ VIRAL AI error:",
                error
            );


            this.showError(
                error.message ||
                "AI analysis failed."
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
            "📋 Scene analysis:",
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
        WHAT IS HAPPENING?
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
        SHOW RESULT PANEL
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

        if (
            window.ViralVideo &&
            typeof ViralVideo.setStatus ===
                "function"
        ) {

            ViralVideo.setStatus(
                message
            );

        }

        else {

            console.log(
                message
            );

        }

    },


    /*
    ========================================================
    ERROR
    ========================================================
    */

    showError: function (
        message
    ) {

        console.error(
            "❌",
            message
        );


        this.setStatus(
            "❌ " + message
        );

    }

};


/*
============================================================
START AI SYSTEM
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ViralAI.init();

    }
);