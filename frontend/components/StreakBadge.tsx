"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStreak } from "@/lib/stats";

// ============================================================
// LILOBA P0 — Badge Streak lecture (additif, lecture seule)
// ============================================================

export default function StreakBadge() {
  const [current, setCurrent] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setCurrent(getStreak().current ?? 0);
    } catch {
      setCurrent(0);
    }
  }, []);

  if (!mounted) return null;

  return (
    <Link
      href="/historique"
      title="Voir mes stats de lecture"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
    >
      <span aria-hidden="true">🔥</span>
      <span>{current > 0 ? `${current} jour${current > 1 ? "s" : ""}` : "Commencer ma série"}</span>
    </Link>
  );
}
