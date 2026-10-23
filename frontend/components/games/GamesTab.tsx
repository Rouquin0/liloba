"use client";

import { useState, useEffect } from "react";
import CompleteVerse from "./CompleteVerse";
import GuessVerse from "./GuessVerse";
import WhoAmI from "./WhoAmI";
import WordSearch from "./WordSearch";
import Crossword from "./Crossword";
import MemoryMatch from "./MemoryMatch";
import VerseOrder from "./VerseOrder";
import { getBest } from "@/lib/games-mobile";
import { GameResult } from "./CompleteVerse";
import { getScores, type GameScores } from "@/lib/games-verses";

type GameView =
  | "menu"
  | "completeVerse"
  | "guessVerse"
  | "whoAmI"
  | "wordSearch"
  | "crossword"
  | "memory"
  | "ordre";

export default function GamesTab() {
  const [view, setView] = useState<GameView>("menu");
  const [scores, setScores] = useState<GameScores | null>(null);
  const [mobileBest, setMobileBest] = useState({ memory: 0, ordre: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScores(getScores());
    setMobileBest({ memory: getBest("memory"), ordre: getBest("ordre") });
  }, []);

  // Rafraîchit les scores quand on revient au menu
  useEffect(() => {
    if (view === "menu") {
      setScores(getScores());
      setMobileBest({ memory: getBest("memory"), ordre: getBest("ordre") });
    }
  }, [view]);

  if (!mounted) return null;

  if (view === "completeVerse") {
    return <CompleteVerse onBack={() => setView("menu")} />;
  }
    if (view === "whoAmI") {
    return <WhoAmI onBack={() => setView("menu")} />;
  }
    if (view === "wordSearch") {
    return <WordSearch onBack={() => setView("menu")} />;
  }
    if (view === "crossword") {
    return <Crossword onBack={() => setView("menu")} />;
  }
  if (view === "memory") {
    return <MemoryMatch onBack={() => setView("menu")} />;
  }
  if (view === "ordre") {
    return <VerseOrder onBack={() => setView("menu")} />;
  }

  if (view === "guessVerse") {
    return <GuessVerse onBack={() => setView("menu")} />;
  }

  // Menu principal
  return (
    <div className="flex flex-col">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        Choisis ton jeu
      </p>

      <div className="flex flex-col">
        {/* Complète le verset */}
        <button
          type="button"
          onClick={() => setView("completeVerse")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M9 9h6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Complète le verset
            </div>
            <div className="text-xs text-[var(--muted)]">
              Retrouve le mot manquant dans le verset
            </div>
          </div>
          {scores && scores.completeVerse.best > 0 && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              Record : {scores.completeVerse.best}/10
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Devine le verset */}
        <button
          type="button"
          onClick={() => setView("guessVerse")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Devine le verset
            </div>
            <div className="text-xs text-[var(--muted)]">
              Trouve le mot qui complète le verset
            </div>
          </div>
          {scores && scores.guessVerse.best > 0 && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              Record : {scores.guessVerse.best}/10
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

                {/* Qui suis-je ? */}
        <button
          type="button"
          onClick={() => setView("whoAmI")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Qui suis-je ?
            </div>
            <div className="text-xs text-[var(--muted)]">
              Devine le personnage biblique
            </div>
          </div>
          {scores && scores.whoAmI.best > 0 && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              Record : {scores.whoAmI.best}/30
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

                {/* Mots mêlés — mobile uniquement */}
        <button
          type="button"
          onClick={() => setView("wordSearch")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)] md:hidden"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Mots mêlés
            </div>
            <div className="text-xs text-[var(--muted)]">
              Retrouve les mots cachés dans la grille
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

                {/* Mémoire Éclair — mobile uniquement */}
        <button
          type="button"
          onClick={() => setView("memory")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)] md:hidden"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <span className="text-xl" aria-hidden="true">🧠</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Mémoire Éclair <span className="ml-1 rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--color-accent)]">📱 Mobile</span>
            </div>
            <div className="text-xs text-[var(--muted)]">
              Associe chaque référence à son mot-clé
            </div>
          </div>
          {mobileBest.memory > 0 && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              Record : {mobileBest.memory}
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

                {/* Ordre du Verset — mobile uniquement */}
        <button
          type="button"
          onClick={() => setView("ordre")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)] md:hidden"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <span className="text-xl" aria-hidden="true">🔢</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Ordre du Verset <span className="ml-1 rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--color-accent)]">📱 Mobile</span>
            </div>
            <div className="text-xs text-[var(--muted)]">
              Remets les mots dans le bon ordre
            </div>
          </div>
          {mobileBest.ordre > 0 && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              Record : {mobileBest.ordre}/8
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

                {/* Mots croisés — mobile uniquement */}
        <button
          type="button"
          onClick={() => setView("crossword")}
          className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)] md:hidden"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M3 3h7v7H3z" />
              <path d="M14 3h7v7h-7z" />
              <path d="M3 14h7v7H3z" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Mots croisés
            </div>
            <div className="text-xs text-[var(--muted)]">
              Résous la grille biblique
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
