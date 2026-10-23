"use client";

import BibleScreensaver from "./BibleScreensaver";
import { useDailyVerseNotification } from "@/hooks/useDailyVerseNotification";
import { useReadingReminder } from "@/hooks/useReadingReminder";
import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import { useCustomColors } from "@/hooks/useCustomColors";
import { useSplitShortcuts } from "@/hooks/useSplitShortcuts";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}

function AppShellFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-[var(--background)]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)]" style={{ borderTopColor: "var(--color-accent)" }} />
    </div>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useCustomColors();
  useSplitShortcuts();
  useDailyVerseNotification();
  useReadingReminder();

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener("liloba:open-menu", handleOpenMenu);
    return () => window.removeEventListener("liloba:open-menu", handleOpenMenu);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showMenu =
    pathname.startsWith("/chat") || 
    pathname.startsWith("/bible") || 
    pathname.startsWith("/read") ||
    pathname.startsWith("/selah");

  const allowScroll = pathname === "/" || pathname.startsWith("/selah") || pathname.startsWith("/histoires");

  const handleClose = useCallback(() => setIsMenuOpen(false), []);

  if (!showMenu) {
    return (
      // h-dvh + overflow-hidden : le conteneur extérieur ne bouge JAMAIS.
      <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
        {/* C'est le main qui gère le scroll. overscroll-y-none empêche le rebond. */}
        <main className={`flex-1 ${allowScroll ? "overflow-y-auto overscroll-y-none" : "overflow-hidden"}`}>
          {children}
        </main>
        <BibleScreensaver />
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
      <HamburgerMenu isOpen={isMenuOpen} onClose={handleClose} />
      <div className="relative flex flex-1 flex-col overflow-hidden md:pl-2">
        <main className={`flex-1 ${allowScroll ? "overflow-y-auto overscroll-y-none" : "overflow-hidden"}`}>
          {children}
        </main>
      </div>
      <BibleScreensaver />
    </div>
  );
}
