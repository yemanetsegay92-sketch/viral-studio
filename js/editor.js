/* One owner for text, timing, preview and draft lifecycle. */
window.ViralEditor = (() => {
    "use strict";
    const byId = id => document.getElementById(id);
    const settings = ["editorMode", "outputAspectRatio", "exportQuality", "subtitleStyle", "subtitleSize", "subtitlePosition", "subtitleColor", "logoPosition", "logoSize", "logoOpacity", "defaultCharacterVoice", "narrationVolume", "originalVolume", "backgroundMusicVolume", "aiVoiceStyle", "aiVoiceSpeed"];
    const profiles = ["narrator", "deep", "child", "high", "old", "robot", "echo", "funny", "strong", "soft"];
    let id = crypto.randomUUID(), cues = [], timer, restoring = false, revision = 0, savedRevision = -1;
    let saveQueue = Promise.resolve(), savedAssets = {}, scenePlaying = false;
    const project = () => (window.ViralProject ||= {});
    const mode = () => byId("editorMode").value;
    const selection = () => window.ViralVideo?.videoFile ? ViralVideo.getSelection() : {start:0, end:0, duration:0};
    function status(message) { byId("subtitleStatus").textContent = message; }
    function invalidate() {
        project().subtitlesApproved = false;
        byId("approveSubtitlesBtn").disabled = !cues.length;
        byId("approveSubtitlesBtn").textContent = "✅ Approve Subtitles";
        byId("renderVideoBtn").disabled = !!window.ViralRenderer?.rendering;
        byId("renderStatus").textContent = "Render checks your latest captions and timing before exporting.";
    }
    function changed() {
        if (restoring) return;
        revision++;
        byId("draftStatus").textContent = "Unsaved changes…";
        clearTimeout(timer);
        timer = setTimeout(() => save(false), 1200);
    }
    function applyMode() {
        const subtitlesOnly = mode() === "subtitles";
        project().editorMode = mode();
        ["voiceSection", "audioSection", "storySection"].forEach(id => byId(id).style.display = id === "storySection" || !subtitlesOnly ? "block" : "none");
        document.querySelector(".character-voice-panel").style.display = subtitlesOnly ? "none" : "block";
        document.querySelector(".analysis-panel").style.display = "none";
        byId("subtitleSection").style.display = "block";
        byId("renderSection").style.display = "block";
        byId("storyHeading").textContent = subtitlesOnly ? "Caption text" : "Narration text";
        byId("storyHelp").textContent = subtitlesOnly ? "Paste captions here, one caption per line. Then create and adjust their timing." : "Write or paste your narration. Upload or record the matching audio, then adjust the subtitle timing.";
        byId("modeHelp").textContent = subtitlesOnly ? "Your original video sound is preserved. Narration, music and character voice effects are skipped." : "Add your narration, choose the audio mix, and align captions with speech.";
        byId("videoPreview").muted = !subtitlesOnly && project().audioMode === "narration";
        updateOutput();
        renderCues();
    }
    function updateOutput() {
        project().outputAspectRatio = byId("outputAspectRatio").value;
        project().exportQuality = byId("exportQuality").value;
        const video = byId("videoPreview");
        if (video.videoWidth && video.videoHeight) video.parentElement.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
        const d = ViralRenderer.getOutputDimensions();
        const label = project().outputAspectRatio === "source" ? "Original shape" : project().outputAspectRatio;
        byId("renderFormatSummary").textContent = `${label} · ${d.width}×${d.height}`;
        byId("outputAspectHelp").textContent = project().outputAspectRatio === "source" ? "Keeps the whole image without cropping. Resolution is limited by your selected export quality." : "Resizes and crops to fill this shape. Vertical export uses Smart Crop.";
    }
    function captionChanged() { project().subtitles = cues; invalidate(); changed(); preview(); }
    function renderCues() {
        const list = byId("subtitleList"); list.replaceChildren();
        cues.forEach((cue, index) => {
            const card = document.createElement("div"); card.className = "result-card caption-card";
            const heading = document.createElement("strong"); heading.textContent = `Caption ${index + 1}`; card.append(heading);
            const text = document.createElement("textarea"); text.rows = 2; text.value = cue.text; text.setAttribute("aria-label", `Caption ${index + 1} text`);
            text.addEventListener("input", () => {cue.text = text.value; captionChanged();}); card.append(text);
            const times = document.createElement("div"); times.className = "caption-times";
            ["start", "end"].forEach(key => {
                const label = document.createElement("label"); label.textContent = key === "start" ? "Start (seconds)" : "End (seconds)";
                const field = document.createElement("input"); field.type = "number"; field.min = "0"; field.step = "0.01"; field.value = cue[key];
                field.setAttribute("aria-label", `Caption ${index + 1} ${key}`);
                field.addEventListener("input", () => {cue[key] = field.value === "" ? NaN : Number(field.value); captionChanged();});
                const use = document.createElement("button"); use.type = "button"; use.className = "small-btn"; use.textContent = "Use playhead";
                use.addEventListener("click", () => {cue[key] = Math.round(Math.max(0, byId("videoPreview").currentTime - selection().start) * 100) / 100; field.value = cue[key]; captionChanged();});
                label.append(field, use); times.append(label);
            }); card.append(times);
            if (mode() === "narration") {
                const label = document.createElement("label"); label.textContent = "Character voice style";
                const voice = document.createElement("select");
                profiles.forEach(p => voice.add(new Option(p, p))); voice.value = cue.voiceProfile || "narrator";
                voice.addEventListener("change", () => {cue.voiceProfile = voice.value; captionChanged();}); label.append(voice); card.append(label);
            }
            const play = document.createElement("button"); play.type = "button"; play.className = "small-btn"; play.textContent = "▶ Preview caption";
            play.addEventListener("click", () => playScene(cue.start));
            const remove = document.createElement("button"); remove.type = "button"; remove.className = "small-btn"; remove.textContent = "Remove caption";
            remove.addEventListener("click", () => {cues.splice(index,1); renderCues(); captionChanged();});
            card.append(play, remove); list.append(card);
        });
        byId("approveSubtitlesBtn").disabled = !cues.length;
    }
    function generate() {
        const scene = selection();
        if (!scene.duration) return status("Upload a video and select a scene first.");
        if (cues.length && !confirm("Replace the current captions and their edited times with your text?")) return;
        const text = byId("amharicStory").value;
        if (!text.trim()) return status("Write or paste your caption text first.");
        project().amharicStory = text; project().storyApproved = true;
        cues = ViralCaptions.fromText(text, scene.duration, byId("defaultCharacterVoice").value);
        renderCues(); captionChanged();
        status("Estimated timing created. Listen and adjust each caption before approving.");
    }
    function approve() {
        const error = ViralCaptions.validate(cues, selection().duration);
        if (error) return status(error);
        project().subtitles = cues.map(c => ({...c})); project().subtitlesApproved = true;
        byId("renderVideoBtn").disabled = false;
        byId("approveSubtitlesBtn").textContent = "✅ Subtitles Approved";
        status("Timing approved. Ready to export."); changed();
    }
    function preview() {
        const video = byId("videoPreview"), t = video.currentTime - selection().start;
        const cue = cues.find(c => t >= c.start && t < c.end);
        const overlay = byId("captionOverlay"); overlay.textContent = cue?.text || ""; overlay.hidden = !cue;
        overlay.dataset.position = byId("subtitlePosition").value;
        overlay.dataset.style = byId("subtitleStyle").value;
        overlay.style.color = byId("subtitleColor").value;
        const dimensions = ViralRenderer.getOutputDimensions();
        const fontScale = (dimensions.width > dimensions.height ? 3.8 : 2.5) * Math.min(dimensions.width,dimensions.height) / 1080;
        const previewScale = video.clientWidth / dimensions.width;
        overlay.style.fontSize = `${Math.max(12, Number(byId("subtitleSize").value) * fontScale * previewScale)}px`;
        byId("captionClock").textContent = `Scene time: ${Math.max(0,t).toFixed(2)} s`;
        byId("subtitlePreview").textContent = cue?.text || "Play the selected scene to preview captions. Character voice effects are applied during export.";
        const voice = byId("voicePreview");
        if (scenePlaying && mode() === "narration" && project().audioMode !== "original" && voice.src && !video.paused) {
            if (Math.abs(voice.currentTime - Math.max(0,t)) > 0.25) voice.currentTime = Math.max(0,t);
        }
        if (scenePlaying && video.currentTime >= selection().end) { video.pause(); scenePlaying = false; }
    }
    async function playScene(at = 0) {
        if (!ViralVideo.videoFile) return status("Upload a video first.");
        if (!Number.isFinite(at)) return status("Enter a valid caption start time.");
        const scene = selection(), video = byId("videoPreview"), voice = byId("voicePreview");
        video.currentTime = Math.min(scene.end, scene.start + Math.max(0,at)); scenePlaying = true;
        video.muted = mode() === "narration" && project().audioMode === "narration";
        video.volume = mode() === "subtitles" ? 1 : Math.min(1, project().originalVolume ?? 0.35);
        if (mode() === "narration" && project().audioMode !== "original" && voice.src) {
            voice.currentTime = Math.max(0,at); voice.volume = Math.min(1, project().narrationVolume ?? 1);
            voice.play().catch(() => status("Press play on the narration preview to hear it."));
        }
        try { await video.play(); } catch (e) { status(e.message); }
    }
    const currentAssets = () => ({video: ViralVideo.videoFile || null, voice: ViralVoice.currentAudioBlob || project().voiceBlob || null, music: project().backgroundMusicBlob || null, logo: project().logoBlob || null});
    function save(explicit = true) {
        clearTimeout(timer);
        // Serialize saves and loads; a slower earlier write cannot replace a newer draft.
        saveQueue = saveQueue.catch(() => {}).then(async () => {
            if (restoring || (!explicit && revision === savedRevision)) return;
            const capturedRevision = revision, assets = currentAssets(), changedAssets = {};
            for (const [kind, blob] of Object.entries(assets)) if (savedAssets[kind] !== blob) changedAssets[kind] = blob;
            const controls = Object.fromEntries(settings.map(key => [key, byId(key).value]));
            controls.audioMode = document.querySelector('input[name="audioMode"]:checked')?.value || "narration";
            controls.voiceSource = document.querySelector('input[name="voiceSource"]:checked')?.value || "upload";
            const draft = {id, version:1, name:byId("draftName").value.trim() || assets.video?.name || "Untitled video", updatedAt:Date.now(), scene:selection(), text:byId("amharicStory").value, cues:structuredClone(cues), controls,
                voiceApproved:!!project().voiceApproved, subtitlesApproved:!!project().subtitlesApproved,
                videoName:assets.video?.name || "video.mp4", musicName:project().backgroundMusicName || "Music", logoName:project().logoName || "Logo"};
            try {
                await ViralDrafts.save(draft, changedAssets);
                savedAssets = assets; savedRevision = capturedRevision;
                if (revision === capturedRevision) byId("draftStatus").textContent = "Draft saved with your video, audio, captions and settings.";
                await refreshDrafts();
            } catch (error) {
                byId("draftStatus").textContent = "Could not save this draft. Browser storage may be full or unavailable. Your open project is still here; export it before closing.";
                console.error("Draft save failed", error);
            }
        });
        return saveQueue;
    }
    async function refreshDrafts() {
        const drafts = await ViralDrafts.list(), select = byId("draftSelect");
        select.replaceChildren(new Option("Choose a draft", ""));
        drafts.forEach(d => select.add(new Option(d.name + " · " + new Date(d.updatedAt).toLocaleString(), d.id)));
        select.value = drafts.some(d => d.id === id) ? id : "";
    }
    async function load() {
        const requested = byId("draftSelect").value;
        if (!requested) return;
        if (ViralRenderer.rendering) return status("Finish or cancel the export before opening a draft.");
        if (revision !== savedRevision && !confirm("Open this draft and replace your unsaved changes?")) return;
        clearTimeout(timer); await saveQueue;
        restoring = true;
        try {
            const {draft, assets} = await ViralDrafts.load(requested);
            if (!draft || draft.version !== 1) throw new Error("This draft is unavailable or uses an unsupported version.");
            byId("videoPreview").pause(); byId("voicePreview").pause();
            if (ViralVideo.videoUrl) URL.revokeObjectURL(ViralVideo.videoUrl);
            ViralVideo.videoFile = assets.video ? new File([assets.video], draft.videoName, {type:assets.video.type}) : null;
            if (assets.video) {
                ViralVideo.videoUrl = URL.createObjectURL(ViralVideo.videoFile);
                await new Promise((resolve, reject) => {
                    const video = byId("videoPreview");
                    const timeout = setTimeout(() => finish(new Error("Saved video could not be loaded.")), 15000);
                    function finish(error) {clearTimeout(timeout); video.removeEventListener("loadedmetadata", ready); video.removeEventListener("error", failed); error ? reject(error) : resolve();}
                    const ready = () => finish(), failed = () => finish(new Error("Saved video could not be decoded."));
                    video.addEventListener("loadedmetadata", ready); video.addEventListener("error", failed);
                    video.src = ViralVideo.videoUrl; video.load();
                });
                byId("videoPreview").style.display = "block"; byId("videoEmpty").style.display = "none";
                byId("startRange").value = draft.scene.start; byId("endRange").value = draft.scene.end; ViralVideo.update();
            } else {
                byId("videoPreview").removeAttribute("src"); byId("videoPreview").load(); byId("videoEmpty").style.display = "";
                byId("startRange").value = byId("endRange").value = 0;
            }
            window.ViralProject = {voiceBlob:assets.voice, voiceApproved:draft.voiceApproved, backgroundMusicBlob:assets.music, backgroundMusicName:draft.musicName, logoBlob:assets.logo, logoName:draft.logoName, subtitlesApproved:draft.subtitlesApproved, amharicStory:draft.text};
            for (const key of settings) if (draft.controls[key] !== undefined) byId(key).value = draft.controls[key];
            for (const name of ["audioMode", "voiceSource"]) {
                const radio = [...document.querySelectorAll(`input[name="${name}"]`)].find(r => r.value === draft.controls[name]);
                if (radio) {radio.checked = true; radio.dispatchEvent(new Event("change", {bubbles:true}));}
            }
            for (const key of settings) byId(key).dispatchEvent(new Event("input", {bubbles:true}));
            ViralVoice.currentAudioBlob = assets.voice; ViralVoice.approved = draft.voiceApproved;
            if (ViralVoice.currentAudioUrl) URL.revokeObjectURL(ViralVoice.currentAudioUrl);
            ViralVoice.currentAudioUrl = assets.voice ? URL.createObjectURL(assets.voice) : null;
            for (const [kind, mediaId, nameId, name] of [["voice","voicePreview","voiceFileName","Saved narration"],["music","backgroundMusicPreview","backgroundMusicFileName",draft.musicName],["logo","logoPreview","logoFileName",draft.logoName]]) {
                const media = byId(mediaId); if (media.src) URL.revokeObjectURL(media.src);
                if (assets[kind]) {media.src = URL.createObjectURL(assets[kind]); media.style.display="block";} else {media.removeAttribute("src"); media.style.display="none";}
                byId(nameId).textContent = assets[kind] ? name : "";
            }
            byId("removeBackgroundMusicBtn").style.display = assets.music ? "inline-block" : "none";
            byId("removeLogoBtn").style.display = assets.logo ? "inline-block" : "none";
            byId("approveVoiceBtn").disabled = !assets.voice || draft.voiceApproved;
            byId("approveVoiceBtn").textContent = draft.voiceApproved ? "✅ Voice Approved" : "✅ Approve Voice";
            id = draft.id; cues = draft.cues; project().subtitles = cues; savedAssets = currentAssets();
            byId("draftName").value = draft.name; byId("amharicStory").value = draft.text;
            applyMode();
            const valid = !ViralCaptions.validate(cues, selection().duration);
            project().subtitlesApproved = draft.subtitlesApproved && valid;
            byId("renderVideoBtn").disabled = false;
            byId("finalVideoWrap").style.display = "none";
            revision = savedRevision = 0;
            byId("draftStatus").textContent = "Draft reopened with media and timing restored.";
            preview();
        } catch (error) { byId("draftStatus").textContent = "Could not open draft: " + error.message; }
        finally { restoring = false; }
    }
    function setupFloatingPreview() {
        const video = byId("videoPreview"), wrap = video.parentElement;
        const anchor = document.createElement("div"); anchor.id = "previewAnchor";
        const shell = document.createElement("div"); shell.id = "previewShell";
        wrap.before(anchor); anchor.append(shell); shell.append(wrap);
        const controls = document.createElement("div"); controls.className = "floating-preview-controls";
        const row = document.createElement("div"); row.className = "floating-preview-row";
        const play = document.createElement("button"); play.type = "button"; play.className = "small-btn";
        play.textContent = "▶ Play"; play.id = "floatingPlayBtn";
        const clock = document.createElement("output"); clock.id = "floatingClock"; clock.textContent = "0.00 / 0.00 s";
        clock.setAttribute("aria-label", "Selected scene playhead time");
        const back = document.createElement("button"); back.type = "button"; back.className = "small-btn"; back.textContent = "Back to video";
        const seek = document.createElement("input"); seek.type = "range"; seek.min = "0"; seek.max = "0"; seek.step = "0.01"; seek.value = "0"; seek.id = "floatingSeek";
        seek.setAttribute("aria-label", "Seek within selected scene");
        row.append(play, clock, back); controls.append(row, seek); shell.append(controls);
        const label = document.createElement("label"); label.className = "floating-preview-option";
        const enabled = document.createElement("input"); enabled.type = "checkbox"; enabled.checked = true; enabled.id = "floatPreviewEnabled";
        label.append(enabled, " Keep video visible while editing captions"); anchor.after(label);
        let frame = 0, floating = false;
        function layout() {
            frame = 0;
            const headerBottom = document.querySelector(".topbar").getBoundingClientRect().bottom;
            const top = Math.max(8, headerBottom + 8);
            const shouldFloat = enabled.checked && !!ViralVideo.videoFile && anchor.getBoundingClientRect().bottom < top;
            if (shouldFloat && !floating) anchor.style.height = `${shell.getBoundingClientRect().height}px`;
            shell.classList.toggle("is-floating", shouldFloat);
            if (!shouldFloat) anchor.style.height = "";
            floating = shouldFloat;
            if (floating) {
                const viewport = window.visualViewport;
                const viewportWidth = viewport?.width || window.innerWidth;
                const viewportHeight = viewport?.height || window.innerHeight;
                shell.classList.toggle("compact-floating", viewportHeight < 500);
                const ratio = video.videoWidth / video.videoHeight || 16 / 9;
                const videoHeight = Math.max(60, Math.min(220, viewportHeight * 0.28, viewportHeight - top - 110));
                const width = Math.max(80, Math.min(420, viewportWidth - 24, videoHeight * ratio));
                shell.style.setProperty("--floating-width", `${width}px`);
                shell.style.setProperty("--preview-top", `${top}px`);
                document.documentElement.style.setProperty("--floating-preview-bottom", `${top + width / ratio + controls.offsetHeight + 12}px`);
                // Floating changes the preview scale; refresh caption size without changing media.
                preview();
                const active = document.activeElement;
                if (viewportHeight < 500 && active?.closest(".caption-card")) {
                    const rect = active.getBoundingClientRect(), limit = shell.getBoundingClientRect().bottom + 8;
                    if (rect.top < limit) window.scrollBy(0, rect.top - limit);
                    else if (rect.bottom > viewportHeight - 8) window.scrollBy(0, rect.bottom - viewportHeight + 8);
                }
            } else document.documentElement.style.setProperty("--floating-preview-bottom", "80px");
        }
        function scheduleLayout() { if (!frame) frame = requestAnimationFrame(layout); }
        function syncControls() {
            const scene = selection(), time = Math.max(0, Math.min(scene.duration, video.currentTime - scene.start));
            seek.max = scene.duration || 0; seek.value = time;
            play.textContent = video.paused ? "▶ Play" : "⏸ Pause";
            clock.textContent = `${time.toFixed(2)} / ${scene.duration.toFixed(2)} s`;
        }
        play.addEventListener("click", () => {
            if (!video.paused) video.pause();
            else {
                const scene = selection(), time = video.currentTime - scene.start;
                playScene(time >= scene.duration ? 0 : Math.max(0, time));
            }
        });
        seek.addEventListener("input", () => {
            const scene = selection();
            video.currentTime = scene.start + Math.min(scene.duration, Number(seek.value));
            preview(); syncControls();
        });
        back.addEventListener("click", () => anchor.scrollIntoView({behavior:"smooth", block:"center"}));
        enabled.addEventListener("change", scheduleLayout);
        for (const event of ["timeupdate", "play", "pause", "seeked", "loadedmetadata"]) video.addEventListener(event, syncControls);
        video.addEventListener("loadedmetadata", scheduleLayout);
        ["startRange", "endRange"].forEach(id => byId(id).addEventListener("input", syncControls));
        window.addEventListener("scroll", scheduleLayout, {passive:true});
        window.addEventListener("resize", scheduleLayout);
        window.visualViewport?.addEventListener("resize", scheduleLayout);
        // Resize also occurs when a restored draft changes video orientation.
        new ResizeObserver(scheduleLayout).observe(wrap);
        document.addEventListener("focusin", event => {
            if (!floating || !event.target.closest(".caption-card")) return;
            const card = event.target.closest(".caption-card");
            const height = window.visualViewport?.height || window.innerHeight;
            const rect = (window.innerWidth <= 600 && height >= 500 ? card : event.target).getBoundingClientRect();
            const bottom = shell.getBoundingClientRect().bottom;
            if (rect.top < bottom + 12) window.scrollBy({top:rect.top - bottom - 12, behavior:"smooth"});
        });
        syncControls(); layout();
    }
    function init() {
        ViralVideo.init();
        setupFloatingPreview();
        const video = byId("videoPreview");
        video.addEventListener("loadedmetadata", () => {
            if (restoring) return;
            if (mode() === "subtitles") {byId("endRange").value = video.duration; ViralVideo.update();}
            invalidate(); updateOutput(); changed();
        });
        video.addEventListener("timeupdate", preview);
        video.addEventListener("pause", () => byId("voicePreview").pause());
        video.addEventListener("seeking", preview);
        byId("editorMode").addEventListener("change", () => {video.pause(); applyMode(); invalidate(); changed();});
        ["startRange", "endRange"].forEach(key => byId(key).addEventListener("input", () => {invalidate(); changed(); preview();}));
        document.addEventListener("input", e => {
            if (settings.includes(e.target.id) || ["draftName", "amharicStory"].includes(e.target.id)) { updateOutput(); preview(); changed(); }
        });
        document.addEventListener("change", e => { if (e.target.matches('input[type="file"], input[type="radio"]')) changed(); });
        document.addEventListener("viral-media-changed", changed);
        byId("approveVoiceBtn").addEventListener("click", () => setTimeout(changed,0));
        byId("removeBackgroundMusicBtn").addEventListener("click", changed); byId("removeLogoBtn").addEventListener("click", changed);
        byId("approveStoryBtn").addEventListener("click", () => {
            const text = byId("amharicStory").value.trim(); if (!text) return status("Enter text first.");
            project().amharicStory = text; project().storyApproved = true;
            if (mode() === "subtitles") generate(); else {byId("voiceSection").style.display = "block"; status("Add matching narration audio, then create subtitle timing."); changed();}
        });
        byId("editStoryBtn").addEventListener("click", () => byId("amharicStory").focus());
        byId("generateSubtitlesBtn").addEventListener("click", generate); byId("approveSubtitlesBtn").addEventListener("click", approve);
        byId("addCaptionBtn").addEventListener("click", () => {const start = cues.at(-1)?.end || 0; cues.push({text:"", start, end:Math.min(selection().duration,start+2), voiceProfile:"narrator"}); renderCues(); captionChanged();});
        byId("previewSceneBtn").addEventListener("click", () => playScene());
        byId("saveDraftBtn").addEventListener("click", () => save()); byId("loadDraftBtn").addEventListener("click", load);
        byId("newDraftBtn").addEventListener("click", async () => {
            if (ViralRenderer.rendering) return status("Finish or cancel the export first.");
            await save(); if (revision !== savedRevision && !confirm("Start a new project without saving these changes?")) return;
            location.reload();
        });
        byId("importSrtBtn").addEventListener("click", () => byId("srtInput").click());
        byId("srtInput").addEventListener("change", async e => {
            try {const file = e.target.files[0]; if (!file) return; const imported = ViralCaptions.parseSrt(await file.text());
                const error = ViralCaptions.validate(imported, selection().duration); if (error) throw new Error(error);
                if (cues.length && !confirm("Replace your current captions with this SRT file?")) return;
                cues = imported; renderCues(); captionChanged(); status("SRT imported. Times are relative to your selected scene.");
            } catch (error) {status(error.message);} finally {e.target.value = "";}
        });
        byId("exportSrtBtn").addEventListener("click", () => {
            const error = ViralCaptions.validate(cues,selection().duration); if (error) return status(error);
            const url = URL.createObjectURL(new Blob([ViralCaptions.toSrt(cues)], {type:"text/plain;charset=utf-8"}));
            const link = document.createElement("a"); link.href=url; link.download="viral-captions.srt"; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
        });
        byId("analyzeBtn").addEventListener("click", async () => {
            try {const frames = await ViralVideo.extractFrames(), gallery = byId("sceneFramesGallery"); gallery.replaceChildren();
                frames.forEach((frame,i) => {const img=document.createElement("img"); img.src=frame.image; img.alt=`Frame ${i+1} at ${frame.time}s`; img.style.width="100%"; gallery.append(img);});
                window.ViralSceneFrames = frames;
                byId("shareSceneFramesBtn").disabled = false;
                byId("openSceneFramesBtn").disabled = false;
                document.querySelector(".analysis-panel").style.display="block"; byId("analysisResult").classList.remove("hidden"); byId("analysisEmpty").style.display="none";
                byId("sceneFramesStatus").textContent=`${frames.length} scene frames extracted.`;
            } catch (error) {byId("status").textContent=error.message;}
        });
        byId("shareSceneFramesBtn").addEventListener("click", async () => {
            try {
                const files = await Promise.all((window.ViralSceneFrames || []).map(async (f,i) => new File([await (await fetch(f.image)).blob()], `scene-frame-${i+1}.jpg`, {type:"image/jpeg"})));
                if (!navigator.canShare?.({files})) throw new Error("Sharing is unavailable here. Use Open Frames to save images.");
                await navigator.share({files, title:"VIRAL scene frames"});
                byId("sceneFramesShareStatus").textContent = "Frames shared.";
            } catch (error) {if (error.name !== "AbortError") byId("sceneFramesShareStatus").textContent = error.message;}
        });
        byId("openSceneFramesBtn").addEventListener("click", () => {
            const view = window.open("", "_blank"); if (!view) return;
            view.opener = null; view.document.title = "VIRAL scene frames";
            (window.ViralSceneFrames || []).forEach((f,i) => {
                const a = view.document.createElement("a"), img = view.document.createElement("img");
                a.href = f.image; a.download = `scene-frame-${i+1}.jpg`; img.src = f.image; img.alt = `Frame ${i+1}`; img.style.width="100%"; a.append(img); view.document.body.append(a);
            });
        });
        byId("narrationBtn").addEventListener("click", () => byId("amharicStory").focus());
        byId("cancelRenderBtn").addEventListener("click", () => ViralRenderer.cancel());
        window.addEventListener("beforeunload", e => {if (revision !== savedRevision || ViralRenderer.rendering) {e.preventDefault(); e.returnValue="";}});
        applyMode(); invalidate();
        refreshDrafts().catch(() => {byId("draftStatus").textContent="Draft storage is unavailable in this browser. You can still edit and export.";});
    }
    document.addEventListener("DOMContentLoaded", init);
    return {save, load, get cues() {return cues;}, selection};
})();
