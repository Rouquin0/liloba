"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSearchHistory,
  deleteSearchEntry,
  clearSearchHistory,
  formatSearchDate,
  type SearchHistoryEntry,
} from "@/lib/search-history";
import { detectReference } from "@/lib/search";

export default function SearchHistoryTab() {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadHistory();
  }, []);

  const loadHistory = () => {
    setEntries(getSearchHistory());
  };

  const handleDelete = (id: string) => {
    deleteSearchEntry(id);
    loadHistory();
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  const handleEntryClick = (entry: SearchHistoryEntry) => {
    // Si c'est une référence directe → va au verset
    if (entry.type === "reference") {
      const ref = detectReference(entry.query);
      if (ref) {
        router.push(ref.href);
        return;
      }
    }
    // Sinon → relance la recherche
    router.push(`/recherche?q=${encodeURIComponent(entry.query)}`);
  };

  if (!mounted) return null;

  if (entries.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-hover)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-[var(--muted)]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
          Aucune recherche
        </p>
        <p className="max-w-xs text-xs text-[var(--muted)]">
          Tes recherches bibliques apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          {entries.length} recherche{entries.length > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="text-[10px] text-[var(--muted)] transition-colors hover:text-red-500"
        >
          Tout effacer
        </button>
      </div>

      <div className="flex flex-col">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 border-b border-[var(--border)] py-4"
          >
            <button
              type="button"
              onClick={() => handleEntryClick(entry)}
              className="flex flex-1 items-center gap-3 min-w-0 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                {entry.type === "reference" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-[var(--foreground)]">
                  {entry.query}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
                  <span>
                    {entry.type === "reference" ? "Référence" : "Mot-clé"}
                  </span>
                  {entry.resultCount !== undefined && (
                    <>
                      <span>·</span>
                      <span>
                        {entry.resultCount} résultat
                        {entry.resultCount > 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>{formatSearchDate(entry.searchedAt)}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
              aria-label="Supprimer"
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
          </div>
        ))}
      </div>

      {/* Modale de confirmation */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="mb-2 text-base font-semibold text-[var(--foreground)]">
                Effacer tout l&apos;historique ?
              </h3>
              <p className="mb-4 text-xs text-[var(--muted)]">
                Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90"
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
