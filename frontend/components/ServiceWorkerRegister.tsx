"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Enregistre le Service Worker après le chargement
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "[PWA] Service Worker enregistré :",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("[PWA] Erreur SW :", error);
        });
    });
  }, []);

  return null;
}
