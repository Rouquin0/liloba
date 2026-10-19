"use client";

import { useEffect } from "react";

// Enregistre et met à jour le Service Worker.
// Avant, l'enregistrement se faisait uniquement sur window "load" 
// sans gestion des mises à jour, ce qui faisait que les téléphones 
// gardaient l'ancien SW (v3/v4) buggé même après un redéploiement.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          // Force la vérification de mise à jour à chaque chargement
          updateViaCache: "none",
        });

        // Vérifie les mises à jour à chaque focus (retour dans la PWA)
        const checkUpdate = () => {
          registration.update().catch(() => {});
        };
        window.addEventListener("focus", checkUpdate);

        // Quand un nouveau SW (v5) est prêt, on le promeut immédiatement
        // au lieu de laisser l'ancien servir des shells cassés.
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

        // Recharge une seule fois quand le nouveau SW prend le contrôle,
        // pour que les nouvelles stratégies (JS chunks, RSC séparé)
        // s'appliquent sans réinstallation manuelle de la PWA.
        let reloaded = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded || cancelled) return;
          reloaded = true;
          window.location.reload();
        });

        // Pré-chauffe le cache documents : garantit que /bible (fallback
        // offline) + ses chunks sont disponibles avant le mode avion.
        // Ne bloque jamais le rendu (fire-and-forget).
        fetch("/bible", { credentials: "same-origin" }).catch(() => {});
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
      window.removeEventListener("focus", () => {});
    };
  }, []);

  return null;
}
