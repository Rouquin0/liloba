// "use client";

// import {
//   getVerseStyles,
//   getDisplayMode,
//   type DisplayMode,
// } from "@/lib/preferences";
// import { use, useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { notFound, useRouter } from "next/navigation";
// import { fetchChapitre } from "@/lib/api";
// import {
//   findBookBySlug,
//   CHAPTERS_COUNT,
// } from "@/lib/bible-utils";
// import {
//   getOfflineChapitre,
//   getOfflineStatus,
// } from "@/lib/offline-bible";
// import {
//   getHighlightColor,
//   setHighlight,
//   removeHighlight,
//   getColorConfig,
//   type HighlightColor,
// } from "@/lib/highlights";
// import BibleHeader from "@/components/BibleHeader";
// import { addToHistory } from "@/lib/history";
// import { trackStreak } from "@/lib/stats";
// import { addJournalEntry } from "@/lib/journal";
// import VerseActionMenu from "@/components/VerseActionMenu";
// import VerseIOSMenu from "@/components/VerseIOSMenu";
// import { toggleFavorite } from "@/lib/notes";
// import NoteModal from "@/components/NoteModal";
// import VerseCardModal from "@/components/VerseCardModal";
// import TranslationCompare from "@/components/TranslationCompare";
// import SplitView from "@/components/SplitView";

// // ============================================================
// // UTILITAIRE — Découpe un verset en phrases
// // ============================================================

// function decouperEnPhrases(texte: string): string[] {
//   const phrases = texte
//     .split(/(?<=[.!?;])\s+/)
//     .map((p) => p.trim())
//     .filter((p) => p.length > 0);

//   return phrases.length > 0 ? phrases : [texte];
// }

// interface PageProps {
//   params: Promise<{ livre: string; chapitre: string }>;
// }

// export default function ChapitrePage({ params }: PageProps) {
//   const { livre: slug, chapitre: chapitreStr } = use(params);
//   const router = useRouter();

//   // ============================================================
//   // ✅ TOUS LES HOOKS EN PREMIER (règle React)
//   // ============================================================

//   const [versets, setVersets] = useState<Record<string, string> | null>(null);
//   const [mounted, setMounted] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isOffline, setIsOffline] = useState(false);

//   // Surlignages
//   const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});

//   // Phrases en cours d'animation (pour l'effet stabilo)
//   const [animatingVerses, setAnimatingVerses] = useState<Record<string, number>>({});

//   // Menu contextuel
//   const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
//   const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//   const [focusedVerse, setFocusedVerse] = useState<string | null>(null);
//   const [noteVerse, setNoteVerse] = useState<string | null>(null);
//   const [cardVerse, setCardVerse] = useState<{
//     reference: string;
//     text: string;
//   } | null>(null);

//   // Mode d'affichage (verset / paragraphe)
//   const [displayMode, setDisplayMode] = useState<DisplayMode>("verse");

//   // Comparateur de traductions
//   const [showCompare, setShowCompare] = useState(false);

//   // Long press (mobile)
//   const [longPressTriggered, setLongPressTriggered] = useState(false);
//   const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Swipe (mobile)
//   const touchStartX = useRef<number | null>(null);
//   const touchStartY = useRef<number | null>(null);
//   const touchEndX = useRef<number | null>(null);
//   const touchEndY = useRef<number | null>(null);
//   const isSwipingRef = useRef(false);

//   // ============================================================
//   // CALCULS (après les hooks)
//   // ============================================================

//   const bookName = findBookBySlug(slug);
//   const chapitre = parseInt(chapitreStr, 10);

//   // ============================================================
//   // EARLY RETURNS (après les hooks)
//   // ============================================================

//   if (!bookName || isNaN(chapitre) || chapitre < 1) {
//     notFound();
//   }

//   const totalChapters = CHAPTERS_COUNT[bookName] ?? 0;

//   if (chapitre > totalChapters) {
//     notFound();
//   }

//   // ============================================================
//   // CHARGEMENT DU CHAPITRE
//   // ============================================================

//   useEffect(() => {
//     setMounted(true);
//     setDisplayMode(getDisplayMode());
//   }, []);

//   useEffect(() => {
//     let cancelled = false;
//     setIsLoading(true);
//     setError(null);

