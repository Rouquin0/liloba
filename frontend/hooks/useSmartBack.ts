"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/** Écran large (Split View / desktop) : même seuil que `md:` de Tailwind. */
function isDesktopViewport(): boolean {
  return window.matchMedia("(min-width: 768px)").matches;
}

/** Y a-t-il une page précédente à laquelle revenir ? */
function canGoBack(): boolean {
  if (typeof window === "undefined") return false;

  // DESKTOP : comportement d'origine de router.back(). On se fie uniquement à
  // history.length (fiable dans un onglet / une fenêtre PWA desktop) : si le
  // navigateur a une page précédente, on y retourne, point.
  if (isDesktopViewport()) return window.history.length > 1;

  // MOBILE (PWA standalone) : Navigation API quand elle existe, sinon repli.
  const nav = (window as unknown as { navigation?: { canGoBack?: boolean } })
    .navigation;
  if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack;
  return window.history.length > 1;
}

/**
 * Retour pour les flèches de l'interface :
 *  - page précédente disponible -> router.back()
 *  - sinon (page d'entrée)       -> router.replace(fallback), sans empiler
 */
export function useSmartBack(fallback = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
