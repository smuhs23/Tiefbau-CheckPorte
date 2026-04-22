/* TiefbauPorte — Service Worker
   Strategie:
   - App-Shell (HTML/CSS/JS/Icons/Vendor-Libs) → Cache-First, Update via versionierten Cache-Namen
   - OSM / ArcGIS Tiles            → Stale-While-Revalidate, eigener Cache mit Größenbegrenzung
   - Nominatim-Suchen              → Network-Only (brauchen Live-Ergebnisse)
*/

const VERSION      = 'v1.0.0';
const SHELL_CACHE  = `tbp-shell-${VERSION}`;
const TILES_CACHE  = 'tbp-tiles';
const TILE_MAX     = 800;   // max. gecachte Kacheln
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
  './vendor/leaflet/images/marker-icon.png',
  './vendor/leaflet/images/marker-icon-2x.png',
  './vendor/leaflet/images/marker-shadow.png',
  './vendor/leaflet/images/layers.png',
  './vendor/leaflet/images/layers-2x.png',
  './vendor/xlsx.full.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js',
  './vendor/html2canvas.min.js'
];

// ---- Install ----
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate ----
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith('tbp-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// ---- Tile-Cache pruning ----
async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // FIFO: älteste zuerst raus
  const toDelete = keys.length - maxEntries;
  for (let i = 0; i < toDelete; i++) await cache.delete(keys[i]);
}

// ---- Fetch ----
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1) Nominatim → immer Netz (Suche braucht Live)
  if (url.hostname === 'nominatim.openstreetmap.org') {
    e.respondWith(fetch(req).catch(() => new Response('[]', {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // 2) Kartenkacheln (OSM / ArcGIS) → Stale-While-Revalidate, eigener Cache
  const isTile =
    /\.tile\.openstreetmap\.de$/i.test(url.hostname) ||
    /server\.arcgisonline\.com$/i.test(url.hostname);

  if (isTile) {
    e.respondWith((async () => {
      const cache = await caches.open(TILES_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => {
        if (res && res.status === 200) {
          cache.put(req, res.clone()).then(() => trimCache(TILES_CACHE, TILE_MAX));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // 3) Same-Origin App-Shell → Cache-First, Fallback Netz
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const res = await fetch(req);
        // Erfolgreiche GET-Responses im Shell-Cache ablegen
        if (res && res.status === 200 && res.type === 'basic') {
          cache.put(req, res.clone());
        }
        return res;
      } catch (err) {
        // Navigation → Fallback auf index
        if (req.mode === 'navigate') return cache.match('./index.html');
        throw err;
      }
    })());
    return;
  }

  // 4) Alles andere → Netz
});

// ---- Update-Trigger vom Client ----
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
