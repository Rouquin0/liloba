"use client";

import { useId, useState, type ReactNode } from "react";

// ============================================================
// LILOBA — Rubrique dépliable du menu
// ------------------------------------------------------------
// Une ligne du menu (icône + titre + chevron) qui déplie / replie son
// contenu au clic. Replié par défaut : le contenu n'est ni visible ni
// atteignable au clavier (inert).
//
// « Se referme tout seul quand on quitte » : le parent change la `key`
// du composant (ex. à chaque changement de page ou fermeture du menu),
// ce qui remet l'accordéon à zéro, donc replié.
// ============================================================

export default function MenuAccordion({
  label,
  icon,
  className = "",
  children,
}: {
  label: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex min-h-[40px] w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left transition-all hover:bg-[var(--surface-hover)]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Le contenu glisse en hauteur : grid 0fr → 1fr */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        inert={!open}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
