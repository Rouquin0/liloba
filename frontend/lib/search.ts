"use client";

// ============================================================
// LILOBA — Recherche biblique (référence + full-text)
// ============================================================

import {
  parseReference,
  slugify,
  ANCIEN_TESTAMENT,
  NOUVEAU_TESTAMENT,
  type ParsedReference,
} from "./bible-utils";
import { getOfflineBible, getOfflineLivres } from "./offline-bible";

// ============================================================
// TYPES
// ============================================================

export interface SearchResult {
  reference: string;       // "Jean 3:16"
  livre: string;           // "Jean"
  chapitre: number;
  verset: number;
  texte: string;           // Texte du verset
  slug: string;            // "jean"
}

export interface SearchSuggestion {
  type: "reference" | "book";
  label: string;           // "Jean 3:16" ou "Jean"
  href: string;            // "/bible/jean/3" ou "/bible/jean"
  description?: string;    // "Aller au verset" ou "21 chapitres"
}

// ============================================================
// DÉTECTION DE RÉFÉRENCE
// ============================================================

/**
 * Détecte si la requête est une référence biblique valide.
 * Utilise `parseReference` de bible-utils, mais vérifie que
 * le livre existe vraiment.
 */
export function detectReference(
  query: string
): { parsed: ParsedReference; bookName: string; href: string } | null {
  const parsed = parseReference(query);
  if (!parsed) return null;

  // Vérifie que le livre existe
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];
  const bookName = allBooks.find((b) => slugify(b) === parsed.slug);
  if (!bookName) return null;

  // Construit l'URL
  let href = `/bible/${parsed.slug}/${parsed.chapitre}`;
  if (parsed.verset) {
    href += `#v${parsed.verset}`;
  }

  return {
    parsed: { ...parsed, livre: bookName },
    bookName,
    href,
  };
}

// ============================================================
// SUGGESTIONS EN TEMPS RÉEL
// ============================================================

export function getSuggestions(query: string): SearchSuggestion[] {
  const q = query.trim();
  if (!q || q.length < 1) return [];

  const suggestions: SearchSuggestion[] = [];
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];

  // 1. Détection de référence complète ("Jean 3:16")
  const ref = detectReference(q);
  if (ref) {
    suggestions.push({
      type: "reference",
      label: `${ref.bookName} ${ref.parsed.chapitre}${
        ref.parsed.verset ? `:${ref.parsed.verset}` : ""
      }`,
      href: ref.href,
      description: "Aller au chapitre",
    });
  }

  // 2. Suggestion de livre (match partiel sur le début)
  const normalized = q.toLowerCase();
  const matchingBooks = allBooks
    .filter((b) => {
      const slug = slugify(b);
      return (
        slug.startsWith(normalized) ||
        b.toLowerCase().startsWith(normalized)
      );
    })
    .slice(0, 3);

  for (const book of matchingBooks) {
    suggestions.push({
      type: "book",
      label: book,
      href: `/bible/${slugify(book)}`,
      description: "Livre",
    });
  }

  return suggestions.slice(0, 5);
}

// ============================================================
// RECHERCHE FULL-TEXT
// ============================================================

/**
 * Recherche un mot-clé dans toute la Bible.
 * - Priorité offline (rapide)
 * - Retourne les N premiers résultats
 */
export async function searchInBible(
  query: string,
  maxResults = 50
): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];

  // 1. Essaie la Bible offline d'abord
  const offlineBible = await getOfflineBible();

  if (offlineBible) {
    for (const [bookName, chapters] of Object.entries(offlineBible)) {
      for (const [chapitreStr, versets] of Object.entries(chapters)) {
        const chapitre = parseInt(chapitreStr, 10);
        for (const [versetStr, texte] of Object.entries(versets)) {
          const verset = parseInt(versetStr, 10);
          const cleanText = texte.replace(/<CM>/g, "").toLowerCase();

          if (cleanText.includes(q)) {
            results.push({
              reference: `${bookName} ${chapitre}:${verset}`,
              livre: bookName,
              chapitre,
              verset,
              texte: texte.replace(/<CM>/g, "").trim(),
              slug: slugify(bookName),
            });

            if (results.length >= maxResults) return results;
          }
        }
      }
    }
    return results;
  }

  // 2. Pas de Bible offline → on ne peut pas chercher en full-text
  // (on renvoie vide, l'utilisateur verra un message)
  return [];
}

// ============================================================
// HISTORIQUE DES RECHERCHES
// ============================================================

const SEARCH_HISTORY_KEY = "liloba-search-history";
const MAX_SEARCH_HISTORY = 10;

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  const q = query.trim();
  if (!q) return;
  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => h !== q);
    const updated = [q, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // ignore
  }
}

// ============================================================
// HIGHLIGHT DU MOT-CHERCHÉ
// ============================================================

/**
 * Découpe un texte en segments pour surligner le mot cherché.
 * Renvoie un tableau de { text, highlight }.
 */
export function highlightQuery(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, highlight: false }];

  const regex = new RegExp(`(${escapeRegex(q)})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({
      text: part,
      highlight: regex.test(part),
    }));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
