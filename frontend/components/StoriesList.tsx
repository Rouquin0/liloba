import Link from "next/link";
import type { BibleStory } from "@/lib/stories-content";
import { StoryArt } from "./StoryArt";

// ============================================================
// Grille de cartes Histoires — utilisée par /histoires
// ============================================================

export default function StoriesList({ stories }: { stories: BibleStory[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.slug} story={story} />
      ))}
    </div>
  );
}

export function StoryCard({ story }: { story: BibleStory }) {
  return (
    <Link
      href={`/histoires/${story.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg active:scale-[0.99]"
    >
      <div className="relative">
        <StoryArt story={story} size="card" />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {story.theme}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          ⏱ {story.durationMin} min · {story.age}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--color-primary)] md:text-lg">
          {story.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-[var(--muted)]">
          📖 {story.reference}
        </p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
          {story.excerpt}
        </p>

        {/* Leçon de vie (aperçu) */}
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5">
          <span className="text-base" aria-hidden="true">
            💡
          </span>
          <p className="text-xs font-medium leading-snug text-[var(--foreground)]">
            {story.lesson.title}
          </p>
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
          Lire l&apos;histoire
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
