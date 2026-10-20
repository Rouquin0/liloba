// ============================================================
// LILOBA — Service Worker v7
// ============================================================
// Pourquoi cette version :
//  - Le fichier public/sw.js contenait par erreur le composant React
//    ServiceWorkerRegister (code invalide pour un SW) : le navigateur
//    ne pouvait plus mettre à jour son ancien SW et gardait un vieux
//    cache bancal.
//  - Les requêtes RSC de Next.js (navigation client, prefetch) étaient
//    mises en cache puis resservies à la place du bon contenu :
//    clics sans effet, mauvais livre / chapitre.
//  - Les chunks JS/CSS de développement étaient servis "cache first".
//
// Principes :
//  1. On NE TOUCHE JAMAIS aux requêtes RSC / prefetch de Next.js.
//     Hors ligne, elles échouent, Next fait alors une vraie navigation,
//     que ce SW sait servir (étape 3).
//  2. Données Bible (/bible.json, /translations/*.json) : cache d'abord.
//  3. Pages (navigations) : réseau d'abord, copie gardée pour le hors ligne,
//     repli sur la page exacte, sinon le shell /bible ou /chat.
//  4. Assets statiques versionnés (/_next/static, icônes) : cache d'abord.
//  5. Tout le reste (API, etc.) : réseau normal, jamais mis en cache.
// ============================================================

// Mets true uniquement pour tester le hors ligne en local
// avec "next build && next start" sur localhost.
const ENABLE_ON_LOCALHOST = false;

const STATIC_CACHE = "liloba-static-v7";
const RUNTIME_CACHE = "liloba-runtime-v7";
// Inchangé volontairement : évite de retélécharger la Bible (45 Mo).
const BIBLE_CACHE = "liloba-bible-v4";
const KEEP_CACHES = [STATIC_CACHE, RUNTIME_CACHE, BIBLE_CACHE];

// Ajout de /histoires pour le pré-cache
const PRECACHE_URLS = ["/", "/chat", "/bible", "/histoires", "/selah", "/manifest.webmanifest"];

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
          const response = await fetch(url, { credentials: "same-origin" });
          if (response.ok && !response.redirected) {
            await cache.put(url, response);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

// ============================================================
// ACTIVATION : supprime les anciens caches (v3/v4/v5/v6...)
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
    path === "/logo.png" ||
    path === "/favicon.ico" ||
    path === "/manifest.webmanifest" ||
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

async function handleNavigation(request, url) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    // On ne garde que de vraies pages OK (pas de redirection, pas d'erreur)
    if (response.ok && !response.redirected && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    // ---- Hors ligne ----
    // 1. La page exacte déjà visitée
    const exact = await caches.match(request, { ignoreVary: true });
    if (exact) return exact;

    // 2. Shell parent selon la route
    const path = url.pathname;
    let shellUrl = "/";
    if (path.startsWith("/bible") || path.startsWith("/read")) shellUrl = "/bible";
    else if (path.startsWith("/chat")) shellUrl = "/chat";

    const shell = await caches.match(shellUrl, { ignoreVary: true });
    if (shell) return shell;

    // 3. Dernier recours : accueil
    const home = await caches.match("/", { ignoreVary: true });
    if (home) return home;

    return new Response("Hors ligne", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
