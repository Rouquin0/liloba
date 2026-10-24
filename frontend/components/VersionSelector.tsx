"use client";

import { useEffect, useRef, useState } from "react";
import {
  TRANSLATIONS,
  preloadTranslation,
  type TranslationId,
} from "@/lib/translations";
import {
  getDefaultTranslation,
  setDefaultTranslation,
  type DefaultTranslationId,
} from "@/lib/preferences";

// ============================================================
// LILOBA — VersionSelector (pilule, lecture Bible)
// ------------------------------------------------------------
// Design VOLONTAIREMENT différent du bouton hamburger :
//  - hamburger = bouton carré, bordure, 3 lignes horizontales.
//  - ici = pilule arrondie (rounded-full) avec icône "livre ouvert",
//    sigle de la version (ex : "LSG") + chevron qui pivote.
// Le menu s'ouvre vers le bas avec une animation fluide.
// Le choix est instantané et 100% hors ligne (les 10 versions
// sont déjà téléchargées en IndexedDB) : on écrit la préférence
// dans localStorage, ce qui déclenche l'événement
// "liloba:default-translation-updated" écouté par BibleReader.
// ============================================================

interface VersionSelectorProps {
  /** Appelé après un changement (optionnel, la synchro globale passe par l'event). */
  onChange?: (id: TranslationId) => void;
  className?: string;
}

export default function VersionSelector({ onChange, className = "" }: VersionSelectorProps) {
  const [current, setCurrent] = useState<DefaultTranslationId>("lsg");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrent(getDefaultTranslation());
    const sync = () => setCurrent(getDefaultTranslation());
    window.addEventListener("liloba:default-translation-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("liloba:default-translation-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Ferme avec Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) {
    // Placeholder anti-saut de layout avant hydratation
    return (
      <div
        className={`h-9 w-20 animate-pulse rounded-full bg-[var(--surface-hover)] ${className}`}
        aria-hidden="true"
      />
    );
  }

  const active = TRANSLATIONS.find((t) => t.id === current) ?? TRANSLATIONS[0];

  const handleSelect = (id: TranslationId) => {
    setCurrent(id as DefaultTranslationId);
    setDefaultTranslation(id as DefaultTranslationId);
    
    // 🔥 SÉCURITÉ HORS-LIGNE : on ne pré-charge que si on a du réseau
    if (typeof navigator !== "undefined" && navigator.onLine) {
      try {
        preloadTranslation(id);
      } catch (e) {
        // On ignore l'erreur silencieusement pour ne pas crasher le composant
      }
    }
    
    onChange?.(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Calque invisible : un clic ailleurs ferme le menu */}
      {open && (
        <button
          type="button"
          aria-label="Fermer le choix de version"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
        />
      )}

      {/* ---- Pilule ---- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Version de la Bible : ${active.name}. Changer de version.`}
        title="Changer de version de la Bible"
        className={`flex h-9 items-center gap-1.5 rounded-full border px-3 shadow-sm transition-all duration-200 active:scale-95 ${
          open
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
        }`}
      >
        {/* Icône "livre ouvert" — pas les 3 lignes du hamburger */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">
          {active.shortName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* ---- Menu déroulant (vers le bas) ---- */}
      {open && (
        <div
          role="listbox"
          aria-label="Choisir une version de la Bible"
          className="animate-scale-in absolute right-0 top-[calc(100%+8px)] z-50 w-72 max-w-[78vw] origin-top-right overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        >
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Version de la Bible
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              10 versions · déjà sur ton téléphone · sans réseau
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {TRANSLATIONS.map((t) => {
              const isActive = t.id === current;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(t.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150 active:scale-[0.99] ${
                    isActive
                      ? "bg-[var(--color-accent)]/10"
                      : "hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {/* Badge drapeau */}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide ${
                      isActive
                        ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                        : "bg-[var(--surface-hover)] text-[var(--muted)]"
                    }`}
                  >
                    {t.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        isActive
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {t.shortName} · {t.name}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--muted)]">
                      {t.language}
                    </span>
                  </span>
                  {/* Coche */}
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-hover)]/40 px-4 py-2.5">
            <p className="text-[11px] text-[var(--muted)]">
              ✓ Changement instantané, même en mode avion
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
