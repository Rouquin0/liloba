"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getRandomVerse,
  referenceToUrl,
  type RandomVerse,
} from "@/lib/random-verse";
import {
  getStats,
  getStreak,
  formatDayVeryShort,
  formatDayShort,
  type StatsData,
  type StreakData,
} from "@/lib/stats";
import { getJournal } from "@/lib/journal";
import {
  getReadingTimeStats,
  formatMinutes,
  type ReadingTimeStats,
} from "@/lib/reading-time";

export default function StatsTab() {
  const [verse, setVerse] = useState<RandomVerse | null>(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [reading, setReading] = useState<ReadingTimeStats | null>(null);
  const [journalTotal, setJournalTotal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadVerse();
    loadStats();
    const reload = () => loadStats();
    window.addEventListener("liloba:journal-updated", reload);
    window.addEventListener("liloba:history-updated", reload);
    window.addEventListener("liloba:reading-time-updated", reload);
    return () => {
      window.removeEventListener("liloba:journal-updated", reload);
      window.removeEventListener("liloba:history-updated", reload);
      window.removeEventListener("liloba:reading-time-updated", reload);
    };
  }, []);

  const loadVerse = async () => {
    setIsLoadingVerse(true);
    const v = await getRandomVerse();
    setVerse(v);
    setIsLoadingVerse(false);
  };

  const loadStats = () => {
    setStats(getStats());
    setStreak(getStreak());
    setReading(getReadingTimeStats());
    try {
      // Total persistant (journal) : ne retombe jamais à 0 après 24 h
      // contrairement à l'historique des versets marqués.
      setJournalTotal(getJournal().length);
    } catch {
      setJournalTotal(0);
    }
  };

  const handleCopy = async () => {
    if (!verse) return;
    try {
      await navigator.clipboard.writeText(
        `${verse.reference} : ${verse.text}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!mounted) return null;

  const maxCount = stats
    ? Math.max(...stats.last7Days.map((d) => d.count), 1)
    : 1;

  return (
    <div className="flex flex-col gap-8">
      {/* ========================================== */}
      {/* VERSET DU MOMENT */}
      {/* ========================================== */}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Verset du moment</span>
        </h2>

        {isLoadingVerse ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-[var(--surface-hover)]" />
            <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-[var(--surface-hover)]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-hover)]" />
          </div>
        ) : verse ? (
          <>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <p
                className="mb-4 text-base leading-relaxed text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                « {verse.text} »
              </p>

              <Link
                href={referenceToUrl(verse)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] transition-opacity hover:opacity-80"
              >
                {verse.reference}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={loadVerse}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
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
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                Un autre
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-all hover:brightness-90"
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
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              Impossible de charger un verset. Vérifie ta connexion ou télécharge la Bible hors ligne.
            </p>
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
          </svg>
          <span>Statistiques</span>
        </h2>

        {!stats || !streak ? (
          <p className="py-8 text-center text-xs text-[var(--muted)]">
            Chargement…
          </p>
        ) : stats.totalCount === 0 && journalTotal === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center">
            <p className="mb-1 text-sm text-[var(--foreground)]">
              Aucune statistique pour l&apos;instant
            </p>
            <p className="mb-4 text-xs text-[var(--muted)]">
              Marque des versets (double-clic ou appui long) pour commencer à
              suivre ta progression.
            </p>
            <Link
              href="/bible"
              className="inline-block rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-90"
            >
              Lire la Bible
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* ===== Série ===== */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                    color: "var(--color-accent)",
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
                    className="h-5 w-5"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                      {streak.current}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      jour{streak.current > 1 ? "s" : ""} consécutif
                      {streak.current > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">
                    Meilleure série : {streak.longest} jour
                    {streak.longest > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== Compteurs ===== */}
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Aujourd'hui" value={stats.todayCount} />
              <StatBox label="Cette semaine" value={stats.weekCount} />
              <StatBox label="Ce mois" value={stats.monthCount} />
            </div>

            {/* ===== Temps de lecture réel (chrono mesuré) ===== */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Temps de lecture total
              </span>
              <span className="font-mono text-sm font-bold text-[var(--color-accent)]">
                {reading ? formatMinutes(reading.totalSeconds) : "0 min"}
              </span>
            </div>

            {/* ===== Graphique 7 jours ===== */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 text-xs font-semibold text-[var(--foreground)]">
                7 derniers jours
              </h3>

              <div className="flex items-end justify-between gap-2">
                {stats.last7Days.map((day, idx) => {
                  const height =
                    day.count === 0
                      ? 4
                      : Math.max(8, (day.count / maxCount) * 100);

                  return (
                    <div
                      key={idx}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-24 w-full items-end">
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${height}%`,
                            background:
                              day.count === 0
                                ? "var(--surface-hover)"
                                : "var(--color-accent)",
                          }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-[var(--muted)]">
                        {formatDayVeryShort(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-between text-[10px] text-[var(--muted)]">
                <span>{formatDayShort(stats.last7Days[0].date)}</span>
                <span>
                  {formatDayShort(
                    stats.last7Days[stats.last7Days.length - 1].date
                  )}
                </span>
              </div>
            </div>

            {/* ===== Top livres ===== */}
            {stats.topBooks.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="mb-3 text-xs font-semibold text-[var(--foreground)]">
                  Tes livres préférés
                </h3>

                <div className="flex flex-col">
                  {stats.topBooks.map((book, idx) => {
                    const percent =
                      (book.count / stats.topBooks[0].count) * 100;

                    return (
                      <div
                        key={book.bookName}
                        className={`flex items-center gap-3 py-2.5 ${
                          idx < stats.topBooks.length - 1
                            ? "border-b border-[var(--border)]"
                            : ""
                        }`}
                      >
                        <span className="w-5 shrink-0 font-mono text-[11px] font-bold text-[var(--muted)]">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-[var(--foreground)]">
                              {book.bookName}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                              {book.count} verset{book.count > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percent}%`,
                                background: "var(--color-accent)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== Total ===== */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <span className="text-xs text-[var(--muted)]">
                Total versets marqués
              </span>
              <span className="font-mono text-sm font-bold text-[var(--color-accent)]">
                {stats.totalCount}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// STAT BOX
// ============================================================

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-center">
      <div className="mb-1 text-lg font-bold text-[var(--foreground)]">
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}
