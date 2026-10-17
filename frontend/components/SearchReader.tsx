"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSuggestions,
  searchInBible,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  highlightQuery,
  type SearchResult,
  type SearchSuggestion,
} from "@/lib/search";
import { getOfflineStatus } from "@/lib/offline-bible";
import { addSearchEntry } from "@/lib/search-history";
import { addJournalEntry } from "@/lib/journal";
import { findBookBySlug } from "@/lib/bible-utils";

// ============================================================
// SearchReader — Recherche réutilisable (pour panneau)
// ============================================================
// Différences avec la page /recherche :
//  - Pas de header (le panneau a ses onglets)
//  - Pas de navigation (les liens deviennent des boutons)
//  - Émet un événement quand on clique un résultat
//    → le panneau Bible peut s'y synchroniser
// ============================================================

interface SearchReaderProps {
  compact?: boolean;
}

export default function SearchReader({ compact = false }: SearchReaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hasOffline, setHasOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Init
  useEffect(() => {
    setMounted(true);
    setHistory(getSearchHistory());
    getOfflineStatus().then((s) => setHasOffline(s.isDownloaded));
  }, []);

  // Autocomplete
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setResults([]);
      return;
    }
    setSuggestions(getSuggestions(query));
  }, [query]);

  // Recherche full-text (debounce)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const ref = getSuggestions(query).find((s) => s.type === "reference");
      if (ref) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const found = await searchInBible(query, 50);
      setResults(found);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ============================================================
  // NAVIGATION INTERNE (ne touche pas l'URL)
  // ============================================================

  const goToVerse = (slug: string, chapitre: number, verset?: number) => {
    const bookName = findBookBySlug(slug);
    if (!bookName) return;

    // Émet l'événement → le panneau Bible s'y synchronise
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("liloba:bible-chapter-changed", {
          detail: { livre: bookName, chapitre, slug },
        })
      );
    }

    // Ajoute au journal + historique
    addToSearchHistory(query);
    window.dispatchEvent(new Event("liloba:search-history-updated"));
    setHistory(getSearchHistory());
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    const ref = getSuggestions(q).find((s) => s.type === "reference");
    if (ref) {
      addToSearchHistory(q);
      addSearchEntry(q, "reference");
      window.dispatchEvent(new Event("liloba:search-history-updated"));

      addJournalEntry("search", q, {
        detail: "Recherche de référence",
      });

      // Extrait slug/chapitre du href (ex: /bible/jean/3#v16)
      const match = ref.href.match(/\/bible\/([^/]+)\/(\d+)/);
      if (match) {
        goToVerse(match[1], parseInt(match[2], 10));
      }
      return;
    }

    if (results.length > 0) {
      addToSearchHistory(q);
      addSearchEntry(q, "keyword", results.length);
      window.dispatchEvent(new Event("liloba:search-history-updated"));

      addJournalEntry("search", q, {
        detail: `${results.length} résultat${results.length > 1 ? "s" : ""}`,
      });
      setHistory(getSearchHistory());
    }
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)]"
          style={{ borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

  const hasQuery = query.trim().length > 0;
  const showSuggestions = hasQuery && suggestions.length > 0;
  const showResults = hasQuery && results.length > 0;
  const showEmpty = hasQuery && !showSuggestions && !showResults && !isSearching;
  const showHistory = !hasQuery && history.length > 0;

  const pad = compact ? "px-3 py-3" : "px-4 py-4 md:px-6";
  const maxW = compact ? "max-w-full" : "max-w-2xl";

  return (
    <div className="flex h-full flex-col">
      {/* BARRE DE RECHERCHE */}
      <div className={`shrink-0 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm ${pad}`}>
        <form onSubmit={handleSubmit} className={`mx-auto flex items-center gap-2 ${maxW}`}>
          <div className="relative flex flex-1 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--muted)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mot-clé ou référence…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-9 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                aria-label="Effacer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto ${maxW} ${pad}`}>
          {/* Bandeau offline */}
          {!hasOffline && hasQuery && query.length >= 2 && results.length === 0 && !isSearching && !showSuggestions && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2.5 text-xs text-yellow-700 dark:text-yellow-400">
              <span>💡</span>
              <span>
                Télécharge la Bible hors ligne dans les paramètres pour chercher un mot-clé.
              </span>
            </div>
          )}

          {/* SUGGESTIONS */}
          {showSuggestions && (
            <div className="mb-4 flex flex-col gap-1">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Suggestions
              </p>
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.href}-${idx}`}
                  type="button"
                  onClick={() => {
                    addToSearchHistory(query);
                    addSearchEntry(
                      s.label,
                      s.type === "reference" ? "reference" : "keyword"
                    );
                    window.dispatchEvent(new Event("liloba:search-history-updated"));

                    const match = s.href.match(/\/bible\/([^/]+)\/(\d+)/);
                    if (match) {
                      goToVerse(match[1], parseInt(match[2], 10));
                    }
                  }}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}
                  >
                    {s.type === "reference" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" style={{ color: "var(--color-accent)" }}>
                        <path d="m9 11-6 6v3h9l3-3" />
                        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" style={{ color: "var(--color-accent)" }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--foreground)]">
                      {s.label}
                    </div>
                    <div className="truncate text-[10px] text-[var(--muted)]">
                      {s.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CHARGEMENT */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)]"
                style={{ borderTopColor: "var(--color-accent)" }}
              />
            </div>
          )}

          {/* RÉSULTATS */}
          {showResults && (
            <div className="flex flex-col gap-1">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </p>
              {results.map((r, idx) => (
                <button
                  key={`${r.slug}-${r.chapitre}-${r.verset}-${idx}`}
                  type="button"
                  onClick={() => goToVerse(r.slug, r.chapitre, r.verset)}
                  className="group flex flex-col gap-1 rounded-xl border border-transparent px-3 py-3 text-left transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
                >
                  <span className="text-xs font-semibold text-[var(--color-accent)]">
                    {r.reference}
                  </span>
                  <span className="text-sm leading-relaxed text-[var(--foreground)]">
                    {highlightQuery(r.texte, query).map((part, i) =>
                      part.highlight ? (
                        <mark
                          key={i}
                          style={{
                            background: "color-mix(in srgb, var(--color-accent) 25%, transparent)",
                            color: "var(--foreground)",
                            padding: "0 2px",
                            borderRadius: "3px",
                          }}
                        >
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* AUCUN RÉSULTAT */}
          {showEmpty && (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-hover)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--muted)]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                Aucun résultat
              </p>
              <p className="text-xs text-[var(--muted)]">
                Essaie un autre mot-clé ou une référence
              </p>
            </div>
          )}

          {/* HISTORIQUE */}
          {showHistory && (
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center justify-between px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Recherches récentes
                </p>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-[var(--muted)] transition-colors hover:text-red-500"
                >
                  Effacer
                </button>
              </div>
              {history.map((h, idx) => (
                <button
                  key={`${h}-${idx}`}
                  type="button"
                  onClick={() => handleHistoryClick(h)}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span className="flex-1 truncate text-sm text-[var(--foreground)]">
                    {h}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ÉTAT VIDE */}
          {!hasQuery && history.length === 0 && (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-hover)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--muted)]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                Que cherches-tu ?
              </p>
              <p className="mb-6 max-w-xs text-xs text-[var(--muted)]">
                Tape un mot-clé ou une référence biblique
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Jean 3:16", "Psaumes 23", "amour", "foi"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
