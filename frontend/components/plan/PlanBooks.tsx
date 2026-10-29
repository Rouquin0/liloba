"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/bible-utils";
import {
  markIfAutoMark,
  planBooks,
  planChapters,
  setChaptersRead,
  toggleChapter,
  type PlanState,
  type PlanView,
} from "@/lib/reading-plan";
import { CheckIcon, ChevronDown, ChevronRight } from "@/components/plan/PlanIcons";

// ============================================================
// LILOBA — Plan : carte du parcours, livre par livre
// Barre de progression par livre ; on déplie un livre pour voir ses
// chapitres, les cocher un par un ou tout le livre d'un coup
// (utile pour dire « ce livre, je l'ai déjà lu »).
// ============================================================

export default function PlanBooks({
  state,
  view,
  onLeave,
}: {
  state: PlanState;
  view: PlanView;
  onLeave: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const books = useMemo(() => planBooks(view.def, state.done), [view.def, state.done]);
  const chapters = useMemo(() => planChapters(view.def), [view.def]);
  const todaySet = useMemo(() => new Set(view.today.map((x) => x.index)), [view.today]);
  const lateSet = useMemo(() => new Set(view.late.map((x) => x.index)), [view.late]);

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-xs leading-relaxed text-[var(--muted)]">
        Touche un livre pour voir ses chapitres. Un contour marque la lecture du jour, un point les chapitres en retard.
      </p>
      {books.map((b) => {
        const isOpen = open === b.book;
        const complete = b.read === b.count;
        const pct = Math.round((b.read / b.count) * 100);
        return (
          <div
            key={b.book}
            className={`rounded-2xl border transition-colors ${
              complete ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5" : "border-[var(--border)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : b.book)}
              aria-expanded={isOpen}
              className="flex min-h-[52px] w-full items-center gap-3 px-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--foreground)]">{b.book}</span>
                  <span className="shrink-0 font-mono text-[11px] text-[var(--muted)]">
                    {b.read}/{b.count}
                  </span>
                </span>
                <span
                  className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--border)]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${b.book} : ${pct} % lu`}
                >
                  <span
                    className="block h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </span>
              <span className={`text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                <ChevronDown />
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-[var(--border)] px-3 pb-3 pt-3">
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: b.count }, (_, k) => {
                    const idx = b.start + k;
                    const read = state.done[idx] === "1";
                    const isToday = todaySet.has(idx);
                    const isLate = lateSet.has(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        role="checkbox"
                        aria-checked={read}
                        aria-label={`${chapters[idx].book} ${chapters[idx].chapter}`}
                        onClick={() => toggleChapter(idx)}
                        className={`relative flex h-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                          read
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : isToday
                              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/60"
                        }`}
                      >
                        {k + 1}
                        {isLate && !read && (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChaptersRead(
                        Array.from({ length: b.count }, (_, k) => b.start + k),
                        !complete
                      )
                    }
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    {complete ? "Tout décocher" : "Tout marquer comme lu"}
                  </button>
                  <Link
                    href={`/bible/${slugify(b.book)}/${Math.max(1, firstUnread(state.done, b))}`}
                    onClick={() => {
                      markIfAutoMark(b.start + Math.max(0, firstUnread(state.done, b) - 1));
                      onLeave();
                    }}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-xl px-3 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10"
                  >
                    {b.read === 0 ? "Ouvrir" : complete ? "Relire" : "Reprendre"}
                    <ChevronRight />
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Numéro (1-based) du premier chapitre non lu du livre ; 1 si tout est lu. */
function firstUnread(done: string, b: { start: number; count: number }): number {
  for (let k = 0; k < b.count; k++) if (done[b.start + k] !== "1") return k + 1;
  return 1;
}
