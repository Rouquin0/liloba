import type { Metadata } from "next";
import Link from "next/link";
import { STORIES } from "@/lib/stories-content";
import StoriesExplorer from "@/components/StoriesExplorer";
import HamburgerButton from "@/components/HamburgerButton";

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
          
          <HamburgerButton />
          
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)] md:text-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 md:h-8 md:w-8">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Histoires Bibliques
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
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--foreground)] md:text-base">
            Une question après ta lecture ?
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
