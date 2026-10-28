"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Scores des 2 jeux mobiles (clés séparées : ne touche
// jamais à GameScores existant → zéro risque pour les records
// des 5 jeux actuels).
// ============================================================

const MEMORY_KEY = "liloba-game-memory-best";
const ORDRE_KEY = "liloba-game-ordre-best";

export function getBest(key: "memory" | "ordre"): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key === "memory" ? MEMORY_KEY : ORDRE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveBest(key: "memory" | "ordre", score: number): void {
  if (typeof window === "undefined") return;
  try {
    const k = key === "memory" ? MEMORY_KEY : ORDRE_KEY;
    const prev = getBest(key);
    if (score > prev) localStorage.setItem(k, String(score));
  } catch {
    // ignore (mode privé, stockage plein, etc.)
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
