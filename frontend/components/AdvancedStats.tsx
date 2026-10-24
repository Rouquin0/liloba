"use client";

import { useEffect, useState } from "react";
import { getJournal } from "@/lib/journal";
import { getHistory } from "@/lib/history";
import { getSelahEntries } from "@/lib/selah";
import { getPrayerTopics } from "@/lib/selah-topics";
import { getStreak } from "@/lib/stats";

export default function AdvancedStats() {
  const [stats, setStats] = useState({
    chaptersRead: 0,
    readingTimeHours: 0,
    favouriteBook: "Aucun pour l'instant",
    topVerses: [] as string[],
    selahMood: "Aucun",
    prayersAnswered: 0,
    prayersTotal: 0,
    readingTimeOfDay: "Inconnu",
    heatmap: [] as { date: string; level: number }[],
  });

  useEffect(() => {
    // 1. Récupération des données locales
    const journal = getJournal();
    const history = getHistory();
    const selah = getSelahEntries();
    const topics = getPrayerTopics();

    // 2. Chapitres lus
    const chaptersRead = journal.filter((e) => e.type === "chapter_read").length;
    const readingTimeHours = Math.round((chaptersRead * 3) / 60); // 1 chapitre = ~3 min

    // 3. Livre préféré
    const bookCounts: Record<string, number> = {};
    history.forEach((h) => {
      bookCounts[h.livre] = (bookCounts[h.livre] || 0) + 1;
    });
    const favouriteBook = Object.keys(bookCounts).sort((a, b) => bookCounts[b] - bookCounts[a])[0] || "Aucun";

    // 4. Top versets (on prend les 3 derniers versets ajoutés à l'historique)
    const topVerses = history.slice(0, 3).map((h) => h.reference);

    // 5. Météo du cœur (Selah)
    const states: Record<string, number> = {};
    selah.forEach((s) => {
      states[s.state] = (states[s.state] || 0) + 1;
    });
    const selahMood = Object.keys(states).sort((a, b) => states[b] - states[a])[0] || "Aucun";

    // 6. Prières exaucées
    const answered = topics.filter((t) => t.answeredAt).length;

    // 7. Habitude de lecture (basée sur l'heure des 20 dernières actions)
    const recentJournal = journal.slice(0, 20);
    let morning = 0, afternoon = 0, evening = 0, night = 0;
    recentJournal.forEach((e) => {
      const hour = new Date(e.createdAt).getHours();
      if (hour >= 5 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else if (hour >= 18 && hour < 23) evening++;
      else night++;
    });
    const maxTime = Math.max(morning, afternoon, evening, night);
    let readingTimeOfDay = "Équilibré";
    if (maxTime === morning) readingTimeOfDay = "Le matin";
    else if (maxTime === afternoon) readingTimeOfDay = "L'après-midi";
    else if (maxTime === evening) readingTimeOfDay = "Le soir";
    else if (maxTime === night) readingTimeOfDay = "La nuit";

    // 8. Heatmap (30 derniers jours)
    const heatmap = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const hasActivity = journal.some((e) => new Date(e.createdAt).toISOString().startsWith(dateStr)) || 
                          selah.some((s) => s.date === dateStr);
      heatmap.push({ date: dateStr, level: hasActivity ? 1 : 0 });
    }

    setStats({
      chaptersRead,
      readingTimeHours,
      favouriteBook,
      topVerses,
      selahMood,
      prayersAnswered: answered,
      prayersTotal: topics.length,
      readingTimeOfDay,
      heatmap,
    });
  }, []);

  const currentStreak = typeof window !== "undefined" ? (getStreak()?.current || 0) : 0;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* 1. En-tête des séries */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard title="Série actuelle" value={`${currentStreak} j`} icon="flame" />
        <StatCard title="Chapitres lus" value={String(stats.chaptersRead)} icon="book" />
        <StatCard title="Temps de lecture" value={`${stats.readingTimeHours} h`} icon="clock" />
        <StatCard title="Moment favori" value={stats.readingTimeOfDay} icon="sun" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Heatmap */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Activité des 30 derniers jours</h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.heatmap.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`h-6 w-6 rounded-md ${day.level > 0 ? "bg-green-500/80" : "bg-[var(--surface-hover)]"}`}
              />
            ))}
          </div>
        </div>

        {/* 3. Livre préféré & Versets */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between">
          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Livre le plus exploré</h3>
            <p className="text-lg font-bold text-[var(--foreground)]">{stats.favouriteBook}</p>
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Derniers versets marqués</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topVerses.length > 0 ? stats.topVerses.map((v, i) => (
                <span key={i} className="rounded-lg bg-[var(--surface-hover)] px-2 py-1 text-xs font-medium text-[var(--foreground)]">{v}</span>
              )) : <span className="text-xs text-[var(--muted)]">Aucun verset pour l'instant.</span>}
            </div>
          </div>
        </div>

        {/* 4. Selah & Prières */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Bilan spirituel</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">État du cœur le plus fréquent</span>
              <span className="font-semibold text-[var(--color-accent)] capitalize">{stats.selahMood}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">Prière exaucées</span>
              <span className="font-semibold text-[var(--color-accent)]">{stats.prayersAnswered} / {stats.prayersTotal}</span>
            </div>
          </div>
        </div>

        {/* 5. Badges */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Trophées</h3>
          <div className="flex flex-wrap gap-2">
            <Badge title="Premier chapitre" unlocked={stats.chaptersRead > 0} />
            <Badge title="Série de 7 jours" unlocked={currentStreak >= 7} />
            <Badge title="10 chapitres lus" unlocked={stats.chaptersRead >= 10} />
            <Badge title="Premier Selah" unlocked={stats.selahMood !== "Aucun"} />
            <Badge title="Prière exaucée" unlocked={stats.prayersAnswered > 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Composants utilitaires ---

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--color-accent)]">
        {icon === "flame" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
        {icon === "book" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>}
        {icon === "clock" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        {icon === "sun" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>}
      </div>
      <span className="text-lg font-bold text-[var(--foreground)]">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">{title}</span>
    </div>
  );
}

function Badge({ title, unlocked }: { title: string; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${unlocked ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)] opacity-50"}`}>
      {unlocked ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path d="M20 6 9 17l-5-5"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
      )}
      {title}
    </div>
  );
}
