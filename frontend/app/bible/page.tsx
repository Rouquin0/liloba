"use client";

import { getOfflineLivres } from "@/lib/offline-bible";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchLivres } from "@/lib/api";
import {
  ANCIEN_TESTAMENT,
  NOUVEAU_TESTAMENT,
  slugify,
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import BibleHeader from "@/components/BibleHeader";
import BibleReader from "@/components/BibleReader";

type Testament = "all" | "at" | "nt";

function getTestamentFromParams(searchParams: URLSearchParams): Testament {
  const t = searchParams.get("testament");
  if (t === "at" || t === "nt") return t;
  return "all";
}

export default function BiblePage() {
  return (
    <Suspense fallback={<BibleSkeleton />}>
      <BibleContent />
    </Suspense>
  );
}

function BibleContent() {
  const searchParams = useSearchParams();
  const testament = getTestamentFromParams(searchParams);

  const [livres, setLivres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 État pour gérer le livre/chapitre sélectionné (mode Shell)
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Essaie d'abord IndexedDB (offline prioritaire)
        const offlineLivres = await getOfflineLivres();

        if (offlineLivres && offlineLivres.length > 0) {
          if (!cancelled) {
            setLivres(offlineLivres);
            setIsLoading(false);
          }
          return;
        }

        // 2. Sinon, appel API
        const data = await fetchLivres();
        if (!cancelled) setLivres(data.livres);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger la Bible."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🔥 NOUVEAU : Si un livre est sélectionné, on affiche le lecteur (100% hors-ligne)
  if (selectedBook) {
    return (
      <div className="flex h-full flex-col">
        <BibleReader
          livre={slugify(selectedBook)}
          chapitre={selectedChapter}
          onNavigate={(livreSlug, chap) => {
            // On retrouve le nom du livre à partir du slug pour l'affichage
            const bookName = livres.find((b) => slugify(b) === livreSlug) || livreSlug;
            setSelectedBook(bookName);
            setSelectedChapter(chap);
          }}
          onBackToList={() => setSelectedBook(null)}
          showMenuButton
        />
      </div>
    );
  }

  const subtitle =
    testament === "at"
      ? "Ancien Testament"
      : testament === "nt"
        ? "Nouveau Testament"
        : "Louis Segond 1910";

  return (
    <div className="flex h-full flex-col">
      <BibleHeader title="La Bible" subtitle={subtitle} showMenuButton />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterTab href="/bible" active={testament === "all"} label="Tous" count={66} />
            <FilterTab
              href="/bible?testament=at"
              active={testament === "at"}
              label="Ancien Testament"
              count={ANCIEN_TESTAMENT.length}
            />
            <FilterTab
              href="/bible?testament=nt"
              active={testament === "nt"}
              label="Nouveau Testament"
              count={NOUVEAU_TESTAMENT.length}
            />
          </div>

          {isLoading && <LoadingState />}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex flex-col gap-10">
              {(testament === "all" || testament === "at") && (
                <TestamentSection
                  title="Ancien Testament"
                  books={ANCIEN_TESTAMENT}
                  available={livres}
                  onSelectBook={(book) => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                />
              )}
              {(testament === "all" || testament === "nt") && (
                <TestamentSection
                  title="Nouveau Testament"
                  books={NOUVEAU_TESTAMENT}
                  available={livres}
                  onSelectBook={(book) => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--foreground)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
          active
            ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
            : "bg-[var(--surface-hover)] text-[var(--muted)]"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function TestamentSection({
  title,
  books,
  available,
  onSelectBook, // 🆕 Nouvelle prop
}: {
  title: string;
  books: string[];
  available: string[];
  onSelectBook: (book: string) => void; // 🆕
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
        <span>{title}</span>
        <span className="font-mono font-normal opacity-60">
          ({books.length} livres)
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {books.map((book) => {
          const isAvailable = available.includes(book);
          const chapterCount = CHAPTERS_COUNT[book] ?? 0;

          if (!isAvailable) {
            return (
              <div
                key={book}
                className="flex items-center gap-3 border-b border-[var(--border)] px-2 py-3 text-sm text-[var(--muted)] opacity-40"
              >
                <BookIcon />
                <span className="flex-1">{book}</span>
              </div>
            );
          }

          // 🆕 Remplacer le <Link> par un <button> pour éviter la navigation Next.js
          return (
            <button
              key={book}
              type="button"
              onClick={() => onSelectBook(book)}
              className="group relative flex w-full items-center gap-3 border-b border-[var(--border)] px-2 py-3 text-left text-sm transition-all hover:bg-[var(--surface-hover)] hover:pl-4"
            >
              <BookIcon />
              <span className="flex-1 font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                {book}
              </span>
              <span className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)]">
                {chapterCount} ch.
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BookIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 stroke-[var(--muted)]"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-[var(--surface-hover)]"
        />
      ))}
    </div>
  );
}

function BibleSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 md:px-6">
        <div className="h-5 w-24 animate-pulse rounded bg-[var(--surface-hover)]" />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <LoadingState />
      </div>
    </div>
  );
}
