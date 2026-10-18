"use client";

export default function ApollosMaintenanceBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100 ${
        compact ? "" : "mb-4"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-semibold">Apollos revient bientôt</p>
        <p className="mt-0.5 text-xs opacity-80">
          Petit souci technique côté assistant IA. En attendant, la lecture de la Bible reste 100% disponible, même hors ligne.
        </p>
      </div>
    </div>
  );
}
