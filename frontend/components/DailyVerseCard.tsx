"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyVerse, type DailyVerse } from "@/lib/daily-verse";

// ============================================================
// LILOBA P0 — Carte Verset du jour (additif, home uniquement)
// ============================================================

export default function DailyVerseCard() {
  const [verse, setVerse] = useState<DailyVerse | null>(null);

  useEffect(() => {
    let alive = true;
    getDailyVerse().then((v) => {
      if (alive) setVerse(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!verse) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 opacity-60">
        <p className="text-xs text-[var(--muted)]">Verset du jour…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[var(--color-primary)]/20 bg-[var(--surface)] p-5 shadow-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        ✨ Verset du jour
      </p>
      <p className="text-sm font-medium leading-relaxed text-[var(--foreground)]">« {verse.text} »</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--color-primary)]">{verse.reference}</span>
        <Link href="/bible" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
          Lire →
        </Link>
      </div>
    </div>
  );
}
