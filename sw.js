// Offline support: cache the app shell, then fonts and the Firebase library as they are used.
const CACHE = "costie-v5";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png","cat.png", "icon-512.png", "apple-touch-icon.png", "maskable-512.png"];
const CDN = ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const cdn = CDN.includes(url.hostname) && (url.hostname !== "www.gstatic.com" || url.pathname.startsWith("/firebasejs/"));
  if (url.origin === location.origin && (req.mode === "navigate" || url.pathname.endsWith("/index.html"))) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  if (url.origin === location.origin || cdn) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
