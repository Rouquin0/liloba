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
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import {
  getOfflineChapterFor,
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
import AudioReader from "@/components/AudioReader";
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
  livre: string;
  chapitre: number;
  translationId?: TranslationId;
  onNavigate: (livre: string, chapitre: number) => void;
  onBackToList?: () => void;
  showHeader?: boolean;
  showSplitButton?: boolean;
  showMenuButton?: boolean;
  compact?: boolean;
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
  const [versets, setVersets] = useState<Record<string, string> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(
    translationId ?? "lsg"
  );

  const [isDesktop, setIsDesktop] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});
  const [animatingVerses, setAnimatingVerses] = useState<Record<string, number>>({});
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [focusedVerse, setFocusedVerse] = useState<string | null>(null);
  const [noteVerse, setNoteVerse] = useState<string | null>(null);
  const [cardVerse, setCardVerse] = useState<{ reference: string; text: string } | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("verse");
  const [showCompare, setShowCompare] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const bookName = findBookBySlug(slug);
  const totalChapters = bookName ? (CHAPTERS_COUNT[bookName] ?? 0) : 0;
  const translationConfig = TRANSLATIONS.find((t) => t.id === activeTranslation);
  const isLsg = activeTranslation === "lsg";

  useEffect(() => {
    setMounted(true);
    setDisplayMode(getDisplayMode());
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  // 🔑 CHARGEMENT DES VERSETS (AMÉLIORÉ POUR LE HORS-LIGNE)
  useEffect(() => {
    if (!bookName) return;
    if (chapitre < 1 || chapitre > totalChapters) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function load() {
      try {
        // 1. On cherche d'abord dans IndexedDB (pour les 10 traductions)
        const offlineData = await getOfflineChapterFor(
          activeTranslation,
          bookName as string,
          chapitre
        );

        if (offlineData && Object.keys(offlineData).length > 0) {
          if (!cancelled) {
            setVersets(offlineData);
            setIsOffline(true);
            setIsLoading(false);
          }
          
          // Si on est hors ligne, on s'arrête là (on a lu IndexedDB)
          if (typeof navigator !== "undefined" && !navigator.onLine) return;
          
          // Si on est en ligne, on rafraîchit silencieusement en arrière-plan
          try {
            if (isLsg) {
              const data = await fetchChapitre(bookName as string, chapitre);
              if (!cancelled && data?.versets) {
                setVersets(data.versets);
                setIsOffline(false);
              }
            } else {
              const fresh = await getChapter(activeTranslation, bookName as string, chapitre);
              if (!cancelled && fresh && Object.keys(fresh).length > 0) {
                setVersets(fresh);
                setIsOffline(false);
              }
            }
          } catch {
            // En cas d'erreur réseau, on garde le cache offline
          }
          return;
        }

        // 2. Si pas en cache et hors ligne -> Message d'erreur clair
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          if (!cancelled) {
            setError(
              `Hors ligne : ${bookName} ${chapitre} (${activeTranslation.toUpperCase()}) n'est pas en cache. Reconnecte-toi une fois pour le télécharger.`
            );
            setIsLoading(false);
          }
          return;
        }

        // 3. Sinon (en ligne) -> Chargement classique
        if (isLsg) {
          const data = await fetchChapitre(bookName as string, chapitre);
          if (!cancelled) {
            setVersets(data.versets);
            setIsOffline(false);
          }
        } else {
          const data = await getChapter(activeTranslation, bookName as string, chapitre);
          if (!cancelled) {
            if (data && Object.keys(data).length > 0) {
              setVersets(data);
              setIsOffline(false);
            } else {
              setError(`Cette traduction ne contient pas ${bookName} ${chapitre}.`);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger le chapitre.");
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

  // Remonte en haut à chaque changement de chapitre / livre
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [slug, chapitre]);

  const hasPrev = chapitre > 1;
  const hasNext = chapitre < totalChapters;

  const goToPrev = () => { if (hasPrev) onNavigate(slug, chapitre - 1); };
  const goToNext = () => { if (hasNext) onNavigate(slug, chapitre + 1); };

  if (!bookName) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Livre introuvable</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Le livre &quot;{slug}&quot; n&apos;existe pas.</p>
        </div>
      </div>
    );
  }

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
      href: `/read/${activeTranslation}/${slug}/${chapitre}#v${numero}`,
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
        href: `/read/${activeTranslation}/${slug}/${chapitre}#v${numero}`,
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
    addJournalEntry("verse_highlighted", selectedVerse, { detail: `Couleur : ${color}`, reference: selectedVerse });
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
    navigator.clipboard.writeText(`${selectedVerse} : ${cleanTexte}`).then(() => setSelectedVerse(null)).catch(() => setSelectedVerse(null));
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
      if (dx > dy * 1.5 && dx > 20) isSwipingRef.current = true;
      else if (dy > dx) isSwipingRef.current = false;
    }
  };

  const handleTouchEndSwipe = () => {
    if (touchStartX.current === null || touchEndX.current === null || !isSwipingRef.current) {
      touchStartX.current = null; touchStartY.current = null; touchEndX.current = null; touchEndY.current = null; isSwipingRef.current = false; return;
    }
    const dx = touchEndX.current - touchStartX.current;
    if (Math.abs(dx) > 100) {
      if (dx < 0 && hasNext) onNavigate(slug, chapitre + 1);
      else if (dx > 0 && hasPrev) onNavigate(slug, chapitre - 1);
    }
    touchStartX.current = null; touchStartY.current = null; touchEndX.current = null; touchEndY.current = null; isSwipingRef.current = false;
  };

  const contentPadding = compact ? "px-3 py-4 md:px-4" : "px-4 py-6 md:px-6";
  const maxWidth = compact ? "max-w-full" : "max-w-3xl";

  const translationBadge = !isLsg && translationConfig ? (
    <div className="mb-4 flex items-center gap-2">
      <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}>
        {translationConfig.flag}
      </span>
      <span className="text-xs font-medium text-[var(--muted)]">
        {translationConfig.name} · {translationConfig.language}
      </span>
    </div>
  ) : null;

  // 📱 Sélecteur de chapitre (mobile uniquement, via le slot du header).
  // totalChapters vient de CHAPTERS_COUNT (constante locale) : aucun réseau,
  // donc utilisable en mode avion. Le chargement IndexedDB reste dans l'effet
  // [bookName, chapitre, ...] qui se redéclenche après onNavigate.
  const chapterSelect =
    totalChapters > 1 ? (
      <select
        aria-label="Choisir le chapitre"
        value={chapitre}
        onChange={(e) => onNavigate(slug, parseInt(e.target.value, 10))}
        className="h-9 w-[4.75rem] rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
      >
        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            Ch. {n}
          </option>
        ))}
      </select>
    ) : null;

  return (
    <div className={`flex h-full flex-col ${embeddedMenus ? "relative" : ""}`}>
      {showHeader && (
        <BibleHeader
          title={`${bookName} ${chapitre}`}
          subtitle={isOffline ? `Hors ligne · Chapitre ${chapitre} sur ${totalChapters}` : `Chapitre ${chapitre} sur ${totalChapters}`}
          onBack={onBackToList}
          backHref={onBackToList ? undefined : `/bible/${slug}`}
          showSplitButton={showSplitButton}
          showMenuButton={showMenuButton}
          mobileRightSlot={chapterSelect}
        />
      )}

      {mounted && !compact && (
        <button type="button" onClick={() => setShowCompare(true)} className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-lg transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-xl md:flex" aria-label="Comparer les traductions">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /><path d="m15 9-3 3 3 3" /></svg>
          Comparer
        </button>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStartSwipe} onTouchMove={handleTouchMoveSwipe} onTouchEnd={handleTouchEndSwipe}>
        <div className={`mx-auto ${maxWidth} ${contentPadding}`}>
          {mounted && isOffline && !isLoading && (
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]" title="Chapitre chargé hors ligne">
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
              <AudioReader bookName={bookName as string} chapitre={chapitre} versets={versets} translationId={activeTranslation} />
              <h2 className="mb-6 border-b border-[var(--border)] pb-3 text-2xl font-bold text-[var(--color-primary)] md:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
                {bookName} {chapitre}
              </h2>

              {displayMode === "paragraph" && (
                <div className="text-[var(--foreground)]" style={mounted ? getVerseStyles() : undefined}>
                  {Object.entries(versets).map(([numero, texte]) => {
                    const reference = `${bookName} ${chapitre}:${numero}`;
                    const highlightColor = highlights[reference];
                    const colorConfig = highlightColor ? getColorConfig(highlightColor) : null;
                    const animatedCount = animatingVerses[reference];
                    const isAnimating = animatedCount !== undefined;
                    const texteClean = texte.replace(/<CM>/g, "").trim();
                    const phrases = decouperEnPhrases(texteClean);
                    const phrasesASurligner = isAnimating ? animatedCount : highlightColor ? phrases.length : 0;
                    const isFocused = focusedVerse === reference;
                    return (
                      <span key={numero} onClick={(e) => { if (!longPressTriggered) { handleVerseClick(e, reference); } setLongPressTriggered(false); }} onDoubleClick={() => handleVerseDoubleClick(reference)} onTouchStart={() => handleVerseTouchStart(reference)} onTouchEnd={handleVerseTouchEnd} onTouchCancel={handleVerseTouchEnd} className={`cursor-pointer rounded transition-all duration-300 ${isFocused ? "relative z-50 inline-block scale-[1.02] bg-[var(--surface)] px-2 py-1 shadow-lg ring-2" : "hover:bg-[var(--surface-hover)]"}`} style={isFocused ? { "--tw-ring-color": "color-mix(in srgb, var(--color-accent) 40%, transparent)", boxShadow: "0 4px 20px color-mix(in srgb, var(--color-accent) 15%, transparent)" } as any : undefined}>
                        <sup className="mr-1 select-none font-sans text-[0.65em] font-bold" style={{ color: "var(--color-accent)", verticalAlign: "super", lineHeight: 0 }}>{numero}</sup>
                        {phrases.map((phrase, idx) => {
                          const isHighlighted = idx < phrasesASurligner && colorConfig;
                          return (
                            <span key={idx} className="transition-all duration-300" style={isHighlighted ? { background: colorConfig.bg, borderLeft: idx === 0 ? `3px solid ${colorConfig.border}` : undefined, paddingLeft: idx === 0 ? "4px" : undefined } : undefined}>
                              {phrase}{idx < phrases.length - 1 ? " " : ""}
                            </span>
                          );
                        })}
                        <span> </span>
                      </span>
                    );
                  })}
                </div>
              )}

              {displayMode === "verse" && (
                <div className="flex flex-col gap-0" style={{ fontFamily: "var(--font-serif)" }}>
                  {Object.entries(versets).map(([numero, texte]) => {
                    const reference = `${bookName} ${chapitre}:${numero}`;
                    const highlightColor = highlights[reference];
                    const colorConfig = highlightColor ? getColorConfig(highlightColor) : null;
                    const animatedCount = animatingVerses[reference];
                    const isAnimating = animatedCount !== undefined;
                    const texteClean = texte.replace(/<CM>/g, "").trim();
                    const phrases = decouperEnPhrases(texteClean);
                    const phrasesASurligner = isAnimating ? animatedCount : highlightColor ? phrases.length : 0;
                    return (
                      <p key={numero} onClick={(e) => { if (!longPressTriggered) { handleVerseClick(e, reference); } setLongPressTriggered(false); }} onDoubleClick={() => handleVerseDoubleClick(reference)} onTouchStart={() => handleVerseTouchStart(reference)} onTouchEnd={handleVerseTouchEnd} onTouchCancel={handleVerseTouchEnd} className={`group flex cursor-pointer gap-2 rounded-lg px-3 py-1.5 text-[var(--foreground)] transition-transform duration-300 ease-out ${focusedVerse === reference ? "relative z-50 scale-[1.03] bg-[var(--surface)] shadow-xl" : "hover:bg-[var(--surface-hover)]"}`} style={mounted ? getVerseStyles() : undefined}>
                        <span className="mt-1 h-fit shrink-0 select-none rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted)] md:text-sm">{numero}</span>
                        <span className="flex-1">
                          {phrases.map((phrase, idx) => {
                            const isHighlighted = idx < phrasesASurligner && colorConfig;
                            return (
                              <span key={idx} className="transition-all duration-300" style={isHighlighted ? { background: colorConfig.bg, borderLeft: idx === 0 ? `3px solid ${colorConfig.border}` : undefined, paddingLeft: idx === 0 ? "4px" : undefined } : undefined}>
                                {phrase}{idx < phrases.length - 1 ? " " : ""}
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
                <button type="button" onClick={goToPrev} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                  ← {bookName} {chapitre - 1}
                </button>
              ) : <span />}
              <button type="button" onClick={onBackToList} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                Chapitres
              </button>
              {hasNext ? (
                <button type="button" onClick={goToNext} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                  {bookName} {chapitre + 1} →
                </button>
              ) : <span />}
            </div>
          </div>
        )}
      </div>

      {selectedVerse && (
        <VerseActionMenu reference={selectedVerse} currentColor={highlights[selectedVerse] || null} onSelectColor={handleSelectColor} onCopy={handleCopy} onRemove={handleRemoveHighlight} onClose={() => setSelectedVerse(null)} position={menuPosition} onToggleFavorite={handleToggleFavorite} onOpenNote={handleOpenNote} onShareImage={handleShareImage} embedded={embeddedMenus} />
      )}
      {noteVerse && <NoteModal reference={noteVerse} onClose={() => setNoteVerse(null)} />}
      {cardVerse && <VerseCardModal reference={cardVerse.reference} text={cardVerse.text} onClose={() => setCardVerse(null)} />}
      {focusedVerse && <VerseIOSMenu reference={focusedVerse} onClose={() => setFocusedVerse(null)} embedded={embeddedMenus} />}
      {showCompare && (
        <TranslationCompare bookName={bookName as string} chapitre={chapitre} leftTranslation={activeTranslation} defaultRight={isLsg ? "martin" : "lsg"} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}

function LoadingVersets() {
  const widths = [85, 92, 78, 88, 95, 82, 90, 75, 87, 80];
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
      {widths.map((w, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-[var(--surface-hover)]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}
