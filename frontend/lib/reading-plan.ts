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

export type PlanId =
  | "year"
  | "d90"
  | "month"
  | "w3"
  | "week"
  | "ot"
  | "psalms"
  | "proverbs"
  | "custom";

/** Parcours personnalisé : du livre « from » au livre « to » (ordre biblique), en « days » jours. */
export interface CustomSpec {
  from: string;
  to: string;
  days: number;
}

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
  {
    id: "ot",
    label: "Ancien Testament",
    scope: "De la Genèse à Malachie",
    days: 270,
    books: ANCIEN_TESTAMENT,
  },
  {
    id: "psalms",
    label: "Psaumes en 30 jours",
    scope: "Les 150 Psaumes",
    days: 30,
    books: ["Psaumes"],
  },
  {
    id: "proverbs",
    label: "Proverbes en 31 jours",
    scope: "Un chapitre par jour du mois",
    days: 31,
    books: ["Proverbes"],
  },
];

export function getPlanDef(id: string): PlanDef | null {
  return PLANS.find((p) => p.id === id) ?? null;
}

/** Construit le parcours personnalisé (null si les livres sont invalides). */
export function customDef(spec: CustomSpec): PlanDef | null {
  const a = BIBLE.indexOf(spec.from);
  const b = BIBLE.indexOf(spec.to);
  if (a < 0 || b < a) return null;
  const books = BIBLE.slice(a, b + 1);
  const total = books.reduce((n, bk) => n + (CHAPTERS_COUNT[bk] ?? 0), 0);
  if (total === 0) return null;
  const days = Math.min(Math.max(1, Math.round(spec.days) || 1), Math.min(730, total));
  return {
    id: "custom",
    label: a === b ? spec.from : `${spec.from} à ${spec.to}`,
    scope: "Parcours personnalisé",
    days,
    books,
  };
}

/** Parcours d'une sauvegarde (prédéfini ou personnalisé). */
export function getPlanDefFor(state: { planId: string; custom?: CustomSpec }): PlanDef | null {
  if (state.planId === "custom") return state.custom ? customDef(state.custom) : null;
  return getPlanDef(state.planId);
}

function defKey(def: PlanDef): string {
  return def.id === "custom" ? `custom:${def.books[0]}:${def.books.length}:${def.days}` : def.id;
}

// ------------------------------------------------------------
// Génération des chapitres et du calendrier
// ------------------------------------------------------------

const chaptersCache = new Map<string, ChapterRef[]>();
const scheduleCache = new Map<string, number[][]>();

/** Tous les chapitres du parcours, dans l'ordre biblique. */
export function planChapters(def: PlanDef): ChapterRef[] {
  const hit = chaptersCache.get(defKey(def));
  if (hit) return hit;
  const out: ChapterRef[] = [];
  for (const book of def.books) {
    const n = CHAPTERS_COUNT[book] ?? 0;
    for (let c = 1; c <= n; c++) out.push({ book, chapter: c });
  }
  chaptersCache.set(defKey(def), out);
  return out;
}

/**
 * Calendrier : pour chaque jour, la liste des NUMÉROS de chapitres (dans
 * planChapters). Répartition la plus régulière possible (±1 chapitre).
 */
export function planSchedule(def: PlanDef): number[][] {
  const hit = scheduleCache.get(defKey(def));
  if (hit) return hit;
  const total = planChapters(def).length;
  const days: number[][] = Array.from({ length: def.days }, () => []);
  for (let i = 0; i < total; i++) {
    const day = Math.min(def.days - 1, Math.floor((i * def.days) / total));
    days[day].push(i);
  }
  scheduleCache.set(defKey(def), days);
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
const LOG_MAX = 500;

export interface PlanState {
  v: 1;
  planId: PlanId;
  /** AAAA-MM-JJ */
  startDate: string;
  /** Une case par chapitre : "1" = lu, "0" = pas encore */
  done: string;
  /** Parcours personnalisé (planId === "custom") */
  custom?: CustomSpec;
  /** Jours où au moins un chapitre a été lu (sert à la série) */
  log?: string[];
  /** Jours de pause : ne cassent pas la série */
  rest?: string[];
  /** Plan en pause depuis cette date (le calendrier est figé) */
  pausedAt?: string;
  /** Cocher automatiquement le chapitre quand on l'ouvre depuis le plan */
  autoMark?: boolean;
}

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function dateList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const set = new Set<string>();
  for (const x of v) if (isDateKey(x)) set.add(x);
  return [...set].sort().slice(-LOG_MAX);
}

