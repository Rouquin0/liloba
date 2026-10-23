// ============================================================
// LILOBA — Service Worker v8 (correctif écran blanc iOS)
// ============================================================
// Changements vs v7 (AUCUNE rupture, que des ajouts sûrs) :
//  - STATIC/RUNTIME passent en v8 (ancien v7 purgé à l'activation).
//  - BIBLE_CACHE RESTE en "liloba-bible-v4" : on ne retélécharge
//    JAMAIS la Bible (45 Mo). Ne pas renommer ce cache.
//  - "/offline.html" est pré-caché et servi en dernier recours
//    pour les navigations quand réseau + cache sont vides.
//    Avant : simple texte "Hors ligne". Après : belle page sombre.
//  - Navigations : Cache-First instantané (anti écran blanc iOS)
//    + revalidation réseau en arrière-plan (Stale-While-Revalidate).
//    iOS purge le cache après ~24h d'inactivité : au retour, si un
//    shell est encore là on l'affiche en <50ms, sinon on tente le
//    réseau, sinon offline.html. Plus jamais d'écran blanc.
//  - Le reste est INCHANGÉ : bypass RSC/prefetch Next.js, bypass
//    /api/ask, /_next/webpack-hmr, cache-first Bible + statiques.
//
// Fichiers à déployer avec ce SW :
//  - public/offline.html (page de secours, fond #0a0a0f)
//  - public/splash/*.png (splash screens iOS, fond #0a0a0f)
// ============================================================

// Mets true uniquement pour tester le hors ligne en local
// avec "next build && next start" sur localhost.
const ENABLE_ON_LOCALHOST = false;

const STATIC_CACHE = "liloba-static-v8";
const RUNTIME_CACHE = "liloba-runtime-v8";
// ⚠️ NE PAS RENOMMER : évite de retélécharger la Bible (45 Mo).
const BIBLE_CACHE = "liloba-bible-v4";
const KEEP_CACHES = [STATIC_CACHE, RUNTIME_CACHE, BIBLE_CACHE];

const OFFLINE_URL = "/offline.html";

// Ajout de /histoires pour le pré-cache (+ offline.html = filet de sécurité)
const PRECACHE_URLS = ["/", "/chat", "/bible", "/histoires", "/selah", "/manifest.webmanifest", OFFLINE_URL];

const IS_LOCAL = ["localhost", "127.0.0.1", "[::1]"].includes(
  self.location.hostname
);

// ============================================================
// INSTALLATION
// ============================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // allSettled : une page qui échoue n'empêche plus l'installation
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok && !response.redirected) {
              await cache.put(url, response);
            }
          } catch {
            // hors ligne à l'install : on installera quand même le SW
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

// ============================================================
// ACTIVATION : supprime les anciens caches (v3/v4/v5/v6/v7...)
// ============================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !KEEP_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Le composant ServiceWorkerRegister envoie ce message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ============================================================
// FETCH
// ============================================================

function isRscRequest(request, url) {
  const accept = request.headers.get("accept") || "";
  return (
    request.headers.has("rsc") ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree") ||
    url.searchParams.has("_rsc") ||
    accept.includes("text/x-component")
  );
}

function isBibleData(path) {
  return (
    path.startsWith("/api/bible/") ||
    path === "/bible.json" ||
    (path.startsWith("/translations/") && path.endsWith(".json"))
  );
}

function isStaticAsset(path) {
  return (
    path.startsWith("/_next/static/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/splash/") ||
    path === "/logo.png" ||
    path === "/favicon.ico" ||
    path === "/manifest.webmanifest" ||
    path === OFFLINE_URL ||
    /\.(?:woff2?|ttf|otf)$/.test(path)
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API distante, polices, etc.
  if (IS_LOCAL && !ENABLE_ON_LOCALHOST) return; // dev : on ne touche à rien

  const path = url.pathname;

  // Outils internes de Next.js et API IA : jamais interceptés
  if (path.startsWith("/_next/webpack-hmr") || path.startsWith("/__nextjs")) return;
  if (path.startsWith("/api/ask")) return;

  // RSC / prefetch : jamais interceptés (cause des blocages et des
  // chapitres "au hasard" quand ils étaient mis en cache)
  if (isRscRequest(request, url)) return;

  if (isBibleData(path)) {
    event.respondWith(cacheFirstBible(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));
    return;
  }

  if (isStaticAsset(path)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }
  // Tout le reste : comportement réseau normal
});

// ============================================================
// STRATÉGIES
// ============================================================

async function cacheFirstBible(request) {
  const cache = await caches.open(BIBLE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // 200 uniquement : cache.put échoue sur les réponses 206 partielles
    if (response.status === 200) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response(
      JSON.stringify({
        error: "offline",
        message: "Cette page n'est pas encore disponible hors ligne.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.status === 200 && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    // Vraie erreur réseau (et non un faux "Offline" texte lu comme du JS)
    return Response.error();
  }
}

// Revalidation en arrière-plan : met à jour le cache sans bloquer l'affichage.
// Fire-and-forget, n'interrompt jamais la page déjà servie.
function revalidateInBackground(request, cacheName) {
  fetch(request)
    .then((response) => {
      if (response.ok && !response.redirected && response.type === "basic") {
        caches.open(cacheName).then((cache) => cache.put(request, response).catch(() => {}));
      }
    })
    .catch(() => {});
}

async function offlineFallback() {
  // 1. Page offline dédiée (fond sombre #0a0a0f, jamais d'écran blanc)
  const offline =
    (await caches.match(OFFLINE_URL, { ignoreVary: true })) ||
    (await caches.match(OFFLINE_URL));
  if (offline) return offline;
  // 2. Dernier recours si même offline.html a été purgé par iOS
  return new Response(
    "<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>LILOBA — Hors ligne</title></head><body style='background:#0a0a0f;color:#F0E5D0;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center'><main><h1 style='color:#D4AF37;letter-spacing:4px'>LILOBA</h1><p>Tu es hors ligne. Reconnecte-toi puis réessaie.</p><button onclick='location.reload()' style='background:#B91C1C;color:#fff;border:none;border-radius:10px;padding:12px 24px;font-size:16px'>Réessayer</button></main></body></html>",
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

async function handleNavigation(request, url) {
  // --- CORRECTIF iOS : Cache-First instantané ---
  // Avant (v7) : réseau d'abord → écran blanc si réseau lent / SW purgé.
  // Après (v8) : cache d'abord (affichage <50ms), réseau en arrière-plan.
  const cached =
    (await caches.match(request, { ignoreVary: true })) ||
    (await caches.match(request));
  if (cached) {
    revalidateInBackground(request, RUNTIME_CACHE);
    return cached;
  }

  // Pas de copie exacte : on tente le réseau (cas retour après purge iOS)
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected && response.type === "basic") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    // ---- Hors ligne / réseau lent / cache vidé par iOS ----
    const path = url.pathname;
    let shellUrl = "/";
    if (path.startsWith("/bible") || path.startsWith("/read")) shellUrl = "/bible";
    else if (path.startsWith("/chat")) shellUrl = "/chat";
    else if (path.startsWith("/histoires")) shellUrl = "/histoires";
    else if (path.startsWith("/selah")) shellUrl = "/selah";

    const shell =
      (await caches.match(shellUrl, { ignoreVary: true })) ||
      (await caches.match(shellUrl)) ||
      (await caches.match("/", { ignoreVary: true })) ||
      (await caches.match("/"));
    if (shell) return shell;

    // 3. Page de secours stylée (plus jamais d'écran blanc)
    return offlineFallback();
  }
}
