// ============================================================
// LILOBA — Gestion des préférences utilisateur
// ============================================================
// Stocke : âge (niveau), couleurs, thème.
// Persistance : localStorage.
// ============================================================

"use client";

// ---------- Types ----------

export type AgeLevel = "8-11" | "12-15" | "16-17" | "18+";

export interface AgeOption {
  value: AgeLevel;
  label: string;
  description: string;
  emoji: string;
}

export const AGE_OPTIONS: AgeOption[] = [
  {
    value: "8-11",
    label: "8-11 ans",
    description: "Explications simples, mots d'enfant",
    emoji: "🧒",
  },
  {
    value: "12-15",
    label: "12-15 ans",
    description: "Français simple, notions expliquées",
    emoji: "👦",
  },
  {
    value: "16-17",
    label: "16-17 ans",
    description: "Français clair, distinctions précises",
    emoji: "🧑",
  },
  {
    value: "18+",
    label: "18 ans et plus",
    description: "Réponses détaillées, nuances théologiques",
    emoji: "👨",
  },
];

// ---------- Clés de stockage ----------

const KEYS = {
  age: "liloba-age",
  onboarded: "liloba-onboarded",
} as const;

// ---------- Fonctions ----------

export function getAge(): AgeLevel | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(KEYS.age) as AgeLevel | null;
    if (
      stored &&
      ["8-11", "12-15", "16-17", "18+"].includes(stored)
    ) {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAge(age: AgeLevel): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.age, age);
    localStorage.setItem(KEYS.onboarded, "true");
  } catch {
    // ignore
  }
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEYS.onboarded) === "true";
  } catch {
    return false;
  }
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEYS.age);
    localStorage.removeItem(KEYS.onboarded);
  } catch {
    // ignore
  }
}

// ---------- Helper : niveau depuis l'âge ----------

export function getAgeLabel(age: AgeLevel): string {
  const option = AGE_OPTIONS.find((o) => o.value === age);
  return option?.label ?? age;
}

export function getAgeEmoji(age: AgeLevel): string {
  const option = AGE_OPTIONS.find((o) => o.value === age);
  return option?.emoji ?? "👤";
}

// ============================================================
// PRÉFÉRENCE DE COULEUR D'ACCENT
// ============================================================
// Une seule couleur qui s'applique PARTOUT :
// bouton d'envoi, bulles user, accents, "Nouvelle discussion", etc.

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { value: "brown", label: "Marron", hex: "#78350f" },
  { value: "rose", label: "Rose", hex: "#ec4899" },
  { value: "red", label: "Rouge", hex: "#dc2626" },
  { value: "purple", label: "Violet", hex: "#8b5cf6" },
  { value: "green", label: "Vert forêt", hex: "#2d6a4f" },
  { value: "blue", label: "Bleu", hex: "#3b82f6" },
  { value: "yellow", label: "Jaune", hex: "#f59e0b" },
  { value: "orange", label: "Orange", hex: "#ea580c" },
  { value: "black", label: "Noir", hex: "#1a1a1a" },
  { value: "gray", label: "Gris", hex: "#64748b" },
];

const ACCENT_KEY = "liloba-accent-color";
const DEFAULT_ACCENT = "brown";

export function getAccentColor(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    return localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function setAccentColor(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCENT_KEY, value);
  } catch {
    // ignore
  }
}

export function resetAccentColor(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCENT_KEY);
  } catch {
    // ignore
  }
}

export function getColorHex(value: string): string {
  const option = COLOR_OPTIONS.find((c) => c.value === value);
  return option?.hex ?? "#b91c1c";
}

// ============================================================
// LECTURE & TYPOGRAPHIE
// ============================================================

export type TextSize = "small" | "medium" | "large" | "xlarge";
export type FontFamily = "serif" | "sans";
export type LineHeight = "compact" | "normal" | "airy";
export type DisplayMode = "verse" | "paragraph";

export interface TextSizeOption {
  value: TextSize;
  label: string;
  px: number;
}

export const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
  { value: "small", label: "Petit", px: 15 },
  { value: "medium", label: "Moyen", px: 17 },
  { value: "large", label: "Grand", px: 19 },
  { value: "xlarge", label: "Très grand", px: 22 },
];

export const FONT_OPTIONS: { value: FontFamily; label: string; css: string }[] = [
  { value: "serif", label: "Serif", css: "var(--font-serif)" },
  { value: "sans", label: "Sans-serif", css: "system-ui, sans-serif" },
];

export const LINE_HEIGHT_OPTIONS: { value: LineHeight; label: string; css: number }[] = [
  { value: "compact", label: "Compact", css: 1.4 },
  { value: "normal", label: "Normal", css: 1.7 },
  { value: "airy", label: "Aéré", css: 2.0 },
];

const READING_KEYS = {
  textSize: "liloba-text-size",
  fontFamily: "liloba-font-family",
  lineHeight: "liloba-line-height",
  displayMode: "liloba-display-mode",
} as const;

export function getTextSize(): TextSize {
  if (typeof window === "undefined") return "medium";
  try {
    const v = localStorage.getItem(READING_KEYS.textSize) as TextSize | null;
    return v && ["small", "medium", "large", "xlarge"].includes(v) ? v : "medium";
  } catch {
    return "medium";
  }
}
export function setTextSize(v: TextSize): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(READING_KEYS.textSize, v); } catch {}
}

