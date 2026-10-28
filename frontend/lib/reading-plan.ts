"use client";

import { localStorage } from "@/lib/profile-storage";
import { ANCIEN_TESTAMENT, CHAPTERS_COUNT, NOUVEAU_TESTAMENT } from "@/lib/bible-utils";
import { getTodayKey } from "@/lib/journal";

// ============================================================
// LILOBA — Plan de lecture biblique
// ------------------------------------------------------------
// 5 parcours, des chapitres répartis automatiquement jour par jour
// à partir de CHAPTERS_COUNT (nombre de chapitres de chaque livre).
//
// Sauvegarde : plan choisi + date de début + chapitres lus, dans le
// localStorage du PROFIL ACTIF (clé « liloba-reading-plan », donc
// liloba-<profil>-reading-plan). 100 % local : aucune requête réseau.
// ============================================================

export type PlanId = "year" | "d90" | "month" | "w3" | "week";

export interface PlanDef {
  id: PlanId;
  label: string;
  /** Ce qu'on lit */
  scope: string;
  days: number;
  books: string[];
}

export interface ChapterRef {
  book: string;
  chapter: number;
}

const BIBLE = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];

// Modifie librement ces parcours : tout le reste (jours, progression, anneau)
// se recalcule tout seul.
export const PLANS: PlanDef[] = [
  {
    id: "year",
    label: "Bible en 1 an",
    scope: "La Bible entière",
    days: 365,
    books: BIBLE,
  },
  {
    id: "d90",
    label: "90 jours",
    scope: "Le Nouveau Testament",
    days: 90,
    books: NOUVEAU_TESTAMENT,
  },
  {
    id: "month",
    label: "1 mois",
    scope: "Les Évangiles et les Actes",
    days: 30,
    books: ["Matthieu", "Marc", "Luc", "Jean", "Actes"],
  },
  {
    id: "w3",
    label: "3 semaines",
    scope: "Les lettres de Paul",
    days: 21,
    books: [
      "Romains",
      "1 Corinthiens",
      "2 Corinthiens",
      "Galates",
      "Éphésiens",
      "Philippiens",
      "Colossiens",
      "1 Thessaloniciens",
      "2 Thessaloniciens",
      "1 Timothée",
      "2 Timothée",
      "Tite",
      "Philémon",
    ],
  },
  {
    id: "week",
    label: "1 semaine",
    scope: "L'Évangile et les lettres de Jean",
    days: 7,
    books: ["Jean", "1 Jean", "2 Jean", "3 Jean"],
  },
];

export function getPlanDef(id: string): PlanDef | null {
  return PLANS.find((p) => p.id === id) ?? null;
}

// ------------------------------------------------------------
// Génération des chapitres et du calendrier
// ------------------------------------------------------------

const chaptersCache = new Map<PlanId, ChapterRef[]>();
const scheduleCache = new Map<PlanId, number[][]>();

/** Tous les chapitres du parcours, dans l'ordre biblique. */
export function planChapters(def: PlanDef): ChapterRef[] {
  const hit = chaptersCache.get(def.id);
  if (hit) return hit;
  const out: ChapterRef[] = [];
  for (const book of def.books) {
    const n = CHAPTERS_COUNT[book] ?? 0;
    for (let c = 1; c <= n; c++) out.push({ book, chapter: c });
  }
  chaptersCache.set(def.id, out);
  return out;
}

/**
 * Calendrier : pour chaque jour, la liste des NUMÉROS de chapitres (dans
 * planChapters). Répartition la plus régulière possible (±1 chapitre).
 */
export function planSchedule(def: PlanDef): number[][] {
  const hit = scheduleCache.get(def.id);
  if (hit) return hit;
  const total = planChapters(def).length;
  const days: number[][] = Array.from({ length: def.days }, () => []);
  for (let i = 0; i < total; i++) {
    const day = Math.min(def.days - 1, Math.floor((i * def.days) / total));
    days[day].push(i);
  }
  scheduleCache.set(def.id, days);
  return days;
}

/** « environ 3 chapitres par jour » */
export function chaptersPerDay(def: PlanDef): number {
  return planChapters(def).length / def.days;
}

// ------------------------------------------------------------
// Sauvegarde (localStorage du profil actif)
// ------------------------------------------------------------

const KEY = "liloba-reading-plan";
const EVENT = "liloba:reading-plan-updated";

