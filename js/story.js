"use strict";

/*
============================================================
VIRAL — AMHARIC STORY GENERATOR
STEP 03
DEMO MODE
============================================================
*/

window.ViralStory = {

    generating: false,
    approved: false,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        console.log(
            "🇪🇹 VIRAL Amharic Story system ready"
        );


        const narrationButton =
            document.getElementById(
                "narrationBtn"
            );


        if (narrationButton) {

            narrationButton.addEventListener(
                "click",
                () => {

                    this.generate();

                }
            );

        }
        else {

            console.warn(
                "⚠️ narrationBtn not found"
            );

        }


        /*
        ====================================================
        APPROVE BUTTON
        ====================================================
        */

        const approveButton =
            document.getElementById(
                "approveStoryBtn"
            );


        if (approveButton) {

            approveButton.addEventListener(
                "click",
                () => {

                    this.approveStory();

                }
            );

        }
        else {

            console.warn(
                "⚠️ approveStoryBtn not found"
            );

        }


        /*
        ====================================================
        EDIT BUTTON
        ====================================================
        */

        const editButton =
            document.getElementById(
                "editStoryBtn"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                () => {

                    this.editStory();

                }
            );

        }

    },


    /*
    ========================================================
    GENERATE
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
                    "✅ Amharic story created. Please review it."
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
    GET ANALYSIS
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
    DEMO STORY
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


        return (

            "ይህ ታሪክ ከ"
            + characters
            + " ጋር ይጀምራል። "

            + description
            + "። "

            + "ነገር ግን እዚህ ላይ "
            + "ታሪኩ የሚጠብቀን "
            + "አንድ አስገራሚ ነገር አለው። "

            + "ምን እንደሚከሰት "
            + "ለማወቅ እስከመጨረሻው "
            + "እንመልከት!"

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
    APPROVE STORY
    ========================================================
    */

    approveStory: function () {

        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (!textarea) {

            this.setStatus(
                "❌ Story box not found."
            );

            return;

        }


        const story =
            textarea.value.trim();


        if (!story) {

            this.setStatus(
                "❌ Please generate a story first."
            );

            return;

        }


        /*
        ====================================================
        SAVE APPROVED STORY
        ====================================================
        */

        this.approved =
            true;


        window.ViralProject =
            window.ViralProject || {};


        ViralProject.amharicStory =
            story;


        ViralProject.storyApproved =
            true;


        /*
        ====================================================
        UPDATE UI
        ====================================================
        */

        textarea.disabled =
            true;


        const approveButton =
            document.getElementById(
                "approveStoryBtn"
            );


        if (approveButton) {

            approveButton.disabled =
                true;

            approveButton.textContent =
                "✅ Story Approved";

        }


        this.setStatus(
            "✅ Story approved. Ready for voice generation."
        );


        console.log(
            "✅ APPROVED AMHARIC STORY:",
            story
        );


        /*
        ====================================================
        SHOW NEXT STEP
        ====================================================
        */

        this.showVoiceStep();

    },


    /*
    ========================================================
    EDIT STORY
    ========================================================
    */

    editStory: function () {

        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (!textarea) {

            return;

        }


        textarea.disabled =
            false;


        textarea.focus();


        const approveButton =
            document.getElementById(
                "approveStoryBtn"
            );


        if (approveButton) {

            approveButton.disabled =
                false;

            approveButton.textContent =
                "✅ Approve Story";

        }


        this.setStatus(
            "✏️ Story editing enabled."
        );

    },


    /*
    ========================================================
    NEXT STEP — VOICE
    ========================================================
    */

    showVoiceStep: function () {

        const voiceSection =
            document.getElementById(
                "voiceSection"
            );


        if (voiceSection) {

            voiceSection.style.display =
                "block";

            voiceSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
        else {

            console.log(
                "🔊 Voice step will be added next."
            );

        }

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
                "storyStatus"
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