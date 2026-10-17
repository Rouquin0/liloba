"use client";

// ============================================================
// LILOBA — Notes & Favoris
// ============================================================

// ---------- Types ----------

export interface Note {
  reference: string;      // "Jean 3:16"
  texte: string;          // Contenu de la note
  createdAt: number;
  updatedAt: number;
}

export interface Favorite {
  reference: string;      // "Jean 3:16"
  addedAt: number;
}

// ---------- Clés de stockage ----------

const NOTES_KEY = "liloba-notes";
const FAVORITES_KEY = "liloba-favorites";

// ============================================================
// NOTES
// ============================================================

export function getAllNotes(): Record<string, Note> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function getNote(reference: string): Note | null {
  const all = getAllNotes();
  return all[reference] || null;
}

export function hasNote(reference: string): boolean {
  return getNote(reference) !== null;
}

export function saveNote(reference: string, texte: string): void {
  if (typeof window === "undefined") return;
  const trimmed = texte.trim();
  if (!trimmed) return;

  try {
    const all = getAllNotes();
    const existing = all[reference];
    all[reference] = {
      reference,
      texte: trimmed,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function deleteNote(reference: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllNotes();
    delete all[reference];
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getNotesList(): Note[] {
  const all = getAllNotes();
  return Object.values(all).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
}

export function countNotes(): number {
  return Object.keys(getAllNotes()).length;
}

// ============================================================
// FAVORIS
// ============================================================

export function getAllFavorites(): Record<string, Favorite> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function isFavorite(reference: string): boolean {
  const all = getAllFavorites();
  return !!all[reference];
}

export function toggleFavorite(reference: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const all = getAllFavorites();
    if (all[reference]) {
      delete all[reference];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
      return false;
    } else {
      all[reference] = { reference, addedAt: Date.now() };
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
      return true;
    }
  } catch {
    return false;
  }
}

export function removeFavorite(reference: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllFavorites();
    delete all[reference];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getFavoritesList(): Favorite[] {
  const all = getAllFavorites();
  return Object.values(all).sort(
    (a, b) => b.addedAt - a.addedAt
  );
}

export function countFavorites(): number {
  return Object.keys(getAllFavorites()).length;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Extrait le nom du livre depuis une référence.
 * Exemple : "Jean 3:16" → "Jean"
 *          "1 Corinthiens 13:4" → "1 Corinthiens"
 */
export function extractBookFromReference(reference: string): string {
  const match = reference.match(/^(.+?)\s+\d+:\d+$/);
  return match ? match[1].trim() : reference;
}

/**
 * Extrait le chapitre depuis une référence.
 * Exemple : "Jean 3:16" → 3
 */
export function extractChapterFromReference(reference: string): number {
  const match = reference.match(/\s(\d+):\d+$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Convertit une référence en URL.
 * Exemple : "Jean 3:16" → "/bible/jean/3#v16"
 */
export function referenceToUrl(reference: string): string | null {
  try {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const livre = match[1].trim();
    const chapitre = match[2];
    const verset = match[3];

    const slug = livre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `/bible/${slug}/${chapitre}#v${verset}`;
  } catch {
    return null;
  }
}

/**
 * Formate une date relative (il y a X min, hier, etc.)
 */
export function formatNoteDate(timestamp: number): string {
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

/**
 * Liste des livres qui ont au moins une note ou un favori.
 */
export function getBooksWithContent(): string[] {
  const books = new Set<string>();

  for (const note of getNotesList()) {
    books.add(extractBookFromReference(note.reference));
  }
  for (const fav of getFavoritesList()) {
    books.add(extractBookFromReference(fav.reference));
  }

  return Array.from(books).sort();
}
