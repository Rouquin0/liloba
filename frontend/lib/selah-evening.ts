"use client";

// ============================================================
// LILOBA — SELAH · Le verrou du soir
// ============================================================
// Selah est la pause du SOIR : elle s'ouvre chaque jour à 18h00,
// à l'heure LOCALE de l'appareil. Donc partout dans le monde,
// quel que soit le pays ou le fuseau horaire (même en voyage,
// changement d'heure compris) : 18h chez toi, c'est 18h pour toi.
//
// Fenêtre ouverte : de EVENING_START_HOUR (inclus) à EVENING_END_HOUR
// (exclu, 24 = minuit). Le reste de la journée, Selah affiche un
// compte à rebours ; « Mon parcours » reste, lui, toujours accessible.
//
// Aucun serveur : on lit simplement l'horloge de l'appareil.
// ============================================================

export const EVENING_START_HOUR = 18;
/** 24 = jusqu'à minuit. */
export const EVENING_END_HOUR = 24;

/** Selah est-il ouvert à cet instant ? */
export function isEveningOpen(d: Date = new Date()): boolean {
  const h = d.getHours();
  return h >= EVENING_START_HOUR && h < EVENING_END_HOUR;
}

/** Prochaine ouverture (18h00 locale) : aujourd'hui si pas encore 18h, sinon demain. */
export function nextOpening(d: Date = new Date()): Date {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), EVENING_START_HOUR, 0, 0, 0);
  if (t.getTime() <= d.getTime()) t.setDate(t.getDate() + 1);
  return t;
}

/** Millisecondes avant la prochaine ouverture. */
export function msUntilOpening(d: Date = new Date()): number {
  return Math.max(0, nextOpening(d).getTime() - d.getTime());
}

/** Prochain changement d'état (ouverture à 18h ou fermeture à minuit). */
export function msUntilNextBoundary(d: Date = new Date()): number {
  const open = isEveningOpen(d);
  const target = open
    ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), EVENING_END_HOUR, 0, 0, 0)
    : nextOpening(d);
  return Math.max(1000, target.getTime() - d.getTime());
}

/** Position du soleil de 0 (lever, 6h) à 1 (coucher = ouverture de Selah). */
export function sunProgress(d: Date = new Date()): number {
  const minutes = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  const from = 6 * 60;
  const to = EVENING_START_HOUR * 60;
  return Math.min(1, Math.max(0, (minutes - from) / (to - from)));
}

/** 12345678 ms → { h, m, s } */
export function splitDuration(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ------------------------------------------------------------
// Store React (useSyncExternalStore) : la valeur n'est qu'un booléen,
// donc SelahTab ne se re-rend QUE quand l'état change réellement
// (à 18h, ou à minuit), pas à chaque seconde.
// ------------------------------------------------------------

export function subscribeEvening(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let timer = 0;
  const schedule = () => {
    window.clearTimeout(timer);
    // +250 ms de marge pour tomber après la frontière ; plafonné à 60 s
    // pour se recaler vite après une mise en veille ou un voyage.
    timer = window.setTimeout(() => {
      callback();
      schedule();
    }, Math.min(msUntilNextBoundary() + 250, 60_000));
  };
  schedule();
  const recheck = () => {
    callback();
    schedule();
  };
  document.addEventListener("visibilitychange", recheck);
  window.addEventListener("focus", recheck);
  window.addEventListener("online", recheck);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", recheck);
    window.removeEventListener("focus", recheck);
    window.removeEventListener("online", recheck);
  };
}

export function getEveningSnapshot(): boolean {
  return isEveningOpen();
}

/** Rendu serveur : heure inconnue (le serveur n'a pas le fuseau du visiteur). */
export function getServerEveningSnapshot(): boolean | null {
  return null;
}
