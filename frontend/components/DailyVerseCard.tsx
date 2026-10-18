"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyVerse, type DailyVerse } from "@/lib/daily-verse";

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
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-yellow-500">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
        Verset du jour
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
