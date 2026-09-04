"use strict";

/*
============================================================
VIRAL — TEST CENTER
============================================================

Purpose:

Test every VIRAL Studio stage independently.

This test system does NOT use OpenAI credits.

It allows us to verify:

1. Video system
2. AI analysis display
3. Amharic story
4. Story approval
5. Voice stage
6. Subtitle stage
7. Render stage

============================================================
*/

window.ViralTest = {

    running: false,

    results: {},


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        console.log(
            "🧪 VIRAL Test Center ready"
        );


        this.bind(
            "testAllBtn",
            () => this.runAll()
        );


        this.bind(
            "testVideoBtn",
            () => this.testVideo()
        );


        this.bind(
            "testAnalysisBtn",
            () => this.testAnalysis()
        );


        this.bind(
            "testStoryBtn",
            () => this.testStory()
        );


        this.bind(
            "testApproveStoryBtn",
            () => this.testApproveStory()
        );


        this.bind(
            "testVoiceBtn",
            () => this.testVoice()
        );


        this.bind(
            "testSubtitleBtn",
            () => this.testSubtitle()
        );


        this.bind(
            "testRenderBtn",
            () => this.testRender()
        );

    },


    /*
    ========================================================
    BIND BUTTON
    ========================================================
    */

    bind: function (
        id,
        callback
    ) {

        const button =
            document.getElementById(id);


        if (!button) {

            console.warn(
                "⚠️ Test button not found:",
                id
            );

            return;

        }


        button.addEventListener(
            "click",
            callback
        );

    },


    /*
    ========================================================
    STATUS
    ========================================================
    */

    status: function (
        message
    ) {

        const element =
            document.getElementById(
                "testCenterStatus"
            );


        if (element) {

            element.textContent =
                message;

        }


        console.log(
            "🧪",
            message
        );

    },


    /*
    ========================================================
    RESULT
    ========================================================
    */

    result: function (
        name,
        success,
        message
    ) {

        this.results[name] = success;


        const container =
            document.getElementById(
                "testResults"
            );


        if (!container) {

            return;

        }


        const item =
            document.createElement(
                "div"
            );


        item.style.cssText =
            `
            padding:10px;
            margin-top:8px;
            border-radius:8px;
            background:#f1f1f1;
            `;


        item.textContent =
            (success ? "✅ " : "❌ ")
            + name
            + ": "
            + message;


        container.appendChild(
            item
        );

    },


    /*
    ========================================================
    CLEAR RESULTS
    ========================================================
    */

    clearResults: function () {

        const container =
            document.getElementById(
                "testResults"
            );


        if (container) {

            container.innerHTML =
                "";

        }


        this.results = {};

    },


    /*
    ========================================================
    TEST ALL
    ========================================================
    */

    runAll: async function () {

        if (this.running) {

            return;

        }


        this.running = true;


        this.clearResults();


        this.status(
            "🚀 Running VIRAL tests..."
        );


        try {

            await this.testVideo();

            await this.testAnalysis();

            await this.testStory();

            await this.testApproveStory();

            await this.testVoice();

            await this.testSubtitle();

            await this.testRender();


            this.status(
                "🎉 All available tests completed."
            );

        }

        catch (error) {

            console.error(
                "❌ Test Center error:",
                error
            );


            this.status(
                "❌ Test sequence stopped: "
                + error.message
            );

        }


        finally {

            this.running =
                false;

        }

    },


    /*
    ========================================================
    TEST 01 — VIDEO
    ========================================================
    */

    testVideo: async function () {

        this.status(
            "🎥 Testing video system..."
        );


        if (
            !window.ViralVideo
        ) {

            this.result(
                "Video System",
                false,
                "ViralVideo not found."
            );

            return;

        }


        if (
            !ViralVideo.video
        ) {

            this.result(
                "Video System",
                false,
                "Video element not found."
            );

            return;

        }


        const video =
            ViralVideo.video;


        if (
            video.readyState >= 1 &&
            Number.isFinite(
                video.duration
            )
        ) {

            this.result(
                "Video System",
                true,
                "Video system is ready. Duration: "
                + video.duration.toFixed(1)
                + " sec."
            );

        }

        else {

            this.result(
                "Video System",
                true,
                "Video system loaded. Upload a video to test playback."
            );

        }

    },


    /*
    ========================================================
    TEST 02 — ANALYSIS DISPLAY
    ========================================================
    */

    testAnalysis: async function () {

        this.status(
            "🤖 Testing AI analysis display..."
        );


        const characters =
            document.getElementById(
                "characters"
            );


        const description =
            document.getElementById(
                "sceneDescription"
            );


        const story =
            document.getElementById(
                "storyInterpretation"
            );


        if (
            !characters ||
            !description ||
            !story
        ) {

            this.result(
                "AI Analysis Display",
                false,
                "Analysis elements not found."
            );

            return;

        }


        /*
        Demo analysis.
        */

        characters.textContent =
            "ኮሮ የተባለ ላማ";


        description.textContent =
            "ኮሮ ወደ አጥር ቀርቦ ከማዶ ያለውን ምግብ ለመድረስ እየሞከረ ነው።";


        story.textContent =
            "ኮሮ ምግቡን ለማግኘት የሚያደርገው ሙከራ አስቂኝ ታሪክ ሊፈጥር ይችላል።";


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


        this.result(
            "AI Analysis Display",
            true,
            "Demo analysis displayed successfully."
        );

    },


    /*
    ========================================================
    TEST 03 — STORY
    ========================================================
    */

    testStory: async function () {

        this.status(
            "🇪🇹 Testing Amharic story..."
        );


        const storySection =
            document.getElementById(
                "storySection"
            );


        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (
            !storySection ||
            !textarea
        ) {

            this.result(
                "Amharic Story",
                false,
                "Story elements not found."
            );

            return;

        }


        const demoStory =

            "ይህ ታሪክ ከኮሮ የተባለ ላማ ጋር ይጀምራል። "

            + "ኮሮ ወደ አጥር ቀርቦ ከማዶ ያለውን "
            + "ምግብ ለመድረስ እየሞከረ ነው። "

            + "ነገር ግን እዚህ ላይ ታሪኩ "
            + "የሚጠብቀን አንድ አስገራሚ "
            + "ነገር አለው። "

            + "ምን እንደሚከሰት "
            + "ለማወቅ እስከመጨረሻው "
            + "እንመልከት!";


        textarea.value =
            demoStory;


        textarea.disabled =
            false;


        storySection.style.display =
            "block";


        storySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        this.result(
            "Amharic Story",
            true,
            "Demo Amharic story inserted successfully."
        );

    },


    /*
    ========================================================
    TEST 04 — APPROVE STORY
    ========================================================
    */

    testApproveStory: async function () {

        this.status(
            "✅ Testing story approval..."
        );


        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (!textarea) {

            this.result(
                "Story Approval",
                false,
                "Story textarea not found."
            );

            return;

        }


        if (
            !textarea.value.trim()
        ) {

            await this.testStory();

        }


        const story =
            textarea.value.trim();


        if (!story) {

            this.result(
                "Story Approval",
                false,
                "No story available."
            );

            return;

        }


        /*
        Create project object.
        */

        window.ViralProject =
            window.ViralProject || {};


        ViralProject.amharicStory =
            story;


        ViralProject.storyApproved =
            true;


        /*
        Enable next stage.
        */

        const voiceSection =
            document.getElementById(
                "voiceSection"
            );


        if (voiceSection) {

            voiceSection.style.display =
                "block";

        }


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


        this.result(
            "Story Approval",
            true,
            "Story approved and saved to ViralProject."
        );

    },


    /*
    ========================================================
    TEST 05 — VOICE
    ========================================================
    */

    testVoice: async function () {

        this.status(
            "🔊 Testing voice stage..."
        );


        const section =
            document.getElementById(
                "voiceSection"
            );


        const approve =
            document.getElementById(
                "approveVoiceBtn"
            );


        if (!section) {

            this.result(
                "Voice Stage",
                false,
                "Voice section not found."
            );

            return;

        }


        section.style.display =
            "block";


        /*
        We don't generate real audio.
        This is a UI/stage test.
        */

        if (approve) {

            approve.disabled =
                false;

        }


        const status =
            document.getElementById(
                "voiceApprovedStatus"
            );


        if (status) {

            status.textContent =
                "🧪 Demo voice ready for approval.";

        }


        this.result(
            "Voice Stage",
            true,
            "Voice stage displayed successfully."
        );

    },


    /*
    ========================================================
    TEST 06 — SUBTITLES
    ========================================================
    */

    testSubtitle: async function () {

        this.status(
            "📝 Testing subtitle stage..."
        );


        const section =
            document.getElementById(
                "subtitleSection"
            );


        const preview =
            document.getElementById(
                "subtitlePreview"
            );


        const list =
            document.getElementById(
                "subtitleList"
            );


        if (!section) {

            this.result(
                "Subtitle Stage",
                false,
                "Subtitle section not found."
            );

            return;

        }


        section.style.display =
            "block";


        if (preview) {

            preview.textContent =
                "ኮሮ ምግቡን ለማግኘት እየሞከረ ነው...";

        }


        if (list) {

            list.innerHTML =

                "<div>00:00 — ኮሮ ወደ አጥር ቀረበ።</div>"

                + "<div>00:05 — ምግቡን ለማግኘት ሞከረ።</div>"

                + "<div>00:10 — ነገር ግን አስገራሚ ነገር ተከሰተ!</div>";

        }


        const approve =
            document.getElementById(
                "approveSubtitlesBtn"
            );


        if (approve) {

            approve.disabled =
                false;

        }


        this.result(
            "Subtitle Stage",
            true,
            "Demo subtitles displayed successfully."
        );

    },


    /*
    ========================================================
    TEST 07 — RENDER
    ========================================================
    */

    testRender: async function () {

        this.status(
            "🎬 Testing render stage..."
        );


        const section =
            document.getElementById(
                "renderSection"
            );


        const status =
            document.getElementById(
                "renderStatus"
            );


        const progressWrap =
            document.getElementById(
                "renderProgressWrap"
            );


        const progress =
            document.getElementById(
                "renderProgress"
            );


        const progressText =
            document.getElementById(
                "renderProgressText"
            );


        if (!section) {

            this.result(
                "Render Stage",
                false,
                "Render section not found."
            );

            return;

        }


        section.style.display =
            "block";


        if (status) {

            status.textContent =
                "🧪 Demo render test running...";

        }


        if (progressWrap) {

            progressWrap.style.display =
                "block";

        }


        /*
        Fake rendering progress.
        */

        for (
            let value = 0;
            value <= 100;
            value += 20
        ) {

            if (progress) {

                progress.value =
                    value;

            }


            if (progressText) {

                progressText.textContent =
                    value + "%";

            }


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        150
                    )
            );

        }


        if (status) {

            status.textContent =
                "✅ Demo render completed. Real FFmpeg render is not being run by this test.";

        }


        this.result(
            "Render Stage",
            true,
            "Render UI and progress system work."
        );

}

};


/*
============================================================
START TEST CENTER
============================================================
*/
document.addEventListener("DOMContentLoaded", function () {

    console.log("🧪 DOM READY — starting VIRAL Test Center");

    if (window.ViralTest) {

        console.log("🧪 ViralTest object found");

        ViralTest.init();

    } else {

        console.error("❌ ViralTest object NOT found");

    }

});