function parseCustom(v: unknown): CustomSpec | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Partial<CustomSpec>;
  if (typeof o.from !== "string" || typeof o.to !== "string" || typeof o.days !== "number") return undefined;
  const def = customDef({ from: o.from, to: o.to, days: o.days });
  return def ? { from: o.from, to: o.to, days: def.days } : undefined;
}

function parse(raw: string | null): PlanState | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<PlanState> | null;
    if (!o || o.v !== 1 || typeof o.planId !== "string" || !isDateKey(o.startDate)) return null;
    const custom = o.planId === "custom" ? parseCustom(o.custom) : undefined;
    const def = getPlanDefFor({ planId: o.planId, custom });
    if (!def) return null;
    const total = planChapters(def).length;
    let done = typeof o.done === "string" ? o.done.replace(/[^01]/g, "") : "";
    if (done.length < total) done = done.padEnd(total, "0");
    if (done.length > total) done = done.slice(0, total);
    const state: PlanState = { v: 1, planId: def.id, startDate: o.startDate, done };
    if (custom) state.custom = custom;
    const log = dateList(o.log);
    if (log.length) state.log = log;
    const rest = dateList(o.rest);
    if (rest.length) state.rest = rest;
    if (isDateKey(o.pausedAt)) state.pausedAt = o.pausedAt;
    if (o.autoMark === true) state.autoMark = true;
    return state;
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

// ------------------------------------------------------------
// Dates (clés AAAA-MM-JJ)
// ------------------------------------------------------------

