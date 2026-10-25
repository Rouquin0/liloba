"use client";

import { useEffect, useState } from "react";
import {
  TRANSLATION_IDS,
  verifyOfflineBibles,
  repairOfflineBibles,
  getOfflineDetailedStatus,
  getOfflineStatus,
  formatSize,
} from "@/lib/offline-bible";
import { TRANSLATIONS } from "@/lib/translations";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// ============================================================
// LILOBA — Télécharger les 10 versions bibliques
// ------------------------------------------------------------
// Remplace l'ancien bloc « Bible hors ligne » + bouton « Réparer ».
// Un SEUL bouton qui fait tout :
//   1. vérifie les 10 versions déjà sur le téléphone,
//   2. télécharge celles qui manquent ou sont incomplètes,
//   3. vérifie à nouveau et confirme.
// Chaque version a sa pastille d'état en direct, avec une barre de
// progression. L'écran reste allumé pendant le téléchargement quand
// le navigateur le permet.
// ============================================================

function label(id: string): string {
  return TRANSLATIONS.find((t) => t.id === id)?.shortName ?? id;
}

type Phase = "idle" | "checking" | "downloading";
type Msg = { ok: boolean; text: string } | null;
type ChipState = "ready" | "todo" | "active" | "bad";

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CloudDownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
      <path d="M12 12v9" />
      <path d="m8 17 4 4 4-4" />
    </svg>
  );
}

function ChipIcon({ state }: { state: ChipState }) {
  if (state === "ready") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...ico} strokeWidth={3} aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (state === "active") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" {...ico} aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.2-8.6" />
      </svg>
    );
  }
  if (state === "bad") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...ico} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...ico} aria-hidden="true">
      <path d="M12 5v12" />
      <path d="m7 13 5 5 5-5" />
    </svg>
  );
}

const CHIP_STYLE: Record<ChipState, string> = {
  ready: "border-green-500/30 bg-green-500/5 text-green-600",
  active: "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  bad: "border-orange-500/30 bg-orange-500/5 text-orange-600",
  todo: "border-[var(--border)] text-[var(--muted)]",
};

