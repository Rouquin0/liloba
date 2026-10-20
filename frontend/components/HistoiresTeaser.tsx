"use client";

import Link from "next/link";
import { STORIES } from "@/lib/stories-content";

const PREVIEW_SLUGS = ["david-goliath", "daniel-lions", "fils-perdu"];

export default function HistoiresTeaser() {
  const previews = PREVIEW_SLUGS.map(
    (slug) => STORIES.find((s) => s.slug === slug)!
  ).filter(Boolean);

  return (
    <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <span className="text-xl" aria-hidden="true">
            📚
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--foreground)]">
            Histoires bibliques
          </p>
          <p className="text-xs text-[var(--muted)]">
            {STORIES.length} histoires illustrées, pour petits et grands
          </p>
        </div>
        <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
          NOUVEAU
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {previews.map((p) => (
          <Link
            key={p.slug}
            href={`/histoires/${p.slug}`}
            className="flex flex-col items-center rounded-xl bg-[var(--background)] p-3 text-center transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="text-2xl" aria-hidden="true">
              {p.emoji}
            </span>
            <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight">
              {p.title}
            </p>
            <p className="text-[10px] text-[var(--muted)]">{p.reference}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/histoires"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        📚 Lire les histoires →
      </Link>
    </div>
  );
}