//     async function load() {
//       try {
//         const offlineData = await getOfflineChapitre(
//           bookName as string,
//           chapitre
//         );

//         if (offlineData && !cancelled) {
//           setVersets(offlineData);
//           setIsOffline(true);
//           setIsLoading(false);
//           return;
//         }

//         const data = await fetchChapitre(bookName as string, chapitre);
//         if (!cancelled) {
//           setVersets(data.versets);
//           setIsOffline(false);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : "Impossible de charger le chapitre."
//           );
//         }
//       } finally {
//         if (!cancelled) setIsLoading(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [bookName, chapitre]);

//   // ============================================================
//   // CHARGEMENT DES SURLIGNAGES
//   // ============================================================

//   useEffect(() => {
//     if (!versets) return;

//     const initialHighlights: Record<string, HighlightColor> = {};
//     for (const numero of Object.keys(versets)) {
//       const reference = `${bookName} ${chapitre}:${numero}`;
//       const color = getHighlightColor(reference);
//       if (color) {
//         initialHighlights[reference] = color;
//       }
//     }
//     setHighlights(initialHighlights);
//   }, [versets, bookName, chapitre]);

//   // ============================================================
//   // NAVIGATION (calculé AVANT les handlers de swipe)
//   // ============================================================

//   const hasPrev = chapitre > 1;
//   const hasNext = chapitre < totalChapters;
//   const prevHref = hasPrev ? `/bible/${slug}/${chapitre - 1}` : null;
//   const nextHref = hasNext ? `/bible/${slug}/${chapitre + 1}` : null;

//   // ============================================================
//   // ACTIONS
//   // ============================================================

//   const handleVerseClick = (
//     e: React.MouseEvent,
//     reference: string
//   ) => {
//     e.stopPropagation();
//     setSelectedVerse(reference);
//     setMenuPosition({
//       x: e.clientX,
//       y: e.clientY,
//     });
//   };

//   const handleVerseDoubleClick = (reference: string) => {
//     setFocusedVerse(reference);
//     setSelectedVerse(null);
//     // 📜 Enregistre dans l'historique
//     if (!versets) return;
//     const numero = reference.split(":")[1];
//     const texte = versets[numero];
//     if (!texte) return;
//     addToHistory({
//       reference,
//       livre: bookName as string,
//       chapitre,
//       verset: parseInt(numero, 10),
//       texte: texte.replace(/<CM>/g, "").trim(),
//       slug,
//     });
//     // 🔥 Enregistre le streak du jour
//     trackStreak();
//     window.dispatchEvent(new Event("liloba:streak-updated"));

//     // 📔 Ajoute au journal
//     addJournalEntry(
//       "verse_marked",
//       reference,
//       {
//         detail: texte.replace(/<CM>/g, "").trim().slice(0, 80),
//         reference,
//         href: `/bible/${slug}/${chapitre}#v${numero}`,
//       }
//     );
//   };

//   const handleVerseTouchStart = (reference: string) => {
//     setLongPressTriggered(false);
//     longPressTimer.current = setTimeout(() => {
//       setLongPressTriggered(true);
//       setFocusedVerse(reference);
//       setSelectedVerse(null);
//       // 📜 Enregistre dans l'historique
//       if (!versets) return;
//       const numero = reference.split(":")[1];
//       const texte = versets[numero];
//       if (!texte) return;
//       addToHistory({
//         reference,
//         livre: bookName as string,
//         chapitre,
//         verset: parseInt(numero, 10),
//         texte: texte.replace(/<CM>/g, "").trim(),
//         slug,
//       });
//       // 🔥 Enregistre le streak du jour
//       trackStreak();
//       window.dispatchEvent(new Event("liloba:streak-updated"));

//       // 📔 Ajoute au journal
//       addJournalEntry(
//         "verse_marked",
//         reference,
//         {
//           detail: texte.replace(/<CM>/g, "").trim().slice(0, 80),
//           reference,
//           href: `/bible/${slug}/${chapitre}#v${numero}`,
//         }
//       );
//     }, 500);
//   };

//   const handleVerseTouchEnd = () => {
//     if (longPressTimer.current) {
//       clearTimeout(longPressTimer.current);
//       longPressTimer.current = null;
//     }
//   };

//   const handleSelectColor = (color: HighlightColor) => {
//     if (!selectedVerse || !versets) return;

