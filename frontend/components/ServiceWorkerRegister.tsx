"use client";

import { useEffect } from "react";

// Enregistre et met à jour le Service Worker.
// v9 : pré-chauffe aussi /carnet, /historique, /histoires (+ 3 histoires)
// pour garantir le hors ligne dès la 1re visite (données 100% locales).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // En développement (npm run dev) : aucun service worker.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    let cancelled = false;
    let onFocus: (() => void) | null = null;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });

        onFocus = () => {
          registration.update().catch(() => {});
        };
        window.addEventListener("focus", onFocus);

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        let reloaded = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded || cancelled) return;
          reloaded = true;
          window.location.reload();
        });

        // Pré-chauffe les pages offline : Bible + Carnet + Historique + Histoires.
        // Fire-and-forget, ne bloque jamais le rendu. Uniquement si en ligne.
        if (navigator.onLine) {
          const warm = [
            "/bible",
            "/carnet",
            "/historique",
            "/histoires",
            "/histoires/david-goliath",
            "/histoires/fils-perdu",
            "/histoires/joseph-pardon",
          ];
          Promise.allSettled(
            warm.map((u) => fetch(u, { credentials: "same-origin" }).catch(() => {}))
          ).catch(() => {});
        }
      } catch (error) {
        console.error("[PWA] Erreur SW :", error);
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      cancelled = true;
      if (onFocus) window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
