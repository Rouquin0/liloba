"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Évite le "flicker" au premier rendu
  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-lg transition-colors hover:bg-[var(--surface-hover)]"
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label="Basculer le thème"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
