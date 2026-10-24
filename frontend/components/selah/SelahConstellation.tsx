"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SelahEntry } from "@/lib/selah";
import type { PrayerTopic } from "@/lib/selah-topics";
import { SELAH_STATES } from "@/lib/selah-content";
import {
  SKY_COLORS,
  SKY_ORDER,
  buildSky,
  constellationName,
} from "@/lib/selah-constellation";

// ============================================================
// SELAH · Constellation de l'âme
// Chaque pause du soir devient une étoile. Le ciel se dessine
// tout seul, hors ligne, à partir de tes données locales.
// ============================================================

const UI = {
  fr: {
    title: "Ta constellation",
    hint: "Chaque pause est une étoile. Plus haut, un cœur lumineux ; plus bas, une saison plus sèche.",
    r30: "30 jours",
    r90: "90 jours",
    inProgress: "Constellation en cours",
    stars: (n: number, d: number) =>
      `${n} étoile${n > 1 ? "s" : ""} sur les ${d} derniers jours`,
    empty: "Aucune étoile sur cette période. Ta prochaine pause en allumera une.",
    aria: (n: number, d: number) => `Constellation : ${n} pauses sur ${d} jours`,
    answered: "Prière exaucée",
    bridge: "Jour sauvé",
    thanks: "Merci pour",
    note: "Ma note",
    step: "Pas",
    close: "Fermer",
    locale: "fr-FR",
    today: "ce soir",
  },
  en: {
    title: "Your constellation",
    hint: "Each pause is a star. Higher means a brighter heart; lower, a drier season.",
    r30: "30 days",
    r90: "90 days",
    inProgress: "Current constellation",
    stars: (n: number, d: number) => `${n} star${n > 1 ? "s" : ""} over the last ${d} days`,
    empty: "No stars in this period. Your next pause will light one.",
    aria: (n: number, d: number) => `Constellation: ${n} pauses over ${d} days`,
    answered: "Answered prayer",
    bridge: "Day saved",
    thanks: "Thankful for",
    note: "My note",
    step: "Step",
    close: "Close",
    locale: "en-US",
    today: "tonight",
  },
};

interface Props {
  entries: SelahEntry[];
  shields: string[];
  topics: PrayerTopic[];
  today: string;
  streak: number;
  lang: "fr" | "en";
}

/** Largeur réelle du conteneur (le dessin se calcule en pixels, jamais étiré). */
function useWidth(ref: React.RefObject<HTMLDivElement | null>, fallback = 640) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Étincelle à 4 branches (prière exaucée). */
function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  const p = `M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s}Z`;
  return <path d={p} transform={`translate(${x} ${y})`} fill="#f5d77a" opacity="0.95" />;
}

