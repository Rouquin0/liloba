"use client";

// ============================================================
// LILOBA — Sauvegarde & Restauration
// ============================================================

import { getOfflineBible, getOfflineStatus } from "./offline-bible";

// ---------- Types ----------

export interface BackupData {
  version: 1;
  exportedAt: number;
  app: "liloba";
  localStorage: Record<string, string>;
  // On n'exporte PAS la Bible offline (trop gros, retéléchargeable)
}

// ---------- EXPORT ----------

export function exportAllData(): void {
  if (typeof window === "undefined") return;

  const ls: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith("liloba-")) continue;
    const value = localStorage.getItem(key);
    if (value !== null) ls[key] = value;
  }

  const backup: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    app: "liloba",
    localStorage: ls,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `liloba-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- IMPORT ----------

export async function importAllData(file: File): Promise<{
  ok: boolean;
  message: string;
  count?: number;
}> {
  try {
    const text = await file.text();
    const backup = JSON.parse(text) as BackupData;

    if (backup.app !== "liloba" || !backup.localStorage) {
      return { ok: false, message: "Fichier invalide (ce n'est pas un backup LILOBA)." };
    }

    let count = 0;
    for (const [key, value] of Object.entries(backup.localStorage)) {
      if (!key.startsWith("liloba-")) continue;
      try {
        localStorage.setItem(key, value);
        count++;
      } catch {}
    }

    return {
      ok: true,
      message: `${count} préférences restaurées. Recharge la page pour les appliquer.`,
      count,
    };
  } catch {
    return { ok: false, message: "Impossible de lire le fichier." };
  }
}

// ---------- STORAGE ESTIMATE ----------

export interface StorageEstimate {
  usage: number;       // octets utilisés
  quota: number;       // octets disponibles
  usageLabel: string;  // "12.4 Mo"
  quotaLabel: string;  // "2.1 Go"
  percent: number;     // 0-100
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    const percent = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      usageLabel: formatBytes(usage),
      quotaLabel: formatBytes(quota),
      percent,
    };
  } catch {
    return null;
  }
}

// ---------- RELOAD BIBLE OFFLINE ----------

export async function reloadOfflineBible(
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean; message: string }> {
  try {
    const { downloadAllBibles, formatSize } = await import("./offline-bible");
    const res = await downloadAllBibles((overall) => onProgress?.(overall));
    if (res.failed.length === 0) {
      return { ok: true, message: `Bible mise à jour : ${res.downloaded.length}/10 versions (${formatSize(res.totalSize)}), 100% hors ligne.` };
    }
    return {
      ok: true,
      message: `${res.downloaded.length}/10 versions à jour (${formatSize(res.totalSize)}). Échec : ${res.failed.join(", ")} — réessaie avec une bonne connexion.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Erreur de téléchargement.",
    };
  }
}

// ---------- CLEAR OFFLINE CACHE ----------

export async function clearOfflineBible(): Promise<{ ok: boolean; message: string }> {
  try {
    const status = await getOfflineStatus();
    if (!status.isDownloaded) {
      return { ok: false, message: "Aucune Bible hors ligne à supprimer." };
    }

    const { deleteOfflineBible, formatSize } = await import("./offline-bible");
    await deleteOfflineBible();

    return { ok: true, message: `Cache vidé (${formatSize(status.size)} libérés).` };
  } catch {
    return { ok: false, message: "Impossible de vider le cache." };
  }
}

// ---------- HELPERS ----------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

// Petit utilitaire pour l'UI : count des surlignages/notes
export async function countBibleCache(): Promise<number> {
  const status = await getOfflineStatus();
  return status.isDownloaded ? status.size : 0;
}

// Re-export pour faciliter l'import côté UI
export { getOfflineBible };
