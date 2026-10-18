"use client";

// ============================================================
// LILOBA P0 — Bandeau maintenance Apollos (additif, sans casser /chat)
// ============================================================

export default function ApollosMaintenanceBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100 ${
        compact ? "" : "mb-4"
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        🛠️
      </span>
      <div className="flex-1">
        <p className="font-semibold">Apollos revient bientôt</p>
        <p className="mt-0.5 text-xs opacity-80">
          Petit souci technique côté assistant IA. En attendant, la lecture de la Bible reste 100% disponible, même
          hors ligne.
        </p>
      </div>
    </div>
  );
}
