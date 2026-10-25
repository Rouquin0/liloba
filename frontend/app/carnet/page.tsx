"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getNotesList,
  getFavoritesList,
  deleteNote,
  removeFavorite,
  extractBookFromReference,
  referenceToUrl,
  formatNoteDate,
  getBooksWithContent,
  type Note,
  type Favorite,
} from "@/lib/notes";
import {
  isPrivateNotesSetup,
  setupPrivateNotes,
  saveSession,
  clearSession,
} from "@/lib/private-notes";
import PrivateNotesSetup from "@/components/PrivateNotesSetup";
import PrivateNotesUnlock from "@/components/PrivateNotesUnlock";
import PrivateNotesList from "@/components/PrivateNotesList";
import PrayerTab from "@/components/PrayerTab";
import GamesTab from "@/components/games/GamesTab";

type Tab = "favorites" | "notes" | "prayer" | "private" | "games";
const TAB_LABELS: Record<Tab, string> = {
  favorites: "Favoris",
  notes: "Notes",
  prayer: "Prière",
  private: "Privé",
  games: "Jeux",
};
type FilterMode = "all" | "book";

export default function CarnetPage() {
  const [tab, setTab] = useState<Tab>("favorites");
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filterBook, setFilterBook] = useState<string | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "note" | "fav";
    reference: string;
  } | null>(null);

  // 🔒 État des notes privées
  const [privateSetup, setPrivateSetup] = useState(false);
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [privatePin, setPrivatePin] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
    checkPrivate();
  }, []);

  const loadData = () => {
    setNotes(getNotesList());
    setFavorites(getFavoritesList());
  };

  const checkPrivate = () => {
    setPrivateSetup(isPrivateNotesSetup());
    // 🔒 Toujours verrouillé à l'ouverture de la page
    clearSession();
  };

  const handleDeleteNote = (reference: string) => {
    deleteNote(reference);
    loadData();
    setConfirmDelete(null);
  };

  const handleDeleteFav = (reference: string) => {
    removeFavorite(reference);
    loadData();
    setConfirmDelete(null);
  };

  const handlePrivateSetupComplete = (
    pin: string,
    question: string,
    answer: string
  ) => {
    setupPrivateNotes(pin, question, answer);
    setPrivateSetup(true);
    setPrivatePin(pin);
    setPrivateUnlocked(true);
    saveSession(pin);
  };

  const handlePrivateUnlock = (pin: string) => {
    setPrivatePin(pin);
    setPrivateUnlocked(true);
    saveSession(pin);
  };

  const handlePrivateLock = () => {
    setPrivatePin(null);
    setPrivateUnlocked(false);
    clearSession();
  };

  // 🔒 Verrouille dès qu'on quitte l'onglet Privé
  useEffect(() => {
    if (tab !== "private") handlePrivateLock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // 🔒 Verrouille quand l'app passe en arrière-plan ou qu'on quitte la page
  useEffect(() => {
    const lock = () => handlePrivateLock();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") lock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", lock);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", lock);
      clearSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--background)]">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)]"
          style={{ borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

  const books = getBooksWithContent();
  const filteredFavorites = filterBook === "all"
    ? favorites
    : favorites.filter((f) => extractBookFromReference(f.reference) === filterBook);
  const filteredNotes = filterBook === "all"
    ? notes
    : notes.filter((n) => extractBookFromReference(n.reference) === filterBook);

  return (
    <div className="flex h-dvh flex-col bg-[var(--background)]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-4 md:px-6">
          
          {/* BOUTON HAMBURGER */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("liloba:open-menu"))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            aria-label="Ouvrir le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <div className="flex flex-1 items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: "var(--color-accent)" }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-[var(--foreground)]">
              <span className="md:hidden">{TAB_LABELS[tab]}</span>
              <span className="hidden md:inline">Mon Carnet</span>
            </h1>
          </div>

          {books.length > 0 && tab !== "private" && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-all ${
                filterBook !== "all"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>{filterBook === "all" ? "Filtres" : filterBook}</span>
            </button>
          )}
        </div>

        {/* Onglets */}
        <div className="flex border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setTab("prayer")}
            className={`flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
              tab === "prayer"
                ? "border-b-2 text-[var(--color-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{
              borderBottomColor:
                tab === "prayer" ? "var(--color-accent)" : "transparent",
            }}
            title="Prière"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-4 md:w-4">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="hidden md:inline">Prière</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`relative flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
              tab === "favorites"
                ? "border-b-2 text-[var(--color-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{
              borderBottomColor:
                tab === "favorites" ? "var(--color-accent)" : "transparent",
            }}
            title="Favoris"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={tab === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-4 md:w-4">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            <span className="hidden md:inline">Favoris ({favorites.length})</span>
            {favorites.length > 0 && (
              <span
                className="absolute right-2 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold md:hidden"
                style={{ background: "var(--color-accent)", color: "white" }}
              >
                {favorites.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("notes")}
            className={`relative flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
              tab === "notes"
                ? "border-b-2 text-[var(--color-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{
              borderBottomColor:
                tab === "notes" ? "var(--color-accent)" : "transparent",
            }}
            title="Notes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-4 md:w-4">
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
            <span className="hidden md:inline">Notes ({notes.length})</span>
            {notes.length > 0 && (
              <span
                className="absolute right-2 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold md:hidden"
                style={{ background: "var(--color-accent)", color: "white" }}
              >
                {notes.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("games")}
            className={`flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
              tab === "games"
                ? "border-b-2 text-[var(--color-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{
              borderBottomColor:
                tab === "games" ? "var(--color-accent)" : "transparent",
            }}
            title="Jeux"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-4 md:w-4">
              <line x1="6" x2="10" y1="12" y2="12" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="15" x2="15.01" y1="13" y2="13" />
              <line x1="18" x2="18.01" y1="11" y2="11" />
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
            </svg>
            <span className="hidden md:inline">Jeux</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("private")}
            className={`flex flex-1 items-center justify-center gap-0 py-3.5 text-xs font-medium transition-colors md:gap-2 md:py-3 ${
              tab === "private"
                ? "border-b-2 text-[var(--color-accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{
              borderBottomColor:
                tab === "private" ? "var(--color-accent)" : "transparent",
            }}
            title="Privé"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={privateUnlocked && tab === "private" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-4 md:w-4">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="hidden md:inline">Privé</span>
          </button>
        </div>

        {/* Filtres */}
        {showFilters && books.length > 0 && tab !== "private" && (
          <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-4 py-2 md:px-6">
            <button
              type="button"
              onClick={() => setFilterBook("all")}
              className={`rounded-full border px-3 py-1 text-[10px] font-medium transition-all ${
                filterBook === "all"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Tous
            </button>
            {books.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setFilterBook(b)}
                className={`rounded-full border px-3 py-1 text-[10px] font-medium transition-all ${
                  filterBook === b
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">

          {/* Onglet FAVORIS */}
          {tab === "favorites" && (
            <>
              {filteredFavorites.length === 0 ? (
                <EmptyState
                  icon="star"
                  title={filterBook === "all" ? "Aucun favori" : `Aucun favori dans ${filterBook}`}
                  subtitle="Ajoute des favoris en cliquant sur un verset → ⭐ Ajouter aux favoris"
                />
              ) : (
                <div className="flex flex-col">
                  {filteredFavorites.map((fav) => {
                    const url = referenceToUrl(fav.reference);
                    return (
                      <div
                        key={fav.reference}
                        className="group flex items-center gap-3 border-b border-[var(--border)] py-3 transition-all hover:pl-1"
                      >
                        <Link
                          href={url || "#"}
                          className="flex flex-1 items-center gap-3 min-w-0"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" style={{ color: "var(--color-accent)" }}>
                              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                            </svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium text-[var(--foreground)]">
                              {fav.reference}
                            </div>
                            <div className="truncate font-mono text-[10px] text-[var(--muted)]">
                              Ajouté {formatNoteDate(fav.addedAt)}
                            </div>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({ type: "fav", reference: fav.reference })
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                          aria-label="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 md:h-4 md:w-4">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Onglet NOTES */}
          {tab === "notes" && (
            <>
              {filteredNotes.length === 0 ? (
                <EmptyState
                  icon="note"
                  title={filterBook === "all" ? "Aucune note" : `Aucune note dans ${filterBook}`}
                  subtitle="Ajoute une note en cliquant sur un verset → 📝 Ajouter une note"
                />
              ) : (
                <div className="flex flex-col">
                  {filteredNotes.map((note) => {
                    const url = referenceToUrl(note.reference);
                    return (
                      <div
                        key={note.reference}
                        className="group border-b border-[var(--border)] py-4 transition-all hover:pl-1"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Link
                            href={url || "#"}
                            className="flex items-center gap-2 min-w-0"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }}>
                                <path d="M12 20h9" />
                                <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                              </svg>
                            </span>
                            <span className="truncate text-sm font-medium text-[var(--color-accent)]">
                              {note.reference}
                            </span>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({ type: "note", reference: note.reference })
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                            aria-label="Supprimer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>

                        <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                          {note.texte}
                        </p>

                        <div className="font-mono text-[10px] text-[var(--muted)]">
                          Modifiée {formatNoteDate(note.updatedAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {/* Onglet PRIÈRE 🙏 */}
          {tab === "prayer" && <PrayerTab />}
          {/* Onglet JEUX 🎮 */}
          {tab === "games" && <GamesTab />}



          {/* Onglet PRIVÉ 🔒 */}
          {tab === "private" && (
            <>
              {/* 1. Pas encore configuré */}
              {!privateSetup && (
                <PrivateNotesSetup
                  onComplete={handlePrivateSetupComplete}
                  onCancel={() => setTab("favorites")}
                />
              )}

              {/* 2. Configuré mais verrouillé */}
              {privateSetup && !privateUnlocked && (
                <PrivateNotesUnlock
                  onUnlock={handlePrivateUnlock}
                  onCancel={() => setTab("favorites")}
                  onReset={() => setPrivateSetup(false)}
                />
              )}

              {/* 3. Déverrouillé */}
              {privateSetup && privateUnlocked && privatePin && (
                <PrivateNotesList
                  pin={privatePin}
                  onLock={handlePrivateLock}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALE CONFIRMATION */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">
                {confirmDelete.type === "note" ? "Supprimer cette note ?" : "Retirer des favoris ?"}
              </h3>
              <p className="mb-4 text-xs text-[var(--muted)]">
                {confirmDelete.reference}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() =>
                    confirmDelete.type === "note"
                      ? handleDeleteNote(confirmDelete.reference)
                      : handleDeleteFav(confirmDelete.reference)
                  }
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ÉTAT VIDE
// ============================================================

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: "star" | "note";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-hover)]">
        {icon === "star" ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-[var(--muted)]">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-[var(--muted)]">
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
        )}
      </div>
      <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
        {title}
      </p>
      <p className="max-w-xs text-xs text-[var(--muted)]">
        {subtitle}
      </p>
    </div>
  );
}