//     const numero = selectedVerse.split(":")[1];
//     const texte = versets[numero];
//     if (!texte) return;

//     setHighlight(selectedVerse, color);
//     setHighlights((prev) => ({
//       ...prev,
//       [selectedVerse]: color,
//     }));

//     // 📔 Ajoute au journal
//     addJournalEntry(
//       "verse_highlighted",
//       selectedVerse,
//       {
//         detail: `Couleur : ${color}`,
//         reference: selectedVerse,
//       }
//     );

//     const phrases = decouperEnPhrases(texte.replace(/<CM>/g, "").trim());
//     const totalPhrases = phrases.length;

//     setAnimatingVerses((prev) => ({
//       ...prev,
//       [selectedVerse]: 0,
//     }));

//     for (let i = 1; i <= totalPhrases; i++) {
//       setTimeout(() => {
//         setAnimatingVerses((prev) => ({
//           ...prev,
//           [selectedVerse]: i,
//         }));
//       }, i * 300);
//     }

//     setTimeout(() => {
//       setAnimatingVerses((prev) => {
//         const next = { ...prev };
//         delete next[selectedVerse];
//         return next;
//       });
//     }, totalPhrases * 300 + 500);

//     setSelectedVerse(null);
//   };

//   const handleRemoveHighlight = () => {
//     if (!selectedVerse) return;
//     removeHighlight(selectedVerse);
//     setHighlights((prev) => {
//       const next = { ...prev };
//       delete next[selectedVerse];
//       return next;
//     });
//     setSelectedVerse(null);
//   };

//   const handleCopy = () => {
//     if (!selectedVerse || !versets) return;

//     const numero = selectedVerse.split(":")[1];
//     const texte = versets[numero];
//     if (!texte) return;

//     const cleanTexte = texte.replace(/<CM>/g, "").trim();

//     navigator.clipboard
//       .writeText(`${selectedVerse} : ${cleanTexte}`)
//       .then(() => {
//         setSelectedVerse(null);
//       })
//       .catch(() => {
//         setSelectedVerse(null);
//       });
//   };

//   // ============================================================
//   // FAVORIS & NOTES
//   // ============================================================

//   const handleToggleFavorite = () => {
//     if (!selectedVerse) return;
//     toggleFavorite(selectedVerse);
//     setSelectedVerse(null);
//   };

//   const handleOpenNote = () => {
//     if (!selectedVerse) return;
//     const ref = selectedVerse;
//     setSelectedVerse(null);
//     setNoteVerse(ref);
//   };

//   const handleShareImage = () => {
//     if (!selectedVerse || !versets) return;
//     const numero = selectedVerse.split(":")[1];
//     const texte = versets[numero];
//     if (!texte) return;
//     const cleanText = texte.replace(/<CM>/g, "").trim();
//     setCardVerse({
//       reference: selectedVerse,
//       text: cleanText,
//     });
//     setSelectedVerse(null);
//   };

//   // ============================================================
//   // SWIPE MOBILE — changer de chapitre
//   // ============================================================

//   const handleTouchStartSwipe = (e: React.TouchEvent) => {
//     const touch = e.touches[0];
//     touchStartX.current = touch.clientX;
//     touchStartY.current = touch.clientY;
//     touchEndX.current = null;
//     touchEndY.current = null;
//     isSwipingRef.current = false;
//   };

//   const handleTouchMoveSwipe = (e: React.TouchEvent) => {
//     const touch = e.touches[0];
//     touchEndX.current = touch.clientX;
//     touchEndY.current = touch.clientY;

//     if (touchStartX.current !== null && touchStartY.current !== null) {
//       const dx = Math.abs(touch.clientX - touchStartX.current);
//       const dy = Math.abs(touch.clientY - touchStartY.current);

//       if (dx > dy * 1.5 && dx > 20) {
//         isSwipingRef.current = true;
//       } else if (dy > dx) {
//         isSwipingRef.current = false;
//       }
//     }
//   };

//   const handleTouchEndSwipe = () => {
//     if (
//       touchStartX.current === null ||
//       touchEndX.current === null ||
//       !isSwipingRef.current
//     ) {
//       touchStartX.current = null;
//       touchStartY.current = null;
//       touchEndX.current = null;
//       touchEndY.current = null;
//       isSwipingRef.current = false;
//       return;
//     }

