"use client";

// ============================================================
// LILOBA — Jeu : Mots croisés (générateur automatique)
// ============================================================

export interface CrosswordCell {
  row: number;
  col: number;
  solution: string;
  number?: number;
  isBlack: boolean;
}

export interface CrosswordClue {
  number: number;
  direction: "H" | "V";
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  id: string;
  name: string;
  size: number;
  cells: CrosswordCell[][];
  clues: CrosswordClue[];
}

// ============================================================
// THÈMES
// ============================================================

interface WordEntry {
  word: string;
  clue: string;
}

interface Theme {
  id: string;
  name: string;
  words: WordEntry[];
}

export const CROSSWORD_THEMES: Theme[] = [
  {
    id: "commencement",
    name: "Le commencement",
    words: [
      { word: "ADAM", clue: "Premier homme créé par Dieu" },
      { word: "EVE", clue: "Première femme" },
      { word: "EDEN", clue: "Jardin où vivaient Adam et Ève" },
      { word: "NOE", clue: "Homme qui a construit l'arche" },
      { word: "ARCHE", clue: "Bateau de Noé" },
      { word: "CAIN", clue: "Fils d'Adam et Ève qui a tué son frère" },
      { word: "ABEL", clue: "Frère de Caïn, berger" },
      { word: "SETH", clue: "Troisième fils d'Adam et Ève" },
    ],
  },
  {
    id: "foi",
    name: "La foi",
    words: [
      { word: "FOI", clue: "Confiance en Dieu" },
      { word: "AMOUR", clue: "Sentiment d'affection profonde" },
      { word: "PAIX", clue: "Tranquillité de l'âme" },
      { word: "GRACE", clue: "Faveur imméritée de Dieu" },
      { word: "ESPOIR", clue: "Attente confiante" },
      { word: "PRIERE", clue: "Communication avec Dieu" },
      { word: "JOIE", clue: "Bonheur spirituel" },
      { word: "SALUT", clue: "Délivrance par la foi" },
    ],
  },
  {
    id: "jesus",
    name: "Jésus",
    words: [
      { word: "JESUS", clue: "Fils de Dieu" },
      { word: "MARIE", clue: "Mère de Jésus" },
      { word: "JOSEPH", clue: "Père adoptif de Jésus" },
      { word: "DAVID", clue: "Roi d'Israël, ancêtre de Jésus" },
      { word: "PIERRE", clue: "Apôtre qui a renié Jésus" },
      { word: "JEAN", clue: "Disciple que Jésus aimait" },
      { word: "CROIX", clue: "Instrument de la mort de Jésus" },
      { word: "BETLEEM", clue: "Ville de naissance de Jésus" },
    ],
  },
  {
    id: "psaumes",
    name: "Psaumes",
    words: [
      { word: "PSAUME", clue: "Chant religieux de la Bible" },
      { word: "DAVID", clue: "Auteur de nombreux Psaumes" },
      { word: "LOUANGE", clue: "Chant de gloire à Dieu" },
      { word: "BERGER", clue: "Métier de David" },
      { word: "ROI", clue: "Titre de David" },
      { word: "HARPE", clue: "Instrument de David" },
      { word: "ROCHER", clue: "Image de Dieu dans les Psaumes" },
      { word: "REFUGE", clue: "Abri spirituel" },
    ],
  },
  {
    id: "eglise",
    name: "L'Église",
    words: [
      { word: "ACTES", clue: "Livre des Actes des Apôtres" },
      { word: "PAUL", clue: "Apôtre des nations" },
      { word: "PIERRE", clue: "Rocher, apôtre" },
      { word: "JEAN", clue: "Disciple que Jésus aimait" },
      { word: "LUC", clue: "Évangéliste et médecin" },
      { word: "MARC", clue: "Évangéliste" },
      { word: "MATTHIEU", clue: "Ancien publicain, apôtre" },
      { word: "EPITRE", clue: "Lettre apostolique" },
    ],
  },
];

