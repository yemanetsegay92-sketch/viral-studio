"use strict";


window.ViralSubtitles = {


    createFromText: function (text) {

        /*
         * Basic V1 subtitle preparation.
         *
         * The real subtitle timing system
         * will be added after AI narration.
         */

        return text

            .split(
                /[.!?።]/
            )

            .map(
                part => part.trim()
            )

            .filter(
                Boolean
            );

    }

};