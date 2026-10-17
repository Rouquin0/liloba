"use client";

// ============================================================
// LILOBA — Surlignage des versets
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type HighlightColor = "yellow" | "pink" | "green" | "blue" | "red";

export interface Highlight {
  reference: string;
  color: HighlightColor;
  createdAt: number;
  phrases?: number[]; // indices des phrases surlignées (optionnel)
}

export interface ColorConfig {
  value: HighlightColor;
  label: string;
  bg: string;
  border: string;
  text: string;
}

// ============================================================
// COULEURS DISPONIBLES
// ============================================================

export const HIGHLIGHT_COLORS: ColorConfig[] = [
  {
    value: "yellow",
    label: "Jaune",
    bg: "rgba(250, 204, 21, 0.45)",
    border: "rgba(250, 204, 21, 0.9)",
    text: "inherit",
  },
  {
    value: "pink",
    label: "Rose",
    bg: "rgba(236, 72, 153, 0.35)",
    border: "rgba(236, 72, 153, 0.8)",
    text: "inherit",
  },
  {
    value: "green",
    label: "Vert",
    bg: "rgba(34, 197, 94, 0.35)",
    border: "rgba(34, 197, 94, 0.8)",
    text: "inherit",
  },
  {
    value: "blue",
    label: "Bleu",
    bg: "rgba(59, 130, 246, 0.35)",
    border: "rgba(59, 130, 246, 0.8)",
    text: "inherit",
  },
  {
    value: "red",
    label: "Rouge",
    bg: "rgba(239, 68, 68, 0.35)",
    border: "rgba(239, 68, 68, 0.8)",
    text: "inherit",
  },
];

// ============================================================
// CLÉ DE STOCKAGE
// ============================================================

const STORAGE_KEY = "liloba-highlights";

// ============================================================
// LECTURE
// ============================================================

export function getAllHighlights(): Record<string, Highlight> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function getHighlight(reference: string): Highlight | null {
  const all = getAllHighlights();
  return all[reference] || null;
}

export function getHighlightColor(
  reference: string
): HighlightColor | null {
  const highlight = getHighlight(reference);
  return highlight?.color || null;
}

// ============================================================
// ÉCRITURE
// ============================================================

export function setHighlight(
  reference: string,
  color: HighlightColor,
  phrases?: number[]
): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllHighlights();
    all[reference] = {
      reference,
      color,
      createdAt: Date.now(),
      phrases,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function removeHighlight(reference: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllHighlights();
    delete all[reference];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function clearAllHighlights(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ============================================================
// HELPERS
// ============================================================

export function getColorConfig(
  color: HighlightColor
): ColorConfig | null {
  return HIGHLIGHT_COLORS.find((c) => c.value === color) || null;
}

export function countHighlightsByColor(): Record<HighlightColor, number> {
  const all = getAllHighlights();
  const counts: Record<HighlightColor, number> = {
    yellow: 0,
    pink: 0,
    green: 0,
    blue: 0,
    red: 0,
  };

  for (const highlight of Object.values(all)) {
    if (counts[highlight.color] !== undefined) {
      counts[highlight.color]++;
    }
  }

  return counts;
}

export function countAllHighlights(): number {
  return Object.keys(getAllHighlights()).length;
}

// ============================================================
// HELPERS POUR LA PAGE PARAMÈTRES
// ============================================================

/**
 * Transforme une référence biblique en URL.
 * Exemple : "Jean 3:16" → "/bible/jean/3"
 */
export function referenceToUrl(reference: string): string | null {
  try {
    // Format : "Livre Chapitre:Verset"
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const livre = match[1].trim();
    const chapitre = match[2];

    // Slug : minuscules, sans accents, espaces → tirets
    const slug = livre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `/bible/${slug}/${chapitre}`;
  } catch {
    return null;
  }
}

/**
 * Liste des surlignages triés par date (plus récents en premier).
 */
export function getHighlightsList(): Highlight[] {
  const all = getAllHighlights();
  return Object.values(all).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

/**
 * Liste des surlignages groupés par couleur.
 */
export function getHighlightsByColor(): Record<
  HighlightColor,
  Highlight[]
> {
  const all = getHighlightsList();
  const grouped: Record<HighlightColor, Highlight[]> = {
    yellow: [],
    pink: [],
    green: [],
    blue: [],
    red: [],
  };

  for (const highlight of all) {
    if (grouped[highlight.color]) {
      grouped[highlight.color].push(highlight);
    }
  }

  return grouped;
}
