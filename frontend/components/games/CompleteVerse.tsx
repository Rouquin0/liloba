"use client";

import { useState, useEffect } from "react";
import {
  VERSE_GAMES,
  updateScore,
  shuffleArray,
  type VerseGame,
} from "@/lib/games-verses";

interface CompleteVerseProps {
  onBack: () => void;
}

const TOTAL_QUESTIONS = 10;

export default function CompleteVerse({ onBack }: CompleteVerseProps) {
  const [questions, setQuestions] = useState<VerseGame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startNewGame = () => {
    const shuffled = [...VERSE_GAMES].sort(() => Math.random() - 0.5);
    const selectedVerses = shuffled.slice(0, TOTAL_QUESTIONS).map((v) => ({
      ...v,
      choices: shuffleArray(v.choices),
    }));
    setQuestions(selectedVerses);
    setCurrentIndex(0);
    setScore(0);
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
  const textWithBlank = current.fullText.replace(current.missingWord, "_____");

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    setShowResult(true);

    const isCorrect = choice === current.missingWord;
    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        setIsFinished(true);
        updateScore("completeVerse", newScore);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1500);
  };

  if (isFinished) {
    return (
      <GameResult
        score={score}
        total={TOTAL_QUESTIONS}
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

      {/* Verset */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
          {current.reference}
        </p>
        <p className="text-base leading-relaxed text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
          « {textWithBlank} »
        </p>
      </div>

      {/* Choix */}
      <div className="flex flex-col gap-2">
        {current.choices.map((choice, idx) => {
          const isCorrect = choice === current.missingWord;
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
    </div>
  );
}

// ============================================================
// RÉSULTAT (partagé avec GuessVerse)
// ============================================================

export function GameResult({
  score,
  total,
  onReplay,
  onBack,
}: {
  score: number;
  total: number;
  onReplay: () => void;
  onBack: () => void;
}) {
  const percent = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10" style={{ color: "var(--color-accent)" }}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      </div>

      <h2 className="mb-2 text-lg font-bold text-[var(--foreground)]">
        Partie terminée !
      </h2>

      <p className="mb-6 text-sm text-[var(--muted)]">
        {score} / {total} bonnes réponses
      </p>

      <div className="mb-6 w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, background: "var(--color-accent)" }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-xs text-[var(--muted)]">
          {percent}%
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-all hover:brightness-90"
        >
          Rejouer
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          Retour aux jeux
        </button>
      </div>
    </div>
  );
}
