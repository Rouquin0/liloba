"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  changePin,
  formatNoteDate,
  getAutoLockSeconds,
  setAutoLockSeconds,
  AUTOLOCK_OPTIONS,
  type PrivateNote,
} from "@/lib/private-notes";
import PinKeypad from "./PinKeypad";

interface PrivateNotesListProps {
  pin: string;
  onLock: () => void;
}

type View = "list" | "edit" | "settings";
type CodePhase = "idle" | "new" | "confirm" | "done";

export default function PrivateNotesList({
  pin,
  onLock,
}: PrivateNotesListProps) {
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<PrivateNote | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Réglages
  const [autoLock, setAutoLock] = useState(30);
  const [codePhase, setCodePhase] = useState<CodePhase>("idle");
  const [newPin, setNewPin] = useState("");
  const [codeConfirm, setCodeConfirm] = useState("");
  const [codeShake, setCodeShake] = useState(false);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const load = () => {
    const list = getNotes(pin);
    setNotes(list || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    setAutoLock(getAutoLockSeconds());
  }, []);

  // ============================================================
  // VERROUILLAGE AUTOMATIQUE (inactivité)
  // ============================================================

  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onLockRef.current(), autoLock * 1000);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll", "pointerdown"];
    events.forEach((e) => document.addEventListener(e, resetTimer, true));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, resetTimer, true));
    };
  }, [autoLock]);

  // ============================================================
  // ACTIONS SUR LES NOTES
  // ============================================================

  const handleCreate = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setView("edit");
  };

  const handleEdit = (note: PrivateNote) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
    setView("edit");
  };

  const isDirty = editing
    ? title !== editing.title || content !== editing.content
    : title.trim() !== "" || content.trim() !== "";

  const closeEditor = () => {
    if (isDirty && !confirm("Abandonner les modifications ?")) return;
    setView("list");
    setEditing(null);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editing) {
      updateNote(editing.id, { title: title.trim() || "Sans titre", content }, pin);
    } else {
      addNote({ title: title.trim() || "Sans titre", content }, pin);
    }

    setView("list");
    setEditing(null);
    setTitle("");
    setContent("");
    load();
  };

  const handleDelete = (id: string) => {
    deleteNote(id, pin);
    setConfirmDelete(null);
    load();
  };

  const handleTogglePin = (id: string) => {
    togglePinNote(id, pin);
    load();
  };

  // ============================================================
  // RÉGLAGES
  // ============================================================

  const handleAutoLock = (seconds: number) => {
    setAutoLock(seconds);
    setAutoLockSeconds(seconds);
  };

  const resetCodeFlow = () => {
    setCodePhase("idle");
    setNewPin("");
    setCodeConfirm("");
    setCodeShake(false);
    setCodeMsg(null);
  };

  const closeSettings = () => {
    resetCodeFlow();
    setView("list");
  };

  const handleCodeChange = (next: string) => {
    if (codeShake) return;
    setCodeMsg(null);

    if (codePhase === "new") {
      setNewPin(next);
      if (next.length === 4) setTimeout(() => setCodePhase("confirm"), 200);
      return;
    }

    if (codePhase === "confirm") {
      setCodeConfirm(next);
      if (next.length !== 4) return;

      if (next !== newPin) {
        setCodeShake(true);
        setCodeMsg("Les 2 codes ne correspondent pas");
        setTimeout(() => {
          setNewPin("");
          setCodeConfirm("");
          setCodePhase("new");
          setCodeShake(false);
        }, 700);
        return;
      }

      const ok = changePin(pin, next);
      if (ok) {
        setCodePhase("done");
      } else {
        setCodeShake(true);
        setCodeMsg("Impossible de changer le code");
        setTimeout(() => {
          resetCodeFlow();
        }, 900);
      }
    }
  };

  // ============================================================
  // LISTE FILTRÉE (recherche)
  // ============================================================

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? notes.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.content.toLowerCase().includes(q)
          )
        : notes,
    [notes, q]
  );

  // ============================================================
  // VUE : ÉDITION / CRÉATION
  // ============================================================
  if (view === "edit") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {editing ? "Modifier la note" : "Nouvelle note"}
          </h3>
          <button
            type="button"
            onClick={closeEditor}
            className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Annuler
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
        />

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écris ta note personnelle…"
            rows={10}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
          />
          <div className="mt-1 flex justify-end font-mono text-[10px] text-[var(--muted)]">
            {content.trim() ? content.trim().split(/\s+/).length : 0} mot
            {content.trim().split(/\s+/).length > 1 ? "s" : ""} ·{" "}
            {content.length} caractères
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeEditor}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-all hover:brightness-90 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : RÉGLAGES
  // ============================================================
  if (view === "settings") {
    // Changement de code en cours (clavier rond)
    if (codePhase !== "idle") {
      return (
        <div className="flex flex-col items-center">
          {codePhase === "done" ? (
            <div className="flex w-full flex-col gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-1 text-sm font-semibold text-[var(--color-accent)]">
                  Code modifié ✓
                </p>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Tes notes ont été rechiffrées avec ton nouveau code. Entre-le
                  pour rouvrir tes notes.
                </p>
              </div>
              <button
                type="button"
                onClick={onLock}
                className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-all hover:brightness-90"
              >
                Continuer
              </button>
            </div>
          ) : (
            <>
              <p className="mb-1 text-base font-semibold text-[var(--foreground)]">
                {codePhase === "new"
                  ? "Nouveau code"
                  : "Confirme le nouveau code"}
              </p>
              <p className="mb-6 text-xs text-[var(--muted)]">
                {codePhase === "new"
                  ? "Choisis un code à 4 chiffres"
                  : "Entre-le une seconde fois"}
              </p>

              <PinKeypad
                value={codePhase === "new" ? newPin : codeConfirm}
                onChange={handleCodeChange}
                error={codeShake}
                disabled={codeShake}
                message={codeMsg}
              />

              <button
                type="button"
                onClick={resetCodeFlow}
                className="mt-6 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Réglages
          </h3>
          <button
            type="button"
            onClick={closeSettings}
            className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Terminé
          </button>
        </div>

        {/* Verrouillage automatique */}
        <div className="border-b border-[var(--border)] pb-4">
          <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
            Verrouillage automatique
          </p>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Après un temps d&apos;inactivité. Les notes se verrouillent aussi
            dès que tu quittes l&apos;onglet Privé ou l&apos;application.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {AUTOLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAutoLock(opt.value)}
                className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                  autoLock === opt.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Changer le code */}
        <div className="py-4">
          <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
            Code d&apos;accès
          </p>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Tes notes seront rechiffrées avec le nouveau code.
          </p>
          <button
            type="button"
            onClick={() => setCodePhase("new")}
            className="w-full rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Changer mon code
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : LISTE
  // ============================================================
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView("settings")}
            className="flex items-center gap-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--color-accent)]"
            aria-label="Réglages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <line x1="21" x2="14" y1="4" y2="4" />
              <line x1="10" x2="3" y1="4" y2="4" />
              <line x1="21" x2="12" y1="12" y2="12" />
              <line x1="8" x2="3" y1="12" y2="12" />
              <line x1="21" x2="16" y1="20" y2="20" />
              <line x1="12" x2="3" y1="20" y2="20" />
              <line x1="14" x2="14" y1="2" y2="6" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="16" x2="16" y1="18" y2="22" />
            </svg>
            Réglages
          </button>
          <button
            type="button"
            onClick={onLock}
            className="flex items-center gap-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Verrouiller
          </button>
        </div>
      </div>

      {/* Recherche */}
      {notes.length > 0 && (
        <div className="relative mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans mes notes…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-9 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Liste */}
      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-12 text-center">
          <p className="mb-1 text-sm text-[var(--foreground)]">
            Aucune note personnelle
          </p>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Écris tes pensées, prières, réflexions…
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-90"
          >
            Créer ma 1ʳᵉ note
          </button>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-[var(--muted)]">
              Aucune note ne correspond à « {query.trim()} ».
            </p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((note) => (
                <div
                  key={note.id}
                  className="group border-b border-[var(--border)] py-4"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      {note.pinned && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]">
                          <path d="M12 17v5" />
                          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                        </svg>
                      )}
                      <h4 className="truncate text-sm font-medium text-[var(--foreground)]">
                        {note.title}
                      </h4>
                    </button>

                    <div className="flex gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(note.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--color-accent)] ${
                          note.pinned
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--muted)]"
                        }`}
                        aria-label={note.pinned ? "Désépingler" : "Épingler"}
                        title={note.pinned ? "Désépingler" : "Épingler en haut"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M12 17v5" />
                          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(note)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--color-accent)]"
                        aria-label="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M12 20h9" />
                          <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(note.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                        aria-label="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="block w-full text-left"
                  >
                    <p className="mb-2 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-[var(--muted)]">
                      {note.content}
                    </p>
                    <div className="font-mono text-[10px] text-[var(--muted)]">
                      {formatNoteDate(note.updatedAt)}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreate}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-all hover:brightness-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle note
          </button>
        </>
      )}

      {/* Modale de confirmation suppression */}
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
              <h3 className="mb-2 text-base font-semibold text-[var(--foreground)]">
                Supprimer cette note ?
              </h3>
              <p className="mb-4 text-xs text-[var(--muted)]">
                Cette action est irréversible.
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
                  onClick={() => handleDelete(confirmDelete)}
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
