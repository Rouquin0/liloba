"use client";

import { useEffect, useState, useMemo } from "react";
import { getJournal } from "@/lib/journal";
import { getHistory } from "@/lib/history";
import { getSelahEntries } from "@/lib/selah";
import { getPrayerTopics } from "@/lib/selah-topics";
import { getStreak } from "@/lib/stats";
import {
  getReadingTimeStats,
  getActiveDaysSet,
  getLocalDayKey,
  getLocalDayKeyOffset,
  formatMinutes,
  getReaderLevel,
  DAILY_MINUTES_GOAL,
  DAILY_CHAPTERS_GOAL,
  type ReadingTimeStats,
} from "@/lib/reading-time";

export default function AdvancedStats() {
  const [calOffset, setCalOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState({
    journal: [] as any[],
    history: [] as any[],
    selah: [] as any[],
    topics: [] as any[],
    reading: null as ReadingTimeStats | null,
  });

  useEffect(() => {
    const load = () => {
      setData({
        journal: getJournal(),
        history: getHistory(),
        selah: getSelahEntries(),
        topics: getPrayerTopics(),
        reading: getReadingTimeStats(),
      });
    };
    load();
    const bump = () => setRefresh((r) => r + 1);
    window.addEventListener("liloba:journal-updated", load);
    window.addEventListener("liloba:history-updated", load);
    window.addEventListener("liloba:reading-time-updated", load);
    window.addEventListener("liloba:streak-updated", bump);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("liloba:journal-updated", load);
      window.removeEventListener("liloba:history-updated", load);
      window.removeEventListener("liloba:reading-time-updated", load);
      window.removeEventListener("liloba:streak-updated", bump);
      window.removeEventListener("storage", load);
    };
  }, [refresh]);

  // --- 1. Statistiques globales (sources persistantes, jamais remises à 0) ---
  const stats = useMemo(() => {
    const { journal, history, selah, topics, reading } = data;
    const todayKey = getLocalDayKey();

    const chapterEntries = journal.filter((e) => e.type === "chapter_read");
    const chaptersRead = chapterEntries.length;
    const chaptersToday = chapterEntries.filter(
      (e) => getLocalDayKey(new Date(e.createdAt)) === todayKey
    ).length;

    // Versets marqués : journal persistant (pas l'historique 24h qui expire)
    const verseMarks = journal.filter(
      (e) =>
        e.type === "verse_marked" ||
        e.type === "verse_highlighted" ||
        e.type === "verse_favorited"
    ).length;

    // Temps réel (vrai chrono) — fini le "chapitres × 3 min" qui restait à 0
    const totalSeconds = reading?.totalSeconds ?? 0;
    const todaySeconds = reading?.todaySeconds ?? 0;
    const weekSeconds = reading?.weekSeconds ?? 0;

    // Livre favori : chapitres lus (persistant) + versets marqués (secours)
    const bookCounts: Record<string, number> = {};
    const bookOf = (label: string) => label.replace(/\s+\d+.*$/, "").trim();
    chapterEntries.forEach((e) => {
      const b = bookOf(e.label);
      if (b) bookCounts[b] = (bookCounts[b] || 0) + 1;
    });
    history.forEach((h) => {
      if (h.livre) bookCounts[h.livre] = (bookCounts[h.livre] || 0) + 1;
    });
    const favouriteBook =
      Object.keys(bookCounts).sort((a, b) => bookCounts[b] - bookCounts[a])[0] ||
      "Aucun";

    const states: Record<string, number> = {};
    selah.forEach((s) => {
      if (s.state) states[s.state] = (states[s.state] || 0) + 1;
    });
    const selahMood =
      Object.keys(states).sort((a, b) => states[b] - states[a])[0] || "Aucun";

    const answered = topics.filter((t) => t.answeredAt).length;

    // Moment de la journée : sur TOUT le journal (pas les 20 derniers)
    // + temps de lecture par jour si présent. "—" si aucune donnée.
    let morning = 0,
      afternoon = 0,
      evening = 0,
      night = 0;
    journal.forEach((e) => {
      const hour = new Date(e.createdAt).getHours();
      if (hour >= 5 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else if (hour >= 18 && hour < 23) evening++;
      else night++;
    });
    let readingTimeOfDay = "—";
    const maxTime = Math.max(morning, afternoon, evening, night);
    if (maxTime > 0) {
      if (maxTime === morning) readingTimeOfDay = "Le matin";
      else if (maxTime === afternoon) readingTimeOfDay = "L'après-midi";
      else if (maxTime === evening) readingTimeOfDay = "Le soir";
      else readingTimeOfDay = "La nuit";
    }

    let currentStreak = 0;
    let longestStreak = 0;
    try {
      const s = getStreak();
      currentStreak = s?.current || 0;
      longestStreak = s?.longest || 0;
    } catch {
      // ignore
    }

    // --- 5 NOUVEAUTÉS (calculs) ---
    // 1) Objectif du jour : 15 min + 1 chapitre
    const goalMinPct = Math.min(100, (todaySeconds / 60 / DAILY_MINUTES_GOAL) * 100);
    const goalChapPct = Math.min(100, (chaptersToday / DAILY_CHAPTERS_GOAL) * 100);
    const goalDone = todaySeconds / 60 >= DAILY_MINUTES_GOAL && chaptersToday >= DAILY_CHAPTERS_GOAL;

    // 2) Série 7 jours (jours actifs réels)
    const activeSet = getActiveDaysSet(
      selah.map((s) => s.date).filter(Boolean)
    );
    const weekDots: { key: string; label: string; active: boolean; today: boolean }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const key = getLocalDayKeyOffset(-i);
      const d = new Date();
      d.setDate(d.getDate() - i);
      weekDots.push({
        key,
        label: ["D", "L", "M", "M", "J", "V", "S"][d.getDay()],
        active: activeSet.has(key),
        today: i === 0,
      });
    }

    // 3) Moyenne 7 jours (minutes)
    const avg7Min = (reading?.avg7Seconds ?? 0) / 60;

    // 4) Records
    const bestDay = reading?.bestDay ?? null;
    const bestDayMin = bestDay ? Math.floor(bestDay.seconds / 60) : 0;

    // 5) Niveau lecteur
    const level = getReaderLevel(chaptersRead);

    return {
      chaptersRead,
      chaptersToday,
      verseMarks,
      totalSeconds,
      todaySeconds,
      weekSeconds,
      favouriteBook,
      selahMood,
      answered,
      readingTimeOfDay,
      currentStreak,
      longestStreak,
      totalPrayers: topics.length,
      goalMinPct,
      goalChapPct,
      goalDone,
      weekDots,
      avg7Min,
      bestDay,
      bestDayMin,
      level,
      activeDays7: reading?.activeDays7 ?? 0,
    };
  }, [data]);

  // --- 2. Calendrier (comparaison en heure LOCALE, pas toISOString/UTC) ---
  const calendar = useMemo(() => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + calOffset, 1, 12);
    const y = base.getFullYear();
    const m = base.getMonth();
    const label = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(base);
    const firstDay = new Date(y, m, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0
    const start = new Date(y, m, 1 - mondayOffset, 12);

    const journalDays = new Set(
      data.journal.map((e) => getLocalDayKey(new Date(e.createdAt)))
    );
    const selahDays = new Set(data.selah.map((s) => s.date).filter(Boolean));
    const readingDays = getActiveDaysSet();

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i,
        12
      );
      const key = getLocalDayKey(d);
      const hasActivity =
        journalDays.has(key) || selahDays.has(key) || readingDays.has(key);
      cells.push({
        key,
        day: d.getDate(),
        inMonth: d.getMonth() === m,
        hasActivity,
      });
    }
    // Masque la 6e semaine si vide (mois à 5 semaines)
    const lastRow = cells.slice(35);
    const lastRowEmpty =
      lastRow.every((c) => !c.inMonth) || lastRow.every((c) => !c.hasActivity && !c.inMonth);
    return {
      label,
      cells: lastRowEmpty ? cells.slice(0, 35) : cells,
      todayKey: getLocalDayKey(today),
    };
  }, [calOffset, data]);

  const dowHeaders = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
      {/* --- CARTES DE STATS --- */}
      <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
        <StatCard
          title="Série actuelle"
          value={`${stats.currentStreak} j`}
          icon="flame"
        />
        <StatCard
          title="Chapitres lus"
          value={String(stats.chaptersRead)}
          icon="book"
        />
        {/* Temps RÉEL mesuré (plus jamais bloqué à 0 h) */}
        <StatCard
          title="Temps de lecture"
          value={formatMinutes(stats.totalSeconds)}
          icon="clock"
        />
        <StatCard
          title="Moment favori"
          value={stats.readingTimeOfDay}
          icon="sun"
        />
      </div>

      {/* --- 🆕 1. OBJECTIF DU JOUR --- */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:col-span-2 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
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
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Objectif du jour
          </h3>
          {stats.goalDone ? (
            <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent)]">
              Atteint ✓
            </span>
          ) : (
            <span className="text-[11px] text-[var(--muted)]">
              {Math.floor(stats.todaySeconds / 60)} / {DAILY_MINUTES_GOAL} min ·{" "}
              {stats.chaptersToday} / {DAILY_CHAPTERS_GOAL} chap.
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <GoalRow
            label="Lecture"
            pct={stats.goalMinPct}
            detail={`${formatMinutes(stats.todaySeconds)} / ${DAILY_MINUTES_GOAL} min`}
          />
          <GoalRow
            label="Chapitres"
            pct={stats.goalChapPct}
            detail={`${stats.chaptersToday} / ${DAILY_CHAPTERS_GOAL}`}
          />
        </div>
        {!stats.goalDone && (
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            Lis un chapitre pour faire grimper ta série et ton temps de lecture.
          </p>
        )}
      </div>

      {/* --- CALENDRIER --- */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCalOffset((o) => o - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--foreground)]"
            aria-label="Mois précédent"
          >
            ‹
          </button>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] capitalize">
            {calendar.label}
          </h3>
          <button
            type="button"
            onClick={() => setCalOffset((o) => Math.min(0, o + 1))}
            disabled={calOffset >= 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--foreground)] disabled:opacity-30"
            aria-label="Mois suivant"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {dowHeaders.map((d, i) => (
            <div
              key={i}
              className="pb-2 text-center text-[10px] md:text-xs font-bold uppercase text-[var(--muted)]"
            >
              {d}
            </div>
          ))}
          {calendar.cells.map((c) => (
            <div
              key={c.key}
              title={c.key}
              className={`flex aspect-square items-center justify-center rounded-lg md:rounded-xl border text-xs md:text-sm ${
                !c.inMonth
                  ? "border-transparent opacity-20"
                  : c.hasActivity
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 font-bold text-[var(--color-accent)]"
                    : c.key === calendar.todayKey
                      ? "border-dashed border-[var(--color-accent)] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {/* 🌿 Feuille verte conservée (ne pas passer en SVG) */}
              {c.hasActivity ? "🌿" : c.day}
            </div>
          ))}
        </div>
      </div>

      {/* --- COLONNE DE DROITE --- */}
      <div className="flex flex-col gap-4">
        {/* 🆕 2. SÉRIE 7 JOURS */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Cette semaine
          </h3>
          <p className="mb-4 text-[11px] text-[var(--muted)]">
            {stats.activeDays7} jour{stats.activeDays7 > 1 ? "s" : ""} actif
            {stats.activeDays7 > 1 ? "s" : ""} · série {stats.currentStreak} j
            (record {stats.longestStreak} j)
          </p>
          <div className="flex items-center justify-between gap-1.5">
            {stats.weekDots.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all ${
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
                      className="h-4 w-4"
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
        </div>

        {/* 🆕 3. TEMPS CETTE SEMAINE + MOYENNE */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Rythme de lecture
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat
              value={formatMinutes(stats.todaySeconds)}
              label="Aujourd'hui"
            />
            <MiniStat
              value={formatMinutes(stats.weekSeconds)}
              label="7 jours"
            />
            <MiniStat
              value={
                stats.avg7Min < 1
                  ? stats.avg7Min > 0
                    ? "<1 min"
                    : "0 min"
                  : `${Math.round(stats.avg7Min)} min`
              }
              label="Moy./jour"
            />
          </div>
        </div>

        {/* Livre le plus exploré & Versets */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Livre le plus exploré
          </h3>
          <p className="text-lg font-bold text-[var(--color-accent)]">
            {stats.favouriteBook}
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {stats.chaptersRead} chapitre{stats.chaptersRead > 1 ? "s" : ""} lu
            {stats.chaptersRead > 1 ? "s" : ""} · {stats.verseMarks} verset
            {stats.verseMarks > 1 ? "s" : ""} marqué
            {stats.verseMarks > 1 ? "s" : ""}
          </p>
        </div>

        {/* 🆕 4. RECORDS */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Records
          </h3>
          <div className="flex flex-col gap-2.5">
            <RecordRow
              icon="clock"
              label="Meilleur jour"
              value={
                stats.bestDay
                  ? `${formatMinutes(stats.bestDay.seconds)}`
                  : "—"
              }
            />
            <RecordRow
              icon="flame"
              label="Plus longue série"
              value={`${stats.longestStreak} j`}
            />
            <RecordRow
              icon="book"
              label="Total chapitres"
              value={String(stats.chaptersRead)}
            />
          </div>
        </div>

        {/* Bilan spirituel */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Bilan spirituel
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">
                État du cœur
              </span>
              <span className="font-semibold text-[var(--color-accent)] capitalize">
                {stats.selahMood}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">
                Prières exaucées
              </span>
              <span className="font-semibold text-[var(--color-accent)]">
                {stats.answered} / {stats.totalPrayers}
              </span>
            </div>
          </div>
        </div>

        {/* 🆕 5. NIVEAU LECTEUR */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              Niveau lecteur
            </h3>
            <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent)]">
              {stats.level.name}
            </span>
          </div>
          {stats.level.next ? (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(stats.level.progress * 100)}%`,
                    background: "var(--color-accent)",
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[var(--muted)]">
                Plus que {stats.level.remaining} chapitre
                {stats.level.remaining > 1 ? "s" : ""} pour devenir «{" "}
                {stats.level.next} ».
              </p>
            </>
          ) : (
            <p className="text-[11px] text-[var(--muted)]">
              Niveau maximum atteint. Respect 🙏
            </p>
          )}
        </div>

        {/* Trophées (étendus) */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Trophées
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge title="Premier chapitre" unlocked={stats.chaptersRead > 0} />
            <Badge
              title="Série de 7 jours"
              unlocked={stats.currentStreak >= 7}
            />
            <Badge
              title="10 chapitres lus"
              unlocked={stats.chaptersRead >= 10}
            />
            <Badge
              title="Premier Selah"
              unlocked={stats.selahMood !== "Aucun"}
            />
            <Badge title="Prière exaucée" unlocked={stats.answered > 0} />
            {/* 🆕 nouveaux */}
            <Badge
              title="15 min en un jour"
              unlocked={stats.todaySeconds >= 15 * 60 || stats.totalSeconds >= 15 * 60}
            />
            <Badge
              title="50 chapitres"
              unlocked={stats.chaptersRead >= 50}
            />
            <Badge
              title="3 jours actifs / 7"
              unlocked={stats.activeDays7 >= 3}
            />
            <Badge
              title="Objectif du jour"
              unlocked={stats.goalDone}
            />
            <Badge
              title="10 versets marqués"
              unlocked={stats.verseMarks >= 10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Composants utilitaires (SVG stroke uniquement, style épuré) ---

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 md:p-4 text-center">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--color-accent)] md:h-10 md:w-10">
        {icon === "flame" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 md:h-5 md:w-5"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        )}
        {icon === "book" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 md:h-5 md:w-5"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        )}
        {icon === "clock" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 md:h-5 md:w-5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
        {icon === "sun" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 md:h-5 md:w-5"
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
        )}
      </div>
      <span className="text-base md:text-lg font-bold text-[var(--foreground)]">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
        {title}
      </span>
    </div>
  );
}

function GoalRow({
  label,
  pct,
  detail,
}: {
  label: string;
  pct: number;
  detail: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="text-[var(--muted)]">{detail}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: "var(--color-accent)",
          }}
        />
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] px-2 py-3">
      <div className="text-sm font-bold text-[var(--foreground)]">{value}</div>
      <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}

function RecordRow({
  icon,
  label,
  value,
}: {
  icon: "clock" | "flame" | "book";
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-hover)] text-[var(--color-accent)]">
        {icon === "clock" && (
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
        {icon === "flame" && (
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
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        )}
        {icon === "book" && (
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
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        )}
      </div>
      <span className="flex-1 text-sm text-[var(--foreground)]">{label}</span>
      <span className="text-sm font-bold text-[var(--color-accent)]">
        {value}
      </span>
    </div>
  );
}

function Badge({
  title,
  unlocked,
}: {
  title: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        unlocked
          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)] opacity-50"
      }`}
    >
      {unlocked ? (
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
      ) : (
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
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        </svg>
      )}
      {title}
    </div>
  );
}
