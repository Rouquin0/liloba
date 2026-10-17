"use client";

import { useEffect, useState } from "react";
import BibleReader from "@/components/BibleReader";
import {
  ANCIEN_TESTAMENT,
  NOUVEAU_TESTAMENT,
  CHAPTERS_COUNT,
  findBookBySlug,
  getSlugByBookName,
} from "@/lib/bible-utils";

// ============================================================
// BiblePane — Panneau Bible avec état local indépendant
// ============================================================
// Lit l'URL une fois au montage pour s'initialiser,
// puis garde son propre état (livre + chapitre).
// Ajoute un sélecteur de livre/chapitre en haut (comme Comparer).
// ============================================================

export default function BiblePane() {
  const [livre, setLivre] = useState<string>("genese");
  const [chapitre, setChapitre] = useState<number>(1);
  const [initialized, setInitialized] = useState(false);

  // Nom canonique du livre (ex: "Genèse")
  const bookName = findBookBySlug(livre);

  // Liste de tous les livres
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];

  // Nombre de chapitres du livre actuel
  const totalChapters = bookName ? (CHAPTERS_COUNT[bookName] ?? 1) : 1;

  // Initialisation depuis l'URL au premier montage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const match = window.location.pathname.match(/\/bible\/([^/]+)\/(\d+)/);
    if (match) {
      setLivre(match[1]);
      setChapitre(parseInt(match[2], 10));
    }
    setInitialized(true);
  }, []);

  // Écoute les changements de chapitre venant d'autres panneaux
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{ livre: string; chapitre: number; slug: string }>
      ).detail;
      if (!detail?.slug || !detail?.chapitre) return;

      setLivre((prevLivre) => {
        if (prevLivre === detail.slug) {
          setChapitre((prevChap) =>
            prevChap === detail.chapitre ? prevChap : detail.chapitre
          );
          return prevLivre;
        }
        setChapitre(detail.chapitre);
        return detail.slug;
      });
    };

    window.addEventListener("liloba:bible-chapter-changed", handler);
    return () => {
      window.removeEventListener("liloba:bible-chapter-changed", handler);
    };
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs text-[var(--muted)]">Chargement…</div>
      </div>
    );
  }

  // ============================================================
  // HANDLERS DU SÉLECTEUR
  // ============================================================

  const handleBookChange = (newBookName: string) => {
    const newSlug = getSlugByBookName(newBookName);
    if (!newSlug) return;

    const maxChap = CHAPTERS_COUNT[newBookName] ?? 1;
    const newChap = chapitre > maxChap ? 1 : chapitre;

    setLivre(newSlug);
    setChapitre(newChap);
  };

  const handleChapterChange = (newChap: number) => {
    setChapitre(newChap);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ============================================================ */}
      {/* SÉLECTEUR DE LIVRE / CHAPITRE */}
      {/* ============================================================ */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        {/* Sélecteur de livre */}
        <select
          value={bookName || ""}
          onChange={(e) => handleBookChange(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
          aria-label="Choisir un livre"
        >
          {allBooks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Sélecteur de chapitre */}
        <select
          value={chapitre}
          onChange={(e) => handleChapterChange(parseInt(e.target.value, 10))}
          className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
          aria-label="Choisir un chapitre"
        >
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Ch. {n}
            </option>
          ))}
        </select>
      </div>

      {/* ============================================================ */}
      {/* LECTEUR BIBLE */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-hidden">
                <BibleReader
          livre={livre}
          chapitre={chapitre}
          onNavigate={(newLivre, newChap) => {
            setLivre(newLivre);
            setChapitre(newChap);
          }}
          onBackToList={() => {
            // Reste dans le panneau : pour l'instant on ne fait rien.
          }}
          showHeader={true}
          compact={true}
          embeddedMenus={true}
        />
      </div>
    </div>
  );
}
