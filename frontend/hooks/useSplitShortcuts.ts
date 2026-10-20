"use client";

import { useEffect } from "react";
import {
  enableSplit,
  disableSplit,
  isSplitEnabled,
  swapPanes,
} from "@/lib/split-view";

// ============================================================
// useSplitShortcuts — Raccourcis clavier pour le split view
// ============================================================
// Ctrl / Cmd + B          → ouvrir / fermer le split
// Alt + S                 → échanger les panneaux (swap)
//   (Alt+Shift a été changé en Alt+S car Alt+Shift change
//    la langue du clavier sous Windows et casse le raccourci)
// ============================================================

export function useSplitShortcuts() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: KeyboardEvent) => {
      // Ignore si l'utilisateur tape dans un input/textarea/contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Alt + S → swap
      if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && key === "s") {
        e.preventDefault();
        if (isSplitEnabled()) {
          swapPanes();
        }
        return;
      }

      // Ctrl / Cmd + B → toggle split
      if (key === "b") {
        const isMod = e.metaKey || e.ctrlKey;
        if (isMod && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          if (isSplitEnabled()) {
            disableSplit();
          } else {
            enableSplit();
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
