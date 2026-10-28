"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRAYER_CATEGORIES,
  getAllPrayers,
  type Prayer,
} from "@/lib/prayers";
import {
  getIntentions,
  addIntention,
  toggleIntentionAnswered,
  deleteIntention,
  getAmenCount,
  getTotalAmen,
  sayAmen,
  markPrayerDay,
  getPrayerDays,
  getPrayerStreak,
  prayerDayKeyOffset,
  type PrayerIntention,
} from "@/lib/prayer-life";
import { addJournalEntry } from "@/lib/journal";
import { localStorage } from "@/lib/profile-storage";

// ============================================================
// LILOBA — Compagnon de prière (5 nouveautés, style épuré)
// ------------------------------------------------------------
// 1. Prière du moment (sélection quotidienne déterministe)
// 2. Routine : "J'ai prié aujourd'hui" + série 7 jours
// 3. Mes intentions personnelles
// 4. Minuteur de prière silencieuse (anneau SVG)
// 5. Compteur "Amen"
// Aucune phrase de prière existante n'est modifiée.
// ============================================================

const TIMER_CHOICES = [1, 3, 5]; // minutes

export default function PrayerCompanion({
  onOpenPrayer,
}: {
  onOpenPrayer: (prayer: Prayer) => void;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reload = () => setTick((t) => t + 1);
    window.addEventListener("liloba:prayer-life-updated", reload);
    window.addEventListener("liloba:journal-updated", reload);
    return () => {
      window.removeEventListener("liloba:prayer-life-updated", reload);
      window.removeEventListener("liloba:journal-updated", reload);
    };
  }, []);

  // 1. Prière du moment — déterministe par jour (même pour tous, change à minuit)
  const dailyPrayer = useMemo(() => {
    const all = getAllPrayers();
    if (all.length === 0) return null;
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return all[dayOfYear % all.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(Date.now() / 86400000)]);

  const dailyCategory = useMemo(() => {
    if (!dailyPrayer) return null;
    return (
      PRAYER_CATEGORIES.find((c) =>
        c.prayers.some((p) => p.id === dailyPrayer.id)
      ) ?? null
    );
  }, [dailyPrayer]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. PRIÈRE DU MOMENT ── */}
      {dailyPrayer && (
        <button
          type="button"
          onClick={() => onOpenPrayer(dailyPrayer)}
          className="overflow-hidden rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--surface)] p-5 text-left transition-all hover:border-[var(--color-accent)]/60"
        >
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              style={{ color: "var(--color-accent)" }}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <span>Prière du moment</span>
          </div>
          <p
            className="mb-1 text-base font-bold text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {dailyPrayer.title}
          </p>
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            {dailyPrayer.text}
          </p>
          {dailyCategory && (
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
              {dailyCategory.name} · {dailyPrayer.verse}
            </p>
          )}
        </button>
      )}

      {/* ── 2. ROUTINE QUOTIDIENNE ── */}
      <PrayerRoutine key={`routine-${tick}`} />

      {/* ── 3. MES INTENTIONS ── */}
      <PrayerIntentions key={`intentions-${tick}`} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── 4. MINUTEUR SILENCIEUX ── */}
        <PrayerTimer />
        {/* ── 5. MES "AMEN" ── */}
        <AmenCard key={`amen-${tick}`} onOpenPrayer={onOpenPrayer} />
      </div>
    </div>
  );
}

// ============================================================
// 2. ROUTINE : "J'ai prié aujourd'hui" + 7 jours
// ============================================================

