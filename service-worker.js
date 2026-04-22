/* Union E Genius Portal - Service Worker
 * Strategy: stale-while-revalidate for app shell, cache-first for icons
 * Cache busting via CACHE_VERSION bump on each deployment.
 */

const CACHE_VERSION = 'genius-portal-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png',
  './apps/tiefbauporte.html',
  './apps/kalkuporte.html',
  './apps/gk-rechner.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Shell + icons cached upfront; apps cached best-effort (may not exist yet)
      return Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch(() => null)
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin requests; pass through cross-origin (tiles, CDNs)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      // Return cached immediately, update in background (stale-while-revalidate)
      return cached || fetchPromise;
    })
  );
});

// Allow manual cache bust from the page
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});
