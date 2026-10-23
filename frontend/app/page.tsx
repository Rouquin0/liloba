"use client";

import Logo from "@/components/Logo";
import { useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import { isOnboarded } from "@/lib/preferences";
import { useIsMobile } from "@/hooks/useIsMobile";
import ApollosMaintenanceBanner from "@/components/ApollosMaintenanceBanner";
import StreakBadge from "@/components/StreakBadge";
import InstallPwaButton from "@/components/InstallPwaButton";
import HistoiresTeaser from "@/components/HistoiresTeaser";
import OnlineBadge from "@/components/OnlineBadge";
import MobileHome from "@/components/MobileHome";

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
    }
  }, [router]);

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) return;
    e.preventDefault();
    router.replace(href);
  };

  return (
    <div
      className="flex flex-1 flex-col bg-[var(--background)] md:bg-[#0a0a0f] md:h-dvh md:overflow-y-auto"
      onClickCapture={handleClickCapture}
    >
      {/* Accueil MOBILE */}
      <MobileHome />

      {/* Accueil DESKTOP (Glassmorphism) */}
      <div className="hidden flex-1 flex-col relative md:flex text-white min-h-screen">
        
        {/* AURORES BORÉALES EN FOND */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(252,211,77,0.12)_0%,transparent_60%)] blur-[80px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(192,132,252,0.15)_0%,transparent_60%)] blur-[80px]" />
        </div>

        {/* NAVBAR (Pilule flottante) */}
        <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] max-w-5xl h-[70px] z-50 flex items-center justify-between px-8 bg-[rgba(10,10,15,0.5)] backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <Logo size={36} />
            <div className="flex flex-col">
              <h1 className="text-[1.1rem] font-bold tracking-wide">{BRANDING.app.name}</h1>
              <p className="text-[0.7rem] text-gray-400">{BRANDING.app.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <OnlineBadge />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-white/5 backdrop-blur-md">
              <StreakBadge />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-white/5 backdrop-blur-md">
              <InstallPwaButton />
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="relative z-10 w-full max-w-5xl mx-auto px-10 pt-[180px] pb-20 flex flex-col items-center">
          
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold tracking-tight mb-3">Que veux-tu faire ?</h2>
            <p className="text-lg text-gray-400">Choisis une option pour commencer</p>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full mb-8">
            
            {/* CARTE BIBLE */}
            <Link
              href="/bible"
              className="group relative flex flex-col gap-6 p-10 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-[#fcd34d] shadow-[inset_0_0_20px_rgba(252,211,77,0.1)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[1.4rem] font-semibold mb-1 text-[#fcd34d]">Lire la Bible</h3>
                <p className="text-[0.95rem] text-gray-400">66 livres · Louis Segond 1910</p>
              </div>
              <div className="absolute bottom-10 right-10 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* CARTE APOLLOS */}
            <Link
              href="/chat"
              className="group relative flex flex-col gap-6 p-10 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-[#c084fc] shadow-[inset_0_0_20px_rgba(192,132,252,0.1)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[1.4rem] font-semibold mb-1 text-[#c084fc]">
                  Parler à {BRANDING.assistant.name}
                </h3>
                <p className="text-[0.95rem] text-gray-400">Pose toutes tes questions bibliques</p>
              </div>
              <div className="absolute bottom-10 right-10 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

          </div>

          {/* Bandeau Maintenance avec le style Glassmorphism */}
          <div className="w-full rounded-[20px] bg-[#fb923c]/5 backdrop-blur-md border border-[#fb923c]/15 p-6 flex items-center gap-5 transition-all hover:bg-[#fb923c]/10 hover:border-[#fb923c]/30">
            <div className="text-[#fb923c]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Apollos en maintenance</h4>
              <p className="text-sm text-gray-400">L'assistant IA est temporairement indisponible. La lecture de la Bible reste accessible en ligne.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
