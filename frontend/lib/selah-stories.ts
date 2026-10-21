// ============================================================
// LILOBA — SELAH · histoire suggérée selon l'état du cœur
// ============================================================
// Chaque état propose 2 histoires de la bibliothèque ; l'une ou l'autre est
// choisie selon le jour (déterministe, 100 % hors ligne). Si un slug
// n'existe plus, il est simplement ignoré.
// ============================================================

import { getStory, type BibleStory } from "@/lib/stories-content";
import type { SoulState } from "@/lib/selah-content";

const SELAH_STORIES: Record<SoulState, string[]> = {
  paix: ["dix-lepreux", "ruth-loyaute"],
  joie: ["anne-priere", "david-goliath"],
  fatigue: ["jesus-tempete", "cinq-pains-deux-poissons"],
  angoisse: ["daniel-lions", "moise-mer-rouge"],
  colere: ["joseph-pardon", "bon-samaritain"],
  culpabilite: ["fils-perdu", "zachee-sycomore"],
  secheresse: ["abraham-confiance", "jonas-seconde-chance"],
};

export function pickStoryForState(state: SoulState): BibleStory | null {
  const stories = (SELAH_STORIES[state] ?? [])
    .map((slug) => getStory(slug))
    .filter((s): s is BibleStory => Boolean(s));
  if (stories.length === 0) return null;
  const t = new Date();
  const day = Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000);
  return stories[day % stories.length];
}
