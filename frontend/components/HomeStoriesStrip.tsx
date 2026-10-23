"use client";

import Link from "next/link";
import { STORIES } from "@/lib/stories-content";

export default function HomeStoriesStrip() {
  return (
    <section className="flex flex-col gap-3.5" aria-labelledby="home-stories-title">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 id="home-stories-title" className="text-base font-semibold text-[var(--foreground)]">
            Histoires bibliques
          </h2>
          <span className="shrink-0 rounded-full border border-green-600/30 bg-green-600/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-green-600 dark:text-green-400">
            NOUVEAU
          </span>
        </div>
        <Link
          href="/histoires"
          className="shrink-0 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          Voir tout →
        </Link>
      </div>

      <p className="-mt-2 text-xs text-[var(--muted)]">
        {STORIES.length} histoires illustrées · fais glisser →
      </p>

      {/* 
        La classe px-[calc(50vw-74px)] est la magie ici. 
        Elle ajoute un espace vide au début et à la fin qui correspond exactement à la moitié de l'écran moins la moitié d'une carte (74px). 
        Cela force la première et la dernière carte à s'arrêter pile au centre.
      */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain touch-pan-x pb-2 px-[calc(50vw-74px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((story) => (
          <Link
            key={story.slug}
            href={`/histoires/${story.slug}`}
            className="flex w-[148px] shrink-0 snap-center flex-col gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors active:bg-[var(--surface-hover)]"
          >
            <span
              aria-hidden="true"
              className={`relative flex h-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${story.gradient}`}
            >
              <span className="text-[32px] drop-shadow-md">{story.emoji}</span>
              <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/15" />
            </span>
            <span className="line-clamp-2 h-[2.7em] text-[13px] font-medium leading-[1.35] text-[var(--foreground)]">
              {story.title}
            </span>
            <span className="text-[11px] font-medium text-[var(--muted)]">{story.reference}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
