"use client";

import { useEffect, useState } from "react";
import { getHistoiresNotify, setHistoiresNotify } from "@/lib/daily-verse";

const PREVIEWS = [
  { icon: "waves", title: "Moïse et la mer Rouge", desc: "Exode 14" },
  { icon: "shield", title: "Daniel dans la fosse", desc: "Daniel 6" },
  { icon: "star", title: "La naissance de Jésus", desc: "Luc 2" },
];

function PreviewIcon({ name, className }: { name: string; className?: string }) {
  if (name === "waves") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--foreground)]">Histoires bibliques</p>
          <p className="text-xs text-[var(--muted)]">Bientôt disponible — illustré, pour petits et grands</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {PREVIEWS.map((p) => (
          <div key={p.title} className="flex flex-col items-center rounded-xl bg-[var(--background)] p-3 text-center">
            <PreviewIcon name={p.icon} className="h-6 w-6 text-[var(--color-primary)] opacity-80" />
            <p className="mt-2 text-[11px] font-semibold leading-tight">{p.title}</p>
            <p className="text-[10px] text-[var(--muted)]">{p.desc}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={mounted ? notify : false}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          notify
            ? "bg-green-600 text-white"
            : "bg-[var(--color-primary)] text-white hover:opacity-90"
        }`}
      >
        {notify ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Je serai notifié
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            Me notifier à la sortie
          </>
        )}
      </button>
    </div>
  );
}
