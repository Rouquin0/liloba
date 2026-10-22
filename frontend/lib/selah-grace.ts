"use client";

// ============================================================
// LILOBA — SELAH · sursis de 24 h ILLIMITÉ
// ============================================================
// Règle :
// - L'utilisateur manque UN jour → sa série passe « en sursis »
//   pendant les 24 h suivantes (jusqu'à la fin du jour courant).
// - S'il fait sa pause dans ce délai, la série continue. Le jour
//   manqué est marqué 🛡️ dans la frise : il ne compte pas comme
//   une pause, mais ne casse pas la série.
// - Deux jours manqués d'affilée → série à 0.
// - Aucune limite de nombre de sursis (plusieurs sursis espacés
//   possibles) : chaque jour sauvé est mémorisé dans `shields`.
// - 100 % local, hors ligne. Clé séparée "liloba-selah-grace",
//   même pattern useSyncExternalStore + même événement que selah.ts.
// - Les dates sont des clés locales AAAA-MM-JJ (pas de piège UTC).
// ============================================================

const KEY = "liloba-selah-grace";
const EVENT = "liloba:selah-grace-updated";
const MAX_SHIELDS = 400;

export interface SelahGraceState {
  /** Jours manqués pardonnés (AAAA-MM-JJ), triés. */
  shields: string[];
}

export type GraceStatus = "ok" | "grace" | "broken";

export interface GraceInfo {
  status: GraceStatus;
  /** Le jour manqué concerné (AAAA-MM-JJ), ou null. */
  missedDate: string | null;
  /** Fin du sursis (timestamp local), ou null. */
  deadlineMs: number | null;
  /** Heures restantes avant la fin du sursis (arrondi sup). */
  hoursLeft: number | null;
}

// ------------------------------------------------------------
// DATES (jour local, même logique que selah.ts — dupliqué ici
// pour éviter tout import circulaire selah.ts ↔ selah-grace.ts)
// ------------------------------------------------------------

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function graceParseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function graceAddDays(key: string, n: number): string {
  const d = graceParseKey(key);
  d.setDate(d.getDate() + n);
  return keyOf(d);
}

export function graceTodayKey(nowMs?: number): string {
  const d = typeof nowMs === "number" ? new Date(nowMs) : new Date();
  return keyOf(d);
}

/** Début du jour local (00:00) pour une clé AAAA-MM-JJ. */
function startOfKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

/**
 * Fin du sursis pour un jour manqué `missed` : fin du lendemain
 * (le jour manqué + 1 jour doit contenir une pause avant minuit).
 * Ex : manque le 10 → doit faire sa pause le 11 avant 24h00.
 */
export function graceDeadlineMs(missedDate: string): number {
  return startOfKey(graceAddDays(missedDate, 2));
}

/** Heures restantes (arrondi supérieur, min 0). */
export function graceHoursLeft(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 3600000));
}

// ------------------------------------------------------------
// STOCKAGE (compatible useSyncExternalStore)
// ------------------------------------------------------------

