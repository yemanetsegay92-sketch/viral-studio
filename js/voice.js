"use strict";

/*
============================================================
VIRAL — VOICE STUDIO
STEP 04

Supports:

1. Upload narration
2. Record narration in browser
3. AI voice interface

AI provider is intentionally not connected yet.
============================================================
*/

window.ViralVoice = {

    initialized: false,

    mediaRecorder: null,

    audioStream: null,

    audioChunks: [],

    currentAudioBlob: null,

    currentAudioUrl: null,

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
            "🔊 VIRAL Voice Studio ready"
        );


        this.setupSourceSelector();

        this.setupUpload();

        this.setupRecorder();

        this.setupAI();

        this.setupApproval();

    },


    /*
    ========================================================
    VOICE SOURCE
    ========================================================
    */

    setupSourceSelector: function () {

        const radios =
            document.querySelectorAll(
                'input[name="voiceSource"]'
            );


        radios.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        this.changeSource(
                            radio.value
                        );

                    }
                );

            }
        );

    },


    changeSource: function (
        source
    ) {

        const uploadPanel =
            document.getElementById(
                "uploadVoicePanel"
            );


        const aiPanel =
            document.getElementById(
                "aiVoicePanel"
            );


        if (source === "upload") {

            if (uploadPanel) {

                uploadPanel.style.display =
                    "block";

            }


            if (aiPanel) {

                aiPanel.style.display =
                    "none";

            }

        }


        if (source === "ai") {

            if (uploadPanel) {

                uploadPanel.style.display =
                    "none";

            }


            if (aiPanel) {

                aiPanel.style.display =
                    "block";

            }

        }

    },


    /*
    ========================================================
    UPLOAD AUDIO
    ========================================================
    */

    setupUpload: function () {

        const button =
            document.getElementById(
                "chooseVoiceBtn"
            );


        const input =
            document.getElementById(
                "voiceFileInput"
            );


        if (!button || !input) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                input.click();

            }
        );


        input.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];


                if (!file) {

                    return;

                }


                this.useAudioFile(
                    file
                );

            }
        );

    },


    /*
    ========================================================
    USE AUDIO FILE
    ========================================================
    */

    useAudioFile: function (
        file
    ) {

        console.log(
            "🎵 Audio selected:",
            file.name
        );


        if (
            !file.type.startsWith(
                "audio/"
            )
        ) {

            this.setStatus(
                "❌ Please choose an audio file."
            );

            return;

        }


        this.currentAudioBlob =
            file;


        this.createPreview(
            file
        );


        const fileName =
            document.getElementById(
                "voiceFileName"
            );


        if (fileName) {

            fileName.textContent =
                "📁 " + file.name;

        }


        this.enableApproval();


        this.setStatus(
            "✅ Narration loaded."
        );

    },


    /*
    ========================================================
    RECORD VOICE
    ========================================================
    */

    setupRecorder: function () {

        const button =
            document.getElementById(
                "recordVoiceBtn"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                if (
                    this.mediaRecorder &&
                    this.mediaRecorder.state ===
                        "recording"
                ) {

                    this.stopRecording();

                }

                else {

                    this.startRecording();

                }

            }
        );

    },


    /*
    ========================================================
    START RECORDING
    ========================================================
    */

    startRecording: async function () {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            this.setRecordingStatus(
                "❌ Microphone recording is not supported."
            );

            return;

        }


        try {

            this.audioStream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        audio: true
                    }
                );


            this.audioChunks = [];


            let mimeType =
                "audio/webm";


            if (
                !MediaRecorder.isTypeSupported(
                    mimeType
                )
            ) {

                mimeType =
                    "";

            }


            this.mediaRecorder =
                mimeType
                    ? new MediaRecorder(
                        this.audioStream,
                        {
                            mimeType:
                                mimeType
                        }
                    )
                    : new MediaRecorder(
                        this.audioStream
                    );


            this.mediaRecorder.ondataavailable =
                event => {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        this.audioChunks.push(
                            event.data
                        );

                    }

                };


            this.mediaRecorder.onstop =
                () => {

                    const blob =
                        new Blob(
                            this.audioChunks,
                            {
                                type:
                                    this.mediaRecorder
                                        .mimeType ||
                                    "audio/webm"
                            }
                        );


                    this.currentAudioBlob =
                        blob;


                    this.createPreview(
                        blob
                    );


                    this.enableApproval();


                    this.setRecordingStatus(
                        "✅ Recording ready."
                    );


                    if (
                        this.audioStream
                    ) {

                        this.audioStream
                            .getTracks()
                            .forEach(
                                track => {
                                    track.stop();
                                }
                            );

                    }

                };


            this.mediaRecorder.start();


            const button =
                document.getElementById(
                    "recordVoiceBtn"
                );


            if (button) {

                button.textContent =
                    "⏹️ Stop Recording";

            }


            this.setRecordingStatus(
                "🔴 Recording..."
            );

        }


        catch (error) {

            console.error(
                "❌ Microphone error:",
                error
            );


            this.setRecordingStatus(
                "❌ Microphone permission was denied or unavailable."
            );

        }

    },


    /*
    ========================================================
    STOP RECORDING
    ========================================================
    */

    stopRecording: function () {

        if (
            this.mediaRecorder &&
            this.mediaRecorder.state ===
                "recording"
        ) {

            this.mediaRecorder.stop();

        }


        const button =
            document.getElementById(
                "recordVoiceBtn"
            );


        if (button) {

            button.textContent =
                "🎙️ Record Again";

        }

    },


    /*
    ========================================================
    AUDIO PREVIEW
    ========================================================
    */

    createPreview: function (
        blob
    ) {

        const preview =
            document.getElementById(
                "voicePreview"
            );


        if (!preview) {

            return;

        }


        if (
            this.currentAudioUrl
        ) {

            URL.revokeObjectURL(
                this.currentAudioUrl
            );

        }


        this.currentAudioUrl =
            URL.createObjectURL(
                blob
            );


        preview.src =
            this.currentAudioUrl;


        preview.style.display =
            "block";

    },


    /*
    ========================================================
    AI VOICE
    ========================================================
    */

    setupAI: function () {

        const button =
            document.getElementById(
                "generateAIVoiceBtn"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                this.generateAIVoice();

            }
        );

    },


    /*
    ========================================================
    AI GENERATION
    ========================================================
    */

    generateAIVoice: function () {

        const story =
            window.ViralProject &&
            ViralProject.amharicStory;


        if (!story) {

            this.setAIStatus(
                "❌ No approved story found."
            );

            return;

        }


        /*
        ====================================================
        IMPORTANT

        No paid API call yet.

        This is intentionally waiting for
        the Amharic provider decision.
        ====================================================
        */

        this.setAIStatus(
            "🤖 AI voice provider will be connected here."
        );


        console.log(
            "🤖 AI VOICE REQUEST:",
            {
                story:
                    story,

                style:
                    document.getElementById(
                        "aiVoiceStyle"
                    )?.value,

                speed:
                    document.getElementById(
                        "aiVoiceSpeed"
                    )?.value

            }
        );

    },


    /*
    ========================================================
    APPROVAL
    ========================================================
    */

    setupApproval: function () {

        const button =
            document.getElementById(
                "approveVoiceBtn"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                this.approveVoice();

            }
        );

    },


    /*
    ========================================================
    APPROVE VOICE
    ========================================================
    */

    approveVoice: function () {

        if (
            !this.currentAudioBlob
        ) {

            this.setStatus(
                "❌ Please upload or record narration first."
            );

            return;

        }


        this.approved =
            true;


        window.ViralProject =
            window.ViralProject || {};


        ViralProject.voiceBlob =
            this.currentAudioBlob;


        ViralProject.voiceApproved =
            true;


        const button =
            document.getElementById(
                "approveVoiceBtn"
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "✅ Voice Approved";

        }


        this.setApprovedStatus(
            "✅ Voice approved. Ready for subtitles and final video."
        );


        console.log(
            "🔊 APPROVED VOICE:",
            this.currentAudioBlob
        );


        /*
        ====================================================
        NEXT STEP
        ====================================================
        */

        this.showSubtitleStep();

    },


    /*
    ========================================================
    ENABLE APPROVAL
    ========================================================
    */

    enableApproval: function () {

        const button =
            document.getElementById(
                "approveVoiceBtn"
            );


        if (button) {

            button.disabled =
                false;

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

        const element =
            document.getElementById(
                "recordingStatus"
            );


        if (element) {

            element.textContent =
                message;

        }


        console.log(
            message
        );

    },


    setRecordingStatus: function (
        message
    ) {

        const element =
            document.getElementById(
                "recordingStatus"
            );


        if (element) {

            element.textContent =
                message;

        }

    },


    setAIStatus: function (
        message
    ) {

        const element =
            document.getElementById(
                "aiVoiceStatus"
            );


        if (element) {

            element.textContent =
                message;

        }


        console.log(
            message
        );

    },


    setApprovedStatus: function (
        message
    ) {

        const element =
            document.getElementById(
                "voiceApprovedStatus"
            );


        if (element) {

            element.textContent =
                message;

        }

    },


    /*
    ========================================================
    SUBTITLE STEP
    ========================================================
    */

    showSubtitleStep: function () {

        const subtitleSection =
            document.getElementById(
                "subtitleSection"
            );


        if (subtitleSection) {

            subtitleSection.style.display =
                "block";


            subtitleSection.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"

            });

        }
        else {

            console.log(
                "📝 Subtitle step will be added next."
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

        ViralVoice.init();

    }
);