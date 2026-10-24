"use client";

import { useEffect, useMemo, useState } from "react";
import type { SoulState } from "@/lib/selah-content";
import {
  duckAmbient,
  isAmbientSupported,
  startAmbient,
  stopAmbient,
  swellAmbient,
} from "@/lib/selah-ambient";
import { setAmbient, setBreath } from "@/lib/selah-prefs";
import { prefersReducedMotion } from "@/lib/selah-timer";

// ============================================================
// SELAH · Ambiance vivante + souffle guidé
//  • Ambiance : paysage sonore généré en direct selon l'état du cœur
//  • Souffle  : anneau qui guide 4 s inspire · 2 s retiens · 6 s expire,
//               le son respire avec toi, et le téléphone vibre doucement
// ============================================================

type PrayerPhase = "idle" | "running" | "paused" | "done";

const UI = {
  fr: {
    ambient: "Ambiance sonore vivante",
    ambientHint: "Un son généré pour ton cœur, rien à télécharger",
    breath: "Guide de souffle",
    breathHint: "Respire avec l'anneau",
    in: "Inspire",
    hold: "Retiens",
    out: "Expire",
    rest: "Souffle",
    paused: "Pause",
  },
  en: {
    ambient: "Living soundscape",
    ambientHint: "A sound generated for your heart, nothing to download",
    breath: "Breathing guide",
    breathHint: "Breathe with the ring",
    in: "Breathe in",
    hold: "Hold",
    out: "Breathe out",
    rest: "Breath",
    paused: "Paused",
  },
};

// Cycle de 12 s, aligné sur l'horloge : plusieurs anneaux restent synchronisés.
const IN_MS = 4000;
const HOLD_MS = 2000;
const CYCLE_MS = 12000;

type Seg = "in" | "hold" | "out";

function segmentNow(): { seg: Seg; remaining: number } {
  const t = Date.now() % CYCLE_MS;
  if (t < IN_MS) return { seg: "in", remaining: IN_MS - t };
  if (t < IN_MS + HOLD_MS) return { seg: "hold", remaining: IN_MS + HOLD_MS - t };
  return { seg: "out", remaining: CYCLE_MS - t };
}

// ------------------------------------------------------------
// Anneau de souffle
// ------------------------------------------------------------

export function SelahBreathRing({
  active,
  lang,
  accent,
  drive = true,
  size = 132,
}: {
  active: boolean;
  lang: "fr" | "en";
  accent: string;
  /** Un seul anneau pilote le son et les vibrations (évite les doublons). */
  drive?: boolean;
  size?: number;
}) {
  const l = UI[lang];
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const [state, setState] = useState<{ seg: Seg | "rest"; dur: number }>({ seg: "rest", dur: 0 });

  useEffect(() => {
    if (!active) return;
    let id = 0;
    const tick = () => {
      const { seg, remaining } = segmentNow();
      setState({ seg, dur: remaining });
      if (drive) {
        swellAmbient(seg, remaining / 1000);
        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(seg === "in" ? 35 : seg === "out" ? 20 : 0);
          }
        } catch {
          // ignore
        }
      }
      id = window.setTimeout(tick, remaining + 20);
    };
    tick();
    return () => window.clearTimeout(id);
  }, [active, drive]);

  // Hors prière active : l'anneau se détend (pas d'état à réinitialiser dans l'effet)
  const view: { seg: Seg | "rest"; dur: number } = active ? state : { seg: "rest", dur: 600 };
  const scale = view.seg === "in" || view.seg === "hold" ? 1 : 0.55;
  const label = view.seg === "rest" ? (active ? l.rest : l.paused) : l[view.seg];

  return (
    <div className="flex flex-col items-center gap-1" aria-live="off">
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle cx="60" cy="60" r="54" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="60" cy="60" r="54" fill="none" stroke="#f5efe4" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 6" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill={accent}
          fillOpacity="0.28"
          stroke={accent}
          strokeOpacity="0.9"
          strokeWidth="1.5"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: `scale(${scale})`,
            transition: reduced
              ? "none"
              : `transform ${view.dur}ms ${view.seg === "hold" ? "linear" : "ease-in-out"}`,
          }}
        />
        <text
          x="60"
          y="64"
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#f5efe4"
          style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

// ------------------------------------------------------------
// Interrupteurs + pilotage du son
// ------------------------------------------------------------

export default function SelahSoundscape({
  phase,
  etat,
  lang,
  ambientOn,
  breathOn,
  accent,
}: {
  phase: PrayerPhase;
  etat: SoulState | null;
  lang: "fr" | "en";
  ambientOn: boolean;
  breathOn: boolean;
  accent: string;
}) {
  const l = UI[lang];
  const supported = useMemo(() => isAmbientSupported(), []);

  // Le son suit le cycle de la prière
  useEffect(() => {
    if (!supported) return;
    if (!ambientOn || !etat) {
      stopAmbient(1.2);
      return;
    }
    if (phase === "running") startAmbient(etat);
    else if (phase === "paused") duckAmbient();
    else stopAmbient(phase === "done" ? 4 : 1.5);
  }, [supported, ambientOn, etat, phase]);

  // Quitter l'étape (ou la page) coupe le son en douceur
  useEffect(() => () => stopAmbient(1.2), []);

  const live = phase === "running";
  const ringVisible = breathOn && (phase === "running" || phase === "paused");

  return (
    <div className="mt-1 flex flex-col items-center gap-1">
      <div className="flex flex-col items-center gap-0 md:flex-row md:gap-6">
        {supported && (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs text-[#cfc4ad] md:text-sm">
            <input
              type="checkbox"
              checked={ambientOn}
              onChange={(e) => setAmbient(e.target.checked)}
              className="h-5 w-5 accent-[#d4af37]"
            />
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 10v4M22 12h-1" />
            </svg>
            <span>
              {l.ambient}
              <span className="hidden text-[#8f846e] md:inline"> · {l.ambientHint}</span>
            </span>
          </label>
        )}
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs text-[#cfc4ad] md:text-sm">
          <input
            type="checkbox"
            checked={breathOn}
            onChange={(e) => setBreath(e.target.checked)}
            className="h-5 w-5 accent-[#d4af37]"
          />
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span>
            {l.breath}
            <span className="hidden text-[#8f846e] md:inline"> · {l.breathHint}</span>
          </span>
        </label>
      </div>

      {ringVisible && (
        <div className="mt-1">
          <SelahBreathRing active={live} lang={lang} accent={accent} drive />
        </div>
      )}
    </div>
  );
}
