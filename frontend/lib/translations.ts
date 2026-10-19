"use client";

// ============================================================
// LILOBA — Gestion des traductions bibliques
// ============================================================

export type TranslationId =
  | "lsg"
  | "martin"
  | "kjv"
  | "valera"
  | "swahili"
  | "lingala"
  | "kituba"
  | "russian"
  | "chinese"
  | "portuguese";

export interface Translation {
  id: TranslationId;
  name: string;
  shortName: string;
  language: string;
  flag: string;
  path: string;
}

export const TRANSLATIONS: Translation[] = [
  {
    id: "lsg",
    name: "Louis Segond 1910",
    shortName: "LSG",
    language: "Français",
    flag: "FR",
    path: "/bible.json",
  },
  {
    id: "martin",
    name: "Martin 1744",
    shortName: "Martin",
    language: "Français",
    flag: "FR",
    path: "/translations/martin-lsg.json",
  },
  {
    id: "kjv",
    name: "King James Version",
    shortName: "KJV",
    language: "Anglais",
    flag: "EN",
    path: "/translations/kjv-lsg.json",
  },
  {
    id: "valera",
    name: "Reina Valera 1909",
    shortName: "Valera",
    language: "Espagnol",
    flag: "ES",
    path: "/translations/valera-lsg.json",
  },
  {
    id: "portuguese",
    name: "Almeida Revisada",
    shortName: "Almeida",
    language: "Português",
    flag: "PT",
    path: "/translations/portuguese-lsg.json",
  },
  {
    id: "swahili",
    name: "Neno la Mungu",
    shortName: "Swahili",
    language: "Kiswahili",
    flag: "SW",
    path: "/translations/swahili-lsg.json",
  },
  {
    id: "lingala",
    name: "Biblica Open Lingala",
    shortName: "Lingala",
    language: "Lingála",
    flag: "CD",
    path: "/translations/lingala-lsg.json",
  },
  {
    id: "kituba",
    name: "Bibiliya na Kituba",
    shortName: "Kituba",
    language: "Kikongo ya leta",
    flag: "CG",
    path: "/translations/kituba-lsg.json",
  },
  {
    id: "russian",
    name: "Синодальный перевод",
    shortName: "Synodal",
    language: "Русский",
    flag: "RU",
    path: "/translations/russian-lsg.json",
  },
  {
    id: "chinese",
    name: "和合本 (CUV)",
    shortName: "CUV",
    language: "中文",
    flag: "CN",
    path: "/translations/chinese-lsg.json",
  },
];

// ---------- Cache en mémoire ----------

const cache: Partial<Record<TranslationId, Record<string, Record<string, Record<string, string>>>>> = {};

export async function loadTranslation(
  id: TranslationId
): Promise<Record<string, Record<string, Record<string, string>>> | null> {
  if (typeof window === "undefined") return null;

  if (cache[id]) {
    return cache[id] ?? null;
  }

  const translation = TRANSLATIONS.find((t) => t.id === id);
  if (!translation) return null;

  // 1) IndexedDB d'abord (hors-ligne OK)
  try {
    const { getOfflineTranslation } = await import("./offline-bible");
    const offline = await getOfflineTranslation(id);
    if (offline) {
      cache[id] = offline as Record<string, Record<string, Record<string, string>>>;
      return cache[id] ?? null;
    }
  } catch {
    // ignore, on tente le réseau
  }

  // 2) Réseau, puis mise en cache auto pour le hors-ligne
  try {
    const res = await fetch(translation.path);
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const data = await res.json();
    cache[id] = data;
    try {
      const { saveOfflineTranslation } = await import("./offline-bible");
      await saveOfflineTranslation(id, data);
    } catch {
      // cache auto optionnel : ne bloque pas la lecture
    }
    return data;
  } catch (err) {
    console.error(`Erreur chargement ${id}:`, err);
    return null;
  }
}

// ---------- Helper : récupère un verset ----------

export async function getVerse(
  translationId: TranslationId,
  livre: string,
  chapitre: number,
  verset: number
): Promise<string | null> {
  const data = await loadTranslation(translationId);
  if (!data) return null;

  const livreData = data[livre];
  if (!livreData) return null;

  const chapitreData = livreData[String(chapitre)];
  if (!chapitreData) return null;

  return chapitreData[String(verset)] ?? null;
}

// ---------- Helper : récupère tout un chapitre ----------

export async function getChapter(
  translationId: TranslationId,
  livre: string,
  chapitre: number
): Promise<Record<string, string> | null> {
  const data = await loadTranslation(translationId);
  if (!data) return null;

  const livreData = data[livre];
  if (!livreData) return null;

  return livreData[String(chapitre)] ?? null;
}

// ---------- Préchargement ----------

export function preloadTranslation(id: TranslationId): void {
  loadTranslation(id);
}

// ---------- Nettoyage du cache ----------

export function clearTranslationsCache(): void {
  (Object.keys(cache) as TranslationId[]).forEach((key) => {
    delete cache[key];
  });
}
