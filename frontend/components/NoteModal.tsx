"use client";

import { useEffect, useState, useRef } from "react";
import { getNote, saveNote, deleteNote } from "@/lib/notes";
import { addJournalEntry } from "@/lib/journal";

interface NoteModalProps {
  reference: string;
  onClose: () => void;
}

export default function NoteModal({ reference, onClose }: NoteModalProps) {
  const [texte, setTexte] = useState("");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const existing = getNote(reference);
    if (existing) {
      setTexte(existing.texte);
      setHasExisting(true);
    }
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [reference]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

    const handleSave = () => {
    if (!texte.trim()) return;
    saveNote(reference, texte);

    // 📔 Ajoute au journal
    addJournalEntry("note_added", reference, {
      detail: texte.slice(0, 80),
      reference,
    });

    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    if (!confirm("Supprimer cette note ?")) return;
    deleteNote(reference);
    onClose();
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent) 15%, transparent)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }}>
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-xs font-semibold text-[var(--color-accent)]">
              {reference}
            </div>
            <div className="text-[10px] text-[var(--muted)]">
              {hasExisting ? "Modifier la note" : "Nouvelle note"}
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Écris ton commentaire, ta réflexion, ta prière…"
            rows={6}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
          />
          <div className="mt-1 flex justify-end text-[10px] text-[var(--muted)]">
            {texte.length} caractères
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[var(--border)] p-3">
          {hasExisting && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition-colors hover:bg-red-500/10"
              aria-label="Supprimer la note"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!texte.trim() || saved}
            className="flex-1 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-all hover:brightness-90 disabled:opacity-50"
          >
            {saved ? "✓ Enregistré" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