function PrayerRoutine() {
  const [days, setDays] = useState<string[]>([]);
  const [streak, setStreak] = useState({ current: 0, today: false });

  useEffect(() => {
    setDays(getPrayerDays());
    setStreak(getPrayerStreak());
  }, []);

  const handleCheck = () => {
    markPrayerDay();
    addJournalEntry("prayer_session", "Prière du jour", {
      detail: "Routine quotidienne cochée",
    });
    setDays(getPrayerDays());
    setStreak(getPrayerStreak());
  };

  const weekDots = [];
  for (let i = 6; i >= 0; i--) {
    const key = prayerDayKeyOffset(-i);
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDots.push({
      key,
      label: ["D", "L", "M", "M", "J", "V", "S"][d.getDay()],
      active: days.includes(key),
      today: i === 0,
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Routine de prière</span>
        </h3>
        {streak.current > 0 && (
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent)]">
            {streak.current} j
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-1.5">
        {weekDots.map((d) => (
          <div
            key={d.key}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
                d.active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : d.today
                    ? "border-dashed border-[var(--color-accent)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)]"
              }`}
              title={d.key}
            >
              {d.active ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                d.label
              )}
            </div>
            <span className="text-[9px] uppercase text-[var(--muted)]">
              {d.label}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCheck}
        disabled={streak.today}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
          streak.today
            ? "border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            : "bg-[var(--color-accent)] text-white hover:brightness-90"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {streak.today ? "Prié aujourd'hui" : "J'ai prié aujourd'hui"}
      </button>
    </div>
  );
}

// ============================================================
// 3. MES INTENTIONS
// ============================================================

function PrayerIntentions() {
  const [items, setItems] = useState<PrayerIntention[]>([]);
  const [draft, setDraft] = useState("");
  const [showAnswered, setShowAnswered] = useState(false);

  useEffect(() => {
    setItems(getIntentions());
  }, []);

  const refresh = () => setItems(getIntentions());

  const handleAdd = () => {
    if (!draft.trim()) return;
    const created = addIntention(draft);
    if (created) {
      setDraft("");
      refresh();
    }
  };

  const handleToggle = (id: string, willAnswer: boolean, text: string) => {
    toggleIntentionAnswered(id);
    if (willAnswer) {
      addJournalEntry("prayer_session", "Intention exaucée", { detail: text.slice(0, 80) });
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteIntention(id);
    refresh();
  };

  const open = items.filter((i) => !i.answeredAt);
  const answered = items.filter((i) => i.answeredAt);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h3 className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span>Mes intentions</span>
      </h3>
      <p className="mb-3 text-[11px] text-[var(--muted)]">
        Confie tes sujets de prière, coche quand Dieu répond.
      </p>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Ex : la guérison de maman…"
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition-all hover:brightness-90 disabled:opacity-40"
          aria-label="Ajouter l'intention"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>

      {open.length === 0 && answered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-5 text-center text-xs text-[var(--muted)]">
          Aucune intention pour l&apos;instant. Écris ton premier sujet ci-dessus.
        </p>
      ) : (
        <div className="flex flex-col">
          {open.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2 border-b border-[var(--border)] py-2.5"
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id, true, item.text)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-transparent transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                aria-label="Marquer comme exaucée"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                aria-label="Supprimer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {answered.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAnswered((v) => !v)}
          className="mt-2 text-[11px] font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          {showAnswered ? "Masquer" : "Voir"} les exaucées ({answered.length})
        </button>
      )}
      {showAnswered && (
        <div className="mt-1 flex flex-col">
          {answered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 border-b border-[var(--border)] py-2 opacity-70"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--muted)] line-through">
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => handleToggle(item.id, false, item.text)}
                className="shrink-0 text-[10px] text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
              >
                Rouvrir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 4. MINUTEUR DE PRIÈRE SILENCIEUSE (anneau SVG)
// ============================================================

function PrayerTimer() {
  const [durationMin, setDurationMin] = useState(3);
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = durationMin * 60;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = () => {
    stop();
    setRemaining(total);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return null;
        if (r <= 1) {
          stop();
          markPrayerDay();
          addJournalEntry("prayer_session", `Silence ${durationMin} min`, {
            detail: "Prière silencieuse terminée",
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const cancel = () => {
    stop();
    setRemaining(null);
  };

  const running = remaining !== null && remaining > 0;
  const done = remaining === 0;
  const progress = remaining === null ? 0 : 1 - remaining / total;
  const R = 34;
  const CIRC = 2 * Math.PI * R;

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h3 className="mb-3 flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>Silence</span>
      </h3>

      <div className="relative mb-3 h-24 w-24">
        <svg viewBox="0 0 84 84" className="h-24 w-24 -rotate-90">
          <circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="var(--surface-hover)"
            strokeWidth="7"
          />
          <circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-bold text-[var(--foreground)]">
            {remaining === null ? `${durationMin}:00` : fmt(remaining)}
          </span>
        </div>
      </div>

      {!running && !done && (
        <>
          <div className="mb-3 flex gap-1.5">
            {TIMER_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMin(m)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                  durationMin === m
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-all hover:brightness-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            Commencer
          </button>
        </>
      )}

      {running && (
        <button
          type="button"
          onClick={cancel}
          className="w-full rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          Arrêter
        </button>
      )}

      {done && (
        <>
          <p className="mb-3 text-center text-xs font-medium text-[var(--color-accent)]">
            Temps accompli. Amen.
          </p>
          <button
            type="button"
            onClick={cancel}
            className="w-full rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Recommencer
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// 5. COMPTEUR "AMEN"
// ============================================================

function AmenCard({ onOpenPrayer }: { onOpenPrayer: (p: Prayer) => void }) {
  const [total, setTotal] = useState(0);
  const [top, setTop] = useState<{ prayer: Prayer; count: number }[]>([]);

  useEffect(() => {
    setTotal(getTotalAmen());
    try {
      const raw = localStorage.getItem("liloba-prayer-amen");
      const counts: Record<string, number> = raw
        ? (JSON.parse(raw).counts ?? {})
        : {};
      const all = getAllPrayers();
      const ranked = Object.entries(counts)
        .map(([id, count]) => ({
          prayer: all.find((p) => p.id === id),
          count,
        }))
        .filter(
          (e): e is { prayer: Prayer; count: number } => !!e.prayer && e.count > 0
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      setTop(ranked);
    } catch {
      setTop([]);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        <span>Mes Amen</span>
      </h3>

      <div className="mb-3 text-center">
        <span className="text-3xl font-bold text-[var(--color-accent)]">
          {total}
        </span>
        <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
          Amen prononcé{total > 1 ? "s" : ""}
        </p>
      </div>

      {top.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {top.map(({ prayer, count }) => (
            <button
              key={prayer.id}
              type="button"
              onClick={() => onOpenPrayer(prayer)}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-left transition-colors hover:bg-[var(--surface-hover)]"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--foreground)]">
                {prayer.title}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold text-[var(--color-accent)]">
                ×{count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-[11px] leading-relaxed text-[var(--muted)]">
          Ouvre une prière et appuie sur « Amen » pour la sceller.
        </p>
      )}
    </div>
  );
}

/** Bouton "Amen" pour la vue détail d'une prière (exporté pour PrayerTab). */
export function AmenButton({ prayer }: { prayer: Prayer }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getAmenCount(prayer.id));
  }, [prayer.id]);

  const handleAmen = () => {
    setCount(sayAmen(prayer.id));
  };

  return (
    <button
      type="button"
      onClick={handleAmen}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/10 active:scale-[0.98]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
      Dire Amen{count > 0 ? ` · ${count}` : ""}
    </button>
  );
}
