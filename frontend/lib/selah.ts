"use client";

// ============================================================
// LILOBA — SELAH · logique (stockage, série, choix du verset)
// ============================================================
// 100 % local, hors ligne. Les données sont dans localStorage sous
// la clé "liloba-selah" : elle est donc incluse automatiquement dans
// l'export / import de sauvegarde (qui prend toutes les clés "liloba-*").
// ============================================================

import { getJournal, getTodayKey } from "@/lib/journal";
import { getStreak } from "@/lib/stats";
import { parseReference, findBookBySlug } from "@/lib/bible-utils";
import {
  SELAH_RX,
  SELAH_STATES,
  type Prescription,
  type SoulMeta,
  type SoulState,
} from "@/lib/selah-content";

export type { Prescription, SoulMeta, SoulState };

const KEY = "liloba-selah";
const EVENT = "liloba:selah-updated";
const MAX_ENTRIES = 120;

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export interface SelahEntry {
  id: string;
  /** Jour local, format AAAA-MM-JJ (une seule pause par jour) */
  date: string;
  createdAt: number;
  state: SoulState;
  /** Référence du verset reçu, ex : "Psaumes 23:1" */
  ref: string;
  /** Sujet de prière (optionnel) */
  topic?: string;
  /** Jusqu'à 3 motifs de reconnaissance */
  gratitudes: string[];
  /** Le pas choisi pour le lendemain */
  pas: string;
  /** Le pas a-t-il été fait ? (renseigné le lendemain) */
  pasDone?: boolean;
}

export interface DaySignals {
  chapitres: number;
  versets: number;
  serie: number;
}

export interface SelahStats {
  current: number;
  longest: number;
  total: number;
  doneToday: boolean;
}

export interface WeekDay {
  date: string;
  weekday: string;
  isToday: boolean;
  entry?: SelahEntry;
}

// ------------------------------------------------------------
// DATES (jour local, sans piège d'heure d'été)
// ------------------------------------------------------------

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function addDays(key: string, n: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return keyOf(d);
}

// ------------------------------------------------------------
// STOCKAGE (compatible useSyncExternalStore)
// ------------------------------------------------------------

const EMPTY: SelahEntry[] = [];
const STATE_IDS = new Set<string>(Object.keys(SELAH_RX));

function parse(raw: string | null): SelahEntry[] {
  if (!raw) return EMPTY;
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return EMPTY;
    const out: SelahEntry[] = [];
    for (const e of arr) {
      if (!e || typeof e !== "object") continue;
      const o = e as Record<string, unknown>;
      if (typeof o.id !== "string") continue;
      if (typeof o.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) continue;
      if (typeof o.state !== "string" || !STATE_IDS.has(o.state)) continue;
      out.push({
        id: o.id,
        date: o.date,
        createdAt: typeof o.createdAt === "number" ? o.createdAt : 0,
        state: o.state as SoulState,
        ref: typeof o.ref === "string" ? o.ref : "",
        topic: typeof o.topic === "string" && o.topic ? o.topic : undefined,
        gratitudes: Array.isArray(o.gratitudes)
          ? o.gratitudes.filter((g): g is string => typeof g === "string").slice(0, 3)
          : [],
        pas: typeof o.pas === "string" ? o.pas : "",
        pasDone: typeof o.pasDone === "boolean" ? o.pasDone : undefined,
      });
    }
    return out.sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt
    );
  } catch {
    return EMPTY;
  }
}

// Même référence tant que le contenu brut ne change pas (requis par React)
let cacheRaw: string | null | undefined;
let cacheVal: SelahEntry[] = EMPTY;

export function getSelahEntries(): SelahEntry[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // ignore
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheVal = parse(raw);
  }
  return cacheVal;
}

export function getServerSelahEntries(): SelahEntry[] {
  return EMPTY;
}

