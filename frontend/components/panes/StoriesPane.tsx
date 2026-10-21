"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STORIES, getStory } from "@/lib/stories-content";
import { StoryArt } from "@/components/StoryArt";
import {
  OPEN_STORY_EVENT,
  consumePendingStory,
  openInOtherPane,
} from "@/lib/split-view";

// ============================================================
// StoriesPane — Lecture des Histoires bibliques dans le Split View
// ============================================================
// État local (liste ↔ lecture), aucune navigation de page.
// La dernière histoire ouverte est gardée le temps de la session.
// ============================================================

const LAST_KEY = "liloba:pane-story";

export default function StoriesPane() {
  const [slug, setSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState("Tous");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialisation + ouverture à la demande (ex: depuis Selah)
  useEffect(() => {
    let initial = consumePendingStory();
    if (!initial) {
      try {
        initial = sessionStorage.getItem(LAST_KEY);
      } catch {}
    }
    if (initial && getStory(initial)) setSlug(initial);

    const onOpen = () => {
      const pending = consumePendingStory();
      if (pending && getStory(pending)) setSlug(pending);
    };
    window.addEventListener(OPEN_STORY_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_STORY_EVENT, onOpen);
  }, []);

  useEffect(() => {
    try {
      if (slug) sessionStorage.setItem(LAST_KEY, slug);
      else sessionStorage.removeItem(LAST_KEY);
    } catch {}
    scrollRef.current?.scrollTo({ top: 0 });
  }, [slug]);

  const themes = useMemo(
    () => ["Tous", ...Array.from(new Set(STORIES.map((s) => s.theme)))],
    []
  );
  const visible =
    theme === "Tous" ? STORIES : STORIES.filter((s) => s.theme === theme);

  const story = slug ? getStory(slug) : undefined;

  // ---------- LECTURE ----------
  if (story) {
    const index = STORIES.findIndex((s) => s.slug === story.slug);
    const prev = index > 0 ? STORIES[index - 1] : null;
    const next = index < STORIES.length - 1 ? STORIES[index + 1] : null;

    return (
      <div ref={scrollRef} className="h-full overflow-y-auto bg-[var(--background)]">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setSlug(null)}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--surface-hover)]"
          >
            ← Histoires
          </button>
          <p className="min-w-0 flex-1 truncate text-xs text-[var(--muted)]">
            {story.reference} · ⏱ {story.durationMin} min
          </p>
        </div>

        <article className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <StoryArt story={story} size="card" />
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 font-bold text-[var(--color-primary)]">
                  {story.emoji} {story.theme}
                </span>
                <span className="rounded-full bg-[var(--surface-hover)] px-2.5 py-1 font-medium text-[var(--muted)]">
                  👧 {story.age}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold leading-tight text-[var(--foreground)]">
                {story.title}
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                📖 {story.referenceDetail}
              </p>

              <blockquote className="mt-4 rounded-xl border-l-4 border-[var(--color-primary)] bg-[var(--background)] px-3 py-2 italic">
                <p className="text-sm">« {story.keyVerse.text} »</p>
                <cite className="mt-1 block text-xs font-bold not-italic text-[var(--color-primary)]">
                  — {story.keyVerse.ref}
                </cite>
              </blockquote>

              <div className="mt-5 space-y-4">
                {story.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-base text-[var(--foreground)]"
                    style={{ lineHeight: "1.8" }}
                  >
                    {p}
                  </p>
                ))}
              </div>

              <section className="mt-6 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Leçon de vie
                </p>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {story.lesson.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {story.lesson.text}
                </p>
                <p className="mt-3 border-l-2 border-[var(--color-accent)] pl-2 text-xs italic text-[var(--muted)]">
                  {story.lesson.action}
                </p>
              </section>

              <button
                type="button"
                onClick={() => openInOtherPane("stories", "chat")}
                className="mt-4 w-full rounded-xl border border-dashed border-[var(--color-accent)]/60 py-2.5 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5"
              >
                💬 Poser une question à Apollos
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {prev ? (
              <button
                type="button"
                onClick={() => setSlug(prev.slug)}
                className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left text-xs text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
              >
                <span className="block text-[10px] uppercase text-[var(--muted)]">
                  ← Précédente
                </span>
                <span className="block truncate font-semibold">{prev.title}</span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => setSlug(next.slug)}
                className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-right text-xs text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
              >
                <span className="block text-[10px] uppercase text-[var(--muted)]">
                  Suivante →
                </span>
                <span className="block truncate font-semibold">{next.title}</span>
              </button>
            ) : (
              <span />
            )}
          </div>
        </article>
      </div>
    );
  }

  // ---------- LISTE ----------
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-[var(--background)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <h2 className="text-lg font-bold text-[var(--color-primary)]">
          📚 Histoires bibliques
        </h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {STORIES.length} histoires · touche une carte pour la lire ici
        </p>

        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filtrer par thème"
        >
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === theme}
              onClick={() => setTheme(t)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                t === theme
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {visible.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setSlug(s.slug)}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left transition-all hover:border-[var(--color-accent)]"
            >
              <StoryArt story={s} size="card" />
              <div className="p-3">
                <p className="text-sm font-bold leading-snug text-[var(--foreground)]">
                  {s.title}
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  {s.emoji} {s.theme} · ⏱ {s.durationMin} min · 👧 {s.age}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
