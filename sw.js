/* Service worker : permet d'ouvrir l'appli sans connexion.
   Pour publier une mise à jour, change simplement le numéro de VERSION. */
const VERSION = "v1";
const CACHE = "premier-round-" + VERSION;
const SHELL = ["./", "index.html", "style.css", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("premier-round-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
const store = (req, res) => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    /* fichiers de l'appli : réseau d'abord (mises à jour), cache si hors ligne */
    e.respondWith(fetch(req).then(res => store(req, res)).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else if (/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
    /* polices : cache d'abord */
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => store(req, res))));
  }
});
