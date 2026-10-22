"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

function canGoBack(): boolean {
  if (typeof window === "undefined") return false;
  const nav = (window as unknown as { navigation?: { canGoBack?: boolean } }).navigation;
  if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack; // Navigation API
  return window.history.length > 1; // repli : vaut 1 au lancement d'une PWA standalone
}

/**
 * Retour pour les flèches de l'interface :
 *  - historique dans l'app -> router.back()
 *  - sinon (page d'entrée) -> router.replace(fallback), sans empiler
 */
export function useSmartBack(fallback = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
