// Pocket Glade service worker — makes the pocket garden work fully offline
// once installed to a home screen. Cache-first for the tiny asset set.
const CACHE = "pocket-glade-v1";
const ASSETS = [
  "pocket.html",
  "manifest.webmanifest",
  "icons-pwa/icon-192.png",
  "icons-pwa/icon-512.png",
  "icons-pwa/icon-512-maskable.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match("pocket.html"))
    )
  );
});
