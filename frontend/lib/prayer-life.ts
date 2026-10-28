"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Vie de prière (compagnon du carnet)
// ------------------------------------------------------------
// Stockage 100 % local. N'altère AUCUNE phrase de prière
// existante : seules des données d'usage sont ajoutées.
// ============================================================

const INTENTIONS_KEY = "liloba-prayer-intentions";
const AMEN_KEY = "liloba-prayer-amen";
const STREAK_KEY = "liloba-prayer-streak";
const MAX_INTENTIONS = 50;

export interface PrayerIntention {
  id: string;
  text: string;
  createdAt: number;
  answeredAt: number | null;
}

// ---------- Dates (heure locale) ----------

export function prayerDayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function prayerDayKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return prayerDayKey(d);
}

function notify(): void {
  try {
    window.dispatchEvent(new Event("liloba:prayer-life-updated"));
    window.dispatchEvent(new Event("liloba:journal-updated"));
  } catch {
    // ignore
  }
}

// ============================================================
// 1. INTENTIONS PERSONNELLES
// ============================================================

function readIntentions(): PrayerIntention[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INTENTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.text === "string");
  } catch {
    return [];
  }
}

function writeIntentions(items: PrayerIntention[]): void {
  try {
    localStorage.setItem(INTENTIONS_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("liloba:prayer-life-updated"));
  } catch {
    // ignore
  }
}

export function getIntentions(): PrayerIntention[] {
  return readIntentions().sort((a, b) => {
    // Non exaucées d'abord, puis les plus récentes
    if ((a.answeredAt ? 1 : 0) !== (b.answeredAt ? 1 : 0)) {
      return (a.answeredAt ? 1 : 0) - (b.answeredAt ? 1 : 0);
    }
    return b.createdAt - a.createdAt;
  });
}

export function addIntention(text: string): PrayerIntention | null {
  const clean = text.trim().slice(0, 200);
  if (!clean) return null;
  try {
    const items = readIntentions();
    if (items.length >= MAX_INTENTIONS) return null;
    const entry: PrayerIntention = {
      id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: clean,
      createdAt: Date.now(),
      answeredAt: null,
    };
    writeIntentions([entry, ...items]);
    return entry;
  } catch {
    return null;
  }
}

export function toggleIntentionAnswered(id: string): void {
  try {
    const items = readIntentions().map((i) =>
      i.id === id
        ? { ...i, answeredAt: i.answeredAt ? null : Date.now() }
        : i
    );
    writeIntentions(items);
  } catch {
    // ignore
  }
}

export function deleteIntention(id: string): void {
  try {
    writeIntentions(readIntentions().filter((i) => i.id !== id));
  } catch {
    // ignore
  }
}

// ============================================================
// 2. COMPTEUR "AMEN" PAR PRIÈRE
// ============================================================

interface AmenStore {
  counts: Record<string, number>;
  days: Record<string, string[]>; // prayerId -> dayKeys (30 max)
}

function readAmen(): AmenStore {
  if (typeof window === "undefined") return { counts: {}, days: {} };
  try {
    const raw = localStorage.getItem(AMEN_KEY);
    if (!raw) return { counts: {}, days: {} };
    const parsed = JSON.parse(raw);
    return {
      counts: parsed.counts ?? {},
      days: parsed.days ?? {},
    };
  } catch {
    return { counts: {}, days: {} };
  }
}

export function getAmenCount(prayerId: string): number {
  return readAmen().counts[prayerId] ?? 0;
}

export function getTotalAmen(): number {
  return Object.values(readAmen().counts).reduce((a, b) => a + b, 0);
}

/** Dit "Amen" à une prière : +1 compteur + jour d'activité. */
export function sayAmen(prayerId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const store = readAmen();
    const next = (store.counts[prayerId] ?? 0) + 1;
    store.counts[prayerId] = next;
    const today = prayerDayKey();
    const list = store.days[prayerId] ?? [];
    if (!list.includes(today)) {
      store.days[prayerId] = [today, ...list].slice(0, 30);
    }
    localStorage.setItem(AMEN_KEY, JSON.stringify(store));
    markPrayerDay(today);
    notify();
    return next;
  } catch {
    return 0;
  }
}

// ============================================================
// 3. JOURS DE PRIÈRE (routine / défi 7 jours)
// ============================================================

function readPrayerDays(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function writePrayerDays(days: string[]): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(days.slice(0, 90)));
  } catch {
    // ignore
  }
}

/** Marque un jour comme "prié" (idempotent). */
export function markPrayerDay(dayKey: string = prayerDayKey()): void {
  try {
    const days = readPrayerDays();
    if (!days.includes(dayKey)) {
      writePrayerDays([dayKey, ...days]);
      window.dispatchEvent(new Event("liloba:prayer-life-updated"));
    }
  } catch {
    // ignore
  }
}

export function getPrayerDays(): string[] {
  // Union : jours cochés + jours avec un Amen
  const set = new Set<string>(readPrayerDays());
  try {
    for (const list of Object.values(readAmen().days)) {
      for (const d of list) set.add(d);
    }
  } catch {
    // ignore
  }
  return Array.from(set);
}

/** Série actuelle de jours de prière consécutifs. */
export function getPrayerStreak(): { current: number; today: boolean } {
  const days = new Set(getPrayerDays());
  const today = prayerDayKey();
  let current = 0;
  // La série peut commencer aujourd'hui ou hier
  let cursor = days.has(today) ? 0 : -1;
  if (cursor === -1 && !days.has(prayerDayKeyOffset(-1))) {
    return { current: 0, today: false };
  }
  for (let i = cursor; ; i--) {
    if (days.has(prayerDayKeyOffset(i))) current++;
    else break;
  }
  return { current, today: days.has(today) };
}
