"use client";

// ============================================================
// LILOBA — SELAH · La graine du jour
// ============================================================
// Pendant que Selah est fermé (avant 18h), l'utilisateur peut
// « planter une graine » : une courte intention pour sa journée
// (« rester patient en réunion », « écouter vraiment mon frère »…).
// Le soir, à l'ouverture de Selah, la graine revient et il note si
// elle est tombée en bonne terre. Clé "liloba-selah-seeds" (incluse
// dans la sauvegarde). 1 graine max par jour, 100 % local.
// ============================================================

const KEY = "liloba-selah-seeds";
const EVENT = "liloba:selah-seeds-updated";
const MAX_SEEDS = 90;
export const SEED_MAX_CHARS = 140;

export type SeedOutcome = "yes" | "partly" | "notyet";

export interface DaySeed {
  /** Jour de la graine (AAAA-MM-JJ), clé unique */
  date: string;
  text: string;
  createdAt: number;
  /** Bilan du soir (absent tant que non répondu) */
  outcome?: SeedOutcome;
}

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function isOutcome(v: unknown): v is SeedOutcome {
  return v === "yes" || v === "partly" || v === "notyet";
}

function parse(raw: string | null): DaySeed[] {
  if (!raw) return [];
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const byDate = new Map<string, DaySeed>();
    for (const e of arr) {
      if (!e || typeof e !== "object") continue;
      const o = e as Record<string, unknown>;
      if (!isDateKey(o.date) || typeof o.text !== "string" || !o.text.trim()) continue;
      byDate.set(o.date, {
        date: o.date,
        text: o.text.trim().slice(0, SEED_MAX_CHARS),
        createdAt: typeof o.createdAt === "number" ? o.createdAt : 0,
        outcome: isOutcome(o.outcome) ? o.outcome : undefined,
      });
    }
    return [...byDate.values()]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, MAX_SEEDS);
  } catch {
    return [];
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: DaySeed[] = [];

export function getSeeds(): DaySeed[] {
  if (typeof window === "undefined") return [];
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

export function getServerSeeds(): DaySeed[] {
  return [];
}

export function subscribeSeeds(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(list: DaySeed[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_SEEDS)));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Plante (ou remplace) la graine du jour. Texte vide → ne fait rien. */
export function plantSeed(text: string, today: string): void {
  const t = text.trim().slice(0, SEED_MAX_CHARS);
  if (!t || !isDateKey(today)) return;
  const others = getSeeds().filter((s) => s.date !== today);
  const prev = getSeeds().find((s) => s.date === today);
  write([{ date: today, text: t, createdAt: prev?.createdAt ?? Date.now(), outcome: prev?.outcome }, ...others]);
}

export function setSeedOutcome(date: string, outcome: SeedOutcome): void {
  if (!isOutcome(outcome)) return;
  write(getSeeds().map((s) => (s.date === date ? { ...s, outcome } : s)));
}

export function removeSeed(date: string): void {
  write(getSeeds().filter((s) => s.date !== date));
}

export function seedOf(date: string): DaySeed | null {
  return getSeeds().find((s) => s.date === date) ?? null;
}
