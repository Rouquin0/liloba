"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import ApollosMaintenanceBanner from "@/components/ApollosMaintenanceBanner";
import HomeVerseCarousel from "@/components/HomeVerseCarousel";
import HomeStoriesStrip from "@/components/HomeStoriesStrip";
import HomeShortcutsNav from "@/components/HomeShortcutsNav";
import { BRANDING } from "@/lib/branding";

export default function MobileHome() {
  return (
    <div className="md:hidden">
      {/* min-h-full et pb-32 pour éviter les sauts de scroll */}
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-5 pb-32 pt-[max(1rem,env(safe-area-inset-top,0px))]">
        
        {/* En-tête : TOUT EST CENTRÉ, engrenage supprimé, série simplifiée */}
        <header className="flex flex-col items-center justify-center gap-2 border-b border-[var(--border)]/50 pb-5">
          <div className="flex flex-col items-center gap-2">
            <Logo size={48} />
            <span className="text-2xl font-extrabold tracking-wide text-[var(--foreground)]">
              {BRANDING.app.name}
            </span>
          </div>
          
          {/* Série simplifiée : juste la flamme et le chiffre */}
          <div className="flex items-center justify-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-500 shadow-sm">
            <span aria-hidden="true">🔥</span>
            <span>6</span>
          </div>
        </header>

        {/* Aujourd'hui : versets qui défilent + lecture */}
        <main className="flex flex-col gap-4">
          <span className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
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

        {/* Statut Apollos */}
        <ApollosMaintenanceBanner compact />
      </div>

      <HomeShortcutsNav />
    </div>
  );
}
