"use strict";

/*
============================================================
VIRAL — SMART CROP ENGINE
V3 — LOCAL SUBJECT-AWARE SMART 9:16 CROP
============================================================

Purpose:
    Automatically choose a strong 9:16 crop from a
    landscape video.

IMPORTANT:
    - No OpenAI
    - No API
    - No paid AI
    - No Vercel dependency
    - Runs completely in the browser

V3 combines several visual signals:

    1. Visual detail / edges
    2. Brightness / visibility
    3. Local contrast
    4. Color variation
    5. Skin-tone / face-like color cues
    6. Motion between frames
    7. Temporal consistency
    8. Empty/dark-area penalty
    9. Small center stability preference

This is NOT a neural-network AI model.

It is a local computer-vision heuristic.

============================================================
*/

window.ViralSmartCrop = {

    initialized: false,

    video: null,

    crop: null,

    /*
    Number of sampled frames.
    More frames = better temporal analysis.
    */

    sampleCount: 9,

    /*
    Analysis resolution.
    */

    analysisWidth: 360,

    /*
    Number of horizontal regions.
    */

    regions: 36,

    /*
    Minimum visible brightness.
    */

    darkThreshold: 28,


    /*
    ========================================================
    INITIALIZE
    ========================================================
    */

    init: function () {

        if (this.initialized) {

            console.log(
                "🧠 VIRAL Smart Crop V3 already initialized."
            );

            return;
        }

        this.initialized = true;

        console.log(
            "🧠 VIRAL SMART CROP ENGINE V3 LOADED"
        );

        console.log(
            "🧠 LOCAL SUBJECT-AWARE ANALYSIS"
        );

        console.log(
            "🆓 FREE — NO AI API — NO PAID SERVICE"
        );

    },


    /*
    ========================================================
    ANALYZE VIDEO
    ========================================================
    */

    analyze: async function (video) {

        console.log(
            "================================================"
        );

        console.log(
            "🧠 SMART CROP V3 ANALYSIS STARTING..."
        );

        console.log(
            "================================================"
        );


        if (!video) {

            throw new Error(
                "Smart Crop V3: video element not found."
            );

        }


        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {

            throw new Error(
                "Smart Crop V3: video dimensions unavailable."
            );

        }


        this.video = video;


        const sourceWidth =
            video.videoWidth;

        const sourceHeight =
            video.videoHeight;


        console.log(
            "📐 ORIGINAL VIDEO:",
            sourceWidth,
            "x",
            sourceHeight
        );


        /*
        ====================================================
        CALCULATE 9:16 CROP
        ====================================================
        */

        const targetRatio =
            9 / 16;


        let cropWidth =
            sourceHeight *
            targetRatio;


        let cropHeight =
            sourceHeight;


        /*
        If source is too narrow,
        calculate crop from width.
        */

        if (cropWidth > sourceWidth) {

            cropWidth =
                sourceWidth;

            cropHeight =
                sourceWidth /
                targetRatio;

        }


        cropWidth =
            Math.round(
                cropWidth
            );


        cropHeight =
            Math.round(
                cropHeight
            );


        console.log(
            "✂️ REQUIRED CROP:",
            cropWidth,
            "x",
            cropHeight
        );


        /*
        ====================================================
        CREATE ANALYSIS CANVAS
        ====================================================
        */

        const canvas =
            document.createElement(
                "canvas"
            );


        const scale =
            Math.min(
                1,
                this.analysisWidth /
                sourceWidth
            );


        canvas.width =
            Math.max(
                1,
                Math.round(
                    sourceWidth *
                    scale
                )
            );


        canvas.height =
            Math.max(
                1,
                Math.round(
                    sourceHeight *
                    scale
                )
            );


        const context =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        if (!context) {

            throw new Error(
                "Smart Crop V3: analysis canvas unavailable."
            );

        }


        /*
        ====================================================
        SAVE CURRENT VIDEO POSITION
        ====================================================
        */

        const originalTime =
            Number.isFinite(
                video.currentTime
            )
                ? video.currentTime
                : 0;


        video.pause();


        /*
        ====================================================
        VIDEO DURATION
        ====================================================
        */

        const duration =
            Number.isFinite(
                video.duration
            )
                ? video.duration
                : 0;


        if (!duration) {

            throw new Error(
                "Smart Crop V3: video duration unavailable."
            );

        }


        /*
        ====================================================
        SAMPLE FRAMES
        ====================================================
        */

        const frames = [];


        for (
            let i = 0;
            i < this.sampleCount;
            i++
        ) {

            const progress =
                this.sampleCount === 1
                    ? 0.5
                    : i /
                      (this.sampleCount - 1);


            /*
            Avoid the exact first and last
            frame where possible.
            */

            const safeStart =
                Math.min(
                    0.05,
                    duration * 0.1
                );


            const safeEnd =
                Math.max(
                    safeStart,
                    duration - 0.05
                );


            let time =
                safeStart +
                (
                    safeEnd -
                    safeStart
                ) *
                progress;


            time =
                Math.max(
                    0,
                    Math.min(
                        time,
                        duration - 0.02
                    )
                );


            console.log(
                "🧠 V3 frame:",
                i + 1,
                "/",
                this.sampleCount,
                "at",
                time.toFixed(2),
                "sec"
            );


            if (
                window.ViralVideo &&
                typeof ViralVideo.setStatus ===
                    "function"
            ) {

                ViralVideo.setStatus(
                    "🧠 Smart Crop V3 analyzing frame " +
                    (i + 1) +
                    " of " +
                    this.sampleCount +
                    "..."
                );

            }


            await this.seekVideo(
                video,
                time
            );


            await new Promise(
                resolve => {

                    requestAnimationFrame(
                        resolve
                    );

                }
            );


            context.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );


            const imageData =
                context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


            frames.push(
                this.analyzeFrame(
                    imageData
                )
            );

        }


        /*
        ====================================================
        RESTORE ORIGINAL POSITION
        ====================================================
        */

        try {

            await this.seekVideo(
                video,
                Math.min(
                    originalTime,
                    Math.max(
                        0,
                        duration - 0.02
                    )
                )
            );

        }

        catch (error) {

            console.warn(
                "⚠️ V3 could not restore video position.",
                error
            );

        }


        /*
        ====================================================
        SEARCH CROP
        ====================================================
        */

        console.log(
            "🔎 V3 searching crop positions..."
        );


        const best =
            this.findBestCrop(
                frames,
                sourceWidth,
                sourceHeight,
                cropWidth,
                cropHeight
            );


        /*
        ====================================================
        SAVE RESULT
        ====================================================
        */

        this.crop = {

            x:
                best.x,

            y:
                best.y,

            width:
                cropWidth,

            height:
                cropHeight,

            sourceWidth:
                sourceWidth,

            sourceHeight:
                sourceHeight,

            targetRatio:
                targetRatio,

            outputRatio:
                "9:16",

            score:
                Number(
                    best.score.toFixed(4)
                ),

            method:
                "V3-local-subject-aware-analysis"

        };


        console.log(
            "================================================"
        );

        console.log(
            "🧠 SMART CROP V3 RESULT"
        );

        console.log(
            "✂️ X:",
            best.x
        );

        console.log(
            "✂️ Y:",
            best.y
        );

        console.log(
            "✂️ SIZE:",
            cropWidth,
            "x",
            cropHeight
        );

        console.log(
            "📊 SCORE:",
            best.score
        );

        console.log(
            "📱 OUTPUT:",
            "9:16"
        );

        console.log(
            "🧠 METHOD:",
            "Local subject-aware analysis"
        );

        console.log(
            "================================================"
        );


        if (
            window.ViralVideo &&
            typeof ViralVideo.setStatus ===
                "function"
        ) {

            ViralVideo.setStatus(
                "✅ Smart Crop V3 calculated."
            );

        }


        return this.crop;

    },


    /*
    ========================================================
    ANALYZE ONE FRAME
    ========================================================
    */

    analyzeFrame: function (imageData) {

        const data =
            imageData.data;

        const width =
            imageData.width;

        const height =
            imageData.height;


        const regions =
            this.regions;


        let detail =
            new Array(
                regions
            ).fill(0);


        let brightness =
            new Array(
                regions
            ).fill(0);


        let contrast =
            new Array(
                regions
            ).fill(0);


        let colorVariation =
            new Array(
                regions
            ).fill(0);


        let skin =
            new Array(
                regions
            ).fill(0);


        let dark =
            new Array(
                regions
            ).fill(0);


        const counts =
            new Array(
                regions
            ).fill(0);


        /*
        ====================================================
        PIXEL ANALYSIS
        ====================================================
        */

        for (
            let y = 1;
            y < height - 1;
            y += 3
        ) {

            for (
                let x = 1;
                x < width - 1;
                x += 3
            ) {

                const index =
                    (
                        y *
                        width +
                        x
                    ) *
                    4;


                const rightIndex =
                    (
                        y *
                        width +
                        x +
                        1
                    ) *
                    4;


                const belowIndex =
                    (
                        (y + 1) *
                        width +
                        x
                    ) *
                    4;


                const r =
                    data[index];

                const g =
                    data[index + 1];

                const b =
                    data[index + 2];


                const rr =
                    data[rightIndex];

                const rg =
                    data[rightIndex + 1];

                const rb =
                    data[rightIndex + 2];


                const br =
                    data[belowIndex];

                const bg =
                    data[belowIndex + 1];

                const bb =
                    data[belowIndex + 2];


                /*
                =================================================
                BRIGHTNESS
                =================================================
                */

                const lum =
                    (
                    0.299 * r +
                    0.587 * g +
                    0.114 * b
                    );


                const rightLum =
                    (
                    0.299 * rr +
                    0.587 * rg +
                    0.114 * rb
                    );


                const belowLum =
                    (
                    0.299 * br +
                    0.587 * bg +
                    0.114 * bb
                    );


                /*
                =================================================
                EDGE / DETAIL
                =================================================
                */

                const horizontal =
                    Math.abs(
                        lum -
                        rightLum
                    );


                const vertical =
                    Math.abs(
                        lum -
                        belowLum
                    );


                const edge =
                    (
                        horizontal +
                        vertical
                    ) / 2;


                /*
                =================================================
                LOCAL CONTRAST
                =================================================
                */

                const localContrast =
                    Math.abs(
                        lum -
                        (
                            rightLum +
                            belowLum
                        ) / 2
                    );


                /*
                =================================================
                COLOR VARIATION
                =================================================
                */

                const maxRGB =
                    Math.max(
                        r,
                        g,
                        b
                    );


                const minRGB =
                    Math.min(
                        r,
                        g,
                        b
                    );


                const saturation =
                    maxRGB -
                    minRGB;


                /*
                =================================================
                SKIN-TONE / FACE-LIKE CUE
                =================================================

                This is deliberately conservative.

                It does NOT claim to detect a face.

                It simply recognizes colors that often
                occur in exposed human skin.

                =================================================
                */

                const skinLike =
                    (
                        r > 70 &&
                        g > 35 &&
                        b > 20 &&
                        r > g * 1.05 &&
                        g > b * 1.05 &&
                        r - b > 25 &&
                        saturation > 20 &&
                        saturation < 180
                    );


                /*
                =================================================
                REGION
                =================================================
                */

                const region =
                    Math.floor(
                        (
                            x /
                            width
                        ) *
                        regions
                    );


                if (
                    region < 0 ||
                    region >= regions
                ) {

                    continue;

                }


                detail[region] +=
                    edge;


                brightness[region] +=
                    lum;


                contrast[region] +=
                    localContrast;


                colorVariation[region] +=
                    saturation;


                if (skinLike) {

                    skin[region] +=
                        1;

                }


                if (
                    lum <
                    this.darkThreshold
                ) {

                    dark[region] +=
                        1;

                }


                counts[region]++;

            }

        }


        /*
        ====================================================
        NORMALIZE REGIONS
        ====================================================
        */

        for (
            let i = 0;
            i < regions;
            i++
        ) {

            const count =
                Math.max(
                    1,
                    counts[i]
                );


            detail[i] /=
                count;


            brightness[i] /=
                count;


            contrast[i] /=
                count;


            colorVariation[i] /=
                count;


            skin[i] /=
                count;


            dark[i] /=
                count;

        }


        /*
        ====================================================
        NORMALIZE EACH SIGNAL
        ====================================================
        */

        detail =
            this.normalizeArray(
                detail
            );


        brightness =
            this.normalizeArray(
                brightness
            );


        contrast =
            this.normalizeArray(
                contrast
            );


        colorVariation =
            this.normalizeArray(
                colorVariation
            );


        skin =
            this.normalizeArray(
                skin
            );


        dark =
            this.normalizeArray(
                dark
            );


        return {

            detail:
                detail,

            brightness:
                brightness,

            contrast:
                contrast,

            colorVariation:
                colorVariation,

            skin:
                skin,

            dark:
                dark,

            width:
                width,

            height:
                height

        };

    },


    /*
    ========================================================
    NORMALIZE ARRAY
    ========================================================
    */

    normalizeArray: function (
        values
    ) {

        const max =
            Math.max(
                ...values
            );


        const min =
            Math.min(
                ...values
            );


        const range =
            max -
            min;


        if (
            range <
            0.000001
        ) {

            return values.map(
                () => 0.5
            );

        }


        return values.map(
            value =>
                (
                    value -
                    min
                ) /
                range
        );

    },


    /*
    ========================================================
    FIND BEST CROP
    ========================================================
    */

    findBestCrop: function (
        frames,
        sourceWidth,
        sourceHeight,
        cropWidth,
        cropHeight
    ) {

        const positions =
            61;


        const maxX =
            Math.max(
                0,
                sourceWidth -
                cropWidth
            );


        let best = {

            x:
                Math.round(
                    maxX / 2
                ),

            y:
                Math.round(
                    (
                        sourceHeight -
                        cropHeight
                    ) / 2
                ),

            score:
                -Infinity

        };


        /*
        ====================================================
        CROP ANALYSIS
        ====================================================
        */

        for (
            let position = 0;
            position < positions;
            position++
        ) {

            const progress =
                positions === 1
                    ? 0.5
                    : position /
                      (positions - 1);


            const x =
                Math.round(
                    maxX *
                    progress
                );


            let totalScore =
                0;


            let consistencyPenalty =
                0;


            /*
            ------------------------------------------------
            Evaluate every sampled frame
            ------------------------------------------------
            */

            for (
                let frameIndex = 0;
                frameIndex < frames.length;
                frameIndex++
            ) {

                const frame =
                    frames[frameIndex];


                const scale =
                    frame.width /
                    sourceWidth;


                const cropAnalysisWidth =
                    Math.max(
                        1,
                        Math.round(
                            cropWidth *
                            scale
                        )
                    );


                const analysisX =
                    Math.round(
                        x *
                        scale
                    );


                const analysisRight =
                    Math.min(
                        frame.width,
                        analysisX +
                        cropAnalysisWidth
                    );


                const startRegion =
                    Math.floor(
                        analysisX /
                        frame.width *
                        this.regions
                    );


                const endRegion =
                    Math.ceil(
                        analysisRight /
                        frame.width *
                        this.regions
                    );


                let detailScore =
                    0;

                let brightnessScore =
                    0;

                let contrastScore =
                    0;

                let colorScore =
                    0;

                let skinScore =
                    0;

                let darkScore =
                    0;

                let count =
                    0;


                for (
                    let r =
                        startRegion;

                    r < endRegion;

                    r++
                ) {

                    if (
                        r < 0 ||
                        r >= this.regions
                    ) {

                        continue;

                    }


                    detailScore +=
                        frame.detail[r];


                    brightnessScore +=
                        frame.brightness[r];


                    contrastScore +=
                        frame.contrast[r];


                    colorScore +=
                        frame.colorVariation[r];


                    skinScore +=
                        frame.skin[r];


                    darkScore +=
                        frame.dark[r];


                    count++;

                }


                if (
                    count > 0
                ) {

                    detailScore /=
                        count;

                    brightnessScore /=
                        count;

                    contrastScore /=
                        count;

                    colorScore /=
                        count;

                    skinScore /=
                        count;

                    darkScore /=
                        count;

                }


                /*
                =================================================
                FRAME SCORE
                =================================================

                Weighting:

                    detail       30%
                    brightness   15%
                    contrast     15%
                    color        10%
                    skin         20%
                    dark penalty 10%

                =================================================
                */

                let frameScore =

                    detailScore *
                    0.30

                    +

                    brightnessScore *
                    0.15

                    +

                    contrastScore *
                    0.15

                    +

                    colorScore *
                    0.10

                    +

                    skinScore *
                    0.20

                    -

                    darkScore *
                    0.10;


                /*
                -------------------------------------------------
                MOTION
                -------------------------------------------------

                Motion is evaluated later using neighboring
                frames.

                -------------------------------------------------
                */

                if (
                    frameIndex > 0
                ) {

                    const previous =
                        frames[
                            frameIndex - 1
                        ];


                    const motion =
                        this.calculateRegionMotion(
                            previous,
                            frame,
                            startRegion,
                            endRegion
                        );


                    /*
                    Moderate motion is useful.

                    Extremely high motion can be noise,
                    so use a soft reward.
                    */

                    const motionReward =
                        Math.min(
                            1,
                            motion *
                            2
                        );


                    frameScore +=
                        motionReward *
                        0.10;

                }


                totalScore +=
                    frameScore;

            }


            totalScore /=
                Math.max(
                    1,
                    frames.length
                );


            /*
            ====================================================
            TEMPORAL STABILITY
            ====================================================
            */

            /*
            We calculate how consistent this crop is
            across frames.

            A crop that is good in one frame but terrible
            in all others is less desirable.
            */

            const frameScores = [];


            for (
                const frame of frames
            ) {

                const score =
                    this.getCropFrameScore(
                        frame,
                        x,
                        sourceWidth,
                        cropWidth
                    );


                frameScores.push(
                    score
                );

            }


            const mean =
                frameScores.reduce(
                    (
                        a,
                        b
                    ) =>
                        a + b,
                    0
                ) /
                Math.max(
                    1,
                    frameScores.length
                );


            let variance =
                0;


            for (
                const value
                of frameScores
            ) {

                variance +=
                    Math.pow(
                        value -
                        mean,
                        2
                    );

            }


            variance /=
                Math.max(
                    1,
                    frameScores.length
                );


            const stability =
                1 /
                (
                    1 +
                    variance * 8
                );


            totalScore +=
                stability *
                0.12;


            /*
            ====================================================
            CENTER STABILITY
            ====================================================
            */

            const centerX =
                maxX / 2;


            const distance =
                Math.abs(
                    x -
                    centerX
                ) /
                Math.max(
                    1,
                    centerX
                );


            /*
            Only a small bonus.

            The algorithm is still allowed to move
            strongly left or right.
            */

            const centerBonus =
                (
                    1 -
                    distance
                ) *
                0.06;


            totalScore +=
                centerBonus;


            /*
            ====================================================
            EDGE PENALTY
            ====================================================
            */

            /*
            Avoid placing the crop so close to the edge
            that a tiny analysis error can remove the subject.
            */

            const edgeDistance =
                Math.min(
                    x,
                    maxX - x
                );


            const edgeRatio =
                edgeDistance /
                Math.max(
                    1,
                    maxX / 2
                );


            const edgeBonus =
                Math.max(
                    0,
                    edgeRatio
                ) *
                0.04;


            totalScore +=
                edgeBonus;


            /*
            ====================================================
            LOG CANDIDATE
            ====================================================
            */

            console.log(
                "🔎 V3 crop candidate:",
                x,
                "score:",
                totalScore.toFixed(4)
            );


            /*
            ====================================================
            BEST
            ====================================================
            */

            if (
                totalScore >
                best.score
            ) {

                best = {

                    x:
                        x,

                    y:
                        Math.round(
                            (
                                sourceHeight -
                                cropHeight
                            ) / 2
                        ),

                    score:
                        totalScore

                };

            }

        }


        return best;

    },


    /*
    ========================================================
    GET CROP FRAME SCORE
    ========================================================
    */

    getCropFrameScore: function (
        frame,
        sourceX,
        sourceWidth,
        cropWidth
    ) {

        const scale =
            frame.width /
            sourceWidth;


        const cropAnalysisWidth =
            Math.max(
                1,
                Math.round(
                    cropWidth *
                    scale
                )
            );


        const analysisX =
            Math.round(
                sourceX *
                scale
            );


        const analysisRight =
            Math.min(
                frame.width,
                analysisX +
                cropAnalysisWidth
            );


        const startRegion =
            Math.floor(
                analysisX /
                frame.width *
                this.regions
            );


        const endRegion =
            Math.ceil(
                analysisRight /
                frame.width *
                this.regions
            );


        let total =
            0;


        let count =
            0;


        for (
            let r =
                startRegion;

            r < endRegion;

            r++
        ) {

            if (
                r < 0 ||
                r >= this.regions
            ) {

                continue;

            }


            const score =

                frame.detail[r] *
                0.30

                +

                frame.brightness[r] *
                0.15

                +

                frame.contrast[r] *
                0.15

                +

                frame.colorVariation[r] *
                0.10

                +

                frame.skin[r] *
                0.20

                -

                frame.dark[r] *
                0.10;


            total +=
                score;


            count++;

        }


        if (
            count === 0
        ) {

            return 0;

        }


        return (
            total /
            count
        );

    },


    /*
    ========================================================
    REGION MOTION
    ========================================================
    */

    calculateRegionMotion: function (
        previous,
        current,
        startRegion,
        endRegion
    ) {

        /*
        We don't have raw pixels anymore,
        so approximate motion from changes in
        visual signals.

        This keeps the algorithm lightweight.
        */

        let difference =
            0;


        let count =
            0;


        for (
            let r =
                startRegion;

            r < endRegion;

            r++
        ) {

            if (
                r < 0 ||
                r >= this.regions
            ) {

                continue;

            }


            difference +=
                Math.abs(
                    current.detail[r] -
                    previous.detail[r]
                );


            difference +=
                Math.abs(
                    current.brightness[r] -
                    previous.brightness[r]
                );


            difference +=
                Math.abs(
                    current.contrast[r] -
                    previous.contrast[r]
                );


            count +=
                3;

        }


        if (
            count === 0
        ) {

            return 0;

        }


        return Math.min(
            1,
            difference /
            count
        );

    },


    /*
    ========================================================
    SAFE VIDEO SEEK
    ========================================================
    */

    seekVideo: function (
        video,
        time
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const duration =
                    video.duration;


                let target =
                    Number(
                        time
                    );


                if (
                    !Number.isFinite(
                        target
                    )
                ) {

                    target = 0;

                }


                if (
                    Number.isFinite(
                        duration
                    )
                ) {

                    target =
                        Math.min(
                            target,
                            Math.max(
                                0,
                                duration -
                                0.02
                            )
                        );

                }


                target =
                    Math.max(
                        0,
                        target
                    );


                if (
                    Math.abs(
                        video.currentTime -
                        target
                    ) <
                    0.03
                ) {

                    requestAnimationFrame(
                        () => resolve()
                    );

                    return;

                }


                let finished =
                    false;


                const cleanup =
                    () => {

                        video.removeEventListener(
                            "seeked",
                            onSeeked
                        );

                        video.removeEventListener(
                            "error",
                            onError
                        );

                        clearTimeout(
                            timeout
                        );

                    };


                const complete =
                    () => {

                        if (
                            finished
                        ) {

                            return;

                        }


                        finished =
                            true;


                        cleanup();


                        resolve();

                    };


                const fail =
                    error => {

                        if (
                            finished
                        ) {

                            return;

                        }


                        finished =
                            true;


                        cleanup();


                        reject(
                            error
                        );

                    };


                const onSeeked =
                    () => {

                        complete();

                    };


                const onError =
                    () => {

                        fail(
                            new Error(
                                "Smart Crop V3 video seek failed."
                            )
                        );

                    };


                const timeout =
                    setTimeout(
                        () => {

                            fail(
                                new Error(
                                    "Smart Crop V3 seek timed out."
                                )
                            );

                        },
                        8000
                    );


                video.addEventListener(
                    "seeked",
                    onSeeked
                );


                video.addEventListener(
                    "error",
                    onError
                );


                try {

                    video.currentTime =
                        target;

                }

                catch (
                    error
                ) {

                    fail(
                        error
                    );

                }

            }
        );

    },


    /*
    ========================================================
    GET CURRENT CROP
    ========================================================
    */

    getCrop: function () {

        if (
            !this.crop
        ) {

            console.warn(
                "⚠️ Smart Crop V3 has not analyzed a video yet."
            );

            return null;

        }


        return {

            x:
                this.crop.x,

            y:
                this.crop.y,

            width:
                this.crop.width,

            height:
                this.crop.height,

            sourceWidth:
                this.crop.sourceWidth,

            sourceHeight:
                this.crop.sourceHeight,

            outputRatio:
                this.crop.outputRatio,

            score:
                this.crop.score,

            method:
                this.crop.method

        };

    },


    /*
    ========================================================
    RESET
    ========================================================
    */

    reset: function () {

        this.crop =
            null;

        this.video =
            null;

        console.log(
            "🔄 SMART CROP V3 RESET"
        );

    }

};


/*
============================================================
START SYSTEM
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ViralSmartCrop.init();

    }
);