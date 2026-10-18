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

  // Redirection vers l'onboarding si l'utilisateur n'a pas choisi son âge
  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur-sm md:px-6">
                <div className="flex items-center gap-3">
          <Logo size={36} />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-[var(--color-primary)] md:text-base">
              {BRANDING.app.name}
            </h1>
            <p className="text-[10px] text-[var(--muted)] md:text-xs">
              {BRANDING.app.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OnlineBadge />
          <StreakBadge />
          <InstallPwaButton />
        </div>
      </header>

      {/* Contenu */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <h2 className="mb-2 text-center text-xl font-bold text-[var(--color-primary)] md:text-2xl">
            Que veux-tu faire ?
          </h2>
          <p className="mb-8 text-center text-sm text-[var(--muted)]">
            Choisis une option pour commencer
          </p>

          <div className="flex flex-col gap-4">
            {/* Carte Bible */}
            <Link
              href="/bible"
              className="group flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg"
            >
              <span className="text-4xl" aria-hidden="true">
                📖
              </span>
              <div className="flex-1">
                <div className="text-base font-bold text-[var(--color-primary)] md:text-lg">
                  Lire la Bible
                </div>
                <div className="text-xs text-[var(--muted)] md:text-sm">
                  66 livres · Louis Segond 1910
                </div>
              </div>
              <span className="text-xl text-[var(--muted)] transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Carte Apollos */}
            <Link
              href="/chat"
              className="group flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg"
            >
              <span className="text-4xl" aria-hidden="true">
                💬
              </span>
              <div className="flex-1">
                <div className="text-base font-bold text-[var(--color-accent)] md:text-lg">
                  Parler à {BRANDING.assistant.name}
                </div>
                <div className="text-xs text-[var(--muted)] md:text-sm">
                  Pose toutes tes questions bibliques
                </div>
              </div>
              <span className="text-xl text-[var(--muted)] transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <ApollosMaintenanceBanner />

            <DailyVerseCard />

            <HistoiresTeaser />

            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-xs font-medium text-green-700 dark:text-green-300">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
  <span>Bible disponible sans internet — 4.2 Mo déjà sur ton téléphone</span>
</div>
          </div>
        </div>
      </main>
    </div>
  );
}
