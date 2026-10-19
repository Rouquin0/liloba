"use client";

// ============================================================
// LILOBA — Bible offline (IndexedDB) — 10 traductions
// ============================================================
// Stockage :
//  - "bible-data"  : LSG legacy (compat avec l'existant)
//  - "trans:<id>"  : chaque traduction (lsg + 9 autres)
//  - "meta"        : { downloadedAt, sizes, totalSize }
// Sans wifi, la lecture utilise IndexedDB en priorité.
// ============================================================

const DB_NAME = "liloba-offline";
const DB_VERSION = 2;
const STORE_NAME = "bible";
const BIBLE_KEY = "bible-data";
const META_KEY = "meta";
const TRANS_PREFIX = "trans:";

// Doit rester synchronisé avec lib/translations.ts (copie locale
// pour éviter tout import circulaire).
export const TRANSLATION_FILES: Record<string, string> = {
  lsg: "/bible.json",
  martin: "/translations/martin-lsg.json",
  kjv: "/translations/kjv-lsg.json",
  valera: "/translations/valera-lsg.json",
  portuguese: "/translations/portuguese-lsg.json",
  swahili: "/translations/swahili-lsg.json",
  lingala: "/translations/lingala-lsg.json",
  kituba: "/translations/kituba-lsg.json",
  russian: "/translations/russian-lsg.json",
  chinese: "/translations/chinese-lsg.json",
};

export const TRANSLATION_IDS = Object.keys(TRANSLATION_FILES);

// ============================================================
// TYPES
// ============================================================

export interface BibleData {
  [livre: string]: {
    [chapitre: string]: {
      [verset: string]: string;
    };
  };
}

export interface OfflineStatus {
  isDownloaded: boolean;
  downloadedAt: number | null;
  size: number;
}

export interface OfflineDetailedStatus extends OfflineStatus {
  totalCount: number;
  downloadedCount: number;
  downloadedIds: string[];
  missingIds: string[];
  isComplete: boolean;
}

export interface DownloadAllResult {
  totalSize: number;
  downloaded: string[];
  failed: string[];
}

interface MetaRecord {
  downloadedAt: number;
  sizes: Record<string, number>;
  totalSize: number;
}

