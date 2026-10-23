"use client";

import { useEffect, useMemo, useState } from "react";
import { VERSE_GAMES } from "@/lib/games-verses";
import { getBest, saveBest, shuffle } from "@/lib/games-mobile";

// ============================================================
// LILOBA — Mémoire Éclair
// ============================================================

interface Card {
  uid: number;
  pairId: string;
  label: string;
  kind: "ref" | "word";
}

export default function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [best, setBest] = useState(0);

  const start = () => {
    const picks = shuffle(VERSE_GAMES.filter((v) => v.missingWord.length > 2)).slice(0, 6);
    const deck: Card[] = shuffle(
      picks.flatMap((v, i) => [
        { uid: i * 2, pairId: v.id, label: v.reference, kind: "ref" as const },
        { uid: i * 2 + 1, pairId: v.id, label: v.missingWord, kind: "word" as const },
      ])
    );
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
  };

  useEffect(() => {
    setMounted(true);
    setBest(getBest("memory"));
    start();
  }, []);

  useEffect(() => {
    if (!mounted || matched.length === 6) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [mounted, matched.length]);

  const finished = matched.length === 6;
  const score = useMemo(
    () => (finished ? Math.max(10, 120 - moves * 3 - seconds) : 0),
    [finished, moves, seconds]
  );

  useEffect(() => {
    if (finished) {
      saveBest("memory", score);
      setBest(getBest("memory"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (!mounted) return null;

  const tap = (c: Card) => {
    if (finished || flipped.includes(c.uid)) return;
    if (flipped.length === 2) return;
    if (cards.find((x) => x.uid === c.uid && matched.includes(x.pairId))) return;
    const nf = [...flipped, c.uid];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf.map((u) => cards.find((x) => x.uid === u)!);
      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setMatched((m) => [...m, a.pairId]);
          setFlipped([]);
        }, 450);
      } else {
        setTimeout(() => setFlipped([]), 650);
      }
    }
  };

  const isUp = (c: Card) => flipped.includes(c.uid) || matched.includes(c.pairId);

  return (
    <div className="flex flex-col pb-6">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-bold text-[var(--muted)] active:scale-95"
          aria-label="Retour aux jeux"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Mémoire Éclair</h3>
          <p className="text-[11px] text-[var(--muted)]">Associe référence ↔ mot-clé · {matched.length}/6 · {moves} coups · {seconds}s</p>
        </div>
        {best > 0 && (
          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">Record : {best}</span>
        )}
      </div>

      {!finished ? (
        <div className="grid grid-cols-3 gap-2">
          {cards.map((c) => {
            const up = isUp(c);
            const done = matched.includes(c.pairId);
            return (
              <button
                key={c.uid}
                type="button"
                onClick={() => tap(c)}
                className={`flex min-h-20 items-center justify-center rounded-2xl border p-2 text-center text-xs font-bold leading-tight transition-all active:scale-95 ${
                  done
                    ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-300"
                    : up
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                {up ? c.label : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 opacity-30">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <p className="mt-4 text-base font-bold text-[var(--foreground)]">Bravo ! Score : {score}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{moves} coups · {seconds}s · Record : {Math.max(best, score)}</p>
          <div className="mt-6 flex gap-2">
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
      )}
    </div>
  );
}
