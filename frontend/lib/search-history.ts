"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Historique de recherche (Bible)
// ============================================================

const HISTORY_KEY = "liloba-search-history-v2";
const MAX_ENTRIES = 50;

export interface SearchHistoryEntry {
  id: string;
  query: string;
  type: "reference" | "keyword"; // "Jean 3:16" ou "amour"
  resultCount?: number;           // Nombre de résultats (si mot-clé)
  searchedAt: number;
}

// ---------- Lecture ----------

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.searchedAt - a.searchedAt);
  } catch {
    return [];
  }
}

// ---------- Écriture ----------

export function addSearchEntry(
  query: string,
  type: "reference" | "keyword",
  resultCount?: number
): void {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const history = getSearchHistory();

    // Retire les doublons (même query)
    const filtered = history.filter(
      (h) => h.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const newEntry: SearchHistoryEntry = {
      id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      query: trimmed,
      type,
      resultCount,
      searchedAt: Date.now(),
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function deleteSearchEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

// ---------- Formatage date ----------

export function formatSearchDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "à l'instant";
  if (diff < hour) return `il y a ${Math.floor(diff / minute)} min`;
  if (diff < day) return `il y a ${Math.floor(diff / hour)} h`;
  if (diff < 2 * day) return "hier";
  if (diff < 7 * day) return `il y a ${Math.floor(diff / day)} j`;

  const date = new Date(timestamp);
  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${date.getDate()} ${mois[date.getMonth()]}`;
}
