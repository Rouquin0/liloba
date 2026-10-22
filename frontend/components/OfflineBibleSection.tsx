"use client";

import { useEffect, useState } from "react";
import {
  downloadAllBibles,
  getOfflineDetailedStatus,
  formatSize,
  formatDownloadDate,
} from "@/lib/offline-bible";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Détecte si l'appli est installée en PWA (standalone)
function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function OfflineBibleSection() {
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getOfflineDetailedStatus>> | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(isPWAInstalled());
  }, []);

  // Charge le statut au montage
  const loadStatus = async () => {
    const s = await getOfflineDetailedStatus();
    setStatus(s);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleDownload = async () => {
    if (!isOnline) {
      setError("Internet requis pour télécharger la Bible.");
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setCurrentFile("");
    setError(null);

    try {
      const res = await downloadAllBibles((overall, currentId, index, total) => {
        setProgress(overall);
        setCurrentFile(`${index}/${total} · ${currentId}`);
      });
      await loadStatus();
      if (res.failed.length > 0) {
        setError(`Partiel : ${res.downloaded.length}/10 téléchargées. Échec : ${res.failed.join(", ")}. Réessaie.`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du téléchargement."
      );
    } finally {
      setIsDownloading(false);
      setCurrentFile("");
    }
  };

  

  if (!status) {
    return (
      <div className="glass-card p-4 text-center">
        <div
          className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)]"
          style={{ borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

    // ============================================================
  // PAS UNE PWA INSTALLÉE → Message informatif
  // ============================================================
  if (!isPWA) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-lg">
            📱
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Disponible sur l&apos;appli installée
            </div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              Pour télécharger la Bible hors ligne, installe LILOBA sur ton
              téléphone : Menu du navigateur → Ajouter à l&apos;écran
              d&apos;accueil.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ÉTAT 1 : Bible déjà téléchargée
  // ============================================================
  if (status.isDownloaded) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          {/* Icône check verte */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-lg">
            ✅
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {status.isComplete
                ? "10 versions disponibles hors ligne"
                : `${status.downloadedCount}/10 versions hors ligne`}
            </div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              {formatSize(status.size)} · Téléchargée le{" "}
              {status.downloadedAt
                ? formatDownloadDate(status.downloadedAt)
                : "—"}
            </div>
          </div>
        </div>

        {isDownloading ? (
          <div className="mt-3">
            <div className="text-xs text-[var(--muted)]">
              {progress}% · {currentFile} · Ne ferme pas cette page
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "var(--color-accent)" }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!isOnline || isDownloading}
            className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] disabled:opacity-40"
          >
            🔄 Mettre à jour les 10 versions
          </button>
        )}
        {error && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-500">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // ÉTAT 2 : Téléchargement en cours
  // ============================================================
  if (isDownloading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-[var(--border)]"
            style={{ borderTopColor: "var(--color-accent)" }}
          />
          <div className="flex-1">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Téléchargement en cours…
            </div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              {progress}% · {currentFile} · Ne ferme pas cette page
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "var(--color-accent)",
            }}
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // ÉTAT 3 : Pas encore téléchargée
  // ============================================================
  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        {/* Icône téléchargement */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-lg">
          📖
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--foreground)]">
            Bible hors ligne
          </div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">
            Les 10 versions (66 livres chacune, ~45 Mo). Lecture garantie sans
            internet.
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-500">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={!isOnline}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:brightness-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        {isOnline ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Télécharger la Bible
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="2" x2="22" y1="2" y2="22" />
              <path d="M8.5 16.5a5 5 0 0 1 7 0" />
              <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
              <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
              <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
              <path d="M5 12.55a11 11 0 0 1 5.17-3.09" />
              <line x1="12" x2="12.01" y1="20" y2="20" />
            </svg>
            Internet requis
          </>
        )}
      </button>
    </div>
  );
}
