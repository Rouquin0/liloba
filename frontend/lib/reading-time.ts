"use client";

// ============================================================
// LILOBA — Temps de lecture réel + Chapitres lus
// ------------------------------------------------------------
// - trackChapterRead() : enregistre 1x/jour/chapitre dans le
//   journal (type "chapter_read") + streak. Idempotent.
// - addReadingSeconds() : accumule le temps réel passé à lire.
// - Stockage local persistant (ne expire jamais, contrairement
//   à l'historique 24h des versets marqués).
// ============================================================

import { addJournalEntry, getJournal } from "./journal";
import { trackStreak } from "./stats";

const READING_TIME_KEY = "liloba-reading-time";
const MAX_DAYS_KEPT = 120;

export const DAILY_MINUTES_GOAL = 15;
export const DAILY_CHAPTERS_GOAL = 1;

interface ReadingTimeStore {
  totalSeconds: number;
  byDay: Record<string, number>; // "YYYY-MM-DD" -> secondes
}

// ---------- Dates (heure locale, pas UTC) ----------

export function getLocalDayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function getLocalDayKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return getLocalDayKey(d);
}

// ---------- Store ----------

function loadStore(): ReadingTimeStore {
  if (typeof window === "undefined") return { totalSeconds: 0, byDay: {} };
  try {
    const raw = localStorage.getItem(READING_TIME_KEY);
    if (!raw) return { totalSeconds: 0, byDay: {} };
    const parsed = JSON.parse(raw);
    return {
      totalSeconds: Number(parsed.totalSeconds) || 0,
      byDay:
        parsed.byDay && typeof parsed.byDay === "object" ? parsed.byDay : {},
    };
  } catch {
    return { totalSeconds: 0, byDay: {} };
  }
}

function saveStore(store: ReadingTimeStore): void {
  try {
    // Garde max 120 jours
    const keys = Object.keys(store.byDay).sort();
    if (keys.length > MAX_DAYS_KEPT) {
      const toDelete = keys.slice(0, keys.length - MAX_DAYS_KEPT);
      for (const k of toDelete) delete store.byDay[k];
    }
    localStorage.setItem(READING_TIME_KEY, JSON.stringify(store));
  } catch {
    // ignore (stockage plein / privé)
  }
}

function notify(): void {
  try {
    window.dispatchEvent(new Event("liloba:reading-time-updated"));
    window.dispatchEvent(new Event("liloba:journal-updated"));
  } catch {
    // ignore
  }
}

// ---------- Chapitre lu (idempotent par jour) ----------

/**
 * Enregistre la lecture d'un chapitre. N'enregistre qu'une seule fois
 * par chapitre et par jour (évite les doublons au rechargement / swipe).
 * Retourne true si c'est un nouvel enregistrement.
 */
export function trackChapterRead(
  livre: string,
  chapitre: number,
  slug?: string
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const label = `${livre} ${chapitre}`;
    const todayKey = getLocalDayKey();

    // Déduplication : même libellé déjà enregistré aujourd'hui ?
    const journal = getJournal();
    const already = journal.some((e) => {
      if (e.type !== "chapter_read" || e.label !== label) return false;
      return getLocalDayKey(new Date(e.createdAt)) === todayKey;
    });
    if (already) {
      // Streak quand même (au cas où)
      trackStreak();
      return false;
    }

    addJournalEntry("chapter_read", label, {
      detail: slug ? `${slug}/${chapitre}` : undefined,
      reference: label,
      href: slug ? `/bible/${slug}/${chapitre}` : undefined,
    });
    trackStreak();
    try {
      window.dispatchEvent(new Event("liloba:streak-updated"));
    } catch {
      // ignore
    }
    return true;
  } catch {
    return false;
  }
}

// ---------- Temps de lecture ----------

