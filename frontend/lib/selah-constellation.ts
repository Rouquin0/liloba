// ============================================================
// LILOBA — SELAH · Constellation de l'âme (moteur pur)
// ============================================================
// Transforme l'historique des pauses en un ciel étoilé :
//   • 1 pause = 1 étoile
//   • axe horizontal = le temps (30 ou 90 derniers jours)
//   • axe vertical   = la « saison » du cœur (joie en haut, désert en bas)
//   • taille         = nombre de mercis notés ce soir-là
//   • traits         = nuits consécutives (pointillés = jour sauvé 🛡️)
//   • éclat doré     = sujet de prière exaucé ce jour-là
// Aucun appel réseau, aucune IA : tout est calculé sur l'appareil.
// Fichier volontairement sans dépendance (testable seul).
// ============================================================

import type { SelahEntry } from "@/lib/selah";
import type { PrayerTopic } from "@/lib/selah-topics";
import type { SoulState } from "@/lib/selah-content";

/** Du plus lumineux (haut du ciel) au plus aride (bas du ciel). */
export const SKY_ORDER: SoulState[] = [
  "joie",
  "paix",
  "fatigue",
  "angoisse",
  "colere",
  "culpabilite",
  "secheresse",
];

/** Teintes claires, lisibles sur fond nocturne. */
export const SKY_COLORS: Record<SoulState, string> = {
  joie: "#fbbf24",
  paix: "#34d399",
  fatigue: "#818cf8",
  angoisse: "#38bdf8",
  colere: "#f87171",
  culpabilite: "#a78bfa",
  secheresse: "#facc15",
};

export interface SkyStar {
  id: string;
  date: string;
  x: number;
  y: number;
  r: number;
  state: SoulState;
  color: string;
  gratitudes: number;
  answered: boolean;
  isToday: boolean;
}

export interface SkyLink {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Pont de grâce : un jour sauvé par un sursis relie les deux étoiles. */
  bridge: boolean;
  color: string;
}

export interface SkyDust {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle: boolean;
}

export interface Sky {
  stars: SkyStar[];
  links: SkyLink[];
  dust: SkyDust[];
  todayX: number;
}

// ------------------------------------------------------------
// Utilitaires déterministes (le même historique donne toujours
// exactement le même ciel : pas de scintillement de positions)
// ------------------------------------------------------------

/** Numéro de jour absolu (UTC, insensible à l'heure d'été). */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------
// Construction du ciel
// ------------------------------------------------------------

export interface BuildSkyInput {
  entries: SelahEntry[];
  shields: string[];
  topics: PrayerTopic[];
  today: string;
  windowDays: number;
  width: number;
  height: number;
}

export function buildSky(input: BuildSkyInput): Sky {
  const { entries, shields, topics, today, windowDays, width, height } = input;
  const padX = 22;
  const padY = 30;
  const todayN = dayNumber(today);
  const startN = todayN - (windowDays - 1);
  const span = Math.max(1, windowDays - 1);
  const bands = SKY_ORDER.length - 1;
  const bandH = (height - padY * 2) / bands;

  const xOf = (n: number) => padX + ((n - startN) / span) * (width - padX * 2);

  const answeredDates = new Set(
    topics.filter((t) => t.answeredAt && t.date).map((t) => t.date)
  );

  const inWindow = entries
    .filter((e) => {
      const n = dayNumber(e.date);
      return n >= startN && n <= todayN;
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const stars: SkyStar[] = inWindow.map((e) => {
    const level = Math.max(0, SKY_ORDER.indexOf(e.state));
    const rnd = mulberry32(hashString(e.id));
    const jitter = (rnd() - 0.5) * bandH * 0.55;
    const g = Math.min(3, e.gratitudes.length);
    return {
      id: e.id,
      date: e.date,
      x: xOf(dayNumber(e.date)),
      y: padY + level * bandH + jitter,
      r: 2.4 + g * 0.9 + (e.note ? 0.6 : 0),
      state: e.state,
      color: SKY_COLORS[e.state],
      gratitudes: e.gratitudes.length,
      answered: answeredDates.has(e.date),
      isToday: e.date === today,
    };
  });

  const shieldSet = new Set(shields.map(dayNumber));
  const links: SkyLink[] = [];
  for (let i = 0; i < stars.length - 1; i++) {
    const a = stars[i];
    const b = stars[i + 1];
    const diff = dayNumber(b.date) - dayNumber(a.date);
    const bridged = diff === 2 && shieldSet.has(dayNumber(a.date) + 1);
    if (diff === 1 || bridged) {
      links.push({
        key: `${a.id}-${b.id}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        bridge: bridged,
        color: b.color,
      });
    }
  }

  // Poussière d'étoiles de fond (graine fixe → ciel stable)
  const rnd = mulberry32(20240607);
  const count = Math.round(Math.min(90, Math.max(36, width / 9)));
  const dust: SkyDust[] = Array.from({ length: count }, () => ({
    x: rnd() * width,
    y: rnd() * height,
    r: 0.3 + rnd() * 0.8,
    o: 0.15 + rnd() * 0.45,
    twinkle: rnd() > 0.82,
  }));

  return { stars, links, dust, todayX: xOf(todayN) };
}

// ------------------------------------------------------------
// Nom de la constellation en cours (débloqué par la fidélité)
// ------------------------------------------------------------

export function constellationName(streak: number, lang: "fr" | "en"): string | null {
  const fr = lang === "fr";
  if (streak >= 100) return fr ? "Le Berger" : "The Shepherd";
  if (streak >= 30) return fr ? "La Couronne" : "The Crown";
  if (streak >= 7) return fr ? "Les Sept Jours" : "The Seven Days";
  if (streak >= 3) return fr ? "La Lampe" : "The Lamp";
  return null;
}