export function subscribeSelah(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(entries: SelahEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // quota / navigation privée : on ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Enregistre la pause du jour (remplace celle du même jour si elle existe). */
export function saveSelahEntry(input: {
  state: SoulState;
  ref: string;
  topic?: string;
  gratitudes: string[];
  pas: string;
}): SelahEntry {
  const now = Date.now();
  const entry: SelahEntry = {
    id: `selah-${now}-${Math.random().toString(36).slice(2, 7)}`,
    date: getTodayKey(),
    createdAt: now,
    state: input.state,
    ref: input.ref,
    topic: input.topic?.trim() || undefined,
    gratitudes: input.gratitudes
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 3),
    pas: input.pas,
  };
  const others = getSelahEntries().filter((e) => e.date !== entry.date);
  write([entry, ...others]);
  return entry;
}

export function setPasDone(id: string, done: boolean): void {
  write(getSelahEntries().map((e) => (e.id === id ? { ...e, pasDone: done } : e)));
}

export function deleteSelahEntry(id: string): void {
  write(getSelahEntries().filter((e) => e.id !== id));
}

export function clearSelah(): void {
  write([]);
}

// ------------------------------------------------------------
// STATISTIQUES
// ------------------------------------------------------------

export function computeSelahStats(entries: SelahEntry[]): SelahStats {
  const dates = new Set(entries.map((e) => e.date));
  const today = getTodayKey();
  const doneToday = dates.has(today);

  // Série en cours : si la pause d'aujourd'hui n'est pas encore faite,
  // on compte à partir d'hier (la série n'est pas perdue avant ce soir).
  let cursor = doneToday ? today : addDays(today, -1);
  let current = 0;
  while (dates.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...dates].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  return { current, longest, total: entries.length, doneToday };
}

/** Les n derniers jours (du plus ancien à aujourd'hui) pour la frise. */
export function lastDays(entries: SelahEntry[], n: number, locale: string): WeekDay[] {
  const today = getTodayKey();
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const days: WeekDay[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    days.push({
      date,
      weekday: fmt.format(parseDateKey(date)),
      isToday: i === 0,
      entry: byDate.get(date),
    });
  }
  return days;
}

/** Le pas choisi lors de la dernière pause (si elle date d'avant aujourd'hui, max 7 jours). */
export function previousPas(entries: SelahEntry[]): SelahEntry | null {
  const today = getTodayKey();
  const limit = addDays(today, -7);
  for (const e of entries) {
    if (e.date < today && e.date >= limit && e.pas) return e;
  }
  return null;
}

// ------------------------------------------------------------
// SIGNAUX DU JOUR (faits simples, sans interprétation)
// ------------------------------------------------------------

export function readDaySignals(): DaySignals {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let chapitres = 0;
  let versets = 0;
  try {
    for (const e of getJournal()) {
      if (now - e.createdAt > day) break; // le journal est trié du plus récent au plus ancien
      if (e.type === "chapter_read") chapitres++;
      else if (
        e.type === "verse_marked" ||
        e.type === "verse_highlighted" ||
        e.type === "verse_favorited"
      ) {
        versets++;
      }
    }
  } catch {
    // ignore
  }
  let serie = 0;
  try {
    serie = getStreak().current ?? 0;
  } catch {
    // ignore
  }
  return { chapitres, versets, serie };
}

// ------------------------------------------------------------
// CHOIX DU VERSET
// ------------------------------------------------------------

export function getStateMeta(id: SoulState): SoulMeta {
  return SELAH_STATES.find((s) => s.id === id) ?? SELAH_STATES[0];
}

/**
 * Choisit un verset pour l'état donné, sans répéter les derniers reçus
 * dans cet état (on parcourt tous les versets avant de revenir au premier).
 * Déterministe pour un jour donné, 100 % hors ligne.
 */
export function pickPrescription(state: SoulState, entries: SelahEntry[]): Prescription {
  const list = SELAH_RX[state];
  const recent = entries
    .filter((e) => e.state === state)
    .slice(0, Math.max(0, list.length - 1))
    .map((e) => e.ref);
  const fresh = list.filter((p) => !recent.includes(p.ref));
  const pool = fresh.length > 0 ? fresh : list;

  const t = new Date();
  const dayNumber = Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000);
  return pool[dayNumber % pool.length];
}

/** Lien vers le chapitre complet d'une référence (ex : "Psaumes 23:1" → /bible/psaumes/23). */
export function chapterHref(ref: string): string | null {
  const parsed = parseReference(ref);
  if (!parsed || !findBookBySlug(parsed.slug)) return null;
  return `/bible/${parsed.slug}/${parsed.chapitre}`;
}
