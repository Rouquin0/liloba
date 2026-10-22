"use client";

import { useEffect, useState } from "react";

/**
 * true quand la fenêtre est plus étroite que le breakpoint Tailwind `md` (768px).
 * Même seuil que `md:` dans tout le projet, donc "mobile" ici = "pas de Split View".
 * Vaut `false` au premier rendu (SSR / hydratation), puis se met à jour.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
