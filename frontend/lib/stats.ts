"use client";

// ============================================================
// LILOBA — Statistiques de lecture
// ============================================================

import { getHistory, type HistoryEntry } from "./history";

const STREAK_KEY = "liloba-streak";

export interface StreakData {
  current: number;      // Série actuelle
  longest: number;      // Plus longue série
  lastDate: string;     // Dernière date (YYYY-MM-DD)
  dates: string[];      // Dates de lecture (30 derniers jours)
}

// ---------- Utilitaires date ----------

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- Streak ----------

export function getStreak(): StreakData {
  if (typeof window === "undefined") {
    return { current: 0, longest: 0, lastDate: "", dates: [] };
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      return { current: 0, longest: 0, lastDate: "", dates: [] };
    }
    const data: StreakData = JSON.parse(raw);
    return {
      current: data.current ?? 0,
      longest: data.longest ?? 0,
      lastDate: data.lastDate ?? "",
      dates: Array.isArray(data.dates) ? data.dates : [],
    };
  } catch {
    return { current: 0, longest: 0, lastDate: "", dates: [] };
  }
}

/**
 * Enregistre une activité aujourd'hui.
 * Met à jour le streak si c'est le premier passage du jour.
 */
export function trackStreak(): void {
  if (typeof window === "undefined") return;
  try {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const streak = getStreak();

    // Si déjà tracké aujourd'hui → rien à faire
    if (streak.lastDate === today) return;

    let newCurrent = 1;

    // Si le dernier track était hier → on continue la série
    if (streak.lastDate === yesterday) {
      newCurrent = streak.current + 1;
    }

    // Ajoute la date du jour à la liste (max 30 jours)
    const newDates = [today, ...streak.dates.filter((d) => d !== today)].slice(0, 30);

    const updated: StreakData = {
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastDate: today,
      dates: newDates,
    };

    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// ---------- Stats globales ----------

export interface StatsData {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  topBooks: { bookName: string; count: number }[];
  last7Days: { date: string; count: number }[];
}

export function getStats(): StatsData {
  const history = getHistory();
  const now = Date.now();
  const today = getTodayKey();

  // Filtre par période
  const todayCount = history.filter((h) => {
    const d = new Date(h.markedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return key === today;
  }).length;

  const weekCount = history.filter(
    (h) => now - h.markedAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  const monthCount = history.filter(
    (h) => now - h.markedAt < 30 * 24 * 60 * 60 * 1000
  ).length;

  // Top livres
  const bookCounts = new Map<string, number>();
  for (const entry of history) {
    bookCounts.set(entry.livre, (bookCounts.get(entry.livre) ?? 0) + 1);
  }
  const topBooks = Array.from(bookCounts.entries())
    .map(([bookName, count]) => ({ bookName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 7 derniers jours
  const last7Days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = history.filter((h) => {
      const hd = new Date(h.markedAt);
      const hkey = `${hd.getFullYear()}-${String(hd.getMonth() + 1).padStart(2, "0")}-${String(hd.getDate()).padStart(2, "0")}`;
      return hkey === key;
    }).length;
    last7Days.push({ date: key, count });
  }

  return {
    todayCount,
    weekCount,
    monthCount,
    totalCount: history.length,
    topBooks,
    last7Days,
  };
}

// ---------- Helpers ----------

export function formatDayShort(dateKey: string): string {
  const [_, month, day] = dateKey.split("-");
  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${parseInt(day, 10)} ${mois[parseInt(month, 10) - 1]}`;
}

export function formatDayVeryShort(dateKey: string): string {
  const days = ["D", "L", "M", "M", "J", "V", "S"];
  const [_, month, day] = dateKey.split("-");
  const d = new Date(parseInt(_, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return days[d.getDay()];
}
