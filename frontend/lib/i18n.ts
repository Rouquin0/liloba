"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — Système i18n (FR + EN)
// ============================================================
// Usage dans un composant :
//   const { t } = useAppLanguage();
//   <span>{t("menu.history")}</span>
// ============================================================

export type AppLanguage = "fr" | "en";

export const APP_LANGUAGES: { value: AppLanguage; label: string; flag: string }[] = [
  { value: "fr", label: "Français", flag: "FR" },
  { value: "en", label: "English", flag: "EN" },
];

// ============================================================
// DICTIONNAIRE DE TRADUCTIONS
// ============================================================
// Convention de nommage :
//   menu.*      → menu hamburger
//   settings.*  → page des paramètres
//   common.*    → boutons et textes génériques
//   chat.*      → chat Apollos
//   bible.*     → page Bible
//   search.*    → page recherche
//   home.*      → page d'accueil
// ============================================================

type TranslationKey = string;

const TRANSLATIONS: Record<AppLanguage, Record<TranslationKey, string>> = {
  fr: {
    // ---------- MENU ----------
    "menu.title": "Menu",
    "menu.history": "Historique",
    "menu.notebook": "Mon Carnet",
    "menu.bibleSection": "LA BIBLE",
    "menu.allBooks": "Tous les livres",
    "menu.oldTestament": "Ancien Testament",
    "menu.newTestament": "Nouveau Testament",
    "menu.pinned": "ÉPINGLÉES",
    "menu.recent": "RÉCENTES",
    "menu.newConversation": "Nouvelle discussion",
    "menu.chat": "Chat",
    "menu.search": "Recherche",
    "menu.settings": "Paramètres",
    "menu.about": "À propos",

    // ---------- COMMON ----------
    "common.back": "Retour",
    "common.close": "Fermer",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    "common.delete": "Supprimer",
    "common.save": "Enregistrer",
    "common.saved": "Enregistré",
    "common.loading": "Chargement…",
    "common.error": "Une erreur est survenue",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.online": "En ligne",
    "common.offline": "Hors ligne",

    // ---------- HOME ----------
    "home.greeting": "Bienvenue sur LILOBA",
    "home.subtitle": "La Parole, éclairée",
    "home.readBible": "Lire la Bible",
    "home.askApollos": "Demander à Apollos",

    // ---------- CHAT ----------
    "chat.welcome": "Bonjour, je suis Apollos",
    "chat.welcomeSubtitle":
      "Ton compagnon d'étude de la Parole. Pose-moi tes questions sur les Écritures.",
    "chat.tryQuestion": "Essaie une question",
    "chat.placeholder": "Pose ta question…",
    "chat.send": "Envoyer",
    "chat.offline": "Apollos a besoin d'internet pour répondre.",
    "chat.ephemeral": "Discussion éphémère",
    "chat.ephemeralInfo": "Non enregistrée dans Récentes",
    "chat.searching": "Recherche des passages…",
    "chat.context": "Contexte",

    // ---------- BIBLE ----------
    "bible.chapter": "Chapitre",
    "bible.chapterOf": "{chap} sur {total}",
    "bible.offlineIndicator": "Hors ligne",
    "bible.compare": "Comparer",
    "bible.chapters": "Chapitres",
    "bible.prev": "Précédent",
    "bible.next": "Suivant",
    "bible.loadError": "Impossible de charger le chapitre",

    // ---------- SEARCH ----------
    "search.placeholder": "Mot-clé ou référence (ex: Jean 3:16)",
    "search.suggestions": "Suggestions",
    "search.results": "résultat",
    "search.resultsPlural": "résultats",
    "search.noResults": "Aucun résultat",
    "search.noResultsHint": "Essaie un autre mot-clé ou une référence (ex: Jean 3:16)",
    "search.recentSearches": "Recherches récentes",
    "search.clear": "Effacer",
    "search.emptyTitle": "Que cherches-tu ?",
    "search.emptyHint": "Tape un mot-clé ou une référence biblique",
    "search.offlineHint":
      "Pour chercher un mot-clé dans toute la Bible, télécharge la Bible hors ligne dans les paramètres.",

    // ---------- SETTINGS ----------
    "settings.title": "Paramètres",

    "settings.appearance": "Apparence",
    "settings.darkMode": "Mode sombre",
    "settings.lightMode": "Mode clair",
    "settings.tapToToggle": "Touche pour basculer",
    "settings.accentColor": "Couleur d'accent",
    "settings.accentApplied": "Appliquée partout",
    "settings.reset": "Réinitialiser",

    "settings.language": "Langue",
    "settings.appLanguage": "Langue de l'interface",
    "settings.appLanguageDesc": "Menu, boutons et messages de l'app",
    "settings.defaultTranslation": "Traduction par défaut",
    "settings.defaultTranslationDesc": "Version de la Bible utilisée par défaut",

    "settings.age": "Mon âge",
    "settings.ageDesc": "Adapte le ton des réponses d'Apollos",

    "settings.reading": "Lecture & typographie",
    "settings.textSize": "Taille du texte",
    "settings.font": "Style de police",
    "settings.fontForVerses": "Pour les versets",
    "settings.lineHeight": "Espacement",
    "settings.lineHeightDesc": "Interligne des versets",
    "settings.displayMode": "Mode d'affichage",
    "settings.displayVerse": "Verset par verset",
    "settings.displayParagraph": "Paragraphe continu",

    "settings.notifications": "Notifications & rappels",
    "settings.dailyVerse": "Verset du jour",
    "settings.dailyVerseDesc": "Notification quotidienne",
    "settings.reminders": "Rappels de lecture",
    "settings.remindersDesc": "Pour ton plan de lecture",
    "settings.testNotification": "Tester une notification",
    "settings.time": "Heure",

    "settings.data": "Données & sauvegarde",
    "settings.exportImport": "Exporter / Importer",
    "settings.export": "Exporter",
    "settings.import": "Importer",
    "settings.storage": "Espace utilisé",
    "settings.offlineBible": "Bible hors ligne",
    "settings.notDownloaded": "Non téléchargée",
    "settings.update": "Mettre à jour",
    "settings.clearCache": "Vider le cache",

    "settings.highlights": "Mes surlignages",
    "settings.about": "À propos",
    "settings.version": "Version",
    "settings.dangerZone": "Zone dangereuse",
    "settings.resetAll": "Effacer toutes mes données",
    "settings.resetAllDesc":
      "Discussions, surlignages, Bible hors ligne, préférences",

    // ---------- SPLIT ----------
    "split.bible": "Bible",
    "split.chat": "Apollos",
    "split.search": "Recherche",
    "split.compare": "Comparer",
    "split.splitScreen": "Diviser l'écran",
    "split.swap": "Échanger les panneaux",
    "split.close": "Fermer le split",
  },

  en: {
    // ---------- MENU ----------
    "menu.title": "Menu",
    "menu.history": "History",
    "menu.notebook": "My Notebook",
    "menu.bibleSection": "THE BIBLE",
    "menu.allBooks": "All books",
    "menu.oldTestament": "Old Testament",
    "menu.newTestament": "New Testament",
    "menu.pinned": "PINNED",
    "menu.recent": "RECENT",
    "menu.newConversation": "New conversation",
    "menu.chat": "Chat",
    "menu.search": "Search",
    "menu.settings": "Settings",
    "menu.about": "About",

    // ---------- COMMON ----------
    "common.back": "Back",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.saved": "Saved",
    "common.loading": "Loading…",
    "common.error": "An error occurred",
    "common.yes": "Yes",
    "common.no": "No",
    "common.online": "Online",
    "common.offline": "Offline",

    // ---------- HOME ----------
    "home.greeting": "Welcome to LILOBA",
    "home.subtitle": "The Word, enlightened",
    "home.readBible": "Read the Bible",
    "home.askApollos": "Ask Apollos",

    // ---------- CHAT ----------
    "chat.welcome": "Hello, I'm Apollos",
    "chat.welcomeSubtitle":
      "Your study companion for the Word. Ask me your questions about the Scriptures.",
    "chat.tryQuestion": "Try a question",
    "chat.placeholder": "Ask your question…",
    "chat.send": "Send",
    "chat.offline": "Apollos needs internet to answer.",
    "chat.ephemeral": "Ephemeral chat",
    "chat.ephemeralInfo": "Not saved in Recent",
    "chat.searching": "Searching for passages…",
    "chat.context": "Context",

    // ---------- BIBLE ----------
    "bible.chapter": "Chapter",
    "bible.chapterOf": "{chap} of {total}",
    "bible.offlineIndicator": "Offline",
    "bible.compare": "Compare",
    "bible.chapters": "Chapters",
    "bible.prev": "Previous",
    "bible.next": "Next",
    "bible.loadError": "Unable to load chapter",

    // ---------- SEARCH ----------
    "search.placeholder": "Keyword or reference (e.g., John 3:16)",
    "search.suggestions": "Suggestions",
    "search.results": "result",
    "search.resultsPlural": "results",
    "search.noResults": "No results",
    "search.noResultsHint": "Try another keyword or reference (e.g., John 3:16)",
    "search.recentSearches": "Recent searches",
    "search.clear": "Clear",
    "search.emptyTitle": "What are you looking for?",
    "search.emptyHint": "Type a keyword or biblical reference",
    "search.offlineHint":
      "To search by keyword in the whole Bible, download the offline Bible in settings.",

    // ---------- SETTINGS ----------
    "settings.title": "Settings",

    "settings.appearance": "Appearance",
    "settings.darkMode": "Dark mode",
    "settings.lightMode": "Light mode",
    "settings.tapToToggle": "Tap to toggle",
    "settings.accentColor": "Accent color",
    "settings.accentApplied": "Applied everywhere",
    "settings.reset": "Reset",

    "settings.language": "Language",
    "settings.appLanguage": "Interface language",
    "settings.appLanguageDesc": "Menu, buttons and app messages",
    "settings.defaultTranslation": "Default translation",
    "settings.defaultTranslationDesc": "Bible version used by default",

    "settings.age": "My age",
    "settings.ageDesc": "Adapts Apollos's tone",

    "settings.reading": "Reading & typography",
    "settings.textSize": "Text size",
    "settings.font": "Font style",
    "settings.fontForVerses": "For verses",
    "settings.lineHeight": "Spacing",
    "settings.lineHeightDesc": "Verse line height",
    "settings.displayMode": "Display mode",
    "settings.displayVerse": "Verse by verse",
    "settings.displayParagraph": "Continuous paragraph",

    "settings.notifications": "Notifications & reminders",
    "settings.dailyVerse": "Verse of the day",
    "settings.dailyVerseDesc": "Daily notification",
    "settings.reminders": "Reading reminders",
    "settings.remindersDesc": "For your reading plan",
    "settings.testNotification": "Test a notification",
    "settings.time": "Time",

    "settings.data": "Data & backup",
    "settings.exportImport": "Export / Import",
    "settings.export": "Export",
    "settings.import": "Import",
    "settings.storage": "Storage used",
    "settings.offlineBible": "Offline Bible",
    "settings.notDownloaded": "Not downloaded",
    "settings.update": "Update",
    "settings.clearCache": "Clear cache",

    "settings.highlights": "My highlights",
    "settings.about": "About",
    "settings.version": "Version",
    "settings.dangerZone": "Danger zone",
    "settings.resetAll": "Erase all my data",
    "settings.resetAllDesc":
      "Conversations, highlights, offline Bible, preferences",

    // ---------- SPLIT ----------
    "split.bible": "Bible",
    "split.chat": "Apollos",
    "split.search": "Search",
    "split.compare": "Compare",
    "split.splitScreen": "Split screen",
    "split.swap": "Swap panels",
    "split.close": "Close split",
  },
};

// ============================================================
// FONCTION DE TRADUCTION
// ============================================================

/**
 * Traduit une clé en tenant compte des variables {xxx} optionnelles.
 * Exemple : t("bible.chapterOf", { chap: 3, total: 50 })
 *   → "3 sur 50"
 */
export function translate(
  lang: AppLanguage,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.fr;
  let text = dict[key] ?? TRANSLATIONS.fr[key] ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
}

// ---------- Préférence localStorage ----------

const LANG_KEY = "liloba-app-language";
const DEFAULT_LANG: AppLanguage = "fr";

export function getAppLanguage(): AppLanguage {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" ? "en" : "fr";
  } catch {
    return DEFAULT_LANG;
  }
}

export function setAppLanguage(lang: AppLanguage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANG_KEY, lang);
    window.dispatchEvent(new Event("liloba:language-updated"));
  } catch {}
}

export function getAppLanguageLabel(lang: AppLanguage): string {
  return APP_LANGUAGES.find((l) => l.value === lang)?.label ?? "Français";
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
