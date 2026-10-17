"use client";

import { useEffect } from "react";
import { getReminderEnabled, getReminderTime } from "@/lib/preferences";

// ============================================================
// LILOBA — Hook : rappel de lecture
// ============================================================
// Envoie une notification à l'heure choisie (si app ouverte)
// Ne se déclenche qu'une fois par jour
// ============================================================

const LAST_REMINDED_KEY = "liloba-last-reminder-date";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function wasRemindedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LAST_REMINDED_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

function markRemindedToday(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_REMINDED_KEY, getTodayKey());
  } catch {
    // ignore
  }
}

function isTimeReached(timeStr: string): boolean {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return now >= target;
}

export function useReadingReminder() {
  useEffect(() => {
    const runCheck = async () => {
      const enabled = getReminderEnabled();
      if (!enabled) return;

      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      if (!isTimeReached(getReminderTime())) return;
      if (wasRemindedToday()) return;

      try {
        new Notification("📖 LILOBA — Rappel de lecture", {
          body: "N'oublie pas ton rendez-vous avec la Parole aujourd'hui.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: "liloba-reading-reminder",
        });
        markRemindedToday();
      } catch {
        // ignore
      }
    };

    // Vérif immédiate (après 5 sec pour ne pas bloquer)
    const initial = setTimeout(runCheck, 5000);
    // Re-vérif toutes les 10 min
    const interval = setInterval(runCheck, 10 * 60 * 1000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);
}
