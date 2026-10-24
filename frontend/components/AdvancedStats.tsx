"use client";

import { useEffect, useState, useMemo } from "react";
import { getJournal } from "@/lib/journal";
import { getHistory } from "@/lib/history";
import { getSelahEntries } from "@/lib/selah";
import { getPrayerTopics } from "@/lib/selah-topics";
import { getStreak } from "@/lib/stats";

export default function AdvancedStats() {
  const [calOffset, setCalOffset] = useState(0);
  const [data, setData] = useState({
    journal: [] as any[],
    history: [] as any[],
    selah: [] as any[],
    topics: [] as any[],
  });

  useEffect(() => {
    setData({
      journal: getJournal(),
      history: getHistory(),
      selah: getSelahEntries(),
      topics: getPrayerTopics(),
    });
  }, []);

  // --- 1. Calculs des statistiques globales ---
  const stats = useMemo(() => {
    const { journal, history, selah, topics } = data;
    const chaptersRead = journal.filter((e) => e.type === "chapter_read").length;
    const readingTimeHours = Math.round((chaptersRead * 3) / 60);

    const bookCounts: Record<string, number> = {};
    history.forEach((h) => (bookCounts[h.livre] = (bookCounts[h.livre] || 0) + 1));
    const favouriteBook = Object.keys(bookCounts).sort((a, b) => bookCounts[b] - bookCounts[a])[0] || "Aucun";

    const states: Record<string, number> = {};
    selah.forEach((s) => (states[s.state] = (states[s.state] || 0) + 1));
    const selahMood = Object.keys(states).sort((a, b) => states[b] - states[a])[0] || "Aucun";

    const answered = topics.filter((t) => t.answeredAt).length;

    // Moment de la journée
    let morning = 0, afternoon = 0, evening = 0, night = 0;
    journal.slice(0, 20).forEach((e) => {
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

    const currentStreak = typeof window !== "undefined" ? (getStreak()?.current || 0) : 0;

    return { chaptersRead, readingTimeHours, favouriteBook, selahMood, answered, readingTimeOfDay, currentStreak, totalPrayers: topics.length };
  }, [data]);

  // --- 2. Calcul du calendrier (comme Selah) ---
  const calendar = useMemo(() => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + calOffset, 1, 12);
    const y = base.getFullYear();
    const m = base.getMonth();
    const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(base);
    const firstDay = new Date(y, m, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0
    const start = new Date(y, m, 1 - mondayOffset, 12);
    
    // On génère 35 ou 42 jours selon le mois
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      // Vérifier si on a lu ou fait Selah ce jour-là
      const hasActivity = 
        data.selah.some((s) => s.date === key) || 
        data.journal.some((e) => new Date(e.createdAt).toISOString().startsWith(key));
      
      cells.push({ key, day: d.getDate(), inMonth: d.getMonth() === m, hasActivity });
    }
    return { label, cells, todayKey: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}` };
  }, [calOffset, data]);

  const dowHeaders = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
      
      {/* --- CARTES DE STATS (en haut sur mobile, pleine largeur sur desktop) --- */}
      <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
        <StatCard title="Série actuelle" value={`${stats.currentStreak} j`} icon="flame" />
        <StatCard title="Chapitres lus" value={String(stats.chaptersRead)} icon="book" />
        <StatCard title="Temps de lecture" value={`${stats.readingTimeHours} h`} icon="clock" />
        <StatCard title="Moment favori" value={stats.readingTimeOfDay} icon="sun" />
      </div>

      {/* --- CALENDRIER (Pleine largeur mobile / Demi-largeur desktop) --- */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button onClick={() => setCalOffset((o) => o - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]">‹</button>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] capitalize">{calendar.label}</h3>
          <button onClick={() => setCalOffset((o) => Math.min(0, o + 1))} disabled={calOffset >= 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)] disabled:opacity-30">›</button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {dowHeaders.map((d, i) => (
            <div key={i} className="pb-2 text-center text-[10px] md:text-xs font-bold uppercase text-[var(--muted)]">{d}</div>
          ))}
          {calendar.cells.map((c) => (
            <div
              key={c.key}
              className={`flex aspect-square items-center justify-center rounded-lg md:rounded-xl border text-xs md:text-sm ${
                !c.inMonth ? "border-transparent opacity-20" 
                : c.hasActivity ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 font-bold text-[var(--color-accent)]" 
                : c.key === calendar.todayKey ? "border-dashed border-[var(--color-accent)] text-[var(--foreground)]" 
                : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {c.hasActivity ? "🌿" : c.day}
            </div>
          ))}
        </div>
      </div>

      {/* --- COLONNE DE DROITE (Desktop) / En bas (Mobile) --- */}
      <div className="flex flex-col gap-4">
        
        {/* Livre favori & Versets */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Livre le plus exploré</h3>
          <p className="text-lg font-bold text-[var(--color-accent)]">{stats.favouriteBook}</p>
        </div>

        {/* Bilan spirituel */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Bilan spirituel</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">État du cœur</span>
              <span className="font-semibold text-[var(--color-accent)] capitalize">{stats.selahMood}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">Prières exaucées</span>
              <span className="font-semibold text-[var(--color-accent)]">{stats.answered} / {stats.totalPrayers}</span>
            </div>
          </div>
        </div>

        {/* Trophées */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Trophées</h3>
          <div className="flex flex-wrap gap-2">
            <Badge title="Premier chapitre" unlocked={stats.chaptersRead > 0} />
            <Badge title="Série de 7 jours" unlocked={stats.currentStreak >= 7} />
            <Badge title="10 chapitres lus" unlocked={stats.chaptersRead >= 10} />
            <Badge title="Premier Selah" unlocked={stats.selahMood !== "Aucun"} />
            <Badge title="Prière exaucée" unlocked={stats.answered > 0} />
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Composants utilitaires ---

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 md:p-4 text-center">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--color-accent)] md:h-10 md:w-10">
        {icon === "flame" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 md:h-5 md:w-5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
        {icon === "book" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 md:h-5 md:w-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>}
        {icon === "clock" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 md:h-5 md:w-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        {icon === "sun" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 md:h-5 md:w-5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>}
      </div>
      <span className="text-base md:text-lg font-bold text-[var(--foreground)]">{value}</span>
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
