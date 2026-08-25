"use strict";

/*
============================================================
VIRAL — AI VOICE API
/api/generate-voice

Browser
   ↓
POST /api/generate-voice
   ↓
OpenAI TTS
   ↓
Audio response

The OpenAI API key is NEVER exposed to the browser.
============================================================
*/

export default async function handler(req, res) {

    /*
    ========================================================
    ONLY POST
    ========================================================
    */

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed."
        });

    }


    /*
    ========================================================
    CHECK API KEY
    ========================================================
    */

    const apiKey =
        process.env.OPENAI_API_KEY;


    if (!apiKey) {

        console.error(
            "❌ OPENAI_API_KEY is not configured."
        );

        return res.status(500).json({
            error:
                "OpenAI API key is not configured on the server."
        });

    }


    /*
    ========================================================
    READ REQUEST
    ========================================================
    */

    try {

        const {
            text,
            voice,
            speed
        } = req.body || {};


        /*
        ====================================================
        VALIDATE TEXT
        ====================================================
        */

        if (
            !text ||
            typeof text !== "string" ||
            !text.trim()
        ) {

            return res.status(400).json({
                error:
                    "Narration text is required."
            });

        }


        /*
        ====================================================
        SAFE VALUES
        ====================================================
        */

        const selectedVoice =
            typeof voice === "string" &&
            voice.trim()
                ? voice.trim()
                : "alloy";


        const selectedSpeed =
            Number(speed) || 1;


        /*
        ====================================================
        LIMIT SPEED
        ====================================================
        */

        const safeSpeed =
            Math.min(
                4,
                Math.max(
                    0.25,
                    selectedSpeed
                )
            );


        console.log(
            "🔊 VIRAL AI VOICE REQUEST",
            {
                textLength:
                    text.length,

                voice:
                    selectedVoice,

                speed:
                    safeSpeed
            }
        );


        /*
        ====================================================
        OPENAI TTS
        ====================================================
        */

        const response =
            await fetch(
                "https://api.openai.com/v1/audio/speech",
                {

                    method:
                        "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${apiKey}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            model:
                                "gpt-4o-mini-tts",

                            voice:
                                selectedVoice,

                            input:
                                text,

                            speed:
                                safeSpeed,

                            instructions:
                                "Speak the Amharic narration naturally and clearly. Use a warm, expressive storyteller style suitable for a short animated video. Pronounce Amharic words clearly and maintain natural pacing."

                        })

                }
            );


        /*
        ====================================================
        HANDLE OPENAI ERROR
        ====================================================
        */

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "❌ OPENAI TTS ERROR:",
                response.status,
                errorText
            );


            return res.status(
                response.status
            ).json({

                error:
                    "OpenAI voice generation failed.",

                details:
                    errorText

            });

        }


        /*
        ====================================================
        RETURN AUDIO
        ====================================================
        */

        const audioBuffer =
            await response.arrayBuffer();


        if (
            !audioBuffer ||
            audioBuffer.byteLength === 0
        ) {

            return res.status(500).json({
                error:
                    "OpenAI returned empty audio."
            });

        }


        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        );


        res.setHeader(
            "Content-Length",
            audioBuffer.byteLength
        );


        res.setHeader(
            "Cache-Control",
            "no-store"
        );


        console.log(
            "🎵 AI VOICE GENERATED:",
            audioBuffer.byteLength,
            "bytes"
        );


        return res.status(200).send(
            Buffer.from(audioBuffer)
        );

    }


    catch (error) {

        console.error(
            "❌ VIRAL VOICE SERVER ERROR:",
            error
        );


        return res.status(500).json({

            error:
                "Unexpected server error while generating voice."

        });

    }

}