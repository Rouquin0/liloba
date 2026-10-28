"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

// ============================================================
// LILOBA — Fenêtre modale (feuille en bas sur mobile, centrée sur desktop)
// Portail dans <body> : jamais coupée par un parent en overflow-hidden.
// Échap ou clic sur le fond = fermer.
// ============================================================

export default function ModalShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm md:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="relative max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--foreground)] shadow-2xl md:p-5">
        {children}
      </div>
    </div>,
    document.body
  );
}
