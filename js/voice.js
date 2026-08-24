"use strict";

/*
============================================================
VIRAL — VOICE STUDIO
STEP 04
============================================================

Supports:

1. Upload narration
2. Record narration
3. AI voice placeholder
4. Approve voice
5. Continue to subtitles

No paid AI voice API yet.
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
            "🔊 VIRAL VOICE STUDIO READY"
        );

        this.setupEvents();

    },


    /*
    ========================================================
    EVENT DELEGATION
    ========================================================
    */

    setupEvents: function () {

        document.addEventListener(
            "click",
            event => {

                /*
                --------------------------------------------
                CHOOSE FILE
                --------------------------------------------
                */

                if (
                    event.target.closest(
                        "#chooseVoiceBtn"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "📁 CHOOSE VOICE FILE CLICKED"
                    );

                    const input =
                        document.getElementById(
                            "voiceFileInput"
                        );

                    if (input) {

                        input.click();

                    }
                    else {

                        console.error(
                            "❌ voiceFileInput not found"
                        );

                    }

                    return;

                }


                /*
                --------------------------------------------
                RECORD
                --------------------------------------------
                */

                if (
                    event.target.closest(
                        "#recordVoiceBtn"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "🎙️ RECORD BUTTON CLICKED"
                    );

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

                    return;

                }


                /*
                --------------------------------------------
                AI VOICE
                --------------------------------------------
                */

                if (
                    event.target.closest(
                        "#generateAIVoiceBtn"
                    )
                ) {

                    event.preventDefault();

                    this.generateAIVoice();

                    return;

                }


                /*
                --------------------------------------------
                APPROVE
                --------------------------------------------
                */

                if (
                    event.target.closest(
                        "#approveVoiceBtn"
                    )
                ) {

                    event.preventDefault();

                    this.approveVoice();

                    return;

                }

            }
        );


        /*
        ====================================================
        FILE INPUT
        ====================================================
        */

        document.addEventListener(
            "change",
            event => {

                if (
                    event.target.id !==
                    "voiceFileInput"
                ) {

                    return;

                }


                const file =
                    event.target.files &&
                    event.target.files[0];


                if (!file) {

                    return;

                }


                console.log(
                    "🎵 AUDIO FILE SELECTED:",
                    file.name
                );


                this.useAudioFile(
                    file
                );

            }
        );

    },


    /*
    ========================================================
    UPLOAD AUDIO
    ========================================================
    */

    useAudioFile: function (
        file
    ) {

        if (
            !file.type ||
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


        console.log(
            "✅ AUDIO READY"
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

            console.log(
                "🎙️ Requesting microphone..."
            );


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

                mimeType = "";

            }


            if (mimeType) {

                this.mediaRecorder =
                    new MediaRecorder(
                        this.audioStream,
                        {
                            mimeType:
                                mimeType
                        }
                    );

            }
            else {

                this.mediaRecorder =
                    new MediaRecorder(
                        this.audioStream
                    );

            }


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


                    console.log(
                        "🎙️ RECORDING COMPLETE:",
                        blob.size,
                        "bytes"
                    );


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


            console.log(
                "🔴 RECORDING STARTED"
            );

        }


        catch (error) {

            console.error(
                "❌ MICROPHONE ERROR:",
                error
            );


            this.setRecordingStatus(
                "❌ Microphone permission denied or unavailable."
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

            console.warn(
                "⚠️ voicePreview not found"
            );

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


        preview.load();

    },


    /*
    ========================================================
    AI VOICE
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


        this.setAIStatus(
            "🤖 AI voice provider will be connected here."
        );


        console.log(
            "🤖 AI VOICE REQUEST",
            {
                story:
                    story
            }
        );

    },


    /*
    ========================================================
    APPROVE
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


        window.ViralProject =
            window.ViralProject || {};


        ViralProject.voiceBlob =
            this.currentAudioBlob;


        ViralProject.voiceApproved =
            true;


        this.approved =
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
    SHOW SUBTITLES
    ========================================================
    */

    showSubtitleStep: function () {

        const section =
            document.getElementById(
                "subtitleSection"
            );


        if (section) {

            section.style.display =
                "block";


            section.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"

            });

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