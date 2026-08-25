"use strict";

/*
============================================================
VIRAL — VOICE STUDIO
STEP 04

Supports:

1. Upload narration
2. Record narration
3. AI Amharic voice
4. Voice preview
5. Voice approval
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

            console.warn(
                "⚠️ Voice upload controls not found."
            );

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

            console.warn(
                "⚠️ recordVoiceBtn not found."
            );

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

            console.warn(
                "⚠️ generateAIVoiceBtn not found."
            );

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
    GENERATE AI VOICE
    ========================================================
    */

    generateAIVoice: async function () {

        const story =
            window.ViralProject &&
            ViralProject.amharicStory;


        if (!story) {

            this.setAIStatus(
                "❌ No approved Amharic story found."
            );

            return;

        }


        const button =
            document.getElementById(
                "generateAIVoiceBtn"
            );


        if (button) {

            button.disabled =
                true;

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "🤖 Generating voice...";

        }


        this.setAIStatus(
            "🤖 Sending Amharic story to AI voice..."
        );


        try {

            const style =
                document.getElementById(
                    "aiVoiceStyle"
                )?.value ||
                "storyteller";


            const speed =
                document.getElementById(
                    "aiVoiceSpeed"
                )?.value ||
                "1";


            console.log(
                "🔊 AI VOICE REQUEST",
                {
                    style:
                        style,

                    speed:
                        speed
                }
            );


            /*
            =================================================
            CALL VERCEL API
            =================================================
            */

            const response =
                await fetch(
                    "/api/generate-voice",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                text:
                                    story,

                                voice:
                                    this.getVoiceForStyle(
                                        style
                                    ),

                                speed:
                                    Number(
                                        speed
                                    )

                            })

                    }
                );


            console.log(
                "📡 Voice API status:",
                response.status
            );


            if (!response.ok) {

                let message =
                    "AI voice generation failed.";


                try {

                    const errorData =
                        await response.json();


                    message =
                        errorData.error ||
                        message;

                }

                catch {

                    // Keep default

                }


                throw new Error(
                    message
                );

            }


            /*
            =================================================
            RECEIVE MP3
            =================================================
            */

            const audioBlob =
                await response.blob();


            if (
                !audioBlob ||
                audioBlob.size === 0
            ) {

                throw new Error(
                    "AI returned empty audio."
                );

            }


            console.log(
                "🎵 AI audio received:",
                audioBlob.size,
                "bytes"
            );


            /*
            =================================================
            STORE AUDIO
            =================================================
            */

            this.currentAudioBlob =
                audioBlob;


            this.createPreview(
                audioBlob
            );


            this.enableApproval();


            this.setAIStatus(
                "✅ AI Amharic voice generated. Please listen and approve."
            );


            console.log(
                "🎉 AI VOICE READY"
            );

        }


        catch (error) {

            console.error(
                "❌ AI VOICE ERROR:",
                error
            );


            this.setAIStatus(
                "❌ " +
                (
                    error.message ||
                    "AI voice generation failed."
                )
            );

        }


        finally {

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    button.dataset.originalText ||
                    "🤖 Generate AI Voice";

            }

        }

    },


    /*
    ========================================================
    VOICE STYLE → TTS VOICE
    ========================================================
    */

    getVoiceForStyle: function (
        style
    ) {

        /*
        ====================================================
        IMPORTANT

        These are OpenAI built-in voice names.

        The storytelling character comes primarily
        from the instructions in api/voice.js.
        ====================================================
        */

        const voices = {

            storyteller:
                "alloy",

            natural:
                "nova",

            energetic:
                "coral",

            calm:
                "shimmer"

        };


        return (
            voices[style] ||
            "alloy"
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

            console.warn(
                "⚠️ approveVoiceBtn not found."
            );

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
                "❌ Please upload, record, or generate narration first."
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
    STEP 05
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