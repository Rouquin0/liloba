// ============================================================
// LILOBA — Service Worker v2
// ============================================================
// Cache :
// - Assets statiques (CSS, JS, images)
// - Pages HTML
// - Données Bible (bible.json + API)
// ============================================================

const CACHE_NAME = "liloba-static-v3";
const BIBLE_CACHE = "liloba-bible-v3";
const RUNTIME_CACHE = "liloba-runtime-v3";

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
  // STRATÉGIE 3 : Pages HTML → Network First avec cache
  // ========================================================
  if (request.headers.get("accept")?.includes("text/html")) {
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
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.headers.get("accept")?.includes("text/html")) {
      const offlineCache = await caches.open(CACHE_NAME);
      const offlinePage = await offlineCache.match("/");
      if (offlinePage) return offlinePage;
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
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);

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

    // Fallback : page d'accueil
    const offlineCache = await caches.open(CACHE_NAME);
    const offlinePage = await offlineCache.match("/");
    if (offlinePage) return offlinePage;

    return new Response("Offline", { status: 503 });
  }
}
