"use client";

import { useEffect, useState } from "react";
import { getHistoiresNotify, setHistoiresNotify } from "@/lib/daily-verse";

// ============================================================
// LILOBA P0 — Teaser Histoires bibliques (additif)
// Ne crée pas la route, juste de l'attente + notify locale.
// ============================================================

const PREVIEWS = [
  { emoji: "🌊", title: "Moïse et la mer Rouge", desc: "Exode 14" },
  { emoji: "🦁", title: "Daniel dans la fosse", desc: "Daniel 6" },
  { emoji: "⭐", title: "La naissance de Jésus", desc: "Luc 2" },
];

export default function HistoiresTeaser() {
  const [notify, setNotify] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotify(getHistoiresNotify());
  }, []);

  const toggle = () => {
    const next = !notify;
    setNotify(next);
    setHistoiresNotify(next);
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          📚
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--foreground)]">Histoires bibliques</p>
          <p className="text-xs text-[var(--muted)]">Bientôt disponible — illustré, pour petits et grands</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {PREVIEWS.map((p) => (
          <div key={p.title} className="rounded-xl bg-[var(--background)] p-3 text-center">
            <div className="text-2xl" aria-hidden="true">
              {p.emoji}
            </div>
            <p className="mt-1 text-[11px] font-semibold leading-tight">{p.title}</p>
            <p className="text-[10px] text-[var(--muted)]">{p.desc}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={mounted ? notify : false}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          notify
            ? "bg-green-600 text-white"
            : "bg-[var(--color-primary)] text-white hover:opacity-90"
        }`}
      >
        {notify ? "✓ Je serai notifié" : "🔔 Me notifier à la sortie"}
      </button>
    </div>
  );
}
