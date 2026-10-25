"use client";

// ============================================================
// LILOBA — SELAH · Lecture vocale synchronisée avec la prière
// ============================================================
// Avant : toute la prière était lue d'un seul bloc, pendant que le texte
// défilait sur une horloge estimée (90 mots/min). Deux horloges
// indépendantes → la voix et le texte se décalaient de plus en plus.
//
// Maintenant : la voix lit la prière PHRASE PAR PHRASE, et c'est elle qui
// donne le tempo. À chaque phrase, un signal « cette ligne commence »
// est envoyé à l'écran, qui met en surbrillance exactement la phrase
// prononcée. Une petite respiration est laissée entre deux phrases.
//
// Robuste : sécurités si le navigateur n'émet pas ses évènements
// (certains Android/Safari), choix de la meilleure voix disponible,
// et arrêt propre via stopVoice() (appelé aussi par stopSpeech()).
// ============================================================

export interface SpeakOptions {
  /** « fr-FR » ou « en-US » */
  lang: string;
  /** Vitesse de la voix (1 = normale) */
  rate: number;
  /** Respiration entre deux phrases (ms) */
  gapMs: number;
  /** La phrase i COMMENCE à être prononcée. */
  onLine: (index: number) => void;
  /** Toutes les phrases ont été lues. */
  onDone: () => void;
  /** La synthèse est inutilisable : l'écran reprend son horloge. */
  onError: () => void;
}

let token = 0;
let timers: number[] = [];

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function clearTimers(): void {
  for (const t of timers) window.clearTimeout(t);
  timers = [];
}

/**
 * Choisit la plus belle voix de la langue : voix « naturelles / neuronales /
 * premium » en priorité, locale exacte (fr-FR plutôt que fr-CA), et jamais
 * une voix cloud quand l'appareil est hors ligne.
 */
export function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  try {
    const voices = s.getVoices();
    if (!voices.length) return null;
    const wanted = lang.toLowerCase();
    const base = wanted.slice(0, 2);
    const online = typeof navigator === "undefined" || navigator.onLine !== false;
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -Infinity;
    for (const v of voices) {
      const vl = v.lang.replace("_", "-").toLowerCase();
      if (!vl.startsWith(base)) continue;
      if (!v.localService && !online) continue;
      let score = 10;
      if (vl === wanted) score += 25;
      if (/natural|neural|premium|enhanced|siri|studio|wavenet/i.test(v.name)) score += 40;
      else if (/google|microsoft/i.test(v.name)) score += 15;
      if (v.localService) score += 5;
      if (v.default) score += 2;
      if (/compact|espeak/i.test(v.name)) score -= 20;
      if (score > bestScore) {
        best = v;
        bestScore = score;
      }
    }
    return best;
  } catch {
    return null;
  }
}

/** Arrête immédiatement la lecture et annule toute phrase en attente. */
export function stopVoice(): void {
  token++;
  clearTimers();
  try {
    synth()?.cancel();
  } catch {
    // ignore
  }
}

/** Lit les phrases à partir de `from`, une par une. */
export function speakLines(lines: string[], from: number, o: SpeakOptions): void {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === "undefined") {
    o.onError();
    return;
  }
  stopVoice();
  const my = token;
  const alive = () => my === token;

  const next = (i: number) => {
    if (!alive()) return;
    if (i >= lines.length) {
      o.onDone();
      return;
    }
    const text = (lines[i] ?? "").trim();
    let started = false;
    let finished = false;
    const own: number[] = [];

    const begin = () => {
      if (started || !alive()) return;
      started = true;
      o.onLine(i);
    };
    const end = () => {
      if (finished || !alive()) return;
      finished = true;
      own.forEach((t) => window.clearTimeout(t));
      begin(); // au cas où « start » n'a jamais été émis
      timers.push(window.setTimeout(() => next(i + 1), o.gapMs));
    };

    // Ligne vide : on l'affiche, on respire, on passe à la suivante
    if (!text) {
      begin();
      timers.push(window.setTimeout(() => next(i + 1), o.gapMs));
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = o.lang;
    u.rate = o.rate;
    const voice = pickVoice(o.lang);
    if (voice) u.voice = voice;
    u.onstart = begin;
    u.onend = end;
    u.onerror = (e) => {
      if (!alive()) return;
      const err = (e as SpeechSynthesisErrorEvent).error;
      if (err === "canceled" || err === "interrupted") return;
      own.forEach((t) => window.clearTimeout(t));
      token++; // coupe la chaîne
      clearTimers();
      o.onError();
    };

    // Sécurités : certains navigateurs n'émettent pas toujours start/end.
    const words = text.split(/\s+/).length;
    own.push(window.setTimeout(begin, 1500));
    own.push(window.setTimeout(end, Math.max(4000, words * 750 + 3000)));
    timers.push(...own);

    try {
      s.resume(); // débloque un moteur resté en « pause »
      s.speak(u);
    } catch {
      token++;
      clearTimers();
      o.onError();
    }
  };

  // Petit délai après cancel() : Chrome/Android perdent parfois le speak() immédiat
  timers.push(window.setTimeout(() => next(from), 90));
}
