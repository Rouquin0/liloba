"use client";

import { useEffect, useMemo, useState } from "react";
import { VERSE_GAMES } from "@/lib/games-verses";
import { getBest, saveBest, shuffle } from "@/lib/games-mobile";

// ============================================================
// LILOBA — Mémoire Éclair 🧠⚡ (MOBILE UNIQUEMENT)
// Touche 2 cartes : associe chaque référence à son mot-clé.
// 100% local, 100% tactile, parfait hors ligne.
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
    // ne pas retoucher une carte déjà validée
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
          ←
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[var(--foreground)]">🧠⚡ Mémoire Éclair</h3>
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
                      : "border-[var(--border)] bg-[var(--surface-hover)] text-2xl"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                {up ? c.label : "✦"}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-base font-bold text-[var(--foreground)]">Bravo ! Score : {score}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{moves} coups · {seconds}s · Record : {Math.max(best, score)}</p>
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
      )}
      <p className="mt-3 text-center text-[10px] text-[var(--muted)]">📱 Jeu tactile — mobile uniquement · marche hors ligne</p>
    </div>
  );
}
