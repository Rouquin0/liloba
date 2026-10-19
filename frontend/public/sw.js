// ============================================================
// LILOBA — Service Worker v3 (fix retour accueil hors-ligne)
// ============================================================
// Cache :
// - Assets statiques (CSS, JS, images)
// - Pages HTML
// - Données Bible (bible.json + API)
//
// FIX BUG : avant, quand on ouvrait un chapitre hors-ligne
// (/bible/genese/1) sans réseau et que la page HTML n'était pas
// encore en cache, le SW renvoyait "/" (accueil).
// L'utilisateur avait l'impression d'être "ramené à l'accueil"
// alors que la Bible (45 Mo) était bien dans IndexedDB.
// Maintenant on renvoie la page /bible en fallback pour les
// routes /bible/* et /read/*, ce qui laisse BibleReader charger
// le chapitre depuis IndexedDB côté client.
// ============================================================

const CACHE_NAME = "liloba-static-v4";
const BIBLE_CACHE = "liloba-bible-v4";
const RUNTIME_CACHE = "liloba-runtime-v4";

// Assets pré-cachés au démarrage
const PRECACHE_ASSETS = [
  "/",
  "/chat",
  "/bible",
  "/manifest.webmanifest",
];

// ============================================================
// INSTALLATION
// ============================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATION
// ============================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== BIBLE_CACHE &&
                name !== RUNTIME_CACHE
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les méthodes non-GET
  if (request.method !== "GET") return;

  // Ignore les protocoles non-http(s)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

    // ========================================================
  // STRATÉGIE 1 : Bible locale → Cache First (hors-ligne)
  // /bible.json + /translations/*.json + /api/bible/*
  // ========================================================
  if (
    url.pathname.startsWith("/api/bible/") ||
    url.pathname === "/bible.json" ||
    (url.pathname.startsWith("/translations/") && url.pathname.endsWith(".json"))
  ) {
    event.respondWith(cacheFirstBible(request));
    return;
  }

  // ========================================================
  // STRATÉGIE 2 : API IA → Network only (pas de cache)
  // ========================================================
  if (url.pathname.startsWith("/api/ask")) {
    event.respondWith(fetch(request));
    return;
  }

  // ========================================================
  // STRATÉGIE 3 : Pages HTML / navigations App Router (RSC) →
  // Network First avec cache. SANS ÇA, une navigation client
  // /bible → /bible/genese/1 hors-ligne échoue (RSC en 503),
  // Next fait un hard reload, le SW renvoie "/" → "retour accueil".
  // ========================================================
  const accept = request.headers.get("accept") || "";
  const isRsc =
    request.headers.has("rsc") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("next-url") ||
    accept.includes("text/x-component");
  const isHtml =
    accept.includes("text/html") ||
    request.mode === "navigate" ||
    isRsc;
  if (isHtml) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // ========================================================
  // STRATÉGIE 4 : Assets → Cache First
  // ========================================================
  event.respondWith(cacheFirst(request));
});

// ============================================================
// STRATÉGIES
// ============================================================

/**
 * Cache First pour la Bible (offline prioritaire).
 * Si le cache est vide, on essaie le réseau.
 */
async function cacheFirstBible(request) {
  const cache = await caches.open(BIBLE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback offline pour la Bible
    return new Response(
      JSON.stringify({
        error: "offline",
        message: "Cette page n'est pas encore disponible hors ligne.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Network First (pages HTML).
 * Fallback intelligent : on renvoie la page parente mise en cache
 * (/bible pour /bible/*, /chat pour /chat/*) au lieu de toujours "/",
 * pour ne jamais "ramener à l'accueil" quand la Bible est en IndexedDB.
 */
async function offlineFallbackFor(url) {
  const offlineCache = await caches.open(CACHE_NAME);
  const runtimeCache = await caches.open(RUNTIME_CACHE);
  const pathname = url.pathname;

  // 1. La page exacte déjà visitée ?
  const exact = await runtimeCache.match(url.pathname + url.search);
  if (exact) return exact;

  // 2. Routes Bible → fallback vers /bible (le shell sait lire IndexedDB)
  if (pathname.startsWith("/bible") || pathname.startsWith("/read")) {
    const bibleShell =
      (await runtimeCache.match("/bible")) ||
      (await offlineCache.match("/bible"));
    if (bibleShell) return bibleShell;
  }

  // 3. Chat → fallback vers /chat
  if (pathname.startsWith("/chat")) {
    const chatShell =
      (await runtimeCache.match("/chat")) ||
      (await offlineCache.match("/chat"));
    if (chatShell) return chatShell;
  }

  // 4. Dernier recours : accueil
  const home = await offlineCache.match("/");
  if (home) return home;
  return null;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const url = new URL(request.url);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (
      request.headers.get("accept")?.includes("text/html") ||
      request.mode === "navigate"
    ) {
      const fallback = await offlineFallbackFor(url);
      if (fallback) return fallback;
    }

    return new Response("Offline", { status: 503 });
  }
}

/**
 * Cache First (assets statiques).
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network First avec cache systématique des pages HTML.
 * Cache TOUTES les pages visitées pour offline.
 * En cas d'échec réseau + page jamais visitée, on renvoie le shell
 * parent (/bible) plutôt que l'accueil, pour laisser IndexedDB afficher
 * le chapitre demandé.
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const url = new URL(request.url);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback : cherche dans le cache
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback intelligent (ne plus renvoyer "/" pour /bible/*)
    const fallback = await offlineFallbackFor(url);
    if (fallback) return fallback;

    return new Response("Offline", { status: 503 });
  }
}