function dayNum(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function numToKey(n: number): string {
  const d = new Date(n * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(key: string, n: number): string {
  return numToKey(dayNum(key) + n);
}

/** 0 = dimanche … 6 = samedi */
function weekday(key: string): number {
  return new Date(dayNum(key) * 86400000).getUTCDay();
}

/** Prochain lundi strictement après aujourd'hui. */
export function nextMonday(today: string = getTodayKey()): string {
  const delta = (8 - weekday(today)) % 7;
  return addDays(today, delta === 0 ? 7 : delta);
}

/** « 14 mars 2027 » */
export function formatDateFr(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ------------------------------------------------------------
// Actions
// ------------------------------------------------------------

function withLog(s: PlanState, today: string): string[] {
  const log = s.log ?? [];
  return log.includes(today) ? log : [...log, today].slice(-LOG_MAX);
}

function freshState(def: PlanDef, today: string, custom?: CustomSpec): PlanState {
  const state: PlanState = {
    v: 1,
    planId: def.id,
    startDate: today,
    done: "0".repeat(planChapters(def).length),
  };
  if (custom) state.custom = custom;
  return state;
}

/** Démarre (ou remplace) le plan : début à la date donnée (aujourd'hui par défaut), rien de lu. */
export function startPlan(id: PlanId, today: string = getTodayKey()): void {
  if (id === "custom") return;
  const def = getPlanDef(id);
  if (!def) return;
  write(freshState(def, today));
}

/** Démarre un parcours personnalisé. */
export function startCustomPlan(spec: CustomSpec, today: string = getTodayKey()): void {
  const def = customDef(spec);
  if (!def) return;
  write(freshState(def, today, { from: spec.from, to: spec.to, days: def.days }));
}

export function stopPlan(): void {
  write(null);
}

/** Coche / décoche un chapitre (numéro dans planChapters). */
export function toggleChapter(index: number): void {
  const s = getPlanState();
  if (!s || index < 0 || index >= s.done.length) return;
  const turnOn = s.done[index] !== "1";
  const next = s.done.slice(0, index) + (turnOn ? "1" : "0") + s.done.slice(index + 1);
  write({ ...s, done: next, log: turnOn ? withLog(s, getTodayKey()) : s.log });
}

/** Marque une liste de chapitres comme lus (ex. toute la lecture du jour). */
export function markChaptersRead(indexes: number[]): void {
  setChaptersRead(indexes, true);
}

/** Coche ou décoche d'un coup une liste de chapitres (ex. un livre entier). */
export function setChaptersRead(indexes: number[], read: boolean): void {
  const s = getPlanState();
  if (!s) return;
  const bits = s.done.split("");
  let changed = false;
  for (const i of indexes) {
    if (i >= 0 && i < bits.length && bits[i] !== (read ? "1" : "0")) {
      bits[i] = read ? "1" : "0";
      changed = true;
    }
  }
  if (!changed) return;
  write({ ...s, done: bits.join(""), log: read ? withLog(s, getTodayKey()) : s.log });
}

/** Coche le chapitre quand on l'ouvre depuis le plan, si l'option est activée. */
export function markIfAutoMark(index: number): void {
  const s = getPlanState();
  if (s?.autoMark && s.done[index] !== "1") setChaptersRead([index], true);
}

export function setAutoMark(on: boolean): void {
  const s = getPlanState();
  if (!s) return;
  const next: PlanState = { ...s };
  if (on) next.autoMark = true;
  else delete next.autoMark;
  write(next);
}

/**
 * Pause : le calendrier se fige. À la reprise, la date de début est repoussée
 * du nombre de jours de pause (rien n'est en retard) et la série est préservée.
 */
export function togglePause(today: string = getTodayKey()): void {
  const s = getPlanState();
  if (!s) return;
  if (!s.pausedAt) {
    write({ ...s, pausedAt: today });
    return;
  }
  const gap = Math.max(0, dayNum(today) - dayNum(s.pausedAt));
  const rest = new Set(s.rest ?? []);
  for (let k = 0; k < Math.min(gap, 366); k++) rest.add(addDays(s.pausedAt, k));
  const next: PlanState = {
    ...s,
    startDate: addDays(s.startDate, gap),
    rest: [...rest].sort().slice(-LOG_MAX),
  };
  delete next.pausedAt;
  write(next);
}

/**
 * Recaler le calendrier : aujourd'hui devient le jour du premier chapitre non lu.
 * La progression est conservée, le retard disparaît.
 */
export function realignCalendar(today: string = getTodayKey()): void {
  const s = getPlanState();
  if (!s) return;
  const def = getPlanDefFor(s);
  if (!def) return;
  const first = s.done.indexOf("0");
  if (first < 0) return;
  const schedule = planSchedule(def);
  let day = 0;
  for (let d = 0; d < schedule.length; d++) {
    if (schedule[d].includes(first)) {
      day = d;
      break;
    }
  }
  const next: PlanState = { ...s, startDate: addDays(s.pausedAt ?? today, -day) };
  write(next);
}

// ------------------------------------------------------------
// Séries
// ------------------------------------------------------------

export interface Streaks {
  current: number;
  best: number;
}

export function computeStreaks(log: string[], rest: string[], today: string): Streaks {
  const L = new Set(log);
  const R = new Set(rest);
  const t = dayNum(today);

  let current = 0;
  let d = L.has(today) || R.has(today) ? t : t - 1;
  for (let guard = 0; guard < 1500; guard++, d--) {
    const k = numToKey(d);
    if (L.has(k)) current++;
    else if (!R.has(k)) break;
  }

  let best = 0;
  if (log.length > 0) {
    const sorted = [...log].sort();
    const from = dayNum(sorted[0]);
    const to = Math.min(dayNum(sorted[sorted.length - 1]), from + 1500);
    let run = 0;
    for (let n = from; n <= to; n++) {
      const k = numToKey(n);
      if (L.has(k)) {
        run++;
        if (run > best) best = run;
      } else if (!R.has(k)) run = 0;
    }
  }
  return { current, best: Math.max(best, current) };
}

// ------------------------------------------------------------
// Vue calculée (ce que l'écran affiche)
// ------------------------------------------------------------

export interface PlanItem {
  index: number;
  ref: ChapterRef;
  read: boolean;
}

export interface BookProgress {
  book: string;
  /** Numéro du premier chapitre du livre dans planChapters */
  start: number;
  count: number;
  read: number;
}

export interface WeekDay {
  key: string;
  /** L, M, M, J, V, S, D */
  label: string;
  read: boolean;
  isToday: boolean;
}

export type NextKind = "late" | "today" | "ahead";

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
  /** Plan en pause (calendrier figé) */
  paused: boolean;
  pausedSince: string | null;
  /** Prochain chapitre à lire, et pourquoi */
  next: PlanItem | null;
  nextKind: NextKind | null;
  /** Chapitres d'avance (0 si en retard ou pile à l'heure) */
  ahead: number;
  /** Série de jours de lecture, en cours et record */
  streak: number;
  bestStreak: number;
  /** Nombre de jours où tu as lu */
  activeDays: number;
  /** Chapitres lus par jour depuis le début */
  pace: number;
  /** Date de fin selon ton rythme réel (null si pas assez de données) */
  projectedEnd: string | null;
  /** Date de fin prévue par le calendrier */
  plannedEnd: string;
  /** Les 7 derniers jours */
  week: WeekDay[];
  startDate: string;
}

const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

/** Progression livre par livre. */
export function planBooks(def: PlanDef, done: string): BookProgress[] {
  const chapters = planChapters(def);
  const out: BookProgress[] = [];
  chapters.forEach((c, i) => {
    let last = out[out.length - 1];
    if (!last || last.book !== c.book) {
      last = { book: c.book, start: i, count: 0, read: 0 };
      out.push(last);
    }
    last.count++;
    if (done[i] === "1") last.read++;
  });
  return out;
}

export function buildPlanView(state: PlanState, today: string = getTodayKey()): PlanView | null {
  const def = getPlanDefFor(state);
  if (!def) return null;
  const chapters = planChapters(def);
  const schedule = planSchedule(def);
  const total = chapters.length;
  const paused = !!state.pausedAt;
  const ref = state.pausedAt ?? today;
  const rawDay = dayNum(ref) - dayNum(state.startDate);
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
  const upTo = overtime ? def.days : notStarted ? 0 : clamped;
  let dueBefore = 0;
  for (let d = 0; d < upTo; d++) {
    for (const i of schedule[d]) {
      dueBefore++;
      if (state.done[i] !== "1") late.push(item(i));
    }
  }

  let readCount = 0;
  for (let i = 0; i < total; i++) if (state.done[i] === "1") readCount++;

  const todayDone = todayItems.length > 0 && todayItems.every((x) => x.read);
  const finished = readCount === total && total > 0;

  // Prochain chapitre
  let next: PlanItem | null = null;
  let nextKind: NextKind | null = null;
  if (!finished) {
    if (late.length > 0) {
      next = late[0];
      nextKind = "late";
    } else {
      const t = todayItems.find((x) => !x.read);
      if (t) {
        next = t;
        nextKind = "today";
      } else {
        const first = state.done.indexOf("0");
        if (first >= 0) {
          next = item(first);
          nextKind = "ahead";
        }
      }
    }
  }

  const dueThrough = dueBefore + todayItems.length;
  const ahead = late.length === 0 ? Math.max(0, readCount - dueThrough) : 0;

  const log = state.log ?? [];
  const streaks = computeStreaks(log, state.rest ?? [], ref);

  const elapsed = notStarted ? 0 : dayIdx + 1;
  const pace = elapsed > 0 ? readCount / elapsed : 0;
  let projectedEnd: string | null = null;
  if (!finished && readCount > 0 && pace > 0) {
    const need = Math.ceil((total - readCount) / pace);
    if (need <= 3650) projectedEnd = addDays(ref, need);
  }

  const week: WeekDay[] = [];
  const logSet = new Set(log);
  for (let k = 6; k >= 0; k--) {
    const key = addDays(today, -k);
    week.push({ key, label: WEEK_LABELS[weekday(key)], read: logSet.has(key), isToday: k === 0 });
  }

  return {
    def,
    total,
    readCount,
    percent: total === 0 ? 0 : Math.round((readCount / total) * 100),
    dayNumber: clamped + 1,
    overtime,
    notStarted,
    today: todayItems,
    todayDone,
    late,
    finished,
    paused,
    pausedSince: state.pausedAt ?? null,
    next,
    nextKind,
    ahead,
    streak: streaks.current,
    bestStreak: streaks.best,
    activeDays: log.length,
    pace,
    projectedEnd,
    plannedEnd: addDays(state.startDate, def.days - 1),
    week,
    startDate: state.startDate,
  };
}

/** « Genèse 1 » */
export function refLabel(r: ChapterRef): string {
  return `${r.book} ${r.chapter}`;
}
