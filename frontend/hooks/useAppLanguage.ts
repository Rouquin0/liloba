"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type AppLanguage,
  getAppLanguage,
  translate,
} from "@/lib/i18n";

// ============================================================
// useAppLanguage — Fournit la langue active + la fonction t()
// ============================================================
// Écoute automatiquement les changements de langue (event global).
// ============================================================

export function useAppLanguage() {
  const [lang, setLang] = useState<AppLanguage>("fr");

  useEffect(() => {
    setLang(getAppLanguage());

    const onUpdate = () => setLang(getAppLanguage());
    window.addEventListener("liloba:language-updated", onUpdate);
    return () => {
      window.removeEventListener("liloba:language-updated", onUpdate);
    };
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang]
  );

  return { lang, t };
}
