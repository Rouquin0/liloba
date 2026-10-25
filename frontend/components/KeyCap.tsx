"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

// ============================================================
// LILOBA — KeyCap · touches « façon clavier iPhone »
// ------------------------------------------------------------
// Sur MOBILE : grosses touches (44 px, la taille minimale
// recommandée par Apple), arrondies, avec le petit liseré d'ombre
// d'une touche de clavier. Au toucher, la touche GROSSIT légèrement
// et se soulève (comme le « pop » du clavier iOS) : on voit bien
// laquelle on est en train d'appuyer, avant de relâcher.
// Sur DESKTOP : l'apparence d'origine (petit bouton rond discret).
//
// L'état « appuyé » est géré en JavaScript (évènements pointeur) et
// non avec :active, que Safari iOS n'applique pas de façon fiable.
// ============================================================

function usePressed() {
  const [pressed, setPressed] = useState(false);
  const bind = {
    onPointerDown: () => {
      setPressed(true);
      try {
        // Léger retour haptique là où c'est possible (Android)
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(6);
      } catch {
        // ignore
      }
    },
    onPointerUp: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
  };
  return { pressed, bind };
}

const BASE =
  "relative flex shrink-0 touch-manipulation select-none items-center justify-center " +
  "text-[var(--foreground)] transition-[transform,box-shadow,background-color] duration-100 ease-out " +
  "[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] " +
  // mobile : touche de clavier
  "h-11 w-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] " +
  "shadow-[0_1px_0_rgba(0,0,0,0.28)] " +
  // desktop : bouton discret d'origine
  "md:h-7 md:w-7 md:rounded-full md:border-0 md:bg-transparent md:text-[var(--muted)] md:shadow-none " +
  "md:hover:bg-[var(--surface-hover)] md:hover:text-[var(--color-accent)]";

const PRESSED =
  "z-10 bg-[var(--surface-hover)] max-md:scale-[1.14] " +
  "max-md:shadow-[0_8px_18px_rgba(0,0,0,0.28)] max-md:text-[var(--color-accent)]";

export function KeyCapButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const { pressed, bind } = usePressed();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${BASE} ${pressed ? PRESSED : ""}`}
      {...bind}
    >
      {children}
    </button>
  );
}

export function KeyCapLink({
  label,
  href,
  onClick,
  children,
}: {
  label: string;
  href: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { pressed, bind } = usePressed();
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className={`${BASE} ${pressed ? PRESSED : ""}`}
      {...bind}
    >
      {children}
    </Link>
  );
}