export function getFontFamily(): FontFamily {
  if (typeof window === "undefined") return "serif";
  try {
    const v = localStorage.getItem(READING_KEYS.fontFamily) as FontFamily | null;
    return v === "sans" ? "sans" : "serif";
  } catch {
    return "serif";
  }
}
export function setFontFamily(v: FontFamily): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(READING_KEYS.fontFamily, v); } catch {}
}

export function getLineHeight(): LineHeight {
  if (typeof window === "undefined") return "normal";
  try {
    const v = localStorage.getItem(READING_KEYS.lineHeight) as LineHeight | null;
    return v && ["compact", "normal", "airy"].includes(v) ? v : "normal";
  } catch {
    return "normal";
  }
}
export function setLineHeight(v: LineHeight): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(READING_KEYS.lineHeight, v); } catch {}
}

export function getDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "verse";
  try {
    const v = localStorage.getItem(READING_KEYS.displayMode) as DisplayMode | null;
    return v === "paragraph" ? "paragraph" : "verse";
  } catch {
    return "verse";
  }
}
export function setDisplayMode(v: DisplayMode): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(READING_KEYS.displayMode, v); } catch {}
}

// Helper : renvoie le style CSS prêt à appliquer sur un verset
export function getVerseStyles() {
  const size = getTextSize();
  const font = getFontFamily();
  const lh = getLineHeight();
  const sizeOption = TEXT_SIZE_OPTIONS.find((o) => o.value === size) ?? TEXT_SIZE_OPTIONS[1];
  const fontOption = FONT_OPTIONS.find((o) => o.value === font) ?? FONT_OPTIONS[0];
  const lhOption = LINE_HEIGHT_OPTIONS.find((o) => o.value === lh) ?? LINE_HEIGHT_OPTIONS[1];
  return {
    fontSize: `${sizeOption.px}px`,
    fontFamily: fontOption.css,
    lineHeight: lhOption.css,
  };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

const NOTIF_KEYS = {
  dailyVerseEnabled: "liloba-notif-daily-verse-enabled",
  dailyVerseTime: "liloba-notif-daily-verse-time",
  reminderEnabled: "liloba-notif-reminder-enabled",
  reminderTime: "liloba-notif-reminder-time",
} as const;

export function getDailyVerseEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(NOTIF_KEYS.dailyVerseEnabled) === "true"; } catch { return false; }
}
export function setDailyVerseEnabled(v: boolean): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NOTIF_KEYS.dailyVerseEnabled, String(v)); } catch {}
}

export function getDailyVerseTime(): string {
  if (typeof window === "undefined") return "08:00";
  try { return localStorage.getItem(NOTIF_KEYS.dailyVerseTime) || "08:00"; } catch { return "08:00"; }
}
export function setDailyVerseTime(v: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NOTIF_KEYS.dailyVerseTime, v); } catch {}
}

export function getReminderEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(NOTIF_KEYS.reminderEnabled) === "true"; } catch { return false; }
}
export function setReminderEnabled(v: boolean): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NOTIF_KEYS.reminderEnabled, String(v)); } catch {}
}

export function getReminderTime(): string {
  if (typeof window === "undefined") return "20:00";
  try { return localStorage.getItem(NOTIF_KEYS.reminderTime) || "20:00"; } catch { return "20:00"; }
}
export function setReminderTime(v: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NOTIF_KEYS.reminderTime, v); } catch {}
}

// ============================================================
// LANGUE DE L'APPLICATION
// ============================================================

export type AppLanguage = "fr" | "en";

const APP_LANG_KEY = "liloba-app-language";

export function getAppLanguagePref(): AppLanguage {
  if (typeof window === "undefined") return "fr";
  try {
    const v = localStorage.getItem(APP_LANG_KEY);
    return v === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

export function setAppLanguagePref(lang: AppLanguage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APP_LANG_KEY, lang);
    window.dispatchEvent(new Event("liloba:language-updated"));
  } catch {}
}

// ============================================================
// TRADUCTION PAR DÉFAUT
// ============================================================

export type DefaultTranslationId =
  | "lsg"
  | "martin"
  | "kjv"
  | "valera"
  | "swahili"
  | "lingala"
  | "kituba"
  | "russian"
  | "chinese"
  | "portuguese";

const DEFAULT_TRANSLATION_KEY = "liloba-default-translation";
const DEFAULT_TRANSLATION: DefaultTranslationId = "lsg";

export function getDefaultTranslation(): DefaultTranslationId {
  if (typeof window === "undefined") return DEFAULT_TRANSLATION;
  try {
    const v = localStorage.getItem(DEFAULT_TRANSLATION_KEY);
    if (
      v === "lsg" ||
      v === "martin" ||
      v === "kjv" ||
      v === "valera" ||
      v === "swahili" ||
      v === "lingala" ||
      v === "kituba" ||
      v === "russian" ||
      v === "chinese" ||
      v === "portuguese"
    ) {
      return v;
    }
    return DEFAULT_TRANSLATION;
  } catch {
    return DEFAULT_TRANSLATION;
  }
}

export function setDefaultTranslation(id: DefaultTranslationId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEFAULT_TRANSLATION_KEY, id);
    window.dispatchEvent(new Event("liloba:default-translation-updated"));
  } catch {}
}