//     const dx = touchEndX.current - touchStartX.current;
//     const SWIPE_THRESHOLD = 100;

//     if (Math.abs(dx) > SWIPE_THRESHOLD) {
//       if (dx < 0 && nextHref) {
//         router.push(nextHref);
//       } else if (dx > 0 && prevHref) {
//         router.push(prevHref);
//       }
//     }

//     touchStartX.current = null;
//     touchStartY.current = null;
//     touchEndX.current = null;
//     touchEndY.current = null;
//     isSwipingRef.current = false;
//   };

//   // ============================================================
//   // RENDU
//   // ============================================================

//   return (
//     <SplitView>
//       <div className="flex h-full flex-col">
//         <BibleHeader
//           title={`${bookName} ${chapitre}`}
//           subtitle={
//             isOffline
//               ? `Hors ligne · Chapitre ${chapitre} sur ${totalChapters}`
//               : `Chapitre ${chapitre} sur ${totalChapters}`
//           }
//           backHref={`/bible/${slug}`}
//           showSplitButton
//         />

//         {/* Bouton Comparer — desktop uniquement */}
//         {mounted && (
//           <button
//             type="button"
//             onClick={() => setShowCompare(true)}
//             className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-lg transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-xl md:flex"
//             aria-label="Comparer les traductions"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="h-4 w-4"
//             >
//               <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
//               <path d="M9 3v18" />
//               <path d="m15 9-3 3 3 3" />
//             </svg>
//             Comparer
//           </button>
//         )}

//         <div
//           className="flex-1 overflow-y-auto"
//           style={{ touchAction: "pan-y" }}
//           onTouchStart={handleTouchStartSwipe}
//           onTouchMove={handleTouchMoveSwipe}
//           onTouchEnd={handleTouchEndSwipe}
//         >
//           <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
//             {/* Indicateur hors ligne discret */}
//             {mounted && isOffline && !isLoading && (
//               <div
//                 className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]"
//                 title="Chapitre chargé hors ligne"
//               >
//                 <span className="relative flex h-2 w-2">
//                   <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
//                   <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
//                 </span>
//                 <span>Hors ligne</span>
//               </div>
//             )}

//             {isLoading && <LoadingVersets />}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//                 {error}
//               </div>
//             )}

//             {!isLoading && !error && versets && (
//               <article>
//                 <h2
//                   className="mb-6 border-b border-[var(--border)] pb-3 text-2xl font-bold text-[var(--color-primary)] md:text-3xl"
//                   style={{ fontFamily: "var(--font-serif)" }}
//                 >
//                   {bookName} {chapitre}
//                 </h2>

//                 {/* MODE PARAGRAPHE */}
//                 {displayMode === "paragraph" && (
//                   <div
//                     className="text-[var(--foreground)]"
//                     style={mounted ? getVerseStyles() : undefined}
//                   >
//                     {Object.entries(versets).map(([numero, texte]) => {
//                       const reference = `${bookName} ${chapitre}:${numero}`;
//                       const highlightColor = highlights[reference];
//                       const colorConfig = highlightColor
//                         ? getColorConfig(highlightColor)
//                         : null;

//                       const animatedCount = animatingVerses[reference];
//                       const isAnimating = animatedCount !== undefined;

//                       const texteClean = texte.replace(/<CM>/g, "").trim();
//                       const phrases = decouperEnPhrases(texteClean);

//                       const phrasesASurligner = isAnimating
//                         ? animatedCount
//                         : highlightColor
//                           ? phrases.length
//                           : 0;

//                       const isFocused = focusedVerse === reference;

