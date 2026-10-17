"use client";

// ============================================================
// LILOBA — Notifications locales (Niveau 1)
// ============================================================
// ⚠️ La notif "verset du jour" se déclenche UNIQUEMENT quand
// l'utilisateur ouvre l'app, si :
//   - La fonctionnalité est activée
//   - L'heure choisie est passée aujourd'hui
//   - Aucune notif n'a encore été envoyée aujourd'hui
// ============================================================

import { getOfflineBible } from "./offline-bible";
import { fetchChapitre } from "./api";

const LAST_NOTIFIED_KEY = "liloba-last-notified-date";

// ---------- Helpers date ----------

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function wasNotifiedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

export function markNotifiedToday(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, getTodayKey());
  } catch {
    // ignore
  }
}

// ---------- Vérifier si l'heure est passée ----------

export function isTimeReached(timeStr: string): boolean {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return now >= target;
}

// ---------- Verset aléatoire ----------

interface RandomVerse {
  reference: string;
  text: string;
}

// Quelques livres populaires pour piocher un verset sympa
const POPULAR_BOOKS = [
  "Psaumes",
  "Proverbes",
  "Jean",
  "Matthieu",
  "Romains",
  "Philippiens",
  "Ésaïe",
  "1 Corinthiens",
  "Jacques",
  "1 Jean",
];

export async function getRandomVerse(): Promise<RandomVerse | null> {
  try {
    const book = POPULAR_BOOKS[Math.floor(Math.random() * POPULAR_BOOKS.length)];

    // Essaie offline d'abord
    const offline = await getOfflineBible();
    let chapitreData: Record<string, string> | null = null;
    let chapitreNum = 1;

    if (offline && offline[book]) {
      const chapters = Object.keys(offline[book]);
      chapitreNum = parseInt(chapters[Math.floor(Math.random() * chapters.length)], 10);
      chapitreData = offline[book][String(chapitreNum)];
    } else {
      // Sinon, essaie l'API
      const chapters = [1, 3, 8, 15, 23, 46, 100]; // sous-ensemble de chapitres communs
      chapitreNum = chapters[Math.floor(Math.random() * chapters.length)];
      try {
        const data = await fetchChapitre(book, chapitreNum);
        chapitreData = data.versets;
      } catch {
        return null;
      }
    }

    if (!chapitreData) return null;

    const versets = Object.entries(chapitreData);
    if (versets.length === 0) return null;

    const [numero, texte] = versets[Math.floor(Math.random() * versets.length)];
    const cleanText = texte.replace(/<CM>/g, "").trim();

    return {
      reference: `${book} ${chapitreNum}:${numero}`,
      text: cleanText.length > 120 ? cleanText.slice(0, 117) + "..." : cleanText,
    };
  } catch {
    return null;
  }
}

// ---------- Notification principale ----------

export interface NotifyOptions {
  enabled: boolean;
  time: string;
  title?: string;
  icon?: string;
}

export async function checkAndNotifyDailyVerse(
  options: NotifyOptions
): Promise<{ sent: boolean; reason?: string }> {
  if (typeof window === "undefined") return { sent: false, reason: "ssr" };

  // 1. Vérifs de base
  if (!options.enabled) return { sent: false, reason: "disabled" };
  if (typeof Notification === "undefined") return { sent: false, reason: "no-api" };
  if (Notification.permission !== "granted") return { sent: false, reason: "no-permission" };
  if (!isTimeReached(options.time)) return { sent: false, reason: "too-early" };
  if (wasNotifiedToday()) return { sent: false, reason: "already-notified" };

  // 2. Récupère un verset
  const verse = await getRandomVerse();
  if (!verse) return { sent: false, reason: "no-verse" };

  // 3. Affiche la notif
  try {
    const notif = new Notification(options.title ?? "📖 Verset du jour", {
      body: `${verse.reference} — ${verse.text}`,
      icon: options.icon ?? "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "liloba-daily-verse",
    });

    notif.onclick = () => {
      window.focus();
      window.location.href = `/bible/${verse.reference.split(" ")[0].toLowerCase()}`;
      notif.close();
    };

    markNotifiedToday();
    return { sent: true };
  } catch {
    return { sent: false, reason: "send-failed" };
  }
}

// ---------- Test manuel ----------

export async function sendTestNotification(): Promise<boolean> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return false;
  }
  const verse = await getRandomVerse();
  const body = verse
    ? `${verse.reference} — ${verse.text}`
    : "Ceci est une notification de test 🎉";

  new Notification("📖 LILOBA", {
    body,
    icon: "/icons/icon-192.png",
    tag: "liloba-test",
  });
  return true;
}
