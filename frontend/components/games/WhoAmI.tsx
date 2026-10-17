"use client";

import { useState, useEffect } from "react";
import {
  CHARACTER_GAMES,
  shuffleArray,
  updateScore,
  type CharacterGame,
} from "@/lib/games-characters";
import { GameResult } from "./CompleteVerse";

interface WhoAmIProps {
  onBack: () => void;
}

const TOTAL_QUESTIONS = 10;

export default function WhoAmI({ onBack }: WhoAmIProps) {
  const [questions, setQuestions] = useState<CharacterGame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startNewGame = () => {
    const shuffled = [...CHARACTER_GAMES].sort(() => Math.random() - 0.5);
    const selectedChars = shuffled.slice(0, TOTAL_QUESTIONS).map((c) => ({
      ...c,
      choices: shuffleArray(c.choices),
    }));
    setQuestions(selectedChars);
    setCurrentIndex(0);
    setScore(0);
    setHintsRevealed(1);
    setSelected(null);
    setShowResult(false);
    setIsFinished(false);
  };

  useEffect(() => {
    setMounted(true);
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || questions.length === 0) return null;

  const current = questions[currentIndex];

  const handleRevealHint = () => {
    if (hintsRevealed < 3) {
      setHintsRevealed((h) => h + 1);
    }
  };

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    setShowResult(true);

    const isCorrect = choice === current.name;
    // Points : 3 pts au 1er indice, 2 au 2e, 1 au 3e
    const points = isCorrect ? 4 - hintsRevealed : 0;
    const newScore = score + points;

    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        setIsFinished(true);
        updateScore("whoAmI", newScore);
      } else {
        setCurrentIndex((i) => i + 1);
        setHintsRevealed(1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1500);
  };

  if (isFinished) {
    return (
      <GameResult
        score={score}
        total={TOTAL_QUESTIONS * 3}
        onReplay={startNewGame}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Quitter
        </button>

        <span className="font-mono text-xs text-[var(--muted)]">
          {currentIndex + 1} / {TOTAL_QUESTIONS}
        </span>

        <span className="font-mono text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          {score} pts
        </span>
      </div>

      {/* Barre progression */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%`,
            background: "var(--color-accent)",
          }}
        />
      </div>

      {/* Indices */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Indices révélés ({hintsRevealed}/3)
        </p>

        <div className="flex flex-col gap-3">
          {current.hints.slice(0, hintsRevealed).map((hint, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                  color: "var(--color-accent)",
                }}
              >
                {idx + 1}
              </span>
              <p
                className="flex-1 text-sm leading-relaxed text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                « {hint} »
              </p>
            </div>
          ))}
        </div>

        {/* Bouton révéler indice */}
        {hintsRevealed < 3 && !selected && (
          <button
            type="button"
            onClick={handleRevealHint}
            className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--color-accent)] transition-colors hover:opacity-80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Voir l&apos;indice {hintsRevealed + 1}
            <span className="text-[var(--muted)]">
              ({4 - hintsRevealed - 1} pt{4 - hintsRevealed - 1 > 1 ? "s" : ""} en moins)
            </span>
          </button>
        )}
      </div>

      {/* Question */}
      <p className="text-center text-sm font-semibold text-[var(--foreground)]">
        Qui suis-je ?
      </p>

      {/* Choix */}
      <div className="flex flex-col gap-2">
        {current.choices.map((choice, idx) => {
          const isCorrect = choice === current.name;
          const isSelected = selected === choice;

          let className =
            "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-left transition-all";

          if (showResult) {
            if (isCorrect) {
              className += " border-green-500 bg-green-500/10 text-green-600";
            } else if (isSelected) {
              className += " border-red-500 bg-red-500/10 text-red-500";
            } else {
              className += " opacity-50";
            }
          } else {
            className += " hover:border-[var(--color-accent)] hover:bg-[var(--surface-hover)]";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={!!selected}
              className={className}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {/* Référence (après résultat) */}
      {showResult && (
        <p className="text-center font-mono text-xs text-[var(--color-accent)]">
          Référence : {current.reference}
        </p>
      )}
    </div>
  );
}
