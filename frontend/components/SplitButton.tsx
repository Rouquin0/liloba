"use client";

import { useEffect, useState } from "react";
import { enableSplit, getSplitState } from "@/lib/split-view";

export default function SplitButton() {
  const [enabled, setEnabled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setEnabled(getSplitState().enabled);
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);

    const onUpdate = () => setEnabled(getSplitState().enabled);
    window.addEventListener("liloba:split-updated", onUpdate);

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("liloba:split-updated", onUpdate);
    };
  }, []);

  if (enabled || !isDesktop) return null;

  return (
    <button
      type="button"
      onClick={() => enableSplit()}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
      title="Diviser l'écran en deux (⌘B / Ctrl+B)"
      aria-label="Diviser l'écran en deux"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M12 3v18" />
      </svg>
    </button>
  );
}
