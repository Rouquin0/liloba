"use client";

import { useEffect, useRef, useState } from "react";
import type { TranslationId } from "@/lib/translations";

// Code langue BCP-47 pour la synthèse vocale native (100% hors-ligne
// si la voix est installée sur le téléphone).
const SPEECH_LANG: Record<TranslationId, string> = {
  lsg: "fr-FR",
  martin: "fr-FR",
  kjv: "en-US",
  valera: "es-ES",
  portuguese: "pt-PT",
  swahili: "sw",
  lingala: "ln",
  kituba: "fr-FR", // pas de voix kituba native → français en secours
  russian: "ru-RU",
  chinese: "zh-CN",
};

interface AudioReaderProps {
  bookName: string;
  chapitre: number;
  versets: Record<string, string>;
  translationId: TranslationId;
}

// ============================================================
// LILOBA — Lecture audio du chapitre (Feature 4)
// Utilise speechSynthesis du téléphone : gratuit, hors-ligne,
// français / lingala / swahili selon la traduction active.
// ============================================================

export default function AudioReader({
  bookName,
  chapitre,
  versets,
  translationId,
}: AudioReaderProps) {
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const stoppedRef = useRef(false);
  const rateRef = useRef(1);
  rateRef.current = rate;

  const orderedVerses = Object.entries(versets).sort(
    (a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)
  );

  const stop = () => {
    stoppedRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setPaused(false);
    setCurrentVerse(null);
  };

  useEffect(() => stop, []);

  if (!supported) return null;
  if (orderedVerses.length === 0) return null;

  const pickVoice = (): SpeechSynthesisVoice | null => {
    const want = SPEECH_LANG[translationId] ?? "fr-FR";
    const prefix = want.split("-")[0].toLowerCase();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    // 1. voix exacte (fr-FR), 2. même langue (fr), 3. défaut
    return (
      voices.find((v) => v.lang.toLowerCase() === want.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
      null
    );
  };

  const speakAll = () => {
    window.speechSynthesis.cancel();
    stoppedRef.current = false;
    // Charge les voix (Chrome les donne en async)
    window.speechSynthesis.getVoices();
    const voice = pickVoice();
    const lang = SPEECH_LANG[translationId] ?? "fr-FR";

    setPlaying(true);
    setPaused(false);

    const speakVerse = (index: number) => {
      if (stoppedRef.current || index >= orderedVerses.length) {
        if (!stoppedRef.current) {
          setPlaying(false);
          setCurrentVerse(null);
        }
        return;
      }
      const [numero, texte] = orderedVerses[index];
      const clean = texte.replace(/<CM>/g, "").trim();
      setCurrentVerse(numero);
      const u = new SpeechSynthesisUtterance(
        `${bookName} chapitre ${chapitre}, verset ${numero}. ${clean}`
      );
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = rateRef.current;
      u.onend = () => speakVerse(index + 1);
      u.onerror = () => {
        if (!stoppedRef.current) speakVerse(index + 1);
      };
      window.speechSynthesis.speak(u);
    };

    speakVerse(0);
  };

  const togglePause = () => {
    if (!playing) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <div className="flex items-center gap-2">
        {!playing ? (
          <button
            type="button"
            onClick={speakAll}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-all hover:scale-105 hover:brightness-90 active:scale-95"
            aria-label={`Écouter ${bookName} ${chapitre}`}
            title="Écouter le chapitre (hors-ligne)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={togglePause}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-all hover:brightness-90"
              aria-label={paused ? "Reprendre" : "Pause"}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={stop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-all hover:border-red-500/50 hover:text-red-500"
              aria-label="Arrêter"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          </>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-[var(--foreground)]">
            {playing
              ? currentVerse
                ? `Lecture… verset ${currentVerse}`
                : "Lecture…"
              : `Écouter ${bookName} ${chapitre}`}
          </div>
          <div className="text-[10px] text-[var(--muted)]">
            Voix du téléphone · hors-ligne · {orderedVerses.length} versets
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {[0.8, 1, 1.2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRate(r)}
              className={`rounded-md px-1.5 py-1 font-mono text-[10px] font-bold transition-all ${
                rate === r
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {r === 1 ? "1x" : `${r}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