// ============================================================
// GÉNÉRATEUR
// ============================================================

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "H" | "V";
}

const MAX_ATTEMPTS_PER_WORD = 300;

function canPlaceWord(
  grid: (string | null)[][],
  size: number,
  word: string,
  row: number,
  col: number,
  direction: "H" | "V"
): boolean {
  const dr = direction === "V" ? 1 : 0;
  const dc = direction === "H" ? 1 : 0;

  const endRow = row + (word.length - 1) * dr;
  const endCol = col + (word.length - 1) * dc;

  // Vérifie que le mot tient dans la grille
  if (row < 0 || col < 0 || endRow >= size || endCol >= size) return false;

  let crossings = 0;

  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    const current = grid[r][c];

    if (current === null) {
      // Cellule vide → vérifie qu'elle n'est pas collée à d'autres mots
      // (sauf dans la direction perpendiculaire)
      if (direction === "H") {
        if (r > 0 && grid[r - 1][c] !== null) return false;
        if (r < size - 1 && grid[r + 1][c] !== null) return false;
      } else {
        if (c > 0 && grid[r][c - 1] !== null) return false;
        if (c < size - 1 && grid[r][c + 1] !== null) return false;
      }
    } else if (current === word[i]) {
      crossings++;
    } else {
      return false;
    }
  }

  // Vérifie les cases avant et après le mot (ne doit pas toucher un autre mot)
  // ⚠️ CORRECTION : les bornes étaient inversées
  if (direction === "H") {
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (endCol < size - 1 && grid[row][endCol + 1] !== null) return false;
  } else {
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (endRow < size - 1 && grid[endRow + 1][col] !== null) return false;
  }

  // Le mot doit avoir au moins 1 croisement (sauf le premier mot)
  return crossings >= 1;
}

function canPlaceFirstWord(
  grid: (string | null)[][],
  size: number,
  word: string,
  row: number,
  col: number,
  direction: "H" | "V"
): boolean {
  const dr = direction === "V" ? 1 : 0;
  const dc = direction === "H" ? 1 : 0;

  const endRow = row + (word.length - 1) * dr;
  const endCol = col + (word.length - 1) * dc;

  if (row < 0 || col < 0 || endRow >= size || endCol >= size) return false;

  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "H" | "V"
): void {
  const dr = direction === "V" ? 1 : 0;
  const dc = direction === "H" ? 1 : 0;

  for (let i = 0; i < word.length; i++) {
    grid[row + i * dr][col + i * dc] = word[i];
  }
}