/** Ajoute des secondes de lecture au total + au jour courant. */
export function addReadingSeconds(seconds: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  // Garde-fou : un seul appel ne peut pas créditer plus de 5 min
  const capped = Math.min(seconds, 300);
  try {
    const store = loadStore();
    const today = getLocalDayKey();
    store.totalSeconds += capped;
    store.byDay[today] = (store.byDay[today] || 0) + capped;
    saveStore(store);
    notify();
  } catch {
    // ignore
  }
}

export interface ReadingTimeStats {
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  avg7Seconds: number;
  bestDay: { date: string; seconds: number } | null;
  activeDays7: number;
  activeDays30: number;
}

export function getReadingTimeStats(): ReadingTimeStats {
  const store = loadStore();
  const todayKey = getLocalDayKey();

  let weekSeconds = 0;
  let monthSeconds = 0;
  let activeDays7 = 0;
  let bestDay: { date: string; seconds: number } | null = null;

  for (let i = 0; i < 30; i++) {
    const key = getLocalDayKeyOffset(-i);
    const s = store.byDay[key] || 0;
    if (i < 7) {
      weekSeconds += s;
      if (s > 0) activeDays7++;
    }
    monthSeconds += s;
    if (!bestDay || s > bestDay.seconds) bestDay = { date: key, seconds: s };
  }

  // Si aucun jour actif, pas de "meilleur jour"
  if (bestDay && bestDay.seconds <= 0) bestDay = null;

  return {
    totalSeconds: store.totalSeconds,
    todaySeconds: store.byDay[todayKey] || 0,
    weekSeconds,
    monthSeconds,
    avg7Seconds: Math.round(weekSeconds / 7),
    bestDay,
    activeDays7,
    activeDays30: Object.keys(store.byDay).filter(
      (k) => (store.byDay[k] || 0) > 0
    ).length,
  };
}

/** Jours actifs (avec temps OU chapitre lu OU verset) pour la série 7 jours. */
export function getActiveDaysSet(extraDays: string[] = []): Set<string> {
  const set = new Set<string>(extraDays);
  try {
    const store = loadStore();
    for (const [k, v] of Object.entries(store.byDay)) {
      if (v > 0) set.add(k);
    }
    // Chapitres lus (journal persistant)
    for (const e of getJournal()) {
      if (e.type === "chapter_read" || e.type === "verse_marked") {
        set.add(getLocalDayKey(new Date(e.createdAt)));
      }
    }
  } catch {
    // ignore
  }
  return set;
}

// ---------- Formatage ----------

/** "0 min", "7 min", "1 h 05", "2 h 30"... */
export function formatMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) {
    if (seconds <= 0) return "0 min";
    if (seconds < 60) return `${Math.round(seconds)} s`;
    return "1 min";
  }
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** Version compacte pour les cartes : "0", "7", "1h05"... */
export function formatMinutesShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return seconds > 0 ? "<1" : "0";
  if (mins < 60) return String(mins);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function formatDayShortFr(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${parseInt(d, 10)} ${mois[parseInt(m, 10) - 1]}`;
}

// ---------- Niveau lecteur ----------

export function getReaderLevel(totalChapters: number): {
  name: string;
  next: string | null;
  progress: number; // 0..1 vers le niveau suivant
  remaining: number;
} {
  const levels = [
    { at: 0, name: "Graine" },
    { at: 1, name: "Pousse" },
    { at: 10, name: "Arbre" },
    { at: 50, name: "Forêt" },
    { at: 150, name: "Ancien" },
  ];
  let idx = 0;
  for (let i = 0; i < levels.length; i++) {
    if (totalChapters >= levels[i].at) idx = i;
  }
  const current = levels[idx];
  const nextLevel = levels[idx + 1] ?? null;
  if (!nextLevel) {
    return { name: current.name, next: null, progress: 1, remaining: 0 };
  }
  const span = nextLevel.at - current.at;
  const done = totalChapters - current.at;
  return {
    name: current.name,
    next: nextLevel.name,
    progress: Math.min(1, Math.max(0, done / span)),
    remaining: nextLevel.at - totalChapters,
  };
}
