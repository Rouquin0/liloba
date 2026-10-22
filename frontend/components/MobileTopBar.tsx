"use client";

import BackButton from "./BackButton";

/**
 * Barre d'en-tête MOBILE uniquement (masquée dès md:) : flèche retour + bouton menu.
 * Pour les pages qui affichent le menu hamburger (AppShell) mais n'ont pas
 * d'en-tête avec bouton pour l'ouvrir, comme /selah.
 */
export default function MobileTopBar() {
  const openMenu = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("liloba:open-menu"));
    }
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-2 backdrop-blur-sm md:hidden">
      <BackButton />
      <button
        type="button"
        onClick={openMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        aria-label="Ouvrir le menu"
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
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