export interface PlanState {
  v: 1;
  planId: PlanId;
  /** AAAA-MM-JJ */
  startDate: string;
  /** Une case par chapitre : "1" = lu, "0" = pas encore */
  done: string;
}

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function parse(raw: string | null): PlanState | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<PlanState> | null;
    if (!o || o.v !== 1 || typeof o.planId !== "string" || !isDateKey(o.startDate)) return null;
    const def = getPlanDef(o.planId);
    if (!def) return null;
    const total = planChapters(def).length;
    let done = typeof o.done === "string" ? o.done.replace(/[^01]/g, "") : "";
    if (done.length < total) done = done.padEnd(total, "0");
    if (done.length > total) done = done.slice(0, total);
    return { v: 1, planId: def.id, startDate: o.startDate, done };
  } catch {
    return null;
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: PlanState | null = null;

export function getPlanState(): PlanState | null {
  if (typeof window === "undefined") return null;
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

export function getServerPlanState(): PlanState | null {
  return null;
}

export function subscribePlan(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(state: PlanState | null): void {
  if (typeof window === "undefined") return;
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {
    // ignore (stockage plein / navigation privée)
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Démarre (ou remplace) le plan : début aujourd'hui, rien de lu. */
export function startPlan(id: PlanId, today: string = getTodayKey()): void {
  const def = getPlanDef(id);
  if (!def) return;
  write({
    v: 1,
    planId: def.id,
    startDate: today,
    done: "0".repeat(planChapters(def).length),
  });
}

export function stopPlan(): void {
  write(null);
}

/** Coche / décoche un chapitre (numéro dans planChapters). */
export function toggleChapter(index: number): void {
  const s = getPlanState();
  if (!s || index < 0 || index >= s.done.length) return;
  const next = s.done.slice(0, index) + (s.done[index] === "1" ? "0" : "1") + s.done.slice(index + 1);
  write({ ...s, done: next });
}

/** Marque une liste de chapitres comme lus (ex. toute la lecture du jour). */
export function markChaptersRead(indexes: number[]): void {
  const s = getPlanState();
  if (!s) return;
  const bits = s.done.split("");
  for (const i of indexes) if (i >= 0 && i < bits.length) bits[i] = "1";
  write({ ...s, done: bits.join("") });
}

// ------------------------------------------------------------
// Vue calculée (ce que l'écran affiche)
// ------------------------------------------------------------

export interface PlanItem {
  index: number;
  ref: ChapterRef;
  read: boolean;
}

export interface PlanView {
  def: PlanDef;
  total: number;
  readCount: number;
  /** 0..100 */
  percent: number;
  /** Jour courant, 1..def.days (borné) */
  dayNumber: number;
  /** Le plan est-il dépassé (jour > durée) ? */
  overtime: boolean;
  /** Le plan n'a pas encore commencé (date de début dans le futur) */
  notStarted: boolean;
  /** Lectures prévues aujourd'hui */
  today: PlanItem[];
  todayDone: boolean;
  /** Chapitres prévus AVANT aujourd'hui et pas encore lus */
  late: PlanItem[];
  finished: boolean;
}

function dayNum(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function buildPlanView(state: PlanState, today: string = getTodayKey()): PlanView | null {
  const def = getPlanDef(state.planId);
  if (!def) return null;
  const chapters = planChapters(def);
  const schedule = planSchedule(def);
  const total = chapters.length;
  const rawDay = dayNum(today) - dayNum(state.startDate);
  const notStarted = rawDay < 0;
  const dayIdx = Math.max(0, rawDay);
  const overtime = dayIdx >= def.days;
  const clamped = Math.min(dayIdx, def.days - 1);

  const item = (i: number): PlanItem => ({
    index: i,
    ref: chapters[i],
    read: state.done[i] === "1",
  });

  const todayItems = overtime || notStarted ? [] : schedule[clamped].map(item);
  const late: PlanItem[] = [];
  const upTo = overtime ? def.days : clamped;
  for (let d = 0; d < upTo; d++) {
    for (const i of schedule[d]) if (state.done[i] !== "1") late.push(item(i));
  }

  let readCount = 0;
  for (let i = 0; i < total; i++) if (state.done[i] === "1") readCount++;

  return {
    def,
    total,
    readCount,
    percent: total === 0 ? 0 : Math.round((readCount / total) * 100),
    dayNumber: clamped + 1,
    overtime,
    notStarted,
    today: todayItems,
    todayDone: todayItems.length > 0 && todayItems.every((x) => x.read),
    late,
    finished: readCount === total && total > 0,
  };
}

/** « Genèse 1 » */
export function refLabel(r: ChapterRef): string {
  return `${r.book} ${r.chapter}`;
}
