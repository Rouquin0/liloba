"use client";

// ============================================================
// LILOBA — Verset aléatoire
// ============================================================

import { getOfflineBible } from "./offline-bible";
import { fetchChapitre } from "./api";

export interface RandomVerse {
  reference: string;
  text: string;
  livre: string;
  chapitre: number;
  verset: number;
  slug: string;
}

// Livres populaires pour piocher un verset sympa
const POPULAR_BOOKS = [
  "Psaumes",
  "Proverbes",
  "Jean",
  "Matthieu",
  "Romains",
  "Philippiens",
  "Ésaïe",
  "1 Corinthiens",
  "Jacques",
  "1 Jean",
  "Hébreux",
  "Éphésiens",
  "Colossiens",
  "Galates",
  "2 Timothée",
];

function slugify(livre: string): string {
  return livre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getRandomVerse(): Promise<RandomVerse | null> {
  try {
    const book =
      POPULAR_BOOKS[Math.floor(Math.random() * POPULAR_BOOKS.length)];

    // Essaie offline d'abord
    const offline = await getOfflineBible();

    if (offline && offline[book]) {
      const chapters = Object.keys(offline[book]);
      const chapitreNum = parseInt(
        chapters[Math.floor(Math.random() * chapters.length)],
        10
      );
      const chapitreData = offline[book][String(chapitreNum)];

      if (chapitreData) {
        const versets = Object.entries(chapitreData);
        if (versets.length > 0) {
          const [versetNum, texte] = versets[
            Math.floor(Math.random() * versets.length)
          ];
          return {
            reference: `${book} ${chapitreNum}:${versetNum}`,
            text: texte.replace(/<CM>/g, "").trim(),
            livre: book,
            chapitre: chapitreNum,
            verset: parseInt(versetNum, 10),
            slug: slugify(book),
          };
        }
      }
    }

    // Sinon, essaie l'API
    const chapitres = [1, 3, 8, 15, 23, 46, 100];
    const chapitreNum =
      chapitres[Math.floor(Math.random() * chapitres.length)];

    try {
      const data = await fetchChapitre(book, chapitreNum);
      const versets = Object.entries(data.versets);

      if (versets.length > 0) {
        const [versetNum, texte] =
          versets[Math.floor(Math.random() * versets.length)];
        return {
          reference: `${book} ${chapitreNum}:${versetNum}`,
          text: texte.replace(/<CM>/g, "").trim(),
          livre: book,
          chapitre: chapitreNum,
          verset: parseInt(versetNum, 10),
          slug: slugify(book),
        };
      }
    } catch {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}

export function referenceToUrl(verse: RandomVerse): string {
  return `/bible/${verse.slug}/${verse.chapitre}#v${verse.verset}`;
}
