"use client";

import { useState, useEffect, useRef } from "react";
import {
  generateWordSearchPuzzle,
  checkSelection,
  updateWordSearchScore,
  WORD_SEARCH_THEMES,
  type WordSearchPuzzle,
} from "@/lib/games-wordsearch";

interface WordSearchProps {
  onBack: () => void;
}

export default function WordSearch({ onBack }: WordSearchProps) {
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{ row: number; col: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [themeId, setThemeId] = useState<string>("foi");

  const gridRef = useRef<HTMLDivElement>(null);

  const startNewGame = (theme: string) => {
    const newPuzzle = generateWordSearchPuzzle(theme, 10);
    setPuzzle(newPuzzle);
    setFoundWords([]);
    setSelection([]);
    setIsSelecting(false);
    setStartTime(Date.now());
    setElapsed(0);
    setIsFinished(false);
  };

  useEffect(() => {
    setMounted(true);
    startNewGame(themeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (isFinished || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Vérifie la fin
  useEffect(() => {
    if (
      puzzle &&
      foundWords.length === puzzle.words.length &&
      puzzle.words.length > 0
    ) {
      setIsFinished(true);
      updateWordSearchScore(elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords, puzzle]);

  if (!mounted || !puzzle) return null;

  // ============================================================
  // SÉLECTION TACTILE
  // ============================================================

  const getCellFromTouch = (
    e: React.TouchEvent | React.MouseEvent
  ): { row: number; col: number } | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / puzzle.size;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);

    if (row < 0 || row >= puzzle.size || col < 0 || col >= puzzle.size) {
      return null;
    }

    return { row, col };
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    const cell = getCellFromTouch(e);
    if (!cell) return;
    setIsSelecting(true);
    setSelection([cell]);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSelecting) return;
    const cell = getCellFromTouch(e);
    if (!cell) return;

    const last = selection[selection.length - 1];
    if (last && last.row === cell.row && last.col === cell.col) return;

    // Construit la sélection en ligne droite depuis le début
    const start = selection[0];
    const dr = Math.sign(cell.row - start.row);
    const dc = Math.sign(cell.col - start.col);

    const rowDiff = Math.abs(cell.row - start.row);
    const colDiff = Math.abs(cell.col - start.col);

    // Vérifie l'alignement
    const isAligned =
      (dr === 0 && dc !== 0) ||
      (dr !== 0 && dc === 0) ||
      (dr !== 0 && dc !== 0 && rowDiff === colDiff);

    if (!isAligned) return;

    const length = Math.max(rowDiff, colDiff) + 1;
    const newSelection: { row: number; col: number }[] = [];
    for (let i = 0; i < length; i++) {
      newSelection.push({
        row: start.row + i * dr,
        col: start.col + i * dc,
      });
    }
    setSelection(newSelection);
  };

  const handleEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const word = checkSelection(puzzle, selection);
    if (word && !foundWords.includes(word)) {
      setFoundWords((prev) => [...prev, word]);
    }
    setSelection([]);
  };

  // ============================================================
  // RENDU
  // ============================================================

  // Écran de fin
  if (isFinished) {
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
          Bravo !
        </h2>

        <p className="mb-6 text-sm text-[var(--muted)]">
          Tous les mots trouvés en {formatTime(elapsed)}
        </p>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={() => startNewGame(themeId)}
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

  // Jeu en cours
  const selectedSet = new Set(selection.map((s) => `${s.row}-${s.col}`));

  const foundCells = new Set<string>();
  for (const word of foundWords) {
    const wp = puzzle.wordPositions.find((p) => p.word === word);
    if (!wp) continue;
    const dr = Math.sign(wp.end.row - wp.start.row);
    const dc = Math.sign(wp.end.col - wp.start.col);
    const length = Math.max(
      Math.abs(wp.end.row - wp.start.row),
      Math.abs(wp.end.col - wp.start.col)
    ) + 1;
    for (let i = 0; i < length; i++) {
      foundCells.add(`${wp.start.row + i * dr}-${wp.start.col + i * dc}`);
    }
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
          {foundWords.length} / {puzzle.words.length}
        </span>

        <span className="font-mono text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Grille */}
      <div
        ref={gridRef}
        className="relative mx-auto touch-none select-none"
        style={{
          width: "100%",
          maxWidth: "min(100%, 380px)",
          aspectRatio: "1 / 1",
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div
          className="grid h-full w-full gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
            gridTemplateRows: `repeat(${puzzle.size}, 1fr)`,
          }}
        >
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r}-${c}`;
              const isSelected = selectedSet.has(key);
              const isFound = foundCells.has(key);

              let bg = "var(--surface)";
              let color = "var(--foreground)";
              let fontWeight = "400";

              if (isFound) {
                bg = "color-mix(in srgb, var(--color-accent) 25%, transparent)";
                color = "var(--color-accent)";
                fontWeight = "700";
              } else if (isSelected) {
                bg = "color-mix(in srgb, var(--color-accent) 40%, transparent)";
                color = "var(--color-accent)";
                fontWeight = "700";
              }

              return (
                <div
                  key={key}
                  className="flex items-center justify-center rounded-md text-[10px] font-mono transition-colors duration-100 sm:text-xs md:text-sm"
                  style={{
                    background: bg,
                    color,
                    fontWeight,
                    border: "1px solid var(--border)",
                  }}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Liste des mots */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Mots à trouver
        </p>
        <div className="flex flex-wrap gap-1.5">
          {puzzle.words.map((word) => {
            const isFound = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`rounded-md px-2 py-1 font-mono text-[10px] font-medium transition-all ${
                  isFound ? "line-through" : ""
                }`}
                style={{
                  background: isFound
                    ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                    : "var(--surface-hover)",
                  color: isFound
                    ? "var(--color-accent)"
                    : "var(--muted)",
                  opacity: isFound ? 0.7 : 1,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Sélecteur de thème */}
      <div className="flex flex-wrap gap-1.5">
        {WORD_SEARCH_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => {
              setThemeId(theme.id);
              startNewGame(theme.id);
            }}
            className={`rounded-full border px-3 py-1 text-[10px] font-medium transition-all ${
              themeId === theme.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
