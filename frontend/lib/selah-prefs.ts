"use client";

// ============================================================
// LILOBA — SELAH · préférences locales
// ============================================================
// Clé "liloba-selah-prefs" (incluse dans la sauvegarde/export
// qui prend toutes les clés "liloba-selah*").
// Contient : durée de prière mémorisée, paliers déjà célébrés,
// option « lire à voix haute ». Parse défensif, 100 % hors ligne.
// ============================================================

import { isPrayerDuration, type PrayerDuration } from "@/lib/selah-prayers";
import { localStorage } from "@/lib/profile-storage";

const KEY = "liloba-selah-prefs";
const EVENT = "liloba:selah-prefs-updated";

export interface SelahPrefs {
  /** Durée de prière par défaut (sélecteur Courte/Moyenne/Profonde). */
  prayerDuration: PrayerDuration;
  /** Paliers déjà affichés une seule fois (ex : [7, 30]). */
  milestonesSeen: number[];
  /** Option « lire à voix haute » (désactivée par défaut). */
  readAloud: boolean;
  /** Ambiance sonore générative pendant la prière (désactivée par défaut). */
  ambient: boolean;
  /** Guide de souffle (anneau + vibrations douces) pendant la prière. */
  breath: boolean;
  /** Le rappel quotidien de 18h a déjà été ajouté à l'agenda. */
  reminderAdded: boolean;
}

const DEFAULTS: SelahPrefs = {
  prayerDuration: "moyenne",
  milestonesSeen: [],
  readAloud: false,
  ambient: false,
  breath: false,
  reminderAdded: false,
};

function parse(raw: string | null): SelahPrefs {
  if (!raw) return { ...DEFAULTS, milestonesSeen: [] };
  try {
    const p: unknown = JSON.parse(raw);
    if (!p || typeof p !== "object") return { ...DEFAULTS, milestonesSeen: [] };
    const o = p as Record<string, unknown>;
    return {
      prayerDuration: isPrayerDuration(o.prayerDuration) ? o.prayerDuration : "moyenne",
      milestonesSeen: Array.isArray(o.milestonesSeen)
        ? o.milestonesSeen.filter((n): n is number => typeof n === "number")
        : [],
      readAloud: o.readAloud === true,
      ambient: o.ambient === true,
      breath: o.breath === true,
      reminderAdded: o.reminderAdded === true,
    };
  } catch {
    return { ...DEFAULTS, milestonesSeen: [] };
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: SelahPrefs = { ...DEFAULTS, milestonesSeen: [] };

export function getSelahPrefs(): SelahPrefs {
  if (typeof window === "undefined") return { ...DEFAULTS, milestonesSeen: [] };
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

export function getServerSelahPrefs(): SelahPrefs {
  return { ...DEFAULTS, milestonesSeen: [] };
}

export function subscribeSelahPrefs(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(prefs: SelahPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

export function setPrayerDuration(d: PrayerDuration): void {
  if (!isPrayerDuration(d)) return;
  write({ ...getSelahPrefs(), prayerDuration: d });
}

export function setReadAloud(on: boolean): void {
  write({ ...getSelahPrefs(), readAloud: on === true });
}

export function setAmbient(on: boolean): void {
  write({ ...getSelahPrefs(), ambient: on === true });
}

export function setBreath(on: boolean): void {
  write({ ...getSelahPrefs(), breath: on === true });
}

export function setReminderAdded(on: boolean): void {
  write({ ...getSelahPrefs(), reminderAdded: on === true });
}

/** Marque un palier (7/30/100) comme déjà célébré. */
export function markMilestoneSeen(n: number): void {
  const cur = getSelahPrefs();
  if (cur.milestonesSeen.includes(n)) return;
  write({ ...cur, milestonesSeen: [...cur.milestonesSeen, n] });
}

export function clearSelahPrefs(): void {
  write({ ...DEFAULTS, milestonesSeen: [] });
}
