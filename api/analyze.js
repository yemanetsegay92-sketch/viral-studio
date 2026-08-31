"use strict";

/*
============================================================
VIRAL — AI SCENE ANALYSIS
V2D
REAL VISION AI + SMART 9:16 FRAMING
============================================================

Browser
   ↓
Extracted scene frames
   ↓
/api/analyze.js
   ↓
OpenAI Vision
   ↓
Scene analysis
+
Smart vertical framing analysis
   ↓
JSON returned to browser

IMPORTANT:
This version ONLY asks AI for the framing decision.
It does NOT control FFmpeg yet.

API key stays on the Vercel server.
============================================================
*/


export default async function handler(req, res) {

    /*
    ========================================================
    CORS
    ========================================================
    */

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );


    /*
    ========================================================
    PREFLIGHT
    ========================================================
    */

    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }


    /*
    ========================================================
    ONLY POST
    ========================================================
    */

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            error:
                "Method not allowed."

        });

    }


    /*
    ========================================================
    GET OPENAI API KEY
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
        VALIDATE FRAMES
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

        The important new part is the FRAMING section.

        AI must look for:
        - people
        - important objects
        - titles
        - subtitles
        - logos
        - text near edges
        - important visual information
        - safest 9:16 crop
        ====================================================
        */

        const content = [

            {

                type: "input_text",

                text: `

You are the visual story analyst for VIRAL Studio.

You are analyzing multiple frames taken from one
continuous video scene.

The original video may be landscape or another
non-vertical aspect ratio.

The eventual output will be a 9:16 vertical video.

====================================================
PART 1 — SCENE ANALYSIS
====================================================

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

IMPORTANT:

- Only describe things reasonably visible in the frames.
- Do not invent names or facts.
- If something is uncertain, say so.
- Pay attention to the order of events.
- Notice funny, surprising, emotional, or interesting moments.
- Do not write the final Amharic narration yet.

====================================================
PART 2 — SMART 9:16 FRAMING
====================================================

This is extremely important.

The original video may be wider than a 9:16 vertical
video.

A simple center crop can accidentally remove:

- important characters
- faces
- animals
- objects
- titles
- signs
- logos
- written information
- important action near the left or right edge

Analyze ALL frames together.

Determine where the important visual information is
located horizontally.

Pay special attention to text.

If a title, sign, logo, or other important text is
visible near the left or right side, the vertical crop
must try to keep it visible.

Also consider the main character or main subject.

The goal is NOT simply to center the video.

The goal is to choose the safest horizontal region
for a 9:16 crop while preserving the most important
visual information.

====================================================
CROP COORDINATE SYSTEM
====================================================

Imagine the original video's width goes from:

0.0 = extreme LEFT

0.5 = CENTER

1.0 = extreme RIGHT

Return the recommended CENTER of the vertical crop
using a number between 0.0 and 1.0.

Examples:

0.50 = centered crop

0.35 = crop shifted toward the left

0.65 = crop shifted toward the right

IMPORTANT:

The value is the CENTER of the desired vertical
crop, NOT the left edge.

====================================================
IMPORTANT TEXT
====================================================

Look carefully for visible text.

If there is important text:

- identify whether it is left, center, or right
- make sure the recommended crop keeps it visible
- explain why

If there is no important text, say so.

Do NOT assume text exists if you cannot see it.

====================================================
TEMPORAL CONSISTENCY
====================================================

The frames come from one continuous scene.

Try to choose a crop position that works reasonably
well across ALL frames.

Do not choose a position based on only one frame if
that would remove important information from the
other frames.

If the important subject moves substantially during
the scene, explain that.

====================================================
OUTPUT
====================================================

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
  "confidence": "high",

  "framing": {
    "important_text": false,
    "text_position": "none",
    "main_subject_position": "center",
    "recommended_crop_center": 0.50,
    "crop_confidence": "high",
    "reason": ""
  }
}

====================================================
FRAMING RULES
====================================================

"important_text" must be:

true

or

false

"text_position" must be one of:

"left"
"center"
"right"
"multiple"
"none"

"main_subject_position" must be one of:

"left"
"center"
"right"
"multiple"

"recommended_crop_center" must be a NUMBER between
0.0 and 1.0.

Do not return percentages.

Do not return words such as "left 40%".

Return only the numeric center value.

"crop_confidence" must be:

"high"
"medium"
"low"

The reason should briefly explain why this crop is
recommended.

`

            }

        ];


        /*
        ====================================================
        ADD FRAME IMAGES
        ====================================================
        */

        let validFrameCount = 0;


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

                type:
                    "input_image",

                image_url:
                    frame.image

            });


            validFrameCount++;

        }


        /*
        ====================================================
        VALIDATE IMAGE COUNT
        ====================================================
        */

        if (validFrameCount === 0) {

            return res.status(400).json({

                success: false,

                error:
                    "No valid frame images received."

            });

        }


        console.log(
            "🖼️ Sending",
            validFrameCount,
            "frames to Vision AI..."
        );


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
                            "Bearer " +
                            apiKey

                    },

                    body:
                        JSON.stringify({

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
        HANDLE OPENAI ERROR
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
        GET OUTPUT TEXT
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
        VALIDATE FRAMING RESULT
        ====================================================
        */

        if (
            !analysis.framing ||
            typeof analysis.framing !== "object"
        ) {

            console.warn(
                "⚠️ AI returned no framing object."
            );


            /*
            Safe fallback
            */

            analysis.framing = {

                important_text:
                    false,

                text_position:
                    "none",

                main_subject_position:
                    "center",

                recommended_crop_center:
                    0.50,

                crop_confidence:
                    "low",

                reason:
                    "No framing recommendation was returned."

            };

        }


        /*
        ====================================================
        SANITIZE CROP CENTER
        ====================================================
        */

        let cropCenter =
            Number(
                analysis.framing
                    .recommended_crop_center
            );


        if (
            !Number.isFinite(
                cropCenter
            )
        ) {

            cropCenter =
                0.50;

        }


        cropCenter =
            Math.max(
                0.0,
                Math.min(
                    1.0,
                    cropCenter
                )
            );


        analysis.framing
            .recommended_crop_center =
                Number(
                    cropCenter.toFixed(3)
                );


        /*
        ====================================================
        LOG FRAMING DECISION
        ====================================================
        */

        console.log(
            "================================================"
        );

        console.log(
            "🎯 AI SMART FRAMING RESULT"
        );

        console.log(
            "📝 Important text:",
            analysis.framing.important_text
        );

        console.log(
            "📝 Text position:",
            analysis.framing.text_position
        );

        console.log(
            "👤 Main subject:",
            analysis.framing.main_subject_position
        );

        console.log(
            "🎯 Crop center:",
            analysis.framing.recommended_crop_center
        );

        console.log(
            "📊 Crop confidence:",
            analysis.framing.crop_confidence
        );

        console.log(
            "💡 Reason:",
            analysis.framing.reason
        );

        console.log(
            "================================================"
        );


        /*
        ====================================================
        SUCCESS
        ====================================================
        */

        console.log(
            "✅ VIRAL AI analysis completed."
        );


        return res.status(200).json({

            success:
                true,

            analysis:
                analysis

        });

    }


    /*
    ========================================================
    SERVER ERROR
    ========================================================
    */

    catch (error) {

        console.error(
            "❌ VIRAL server error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            error:
                "Unexpected server error."

        });

    }

}