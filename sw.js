// Minimal service worker for ديفان الخليج — caches just the app shell so the
// app can still open when offline. Order/menu data is always fetched live
// from Firestore when a connection is available; this does NOT cache that
// dynamic data, to avoid ever showing stale prices or orders.
const CACHE_NAME = 'diwaniya-app-shell-v1';
const SHELL_URL = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([SHELL_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigation/document requests for the app shell.
  // Everything else (Firestore, Google Fonts, etc.) goes straight to the network.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(SHELL_URL))
    );
  }
});
