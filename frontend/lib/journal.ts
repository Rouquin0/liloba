"use client";

// ============================================================
// LILOBA — Journal spirituel
// ============================================================

const JOURNAL_KEY = "liloba-journal";
const MAX_ENTRIES = 200;

export type JournalActionType =
  | "chapter_read"
  | "verse_marked"
  | "verse_highlighted"
  | "verse_favorited"
  | "note_added"
  | "prayer_favorited"
  | "prayer_session"
  | "search"
  | "private_note_added"
  | "verse_card_created";

export interface JournalEntry {
  id: string;
  type: JournalActionType;
  label: string;        // "Genèse 1"
  detail?: string;      // Texte du verset, mot-clé, etc.
  reference?: string;   // "Jean 3:16"
  href?: string;        // Lien vers la page
  createdAt: number;
}

// ---------- Lecture ----------

export function getJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function getJournalByDate(): Record<string, JournalEntry[]> {
  const entries = getJournal();
  const grouped: Record<string, JournalEntry[]> = {};

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  return grouped;
}

export function getJournalFilteredByType(
  type: JournalActionType | "all"
): JournalEntry[] {
  const entries = getJournal();
  if (type === "all") return entries;
  return entries.filter((e) => e.type === type);
}

// ---------- Écriture ----------

export function addJournalEntry(
  type: JournalActionType,
  label: string,
  options?: {
    detail?: string;
    reference?: string;
    href?: string;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const journal = getJournal();

    const entry: JournalEntry = {
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      label,
      detail: options?.detail,
      reference: options?.reference,
      href: options?.href,
      createdAt: Date.now(),
    };

    const updated = [entry, ...journal].slice(0, MAX_ENTRIES);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));

    // 📢 Notifie les composants
    window.dispatchEvent(new Event("liloba:journal-updated"));
  } catch {
    // ignore
  }
}

export function deleteJournalEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const journal = getJournal();
    const filtered = journal.filter((e) => e.id !== id);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("liloba:journal-updated"));
  } catch {
    // ignore
  }
}

export function clearJournal(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(JOURNAL_KEY);
    window.dispatchEvent(new Event("liloba:journal-updated"));
  } catch {
    // ignore
  }
}

export function countJournal(): number {
  return getJournal().length;
}

// ---------- Formatage ----------

export function formatJournalTime(timestamp: number): string {
  const date = new Date(timestamp);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatJournalDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return "Hier";

  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

// ---------- Métadonnées pour l'affichage ----------

export interface ActionMeta {
  label: string;
  icon: string;
  color?: string;
}

export const ACTION_META: Record<JournalActionType, ActionMeta> = {
  chapter_read: { label: "Lecture", icon: "book" },
  verse_marked: { label: "Verset marqué", icon: "bookmark" },
  verse_highlighted: { label: "Surlignage", icon: "highlight" },
  verse_favorited: { label: "Favori", icon: "star" },
  note_added: { label: "Note ajoutée", icon: "note" },
  prayer_favorited: { label: "Prière favorite", icon: "shield" },
  prayer_session: { label: "Prière", icon: "shield" },
  search: { label: "Recherche", icon: "search" },
  private_note_added: { label: "Note privée", icon: "lock" },
  verse_card_created: { label: "Partage", icon: "image" },
};

// ---------- Détection de date ----------

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
