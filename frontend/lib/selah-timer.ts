// ============================================================
// LILOBA — SELAH · chrono de prière calculé sur le texte
// ============================================================
// Fonction pure et documentée : la durée est calculée à partir
// du texte réel, pas d'une valeur fixe.
//
// Règle :
//   lecture   = nombre de mots / 90 mots par minute
//   respiration = ~2 secondes par ligne (pause naturelle)
//   silence final = ~25 % du temps de lecture (minimum 20 s)
//   total arrondi à 5 secondes.
//
// Le composant utilise ensuite un timestamp de fin
// (Date.now() + total) : le chrono reste juste même si l'onglet
// passe en arrière-plan. Respecte prefers-reduced-motion
// (aucune animation de respiration dans ce cas).
// ============================================================

import { stopVoice } from "@/lib/selah-voice";

export interface PrayerTiming {
  /** Nombre de mots comptés */
  words: number;
  /** Nombre de lignes non vides */
  lines: number;
  /** Temps de lecture estimé (secondes, non arrondi) */
  readingSeconds: number;
  /** Temps de respiration (secondes) */
  breathingSeconds: number;
  /** Silence final (secondes) */
  silenceSeconds: number;
  /** Total arrondi à 5 s (secondes) — valeur à utiliser */
  totalSeconds: number;
  /** Total en millisecondes */
  totalMs: number;
}

/** Compte les mots d'une prière (lignes ou texte libre). */
export function countPrayerWords(input: string[] | string): number {
  const text = Array.isArray(input) ? input.join("\n") : input;
  const words = text
    .replace(/[\n\r]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

/** Compte les lignes non vides (une respiration chacune). */
export function countPrayerLines(input: string[] | string): number {
  const arr = Array.isArray(input) ? input : input.split("\n");
  return arr.map((l) => l.trim()).filter(Boolean).length;
}

/**
 * Calcule la durée de prière à partir du texte.
 *
 * @example
 * estimatePrayerTiming(["Seigneur, me voici.", "Amen."])
 * // => { words: 4, lines: 2, ..., totalSeconds: 30 }
 */
export function estimatePrayerTiming(input: string[] | string): PrayerTiming {
  const words = countPrayerWords(input);
  const lines = countPrayerLines(input);
  const readingSeconds = (words / 90) * 60;
  const breathingSeconds = lines * 2;
  const silenceSeconds = Math.max(20, readingSeconds * 0.25);
  const raw = readingSeconds + breathingSeconds + silenceSeconds;
  const totalSeconds = Math.max(30, Math.round(raw / 5) * 5);
  return {
    words,
    lines,
    readingSeconds: Math.round(readingSeconds * 10) / 10,
    breathingSeconds,
    silenceSeconds: Math.round(silenceSeconds * 10) / 10,
    totalSeconds,
    totalMs: totalSeconds * 1000,
  };
}

/** « 03:05 » pour un nombre de secondes. */
export function formatPrayerCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${String(mm).padStart(2, "0")}:${ss}`;
}

/** true si l'utilisateur préfère réduire les animations. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** true si la synthèse vocale est disponible dans ce navigateur. */
export function isSpeechAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Arrête toute lecture vocale en cours (à appeler au démontage). */
export function stopSpeech(): void {
  stopVoice(); // coupe aussi la chaîne phrase par phrase (timers en attente)
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}
