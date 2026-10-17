"use client";

import { useEffect } from "react";
import { getAccentColor, getColorHex } from "@/lib/preferences";

export function useCustomColors() {
  useEffect(() => {
    applyAccentColor(getAccentColor());
  }, []);
}

/**
 * Applique la couleur d'accent PARTOUT.
 * Override --color-accent qui est utilisée partout dans l'app.
 */
export function applyAccentColor(value: string) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const hex = getColorHex(value);

  // ⚡ LA SEULE LIGNE QUI CHANGE TOUT
  root.style.setProperty("--color-accent", hex);
}
