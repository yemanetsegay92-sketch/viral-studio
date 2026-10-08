/* IndexedDB stores media separately so typing does not rewrite large files. */
window.ViralDrafts = (() => {
    "use strict";
    let database;
    function open() {
        if (!database) database = new Promise((resolve, reject) => {
            const req = indexedDB.open("viral-studio-drafts", 1);
            req.onupgradeneeded = () => {
                req.result.createObjectStore("drafts", {keyPath: "id"});
                req.result.createObjectStore("assets", {keyPath: "id"});
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => { database = null; reject(req.error); };
        });
        return database;
    }
    async function transaction(stores, mode, operation) {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(stores, mode);
            let result;
            tx.oncomplete = () => resolve(result);
            tx.onerror = tx.onabort = () => reject(tx.error || new Error("Draft save was interrupted."));
            operation(tx, value => { result = value; });
        });
    }
    return {
        list: () => transaction(["drafts"], "readonly", (tx, done) => {
            tx.objectStore("drafts").getAll().onsuccess = e => done(e.target.result.sort((a,b) => b.updatedAt - a.updatedAt));
        }),
        save: (draft, assets) => transaction(["drafts", "assets"], "readwrite", tx => {
            tx.objectStore("drafts").put(draft);
            for (const [kind, blob] of Object.entries(assets)) {
                const id = draft.id + ":" + kind;
                if (blob) tx.objectStore("assets").put({id, blob});
                else tx.objectStore("assets").delete(id);
            }
        }),
        load: id => transaction(["drafts", "assets"], "readonly", (tx, done) => {
            const result = {assets: {}};
            tx.objectStore("drafts").get(id).onsuccess = e => { result.draft = e.target.result; };
            for (const kind of ["video", "voice", "music", "logo"]) {
                tx.objectStore("assets").get(id + ":" + kind).onsuccess = e => {result.assets[kind] = e.target.result?.blob || null;};
            }
            done(result);
        })
    };
})();