//                       return (
//                         <span
//                           key={numero}
//                           onClick={(e) => {
//                             if (!longPressTriggered) {
//                               handleVerseClick(e, reference);
//                             }
//                             setLongPressTriggered(false);
//                           }}
//                           onDoubleClick={() => handleVerseDoubleClick(reference)}
//                           onTouchStart={() => handleVerseTouchStart(reference)}
//                           onTouchEnd={handleVerseTouchEnd}
//                           onTouchCancel={handleVerseTouchEnd}
//                           className={`cursor-pointer rounded transition-all duration-300 ${
//                             isFocused
//                               ? "relative z-50 inline-block scale-[1.02] bg-[var(--surface)] px-2 py-1 shadow-lg ring-2"
//                               : "hover:bg-[var(--surface-hover)]"
//                           }`}
//                           style={
//                             isFocused
//                               ? {
//                                   // @ts-ignore
//                                   "--tw-ring-color":
//                                     "color-mix(in srgb, var(--color-accent) 40%, transparent)",
//                                   boxShadow:
//                                     "0 4px 20px color-mix(in srgb, var(--color-accent) 15%, transparent)",
//                                 }
//                               : undefined
//                           }
//                         >
//                           <sup
//                             className="mr-1 select-none font-sans text-[0.65em] font-bold"
//                             style={{
//                               color: "var(--color-accent)",
//                               verticalAlign: "super",
//                               lineHeight: 0,
//                             }}
//                           >
//                             {numero}
//                           </sup>
//                           {phrases.map((phrase, idx) => {
//                             const isHighlighted =
//                               idx < phrasesASurligner && colorConfig;

//                             return (
//                               <span
//                                 key={idx}
//                                 className="transition-all duration-300"
//                                 style={
//                                   isHighlighted
//                                     ? {
//                                         background: colorConfig.bg,
//                                         borderLeft:
//                                           idx === 0
//                                             ? `3px solid ${colorConfig.border}`
//                                             : undefined,
//                                         paddingLeft: idx === 0 ? "4px" : undefined,
//                                       }
//                                     : undefined
//                                 }
//                               >
//                                 {phrase}
//                                 {idx < phrases.length - 1 ? " " : ""}
//                               </span>
//                             );
//                           })}
//                           <span> </span>
//                         </span>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* MODE VERSET PAR VERSET */}
//                 {displayMode === "verse" && (
//                   <div
//                     className="flex flex-col gap-0"
//                     style={{ fontFamily: "var(--font-serif)" }}
//                   >
//                     {Object.entries(versets).map(([numero, texte]) => {
//                       const reference = `${bookName} ${chapitre}:${numero}`;
//                       const highlightColor = highlights[reference];
//                       const colorConfig = highlightColor
//                         ? getColorConfig(highlightColor)
//                         : null;

//                       const animatedCount = animatingVerses[reference];
//                       const isAnimating = animatedCount !== undefined;

//                       const texteClean = texte.replace(/<CM>/g, "").trim();
//                       const phrases = decouperEnPhrases(texteClean);

//                       const phrasesASurligner = isAnimating
//                         ? animatedCount
//                         : highlightColor
//                           ? phrases.length
//                           : 0;

//                       return (
//                         <p
//                           key={numero}
//                           onClick={(e) => {
//                             if (!longPressTriggered) {
//                               handleVerseClick(e, reference);
//                             }
//                             setLongPressTriggered(false);
//                           }}
//                           onDoubleClick={() => handleVerseDoubleClick(reference)}
//                           onTouchStart={() => handleVerseTouchStart(reference)}
//                           onTouchEnd={handleVerseTouchEnd}
//                           onTouchCancel={handleVerseTouchEnd}
//                           className={`group flex cursor-pointer gap-2 rounded-lg px-3 py-1.5 text-[var(--foreground)] transition-transform duration-300 ease-out ${
//                             focusedVerse === reference
//                               ? "relative z-50 scale-[1.03] bg-[var(--surface)] shadow-xl"
//                               : "hover:bg-[var(--surface-hover)]"
//                           }`}
//                           style={mounted ? getVerseStyles() : undefined}
//                         >
//                           <span className="mt-1 h-fit shrink-0 select-none rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted)] md:text-sm">
//                             {numero}
//                           </span>
//                           <span className="flex-1">
//                             {phrases.map((phrase, idx) => {
//                               const isHighlighted =
//                                 idx < phrasesASurligner && colorConfig;

//                               return (
//                                 <span
//                                   key={idx}
//                                   className="transition-all duration-300"
//                                   style={
//                                     isHighlighted
//                                       ? {
//                                           background: colorConfig.bg,
//                                           borderLeft:
//                                             idx === 0
//                                               ? `3px solid ${colorConfig.border}`
//                                               : undefined,
//                                           paddingLeft: idx === 0 ? "4px" : undefined,
//                                         }
//                                       : undefined
//                                   }
//                                 >
//                                   {phrase}
//                                   {idx < phrases.length - 1 ? " " : ""}
//                                 </span>
//                               );
//                             })}
//                           </span>
//                         </p>
//                       );
//                     })}
//                   </div>
//                 )}
//               </article>
//             )}
//           </div>

