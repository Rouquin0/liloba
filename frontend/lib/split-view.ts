"use client";

// ============================================================
// LILOBA — Gestion du mode Split View (2 panneaux desktop)
// ============================================================
// Principes :
//  - Une SEULE porte d'écriture : updateSplitState(updater)
//  - Toute modification relit le localStorage au moment de l'écriture
//  - Cache mémoire pour éviter de re-créer l'objet à chaque appel
//  - subscribeSplit() utilisable avec useSyncExternalStore
// ============================================================

export type PaneTab =
  | "bible"
  | "chat"
  | "search"
  | "compare"
  | "selah"
  | "stories";

export interface PaneState {
  tab: PaneTab;
}

export interface SplitState {
  enabled: boolean;
  ratio: number;
  left: PaneState;
  right: PaneState;
}

const STORAGE_KEY = "liloba:split-view";
const EVENT = "liloba:split-updated";
const TABS: PaneTab[] = ["bible", "chat", "search", "compare", "selah", "stories"];

export const MIN_RATIO = 20;
export const MAX_RATIO = 80;

export const DEFAULT_SPLIT: SplitState = {
  enabled: false,
  ratio: 50,
  left: { tab: "bible" },
  right: { tab: "chat" },
};

// ---------- Helpers ----------

const clampRatio = (r: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));

function validTab(t: unknown, fallback: PaneTab): PaneTab {
  return TABS.includes(t as PaneTab) ? (t as PaneTab) : fallback;
}

function parse(raw: string | null): SplitState {
  if (!raw) return DEFAULT_SPLIT;
  try {
    const p = JSON.parse(raw);
    return {
      enabled: typeof p.enabled === "boolean" ? p.enabled : false,
      ratio: typeof p.ratio === "number" ? clampRatio(p.ratio) : 50,
      left: { tab: validTab(p.left?.tab, "bible") },
      right: { tab: validTab(p.right?.tab, "chat") },
    };
  } catch {
    return DEFAULT_SPLIT;
  }
}

// ---------- Snapshot mis en cache ----------
// Même référence tant que le contenu brut du localStorage ne change pas.
// Obligatoire pour useSyncExternalStore (qui compare par référence).

let cacheRaw: string | null | undefined = undefined;
let cacheState: SplitState = DEFAULT_SPLIT;

export function getSplitState(): SplitState {
  if (typeof window === "undefined") return DEFAULT_SPLIT;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheState = parse(raw);
  }
  return cacheState;
}

export function subscribeSplit(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // synchronise aussi les autres onglets
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// ---------- Seule porte d'écriture ----------

export function updateSplitState(
  updater: (s: SplitState) => SplitState
): SplitState {
  if (typeof window === "undefined") return DEFAULT_SPLIT;
  const next = updater(getSplitState());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  // Invalide le cache pour forcer la relecture au prochain getSplitState()
  cacheRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
  return next;
}

// Compatibilité (à éviter dans le nouveau code)
export function saveSplitState(state: SplitState): void {
  updateSplitState(() => state);
}

// ---------- Actions ----------

export function isSplitEnabled(): boolean {
  return getSplitState().enabled;
}

export function enableSplit(): void {
  updateSplitState((s) => ({
    ...s,
    enabled: true,
    // Évite le cas bible/bible à l'ouverture
    right: s.left.tab === s.right.tab ? { tab: "chat" } : s.right,
  }));
}

export function disableSplit(): void {
  updateSplitState((s) => ({ ...s, enabled: false }));
}

export function swapPanes(): void {
  updateSplitState((s) => ({ ...s, left: s.right, right: s.left }));
}

export function setPaneTab(side: "left" | "right", tab: PaneTab): void {
  updateSplitState((s) => ({ ...s, [side]: { tab } }));
}

export function setRatio(ratio: number): void {
  updateSplitState((s) => ({ ...s, ratio: clampRatio(ratio) }));
}

// ---------- Ouvrir un contenu dans « l'autre » panneau ----------
// Dans le split, naviguer avec <Link> ne change rien à l'écran (les panneaux
// remplacent la page). Ces helpers pilotent donc directement l'autre côté.

export function openInOtherPane(current: PaneTab, target: PaneTab): void {
  updateSplitState((s) => {
    const side = s.left.tab === current ? "right" : "left";
    return { ...s, [side]: { tab: target } };
  });
}

const PENDING_STORY_KEY = "liloba:pending-story";
export const OPEN_STORY_EVENT = "liloba:open-story";

/** Demande au panneau Histoires d'ouvrir une histoire (et l'affiche à côté). */
export function openStoryInOtherPane(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_STORY_KEY, slug);
  } catch {}
  openInOtherPane("selah", "stories");
  window.dispatchEvent(new Event(OPEN_STORY_EVENT));
}

/** Lit puis efface la demande d'ouverture d'histoire en attente. */
export function consumePendingStory(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const slug = sessionStorage.getItem(PENDING_STORY_KEY);
    if (slug) sessionStorage.removeItem(PENDING_STORY_KEY);
    return slug;
  } catch {
    return null;
  }
}

// ---------- Libellés ----------

export function getTabLabel(tab: PaneTab): string {
  switch (tab) {
    case "bible":
      return "Bible";
    case "chat":
      return "Apollos";
    case "search":
      return "Recherche";
    case "compare":
      return "Comparer";
    case "selah":
      return "Selah";
    case "stories":
      return "Histoires";
    default:
      return tab;
  }
}

// ---------- Taille de police du comparateur ----------

const COMPARE_FONT_KEY = "liloba:compare-font-size";

export type CompareFontSize = "sm" | "md" | "lg" | "xl";

export const COMPARE_FONT_SIZES: CompareFontSize[] = ["sm", "md", "lg", "xl"];

export function getCompareFontSize(): CompareFontSize {
  if (typeof window === "undefined") return "md";
  try {
    const raw = localStorage.getItem(COMPARE_FONT_KEY);
    if (raw === "sm" || raw === "md" || raw === "lg" || raw === "xl") {
      return raw;
    }
  } catch {}
  return "md";
}

export function setCompareFontSize(size: CompareFontSize): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPARE_FONT_KEY, size);
    window.dispatchEvent(new Event("liloba:compare-font-updated"));
  } catch {}
}

export function getCompareFontClass(size: CompareFontSize): string {
  switch (size) {
    case "sm":
      return "text-xs";
    case "md":
      return "text-sm";
    case "lg":
      return "text-base";
    case "xl":
      return "text-lg";
  }
}
