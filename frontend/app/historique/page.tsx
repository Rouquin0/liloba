"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getHistory,
  clearHistory,
  deleteHistoryEntry,
  formatHistoryDate,
  cleanupExpiredHistory,
  type HistoryEntry,
} from "@/lib/history";
import AdvancedStats from "@/components/AdvancedStats";
import PrayersFavTab from "@/components/PrayersFavTab";
import SearchHistoryTab from "@/components/SearchHistoryTab";
import JournalTab from "@/components/JournalTab";

type Tab = "versets" | "stats" | "prieres" | "journal" | "recherches";

const TAB_LABELS: Record<Tab, string> = {
  versets: "Versets",
  stats: "Stats",
  prieres: "Prières",
  journal: "Journal",
  recherches: "Recherches",
};

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [tab, setTab] = useState<Tab>("versets");

  useEffect(() => {
    setMounted(true);
    cleanupExpiredHistory();
    setHistory(getHistory());
  }, []);

  const handleDelete = (reference: string) => {
    deleteHistoryEntry(reference);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  if (!mounted) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--background)]">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)]"
          style={{ borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[var(--background)]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-4 md:px-6">
          
          {/* BOUTON HAMBURGER */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("liloba:open-menu"))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            aria-label="Ouvrir le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <div className="flex flex-1 items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              }}
            >
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
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-[var(--foreground)]">
              <span className="md:hidden">{TAB_LABELS[tab]}</span>
              <span className="hidden md:inline">Historique</span>
            </h1>
          </div>

          {tab === "versets" && history.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-xs text-[var(--muted)] underline-offset-2 transition-colors hover:text-red-500 hover:underline"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Onglets */}
        <div className="flex border-t border-[var(--border)]">
          <TabButton
            active={tab === "versets"}
            onClick={() => setTab("versets")}
            icon="versets"
          >
            Versets
          </TabButton>
          <TabButton
            active={tab === "stats"}
            onClick={() => setTab("stats")}
            icon="stats"
          >
            Stats
          </TabButton>
          <TabButton
            active={tab === "prieres"}
            onClick={() => setTab("prieres")}
            icon="prieres"
          >
            Prières
          </TabButton>
          <TabButton
            active={tab === "journal"}
            onClick={() => setTab("journal")}
            icon="journal"
          >
            Journal
          </TabButton>
          <TabButton
            active={tab === "recherches"}
            onClick={() => setTab("recherches")}
            icon="recherches"
          >
            Recherches
          </TabButton>
        </div>
      </header>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
          {/* Onglet VERSETS */}
          {tab === "versets" && (
            <>
              {history.length === 0 ? (
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
                      <path d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                    Aucun verset marqué
                  </p>
                  <p className="mb-6 max-w-xs text-xs text-[var(--muted)]">
                    Double-clique (ou appuie longuement) sur un verset pour
                    l&apos;ajouter à ton historique. Il expirera après
                    24&nbsp;h.
                  </p>
                  <Link
                    href="/bible"
                    className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-90"
                  >
                    Lire la Bible
                  </Link>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {history.length} verset{history.length > 1 ? "s" : ""} ·
                    expire après 24&nbsp;h
                  </p>

                  <div className="flex flex-col">
                    {history.map((entry, idx) => (
                      <div
                        key={`${entry.reference}-${idx}`}
                        className="group border-b border-[var(--border)] py-4"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Link
                            href={`/bible/${entry.slug}/${entry.chapitre}#v${entry.verset}`}
                            className="flex items-center gap-2 min-w-0"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3.5 w-3.5"
                                style={{ color: "var(--color-accent)" }}
                              >
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                            </span>
                            <span className="truncate text-sm font-medium text-[var(--color-accent)]">
                              {entry.reference}
                            </span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(entry.reference)}
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

                        <p
                          className="mb-2 text-sm leading-relaxed text-[var(--foreground)]"
                          style={{ fontFamily: "var(--font-serif)" }}
                        >
                          « {entry.texte} »
                        </p>

                        <div className="font-mono text-[10px] text-[var(--muted)]">
                          {formatHistoryDate(entry.markedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Onglet STATS */}
          {tab === "stats" && <AdvancedStats />}

          {/* Onglet PRIÈRES */}
          {tab === "prieres" && <PrayersFavTab />}

          {/* Onglet JOURNAL */}
          {tab === "journal" && <JournalTab />}

          {/* Onglet RECHERCHES */}
          {tab === "recherches" && <SearchHistoryTab />}
        </div>
      </div>

      {/* MODALE CONFIRMATION */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-red-500"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">
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

// ============================================================
// BOUTON ONGLET
// ============================================================

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: "versets" | "stats" | "prieres" | "journal" | "recherches";
  children: React.ReactNode;
}) {
  const iconMap = {
    versets: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 md:h-4 md:w-4"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    stats: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 md:h-4 md:w-4"
      >
        <line x1="12" x2="12" y1="20" y2="10" />
        <line x1="18" x2="18" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="16" />
      </svg>
    ),
    prieres: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 md:h-4 md:w-4"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    journal: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 md:h-4 md:w-4"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </svg>
    ),
    recherches: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 md:h-4 md:w-4"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
        active
          ? "border-b-2 text-[var(--color-accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
      style={{
        borderBottomColor: active ? "var(--color-accent)" : "transparent",
      }}
      title={String(children)}
    >
      {iconMap[icon]}
      <span className="hidden md:inline">{children}</span>
    </button>
  );
}
