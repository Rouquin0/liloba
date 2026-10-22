"use client";

import { useEffect, useState } from "react";
import {
  verifyOfflineBibles,
  repairOfflineBibles,
  getOfflineDetailedStatus,
  formatSize,
  type VerifyReport,
} from "@/lib/offline-bible";
import { TRANSLATIONS } from "@/lib/translations";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function label(id: string): string {
  return TRANSLATIONS.find((t) => t.id === id)?.shortName ?? id;
}

export default function OfflineCheckSection({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<VerifyReport | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadQuick = async () => {
    setLoading(true);
    try {
      const s = await getOfflineDetailedStatus();
      setReport({
        checks: [],
        okCount: s.downloadedCount,
        totalCount: s.totalCount,
        missingIds: s.missingIds,
        corruptedIds: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuick();
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const r = await verifyOfflineBibles();
      setReport(r);
      if (r.missingIds.length === 0 && r.corruptedIds.length === 0) {
        setMessage(`Parfait : ${r.okCount}/${r.totalCount} versions complètes.`);
      }
    } catch {
      setMessage("Vérification impossible.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRepair = async () => {
    if (!report) return;
    if (!isOnline) {
      setMessage("Internet requis pour réparer.");
      return;
    }
    const targets = [...report.missingIds, ...report.corruptedIds];
    if (targets.length === 0) return;
    setRepairing(true);
    setProgress(0);
    setCurrent("");
    setMessage(null);
    try {
      const res = await repairOfflineBibles(targets, (overall, id) => {
        setProgress(overall);
        setCurrent(id);
      });
      const r = await verifyOfflineBibles();
      setReport(r);
      setMessage(
        res.failed.length === 0
          ? `Réparé : ${res.downloaded.join(", ")} (${formatSize(res.totalSize)} au total).`
          : `Partiel : ${res.downloaded.length}/${targets.length} réparées. Échec : ${res.failed.join(", ")}.`
      );
      onChanged?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Réparation impossible.");
    } finally {
      setRepairing(false);
      setCurrent("");
    }
  };

  if (loading || !report) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-3 text-xs text-[var(--muted)]">
        Chargement de l'état hors-ligne…
      </div>
    );
  }

  const toFix = [...report.missingIds, ...report.corruptedIds];
  const isOk = toFix.length === 0 && report.checks.length > 0;

  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      {/* Passage en flex-col sur mobile pour éviter le débordement */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-[var(--foreground)]">
          {report.checks.length > 0 ? (
            <>{report.okCount}/{report.totalCount} versions vérifiées</>
          ) : (
            <>{report.okCount}/{report.totalCount} versions téléchargées</>
          )}
        </div>
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isOk
              ? "bg-green-500/10 text-green-600"
              : "bg-orange-500/10 text-orange-600"
          }`}
        >
          {isOk ? "OK" : "À VÉRIFIER"}
        </span>
      </div>

      {report.checks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {report.checks.map((c) => (
            <span
              key={c.id}
              title={c.detail}
              className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${
                c.ok
                  ? "border-green-500/30 bg-green-500/5 text-green-600"
                  : "border-red-500/30 bg-red-500/5 text-red-500"
              }`}
            >
              {c.ok ? "✅" : "❌"} {label(c.id)}
            </span>
          ))}
        </div>
      )}

      {toFix.length > 0 && report.checks.length > 0 && (
        <div className="mt-2 rounded-md bg-orange-500/5 p-2 text-[11px] text-orange-600">
          Manque / incomplet : {toFix.map(label).join(", ")}. Tes chapitres
          peuvent sembler vides ou te renvoyer en arrière.
        </div>
      )}

      {(repairing || verifying) && (
        <div className="mt-2 text-[11px] text-[var(--muted)]">
          {repairing ? `${progress}% · ${current}…` : "Vérification…"}
          {repairing && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: "var(--color-accent)" }}
              />
            </div>
          )}
        </div>
      )}

      {message && (
        <div className="mt-2 text-[11px] text-[var(--muted)]">{message}</div>
      )}

      {/* Boutons Vérifier / Réparer en pleine largeur */}
      <div className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || repairing}
          className="w-full rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
        >
          {verifying ? "Vérification…" : "🔍 Vérifier"}
        </button>
        <button
          type="button"
          onClick={handleRepair}
          disabled={repairing || verifying || toFix.length === 0 || !isOnline}
          className="w-full rounded-lg bg-[var(--color-accent)] py-2 text-xs font-semibold text-white transition-all hover:brightness-90 disabled:opacity-40"
        >
          {repairing ? "Réparation…" : `🛠 Réparer (${toFix.length})`}
        </button>
      </div>
      {!isOnline && (
        <div className="mt-1 text-[10px] text-[var(--muted)]">
          Internet requis pour réparer.
        </div>
      )}
    </div>
  );
}
