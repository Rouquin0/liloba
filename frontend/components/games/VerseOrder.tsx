"use client";

import { useEffect, useState } from "react";
import { VERSE_GAMES } from "@/lib/games-verses";
import { getBest, saveBest, shuffle } from "@/lib/games-mobile";

// ============================================================
// LILOBA — Ordre du Verset 🔢 (MOBILE UNIQUEMENT)
// Les mots sont mélangés : touche-les dans le bon ordre.
// Gros boutons tactiles, 8 manches, 100% hors ligne.
// ============================================================

const ROUNDS = 8;
const WORDS_PER_ROUND = 7;

interface Round {
  reference: string;
  ordered: string[];
  mixed: string[];
}

function buildRounds(): Round[] {
  return shuffle(VERSE_GAMES)
    .slice(0, ROUNDS)
    .map((v) => {
      const words = v.fullText.replace(/\s+/g, " ").trim().split(" ").slice(0, WORDS_PER_ROUND);
      return { reference: v.reference, ordered: words, mixed: shuffle(words) };
    });
}

export default function VerseOrder({ onBack }: { onBack: () => void }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [mounted, setMounted] = useState(false);
  const [best, setBest] = useState(0);

  const start = () => {
    setRounds(buildRounds());
    setIdx(0);
    setPicked([]);
    setScore(0);
    setChecked(null);
  };

  useEffect(() => {
    setMounted(true);
    setBest(getBest("ordre"));
    start();
  }, []);

  if (!mounted || rounds.length === 0) return null;
  const round = rounds[idx];
  const finished = idx >= rounds.length;
  void finished;

  const tapWord = (i: number) => {
    if (checked !== null) return;
    if (picked.includes(i)) {
      setPicked(picked.filter((x) => x !== i));
    } else {
      setPicked([...picked, i]);
    }
  };

  const validate = () => {
    if (picked.length !== round.ordered.length) return;
    const answer = picked.map((i) => round.mixed[i]).join(" ");
    const ok = answer === round.ordered.join(" ");
    setChecked(ok);
    if (ok) {
      const s = score + 1;
      setScore(s);
      if (idx === rounds.length - 1) {
        saveBest("ordre", s);
        setBest(getBest("ordre"));
      }
    }
  };

  const next = () => {
    if (idx < rounds.length - 1) {
      setIdx(idx + 1);
      setPicked([]);
      setChecked(null);
    } else {
      // dernière manche : on fige, écran de fin
      saveBest("ordre", score);
      setBest(Math.max(getBest("ordre"), score));
      setIdx(rounds.length); // déclenche l'écran de fin
    }
  };

  if (idx >= rounds.length) {
    const finalBest = Math.max(best, score);
    return (
      <div className="flex flex-col pb-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-4xl">🏁</p>
          <p className="mt-2 text-base font-bold text-[var(--foreground)]">Score : {score}/{rounds.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Record : {finalBest}/{rounds.length}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={start}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white active:scale-95"
              style={{ touchAction: "manipulation" }}
            >
              Rejouer
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--muted)] active:scale-95"
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-6">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-bold text-[var(--muted)] active:scale-95"
          aria-label="Retour aux jeux"
        >
          ←
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[var(--foreground)]">🔢 Ordre du Verset</h3>
          <p className="text-[11px] text-[var(--muted)]">Manche {idx + 1}/{rounds.length} · Score {score} · 💡 {round.reference}</p>
        </div>
        {best > 0 && (
          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">Record : {best}/{rounds.length}</span>
        )}
      </div>

      {/* Zone réponse */}
      <div
        className={`mb-3 min-h-16 rounded-2xl border-2 border-dashed p-3 text-sm leading-relaxed ${
          checked === true
            ? "border-green-500/60 bg-green-500/10 text-[var(--foreground)]"
            : checked === false
              ? "border-red-500/60 bg-red-500/10 text-[var(--foreground)]"
              : "border-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {picked.length === 0 ? (
          "Touche les mots ci-dessous dans le bon ordre 👇"
        ) : (
          picked.map((i) => round.mixed[i]).join(" ")
        )}
      </div>

      {/* Mots mélangés : gros boutons tactiles */}
      <div className="flex flex-wrap gap-2">
        {round.mixed.map((w, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapWord(i)}
              disabled={checked !== null && !used}
              className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-bold active:scale-95 ${
                used
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--foreground)]"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              {w}
            </button>
          );
        })}
      </div>

      {checked === null ? (
        <button
          type="button"
          onClick={validate}
          disabled={picked.length !== round.ordered.length}
          className="mt-4 rounded-xl bg-[var(--color-accent)] py-4 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
          style={{ touchAction: "manipulation" }}
        >
          Vérifier ({picked.length}/{round.ordered.length})
        </button>
      ) : (
        <div className="mt-4">
          <p className={`mb-2 text-center text-sm font-bold ${checked ? "text-green-600" : "text-red-500"}`}>
            {checked ? "✅ Parfait, à la gloire de Dieu !" : `❌ Raté — c'était : ${round.ordered.join(" ")}`}
          </p>
          <button
            type="button"
            onClick={next}
            className="w-full rounded-xl bg-[var(--color-accent)] py-4 text-sm font-bold text-white active:scale-95"
            style={{ touchAction: "manipulation" }}
          >
            {idx < rounds.length - 1 ? "Verset suivant →" : "Voir mon score 🏁"}
          </button>
        </div>
      )}
      <p className="mt-3 text-center text-[10px] text-[var(--muted)]">📱 Jeu tactile — mobile uniquement · marche hors ligne</p>
    </div>
  );
}
