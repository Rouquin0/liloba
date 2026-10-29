"use client";

import { useMemo, useState } from "react";
import { ANCIEN_TESTAMENT, CHAPTERS_COUNT, NOUVEAU_TESTAMENT } from "@/lib/bible-utils";
import { customDef, startCustomPlan } from "@/lib/reading-plan";
import { ChevronLeft, MinusIcon, PlusIcon } from "@/components/plan/PlanIcons";

// ============================================================
// LILOBA — Plan : parcours personnalisé
// Un livre (ou une suite de livres) + un nombre de jours au choix.
// ============================================================

const BIBLE = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];
const QUICK_DAYS = [7, 14, 30, 60, 90];

const selectCls =
  "h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground)] outline-none transition-colors focus:border-[var(--color-accent)]";

export default function PlanBuilder({
  startDate,
  onBack,
  onDone,
}: {
  startDate: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [from, setFrom] = useState("Genèse");
  const [to, setTo] = useState("Genèse");
  const [days, setDays] = useState(30);

  const toOptions = BIBLE.slice(BIBLE.indexOf(from));
  const safeTo = toOptions.includes(to) ? to : from;
  const def = useMemo(() => customDef({ from, to: safeTo, days }), [from, safeTo, days]);
  const total = def ? def.books.reduce((n, b) => n + (CHAPTERS_COUNT[b] ?? 0), 0) : 0;
  const maxDays = Math.max(1, Math.min(730, total));
  const effDays = def ? def.days : days;
  const perDay = total / Math.max(1, effDays);
  const perDayLabel = perDay >= 10 ? `${Math.round(perDay)}` : `${Math.round(perDay * 10) / 10}`.replace(".", ",");

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex min-h-[36px] items-center gap-1 self-start rounded-lg px-1 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ChevronLeft />
        Parcours proposés
      </button>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[var(--muted)]">Du livre</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls}>
            <optgroup label="Ancien Testament">
              {ANCIEN_TESTAMENT.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </optgroup>
            <optgroup label="Nouveau Testament">
              {NOUVEAU_TESTAMENT.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[var(--muted)]">Jusqu&apos;au livre</span>
          <select value={safeTo} onChange={(e) => setTo(e.target.value)} className={selectCls}>
            {toOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-[var(--muted)]">Durée</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Un jour de moins"
            onClick={() => setDays((d) => Math.max(1, d - 1))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--color-accent)]"
          >
            <MinusIcon />
          </button>
          <div className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--foreground)]">
            {effDays} jour{effDays > 1 ? "s" : ""}
          </div>
          <button
            type="button"
            aria-label="Un jour de plus"
            onClick={() => setDays((d) => Math.min(maxDays, d + 1))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--color-accent)]"
          >
            <PlusIcon />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DAYS.filter((d) => d <= maxDays).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`min-h-[36px] rounded-full border px-3 text-xs font-semibold transition-colors ${
                effDays === d
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {d} j
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-2xl border border-[var(--border)] p-3 text-xs leading-relaxed text-[var(--muted)]">
        {total} chapitre{total > 1 ? "s" : ""} à lire, soit environ {perDayLabel} par jour.
      </p>

      <button
        type="button"
        disabled={!def}
        onClick={() => {
          startCustomPlan({ from, to: safeTo, days: effDays }, startDate);
          onDone();
        }}
        className="min-h-[48px] w-full rounded-2xl bg-[var(--color-accent)] text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
      >
        Commencer ce parcours
      </button>
    </div>
  );
}
