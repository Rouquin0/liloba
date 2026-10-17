"use client";

import { useState, useEffect, useRef } from "react";
import {
  CROSSWORD_THEMES,
  generateCrossword,
  updateCrosswordScore,
  type CrosswordPuzzle,
} from "@/lib/games-crossword";

interface CrosswordProps {
  onBack: () => void;
}

export default function Crossword({ onBack }: CrosswordProps) {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedClueKey, setSelectedClueKey] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [themeId, setThemeId] = useState("commencement");

  const inputRef = useRef<HTMLInputElement>(null);

    const startNewGame = (theme: string) => {
    const newPuzzle = generateCrossword(theme, 11);
    setPuzzle(newPuzzle);
    setUserGrid(
      Array.from({ length: newPuzzle.size }, () =>
        Array(newPuzzle.size).fill("")
      )
    );
    setSelectedCell(null);
    setSelectedClueKey(null);
    setIsFinished(false);
    setStartTime(Date.now());
    setElapsed(0);
  };

  useEffect(() => {
    setMounted(true);
    startNewGame("commencement");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFinished || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  useEffect(() => {
    if (!puzzle || userGrid.length === 0) return;
    let complete = true;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const cell = puzzle.cells[r][c];
        if (cell.isBlack) continue;
        if ((userGrid[r][c] ?? "").toUpperCase() !== cell.solution) {
          complete = false;
          break;
        }
      }
      if (!complete) break;
    }
    if (complete && startTime > 0) {
      setIsFinished(true);
      updateCrosswordScore(elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userGrid, puzzle]);

  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  if (!mounted || !puzzle) return null;

  const handleCellClick = (row: number, col: number) => {
    const cell = puzzle.cells[row][col];
    if (cell.isBlack) return;
    setSelectedCell({ row, col });
    setSelectedClueKey(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return;
    const letter = e.target.value.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;

    setUserGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[selectedCell.row][selectedCell.col] = letter;
      return next;
    });

    // Passe à la case suivante (dans la direction du mot sélectionné ou H par défaut)
    const { row, col } = selectedCell;

    // Cherche la direction : H ou V
    let dir: "H" | "V" = "H";
    if (selectedClueKey) {
      if (selectedClueKey.endsWith("V")) dir = "V";
    }

    if (dir === "H") {
      for (let c = col + 1; c < puzzle.size; c++) {
        if (!puzzle.cells[row][c].isBlack) {
          setSelectedCell({ row, col: c });
          return;
        }
      }
    } else {
      for (let r = row + 1; r < puzzle.size; r++) {
        if (!puzzle.cells[r][col].isBlack) {
          setSelectedCell({ row: r, col });
          return;
        }
      }
    }
  };

  const handleClueClick = (clue: string, row: number, col: number) => {
    setSelectedClueKey(clue);
    setSelectedCell({ row, col });
  };

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
          Grille résolue en {formatTime(elapsed)}
        </p>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={() => startNewGame(themeId)}
            className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-all hover:brightness-90"
          >
            Nouvelle grille
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
  return (
    <div className="flex flex-col gap-3">
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
          {puzzle.name}
        </span>

        <span className="font-mono text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Input caché */}
      <input
        ref={inputRef}
        type="text"
        value=""
        onChange={handleInput}
        className="absolute h-0 w-0 opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
      />

      {/* Grille */}
      <div
        className="mx-auto grid w-full gap-0.5"
        style={{
          maxWidth: "min(100%, 400px)",
          gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
        }}
      >
        {puzzle.cells.map((row, r) =>
          row.map((cell, c) => {
            const isSelected =
              selectedCell?.row === r && selectedCell?.col === c;
            const letter = userGrid[r]?.[c] ?? "";

            if (cell.isBlack) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square rounded-sm"
                  style={{ background: "var(--foreground)" }}
                />
              );
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className="relative flex aspect-square items-center justify-center rounded-sm border text-xs font-bold transition-colors sm:text-sm"
                style={{
                  background: isSelected
                    ? "color-mix(in srgb, var(--color-accent) 25%, var(--surface))"
                    : "var(--surface)",
                  borderColor: isSelected
                    ? "var(--color-accent)"
                    : "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {cell.number && (
                  <span
                    className="absolute top-0.5 left-0.5 font-mono text-[6px] leading-none sm:text-[7px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {cell.number}
                  </span>
                )}
                <span className="mt-0.5">{letter}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Indices */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Horizontal
          </p>
          <div className="flex flex-col gap-1">
            {puzzle.clues
              .filter((c) => c.direction === "H")
              .map((c) => {
                const key = `${c.number} H`;
                const isSelected = selectedClueKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleClueClick(key, c.row, c.col)}
                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors ${
                      isSelected
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <span className="font-mono font-bold">{c.number}.</span>
                    <span className="flex-1 text-[var(--muted)]">{c.clue}</span>
                    <span className="font-mono text-[var(--muted)]">
                      ({c.answer.length})
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Vertical
          </p>
          <div className="flex flex-col gap-1">
            {puzzle.clues
              .filter((c) => c.direction === "V")
              .map((c) => {
                const key = `${c.number} V`;
                const isSelected = selectedClueKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleClueClick(key, c.row, c.col)}
                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors ${
                      isSelected
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <span className="font-mono font-bold">{c.number}.</span>
                    <span className="flex-1 text-[var(--muted)]">{c.clue}</span>
                    <span className="font-mono text-[var(--muted)]">
                      ({c.answer.length})
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Thèmes */}
      <div className="flex flex-wrap gap-1.5">
        {CROSSWORD_THEMES.map((theme) => (
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
