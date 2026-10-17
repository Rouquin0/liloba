"use client";

import { useEffect, useState } from "react";
import TranslationCompare from "@/components/TranslationCompare";
import { findBookBySlug } from "@/lib/bible-utils";

// ============================================================
// CompareReader — Comparateur avec état local (pour panneau)
// ============================================================
// Lit l'URL une fois au montage pour s'initialiser,
// puis garde son propre état (livre + chapitre).
// ============================================================

export default function CompareReader() {
  const [bookName, setBookName] = useState<string>("Genèse");
  const [chapitre, setChapitre] = useState<number>(1);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const match = window.location.pathname.match(/\/bible\/([^/]+)\/(\d+)/);
    if (match) {
      const resolved = findBookBySlug(match[1]);
      if (resolved) {
        setBookName(resolved);
        setChapitre(parseInt(match[2], 10));
      }
    }
    setInitialized(true);
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs text-[var(--muted)]">Chargement…</div>
      </div>
    );
  }

  return (
    <TranslationCompare
      bookName={bookName}
      chapitre={chapitre}
      leftTranslation="lsg"
      defaultRight="martin"
      onClose={() => {}}
      embedded={true}
      onNavigate={(newBook, newChap) => {
        setBookName(newBook);
        setChapitre(newChap);
      }}
    />
  );
}