export function generateCrossword(
  themeId: string,
  size: number = 11
): CrosswordPuzzle {
  const theme =
    CROSSWORD_THEMES.find((t) => t.id === themeId) ?? CROSSWORD_THEMES[0];

  const words = theme.words
    .map((w) => ({
      word: w.word
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
      clue: w.clue,
    }))
    .filter((w) => w.word.length <= size - 2 && w.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length);

  // Grille vide
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const placed: PlacedWord[] = [];

  // Place le 1ᵉʳ mot au centre
  const first = words[0];
  if (first) {
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor((size - first.word.length) / 2);
    if (
      canPlaceFirstWord(grid, size, first.word, startRow, startCol, "H")
    ) {
      placeWord(grid, first.word, startRow, startCol, "H");
      placed.push({
        word: first.word,
        clue: first.clue,
        row: startRow,
        col: startCol,
        direction: "H",
      });
    }
  }

  // Place les autres mots
  for (let w = 1; w < words.length; w++) {
    const { word, clue } = words[w];
    let placedThisWord = false;
    let attempts = 0;

    while (!placedThisWord && attempts < MAX_ATTEMPTS_PER_WORD) {
      attempts++;

      const target = placed[Math.floor(Math.random() * placed.length)];
      if (!target) break;

      const targetDir = target.direction;
      const newDir: "H" | "V" = targetDir === "H" ? "V" : "H";

      const commonLetters: {
        wordIdx: number;
        targetIdx: number;
      }[] = [];

      for (let wi = 0; wi < word.length; wi++) {
        for (let ti = 0; ti < target.word.length; ti++) {
          if (word[wi] === target.word[ti]) {
            commonLetters.push({ wordIdx: wi, targetIdx: ti });
          }
        }
      }

      if (commonLetters.length === 0) continue;

      const pick =
        commonLetters[Math.floor(Math.random() * commonLetters.length)];

      let newRow: number, newCol: number;
      if (newDir === "H") {
        newRow = target.row + (target.direction === "V" ? pick.targetIdx : 0);
        newCol =
          target.col +
          (target.direction === "H" ? pick.targetIdx : 0) -
          pick.wordIdx;
      } else {
        newRow =
          target.row +
          (target.direction === "V" ? pick.targetIdx : 0) -
          pick.wordIdx;
        newCol = target.col + (target.direction === "H" ? pick.targetIdx : 0);
      }

      if (canPlaceWord(grid, size, word, newRow, newCol, newDir)) {
        placeWord(grid, word, newRow, newCol, newDir);
        placed.push({
          word,
          clue,
          row: newRow,
          col: newCol,
          direction: newDir,
        });
        placedThisWord = true;
      }
    }
  }

  // Trouve les dimensions minimales (bounding box)
  let minRow = size,
    maxRow = 0,
    minCol = size,
    maxCol = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  const finalRows = maxRow - minRow + 1;
  const finalCols = maxCol - minCol + 1;
  const finalSize = Math.max(finalRows, finalCols);

  const compactGrid: (string | null)[][] = Array.from(
    { length: finalSize },
    () => Array(finalSize).fill(null)
  );

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      compactGrid[r - minRow][c - minCol] = grid[r][c];
    }
  }

  // Crée les cellules
  const cells: CrosswordCell[][] = compactGrid.map((row, r) =>
    row.map((cell, c) => ({
      row: r,
      col: c,
      solution: cell ?? "",
      isBlack: cell === null,
    }))
  );

  // Ajuste les positions
  const adjustedPlaced = placed.map((p) => ({
    ...p,
    row: p.row - minRow,
    col: p.col - minCol,
  }));

  // Trie pour numérotation
  const sortedWords = [...adjustedPlaced].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  const numberMap = new Map<string, number>();
  let currentNumber = 1;

  for (const p of sortedWords) {
    const key = `${p.row}-${p.col}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, currentNumber);
      cells[p.row][p.col].number = currentNumber;
      currentNumber++;
    } else {
      cells[p.row][p.col].number = numberMap.get(key);
    }
  }

  const clues: CrosswordClue[] = sortedWords.map((p) => ({
    number: numberMap.get(`${p.row}-${p.col}`) ?? 0,
    direction: p.direction,
    clue: p.clue,
    answer: p.word,
    row: p.row,
    col: p.col,
  }));

  clues.sort((a, b) => a.number - b.number);

  return {
    id: `cross-${themeId}-${Date.now()}`,
    name: theme.name,
    size: finalSize,
    cells,
    clues,
  };
}

// ============================================================
// SCORES
// ============================================================

const SCORES_KEY = "liloba-games-scores-crossword";

export interface CrosswordScore {
  bestTime: number;
  played: number;
}

export function getCrosswordScore(): CrosswordScore {
  if (typeof window === "undefined") return { bestTime: 0, played: 0 };
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return { bestTime: 0, played: 0 };
    return JSON.parse(raw);
  } catch {
    return { bestTime: 0, played: 0 };
  }
}

export function updateCrosswordScore(time: number): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCrosswordScore();
    const updated: CrosswordScore = {
      bestTime:
        current.bestTime === 0 ? time : Math.min(current.bestTime, time),
      played: current.played + 1,
    };
    localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
