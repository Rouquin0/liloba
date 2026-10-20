"use client";

import { useDailyVerseNotification } from "@/hooks/useDailyVerseNotification";
import { useReadingReminder } from "@/hooks/useReadingReminder";
import MenuButton from "./MenuButton";
import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import { useCustomColors } from "@/hooks/useCustomColors";
import { useSplitShortcuts } from "@/hooks/useSplitShortcuts";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
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

function AppShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // 👇 NOUVEAU : on n'affiche le bouton hamburger que sur /chat et /bible
  const showHamburgerButton = 
    pathname.startsWith("/chat") || 
    pathname === "/bible";

  const handleClose = useCallback(() => setIsMenuOpen(false), []);
  const handleOpen = useCallback(() => setIsMenuOpen(true), []);

  if (!showMenu) {
    return (
      <div className={`flex h-dvh ${allowScroll ? "overflow-y-auto" : "overflow-hidden"} bg-[var(--background)]`}>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
      <HamburgerMenu isOpen={isMenuOpen} onClose={handleClose} />
      <div className="relative flex flex-1 flex-col overflow-hidden md:pl-2">
        {!isMenuOpen && showHamburgerButton && (
          <div className="md:hidden">
            <MenuButton onClick={handleOpen} className="fixed top-3 left-3 z-30" />
          </div>
        )}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
