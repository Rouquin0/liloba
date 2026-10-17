"use client";

// ============================================================
// LILOBA — Bible offline (IndexedDB)
// ============================================================

const DB_NAME = "liloba-offline";
const DB_VERSION = 1;
const STORE_NAME = "bible";
const BIBLE_KEY = "bible-data";

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

// ============================================================
// TÉLÉCHARGEMENT
// ============================================================

export async function downloadBible(
  onProgress?: (percent: number) => void
): Promise<number> {
  if (navigator.storage && navigator.storage.persist) {
  try {
    const isPersisted = await navigator.storage.persist();
    if (isPersisted) {
      console.log("[Offline] ✅ Stockage persistant accordé — tes données sont garanties.");
    } else {
      console.log(
        "[Offline] ℹ️ Stockage normal — tes données seront conservées, " +
        "mais le navigateur peut les purger si l'espace manque. " +
        "Installe la PWA pour un stockage persistant."
      );
    }
  } catch {
    // ignore
  }
}

  const response = await fetch("/bible.json");

  if (!response.ok) {
    throw new Error(
      `Erreur ${response.status} : impossible de télécharger la Bible.`
    );
  }

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Stream non disponible");
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total > 0 && onProgress) {
      onProgress(Math.round((received / total) * 100));
    }
  }

  const allChunks = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  const text = new TextDecoder("utf-8").decode(allChunks);
  const bibleData: BibleData = JSON.parse(text);

  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(
      {
        data: bibleData,
        downloadedAt: Date.now(),
        size: received,
      },
      BIBLE_KEY
    );

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  db.close();

  return received;
}

// ============================================================
// LECTURE
// ============================================================

export async function getOfflineStatus(): Promise<OfflineStatus> {
  try {
    const db = await openDB();

    const result = await new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(BIBLE_KEY);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!result) {
      return { isDownloaded: false, downloadedAt: null, size: 0 };
    }

    return {
      isDownloaded: true,
      downloadedAt: result.downloadedAt,
      size: result.size,
    };
  } catch {
    return { isDownloaded: false, downloadedAt: null, size: 0 };
  }
}

export async function getOfflineBible(): Promise<BibleData | null> {
  try {
    const db = await openDB();

    const result = await new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(BIBLE_KEY);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    return result?.data ?? null;
  } catch {
    return null;
  }
}

export async function getOfflineChapitre(
  livre: string,
  chapitre: number
): Promise<Record<string, string> | null> {
  const bible = await getOfflineBible();
  if (!bible) return null;

  const livreData = bible[livre];
  if (!livreData) return null;

  const chapitreData = livreData[String(chapitre)];
  if (!chapitreData) return null;

  return chapitreData;
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

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(BIBLE_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
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
