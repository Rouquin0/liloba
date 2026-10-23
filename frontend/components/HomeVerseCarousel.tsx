"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { findBookBySlug, parseReference } from "@/lib/bible-utils";
import { getHomeDayKey, getTodayVerses } from "@/lib/home-verses";

const AUTOPLAY_MS = 7000;
const RESUME_AFTER_MS = 12000;

function chapterHref(ref: string): string | null {
  const parsed = parseReference(ref);
  if (!parsed || !findBookBySlug(parsed.slug)) return null;
  return `/bible/${parsed.slug}/${parsed.chapitre}`;
}

function subscribeDay(callback: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    timer = setTimeout(() => {
      callback();
      schedule();
    }, next.getTime() - now.getTime());
  };
  schedule();
  document.addEventListener("visibilitychange", callback);
  window.addEventListener("focus", callback);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", callback);
    window.removeEventListener("focus", callback);
  };
}

const serverDayKey = () => "";

export default function HomeVerseCarousel() {
  const dayKey = useSyncExternalStore(subscribeDay, getHomeDayKey, serverDayKey);
  const verses = useMemo(() => (dayKey ? getTodayVerses() : []), [dayKey]);

  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    
    // On centre parfaitement la carte dans le conteneur
    const scrollLeft = card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [dayKey]);

  useEffect(() => {
    if (verses.length < 2) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const id = setInterval(() => {
      const el = scrollerRef.current;
      if (!el || pausedRef.current || document.hidden) return;
      if (el.offsetParent === null) return;
      goTo((activeRef.current + 1) % verses.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [verses.length, goTo]);

  useEffect(() => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_MS);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const card = child as HTMLElement;
      const center = card.offsetLeft + card.offsetWidth / 2 - el.offsetWidth / 2;
      const dist = Math.abs(center - el.scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onPointerDown={pause}
          onTouchStart={pause}
          onWheel={pause}
          onKeyDown={pause}
          role="region"
          aria-roledescription="carrousel"
          aria-label="Versets du jour"
          // px-5 = 20px de marge gauche/droite pour le conteneur
          // gap-10 = grand espace entre les cartes pour qu'elles soient invisibles
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x px-5 gap-10 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {verses.length === 0 ? (
            <div className="flex min-h-[200px] w-[calc(100%-40px)] shrink-0 snap-center items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="animate-pulse text-xs text-[var(--muted)]">Verset du jour…</p>
            </div>
          ) : (
            verses.map((verse, i) => {
              const href = chapterHref(verse.ref);
              return (
                <article
                  key={verse.ref}
                  aria-label={`Verset ${i + 1} sur ${verses.length}`}
                  // w-[calc(100%-40px)] = 100% de l'écran moins les 40px de padding
                  className="relative flex w-[calc(100%-40px)] shrink-0 snap-center snap-always flex-col justify-between gap-5 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_0_40px_color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                >
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--foreground)]/25 to-transparent" />
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      <span aria-hidden="true" className="text-yellow-500">✦</span>
                      {i === 0 ? "Verset du jour" : "Pour toi aujourd'hui"}
                    </p>
                    <p className="text-[21px] italic leading-[1.5] text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
                      « {verse.text} »
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 text-xs font-semibold tracking-wide text-[var(--muted)]">
                      {verse.ref}
                    </span>
                    {href && (
                      <Link href={href} className="shrink-0 text-xs font-semibold text-[var(--foreground)] underline-offset-2 hover:underline">
                        Lire le chapitre →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {verses.length > 1 && (
        <div className="mt-2 flex items-center justify-center" role="tablist" aria-label="Choisir un verset">
          {verses.map((verse, i) => (
            <button
              key={verse.ref}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Verset ${i + 1}`}
              onClick={() => { pause(); goTo(i); }}
              className="flex h-5 items-center px-1"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-[var(--foreground)]" : "w-1.5 bg-[var(--border)]"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
