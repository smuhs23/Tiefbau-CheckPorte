# Union E · Genius Portal

Zentrales Tool-Portal für den BImA LIS-Rollout. Splash → Dashboard → App.
Installierbar als PWA auf iPhone, iPad und Desktop. Offline-fähig.

---

## Ordnerstruktur

```
portal/
├── index.html                 ← Splash + Dashboard (Haupteinstieg)
├── manifest.json              ← PWA-Manifest
├── service-worker.js          ← Offline-Cache
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   ├── icon-512-maskable.png
│   ├── apple-touch-icon.png
│   └── favicon.png
├── apps/
│   ├── tiefbauporte.html      ← DEINE Datei hier rein
│   ├── kalkuporte.html        ← DEINE Datei hier rein
│   └── gk-rechner.html        ← DEINE Datei hier rein
├── BACK-BUTTON-SNIPPET.html   ← Anleitung für Back-Button (nicht Teil der App)
└── README.md                  ← diese Datei
```

---

## Setup in 3 Schritten

### 1. Dateien kombinieren
- ZIP entpacken
- Deine drei HTML-Apps (`tiefbauporte.html`, `kalkuporte.html`, `gk-rechner.html`) in den Ordner `apps/` legen
- **Wichtig:** Dateinamen müssen genau so heißen — sonst finden die Portal-Links sie nicht

### 2. Back-Button einbauen (optional, aber empfohlen)
- Öffne `BACK-BUTTON-SNIPPET.html` im Browser
- Folge der Anleitung und füge den Button in alle 3 Apps ein
- Dauert ca. 2 Minuten pro App

### 3. Hosten
Variante A — **Lokal testen**: `index.html` direkt im Browser öffnen (manche PWA-Features wie Service Worker funktionieren mit `file://` nicht — dafür Variante B).

Variante B — **GitHub Pages** (empfohlen):
1. Repo anlegen, alle Portal-Dateien committen
2. Settings → Pages → Deploy from branch `main` / root
3. URL: `https://<user>.github.io/<repo>/`
4. Auf iPhone in Safari öffnen → Teilen → "Zum Home-Bildschirm"

Variante C — **SharePoint/Intranet**: Alle Dateien in einen Webserver-Ordner, Pfad zu `index.html` aufrufen.

---

## Design-System

- Navy `#1B2D5E` (Primär)
- Grün `#78B51A` (Akzent)
- Serifen-Display-Font: Fraunces (Web-Font)
- Body: Calibri, Fallback Inter/System
- Aesthetik: Refined minimalism, Editorial touch, klare Hierarchie

---

## PWA-Features

- **Installierbar** auf iOS/iPadOS/Android/Desktop
- **Offline-fähig** — Service Worker cached App-Shell + Apps
- **App-Shortcuts** — Long-Press auf Icon öffnet direkt TiefbauPorte / KalkuPorte / GK-Rechner
- **Safe-Area** — Respektiert Notch und Home-Indicator auf iPhone

---

## Updates ausrollen

Wenn eine App aktualisiert wird:

1. Neue Version in `apps/` überschreiben
2. In `service-worker.js` die Zeile `CACHE_VERSION = 'genius-portal-v1'` hochzählen (v2, v3, …)
3. Deploy → Nutzer bekommen beim nächsten Öffnen die neue Version

Alternativ: Nutzer können auf dem Dashboard auf "Cache leeren & neu laden" tippen.

---

## Troubleshooting

**Apps öffnen nicht** → Prüfe, ob die Dateinamen in `apps/` exakt `tiefbauporte.html`, `kalkuporte.html`, `gk-rechner.html` heißen.

**Icons fehlen auf dem Homescreen** → Safari cached Icons lange. Website → Teilen → "Zum Home-Bildschirm" neu ausführen.

**Service Worker lädt alte Version** → Dashboard → "Cache leeren & neu laden".

**Back-Button überlappt mit App-Header** → In Snippet-CSS `top` höher setzen (siehe BACK-BUTTON-SNIPPET.html).

---

Union E GmbH · Die HPM Mobilmacher · 2026
