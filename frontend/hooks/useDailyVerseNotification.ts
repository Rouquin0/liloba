"use client";

import { useEffect } from "react";
import {
  getDailyVerseEnabled,
  getDailyVerseTime,
} from "@/lib/preferences";
import { checkAndNotifyDailyVerse } from "@/lib/notifications";

// ============================================================
// LILOBA — Hook : vérifie et envoie la notif du verset du jour
// ============================================================
// À appeler UNE FOIS au démarrage de l'app (dans AppShell).
// Vérifie toutes les 5 minutes si l'heure est atteinte.
// ============================================================

export function useDailyVerseNotification() {
  useEffect(() => {
    // 1. Vérif immédiate au démarrage
    const runCheck = async () => {
      const enabled = getDailyVerseEnabled();
      if (!enabled) return;

      const time = getDailyVerseTime();
      await checkAndNotifyDailyVerse({ enabled, time });
    };

    // Petit délai pour ne pas bloquer le premier rendu
    const initial = setTimeout(runCheck, 3000);

    // 2. Re-vérif toutes les 5 min (au cas où l'app reste ouverte)
    const interval = setInterval(runCheck, 5 * 60 * 1000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);
}
