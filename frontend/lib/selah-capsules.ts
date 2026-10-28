"use client";

// ============================================================
// LILOBA — SELAH · Capsules du temps (lettres à soi-même)
// ============================================================
// Ce soir, tu écris à la personne que tu seras dans 1 semaine, 1 mois,
// 3 mois ou 1 an. La lettre est scellée : son contenu n'est plus affiché
// dans l'app jusqu'à la date choisie. Ce jour-là, Selah te prévient, tu
// l'ouvres, tu relis ce que tu vivais, puis tu peux y répondre.
// 100 % local (clé "liloba-selah-capsules", incluse dans la sauvegarde).
// ============================================================

import type { SoulState } from "@/lib/selah-content";
import { localStorage } from "@/lib/profile-storage";

const KEY = "liloba-selah-capsules";
const EVENT = "liloba:selah-capsules-updated";
const MAX_CAPSULES = 40;
export const CAPSULE_MAX_CHARS = 600;
export const CAPSULE_HORIZONS = [7, 30, 90, 365] as const;
export type CapsuleHorizon = (typeof CAPSULE_HORIZONS)[number];

export interface TimeCapsule {
  id: string;
  createdAt: number;
  /** Jour de l'écriture (AAAA-MM-JJ) */
  sealedOn: string;
  /** Jour d'ouverture (AAAA-MM-JJ) */
  openOn: string;
  text: string;
  /** Verset reçu ce soir-là (optionnel) */
  ref?: string;
  /** État du cœur ce soir-là (optionnel) */
  state?: SoulState;
  /** Timestamp d'ouverture, ou undefined si encore scellée */
  openedAt?: number;
  /** Réponse écrite à l'ouverture (optionnel) */
  reply?: string;
}

const STATES = new Set([
  "paix",
  "joie",
  "fatigue",
  "angoisse",
  "colere",
  "culpabilite",
  "secheresse",
]);

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function dayNum(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function addDaysKey(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n, 12);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

function parse(raw: string | null): TimeCapsule[] {
  if (!raw) return [];
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const out: TimeCapsule[] = [];
    for (const e of arr) {
      if (!e || typeof e !== "object") continue;
      const o = e as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.text !== "string") continue;
      if (!o.text.trim() || !isDateKey(o.openOn)) continue;
      out.push({
        id: o.id,
        createdAt: typeof o.createdAt === "number" ? o.createdAt : 0,
        sealedOn: isDateKey(o.sealedOn) ? o.sealedOn : o.openOn,
        openOn: o.openOn,
        text: o.text.slice(0, CAPSULE_MAX_CHARS),
        ref: typeof o.ref === "string" && o.ref ? o.ref : undefined,
        state:
          typeof o.state === "string" && STATES.has(o.state) ? (o.state as SoulState) : undefined,
        openedAt: typeof o.openedAt === "number" ? o.openedAt : undefined,
        reply:
          typeof o.reply === "string" && o.reply.trim()
            ? o.reply.slice(0, CAPSULE_MAX_CHARS)
            : undefined,
      });
    }
    return out.sort((a, b) => (a.openOn < b.openOn ? -1 : a.openOn > b.openOn ? 1 : b.createdAt - a.createdAt)).slice(0, MAX_CAPSULES);
  } catch {
    return [];
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: TimeCapsule[] = [];

export function getCapsules(): TimeCapsule[] {
  if (typeof window === "undefined") return [];
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

export function getServerCapsules(): TimeCapsule[] {
  return [];
}

export function subscribeCapsules(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(list: TimeCapsule[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_CAPSULES)));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Scelle une lettre. Retourne la capsule, ou null si le texte est vide. */
export function sealCapsule(input: {
  text: string;
  days: CapsuleHorizon;
  today: string;
  ref?: string;
  state?: SoulState;
}): TimeCapsule | null {
  const text = input.text.trim().slice(0, CAPSULE_MAX_CHARS);
  if (!text || !isDateKey(input.today)) return null;
  const days = CAPSULE_HORIZONS.includes(input.days) ? input.days : 30;
  const cap: TimeCapsule = {
    id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    sealedOn: input.today,
    openOn: addDaysKey(input.today, days),
    text,
    ref: input.ref || undefined,
    state: input.state,
  };
  write([cap, ...getCapsules()]);
  return cap;
}

export function openCapsule(id: string): void {
  write(getCapsules().map((c) => (c.id === id && !c.openedAt ? { ...c, openedAt: Date.now() } : c)));
}

export function saveCapsuleReply(id: string, reply: string): void {
  const r = reply.trim().slice(0, CAPSULE_MAX_CHARS);
  write(getCapsules().map((c) => (c.id === id ? { ...c, reply: r || undefined } : c)));
}

export function deleteCapsule(id: string): void {
  write(getCapsules().filter((c) => c.id !== id));
}

/** Jours restants avant ouverture (≤ 0 = prête). */
export function daysUntil(openOn: string, today: string): number {
  return dayNum(openOn) - dayNum(today);
}

export function isCapsuleReady(c: TimeCapsule, today: string): boolean {
  return !c.openedAt && daysUntil(c.openOn, today) <= 0;
}
