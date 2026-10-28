"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Jeu : Mots mêlés
// ============================================================

export interface WordSearchPuzzle {
  id: string;
  size: number;
  grid: string[][];
  words: string[];
  // Position des mots dans la grille (pour valider la sélection)
  wordPositions: {
    word: string;
    start: { row: number; col: number };
    end: { row: number; col: number };
  }[];
}

// ============================================================
// BANQUE DE MOTS (par thème biblique)
// ============================================================

export const WORD_SEARCH_THEMES: {
  id: string;
  name: string;
  words: string[];
}[] = [
  {
    id: "foi",
    name: "La foi",
    words: ["FOI", "AMOUR", "GRACE", "ESPOIR", "PRIERE", "PAIX", "JOIE", "SALUT", "LUMIERE", "VIE"],
  },
  {
    id: "personnages",
    name: "Personnages",
    words: ["JESUS", "MARIE", "DAVID", "MOISE", "ABRAHAM", "NOE", "JOSUE", "PAUL", "PIERRE", "JEAN"],
  },
  {
    id: "lieux",
    name: "Lieux bibliques",
    words: ["JERUSALEM", "BETLEEM", "EGYPTE", "SINAI", "JORDAN", "GALILEE", "NAZARETH", "CANAAN", "BABEL", "EDEN"],
  },
  {
    id: "vertus",
    name: "Vertus chrétiennes",
    words: ["PATIENCE", "BONTE", "FIDELITE", "DOUCEUR", "SAGESSE", "COURAGE", "HUMILITE", "PARDON", "SERVICE", "OBEISSANCE"],
  },
  {
    id: "livres",
    name: "Livres de la Bible",
    words: ["GENESE", "EXODE", "PSAUMES", "PROVERBES", "ESAIE", "MATTHIEU", "MARC", "LUC", "JEAN", "APOCALYPSE"],
  },
];

// ============================================================
// GÉNÉRATION DE GRILLE
// ============================================================

const DIRECTIONS = [
  { dr: 0, dc: 1 },   // →
  { dr: 1, dc: 0 },   // ↓
  { dr: 1, dc: 1 },   // ↘
  { dr: -1, dc: 1 },  // ↗
];

function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const current = grid[r][c];
    if (current !== null && current !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): void {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    grid[r][c] = word[i];
  }
}

export function generateWordSearchPuzzle(
  themeId: string,
  size: number = 10
): WordSearchPuzzle {
  // Récupère les mots du thème
  const theme = WORD_SEARCH_THEMES.find((t) => t.id === themeId) ?? WORD_SEARCH_THEMES[0];

  // Filtre les mots qui tiennent dans la grille
  const words = theme.words
    .map((w) =>
      w
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    )
    .filter((w) => w.length <= size && w.length >= 2);

  // Grille vide
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const wordPositions: WordSearchPuzzle["wordPositions"] = [];

  // Place chaque mot
  for (const word of words) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxRow = dir.dr < 0 ? size - 1 : size - word.length * Math.abs(dir.dr) - (dir.dr > 0 ? 0 : 0);
      const maxCol = size - word.length * Math.abs(dir.dc) - (dir.dc > 0 ? 0 : 0);

      let row: number, col: number;

      if (dir.dr < 0) {
        row = Math.floor(Math.random() * (size - word.length + 1)) + word.length - 1;
      } else {
        row = Math.floor(Math.random() * Math.max(1, size - word.length + 1));
      }

      if (dir.dc > 0) {
        col = Math.floor(Math.random() * Math.max(1, size - word.length + 1));
      } else {
        col = Math.floor(Math.random() * size);
      }

      // Vérifie si ça tient
      const endRow = row + (word.length - 1) * dir.dr;
      const endCol = col + (word.length - 1) * dir.dc;

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      if (canPlaceWord(grid, word, row, col, dir.dr, dir.dc)) {
        placeWord(grid, word, row, col, dir.dr, dir.dc);
        wordPositions.push({
          word,
          start: { row, col },
          end: { row: endRow, col: endCol },
        });
        placed = true;
      }
    }
  }

  // Remplit les cases vides avec des lettres aléatoires
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const finalGrid: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? alphabet[Math.floor(Math.random() * 26)])
  );

  return {
    id: `ws-${Date.now()}`,
    size,
    grid: finalGrid,
    words: wordPositions.map((wp) => wp.word),
    wordPositions,
  };
}

// ============================================================
// VALIDATION
// ============================================================

export function checkSelection(
  puzzle: WordSearchPuzzle,
  selection: { row: number; col: number }[]
): string | null {
  if (selection.length < 2) return null;

  const start = selection[0];
  const end = selection[selection.length - 1];

  // Vérifie que la sélection est alignée (ligne, colonne ou diagonale)
  const dr = Math.sign(end.row - start.row);
  const dc = Math.sign(end.col - start.col);

  const rowDiff = Math.abs(end.row - start.row);
  const colDiff = Math.abs(end.col - start.col);

  // Doit être aligné : soit même ligne, même colonne, soit diagonale
  const isAligned =
    (dr === 0 && dc !== 0) ||
    (dr !== 0 && dc === 0) ||
    (dr !== 0 && dc !== 0 && rowDiff === colDiff);

  if (!isAligned) return null;

  // Vérifie que la sélection est continue
  const expectedLength =
    Math.max(rowDiff, colDiff) + 1;

  if (selection.length !== expectedLength) return null;

  // Construit le mot
  let word = "";
  for (let i = 0; i < selection.length; i++) {
    const r = start.row + i * dr;
    const c = start.col + i * dc;
    word += puzzle.grid[r][c];
  }

  // Cherche ce mot dans la liste (dans les 2 sens)
  const reversed = word.split("").reverse().join("");
  const found = puzzle.words.find(
    (w) => w === word || w === reversed
  );

  return found ?? null;
}

// ============================================================
// SCORES
// ============================================================

const SCORES_KEY = "liloba-games-scores";

export interface WordSearchScores {
  bestTime: number; // en secondes (0 = jamais joué)
  played: number;
}

export function getWordSearchScore(): WordSearchScores {
  if (typeof window === "undefined") {
    return { bestTime: 0, played: 0 };
  }
  try {
    const raw = localStorage.getItem(SCORES_KEY + "-wordsearch");
    if (!raw) return { bestTime: 0, played: 0 };
    return JSON.parse(raw);
  } catch {
    return { bestTime: 0, played: 0 };
  }
}

export function updateWordSearchScore(time: number): void {
  if (typeof window === "undefined") return;
  try {
    const current = getWordSearchScore();
    const updated: WordSearchScores = {
      bestTime:
        current.bestTime === 0
          ? time
          : Math.min(current.bestTime, time),
      played: current.played + 1,
    };
    localStorage.setItem(SCORES_KEY + "-wordsearch", JSON.stringify(updated));
  } catch {
    // ignore
  }
}
