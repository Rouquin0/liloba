"use client";

import {
  getVerseStyles,
  getDisplayMode,
  type DisplayMode,
  getDefaultTranslation,
} from "@/lib/preferences";
import { useEffect, useRef, useState } from "react";
import { fetchChapitre } from "@/lib/api";
import {
  findBookBySlug,
  getSlugByBookName,
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import {
  getOfflineChapitre,
  getOfflineStatus,
} from "@/lib/offline-bible";
import {
  getHighlightColor,
  setHighlight,
  removeHighlight,
  getColorConfig,
  type HighlightColor,
} from "@/lib/highlights";
import BibleHeader from "@/components/BibleHeader";
import { addToHistory } from "@/lib/history";
import { trackStreak } from "@/lib/stats";
import { addJournalEntry } from "@/lib/journal";
import VerseActionMenu from "@/components/VerseActionMenu";
import VerseIOSMenu from "@/components/VerseIOSMenu";
import { toggleFavorite } from "@/lib/notes";
import NoteModal from "@/components/NoteModal";
import VerseCardModal from "@/components/VerseCardModal";
import TranslationCompare from "@/components/TranslationCompare";
import {
  type TranslationId,
  getChapter,
  TRANSLATIONS,
} from "@/lib/translations";

// ============================================================
// UTILITAIRE — Découpe un verset en phrases
// ============================================================

function decouperEnPhrases(texte: string): string[] {
  const phrases = texte
    .split(/(?<=[.!?;])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return phrases.length > 0 ? phrases : [texte];
}

// ============================================================
// PROPS
// ============================================================

interface BibleReaderProps {
  /** Slug du livre (ex: "genese") */
  livre: string;
  /** Numéro du chapitre */
  chapitre: number;
  /**
   * Traduction à afficher (optionnel).
   * Si non fourni, utilise la traduction par défaut des préférences.
   * ⚠️ Passer "lsg" explicitement pour forcer le LSG (utilisé par exemple
   * par la route /read/[translation]/... ou pour figer une traduction).
   */
  translationId?: TranslationId;
  /** Callback quand on navigue vers un autre chapitre */
  onNavigate: (livre: string, chapitre: number) => void;
  /** Callback quand on clique "retour" (vers la liste des chapitres) */
  onBackToList?: () => void;
  /** Affiche le header (par défaut true) */
  showHeader?: boolean;
  /** Affiche le bouton "split" dans le header */
  showSplitButton?: boolean;
  /** Bouton menu (au lieu de retour) */
  showMenuButton?: boolean;
  /** Style compact (pour un panneau réduit) */
  compact?: boolean;
  /** Menus contextuels en mode embedded (dans un panneau) */
  embeddedMenus?: boolean;
}

export default function BibleReader({
  livre: slug,
  chapitre,
  translationId,
  onNavigate,
  onBackToList,
  showHeader = true,
  showSplitButton = false,
  showMenuButton = false,
  compact = false,
  embeddedMenus = false,
}: BibleReaderProps) {
  // ============================================================
  // ✅ TOUS LES HOOKS EN PREMIER
  // ============================================================

  const [versets, setVersets] = useState<Record<string, string> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

    // Traduction active (peut venir du prop OU de la préférence)
  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(
    translationId ?? "lsg"
  );

  // Détection mobile / desktop (768px = md dans Tailwind)
  const [isDesktop, setIsDesktop] = useState(false);

  // Surlignages
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});

  // Phrases en cours d'animation
  const [animatingVerses, setAnimatingVerses] = useState<Record<string, number>>({});

  // Menu contextuel
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [focusedVerse, setFocusedVerse] = useState<string | null>(null);
  const [noteVerse, setNoteVerse] = useState<string | null>(null);
  const [cardVerse, setCardVerse] = useState<{
    reference: string;
    text: string;
  } | null>(null);

  // Mode d'affichage
  const [displayMode, setDisplayMode] = useState<DisplayMode>("verse");

  // Comparateur
  const [showCompare, setShowCompare] = useState(false);

  // Long press
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  // ============================================================
  // CALCULS
  // ============================================================

  const bookName = findBookBySlug(slug);
  const totalChapters = bookName ? (CHAPTERS_COUNT[bookName] ?? 0) : 0;
  const translationConfig = TRANSLATIONS.find((t) => t.id === activeTranslation);
  const isLsg = activeTranslation === "lsg";

  // ============================================================
  // CHARGEMENT DU CHAPITRE
  // ============================================================

    useEffect(() => {
    setMounted(true);
    setDisplayMode(getDisplayMode());

    // Détection desktop (≥ 768px)
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

    // 🔑 Synchronise activeTranslation :
  //  - Si le prop est fourni : on l'utilise (route /read/...)
  //  - Sinon :
  //      • Sur MOBILE : on lit la préférence
  //      • Sur DESKTOP : on force LSG (le comparateur et BEN servent à ça)
  useEffect(() => {
    if (translationId) {
      setActiveTranslation(translationId);
      return;
    }
    if (isDesktop) {
      setActiveTranslation("lsg");
    } else {
      setActiveTranslation(getDefaultTranslation() as TranslationId);
    }
  }, [translationId, isDesktop]);

    // 🔑 Écoute l'événement "default-translation-updated"
  // Seulement si le prop translationId n'est PAS fourni
  // ET qu'on est sur MOBILE (sur desktop on reste en LSG)
  useEffect(() => {
    if (translationId) return;
    if (isDesktop) return;
    if (typeof window === "undefined") return;

    const handler = () => {
      setActiveTranslation(getDefaultTranslation() as TranslationId);
    };

    window.addEventListener("liloba:default-translation-updated", handler);
    return () => {
      window.removeEventListener("liloba:default-translation-updated", handler);
    };
  }, [translationId, isDesktop]);

  // 🔑 Chargement des versets
  useEffect(() => {
    if (!bookName) return;
    if (chapitre < 1 || chapitre > totalChapters) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function load() {
      try {
        // Pour le LSG (traduction principale) : on utilise le cache offline
        // + l'API backend
        if (isLsg) {
          const offlineData = await getOfflineChapitre(
            bookName as string,
            chapitre
          );

          if (offlineData && !cancelled) {
            setVersets(offlineData);
            setIsOffline(true);
            setIsLoading(false);
            return;
          }

          const data = await fetchChapitre(bookName as string, chapitre);
          if (!cancelled) {
            setVersets(data.versets);
            setIsOffline(false);
          }
        } else {
          // Pour les autres traductions : chargement direct depuis le JSON
          const data = await getChapter(
            activeTranslation,
            bookName as string,
            chapitre
          );

          if (!cancelled) {
            if (data && Object.keys(data).length > 0) {
              setVersets(data);
              setIsOffline(false);
            } else {
              setError(
                `Cette traduction ne contient pas ${bookName} ${chapitre}.`
              );
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger le chapitre."
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
  }, [bookName, chapitre, totalChapters, activeTranslation, isLsg]);

  // ============================================================
  // CHARGEMENT DES SURLIGNAGES
  // ============================================================

  useEffect(() => {
    if (!versets || !bookName) return;

    const initialHighlights: Record<string, HighlightColor> = {};
    for (const numero of Object.keys(versets)) {
      const reference = `${bookName} ${chapitre}:${numero}`;
      const color = getHighlightColor(reference);
      if (color) {
        initialHighlights[reference] = color;
      }
    }
    setHighlights(initialHighlights);
  }, [versets, bookName, chapitre]);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const hasPrev = chapitre > 1;
  const hasNext = chapitre < totalChapters;

  const goToPrev = () => {
    if (hasPrev) onNavigate(slug, chapitre - 1);
  };
  const goToNext = () => {
    if (hasNext) onNavigate(slug, chapitre + 1);
  };

  // ============================================================
  // SI LIVRE INVALIDE
  // ============================================================

  if (!bookName) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Livre introuvable
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Le livre &quot;{slug}&quot; n&apos;existe pas.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleVerseClick = (e: React.MouseEvent, reference: string) => {
    e.stopPropagation();
    setSelectedVerse(reference);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleVerseDoubleClick = (reference: string) => {
    setFocusedVerse(reference);
    setSelectedVerse(null);
    if (!versets) return;
    const numero = reference.split(":")[1];
    const texte = versets[numero];
    if (!texte) return;
    addToHistory({
      reference,
      livre: bookName as string,
      chapitre,
      verset: parseInt(numero, 10),
      texte: texte.replace(/<CM>/g, "").trim(),
      slug,
    });
    trackStreak();
    window.dispatchEvent(new Event("liloba:streak-updated"));

    addJournalEntry("verse_marked", reference, {
      detail: texte.replace(/<CM>/g, "").trim().slice(0, 80),
      reference,
      href: `/bible/${slug}/${chapitre}#v${numero}`,
    });
  };

  const handleVerseTouchStart = (reference: string) => {
    setLongPressTriggered(false);
    longPressTimer.current = setTimeout(() => {
      setLongPressTriggered(true);
      setFocusedVerse(reference);
      setSelectedVerse(null);
      if (!versets) return;
      const numero = reference.split(":")[1];
      const texte = versets[numero];
      if (!texte) return;
      addToHistory({
        reference,
        livre: bookName as string,
        chapitre,
        verset: parseInt(numero, 10),
        texte: texte.replace(/<CM>/g, "").trim(),
        slug,
      });
      trackStreak();
      window.dispatchEvent(new Event("liloba:streak-updated"));

      addJournalEntry("verse_marked", reference, {
        detail: texte.replace(/<CM>/g, "").trim().slice(0, 80),
        reference,
        href: `/bible/${slug}/${chapitre}#v${numero}`,
      });
    }, 500);
  };

  const handleVerseTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSelectColor = (color: HighlightColor) => {
    if (!selectedVerse || !versets) return;

    const numero = selectedVerse.split(":")[1];
    const texte = versets[numero];
    if (!texte) return;

    setHighlight(selectedVerse, color);
    setHighlights((prev) => ({ ...prev, [selectedVerse]: color }));

    addJournalEntry("verse_highlighted", selectedVerse, {
      detail: `Couleur : ${color}`,
      reference: selectedVerse,
    });

    const phrases = decouperEnPhrases(texte.replace(/<CM>/g, "").trim());
    const totalPhrases = phrases.length;

    setAnimatingVerses((prev) => ({ ...prev, [selectedVerse]: 0 }));

    for (let i = 1; i <= totalPhrases; i++) {
      setTimeout(() => {
        setAnimatingVerses((prev) => ({ ...prev, [selectedVerse]: i }));
      }, i * 300);
    }

    setTimeout(() => {
      setAnimatingVerses((prev) => {
        const next = { ...prev };
        delete next[selectedVerse];
        return next;
      });
    }, totalPhrases * 300 + 500);

    setSelectedVerse(null);
  };

  const handleRemoveHighlight = () => {
    if (!selectedVerse) return;
    removeHighlight(selectedVerse);
    setHighlights((prev) => {
      const next = { ...prev };
      delete next[selectedVerse];
      return next;
    });
    setSelectedVerse(null);
  };

  const handleCopy = () => {
    if (!selectedVerse || !versets) return;

    const numero = selectedVerse.split(":")[1];
    const texte = versets[numero];
    if (!texte) return;

    const cleanTexte = texte.replace(/<CM>/g, "").trim();

    navigator.clipboard
      .writeText(`${selectedVerse} : ${cleanTexte}`)
      .then(() => setSelectedVerse(null))
      .catch(() => setSelectedVerse(null));
  };

  const handleToggleFavorite = () => {
    if (!selectedVerse) return;
    toggleFavorite(selectedVerse);
    setSelectedVerse(null);
  };

  const handleOpenNote = () => {
    if (!selectedVerse) return;
    const ref = selectedVerse;
    setSelectedVerse(null);
    setNoteVerse(ref);
  };

  const handleShareImage = () => {
    if (!selectedVerse || !versets) return;
    const numero = selectedVerse.split(":")[1];
    const texte = versets[numero];
    if (!texte) return;
    const cleanText = texte.replace(/<CM>/g, "").trim();
    setCardVerse({ reference: selectedVerse, text: cleanText });
    setSelectedVerse(null);
  };

  // ============================================================
  // SWIPE MOBILE
  // ============================================================

  const handleTouchStartSwipe = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchEndX.current = null;
    touchEndY.current = null;
    isSwipingRef.current = false;
  };

  const handleTouchMoveSwipe = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;

    if (touchStartX.current !== null && touchStartY.current !== null) {
      const dx = Math.abs(touch.clientX - touchStartX.current);
      const dy = Math.abs(touch.clientY - touchStartY.current);

      if (dx > dy * 1.5 && dx > 20) {
        isSwipingRef.current = true;
      } else if (dy > dx) {
        isSwipingRef.current = false;
      }
    }
  };

  const handleTouchEndSwipe = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      !isSwipingRef.current
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
      isSwipingRef.current = false;
      return;
    }

    const dx = touchEndX.current - touchStartX.current;
    const SWIPE_THRESHOLD = 100;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0 && hasNext) {
        onNavigate(slug, chapitre + 1);
      } else if (dx > 0 && hasPrev) {
        onNavigate(slug, chapitre - 1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
    isSwipingRef.current = false;
  };

  // ============================================================
  // RENDU
  // ============================================================

  const contentPadding = compact ? "px-3 py-4 md:px-4" : "px-4 py-6 md:px-6";
  const maxWidth = compact ? "max-w-full" : "max-w-3xl";

  // Badge de traduction (affiché si ce n'est pas LSG)
  const translationBadge = !isLsg && translationConfig ? (
    <div className="mb-4 flex items-center gap-2">
      <span
        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
          color: "var(--color-accent)",
        }}
      >
        {translationConfig.flag}
      </span>
      <span className="text-xs font-medium text-[var(--muted)]">
        {translationConfig.name} · {translationConfig.language}
      </span>
    </div>
  ) : null;

  return (
    <div className={`flex h-full flex-col ${embeddedMenus ? "relative" : ""}`}>
      {showHeader && (
        <BibleHeader
          title={`${bookName} ${chapitre}`}
          subtitle={
            isOffline
              ? `Hors ligne · Chapitre ${chapitre} sur ${totalChapters}`
              : `Chapitre ${chapitre} sur ${totalChapters}`
          }
          onBack={onBackToList}
          backHref={onBackToList ? undefined : `/bible/${slug}`}
          showSplitButton={showSplitButton}
          showMenuButton={showMenuButton}
        />
      )}

      {/* Bouton Comparer — desktop */}
      {mounted && !compact && (
        <button
          type="button"
          onClick={() => setShowCompare(true)}
          className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-lg transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-xl md:flex"
          aria-label="Comparer les traductions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="M9 3v18" />
            <path d="m15 9-3 3 3 3" />
          </svg>
          Comparer
        </button>
      )}

      <div
        className="flex-1 overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStartSwipe}
        onTouchMove={handleTouchMoveSwipe}
        onTouchEnd={handleTouchEndSwipe}
      >
        <div className={`mx-auto ${maxWidth} ${contentPadding}`}>
          {mounted && isOffline && !isLoading && (
            <div
              className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]"
              title="Chapitre chargé hors ligne"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span>Hors ligne</span>
            </div>
          )}

          {isLoading && <LoadingVersets />}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && versets && (
            <article>
              {translationBadge}

              <h2
                className="mb-6 border-b border-[var(--border)] pb-3 text-2xl font-bold text-[var(--color-primary)] md:text-3xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {bookName} {chapitre}
              </h2>

              {/* MODE PARAGRAPHE */}
              {displayMode === "paragraph" && (
                <div
                  className="text-[var(--foreground)]"
                  style={mounted ? getVerseStyles() : undefined}
                >
                  {Object.entries(versets).map(([numero, texte]) => {
                    const reference = `${bookName} ${chapitre}:${numero}`;
                    const highlightColor = highlights[reference];
                    const colorConfig = highlightColor
                      ? getColorConfig(highlightColor)
                      : null;

                    const animatedCount = animatingVerses[reference];
                    const isAnimating = animatedCount !== undefined;

                    const texteClean = texte.replace(/<CM>/g, "").trim();
                    const phrases = decouperEnPhrases(texteClean);

                    const phrasesASurligner = isAnimating
                      ? animatedCount
                      : highlightColor
                        ? phrases.length
                        : 0;

                    const isFocused = focusedVerse === reference;

                    return (
                      <span
                        key={numero}
                        onClick={(e) => {
                          if (!longPressTriggered) {
                            handleVerseClick(e, reference);
                          }
                          setLongPressTriggered(false);
                        }}
                        onDoubleClick={() => handleVerseDoubleClick(reference)}
                        onTouchStart={() => handleVerseTouchStart(reference)}
                        onTouchEnd={handleVerseTouchEnd}
                        onTouchCancel={handleVerseTouchEnd}
                        className={`cursor-pointer rounded transition-all duration-300 ${
                          isFocused
                            ? "relative z-50 inline-block scale-[1.02] bg-[var(--surface)] px-2 py-1 shadow-lg ring-2"
                            : "hover:bg-[var(--surface-hover)]"
                        }`}
                        style={
                          isFocused
                            ? {
                                // @ts-ignore
                                "--tw-ring-color":
                                  "color-mix(in srgb, var(--color-accent) 40%, transparent)",
                                boxShadow:
                                  "0 4px 20px color-mix(in srgb, var(--color-accent) 15%, transparent)",
                              }
                            : undefined
                        }
                      >
                        <sup
                          className="mr-1 select-none font-sans text-[0.65em] font-bold"
                          style={{
                            color: "var(--color-accent)",
                            verticalAlign: "super",
                            lineHeight: 0,
                          }}
                        >
                          {numero}
                        </sup>
                        {phrases.map((phrase, idx) => {
                          const isHighlighted =
                            idx < phrasesASurligner && colorConfig;

                          return (
                            <span
                              key={idx}
                              className="transition-all duration-300"
                              style={
                                isHighlighted
                                  ? {
                                      background: colorConfig.bg,
                                      borderLeft:
                                        idx === 0
                                          ? `3px solid ${colorConfig.border}`
                                          : undefined,
                                      paddingLeft: idx === 0 ? "4px" : undefined,
                                    }
                                  : undefined
                              }
                            >
                              {phrase}
                              {idx < phrases.length - 1 ? " " : ""}
                            </span>
                          );
                        })}
                        <span> </span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* MODE VERSET PAR VERSET */}
              {displayMode === "verse" && (
                <div
                  className="flex flex-col gap-0"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {Object.entries(versets).map(([numero, texte]) => {
                    const reference = `${bookName} ${chapitre}:${numero}`;
                    const highlightColor = highlights[reference];
                    const colorConfig = highlightColor
                      ? getColorConfig(highlightColor)
                      : null;

                    const animatedCount = animatingVerses[reference];
                    const isAnimating = animatedCount !== undefined;

                    const texteClean = texte.replace(/<CM>/g, "").trim();
                    const phrases = decouperEnPhrases(texteClean);

                    const phrasesASurligner = isAnimating
                      ? animatedCount
                      : highlightColor
                        ? phrases.length
                        : 0;

                    return (
                      <p
                        key={numero}
                        onClick={(e) => {
                          if (!longPressTriggered) {
                            handleVerseClick(e, reference);
                          }
                          setLongPressTriggered(false);
                        }}
                        onDoubleClick={() => handleVerseDoubleClick(reference)}
                        onTouchStart={() => handleVerseTouchStart(reference)}
                        onTouchEnd={handleVerseTouchEnd}
                        onTouchCancel={handleVerseTouchEnd}
                        className={`group flex cursor-pointer gap-2 rounded-lg px-3 py-1.5 text-[var(--foreground)] transition-transform duration-300 ease-out ${
                          focusedVerse === reference
                            ? "relative z-50 scale-[1.03] bg-[var(--surface)] shadow-xl"
                            : "hover:bg-[var(--surface-hover)]"
                        }`}
                        style={mounted ? getVerseStyles() : undefined}
                      >
                        <span className="mt-1 h-fit shrink-0 select-none rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted)] md:text-sm">
                          {numero}
                        </span>
                        <span className="flex-1">
                          {phrases.map((phrase, idx) => {
                            const isHighlighted =
                              idx < phrasesASurligner && colorConfig;

                            return (
                              <span
                                key={idx}
                                className="transition-all duration-300"
                                style={
                                  isHighlighted
                                    ? {
                                        background: colorConfig.bg,
                                        borderLeft:
                                          idx === 0
                                            ? `3px solid ${colorConfig.border}`
                                            : undefined,
                                        paddingLeft: idx === 0 ? "4px" : undefined,
                                      }
                                    : undefined
                                }
                              >
                                {phrase}
                                {idx < phrases.length - 1 ? " " : ""}
                              </span>
                            );
                          })}
                        </span>
                      </p>
                    );
                  })}
                </div>
              )}
            </article>
          )}
        </div>

        {!isLoading && versets && (
          <div className={`mx-auto ${maxWidth} ${compact ? "px-3 pb-6 md:px-4" : "px-4 pb-8 md:px-6"}`}>
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
              {hasPrev ? (
                <button
                  type="button"
                  onClick={goToPrev}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  ← {bookName} {chapitre - 1}
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={onBackToList}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Chapitres
              </button>

              {hasNext ? (
                <button
                  type="button"
                  onClick={goToNext}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {bookName} {chapitre + 1} →
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu contextuel */}
      {selectedVerse && (
        <VerseActionMenu
          reference={selectedVerse}
          currentColor={highlights[selectedVerse] || null}
          onSelectColor={handleSelectColor}
          onCopy={handleCopy}
          onRemove={handleRemoveHighlight}
          onClose={() => setSelectedVerse(null)}
          position={menuPosition}
          onToggleFavorite={handleToggleFavorite}
          onOpenNote={handleOpenNote}
          onShareImage={handleShareImage}
          embedded={embeddedMenus}
        />
      )}

      {/* Modale note */}
      {noteVerse && (
        <NoteModal reference={noteVerse} onClose={() => setNoteVerse(null)} />
      )}

      {/* Modale Verse Card */}
      {cardVerse && (
        <VerseCardModal
          reference={cardVerse.reference}
          text={cardVerse.text}
          onClose={() => setCardVerse(null)}
        />
      )}

      {/* Menu iOS */}
      {focusedVerse && (
        <VerseIOSMenu
          reference={focusedVerse}
          onClose={() => setFocusedVerse(null)}
          embedded={embeddedMenus}
        />
      )}

      {/* Comparateur — la colonne gauche suit la traduction active */}
      {showCompare && (
        <TranslationCompare
          bookName={bookName as string}
          chapitre={chapitre}
          leftTranslation={activeTranslation}
          defaultRight={isLsg ? "martin" : "lsg"}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingVersets() {
  const widths = [85, 92, 78, 88, 95, 82, 90, 75, 87, 80];
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-[var(--surface-hover)]"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}
