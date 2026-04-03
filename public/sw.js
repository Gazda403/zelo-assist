self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Minimal fetch listener, just required for PWA installability in some older browser versions,
  // though many modern browsers only require the file to exist and be registered.
  // We can just fall back to the network for everything for now to avoid caching issues during development.
  event.respondWith(fetch(event.request).catch(() => new Response("Offline")));
});
