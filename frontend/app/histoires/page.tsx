import type { Metadata } from "next";
import Link from "next/link";
import { STORIES } from "@/lib/stories-content";
import StoriesExplorer from "@/components/StoriesExplorer";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Histoires Bibliques",
  description:
    "Des histoires vraies de la Bible racontées simplement, avec une leçon de vie pour chaque jour. Pour enfants, jeunes et familles.",
};

export default function HistoiresPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:px-8 md:py-6">
          <BackButton href="/" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--color-primary)] md:text-3xl">
              📚 Histoires Bibliques
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)] md:text-sm">
              De vraies histoires, des leçons pour la vie de tous les jours ·{" "}
              {STORIES.length} histoires
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pt-10">
        <StoriesExplorer stories={STORIES} />

        {/* Bandeau bas */}
        <div className="mt-10 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-sm font-bold text-[var(--foreground)] md:text-base">
            💬 Une question après ta lecture ?
          </p>
          <p className="mt-1 text-xs text-[var(--muted)] md:text-sm">
            Pose-la à Apollos, ton assistant biblique.
          </p>
          <Link
            href="/chat"
            className="mt-4 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Parler à Apollos →
          </Link>
        </div>
      </main>
    </div>
  );
}
