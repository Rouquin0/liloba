"use client";

// ============================================================
// LILOBA — Favoris de prières
// ============================================================

const FAV_KEY = "liloba-prayer-favorites";

export interface PrayerFavorite {
  prayerId: string;
  addedAt: number;
}

// ---------- Lecture brute ----------

interface StoredFav {
  prayerId: string;
  addedAt: number;
}

function readStore(): StoredFav[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migration : ancien format = tableau de strings
    // Nouveau format = tableau d'objets { prayerId, addedAt }
    return parsed.map((item) => {
      if (typeof item === "string") {
        return { prayerId: item, addedAt: Date.now() };
      }
      return {
        prayerId: item.prayerId,
        addedAt: item.addedAt ?? Date.now(),
      };
    });
  } catch {
    return [];
  }
}

function writeStore(items: StoredFav[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ---------- API publique ----------

export function getFavorites(): string[] {
  return readStore().map((f) => f.prayerId);
}

export function getFavoritesList(): PrayerFavorite[] {
  return readStore()
    .map((f) => ({ prayerId: f.prayerId, addedAt: f.addedAt }))
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function isFavorite(prayerId: string): boolean {
  return readStore().some((f) => f.prayerId === prayerId);
}

export function toggleFavorite(prayerId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const items = readStore();
    const has = items.some((f) => f.prayerId === prayerId);

    const updated = has
      ? items.filter((f) => f.prayerId !== prayerId)
      : [{ prayerId, addedAt: Date.now() }, ...items];

    writeStore(updated);
    return !has;
  } catch {
    return false;
  }
}

export function removeFavorite(prayerId: string): void {
  if (typeof window === "undefined") return;
  try {
    const items = readStore().filter((f) => f.prayerId !== prayerId);
    writeStore(items);
  } catch {
    // ignore
  }
}

export function clearFavorites(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FAV_KEY);
  } catch {
    // ignore
  }
}

export function countFavorites(): number {
  return readStore().length;
}

// ---------- Helper date ----------

export function formatFavDate(timestamp: number): string {
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
