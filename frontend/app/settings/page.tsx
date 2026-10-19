"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BRANDING } from "@/lib/branding";
import {
  AGE_OPTIONS,
  getAge,
  setAge,
  type AgeLevel,
  resetOnboarding,
  COLOR_OPTIONS,
  getAccentColor,
  setAccentColor,
  resetAccentColor,
  TEXT_SIZE_OPTIONS,
  FONT_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  type TextSize,
  type FontFamily,
  type LineHeight,
  type DisplayMode,
  getTextSize,
  setTextSize,
  getFontFamily,
  setFontFamily,
  getLineHeight,
  setLineHeight,
  getDisplayMode,
  setDisplayMode,
  type DefaultTranslationId,
  getDefaultTranslation,
  setDefaultTranslation,
} from "@/lib/preferences";
import { deleteAllConversations } from "@/lib/conversations";
import {
  exportAllData,
  importAllData,
  getStorageEstimate,
  reloadOfflineBible,
  clearOfflineBible,
  type StorageEstimate,
} from "@/lib/backup";
import {
  getOfflineStatus,
  formatSize,
  formatDownloadDate,
} from "@/lib/offline-bible";
import { applyAccentColor } from "@/hooks/useCustomColors";
import HighlightsSection from "@/components/HighlightsSection";
import OfflineCheckSection from "@/components/OfflineCheckSection";
import SettingSelect from "@/components/SettingSelect";
import Logo from "@/components/Logo";
import { TRANSLATIONS } from "@/lib/translations";

// ============================================================
// NUMÉRAUX ROMAINS
// ============================================================