export default function SelahConstellation({
  entries,
  shields,
  topics,
  today,
  streak,
  lang,
}: Props) {
  const l = UI[lang];
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useWidth(wrapRef);
  const height = width < 520 ? 250 : 300;
  const [windowDays, setWindowDays] = useState<30 | 90>(30);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sky = useMemo(
    () => buildSky({ entries, shields, topics, today, windowDays, width, height }),
    [entries, shields, topics, today, windowDays, width, height]
  );

  const selected = sky.stars.find((s) => s.id === selectedId) ?? null;
  const selectedEntry = selected ? entries.find((e) => e.id === selected.id) ?? null : null;
  const name = constellationName(streak, lang);

  const fmt = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(l.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(y, m - 1, d, 12));
  };
  const stateLabel = (id: string) => {
    const s = SELAH_STATES.find((x) => x.id === id);
    return s ? (lang === "en" ? s.en : s.fr) : id;
  };

  return (
    <section
      className="overflow-hidden rounded-3xl border border-[var(--border)] p-4 md:p-6"
      style={{
        background: "linear-gradient(180deg, #0b1026 0%, #1b2340 55%, #2b1a3a 100%)",
        color: "#f5efe4",
      }}
      aria-label={l.title}
    >
      <style>{`
        @keyframes selah-twinkle { 0%,100% { opacity: .25 } 50% { opacity: .95 } }
        @keyframes selah-halo { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        .selah-twinkle { animation: selah-twinkle 4.5s ease-in-out infinite; }
        .selah-halo { transform-box: fill-box; transform-origin: center; animation: selah-halo 2.8s ease-out infinite; }
        .selah-star:focus-visible circle.selah-ring { stroke: #fff; stroke-width: 1.5; }
        @media (prefers-reduced-motion: reduce) {
          .selah-twinkle, .selah-halo { animation: none !important; }
        }
      `}</style>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d4af37" }}>
            {l.title}
          </p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-[#cfc4ad] md:text-sm">
            {l.hint}
          </p>
        </div>
        <div
          className="flex gap-1 rounded-full border p-1"
          style={{ borderColor: "#ffffff22", background: "#ffffff0a" }}
          role="radiogroup"
          aria-label={l.title}
        >
          {([30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={windowDays === d}
              onClick={() => {
                setWindowDays(d);
                setSelectedId(null);
              }}
              className="min-h-[36px] rounded-full px-3 text-xs font-semibold transition-colors"
              style={
                windowDays === d
                  ? { background: "#f5efe4", color: "#0b1026" }
                  : { color: "#cfc4ad" }
              }
            >
              {d === 30 ? l.r30 : l.r90}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} className="mt-3 w-full">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={l.aria(sky.stars.length, windowDays)}
          className="block max-w-full"
        >
          {/* poussière d'étoiles */}
          {sky.dust.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#f5efe4"
              opacity={d.o}
              className={d.twinkle ? "selah-twinkle" : undefined}
              style={d.twinkle ? { animationDelay: `${(i % 7) * 0.6}s` } : undefined}
            />
          ))}

          {/* repère « ce soir » */}
          <line
            x1={sky.todayX}
            x2={sky.todayX}
            y1={14}
            y2={height - 14}
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeDasharray="2 5"
          />

          {/* traits entre nuits consécutives */}
          {sky.links.map((k) => (
            <line
              key={k.key}
              x1={k.x1}
              y1={k.y1}
              x2={k.x2}
              y2={k.y2}
              stroke={k.color}
              strokeOpacity={k.bridge ? 0.55 : 0.5}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray={k.bridge ? "3 4" : undefined}
            />
          ))}

          {/* étoiles */}
          {sky.stars.map((s) => {
            const active = s.id === selectedId;
            return (
              <g
                key={s.id}
                className="selah-star"
                tabIndex={0}
                role="button"
                aria-label={`${fmt(s.date)} · ${stateLabel(s.state)}`}
                aria-pressed={active}
                onClick={() => setSelectedId(active ? null : s.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(active ? null : s.id);
                  }
                }}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {/* zone de toucher confortable */}
                <circle cx={s.x} cy={s.y} r={15} fill="transparent" className="selah-ring" />
                {s.isToday && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={7}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="1"
                    className="selah-halo"
                  />
                )}
                <circle cx={s.x} cy={s.y} r={s.r * 2.6} fill={s.color} opacity={active ? 0.3 : 0.14} />
                <circle cx={s.x} cy={s.y} r={s.r} fill={s.color} />
                <circle cx={s.x} cy={s.y} r={Math.max(1, s.r * 0.38)} fill="#ffffff" opacity="0.9" />
                {active && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={s.r + 6}
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.8"
                    strokeWidth="1"
                  />
                )}
                {s.answered && <Sparkle x={s.x + s.r + 5} y={s.y - s.r - 5} s={6} />}
              </g>
            );
          })}
        </svg>
      </div>

      {sky.stars.length === 0 && (
        <p className="mt-1 text-center text-xs text-[#cfc4ad]">{l.empty}</p>
      )}

      {/* détail de l'étoile touchée */}
      {selected && selectedEntry && (
        <div
          className="mt-3 rounded-2xl border p-4 text-sm"
          style={{ borderColor: `${selected.color}66`, background: "#ffffff0d" }}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: selected.color }}>
                {stateLabel(selected.state)}
                {selected.isToday ? ` · ${l.today}` : ""}
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize">{fmt(selected.date)}</p>
              {selectedEntry.ref && (
                <p className="mt-0.5 text-xs text-[#cfc4ad]">{selectedEntry.ref}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={l.close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[#cfc4ad] transition-colors hover:text-white"
              style={{ borderColor: "#ffffff22" }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {selectedEntry.gratitudes.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#8f846e]">{l.thanks}</p>
              <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[#f5efe4]">
                {selectedEntry.gratitudes.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedEntry.note && (
            <p className="mt-3 border-l-2 pl-3 text-xs italic text-[#cfc4ad]" style={{ borderColor: selected.color }}>
              {selectedEntry.note}
            </p>
          )}
          {selected.answered && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#f5d77a" }}>
              <svg viewBox="-8 -8 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M0 -7 Q0 0 7 0 Q0 0 0 7 Q0 0 -7 0 Q0 0 0 -7Z" fill="currentColor" />
              </svg>
              {l.answered}
            </p>
          )}
        </div>
      )}

      {/* légende + nom de la constellation */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-xs text-[#cfc4ad]">
          {l.stars(sky.stars.length, windowDays)}
          {name && (
            <>
              {" · "}
              <span className="font-semibold" style={{ color: "#d4af37" }}>
                {l.inProgress} : {name}
              </span>
            </>
          )}
        </p>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#cfc4ad]" aria-hidden="true">
          {SKY_ORDER.map((id) => (
            <li key={id} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: SKY_COLORS[id] }} />
              {stateLabel(id)}
            </li>
          ))}
          <li className="flex items-center gap-1">
            <svg viewBox="-8 -8 16 16" className="h-3 w-3" aria-hidden="true">
              <path d="M0 -7 Q0 0 7 0 Q0 0 0 7 Q0 0 -7 0 Q0 0 0 -7Z" fill="#f5d77a" />
            </svg>
            {l.answered}
          </li>
          <li className="flex items-center gap-1">
            <svg viewBox="0 0 16 6" className="h-2 w-4" aria-hidden="true">
              <line x1="1" y1="3" x2="15" y2="3" stroke="#cfc4ad" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
            {l.bridge}
          </li>
        </ul>
      </div>
    </section>
  );
}