const EMPTY: SelahGraceState = { shields: [] };

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function parse(raw: string | null): SelahGraceState {
  if (!raw) return EMPTY;
  try {
    const p: unknown = JSON.parse(raw);
    if (!p || typeof p !== "object") return EMPTY;
    const o = p as Record<string, unknown>;
    if (!Array.isArray(o.shields)) return EMPTY;
    const shields = [...new Set(o.shields.filter(isDateKey))].sort().slice(-MAX_SHIELDS);
    return { shields };
  } catch {
    return EMPTY;
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: SelahGraceState = EMPTY;

export function getSelahGrace(): SelahGraceState {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // ignore (navigation privée…)
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheVal = parse(raw);
  }
  return cacheVal;
}

export function getServerSelahGrace(): SelahGraceState {
  return EMPTY;
}

export function subscribeSelahGrace(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(state: SelahGraceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota / navigation privée : on ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Mémorise un jour manqué sauvé (idempotent, sans limite de nombre). */
export function addGraceShield(dateKey: string): void {
  if (!isDateKey(dateKey)) return;
  const cur = getSelahGrace();
  if (cur.shields.includes(dateKey)) return;
  write({ shields: [...cur.shields, dateKey].sort().slice(-MAX_SHIELDS) });
}

export function clearSelahGrace(): void {
  write({ shields: [] });
}

// ------------------------------------------------------------
// LOGIQUE PURE (testable : todayKey et nowMs injectables)
// ------------------------------------------------------------

/**
 * Calcule le statut de sursis à partir des dates de pauses.
 *
 * @param dates  ensemble des jours avec pause (AAAA-MM-JJ)
 * @param todayKey jour local courant (défaut : aujourd'hui)
 * @param nowMs timestamp courant (défaut : Date.now())
 */
export function computeGraceInfo(
  dates: Set<string> | string[],
  todayKey?: string,
  nowMs?: number
): GraceInfo {
  const set = Array.isArray(dates) ? new Set(dates) : dates;
  const today = todayKey ?? graceTodayKey();
  const now = typeof nowMs === "number" ? nowMs : Date.now();
  const yesterday = graceAddDays(today, -1);
  const dayBefore = graceAddDays(today, -2);
  const doneToday = set.has(today);
  const hasYesterday = set.has(yesterday);
  const hasDayBefore = set.has(dayBefore);

  // Pause faite aujourd'hui : pas de sursis en cours.
  // (Si hier manquait et avant-hier présent → la pause du jour
  // vient de sauver la série ; l'appelant ajoute le shield.)
  if (doneToday) {
    if (!hasYesterday && hasDayBefore) {
      return { status: "ok", missedDate: yesterday, deadlineMs: null, hoursLeft: null };
    }
    return { status: "ok", missedDate: null, deadlineMs: null, hoursLeft: null };
  }

  // Rien aujourd'hui et hier manqué :
  if (!hasYesterday) {
    // Deux jours manqués d'affilée (hier + avant-hier absents,
    // ou avant-hier absent et pas de continuité) → série à 0.
    // Cas premier usage : aucune pause du tout → "ok", pas "broken".
    if (!hasDayBefore) {
      // S'il n'y a strictement aucune pause, ce n'est pas une rupture.
      if (set.size === 0) {
        return { status: "ok", missedDate: null, deadlineMs: null, hoursLeft: null };
      }
      // Y a-t-il une pause récente (7 derniers jours) qui prouve
      // qu'une série existait ? Sinon, série déjà à 0 → "ok".
      let recent = false;
      for (let i = 2; i <= 8; i++) {
        if (set.has(graceAddDays(today, -i))) {
          recent = true;
          break;
        }
      }
      if (!recent) {
        return { status: "ok", missedDate: null, deadlineMs: null, hoursLeft: null };
      }
      return { status: "broken", missedDate: null, deadlineMs: null, hoursLeft: null };
    }
    // Hier manqué, avant-hier présent → en sursis jusqu'à ce soir minuit.
    const deadline = startOfKey(graceAddDays(yesterday, 2));
    return {
      status: "grace",
      missedDate: yesterday,
      deadlineMs: deadline,
      hoursLeft: graceHoursLeft(deadline, now),
    };
  }

  return { status: "ok", missedDate: null, deadlineMs: null, hoursLeft: null };
}

/**
 * Vrai si la pause du `todayKey` vient de sauver un sursis
 * (hier manqué + avant-hier présent). L'appelant doit alors
 * mémoriser le shield via addGraceShield(yesterday).
 */
export function isGraceSave(
  dates: Set<string> | string[],
  todayKey?: string
): { saved: boolean; missedDate: string | null } {
  const set = Array.isArray(dates) ? new Set(dates) : dates;
  const today = todayKey ?? graceTodayKey();
  const yesterday = graceAddDays(today, -1);
  const dayBefore = graceAddDays(today, -2);
  if (set.has(today) && !set.has(yesterday) && set.has(dayBefore)) {
    return { saved: true, missedDate: yesterday };
  }
  return { saved: false, missedDate: null };
}
