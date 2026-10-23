"use client";

// ============================================================
// LILOBA — Accueil MOBILE (masqué dès md : l'ordinateur garde
// son accueil habituel dans app/page.tsx)
// ============================================================

import Link from "next/link";
import Logo from "@/components/Logo";
import StreakBadge from "@/components/StreakBadge";
import ApollosMaintenanceBanner from "@/components/ApollosMaintenanceBanner";
import HomeVerseCarousel from "@/components/HomeVerseCarousel";
import HomeStoriesStrip from "@/components/HomeStoriesStrip";
import HomeShortcutsNav from "@/components/HomeShortcutsNav";
import { BRANDING } from "@/lib/branding";

export default function MobileHome() {
  return (
    <div className="md:hidden">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-32 pt-[max(1rem,env(safe-area-inset-top,0px))]">
        {/* En-tête : marque + série + réglages */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={38} />
            <span className="truncate text-xl font-extrabold tracking-wide text-[var(--foreground)]">
              {BRANDING.app.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StreakBadge />
            <Link
              href="/settings"
              aria-label="Réglages"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors active:bg-[var(--surface-hover)]"
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
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Aujourd'hui : versets qui défilent + lecture */}
        <main className="flex flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            Aujourd&apos;hui
          </span>

          <HomeVerseCarousel />

          <Link
            href="/bible"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all active:scale-[0.99] active:bg-[var(--surface-hover)]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-accent)] text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-[var(--foreground)]">Lire la Bible</h3>
                <p className="truncate text-xs text-[var(--muted)]">66 livres · Louis Segond 1910</p>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 text-lg text-[var(--muted)] transition-transform group-active:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </main>

        {/* Les 20 histoires, qui défilent */}
        <HomeStoriesStrip />

        {/* Statut Apollos (même composant qu'avant : un seul endroit à modifier) */}
        <ApollosMaintenanceBanner compact />
      </div>

      <HomeShortcutsNav />
    </div>
  );
}