export default function OfflineCheckSection({ onChanged }: { onChanged?: () => void }) {
  const isOnline = useOnlineStatus();
  const total = TRANSLATION_IDS.length;

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [size, setSize] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [targets, setTargets] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [step, setStep] = useState({ i: 0, n: 0 });
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<Msg>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getOfflineDetailedStatus();
        if (cancelled) return;
        setReady(s.downloadedIds);
        setSize(s.size);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const busy = phase !== "idle";
  const missing = total - ready.length;

  const chipState = (id: string): ChipState => {
    if (phase === "downloading") {
      if (id === active) return "active";
      const idx = targets.indexOf(id);
      if (idx === -1) return "ready";
      return idx < step.i - 1 ? "ready" : "todo";
    }
    if (ready.includes(id)) return "ready";
    if (bad.includes(id)) return "bad";
    return "todo";
  };

  const handleMain = async () => {
    if (busy) return;
    setMessage(null);
    setPhase("checking");

    // Garde l'écran allumé pendant le téléchargement (si le navigateur le permet)
    type WakeLockLike = { release: () => Promise<void> };
    let wake: WakeLockLike | null = null;
    try {
      const nav = navigator as unknown as {
        wakeLock?: { request: (t: "screen") => Promise<WakeLockLike> };
      };
      wake = (await nav.wakeLock?.request("screen")) ?? null;
    } catch {
      // facultatif
    }

    try {
      // 1) Vérifie ce qui est déjà sur le téléphone
      const r = await verifyOfflineBibles();
      setReady(r.checks.filter((c) => c.ok).map((c) => c.id));
      setBad(r.corruptedIds);
      const toFix = [...r.missingIds, ...r.corruptedIds];

      if (toFix.length === 0) {
        setMessage({
          ok: true,
          text: `Parfait : les ${r.totalCount} versions sont complètes sur ton téléphone.`,
        });
        const st = await getOfflineStatus();
        setSize(st.size);
        return;
      }

      if (!isOnline) {
        setMessage({
          ok: false,
          text: "Connexion requise pour télécharger les versions manquantes.",
        });
        return;
      }

      // 2) Télécharge les versions manquantes ou incomplètes
      setTargets(toFix);
      setPhase("downloading");
      setProgress(0);
      setStep({ i: 1, n: toFix.length });
      const res = await repairOfflineBibles(toFix, (overall, id, i, n) => {
        setProgress(overall);
        setActive(id);
        setStep({ i, n });
      });

      // 3) Vérifie à nouveau et conclut
      const r2 = await verifyOfflineBibles();
      setReady(r2.checks.filter((c) => c.ok).map((c) => c.id));
      setBad(r2.corruptedIds);
      const left = [...r2.missingIds, ...r2.corruptedIds];
      const st = await getOfflineStatus();
      setSize(st.size);
      setMessage(
        left.length === 0
          ? {
              ok: true,
              text: `Terminé : les ${r2.totalCount} versions sont sur ton téléphone (${formatSize(res.totalSize)}).`,
            }
          : {
              ok: false,
              text: `Presque : il reste ${left.map(label).join(", ")}. Appuie à nouveau pour réessayer.`,
            }
      );
      onChanged?.();
    } catch (e) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Téléchargement impossible. Vérifie ta connexion.",
      });
    } finally {
      try {
        await wake?.release();
      } catch {
        // ignore
      }
      setPhase("idle");
      setActive(null);
    }
  };

  // ---- Libellés ----
  const needsDownload = missing > 0;
  const mainLabel =
    phase === "checking"
      ? "Vérification…"
      : phase === "downloading"
        ? `Téléchargement ${step.i}/${step.n}…`
        : !needsDownload
          ? `Vérifier les ${total} versions`
          : missing === total
            ? `Télécharger les ${total} versions`
            : missing === 1
              ? "Télécharger la version manquante"
              : `Télécharger les ${missing} versions manquantes`;

  const subtitle = loading
    ? "Chargement…"
    : !needsDownload
      ? `Les ${total} versions sont sur ton téléphone${size > 0 ? ` · ${formatSize(size)}` : ""}`
      : `${ready.length}/${total} versions sur ton téléphone`;

  const blocked = busy || loading || (needsDownload && !isOnline);

  return (
    <div className="min-w-0">
      {/* En-tête, même style que les autres lignes des paramètres */}
      <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--foreground)] md:h-9 md:w-9"
          style={{ background: "var(--surface-hover)" }}
        >
          <CloudDownloadIcon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Télécharger les {total} versions bibliques
          </span>
          <span className="text-xs text-[var(--muted)]">{subtitle}</span>
        </div>
      </div>

      <div className="min-w-0 md:ml-12">
        {/* Une pastille par version */}
        <div className="flex flex-wrap gap-1.5" aria-live="polite">
          {TRANSLATION_IDS.map((id) => {
            const st = chipState(id);
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${CHIP_STYLE[st]}`}
              >
                <ChipIcon state={st} />
                {label(id)}
              </span>
            );
          })}
        </div>

        {/* Progression */}
        {phase === "downloading" && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span className="min-w-0 truncate">
                Téléchargement de {active ? label(active) : "…"}
              </span>
              <span className="shrink-0 font-mono">{progress}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "var(--color-accent)" }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--muted)]">
              Garde LILOBA ouvert jusqu&apos;à la fin du téléchargement.
            </p>
          </div>
        )}

        {message && (
          <p
            role="status"
            className={`mt-3 text-[11px] ${message.ok ? "text-green-600" : "text-orange-600"}`}
          >
            {message.text}
          </p>
        )}

        {/* L'unique bouton */}
        <button
          type="button"
          onClick={handleMain}
          disabled={blocked}
          className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all disabled:opacity-40 ${
            needsDownload
              ? "bg-[var(--color-accent)] text-white hover:brightness-90"
              : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          }`}
        >
          {phase === "idle" && <CloudDownloadIcon className="h-4 w-4" />}
          {mainLabel}
        </button>

        {needsDownload && !isOnline && !busy && (
          <p className="mt-1.5 text-[10px] text-[var(--muted)]">
            Connexion requise pour télécharger.
          </p>
        )}
        {!needsDownload && !busy && (
          <p className="mt-1.5 text-[10px] text-[var(--muted)]">
            Une fois téléchargées, les versions fonctionnent sans connexion.
          </p>
        )}
      </div>
    </div>
  );
}
