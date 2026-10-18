"use client";

// ============================================================
// LILOBA P0 — Verset du jour déterministe (additif)
// Utilise bible.json offline si dispo, sinon fallback local.
// Ne modifie aucune clé existante, sauf lecture.
// ============================================================

export interface DailyVerse {
  reference: string;
  text: string;
  dateKey: string;
}

const FALLBACK_VERSES: DailyVerse[] = [
  { reference: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", dateKey: "" },
  { reference: "Psaumes 23:1", text: "L'Éternel est mon berger: je ne manquerai de rien.", dateKey: "" },
  { reference: "Proverbes 3:5", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.", dateKey: "" },
  { reference: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie.", dateKey: "" },
  { reference: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.", dateKey: "" },
  { reference: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu.", dateKey: "" },
  { reference: "Psaumes 46:2", text: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.", dateKey: "" },
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getDailyVerseSync(): DailyVerse {
  const today = getTodayKey();
  const idx = hashStr(today) % FALLBACK_VERSES.length;
  return { ...FALLBACK_VERSES[idx], dateKey: today };
}

// Version async qui essaie la Bible offline pour varier (optionnel, non bloquant)
export async function getDailyVerse(): Promise<DailyVerse> {
  try {
    const { getOfflineBible } = await import("./offline-bible");
    const offline = await getOfflineBible();
    const today = getTodayKey();
    if (offline) {
      // Pioche déterministe dans Psaumes / Jean si dispo
      const candidates: Array<{ livre: string; chap: string }> = [];
      if (offline["Psaumes"]) candidates.push({ livre: "Psaumes", chap: "23" });
      if (offline["Jean"]) candidates.push({ livre: "Jean", chap: "3" });
      if (offline["Proverbes"]) candidates.push({ livre: "Proverbes", chap: "3" });
      if (candidates.length > 0) {
        const pick = candidates[hashStr(today) % candidates.length];
        const chapData = offline[pick.livre]?.[pick.chap];
        if (chapData) {
          const keys = Object.keys(chapData);
          if (keys.length > 0) {
            const vNum = keys[hashStr(today + pick.livre) % keys.length];
            const txt = String(chapData[vNum]).replace(/<CM>/g, "").trim();
            if (txt) return { reference: `${pick.livre} ${pick.chap}:${vNum}`, text: txt, dateKey: today };
          }
        }
      }
    }
  } catch {
    // ignore, fallback ci-dessous
  }
  return getDailyVerseSync();
}

const HISTOIRES_NOTIFY_KEY = "liloba-histoires-notify";

export function getHistoiresNotify(): boolean {
  try {
    return localStorage.getItem(HISTOIRES_NOTIFY_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHistoiresNotify(v: boolean): void {
  try {
    localStorage.setItem(HISTOIRES_NOTIFY_KEY, String(v));
  } catch {
    // ignore
  }
}
