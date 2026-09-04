"use strict";

/*
============================================================
VIRAL — SUBTITLE STUDIO
STEP 05

Free subtitle generation.

Uses the approved Amharic story already produced by VIRAL.
No AI API call is required.
============================================================
*/

window.ViralSubtitles = {

    initialized: false,

    subtitles: [],

    approved: false,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.log(
            "📝 VIRAL Subtitle Studio ready"
        );

        this.setupButtons();

        this.setupSettings();

    },


    /*
    ========================================================
    BUTTONS
    ========================================================
    */

    setupButtons: function () {

        const generateBtn =
            document.getElementById(
                "generateSubtitlesBtn"
            );

        const approveBtn =
            document.getElementById(
                "approveSubtitlesBtn"
            );


        if (generateBtn) {

            generateBtn.addEventListener(
                "click",
                () => {

                    this.generate();

                }
            );

        }


        if (approveBtn) {

            approveBtn.addEventListener(
                "click",
                () => {

                    this.approve();

                }
            );

        }

    },


    /*
    ========================================================
    SETTINGS
    ========================================================
    */

    setupSettings: function () {

        const size =
            document.getElementById(
                "subtitleSize"
            );


        if (size) {

            size.addEventListener(
                "input",
                () => {

                    this.updatePreviewStyle();

                }
            );

        }

    },


    /*
    ========================================================
    GET STORY
    ========================================================
    */

    getStory: function () {

        /*
        ----------------------------------------------------
        First try the project state.
        ----------------------------------------------------
        */

        if (
            window.ViralProject &&
            ViralProject.amharicStory
        ) {

            return ViralProject.amharicStory;

        }


        /*
        ----------------------------------------------------
        Fallback to textarea.
        ----------------------------------------------------
        */

        const textarea =
            document.getElementById(
                "amharicStory"
            );


        if (
            textarea &&
            textarea.value.trim()
        ) {

            return textarea.value.trim();

        }


        return "";

    },


    /*
    ========================================================
    GENERATE
    ========================================================
    */

    generate: function () {

        const story =
            this.getStory();


        if (!story) {

            this.setStatus(
                "❌ No approved Amharic story found."
            );

            return;

        }


        console.log(
            "📝 Generating subtitles from story..."
        );


        const duration =
            this.getVideoDuration();


        this.subtitles =
            this.createSubtitleSegments(
                story,
                duration
            );


        if (
            this.subtitles.length === 0
        ) {

            this.setStatus(
                "❌ Could not create subtitles."
            );

            return;

        }


        this.renderList();

        this.renderPreview(
            this.subtitles[0]
        );


        const approveBtn =
            document.getElementById(
                "approveSubtitlesBtn"
            );


        if (approveBtn) {

            approveBtn.disabled =
                false;

        }


        this.setStatus(
            "✅ "
            + this.subtitles.length
            + " subtitle segments created."
        );


        console.log(
            "📝 SUBTITLES:",
            this.subtitles
        );

    },


    /*
    ========================================================
    CREATE SEGMENTS
    ========================================================
    */

    createSubtitleSegments: function (
        story,
        duration
    ) {

        /*
        ----------------------------------------------------
        Split by sentence punctuation.
        ----------------------------------------------------
        */

        let sentences =
            story
                .replace(
                    /\r\n/g,
                    "\n"
                )
                .split(
                    /(?<=[።!?])\s+|\n+/
                )
                .map(
                    text => text.trim()
                )
                .filter(
                    text => text.length > 0
                );


        /*
        ----------------------------------------------------
        If punctuation splitting didn't work,
        split by words.
        ----------------------------------------------------
        */

        if (
            sentences.length === 1 &&
            sentences[0].length > 90
        ) {

            const words =
                sentences[0].split(/\s+/);

            sentences = [];

            let current = "";

            words.forEach(
                word => {

                    if (
                        (
                            current +
                            " " +
                            word
                        ).trim().length > 70
                    ) {

                        if (current) {

                            sentences.push(
                                current.trim()
                            );

                        }

                        current =
                            word;

                    }

                    else {

                        current =
                            (
                                current +
                                " " +
                                word
                            ).trim();

                    }

                }
            );


            if (current) {

                sentences.push(
                    current.trim()
                );

            }

        }


        if (
            sentences.length === 0
        ) {

            return [];

        }


        /*
        ----------------------------------------------------
        Calculate timing.
        ----------------------------------------------------
        */

        const safeDuration =
            Math.max(
                duration || 30,
                1
            );


        const segmentDuration =
            safeDuration /
            sentences.length;


        return sentences.map(
            (
                text,
                index
            ) => {

                const start =
                    index *
                    segmentDuration;


                const end =
                    (
                        index + 1
                    ) *
                    segmentDuration;


                return {

                    id:
                        index + 1,

                    text:
                        text,

                    start:
                        start,

                    end:
                        Math.min(
                            end,
                            safeDuration
                        )

                };

            }
        );

    },


    /*
    ========================================================
    VIDEO DURATION
    ========================================================
    */

    getVideoDuration: function () {

        if (
            window.ViralVideo &&
            ViralVideo.video
        ) {

            const video =
                ViralVideo.video;


            /*
            ------------------------------------------------
            Use selected scene duration.
            ------------------------------------------------
            */

            if (
                typeof ViralVideo.getSelection ===
                    "function"
            ) {

                const selection =
                    ViralVideo.getSelection();


                if (
                    selection &&
                    selection.duration > 0
                ) {

                    return selection.duration;

                }

            }


            if (
                Number.isFinite(
                    video.duration
                )
            ) {

                return video.duration;

            }

        }


        return 30;

    },


    /*
    ========================================================
    RENDER LIST
    ========================================================
    */

    renderList: function () {

        const list =
            document.getElementById(
                "subtitleList"
            );


        if (!list) {
            return;
        }


        list.innerHTML = "";


        this.subtitles.forEach(
            subtitle => {
                subtitle.voiceProfile = subtitle.voiceProfile || (window.ViralProject?.defaultCharacterVoice || "narrator");

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "subtitle-row";


                row.innerHTML = `

                    <div class="subtitle-time">
                        ${this.formatTime(subtitle.start)}
                        →
                        ${this.formatTime(subtitle.end)}
                    </div>

                    <textarea
                        class="subtitle-text"
                        data-id="${subtitle.id}"
                        rows="2"
                    >${this.escapeHtml(subtitle.text)}</textarea>

                    <select class="subtitle-voice" data-id="${subtitle.id}" style="margin-top:8px;width:100%;">
                        ${this.voiceOptions(subtitle.voiceProfile)}
                    </select>

                `;


                list.appendChild(
                    row
                );


                const textarea =
                    row.querySelector(
                        ".subtitle-text"
                    );


                textarea.addEventListener(
                    "input",
                    event => {

                        const id =
    Number(
        event.target.dataset.id
    );

const item =
    this.subtitles.find(
        subtitle =>
            subtitle.id === id
    );

if (item) {

    item.text =
        event.target.value;

}

                    }
                );

            }
        );

    },


    /*
    ========================================================
    PREVIEW
    ========================================================
    */

    renderPreview: function (
        subtitle
    ) {

        const preview =
            document.getElementById(
                "subtitlePreview"
            );


        if (!preview || !subtitle) {
            return;
        }


        preview.textContent =
            subtitle.text;


        this.updatePreviewStyle();

    },


    /*
    ========================================================
    STYLE
    ========================================================
    */

    updatePreviewStyle: function () {

        const preview =
            document.getElementById(
                "subtitlePreview"
            );


        const size =
            document.getElementById(
                "subtitleSize"
            );


        if (
            preview &&
            size
        ) {

            preview.style.fontSize =
                size.value + "px";

        }

    },



    voiceOptions: function (selected) {

        const value = selected || "narrator";
        const options = [
            ["narrator", "🎙️ Narrator — natural"],
            ["deep", "🧔 Deep — low / strong"],
            ["child", "👦 Child — high / playful"],
            ["high", "🐦 High — bright"],
            ["old", "👴 Old — low / gentle"],
            ["robot", "🤖 Robot — electronic"],
            ["echo", "👻 Echo — dramatic"],
            ["funny", "😂 Funny — comic"],
            ["strong", "😠 Strong — powerful"],
            ["soft", "😌 Soft — quiet"]
        ];
        return options.map(([id,label]) => `<option value="${id}" ${id === value ? "selected" : ""}>${label}</option>`).join("");
    },

    /*
    ========================================================
    APPROVE
    ========================================================
    */

    approve: function () {

        /*
        ----------------------------------------------------
        Read edited subtitle text.
        ----------------------------------------------------
        */

        const fields =
            document.querySelectorAll(
                ".subtitle-text"
            );


        fields.forEach(
            field => {

                const id =
                    Number(
                        field.dataset.id
                    );


                const subtitle =
                    this.subtitles.find(
                        item =>
                            item.id === id
                    );


                if (subtitle) {

                    subtitle.text =
                        field.value.trim();

                }

            }
        );


        const voiceFields = document.querySelectorAll(".subtitle-voice");
        voiceFields.forEach(field => {
            const id = Number(field.dataset.id);
            const subtitle = this.subtitles.find(item => item.id === id);
            if (subtitle) subtitle.voiceProfile = field.value || "narrator";
        });

        this.approved =
            true;


        window.ViralProject =
            window.ViralProject || {};


        ViralProject.subtitles =
            this.subtitles;


        ViralProject.subtitlesApproved =
            true;


        const button =
            document.getElementById(
                "approveSubtitlesBtn"
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "✅ Subtitles Approved";

        }


        this.setStatus(
            "✅ Subtitles approved. Ready for final video."
        );


        console.log(
            "📝 APPROVED SUBTITLES:",
            this.subtitles
        );


        /*
        ----------------------------------------------------
        Next step will be the video editor/rendering stage.
        ----------------------------------------------------
        */

        this.showRenderStep();

    },


    /*
    ========================================================
    FORMAT TIME
    ========================================================
    */

    formatTime: function (
        seconds
    ) {

        const minutes =
            Math.floor(
                seconds / 60
            );


        const remaining =
            seconds % 60;


        return (
            String(minutes)
                .padStart(2, "0")
            +
            ":" +
            remaining
                .toFixed(1)
                .padStart(4, "0")
        );

    },


    /*
    ========================================================
    ESCAPE TEXT
    ========================================================
    */

    escapeHtml: function (
        text
    ) {

        return String(text)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    },


    /*
    ========================================================
    STATUS
    ========================================================
    */

    setStatus: function (
        message
    ) {

        const status =
            document.getElementById(
                "subtitleStatus"
            );


        if (status) {

            status.textContent =
                message;

        }


        console.log(
            message
        );

    },


    /*
    ========================================================
    SHOW NEXT STEP
    ========================================================
    */

    showRenderStep: function () {

        const renderSection =
            document.getElementById(
                "renderSection"
            );


        if (renderSection) {

            renderSection.style.display =
                "block";


            renderSection.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"

            });

        }
        else {

            console.log(
                "🎬 Ready for final video stage."
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

        ViralSubtitles.init();

    }
);