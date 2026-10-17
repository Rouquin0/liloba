// ============================================================
// LILOBA — Utilitaires Bible
// ============================================================

// Liste canonique des 66 livres dans l'ordre
export const ANCIEN_TESTAMENT = [
  "Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome",
  "Josué", "Juges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques",
  "Esdras", "Néhémie", "Esther", "Job", "Psaumes",
  "Proverbes", "Ecclésiaste", "Cantique des Cantiques",
  "Ésaïe", "Jérémie", "Lamentations", "Ézéchiel", "Daniel",
  "Osée", "Joël", "Amos", "Abdias", "Jonas", "Michée",
  "Nahum", "Habacuc", "Sophonie", "Aggée", "Zacharie", "Malachie",
];

export const NOUVEAU_TESTAMENT = [
  "Matthieu", "Marc", "Luc", "Jean", "Actes",
  "Romains", "1 Corinthiens", "2 Corinthiens", "Galates",
  "Éphésiens", "Philippiens", "Colossiens",
  "1 Thessaloniciens", "2 Thessaloniciens",
  "1 Timothée", "2 Timothée", "Tite", "Philémon",
  "Hébreux", "Jacques", "1 Pierre", "2 Pierre",
  "1 Jean", "2 Jean", "3 Jean", "Jude", "Apocalypse",
];

// Slug pour les URLs (ex: "Genèse" → "genese")
export function slugify(livre: string): string {
  return livre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Trouve le nom canonique d'un livre depuis son slug
export function findBookBySlug(slug: string): string | null {
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];
  for (const book of allBooks) {
    if (slugify(book) === slug.toLowerCase()) {
      return book;
    }
  }
  return null;
}

// Trouve le slug depuis le nom canonique d'un livre
export function getSlugByBookName(name: string): string | null {
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];
  for (const book of allBooks) {
    if (book === name) {
      return slugify(book);
    }
  }
  return null;
}

// Test : est-ce un livre de l'Ancien Testament ?
export function isOldTestament(livre: string): boolean {
  return ANCIEN_TESTAMENT.includes(livre);
}

// Test : est-ce un livre du Nouveau Testament ?
export function isNewTestament(livre: string): boolean {
  return NOUVEAU_TESTAMENT.includes(livre);
}

// Parse une référence du type "Jean 3:16" ou "1 Jean 5:5-7"
export interface ParsedReference {
  livre: string;
  chapitre: number;
  verset?: number;
  versetFin?: number;
  slug: string;
}

export function parseReference(ref: string): ParsedReference | null {
  // Nettoyage : retire les espaces, gère "1 Jean 5:5"
  const cleaned = ref.trim().replace(/\s+/g, " ");

  // Regex : [Livre] [chapitre]:[verset](-[versetFin])?
  const match = cleaned.match(
    /^(\d?\s?[A-Za-zÀ-ÿ\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/
  );

  if (!match) return null;

  const livre = match[1].trim();
  const chapitre = parseInt(match[2], 10);
  const verset = match[3] ? parseInt(match[3], 10) : undefined;
  const versetFin = match[4] ? parseInt(match[4], 10) : undefined;

  return {
    livre,
    chapitre,
    verset,
    versetFin,
    slug: slugify(livre),
  };
}

// Nombre de chapitres par livre (utile pour la page de navigation)
export const CHAPTERS_COUNT: Record<string, number> = {
  Genèse: 50, Exode: 40, Lévitique: 27, Nombres: 36, Deutéronome: 34,
  Josué: 24, Juges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Rois": 22, "2 Rois": 25, "1 Chroniques": 29, "2 Chroniques": 36,
  Esdras: 10, Néhémie: 13, Esther: 10, Job: 42, Psaumes: 150,
  Proverbes: 31, Ecclésiaste: 12, "Cantique des Cantiques": 8,
  Ésaïe: 66, Jérémie: 52, Lamentations: 5, Ézéchiel: 48, Daniel: 12,
  Osée: 14, Joël: 3, Amos: 9, Abdias: 1, Jonas: 4, Michée: 7,
  Nahum: 3, Habacuc: 3, Sophonie: 3, Aggée: 2, Zacharie: 14, Malachie: 4,
  Matthieu: 28, Marc: 16, Luc: 24, Jean: 21, Actes: 28,
  Romains: 16, "1 Corinthiens": 16, "2 Corinthiens": 13, Galates: 6,
  Éphésiens: 6, Philippiens: 4, Colossiens: 4,
  "1 Thessaloniciens": 5, "2 Thessaloniciens": 3,
  "1 Timothée": 6, "2 Timothée": 4, Tite: 3, Philémon: 1,
  Hébreux: 13, Jacques: 5, "1 Pierre": 5, "2 Pierre": 3,
  "1 Jean": 5, "2 Jean": 1, "3 Jean": 1, Jude: 1, Apocalypse: 22,
};
