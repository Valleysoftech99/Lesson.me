const APP_ROOT = new URL("./", self.location.href);
const CACHE_PREFIX = `lesson-me-${encodeURIComponent(APP_ROOT.pathname)}-`;
const CACHE_NAME = `${CACHE_PREFIX}v7`;
const APP_SHELL = [
  "index.html",
  "manifest.json",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/css/core.css",
  "assets/css/themes.css",
  "assets/js/app.js",
  "assets/js/vendor/marked.js",
  "assets/js/vendor/purify.min.js",
  "estudios/index.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map((path) => new URL(path, APP_ROOT)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== "GET" || requestUrl.origin !== APP_ROOT.origin ||
      !requestUrl.pathname.startsWith(APP_ROOT.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isContent = /\.(?:json|md)$/i.test(requestUrl.pathname);
    if (isContent) {
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw new Error("El recurso no está disponible en línea ni en caché.");
      }
    }

    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const shell = await cache.match(new URL("index.html", APP_ROOT));
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
