"use client";

// ============================================================
// LILOBA — Accueil mobile : barre de raccourcis (fixe en bas)
// Selah · Mon carnet · Historique. Mobile uniquement (masquée dès md).
// ============================================================

import Link from "next/link";

const SHORTCUTS = [
  { href: "/selah", label: "Selah", icon: "🌿" },
  { href: "/carnet", label: "Mon carnet", icon: "📓" },
  { href: "/historique", label: "Historique", icon: "🕘" },
];

export default function HomeShortcutsNav() {
  return (
    <nav
      aria-label="Raccourcis"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[var(--muted)] transition-all hover:text-[var(--foreground)] active:scale-95 active:bg-[var(--surface-hover)]"
          >
            <span className="text-[22px] leading-none" aria-hidden="true">
              {item.icon}
            </span>
            <span className="truncate text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
