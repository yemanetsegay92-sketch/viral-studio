"use strict";

/*
============================================================
VIRAL — AMHARIC STORY GENERATOR
STEP 03
DEMO MODE

This version does NOT call a paid AI API.

It creates a demo Amharic narration from
the scene-analysis information.

Later we can replace the demo generator
with a real AI request without changing
the rest of the interface.
============================================================
*/

window.ViralStory = {

    generating: false,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        console.log(
            "🇪🇹 VIRAL Amharic Story system ready"
        );


        const button =
            document.getElementById(
                "narrationBtn"
            );


        if (!button) {

            console.warn(
                "⚠️ narrationBtn not found"
            );

            return;

        }


        button.addEventListener(
            "click",
            () => {

                this.generate();

            }
        );

    },


    /*
    ========================================================
    GENERATE STORY
    ========================================================
    */

    generate: function () {

        if (this.generating) {

            return;

        }


        this.generating = true;


        this.setButtonState(
            true
        );


        this.setStatus(
            "🇪🇹 Creating Amharic story..."
        );


        /*
        ====================================================
        GET CURRENT ANALYSIS
        ====================================================
        */

        const analysis =
            this.getAnalysis();


        console.log(
            "📖 Story input:",
            analysis
        );


        /*
        ====================================================
        DEMO GENERATION
        ====================================================
        */

        setTimeout(
            () => {

                const story =
                    this.createDemoStory(
                        analysis
                    );


                this.displayStory(
                    story
                );


                this.setStatus(
                    "✅ Amharic story created."
                );


                this.generating =
                    false;


                this.setButtonState(
                    false
                );

            },
            700
        );

    },


    /*
    ========================================================
    GET ANALYSIS FROM SCREEN
    ========================================================
    */

    getAnalysis: function () {

        const characters =
            document.getElementById(
                "characters"
            );


        const description =
            document.getElementById(
                "sceneDescription"
            );


        const interpretation =
            document.getElementById(
                "storyInterpretation"
            );


        return {

            characters:
                characters
                    ? characters.textContent
                    : "",

            description:
                description
                    ? description.textContent
                    : "",

            interpretation:
                interpretation
                    ? interpretation.textContent
                    : ""

        };

    },


    /*
    ========================================================
    DEMO AMHARIC STORY
    ========================================================
    */

    createDemoStory: function (
        analysis
    ) {

        const characters =
            analysis.characters ||
            "ዋናው ገጸ ባህሪ";


        const description =
            analysis.description ||
            "አንድ አስደሳች ነገር እየተከሰተ ነው";


        /*
        ====================================================
        DEMO NARRATION

        This is intentionally written as storytelling,
        not word-for-word translation.
        ====================================================
        */

        return (
            "ይህ ታሪክ ከ"
            + characters
            + " ጋር ይጀምራል። "

            + description
            + "። "

            + "ነገር ግን እዚህ ላይ ታሪኩ "
            + "የሚጠብቀን አንድ አስገራሚ ነገር "
            + "አለው። "

            + "ምን እንደሚከሰት ለማወቅ "
            + "እስከመጨረሻው እንመልከት!"
        );

    },


    /*
    ========================================================
    DISPLAY STORY
    ========================================================
    */

    displayStory: function (
        story
    ) {

        const section =
            document.getElementById(
                "storySection"
            );


        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (textarea) {

            textarea.value =
                story;

        }


        if (section) {

            section.style.display =
                "block";

        }


        console.log(
            "🇪🇹 AMHARIC STORY:",
            story
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
                "narrationBtn"
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
                "🇪🇹 Creating...";

        }

        else {

            button.textContent =
                button.dataset.originalText ||
                "🇪🇹 Generate Amharic Story";

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


        const status =
            document.getElementById(
                "status"
            );


        if (status) {

            status.textContent =
                message;

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

        ViralStory.init();

    }
);