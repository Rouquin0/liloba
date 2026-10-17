"use client";

import BackButton from "./BackButton";
import SplitButton from "./SplitButton";

interface BibleHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  /** Callback quand on clique sur "retour" (au lieu d'un lien href) */
  onBack?: () => void;
  showMenuButton?: boolean;
  /** Affiche le bouton "split" à droite (desktop uniquement) */
  showSplitButton?: boolean;
}

export default function BibleHeader({
  title,
  subtitle,
  backHref,
  onBack,
  showMenuButton = false,
  showSplitButton = false,
}: BibleHeaderProps) {
  const handleMenuClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("liloba:open-menu"));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm md:px-6">
      {/* Bouton gauche */}
      <div className="flex shrink-0 items-center">
        {showMenuButton ? (
          <button
            type="button"
            onClick={handleMenuClick}
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
        ) : onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            aria-label="Retour"
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
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
        ) : backHref ? (
          <BackButton href={backHref} />
        ) : (
          <BackButton />
        )}
      </div>

      {/* Titre */}
      <div className="flex min-w-0 flex-1 flex-col items-center text-center">
        <h1 className="truncate text-sm font-bold text-[var(--color-primary)] md:text-base">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[10px] text-[var(--muted)] md:text-xs">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bouton droite : split (desktop) ou espace vide */}
      <div className="flex w-9 shrink-0 items-center justify-end">
        {showSplitButton ? (
          <SplitButton />
        ) : (
          <div className="w-9" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
