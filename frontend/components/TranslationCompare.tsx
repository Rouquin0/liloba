"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/bible-utils";
import {
  TRANSLATIONS,
  getChapter,
  type TranslationId,
} from "@/lib/translations";
import {
  ANCIEN_TESTAMENT,
  NOUVEAU_TESTAMENT,
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import {
  type CompareFontSize,
  COMPARE_FONT_SIZES,
  getCompareFontSize,
  setCompareFontSize,
  getCompareFontClass,
} from "@/lib/split-view";

interface TranslationCompareProps {
  bookName: string;
  chapitre: number;
  leftTranslation?: TranslationId;
  defaultRight?: TranslationId;
  onClose: () => void;
  /** Mode embarqué (dans un panneau) : header compact + sélecteur livre/chap */
  embedded?: boolean;
  /** Callback quand on change de livre/chapitre (mode embedded) */
  onNavigate?: (bookName: string, chapitre: number) => void;
}

export default function TranslationCompare({
  bookName,
  chapitre,
  leftTranslation = "lsg",
  defaultRight = "martin",
  onClose,
  embedded = false,
  onNavigate,
}: TranslationCompareProps) {
  const router = useRouter();
  const [rightTranslation, setRightTranslation] =
    useState<TranslationId>(defaultRight);
  const [leftVersets, setLeftVersets] = useState<Record<string, string> | null>(null);
  const [rightVersets, setRightVersets] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Taille de police (mode embedded uniquement)
  const [fontSize, setFontSize] = useState<CompareFontSize>("md");

  useEffect(() => {
    setFontSize(getCompareFontSize());
    const onUpdate = () => setFontSize(getCompareFontSize());
    window.addEventListener("liloba:compare-font-updated", onUpdate);
    return () => {
      window.removeEventListener("liloba:compare-font-updated", onUpdate);
    };
  }, []);

  const cycleFontSize = (delta: number) => {
    const idx = COMPARE_FONT_SIZES.indexOf(fontSize);
    const next = Math.min(
      COMPARE_FONT_SIZES.length - 1,
      Math.max(0, idx + delta)
    );
    const newSize = COMPARE_FONT_SIZES[next];
    setFontSize(newSize);
    setCompareFontSize(newSize);
  };

  // Charge les 2 traductions
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function load() {
      const left = await getChapter(leftTranslation, bookName, chapitre);
      const right = await getChapter(rightTranslation, bookName, chapitre);
      if (!cancelled) {
        setLeftVersets(left);
        setRightVersets(right);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bookName, chapitre, leftTranslation, rightTranslation]);

  // Échap pour fermer (uniquement en mode plein écran)
  useEffect(() => {
    if (embedded) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose, embedded]);

  const leftConfig = TRANSLATIONS.find((t) => t.id === leftTranslation);
  const rightConfig = TRANSLATIONS.find((t) => t.id === rightTranslation);

  const allReferences = new Set<string>();
  if (leftVersets) Object.keys(leftVersets).forEach((n) => allReferences.add(n));
  if (rightVersets) Object.keys(rightVersets).forEach((n) => allReferences.add(n));
  const sortedVersets = Array.from(allReferences).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  // ============================================================
  // SÉLECTEUR DE LIVRE / CHAPITRE (mode embedded uniquement)
  // ============================================================

  const handleBookChange = (newBookName: string) => {
    if (!onNavigate) return;
    const maxChap = CHAPTERS_COUNT[newBookName] ?? 1;
    const newChap = chapitre > maxChap ? 1 : chapitre;
    onNavigate(newBookName, newChap);
  };

  const handleChapterChange = (newChap: number) => {
    if (!onNavigate) return;
    onNavigate(bookName, newChap);
  };

  const totalChapters = CHAPTERS_COUNT[bookName] ?? 1;
  const allBooks = [...ANCIEN_TESTAMENT, ...NOUVEAU_TESTAMENT];

  // ============================================================
  // RENDU
  // ============================================================

  const content = (
    <>
      {/* HEADER — mode plein écran */}
      {!embedded && (
        <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          <div className="flex flex-1 items-center gap-2">
            <span className="text-base font-bold text-[var(--color-primary)]">
              {bookName} {chapitre}
            </span>
          </div>

          <select
            value={rightTranslation}
            onChange={(e) => setRightTranslation(e.target.value as TranslationId)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
          >
            {TRANSLATIONS.filter((t) => t.id !== leftTranslation).map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName} ({t.language})
              </option>
            ))}
          </select>
        </header>
      )}

      {/* SÉLECTEUR COMPACT — mode embedded */}
      {embedded && onNavigate && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <select
            value={bookName}
            onChange={(e) => handleBookChange(e.target.value)}
            className="max-w-[140px] flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
            aria-label="Choisir un livre"
          >
            {allBooks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={chapitre}
            onChange={(e) => handleChapterChange(parseInt(e.target.value, 10))}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
            aria-label="Choisir un chapitre"
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Ch. {n}
              </option>
            ))}
          </select>

          <select
            value={rightTranslation}
            onChange={(e) => setRightTranslation(e.target.value as TranslationId)}
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
            aria-label="Choisir une traduction"
          >
            {TRANSLATIONS.filter((t) => t.id !== leftTranslation).map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName}
              </option>
            ))}
          </select>

          {/* Contrôle de taille de police */}
          <div className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-1">
            <button
              type="button"
              onClick={() => cycleFontSize(-1)}
              disabled={fontSize === "sm"}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Réduire la police"
              aria-label="Réduire la police"
            >
              <span className="text-xs font-bold">A−</span>
            </button>
            <button
              type="button"
              onClick={() => cycleFontSize(1)}
              disabled={fontSize === "xl"}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Agrandir la police"
              aria-label="Agrandir la police"
            >
              <span className="text-sm font-bold">A+</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENU 2 COLONNES */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)]"
            style={{ borderTopColor: "var(--color-accent)" }}
          />
        </div>
      ) : !leftVersets || !rightVersets ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
              Traductions indisponibles pour ce chapitre
            </p>
            <p className="text-xs text-[var(--muted)]">
              Essaie un autre livre ou une autre traduction.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className={`mx-auto ${embedded ? "max-w-full px-3 py-4" : "max-w-6xl px-4 py-6 md:px-6"}`}>
            {/* En-têtes de colonnes */}
            <div className="sticky top-0 z-10 mb-4 grid grid-cols-2 gap-3 border-b border-[var(--border)] bg-[var(--background)] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                    color: "var(--color-accent)",
                  }}
                >
                  {leftConfig?.flag}
                </span>
                <span className={`font-bold text-[var(--color-primary)] ${embedded ? "text-xs" : "text-sm"}`}>
                  {leftConfig?.shortName || leftConfig?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                    color: "var(--color-accent)",
                  }}
                >
                  {rightConfig?.flag}
                </span>
                <span className={`font-bold text-[var(--color-primary)] ${embedded ? "text-xs" : "text-sm"}`}>
                  {rightConfig?.shortName || rightConfig?.name}
                </span>
              </div>
            </div>

            {/* Versets alignés */}
            <div className="flex flex-col">
              {sortedVersets.map((numero) => {
                const leftText = leftVersets[numero];
                const rightText = rightVersets[numero];

                return (
                  <div
                    key={numero}
                    className="grid grid-cols-2 gap-3 border-b border-[var(--border)] py-2.5"
                  >
                    <div className="flex gap-2">
                      <span className="mt-0.5 h-fit shrink-0 select-none rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted)]">
                        {numero}
                      </span>
                      <p className={`flex-1 leading-relaxed text-[var(--foreground)] ${embedded ? getCompareFontClass(fontSize) : "text-sm md:text-base"}`}>
                        {leftText || (
                          <span className="italic text-[var(--muted)]">
                            (non disponible)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="mt-0.5 h-fit shrink-0 select-none rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted)]">
                        {numero}
                      </span>
                      <p className={`flex-1 leading-relaxed text-[var(--foreground)] ${embedded ? getCompareFontClass(fontSize) : "text-sm md:text-base"}`}>
                        {rightText || (
                          <span className="italic text-[var(--muted)]">
                            (non disponible)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-[var(--muted)]">
              {sortedVersets.length} versets · {leftConfig?.shortName} / {rightConfig?.shortName}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ============================================================
  // BOUTON BEN — Rendu une seule fois (mode plein écran uniquement)
  // ============================================================

  const benButton = (() => {
    const rc = TRANSLATIONS.find((t) => t.id === rightTranslation);
    if (!rc) return null;

    return (
      <button
  type="button"
  onClick={() => {
    const slug = slugify(bookName);
    window.location.href = `/read/${rightTranslation}/${slug}/${chapitre}`;
  }}
        className="group fixed bottom-6 right-6 z-30 flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-[var(--color-accent)]/40 bg-[var(--surface)] py-2 pl-2 pr-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]"
        style={{
          boxShadow:
            "0 10px 40px color-mix(in srgb, var(--color-accent) 25%, transparent), 0 4px 16px rgba(0,0,0,0.2)",
        }}
        title={`Lire ${rc.name} en plein écran`}
      >
        {/* Effet shimmer au hover */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden="true"
        />

        {/* Badge drapeau */}
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-black uppercase tracking-wider transition-transform duration-300 group-hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 30%, transparent), color-mix(in srgb, var(--color-accent) 12%, transparent))",
            color: "var(--color-accent)",
            border:
              "1.5px solid color-mix(in srgb, var(--color-accent) 40%, transparent)",
            boxShadow:
              "inset 0 1px 2px color-mix(in srgb, var(--color-accent) 20%, transparent)",
          }}
        >
          {rc.flag}
        </span>

        {/* Texte : BEN */}
        <span className="relative flex flex-col items-start leading-none">
          <span
            className="text-base font-black tracking-widest text-[var(--color-accent)]"
            style={{
              textShadow:
                "0 1px 2px color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            BEN
          </span>
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-[var(--muted)]">
            {rc.shortName}
          </span>
        </span>

        {/* Flèche circulaire */}
        <span
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))",
            boxShadow:
              "0 4px 14px color-mix(in srgb, var(--color-accent) 50%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    );
  })();

  // Mode embarqué : juste le contenu (pas de bouton BEN)
  if (embedded) {
    return (
      <div className="flex h-full flex-col" style={{ fontFamily: "var(--font-serif)" }}>
        {content}
      </div>
    );
  }

  // Mode plein écran : overlay + bouton BEN flottant
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--background)]"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {content}
      {benButton}
    </div>
  );
}
