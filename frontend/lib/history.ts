"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Historique des versets marqués
// ============================================================
// L'historique enregistre UNIQUEMENT les versets que
// l'utilisateur a explicitement marqués (double-clic PC /
// appui long mobile). Expire après 24h.
// ============================================================

const HISTORY_KEY = "liloba-verse-history";
const MAX_ENTRIES = 100;
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 heures

// ---------- Types ----------

export interface HistoryEntry {
  reference: string;       // "Jean 3:16"
  livre: string;           // "Jean"
  chapitre: number;        // 3
  verset: number;          // 16
  texte: string;           // Texte du verset
  slug: string;            // "jean"
  markedAt: number;        // Timestamp
}

// ---------- Lecture ----------

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // 🧹 Filtre les entrées expirées (> 24h)
    const now = Date.now();
    const valid = parsed.filter(
      (entry: HistoryEntry) => now - entry.markedAt < EXPIRATION_MS
    );

    // Si des entrées ont expiré, on met à jour le localStorage
    if (valid.length !== parsed.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(valid));
    }

    return valid;
  } catch {
    return [];
  }
}

export function getLastMarked(): HistoryEntry | null {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
}

// ---------- Écriture ----------

export function addToHistory(entry: Omit<HistoryEntry, "markedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();

    // Retire l'ancienne entrée du même verset (pour éviter les doublons)
    const filtered = history.filter(
      (h) => h.reference !== entry.reference
    );

    const newEntry: HistoryEntry = {
      ...entry,
      markedAt: Date.now(),
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // 📢 Notifie le menu
    window.dispatchEvent(new Event("liloba:history-updated"));
  } catch {
    // ignore
  }
}

export function deleteHistoryEntry(reference: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.reference !== reference);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("liloba:history-updated"));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event("liloba:history-updated"));
  } catch {
    // ignore
  }
}

export function cleanupExpiredHistory(): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const valid = parsed.filter(
      (entry: HistoryEntry) => now - entry.markedAt < EXPIRATION_MS
    );

    if (valid.length !== parsed.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(valid));
    }
  } catch {
    // ignore
  }
}

// ---------- Helper date ----------

export function formatHistoryDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "à l'instant";
  if (diff < hour) return `il y a ${Math.floor(diff / minute)} min`;
  if (diff < day) return `il y a ${Math.floor(diff / hour)} h`;

  const date = new Date(timestamp);
  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${date.getDate()} ${mois[date.getMonth()]}`;
}

// ---------- Nombre d'entrées ----------

export function countHistory(): number {
  return getHistory().length;
}
