"use client";

import { useEffect } from "react";

interface VerseIOSMenuProps {
  reference: string;
  onClose: () => void;
  /** Mode embedded (dans un panneau) : le flou reste dans le parent */
  embedded?: boolean;
}

export default function VerseIOSMenu({
  reference,
  onClose,
  embedded = false,
}: VerseIOSMenuProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // En mode embedded, on reste dans le parent (absolute).
  // Sinon, on couvre tout l'écran (fixed).
  const overlayPosition = embedded ? "absolute" : "fixed";
  const bubblePosition = embedded ? "absolute" : "fixed";

  return (
    <>
      {/* ==================== OVERLAY FLOU ==================== */}
      <div
        className={`${overlayPosition} inset-0 z-40 bg-black/50`}
        style={{
          animation: "fadeInOverlay 250ms ease-out",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ==================== BULLE DE RÉFÉRENCE ==================== */}
      <div
        className={`pointer-events-none ${bubblePosition} bottom-8 left-1/2 z-50`}
        style={{
          animation:
            "slideUp 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          transform: "translate(-50%, 0)",
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2.5 shadow-2xl">
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent) 40%, transparent)",
            }}
          >
            <IconBook />
          </div>
          <span className="text-sm font-medium text-white">{reference}</span>
        </div>
      </div>
    </>
  );
}

// ============================================================
// ICÔNE
// ============================================================

function IconBook() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 text-white"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
