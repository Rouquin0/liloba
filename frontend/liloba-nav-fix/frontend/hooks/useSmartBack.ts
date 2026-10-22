"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/** Y a-t-il une page précédente DANS l'historique de cette fenêtre/PWA ? */
function canGoBack(): boolean {
  if (typeof window === "undefined") return false;
  // Navigation API (Chromium, et les navigateurs récents) : fiable.
  const nav = (window as unknown as { navigation?: { canGoBack?: boolean } })
    .navigation;
  if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack;
  // Repli : en PWA standalone, history.length vaut 1 au lancement.
  return window.history.length > 1;
}

/**
 * Retour "intelligent" pour les flèches de l'interface :
 *  - il y a un historique dans l'app  -> router.back() (page précédente)
 *  - sinon (page d'entrée de l'app)   -> router.replace(fallback), sans empiler
 */
export function useSmartBack(fallback = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
