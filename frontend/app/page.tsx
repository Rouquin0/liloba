"use client";

import Logo from "@/components/Logo";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import { isOnboarded } from "@/lib/preferences";
import ApollosMaintenanceBanner from "@/components/ApollosMaintenanceBanner";
import DailyVerseCard from "@/components/DailyVerseCard";
import StreakBadge from "@/components/StreakBadge";
import InstallPwaButton from "@/components/InstallPwaButton";
import HistoiresTeaser from "@/components/HistoiresTeaser";
import OnlineBadge from "@/components/OnlineBadge";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Header : Centré sur mobile, aligné sur toute la largeur sur desktop */}
      <header className="flex flex-col items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-4 backdrop-blur-sm md:flex-row md:px-10 md:py-6">
        <div className="flex items-center gap-4">
          <Logo size={48} />
          <div className="text-center md:text-left">
            <h1 className="text-lg font-bold text-[var(--color-primary)] md:text-2xl">
              {BRANDING.app.name}
            </h1>
            <p className="text-xs text-[var(--muted)] md:text-sm">
              {BRANDING.app.tagline}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-0 md:gap-3">
          <OnlineBadge />
          <StreakBadge />
          <InstallPwaButton />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex flex-1 flex-col items-center px-4 pt-6 pb-24 md:px-10 md:pt-12">
        <div className="w-full max-w-5xl">
          <div className="mb-6 text-center md:mb-10 md:text-left">
            <h2 className="text-xl font-bold text-[var(--color-primary)] md:text-3xl">
              Que veux-tu faire ?
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)] md:text-base">
              Choisis une option pour commencer
            </p>
          </div>

          {/* Grille : 1 colonne sur mobile, 2 colonnes (2/3 - 1/3) sur desktop */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            
            {/* Colonne de gauche : Actions principales (prend 2 colonnes sur 3) */}
            <div className="flex flex-col gap-6 md:col-span-2">
              {/* Carte Bible */}
              <Link
                href="/bible"
                className="group flex items-center gap-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all hover:border-[var(--color-primary)] active:scale-[0.99] md:p-8"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] md:h-20 md:w-20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 md:h-10 md:w-10">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[var(--color-primary)] md:text-2xl">
                    Lire la Bible
                  </div>
                  <div className="text-sm text-[var(--muted)] md:text-base">
                    66 livres · Louis Segond 1910
                  </div>
                </div>
                <span className="text-2xl text-[var(--muted)] transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>

              {/* Carte Apollos */}
              <Link
                href="/chat"
                className="group flex items-center gap-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all hover:border-[var(--color-accent)] active:scale-[0.99] md:p-8"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] md:h-20 md:w-20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 md:h-10 md:w-10">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[var(--color-accent)] md:text-2xl">
                    Parler à {BRANDING.assistant.name}
                  </div>
                  <div className="text-sm text-[var(--muted)] md:text-base">
                    Pose toutes tes questions bibliques
                  </div>
                </div>
                <span className="text-2xl text-[var(--muted)] transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>

              <ApollosMaintenanceBanner />
            </div>

            {/* Colonne de droite : Modules (prend 1 colonne sur 3) */}
            <div className="flex flex-col gap-6">
              <DailyVerseCard />
              <HistoiresTeaser />
              
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-xs font-medium text-green-700 dark:text-green-300 md:text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span className="text-center">Bible disponible sans internet</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
