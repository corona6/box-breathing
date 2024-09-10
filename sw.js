
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

self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for', event.request.url);

    if (event.request.headers.get('range')) {
        var pos =
        Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
        console.log('Range request for', event.request.url,
        ', starting position:', pos);
        event.respondWith(
            caches.open(MAIN_CACHE)
            .then(function(cache) {
                return cache.match(event.request.url);
            }).then(function(res) {
                if (!res) {
                return fetch(event.request)
                .then(res => {
                    return res.arrayBuffer();
                });
                }
                return res.arrayBuffer();
            }).then(function(ab) {
                return new Response(
                ab.slice(pos),
                {
                    status: 206,
                    statusText: 'Partial Content',
                    headers: [
                    // ['Content-Type', 'video/webm'],
                    ['Content-Range', 'bytes ' + pos + '-' +
                        (ab.byteLength - 1) + '/' + ab.byteLength]]
                });
        }));
    } else {
        console.log('Non-range request for', event.request.url);
        event.respondWith(
            // caches.match() will look for a cache entry in all of the caches available to the service worker.
            // It's an alternative to first opening a specific named cache and then matching on that.
            caches.match(event.request).then(function(response) {
                if (response) {
                    console.log('Found response in cache:', response);
                    return response;
                }
                console.log('No response found in cache. About to fetch from network...');
                // event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
                // have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
                return fetch(event.request).then(function(response) {
                    console.log('Response from network is:', response);

                    return response;
                }).catch(function(error) {
                    // This catch() will handle exceptions thrown from the fetch() operation.
                    // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
                    // It will return a normal response object that has the appropriate error code set.
                    console.error('Fetching failed:', error);

                    throw error;
                });
            })
        );
    }
});