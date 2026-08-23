"use strict";


const input =
    document.getElementById(
        "videoInput"
    );


input.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        /*
        ================================================
        STORE THE VIDEO FILE
        ================================================

        We cannot safely store a blob URL in
        sessionStorage.

        Instead we keep the File object in memory.
        */


        window.VIRAL_SELECTED_VIDEO =
            file;


        /*
        ================================================
        OPEN STUDIO
        ================================================
        */


        /*
        We need the selected file to survive
        the page transition.

        For this first local prototype,
        we use a global page transition strategy
        by opening the studio in the same tab
        and temporarily attaching the file to
        the browser window.

        */

        const reader =
            new FileReader();


        reader.onload =
            function () {

                sessionStorage.setItem(
                    "viralVideoData",
                    reader.result
                );


                sessionStorage.setItem(
                    "viralVideoName",
                    file.name
                );


                sessionStorage.setItem(
                    "viralVideoType",
                    file.type
                );


                window.location.href =
                    "studio.html";

            };


        /*
        Convert the video into a Data URL.

        This is okay for our small V1/V2
        testing workflow.

        Later we will use direct file uploads
        instead of storing large videos this way.
        */


        reader.readAsDataURL(
            file
        );

    }
);