const CACHE_NAME = "hp-m1-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
];

async function safeCacheAddAll(cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        const req = new Request(url, { cache: "reload" });
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res.clone());
      } catch (e) {
        // 單一失敗不影響整體
      }
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await safeCacheAddAll(cache, CORE_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch {
          return (await caches.match("./index.html")) || new Response("Offline");
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
