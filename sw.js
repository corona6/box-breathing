
const MAIN_CACHE = 'main_20240910';

self.addEventListener("install", async (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(MAIN_CACHE)
        await cache.addAll([
            '.',
            './checkbox.css',
            './favicon.ico',
            './index.html',
            './manifest.webmanifest',
            './guided_audio/exhale_en.mp3',
            './guided_audio/exhale_ja.mp3',
            './guided_audio/finish_en.mp3',
            './guided_audio/finish_ja.mp3',
            './guided_audio/hold_en.mp3',
            './guided_audio/hold_ja.mp3',
            './guided_audio/inhale_en.mp3',
            './guided_audio/inhale_ja.mp3',
            './icons/icon_64.png',
            './icons/icon_180.png',
            './icons/icon_256.png',
            './icons/icon_512.png'
        ])
    })())
});
  
const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    return fetch(request);
};

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request));
});

const deleteCache = async (key) => {
    await caches.delete(key);
};

const deleteOldCaches = async () => {
    const cacheKeepList = [MAIN_CACHE];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
    event.waitUntil(deleteOldCaches());
});
  