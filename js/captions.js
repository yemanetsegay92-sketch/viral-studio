/* Caption times are relative to the selected scene, not the source video. */
(function (root) {
    "use strict";
    const round = n => Math.round(n * 1000) / 1000;
    function fromText(text, duration, voiceProfile = "narrator") {
        const lines = text.trim().split(/\n+|(?<=[።.!?])\s+/u).map(s => s.trim()).filter(Boolean);
        const weights = lines.map(s => Math.max(1, s.split(/\s+/u).length));
        const total = weights.reduce((a, b) => a + b, 0);
        let cursor = 0;
        return lines.map((text, i) => {
            const start = cursor;
            cursor += duration * weights[i] / total;
            return { text, start: round(start), end: round(i === lines.length - 1 ? duration : cursor), voiceProfile };
        });
    }
    function validate(cues, duration) {
        if (!Number.isFinite(duration) || duration <= 0) return "Select a video scene first.";
        if (!cues.length) return "Add at least one caption.";
        let previousEnd = 0;
        for (let i = 0; i < cues.length; i++) {
            const c = cues[i], prefix = "Caption " + (i + 1) + ": ";
            if (!String(c.text).trim()) return prefix + "enter text.";
            if (!Number.isFinite(c.start) || !Number.isFinite(c.end)) return prefix + "enter valid times.";
            if (c.start < 0 || c.end <= c.start) return prefix + "end must be after start, and start cannot be negative.";
            if (c.end > duration + 0.001) return prefix + "ends after the selected scene.";
            if (c.start < previousEnd - 0.001) return prefix + "overlaps the previous caption. Adjust the times.";
            previousEnd = c.end;
        }
        return "";
    }
    function timestamp(n) {
        const ms = Math.round(Math.max(0, n) * 1000);
        return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60]
            .map(n => String(n).padStart(2, "0")).join(":") + "," + String(ms % 1000).padStart(3, "0");
    }
    function toSrt(cues) {
        return cues.map((c, i) => `${i + 1}\n${timestamp(c.start)} --> ${timestamp(c.end)}\n${c.text}`).join("\n\n") + "\n";
    }
    function parseSrt(text) {
        const time = s => {
            const m = s.match(/^(\d+):(\d{2}):(\d{2})[,.](\d{3})$/);
            if (!m || +m[2] > 59 || +m[3] > 59) throw new Error("Invalid SRT timestamp.");
            return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
        };
        return text.replace(/^\uFEFF/, "").trim().split(/\r?\n\s*\r?\n/).map(block => {
            const lines = block.split(/\r?\n/);
            if (/^\d+$/.test(lines[0])) lines.shift();
            const timing = lines.shift().split(/\s+-->\s+/);
            if (timing.length !== 2 || !lines.length) throw new Error("Invalid SRT caption block.");
            return {start: time(timing[0]), end: time(timing[1]), text: lines.join("\n"), voiceProfile: "narrator"};
        });
    }
    const api = {fromText, validate, timestamp, toSrt, parseSrt};
    if (typeof module !== "undefined") module.exports = api;
    else root.ViralCaptions = api;
})(globalThis);