//           {!isLoading && versets && (
//             <div className="mx-auto max-w-3xl px-4 pb-8 md:px-6">
//               <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
//                 {prevHref ? (
//                   <Link
//                     href={prevHref}
//                     className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
//                   >
//                     ← {bookName} {chapitre - 1}
//                   </Link>
//                 ) : (
//                   <span />
//                 )}

//                 <Link
//                   href={`/bible/${slug}`}
//                   className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
//                 >
//                   Chapitres
//                 </Link>

//                 {nextHref ? (
//                   <Link
//                     href={nextHref}
//                     className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
//                   >
//                     {bookName} {chapitre + 1} →
//                   </Link>
//                 ) : (
//                   <span />
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Menu contextuel (clic simple) */}
//         {selectedVerse && (
//           <VerseActionMenu
//             reference={selectedVerse}
//             currentColor={highlights[selectedVerse] || null}
//             onSelectColor={handleSelectColor}
//             onCopy={handleCopy}
//             onRemove={handleRemoveHighlight}
//             onClose={() => setSelectedVerse(null)}
//             position={menuPosition}
//             onToggleFavorite={handleToggleFavorite}
//             onOpenNote={handleOpenNote}
//             onShareImage={handleShareImage}
//           />
//         )}

//         {/* Modale de note */}
//         {noteVerse && (
//           <NoteModal
//             reference={noteVerse}
//             onClose={() => setNoteVerse(null)}
//           />
//         )}

//         {/* Modale Verse Card */}
//         {cardVerse && (
//           <VerseCardModal
//             reference={cardVerse.reference}
//             text={cardVerse.text}
//             onClose={() => setCardVerse(null)}
//           />
//         )}

//         {/* Menu iOS flou (double-clic / appui long) */}
//         {focusedVerse && (
//           <VerseIOSMenu
//             reference={focusedVerse}
//             onClose={() => setFocusedVerse(null)}
//           />
//         )}

//         {/* Comparateur de traductions (desktop uniquement) */}
//         {showCompare && (
//           <TranslationCompare
//             bookName={bookName as string}
//             chapitre={chapitre}
//             leftTranslation="lsg"
//             defaultRight="martin"
//             onClose={() => setShowCompare(false)}
//           />
//         )}
//       </div>
//     </SplitView>
//   );
// }

// // ============================================================
// // LOADING
// // ============================================================

// function LoadingVersets() {
//   const widths = [85, 92, 78, 88, 95, 82, 90, 75, 87, 80];
//   return (
//     <div className="flex flex-col gap-4">
//       <div className="h-8 w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
//       {widths.map((w, i) => (
//         <div
//           key={i}
//           className="h-4 animate-pulse rounded bg-[var(--surface-hover)]"
//           style={{ width: `${w}%` }}
//         />
//       ))}
//     </div>
//   );
// }

"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { findBookBySlug, CHAPTERS_COUNT } from "@/lib/bible-utils";
import BibleReader from "@/components/BibleReader";
import SplitView from "@/components/SplitView";

interface PageProps {
  params: Promise<{ livre: string; chapitre: string }>;
}

export default function ChapitrePage({ params }: PageProps) {
  const { livre: slug, chapitre: chapitreStr } = use(params);
  const router = useRouter();

  const bookName = findBookBySlug(slug);
  const chapitre = parseInt(chapitreStr, 10);

  if (!bookName || isNaN(chapitre) || chapitre < 1) {
    notFound();
  }

  const totalChapters = CHAPTERS_COUNT[bookName] ?? 0;
  if (chapitre > totalChapters) {
    notFound();
  }

  return (
    <SplitView>
      <BibleReader
        livre={slug}
        chapitre={chapitre}
        onNavigate={(newLivre, newChap) => {
          router.push(`/bible/${newLivre}/${newChap}`);
        }}
        onBackToList={() => {
          router.push(`/bible/${slug}`);
        }}
        showHeader={true}
        showSplitButton={true}
      />
    </SplitView>
  );
}