// ============================================================
// OUVERTURE DE LA DB
// ============================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB non disponible (SSR)"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await openDB();
  try {
    return await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbPut(key: string, value: any): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function ensurePersisted(): Promise<void> {
  if (navigator.storage?.persist) {
    try {
      const ok = await navigator.storage.persist();
      console.log(
        ok
          ? "[Offline] ✅ Stockage persistant accordé."
          : "[Offline] ℹ️ Stockage normal — installe la PWA pour le rendre persistant."
      );
    } catch {
      // ignore
    }
  }
}

async function fetchJsonWithProgress(
  path: string,
  onFileProgress?: (percent: number) => void
): Promise<{ data: BibleData; size: number }> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} sur ${path}`);
  }
  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  const reader = response.body?.getReader();

  // Fallback sans stream (petits navigateurs)
  if (!reader) {
    const data = (await response.json()) as BibleData;
    const size = JSON.stringify(data).length;
    return { data, size };
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0 && onFileProgress) {
      onFileProgress(Math.round((received / total) * 100));
    }
  }
  const all = new Uint8Array(received);
  let pos = 0;
  for (const c of chunks) {
    all.set(c, pos);
    pos += c.length;
  }
  const text = new TextDecoder("utf-8").decode(all);
  const data = JSON.parse(text) as BibleData;
  return { data, size: received };
}

// ============================================================
// TÉLÉCHARGEMENT — 1 traduction
// ============================================================

async function downloadOne(
  id: string,
  onFileProgress?: (percent: number) => void
): Promise<number> {
  const path = TRANSLATION_FILES[id];
  if (!path) throw new Error(`Traduction inconnue : ${id}`);

  const { data, size } = await fetchJsonWithProgress(path, onFileProgress);

  // Stocke sous la clé dédiée
  await idbPut(`${TRANS_PREFIX}${id}`, {
    data,
    downloadedAt: Date.now(),
    size,
  });

  // Compat : LSG reste aussi sous l'ancienne clé "bible-data"
  if (id === "lsg") {
    await idbPut(BIBLE_KEY, {
      data,
      downloadedAt: Date.now(),
      size,
    });
  }
  return size;
}

// ============================================================
// TÉLÉCHARGEMENT — LSG seul (compat, ancien bouton)
// ============================================================

export async function downloadBible(
  onProgress?: (percent: number) => void
): Promise<number> {
  await ensurePersisted();
  const size = await downloadOne("lsg", onProgress);
  await refreshMeta();
  return size;
}

// ============================================================
// TÉLÉCHARGEMENT — les 10 versions (nouveau bouton "Mettre à jour")
// ============================================================

export async function downloadAllBibles(
  onProgress?: (overallPercent: number, currentId: string, index: number, total: number) => void
): Promise<DownloadAllResult> {
  await ensurePersisted();

  const downloaded: string[] = [];
  const failed: string[] = [];
  const sizes: Record<string, number> = {};

  // Reprend les tailles déjà connues pour garder un total cohérent
  try {
    const prev = (await idbGet(META_KEY)) as MetaRecord | undefined;
    if (prev?.sizes) Object.assign(sizes, prev.sizes);
  } catch {
    // ignore
  }

  for (let i = 0; i < TRANSLATION_IDS.length; i++) {
    const id = TRANSLATION_IDS[i];
    try {
      const size = await downloadOne(id, (filePercent) => {
        if (onProgress) {
          const overall = Math.round(((i + filePercent / 100) / TRANSLATION_IDS.length) * 100);
          onProgress(overall, id, i + 1, TRANSLATION_IDS.length);
        }
      });
      sizes[id] = size;
      downloaded.push(id);
    } catch (e) {
      console.error(`[Offline] échec ${id}:`, e);
      failed.push(id);
    }
    if (onProgress) {
      const overall = Math.round(((i + 1) / TRANSLATION_IDS.length) * 100);
      onProgress(overall, id, i + 1, TRANSLATION_IDS.length);
    }
  }

  const totalSize = Object.values(sizes).reduce((a, b) => a + b, 0);
  await idbPut(META_KEY, {
    downloadedAt: Date.now(),
    sizes,
    totalSize,
  } satisfies MetaRecord);

  if (downloaded.length === 0) {
    throw new Error("Aucune traduction n'a pu être téléchargée. Vérifie ta connexion.");
  }

  return { totalSize, downloaded, failed };
}

async function refreshMeta(): Promise<void> {
  try {
    const prev = (await idbGet(META_KEY)) as MetaRecord | undefined;
    const sizes: Record<string, number> = { ...(prev?.sizes ?? {}) };
    // Met à jour au moins la taille LSG
    const lsg = await idbGet(`${TRANS_PREFIX}lsg`);
    if (lsg?.size) sizes["lsg"] = lsg.size;
    else {
      const legacy = await idbGet(BIBLE_KEY);
      if (legacy?.size) sizes["lsg"] = legacy.size;
    }
    const totalSize = Object.values(sizes).reduce((a, b) => a + b, 0);
    await idbPut(META_KEY, {
      downloadedAt: prev?.downloadedAt ?? Date.now(),
      sizes,
      totalSize,
    } satisfies MetaRecord);
  } catch {
    // ignore
  }
}

// ============================================================
// LECTURE
// ============================================================

export async function getOfflineStatus(): Promise<OfflineStatus> {
  try {
    const meta = (await idbGet(META_KEY)) as MetaRecord | undefined;
    if (meta && Object.keys(meta.sizes ?? {}).length > 0) {
      const hasLsg = (meta.sizes["lsg"] ?? 0) > 0;
      return {
        isDownloaded: hasLsg,
        downloadedAt: meta.downloadedAt ?? null,
        size: meta.totalSize ?? 0,
      };
    }
    // Fallback legacy (v1 : seule la clé bible-data existe)
    const legacy = await idbGet(BIBLE_KEY);
    if (!legacy) return { isDownloaded: false, downloadedAt: null, size: 0 };
    return {
      isDownloaded: true,
      downloadedAt: legacy.downloadedAt ?? null,
      size: legacy.size ?? 0,
    };
  } catch {
    return { isDownloaded: false, downloadedAt: null, size: 0 };
  }
}

export async function getOfflineDetailedStatus(): Promise<OfflineDetailedStatus> {
  const base = await getOfflineStatus();
  const downloadedIds: string[] = [];
  const missingIds: string[] = [];

  for (const id of TRANSLATION_IDS) {
    try {
      let rec = await idbGet(`${TRANS_PREFIX}${id}`);
      // Compat LSG legacy
      if (!rec && id === "lsg") rec = await idbGet(BIBLE_KEY);
      if (rec?.data) downloadedIds.push(id);
      else missingIds.push(id);
    } catch {
      missingIds.push(id);
    }
  }

  return {
    ...base,
    totalCount: TRANSLATION_IDS.length,
    downloadedCount: downloadedIds.length,
    downloadedIds,
    missingIds,
    isComplete: missingIds.length === 0 && downloadedIds.length > 0,
  };
}

export async function getOfflineBible(): Promise<BibleData | null> {
  return getOfflineTranslation("lsg");
}

export async function getOfflineTranslation(id: string): Promise<BibleData | null> {
  try {
    const rec = await idbGet(`${TRANS_PREFIX}${id}`);
    if (rec?.data) return rec.data as BibleData;
    // Compat : LSG sous l'ancienne clé
    if (id === "lsg") {
      const legacy = await idbGet(BIBLE_KEY);
      return legacy?.data ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Sauvegarde une traduction récupérée depuis le réseau (mise en cache auto). */
export async function saveOfflineTranslation(id: string, data: BibleData): Promise<void> {
  try {
    const size = JSON.stringify(data).length;
    await idbPut(`${TRANS_PREFIX}${id}`, {
      data,
      downloadedAt: Date.now(),
      size,
    });
    if (id === "lsg") {
      await idbPut(BIBLE_KEY, {
        data,
        downloadedAt: Date.now(),
        size,
      });
    }
    await refreshMeta();
  } catch {
    // Quota plein ou autre : on ignore, la lecture mémoire reste OK
  }
}

export async function getOfflineChapitre(
  livre: string,
  chapitre: number
): Promise<Record<string, string> | null> {
  return getOfflineChapterFor("lsg", livre, chapitre);
}

export async function getOfflineChapterFor(
  id: string,
  livre: string,
  chapitre: number
): Promise<Record<string, string> | null> {
  const bible = await getOfflineTranslation(id);
  if (!bible) return null;
  const livreData = bible[livre];
  if (!livreData) return null;
  return livreData[String(chapitre)] ?? null;
}

export async function getOfflineLivres(): Promise<string[] | null> {
  const bible = await getOfflineBible();
  if (!bible) return null;
  return Object.keys(bible);
}

// ============================================================
// SUPPRESSION
// ============================================================

export async function deleteOfflineBible(): Promise<void> {
  try {
    const db = await openDB();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(BIBLE_KEY);
        store.delete(META_KEY);
        for (const id of TRANSLATION_IDS) {
          store.delete(`${TRANS_PREFIX}${id}`);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch {
    // ignore
  }
}

// ============================================================
// HELPERS
// ============================================================

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDownloadDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