const ROMAN_NUMERALS = ["I", "II", "III", "IV"];

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [age, setAgeState] = useState<AgeLevel>("18+");
  const [accentColor, setAccentColorState] = useState<string>("rose");
  const [saved, setSaved] = useState(false);

  // ---- Lecture & typographie ----
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [fontFamily, setFontFamilyState] = useState<FontFamily>("serif");
  const [lineHeight, setLineHeightState] = useState<LineHeight>("normal");
  const [displayMode, setDisplayModeState] = useState<DisplayMode>("verse");

  // ---- Traduction par défaut ----
  const [defaultTranslation, setDefaultTranslationState] =
    useState<DefaultTranslationId>("lsg");

  // ---- Données ----
  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [offlineInfo, setOfflineInfo] = useState<{
    size: number;
    date: number | null;
  }>({ size: 0, date: null });
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setAgeState(getAge() ?? "18+");
    setAccentColorState(getAccentColor());
    setTextSizeState(getTextSize());
    setFontFamilyState(getFontFamily());
    setLineHeightState(getLineHeight());
    setDisplayModeState(getDisplayMode());
    setDefaultTranslationState(getDefaultTranslation());
    refreshStorage();
  }, []);

  const refreshStorage = async () => {
    const est = await getStorageEstimate();
    setStorage(est);
    const st = await getOfflineStatus();
    setOfflineInfo({ size: st.size, date: st.downloadedAt });
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleAgeChange = (newAge: AgeLevel) => {
    setAgeState(newAge);
    setAge(newAge);
    showSaved();
  };

  const handleDefaultTranslationChange = (id: DefaultTranslationId) => {
    setDefaultTranslationState(id);
    setDefaultTranslation(id);
    showSaved();
  };

  const handleAccentChange = (value: string) => {
    setAccentColorState(value);
    setAccentColor(value);
    applyAccentColor(value);
    showSaved();
  };

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    showSaved();
  };

  const handleResetAccent = () => {
    resetAccentColor();
    const defaultValue = getAccentColor();
    setAccentColorState(defaultValue);
    applyAccentColor(defaultValue);
    showSaved();
  };

  const handleResetAll = () => {
    if (
      !confirm(
        "Effacer toutes les données ? Cette action est irréversible.\n\n" +
          "Seront supprimés :\n" +
          "• Toutes tes discussions\n" +
          "• Tes surlignages\n" +
          "• Ta Bible hors ligne\n" +
          "• Tes préférences"
      )
    ) {
      return;
    }
    deleteAllConversations();
    resetAccentColor();
    resetOnboarding();

    if (typeof window !== "undefined" && indexedDB) {
      indexedDB.deleteDatabase("liloba-offline");
    }

    router.push("/onboarding");
  };

  const handleTextSize = (v: TextSize) => {
    setTextSizeState(v);
    setTextSize(v);
    showSaved();
  };
  const handleFontFamily = (v: FontFamily) => {
    setFontFamilyState(v);
    setFontFamily(v);
    showSaved();
  };
  const handleLineHeight = (v: LineHeight) => {
    setLineHeightState(v);
    setLineHeight(v);
    showSaved();
  };
  const handleDisplayMode = (v: DisplayMode) => {
    setDisplayModeState(v);
    setDisplayMode(v);
    showSaved();
  };

  const handleExport = () => {
    try {
      exportAllData();
      setToast({ ok: true, msg: "Sauvegarde téléchargée." });
    } catch {
      setToast({ ok: false, msg: "Erreur lors de l'export." });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("import");
    const res = await importAllData(file);
    setBusy(null);
    setToast({ ok: res.ok, msg: res.message });
    if (res.ok) {
      setTimeout(() => window.location.reload(), 1500);
    }
    e.target.value = "";
  };

  const handleReloadOffline = async () => {
    setBusy("reload");
    const res = await reloadOfflineBible();
    setBusy(null);
    setToast({ ok: res.ok, msg: res.message });
    await refreshStorage();
  };

  const handleClearOffline = async () => {
    if (
      !confirm(
        "Vider le cache de la Bible hors ligne ? Elle devra être retéléchargée."
      )
    )
      return;
    setBusy("clear");
    const res = await clearOfflineBible();
    setBusy(null);
    setToast({ ok: res.ok, msg: res.message });
    await refreshStorage();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)]"
          style={{ borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    // w-0 + min-w-full : la page remplit 100 % du parent mais ne l'élargit jamais
    // (un contenu large ne peut plus agrandir tout le layout au-delà de l'écran)
    <div className="flex h-full w-0 min-w-full max-w-full flex-col overflow-x-hidden bg-[var(--background)]">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
        <Link
          href="/chat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Retour"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Logo size={24} />
          <h1 className="truncate text-sm font-semibold text-[var(--foreground)] md:text-base">
            Paramètres
          </h1>
        </div>

        {saved && (
          <span className="animate-fade-in flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Enregistré</span>
          </span>
        )}
      </header>

      {/* ==================== CONTENU ==================== */}
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-4 md:px-6 md:py-6">
          {/* ========== 1. APPARENCE ========== */}
          <Section title="Apparence">
            <SettingRow>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  {isDark ? <IconMoon /> : <IconSun />}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Mode {isDark ? "sombre" : "clair"}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Touche pour basculer
                  </span>
                </div>
              </div>
              <Toggle checked={isDark} onChange={handleThemeToggle} />
            </SettingRow>

            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconBrush />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Couleur d&apos;accent
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Appliquée partout
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:ml-12 md:gap-3">
                {COLOR_OPTIONS.map((opt) => {
                  const isSelected = accentColor === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleAccentChange(opt.value)}
                      className={`h-7 w-7 rounded-full border-2 transition-all duration-200 md:h-8 md:w-8 ${
                        isSelected
                          ? "scale-110 border-[var(--foreground)] shadow-md"
                          : "border-transparent hover:scale-110"
                      }`}
                      style={{
                        background: opt.hex,
                        boxShadow: isSelected
                          ? `0 0 12px ${opt.hex}80`
                          : undefined,
                      }}
                      title={opt.label}
                      aria-label={opt.label}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleResetAccent}
                className="mt-2 text-xs text-[var(--muted)] underline-offset-2 hover:underline md:ml-12 md:mt-3"
              >
                Réinitialiser
              </button>
            </div>
          </Section>

          {/* ========== 2. LANGUE (mobile uniquement) ========== */}
          <div className="md:hidden">
            <Section title="Langue">
              <div className="min-w-0 max-w-full">
              <SettingSelect<DefaultTranslationId>
                icon={<IconBook />}
                title="Traduction par défaut"
                description="Version de la Bible utilisée par défaut"
                value={defaultTranslation}
                onChange={handleDefaultTranslationChange}
                options={TRANSLATIONS.map((tr) => ({
                  value: tr.id as DefaultTranslationId,
                  label: tr.name,
                  description: `${tr.shortName} · ${tr.language}`,
                  flag: tr.flag,
                }))}
              />
              </div>
            </Section>
          </div>

          {/* ========== 3. ÂGE ========== */}
          <Section title="Mon âge">
            <div className="flex min-w-0 flex-col">
              {AGE_OPTIONS.map((option, index) => {
                const isSelected = age === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAgeChange(option.value)}
                    className={`group flex items-center gap-3 border-b border-[var(--border)] py-3 text-left transition-all last:border-b-0 ${
                      isSelected ? "" : "hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 md:h-8 md:w-8 ${
                        isSelected
                          ? "border-[var(--color-accent)]"
                          : "border-[var(--border)]"
                      }`}
                      style={{
                        color: isSelected
                          ? "var(--color-accent)"
                          : "var(--muted)",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {ROMAN_NUMERALS[index] ?? "•"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm transition-colors ${
                          isSelected
                            ? "font-medium text-[var(--color-accent)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                        style={{ background: "var(--color-accent)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ========== 4. LECTURE & TYPOGRAPHIE ========== */}
          <Section title="Lecture & typographie">
            {/* Taille du texte */}
            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconTextSize />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Taille du texte
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {TEXT_SIZE_OPTIONS.find((o) => o.value === textSize)?.label ?? "Moyen"}
                  </span>
                </div>
              </div>
              
              {/* Conteneur flex-col sur mobile, flex-row sur PC */}
              <div className="flex flex-col gap-2 md:ml-12 md:flex-row md:items-center md:gap-2">
                {/* Bouton - */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.value === textSize);
                    if (idx > 0) handleTextSize(TEXT_SIZE_OPTIONS[idx - 1].value);
                  }}
                  disabled={textSize === "small"}
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-30 md:flex md:h-9 md:w-9"
                >
                  A−
                </button>
                
                {/* Les options (PETIT, MOYEN, etc) */}
                <div className="flex w-full min-w-0 justify-between gap-1 rounded-lg border border-[var(--border)] p-1 md:flex-1 md:border-none md:p-0">
                  {TEXT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleTextSize(opt.value)}
                      className={`min-w-0 flex-1 rounded-md px-0.5 py-1.5 text-[10px] font-medium uppercase tracking-wide transition-all md:rounded-lg md:py-2 ${
                        textSize === opt.value
                          ? "bg-[var(--color-accent)] text-white shadow-sm"
                          : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Bouton + */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.value === textSize);
                    if (idx < TEXT_SIZE_OPTIONS.length - 1) handleTextSize(TEXT_SIZE_OPTIONS[idx + 1].value);
                  }}
                  disabled={textSize === "xlarge"}
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-30 md:flex md:h-9 md:w-9"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Police */}
            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconFont />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Style de police
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Pour les versets
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:ml-12 md:gap-3">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFontFamily(opt.value)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all md:px-4 md:py-3 ${
                      fontFamily === opt.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : "border-[var(--border)] hover:border-[var(--color-accent)]/40"
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span
                        className="text-base md:text-lg"
                        style={{
                          fontFamily:
                            opt.value === "serif"
                              ? "Georgia, serif"
                              : "system-ui, sans-serif",
                        }}
                      >
                        Aa
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wide ${
                          fontFamily === opt.value
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>
                    {fontFamily === opt.value && (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white md:h-5 md:w-5"
                        style={{ background: "var(--color-accent)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-2.5 w-2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Interligne */}
            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconLineHeight />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Espacement
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Interligne des versets
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:ml-12 md:gap-3">
                {LINE_HEIGHT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLineHeight(opt.value)}
                    className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                      lineHeight === opt.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode d'affichage */}
            <SettingRow>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconLayout />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Mode d&apos;affichage
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {displayMode === "verse"
                      ? "Verset par verset"
                      : "Paragraphe continu"}
                  </span>
                </div>
              </div>
              <Toggle
                checked={displayMode === "paragraph"}
                onChange={() =>
                  handleDisplayMode(
                    displayMode === "verse" ? "paragraph" : "verse"
                  )
                }
              />
            </SettingRow>
          </Section>

          {/* ========== 5. DONNÉES & SAUVEGARDE ========== */}
          <Section title="Données & sauvegarde">
            {/* Export / Import */}
            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconExchange />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Exporter / Importer
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Surlignages, notes, favoris
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:ml-12 md:gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2.5 text-xs font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <IconDownload />
                  Exporter
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  disabled={busy === "import"}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2.5 text-xs font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
                >
                  <IconUpload />
                  {busy === "import" ? "Import..." : "Importer"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* Espace mémoire */}
            <div className="border-b border-[var(--border)] py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconHardDrive />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Espace utilisé
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {storage
                      ? `${storage.usageLabel} sur ${storage.quotaLabel}`
                      : "Calcul..."}
                  </span>
                </div>
              </div>
              {storage && (
                <div className="md:ml-12">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(storage.percent, 100).toFixed(1)}%`,
                        background: "var(--color-accent)",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[var(--muted)]">
                    {storage.percent.toFixed(2)}% de l&apos;espace disponible
                  </div>
                </div>
              )}
            </div>

            {/* Gestion cache hors-ligne */}
            <div className="py-3 md:py-4">
              <div className="mb-3 flex min-w-0 items-center gap-3 md:mb-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9"
                  style={{ background: "var(--surface-hover)" }}
                >
                  <IconCloud />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Bible hors ligne
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {offlineInfo.size > 0
                      ? `${formatSize(offlineInfo.size)}${
                          offlineInfo.date
                            ? ` · ${formatDownloadDate(offlineInfo.date)}`
                            : ""
                        }`
                      : "Non téléchargée"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:ml-12 md:gap-3">
                <button
                  type="button"
                  onClick={handleReloadOffline}
                  disabled={busy === "reload"}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2.5 text-xs font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
                >
                  <IconRefresh />
                  {busy === "reload" ? "Mise à jour..." : "Mettre à jour"}
                </button>
                <button
                  type="button"
                  onClick={handleClearOffline}
                  disabled={busy === "clear" || offlineInfo.size === 0}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 py-2.5 text-xs font-medium text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/5 disabled:opacity-30"
                >
                  <IconTrash />
                  {busy === "clear" ? "Vidage..." : "Vider le cache"}
                </button>
              </div>
              {offlineInfo.size === 0 && (
                <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)] md:ml-12 md:mt-3">
                  Pour télécharger la Bible hors ligne, installe LILOBA sur ton
                  téléphone : Menu du navigateur → Ajouter à l&apos;écran
                  d&apos;accueil.
                </p>
              )}
              
              {/* 🛠️ VÉRIFICATEUR HORS LIGNE (NOUVEAU) */}
              <div className="mt-4 min-w-0 md:ml-12">
                <OfflineCheckSection onChanged={refreshStorage} />
              </div>
            </div>
          </Section>

          {/* ========== 6. MES SURLIGNAGES ========== */}
          <Section title="Mes surlignages">
            <div className="min-w-0 max-w-full">
              <HighlightsSection />
            </div>
          </Section>

          {/* ========== 7. À PROPOS ========== */}
          <Section title="À propos">
            <div className="flex items-center gap-3 border-b border-[var(--border)] py-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                }}
              >
                <Logo size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--foreground)]">
                  {BRANDING.app.name}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {BRANDING.app.tagline}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--foreground)]">Version</span>
              <span className="font-mono text-xs text-[var(--muted)]">
                1.0.0
              </span>
            </div>
          </Section>

          {/* ========== ZONE DANGER (sobre) ========== */}
          <section className="mb-8 md:mb-10">
            <button
              type="button"
              onClick={handleResetAll}
              className="flex w-full items-center justify-between gap-3 border-b border-[var(--border)] py-3 text-left transition-all hover:opacity-80"
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-red-500">
                  Effacer toutes mes données
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Action irréversible
                </span>
              </div>
              <span className="text-red-500">→</span>
            </button>
          </section>

          <div className="pt-4 pb-8 text-center text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {BRANDING.app.name} · {BRANDING.app.tagline}
          </div>
        </div>
      </div>

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div
          className={`animate-fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-3 text-xs font-medium shadow-xl backdrop-blur-md ${
            toast.ok
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
          style={{ background: "var(--surface)" }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SECTION (version simplifiée : juste le titre, pas d'icône)
// ============================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 md:mb-10">
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] md:mb-4 md:text-xs">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

// ============================================================
// SETTING ROW
// ============================================================

function SettingRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-3 md:py-4">
      {children}
    </div>
  );
}

// ============================================================
// TOGGLE
// ============================================================

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-300 ${
        checked
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
          : "border-[var(--border)] bg-[var(--surface-hover)]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ============================================================
// ICÔNES SVG
// ============================================================

function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconBrush() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconTextSize() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 20V4h10" /><path d="M4 12h8" />
      <path d="M14 20h6" /><path d="M17 12v8" />
    </svg>
  );
}

function IconFont() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 20 10 4h2l6 16" /><path d="M6 14h10" />
    </svg>
  );
}

function IconLineHeight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M10 12h11" /><path d="M10 18h11" /><path d="M10 6h11" />
      <path d="m4 8 2-2 2 2" /><path d="m4 16 2 2 2-2" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" /><path d="M3 15h18" />
    </svg>
  );
}

function IconExchange() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m16 3 4 4-4 4" /><path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" /><path d="M4 17h16" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function IconHardDrive() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="22" x2="2" y1="12" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" x2="6.01" y1="16" y2="16" /><line x1="10" x2="10.01" y1="16" y2="16" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
