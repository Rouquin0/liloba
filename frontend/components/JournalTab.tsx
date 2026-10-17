"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getJournal,
  deleteJournalEntry,
  clearJournal,
  formatJournalTime,
  formatJournalDate,
  getTodayKey,
  ACTION_META,
  type JournalEntry,
  type JournalActionType,
} from "@/lib/journal";

// ---------- Icônes SVG par type ----------

function ActionIcon({ type }: { type: JournalActionType }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
  };

  switch (type) {
    case "chapter_read":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "verse_marked":
      return (
        <svg {...props}>
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
    case "verse_highlighted":
      return (
        <svg {...props}>
          <path d="m9 11-6 6v3h9l3-3" />
          <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
      );
    case "verse_favorited":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "note_added":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
        </svg>
      );
    case "prayer_favorited":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "private_note_added":
      return (
        <svg {...props}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "verse_card_created":
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
  }
}

// ============================================================

export default function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<JournalActionType | "all">("all");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadJournal();

    const handleUpdate = () => loadJournal();
    window.addEventListener("liloba:journal-updated", handleUpdate);
    return () =>
      window.removeEventListener("liloba:journal-updated", handleUpdate);
  }, []);

  const loadJournal = () => {
    setEntries(getJournal());
  };

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    loadJournal();
  };

  const handleClearAll = () => {
    clearJournal();
    setEntries([]);
    setConfirmClear(false);
  };

  if (!mounted) return null;

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.type === filter);

  // Groupe par date
  const grouped: Record<string, JournalEntry[]> = {};
  for (const entry of filtered) {
    const dateKey = new Date(entry.createdAt).toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Liste des types présents
  const presentTypes = Array.from(new Set(entries.map((e) => e.type)));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          {entries.length} activité{entries.length > 1 ? "s" : ""}
        </p>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="text-[10px] text-[var(--muted)] transition-colors hover:text-red-500"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Filtres */}
      {presentTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
              filter === "all"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            Tout
          </button>
          {presentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                filter === type
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {ACTION_META[type].label}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
            Aucune activité
          </p>
          <p className="max-w-xs text-xs text-[var(--muted)]">
            Tes lectures, surlignages, notes et prières apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                <span>{formatJournalDate(new Date(dateKey).getTime())}</span>
              </h3>

              <div className="flex flex-col">
                {grouped[dateKey].map((entry) => {
                  const meta = ACTION_META[entry.type];
                  const content = (
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                          color: "var(--color-accent)",
                        }}
                      >
                        <ActionIcon type={entry.type} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--foreground)]">
                          {entry.label}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--muted)]">
                          <span>{meta.label}</span>
                          <span>·</span>
                          <span>{formatJournalTime(entry.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={entry.id}
                      className="group flex items-center gap-3 border-b border-[var(--border)] py-3"
                    >
                      {entry.href ? (
                        <Link
                          href={entry.href}
                          className="flex flex-1 items-center gap-3 min-w-0"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex flex-1 items-center gap-3 min-w-0">
                          {content}
                        </div>
                      )}

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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

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
                Effacer tout le journal ?
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
