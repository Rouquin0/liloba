"use client";

import { useEffect, useRef, useState } from "react";
import {
  HIGHLIGHT_COLORS,
  type HighlightColor,
} from "@/lib/highlights";
import { isFavorite, hasNote } from "@/lib/notes";

interface VerseActionMenuProps {
  reference: string;
  currentColor: HighlightColor | null;
  onSelectColor: (color: HighlightColor) => void;
  onCopy: () => void;
  onRemove: () => void;
  onClose: () => void;
  position: { x: number; y: number };
  onToggleFavorite?: () => void;
  onOpenNote?: () => void;
  onShareImage?: () => void;
  /** Mode embedded (dans un panneau) : position absolute au lieu de fixed */
  embedded?: boolean;
}

export default function VerseActionMenu({
  reference,
  currentColor,
  onSelectColor,
  onCopy,
  onRemove,
  onClose,
  position,
  onToggleFavorite,
  onOpenNote,
  onShareImage,
  embedded = false,
}: VerseActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFav, setIsFav] = useState(false);
  const [hasNoteAlready, setHasNoteAlready] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Lit l'état favori/note après montage (évite hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setIsFav(isFavorite(reference));
    setHasNoteAlready(hasNote(reference));
  }, [reference]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

    // En mode embedded, on utilise absolute pour rester dans le panneau.
  // Sinon, fixed pour couvrir tout l'écran.
  const menuStyle: React.CSSProperties = embedded
    ? {
        position: "absolute",
        top: Math.min(position.y, 320),
        left: Math.min(Math.max(position.x - 120, 10), 240),
        zIndex: 50,
      }
    : {
        position: "fixed",
        top: Math.min(position.y, window.innerHeight - 320),
        left: Math.min(Math.max(position.x - 120, 10), window.innerWidth - 240),
        zIndex: 50,
      };

  const handleFavClick = () => {
    onToggleFavorite?.();
    setIsFav(isFavorite(reference));
  };

  const handleNoteClick = () => {
    onOpenNote?.();
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="animate-fade-in w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{
            background:
              "color-mix(in srgb, var(--color-accent) 15%, transparent)",
          }}
        >
          <IconBook />
        </div>
        <span className="truncate text-xs font-semibold text-[var(--foreground)]">
          {reference}
        </span>
      </div>

      {/* Couleurs */}
      <div className="p-3">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Surligner
        </div>
        <div className="flex justify-between gap-1.5">
          {HIGHLIGHT_COLORS.map((color) => {
            const isActive = currentColor === color.value;
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => onSelectColor(color.value)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? "scale-110 ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--surface)]"
                    : "hover:scale-110"
                }`}
                style={{
                  background: color.bg,
                  border: `2px solid ${color.border}`,
                }}
                aria-label={color.label}
              >
                {isActive && (
                  <span className="text-[var(--foreground)]">
                    <IconCheck />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Favori + Note */}
      <div className="border-t border-[var(--border)] p-1.5">
        <button
          type="button"
          onClick={handleFavClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={mounted && isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
            style={{
              color:
                mounted && isFav
                  ? "var(--color-accent)"
                  : "var(--muted)",
            }}
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
          <span>
            {mounted && isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleNoteClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
            style={{
              color:
                mounted && hasNoteAlready
                  ? "var(--color-accent)"
                  : "var(--muted)",
            }}
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          <span>
            {mounted && hasNoteAlready ? "Modifier la note" : "Ajouter une note"}
          </span>
        </button>
      </div>

            {/* Partager en image */}
      {onShareImage && (
        <div className="border-t border-[var(--border)] p-1.5">
          <button
            type="button"
            onClick={onShareImage}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-[var(--muted)]"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>Partager en image</span>
          </button>
        </div>
      )}

      {/* Copier + Retirer */}
      <div className="border-t border-[var(--border)] p-1.5">
        <button
          type="button"
          onClick={onCopy}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          <IconCopy />
          <span>Copier</span>
        </button>

        {currentColor && (
          <button
            type="button"
            onClick={onRemove}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
          >
            <IconTrash />
            <span>Retirer le surlignage</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ICÔNES SVG
// ============================================================

function IconBook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-[var(--color-accent)]">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[var(--muted)]">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
