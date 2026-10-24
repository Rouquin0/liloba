"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findBookBySlug,
  isOldTestament,
  isNewTestament,
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import BibleHeader from "@/components/BibleHeader";

interface PageProps {
  params: Promise<{ livre: string }>;
}

function LivreContent({ params }: PageProps) {
  const { livre: slug } = use(params);
  const bookName = findBookBySlug(slug);

  if (!bookName) {
    notFound();
  }

  const isAT = isOldTestament(bookName);
  const isNT = isNewTestament(bookName);
  const totalChapters = CHAPTERS_COUNT[bookName] ?? 0;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className="flex h-full flex-col">
      <BibleHeader
        title={bookName}
        subtitle={
          isAT
            ? "Ancien Testament"
            : isNT
              ? "Nouveau Testament"
              : ""
        }
        backHref="/bible"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
          
          {/* Caché sur mobile, visible sur desktop */}
          <div className="mb-4 hidden md:block">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              {totalChapters} chapitres
            </h2>
          </div>

          {/* Caché sur mobile, visible sur desktop */}
          <div className="hidden md:grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {chapters.map((num) => (
              <Link
                key={num}
                href={`/bible/${slug}/${num}`}
                className="group flex aspect-square items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] transition-all duration-200 hover:scale-110 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white active:scale-95"
              >
                {num}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LivrePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--color-accent)]" />
        </div>
      }
    >
      <LivreContent params={params} />
    </Suspense>
  );
}
