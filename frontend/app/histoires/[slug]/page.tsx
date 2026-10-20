import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  STORIES,
  getStory,
  getRelatedStories,
} from "@/lib/stories-content";
import { StoryArt } from "@/components/StoryArt";
import { StoryCard } from "@/components/StoriesList";
import BackButton from "@/components/BackButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return { title: "Histoire introuvable" };
  return {
    title: story.title,
    description: story.excerpt,
  };
}

export default async function HistoireLecturePage({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const related = getRelatedStories(slug, 3);
  const index = STORIES.findIndex((s) => s.slug === slug);
  const prev = index > 0 ? STORIES[index - 1] : null;
  const next = index < STORIES.length - 1 ? STORIES[index + 1] : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Barre de lecture */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <BackButton href="/histoires" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--foreground)]">
              {story.title}
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              📖 {story.reference} · ⏱ {story.durationMin} min
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)] sm:inline">
            {story.theme}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 md:pt-8">
        <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          {/* HERO : image locale /images/stories/*.jpg ou dégradé auto */}
          <StoryArt story={story} size="hero" />

          <div className="p-5 md:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 font-bold text-[var(--color-primary)]">
                {story.emoji} {story.theme}
              </span>
              <span className="rounded-full bg-[var(--surface-hover)] px-3 py-1 font-medium text-[var(--muted)]">
                ⏱ {story.durationMin} min de lecture
              </span>
              <span className="rounded-full bg-[var(--surface-hover)] px-3 py-1 font-medium text-[var(--muted)]">
                👧 {story.age}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight text-[var(--foreground)] md:text-4xl">
              {story.title}
            </h1>
            {/* Référence biblique discrète */}
            <p className="mt-2 text-xs tracking-wide text-[var(--muted)] md:text-sm">
              📖 Tiré de la Bible — {story.referenceDetail}
            </p>

            {/* Verset-clé */}
            <blockquote className="mt-6 rounded-xl border-l-4 border-[var(--color-primary)] bg-[var(--background)] px-4 py-3 italic md:px-6 md:py-4">
              <p className="text-sm md:text-base">« {story.keyVerse.text} »</p>
              <cite className="mt-1 block text-xs font-bold not-italic text-[var(--color-primary)] md:text-sm">
                — {story.keyVerse.ref}
              </cite>
            </blockquote>

            {/* Corps : lisible, police adaptée, bonne interligne */}
            <div className="mt-6 space-y-5 md:mt-8 md:space-y-6">
              {story.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`leading-relaxed text-[var(--foreground)] ${
                    i === 0
                      ? "text-lg font-medium md:text-xl md:leading-relaxed"
                      : "text-base md:text-lg md:leading-loose"
                  }`}
                  style={{ lineHeight: "1.85" }}
                >
                  {i === 0 && (
                    <span
                      aria-hidden="true"
                      className="float-left mr-2 font-serif text-5xl font-bold leading-none text-[var(--color-primary)] md:text-6xl"
                    >
                      {p.charAt(0)}
                    </span>
                  )}
                  {i === 0 ? p.slice(1) : p}
                </p>
              ))}
            </div>

            {/* ⭐ LEÇON DE VIE — mise en évidence visuelle */}
            <aside className="mt-8 overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 md:mt-10">
              <div className="flex items-center gap-2 bg-amber-400/20 px-5 py-3">
                <span className="text-xl" aria-hidden="true">
                  💡
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 dark:text-amber-200 md:text-base">
                  Leçon de vie
                </h2>
              </div>
              <div className="px-5 py-5 md:px-7 md:py-6">
                <p className="text-base font-bold leading-snug text-[var(--foreground)] md:text-xl">
                  {story.lesson.title}
                </p>
                <p className="mt-3 text-base leading-relaxed text-[var(--foreground)] md:text-lg md:leading-relaxed">
                  {story.lesson.text}
                </p>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 px-4 py-3 dark:bg-black/30">
                  <span className="text-lg" aria-hidden="true">
                    🎯
                  </span>
                  <p className="text-sm leading-relaxed md:text-base">
                    <strong>Mon défi : </strong>
                    {story.lesson.action}
                  </p>
                </div>
              </div>
            </aside>

            {/* Navigation prev / next */}
            <nav className="mt-8 grid grid-cols-2 gap-3">
              {prev ? (
                <Link
                  href={`/histoires/${prev.slug}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left transition-colors hover:border-[var(--color-primary)] md:p-4"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    ← Précédente
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug md:text-base">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/histoires/${next.slug}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-right transition-colors hover:border-[var(--color-primary)] md:p-4"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    Suivante →
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug md:text-base">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </nav>

            <Link
              href="/histoires"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              ← Retour à toutes les histoires
            </Link>
          </div>
        </article>

        {/* Histoires liées */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--foreground)] md:text-xl">
            📚 Continuer la lecture
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <StoryCard key={r.slug} story={r} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
