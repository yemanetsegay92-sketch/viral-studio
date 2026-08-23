"use strict";

/*
============================================================
VIRAL — AI SCENE ANALYSIS
V2B
============================================================

Browser
   ↓
8 extracted frames
   ↓
/api/analyze.js
   ↓
OpenAI Responses API
   ↓
Structured scene analysis

API key stays on the Vercel server.
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

            success: false,

            error: "Method not allowed."

        });

    }


    /*
    ========================================================
    GET API KEY
    ========================================================
    */

    const apiKey =
        process.env.OPENAI_API_KEY;


    if (!apiKey) {

        console.error(
            "❌ OPENAI_API_KEY is missing."
        );

        return res.status(500).json({

            success: false,

            error:
                "OPENAI_API_KEY is not configured."

        });

    }


    try {

        /*
        ====================================================
        READ REQUEST
        ====================================================
        */

        const body =
            req.body || {};

        const frames =
            body.frames;


        /*
        ====================================================
        VALIDATE
        ====================================================
        */

        if (
            !Array.isArray(frames) ||
            frames.length === 0
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "No scene frames received."

            });

        }


        if (frames.length > 10) {

            return res.status(400).json({

                success: false,

                error:
                    "Maximum 10 frames allowed."

            });

        }


        /*
        ====================================================
        CREATE AI CONTENT
        ====================================================
        */

        const content = [

            {

                type: "input_text",

                text: `
You are the visual story analyst for VIRAL Studio.

You are analyzing multiple frames taken from one
continuous 30–45 second video scene.

Understand what is happening visually.

Analyze:

1. Characters
2. Setting
3. Important objects
4. Actions
5. Emotions and expressions
6. Sequence of events
7. The most interesting storytelling opportunity

The eventual goal is to create an entertaining
Amharic narration for this scene.

This is NOT a literal translation.

Think like a funny and engaging storyteller.

IMPORTANT RULES:

- Only describe things reasonably visible in the frames.
- Do not invent names or facts.
- If something is uncertain, say so.
- Pay attention to the order of events.
- Notice funny, surprising, emotional, or interesting moments.
- Do not write the final Amharic narration yet.

Return ONLY valid JSON.

Use exactly this structure:

{
  "characters": [],
  "setting": "",
  "objects": [],
  "actions": [],
  "emotions": [],
  "events": [],
  "story_opportunity": "",
  "confidence": "high"
}
`

            }

        ];


        /*
        ====================================================
        ADD IMAGES
        ====================================================
        */

        for (
            const frame of frames
        ) {

            if (
                !frame ||
                typeof frame.image !== "string"
            ) {

                continue;

            }


            content.push({

                type: "input_image",

                image_url: frame.image

            });

        }


        /*
        ====================================================
        CALL OPENAI
        ====================================================
        */

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer "
                            + apiKey

                    },

                    body: JSON.stringify({

                        model:
                            "gpt-5.6-luna",

                        input: [

                            {

                                role:
                                    "user",

                                content:
                                    content

                            }

                        ]

                    })

                }
            );


        /*
        ====================================================
        READ OPENAI RESPONSE
        ====================================================
        */

        const data =
            await response.json();


        /*
        ====================================================
        HANDLE API ERROR
        ====================================================
        */

        if (!response.ok) {

            console.error(
                "❌ OpenAI error:",
                data
            );

            return res.status(
                response.status
            ).json({

                success: false,

                error:
                    data?.error?.message ||
                    "OpenAI request failed."

            });

        }


        /*
        ====================================================
        GET TEXT
        ====================================================
        */

        const outputText =
            data.output_text;


        if (!outputText) {

            console.error(
                "❌ No output_text:",
                data
            );

            return res.status(500).json({

                success: false,

                error:
                    "AI returned no text."

            });

        }


        /*
        ====================================================
        PARSE JSON
        ====================================================
        */

        let analysis;

        try {

            analysis =
                JSON.parse(
                    outputText
                );

        }

        catch (error) {

            console.error(
                "❌ Invalid AI JSON:",
                outputText
            );

            return res.status(500).json({

                success: false,

                error:
                    "AI returned invalid JSON.",

                raw:
                    outputText

            });

        }


        /*
        ====================================================
        SUCCESS
        ====================================================
        */

        console.log(
            "✅ VIRAL AI analysis completed."
        );


        return res.status(200).json({

            success: true,

            analysis:
                analysis

        });

    }


    catch (error) {

        console.error(
            "❌ VIRAL server error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Unexpected server error."

        });

    }

}