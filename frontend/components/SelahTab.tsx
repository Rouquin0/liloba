"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { addJournalEntry, getTodayKey } from "@/lib/journal";
import { SELAH_RX, SELAH_STATES } from "@/lib/selah-content";
import { openInOtherPane, openStoryInOtherPane } from "@/lib/split-view";
import { pickStoryForState } from "@/lib/selah-stories";
import {
  chapterHref,
  clearSelah,
  computeSelahStats,
  deleteSelahEntry,
  getSelahEntries,
  getServerSelahEntries,
  getStateMeta,
  lastDays,
  parseDateKey,
  pickAnotherPrescription,
  pickPrescription,
  previousPas,
  readDaySignals,
  saveSelahEntry,
  setPasDone,
  subscribeSelah,
  type DaySignals,
  type Prescription,
  type SoulState,
} from "@/lib/selah";
import { getSelahPrayer, type PrayerDuration } from "@/lib/selah-prayers";
import { speakLines } from "@/lib/selah-voice";
import {
  estimatePrayerTiming,
  formatPrayerCountdown,
  isSpeechAvailable,
  prefersReducedMotion,
  stopSpeech,
} from "@/lib/selah-timer";
import {
  addGraceShield,
  computeGraceInfo,
  getSelahGrace,
  getServerSelahGrace,
  graceAddDays,
  isGraceSave,
  subscribeSelahGrace,
} from "@/lib/selah-grace";
import {
  getSelahPrefs,
  getServerSelahPrefs,
  markMilestoneSeen,
  setPrayerDuration,
  setReadAloud,
  subscribeSelahPrefs,
} from "@/lib/selah-prefs";
import {
  addPrayerTopic,
  deletePrayerTopic,
  getPrayerTopics,
  getServerPrayerTopics,
  subscribePrayerTopics,
  toggleTopicAnswered,
} from "@/lib/selah-topics";
import SelahConstellation from "@/components/selah/SelahConstellation";
import SelahSoundscape, { SelahBreathRing } from "@/components/selah/SelahSoundscape";
import SelahCapsules, { SelahCapsuleBanner } from "@/components/selah/SelahCapsules";
import SelahEveningGate, {
  EveningLockIcon,
  SelahReminderCard,
  SelahSeedHarvest,
  SelahSeedPlanter,
} from "@/components/selah/SelahEveningGate";
import {
  getEveningSnapshot,
  getServerEveningSnapshot,
  subscribeEvening,
} from "@/lib/selah-evening";
import { primeAmbient } from "@/lib/selah-ambient";
import { getCapsules, getServerCapsules, subscribeCapsules } from "@/lib/selah-capsules";
import {
  canShare,
  downloadBlob,
  elementToBlob,
  makeFilename,
  shareBlob,
} from "@/lib/verse-card";

// ------------------------------------------------------------
// ICONES SVG POUR LES ETATS
// ------------------------------------------------------------

const IconPeace = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconJoy = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);
const IconTired = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);
const IconAnxious = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>
);
const IconAngry = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const IconGuilty = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
);
const IconDry = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
  </svg>
);

const STATE_ICONS: Record<string, () => React.ReactNode> = {
  paix: IconPeace,
  joie: IconJoy,
  fatigue: IconTired,
  angoisse: IconAnxious,
  colere: IconAngry,
  culpabilite: IconGuilty,
  secheresse: IconDry,
};

/** Couleur d'accent propre à chaque état (fond uni + texte blanc, contraste OK clair/sombre). */
const STATE_ACCENTS: Record<SoulState, string> = {
  paix: "#047857",
  joie: "#b45309",
  fatigue: "#4f46e5",
  angoisse: "#0284c7",
  colere: "#b91c1c",
  culpabilite: "#6d28d9",
  secheresse: "#a16207",
};

const MILESTONES = [7, 30, 100];

// ------------------------------------------------------------
// TEXTES UI (FR/EN synchronisés)
// ------------------------------------------------------------

const UI = {
  fr: {
    title: "Selah",
    subtitle: "Ta pause du soir avec la Parole",
    tagline:
      "Quelques minutes pour t'arrêter, lire un verset, remercier Dieu et préparer demain. Tout reste sur ton appareil.",
    meaning:
      "Selah : mot qui revient dans les Psaumes, souvent compris comme une invitation à faire une pause et à méditer.",
    tabTonight: "Ce soir",
    tabPath: "Mon parcours",
    steps: ["Cœur", "Parole", "Merci", "Prière", "Demain"],
    step0: "Comment est ton cœur ce soir ?",
    topicLabel: "Un sujet de prière (optionnel)",
    topicPh: "Ex : examen demain, réconciliation, décision à prendre…",
    begin: "Commencer",
    yesterday: "Ton pas d'hier",
    yesterdayDone: "Je l'ai fait",
    yesterdayNot: "Pas encore",
    yesterdayYes: "Bravo, c'est noté.",
    day: "Ta journée avec la Parole",
    verse: "Ta parole pour ce soir",
    meditation: "Pour méditer",
    readChapter: "Lire le chapitre",
    openBible: "Ouvrir la Bible",
    next: "Suivant",
    back: "Retour",
    thanks: "Pour quoi remercies-tu Dieu aujourd'hui ?",
    thanksHint: "Trois choses, même toutes petites. Tu peux passer cette étape.",
    thanksPh: ["Merci Seigneur pour…", "Merci aussi pour…", "Et merci pour…"],
    prayer: "Prière pour ce soir",
    prayerReceived: "Prière reçue",
    durationLabel: "Durée de la prière",
    durationCourte: "Courte",
    durationMoyenne: "Moyenne",
    durationProfonde: "Profonde",
    prayerStart: "Commencer la prière",
    prayerPause: "Pause",
    prayerResume: "Reprendre",
    prayerSkip: "Passer",
    prayerRestart: "Recommencer",
    prayerSilence: "Silence final : demeure devant Dieu.",
    prayerDone: "Amen.",
    prayerFullscreen: "Plein écran",
    prayerExitFullscreen: "Sortir",
    readAloud: "Lire à voix haute",
    readAloudOff: "Voix désactivée dans ce navigateur",
    silenceRunning: "Respire doucement. Dieu est présent.",
    skip: "Passer",
    pas: "Ton pas pour demain",
    finish: "Terminer ma pause",
    doneTitle: "Pause enregistrée",
    doneText: "Tu as pris un temps avec Dieu ce soir. Reviens demain.",
    share: "Partager",
    shareImage: "Partager en image",
    shareText: "Partager le texte",
    sharing: "Préparation…",
    copied: "Copié !",
    apollos: "Approfondir avec Apollos",
    apollosCopied: "Question copiée : colle-la dans le chat.",
    again: "Recommencer",
    seePath: "Voir mon parcours",
    streak: "jours de suite",
    streakOne: "jour de suite",
    best: "Meilleure série",
    total: "pauses",
    week: "Cette semaine",
    recent: "Mes dernières pauses",
    emptyPath:
      "Ton parcours apparaîtra ici après ta première pause : série de jours, mercis et pas pour demain.",
    thanksFor: "Merci pour",
    prayerFor: "Prière",
    stepDone: "Pas fait",
    stepTodo: "Pas prévu",
    remove: "Supprimer",
    another: "Un autre verset",
    storyTitle: "Une histoire pour ton cœur",
    storyRead: "Lire l'histoire",
    noteLabel: "Ce que je retiens ce soir (optionnel)",
    notePh: "Une phrase, une prise de conscience, un engagement…",
    noteFor: "Ma note",
    wall: "Mur de reconnaissance",
    wallHint: "Tes derniers mercis, réunis au même endroit.",
    confirmRemove: "Supprimer cette pause ?",
    clearAll: "Effacer tout mon parcours",
    confirmClear: "Effacer tout ton parcours Selah ? Cette action est irréversible.",
    startFirst: "Commence par choisir ton état ci-dessus.",
    chapters: (n: number) => `${n} chapitre${n > 1 ? "s" : ""} lu${n > 1 ? "s" : ""} ces dernières 24 h`,
    noChapter: "Pas encore de lecture aujourd'hui : un chapitre avant de dormir ?",
    verses: (n: number) => `${n} verset${n > 1 ? "s" : ""} gardé${n > 1 ? "s" : ""} aujourd'hui`,
    streakRead: (n: number) => `🔥 ${n} jours de lecture de suite`,
    locale: "fr-FR",
    journalLabel: "Selah",
    graceBanner: (h: number) =>
      `Ta série est en sursis : il te reste ${h} h pour la sauver en faisant ta pause.`,
    graceShield: "Jour sauvé",
    milestone: (n: number) => `🌿 ${n} jours de pause avec Dieu. Quelle fidélité !`,
    calendar: "Calendrier du mois",
    calendarHint: "🌿 pause · 🛡️ sursis sauvé · encadré : aujourd'hui",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    topicsTitle: "Sujets de prière suivis",
    topicsHint: "Ajoutés depuis ta pause du soir. Touche « Exaucé » quand Dieu a répondu.",
    topicsPh: "Ajouter un sujet de prière…",
    topicsAdd: "Ajouter",
    topicsAnswered: "Exaucé",
    topicsNotYet: "Pas encore",
    topicsEmpty: "Aucun sujet suivi pour l'instant.",
    memoriesTitle: "Souvenirs",
    memoryDays: (n: number) => `Il y a ${n} jours, tu remerciais pour…`,
    reviewTitle: "Bilan de la semaine",
    reviewPauses: (n: number) => `${n} pause${n > 1 ? "s" : ""} cette semaine`,
    reviewThanks: (n: number) => `${n} merci${n > 1 ? "s" : ""} noté${n > 1 ? "s" : ""}`,
    reviewStates: (n: number) => `${n} état${n > 1 ? "s" : ""} du cœur différent${n > 1 ? "s" : ""}`,
    reviewSteps: (n: number) => `${n} pas accompli${n > 1 ? "s" : ""}`,
  },
  en: {
    title: "Selah",
    subtitle: "Your evening pause with the Word",
    tagline:
      "A few minutes to stop, read a verse, thank God and prepare for tomorrow. Everything stays on your device.",
    meaning:
      "Selah: a word found in the Psalms, often understood as an invitation to pause and reflect.",
    tabTonight: "Tonight",
    tabPath: "My journey",
    steps: ["Heart", "Word", "Thanks", "Prayer", "Tomorrow"],
    step0: "How is your heart tonight?",
    topicLabel: "A prayer subject (optional)",
    topicPh: "E.g. exam tomorrow, reconciliation, a decision to make…",
    begin: "Begin",
    yesterday: "Your step from last time",
    yesterdayDone: "I did it",
    yesterdayNot: "Not yet",
    yesterdayYes: "Well done, noted.",
    day: "Your day with the Word",
    verse: "Your word for tonight",
    meditation: "To reflect on",
    readChapter: "Read the chapter",
    openBible: "Open the Bible",
    next: "Next",
    back: "Back",
    thanks: "What are you thankful to God for today?",
    thanksHint: "Three things, even tiny ones. You can skip this step.",
    thanksPh: ["Thank you Lord for…", "Thank you also for…", "And thank you for…"],
    prayer: "Prayer for tonight",
    prayerReceived: "Prayer received",
    durationLabel: "Prayer length",
    durationCourte: "Short",
    durationMoyenne: "Medium",
    durationProfonde: "Deep",
    prayerStart: "Begin the prayer",
    prayerPause: "Pause",
    prayerResume: "Resume",
    prayerSkip: "Skip",
    prayerRestart: "Restart",
    prayerSilence: "Final silence: rest before God.",
    prayerDone: "Amen.",
    prayerFullscreen: "Fullscreen",
    prayerExitFullscreen: "Exit",
    readAloud: "Read aloud",
    readAloudOff: "Voice unavailable in this browser",
    silenceRunning: "Breathe gently. God is present.",
    skip: "Skip",
    pas: "Your step for tomorrow",
    finish: "Finish my pause",
    doneTitle: "Pause saved",
    doneText: "You spent time with God tonight. Come back tomorrow.",
    share: "Share",
    shareImage: "Share as image",
    shareText: "Share the text",
    sharing: "Preparing…",
    copied: "Copied!",
    apollos: "Go deeper with Apollos",
    apollosCopied: "Question copied: paste it in the chat.",
    again: "Start over",
    seePath: "See my journey",
    streak: "days in a row",
    streakOne: "day in a row",
    best: "Best streak",
    total: "pauses",
    week: "This week",
    recent: "My recent pauses",
    emptyPath:
      "Your journey will appear here after your first pause: day streak, thanks and steps for tomorrow.",
    thanksFor: "Thankful for",
    prayerFor: "Prayer",
    stepDone: "Step done",
    stepTodo: "Step planned",
    remove: "Delete",
    another: "Another verse",
    storyTitle: "A story for your heart",
    storyRead: "Read the story",
    noteLabel: "What I take away tonight (optional)",
    notePh: "A sentence, an insight, a commitment…",
    noteFor: "My note",
    wall: "Wall of thanks",
    wallHint: "Your latest thank-yous, all in one place.",
    confirmRemove: "Delete this pause?",
    clearAll: "Erase my whole journey",
    confirmClear: "Erase your whole Selah journey? This cannot be undone.",
    startFirst: "Start by choosing your state above.",
    chapters: (n: number) => `${n} chapter${n > 1 ? "s" : ""} read in the last 24h`,
    noChapter: "No reading yet today: a chapter before bed?",
    verses: (n: number) => `${n} verse${n > 1 ? "s" : ""} kept today`,
    streakRead: (n: number) => `🔥 ${n}-day reading streak`,
    locale: "en-US",
    journalLabel: "Selah",
    graceBanner: (h: number) =>
      `Your streak is on hold: you have ${h}h left to save it by taking your pause.`,
    graceShield: "Day saved",
    milestone: (n: number) => `🌿 ${n} days of pausing with God. What faithfulness!`,
    calendar: "Month calendar",
    calendarHint: "🌿 pause · 🛡️ saved hold · outlined: today",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    topicsTitle: "Followed prayer subjects",
    topicsHint: "Added from your evening pause. Tap “Answered” when God has answered.",
    topicsPh: "Add a prayer subject…",
    topicsAdd: "Add",
    topicsAnswered: "Answered",
    topicsNotYet: "Not yet",
    topicsEmpty: "No followed subjects yet.",
    memoriesTitle: "Memories",
    memoryDays: (n: number) => `${n} days ago, you were thankful for…`,
    reviewTitle: "Week review",
    reviewPauses: (n: number) => `${n} pause${n > 1 ? "s" : ""} this week`,
    reviewThanks: (n: number) => `${n} thank${n > 1 ? "s" : ""} noted`,
    reviewStates: (n: number) => `${n} different heart state${n > 1 ? "s" : ""}`,
    reviewSteps: (n: number) => `${n} step${n > 1 ? "s" : ""} completed`,
  },
};

type Tab = "tonight" | "path";
type PrayerPhase = "idle" | "running" | "paused" | "done";

const LAST_STEP = 4;

/** Durées cumulées (ms) de chaque ligne : mots/90min + 2 s de respiration. */
function lineSchedule(lines: string[]): { ends: number[]; silenceMs: number; totalMs: number } {
  const per: number[] = [];
  let readingMs = 0;
  for (const line of lines) {
    const words = line.trim().split(/\s+/).filter(Boolean).length;
    const ms = (words / 90) * 60000 + 2000;
    per.push(ms);
    readingMs += ms;
  }
  const silenceMs = Math.max(20000, readingMs * 0.25);
  const raw = readingMs + silenceMs;
  const totalMs = Math.max(30000, Math.round(raw / 5000) * 5000);
  // Ajuste le silence pour retomber exactement sur le total arrondi
  const fixedSilence = totalMs - readingMs;
  const ends: number[] = [];
  let acc = 0;
  for (const ms of per) {
    acc += ms;
    ends.push(acc);
  }
  return { ends, silenceMs: fixedSilence, totalMs };
}

export default function SelahTab({ compact = false }: { compact?: boolean }) {
  const { lang } = useAppLanguage();
  const l = lang === "en" ? UI.en : UI.fr;
  const router = useRouter();

  const entries = useSyncExternalStore(subscribeSelah, getSelahEntries, getServerSelahEntries);
  const grace = useSyncExternalStore(subscribeSelahGrace, getSelahGrace, getServerSelahGrace);
  const prefs = useSyncExternalStore(subscribeSelahPrefs, getSelahPrefs, getServerSelahPrefs);
  const topics = useSyncExternalStore(subscribePrayerTopics, getPrayerTopics, getServerPrayerTopics);
  const capsules = useSyncExternalStore(subscribeCapsules, getCapsules, getServerCapsules);

  // Verrou du soir : Selah n'ouvre qu'à partir de 18h (heure locale de l'appareil).
  // null = heure pas encore connue (rendu serveur) → on n'affiche rien plutôt que de clignoter.
  const evening = useSyncExternalStore<boolean | null>(
    subscribeEvening,
    getEveningSnapshot,
    getServerEveningSnapshot
  );

  const shields = grace.shields;
  const stats = useMemo(() => computeSelahStats(entries, shields), [entries, shields]);
  const week = useMemo(() => lastDays(entries, 7, l.locale, shields), [entries, l.locale, shields]);
  const yesterday = useMemo(() => previousPas(entries), [entries]);

  const [tab, setTab] = useState<Tab>("tonight");
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const [etat, setEtat] = useState<SoulState | null>(null);
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [rx, setRx] = useState<Prescription | null>(null);
  const [signals, setSignals] = useState<DaySignals | null>(null);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);

  const [copied, setCopied] = useState(false);
  const [apollosMsg, setApollosMsg] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [celebration, setCelebration] = useState<number | null>(null);
  const [calOffset, setCalOffset] = useState(0);
  const [newTopic, setNewTopic] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const meta = etat ? getStateMeta(etat) : null;
  const accent = etat ? STATE_ACCENTS[etat] : "var(--color-accent)";

  // ---------- Prière guidée (chrono calculé) ----------
  const duration: PrayerDuration = prefs.prayerDuration;
  const prayerLines = useMemo(
    () => (etat ? getSelahPrayer(etat, duration, lang) : []),
    [etat, duration, lang]
  );
  const timing = useMemo(() => estimatePrayerTiming(prayerLines), [prayerLines]);
  const schedule = useMemo(() => lineSchedule(prayerLines), [prayerLines]);
  const lineStarts = useMemo(
    () => schedule.ends.map((_, i) => (i === 0 ? 0 : schedule.ends[i - 1])),
    [schedule]
  );

  const [phase, setPhase] = useState<PrayerPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [prayerFocus, setPrayerFocus] = useState(false);
  // La voix suit la préférence enregistrée (case « Lire à voix haute »)
  const speechOn = prefs.readAloud;
  const speechOnRef = useRef(false);
  useEffect(() => {
    speechOnRef.current = speechOn;
  }, [speechOn]);
  // Phrase actuellement prononcée (-1 = la voix ne pilote pas l'écran)
  const voiceLineRef = useRef(-1);
  const startRef = useRef(0);
  const baseRef = useRef(0);
  const speechAvailable = useMemo(() => isSpeechAvailable(), []);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const lineIdx = useMemo(() => {
    for (let i = 0; i < schedule.ends.length; i++) {
      if (elapsedMs < schedule.ends[i]) return i;
    }
    return schedule.ends.length; // silence final
  }, [elapsedMs, schedule]);
  const inSilence = phase !== "idle" && lineIdx >= schedule.ends.length;
  const remainingSec = Math.max(0, Math.ceil((schedule.totalMs - elapsedMs) / 1000));

  // Horloge du bandeau de sursis (toutes les 30 s)
  const datesSet = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const graceInfo = useMemo(
    () => computeGraceInfo(datesSet, getTodayKey(), nowMs),
    [datesSet, nowMs]
  );
  useEffect(() => {
    if (graceInfo.status !== "grace") return;
    const id = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, [graceInfo.status]);

  // Paliers 7/30/100 : message affiché une seule fois
  useEffect(() => {
    for (const m of MILESTONES) {
      if (stats.current >= m && !prefs.milestonesSeen.includes(m)) {
        markMilestoneSeen(m);
        setCelebration(m);
      }
    }
  }, [stats.current, prefs.milestonesSeen]);

  // Lecture phrase par phrase : la VOIX donne le tempo, l'écran la suit.
  // À chaque phrase prononcée, on recale l'horloge de la prière sur le début
  // de cette phrase → la phrase en surbrillance est toujours celle qu'on entend.
  const speakFrom = (fromLine: number) => {
    if (!speechOnRef.current || !speechAvailable) return;
    if (fromLine >= prayerLines.length) return;
    speakLines(prayerLines, fromLine, {
      lang: lang === "en" ? "en-US" : "fr-FR",
      rate: 0.9,
      gapMs: 1100,
      onLine: (i) => {
        voiceLineRef.current = i;
        baseRef.current = lineStarts[i] ?? 0;
        startRef.current = Date.now();
        setElapsedMs(baseRef.current);
      },
      onDone: () => {
        // Dernière phrase finie : on entre dans le silence final (chronométré)
        voiceLineRef.current = -1;
        const end = schedule.ends.length ? schedule.ends[schedule.ends.length - 1] : 0;
        baseRef.current = end;
        startRef.current = Date.now();
        setElapsedMs(end);
      },
      onError: () => {
        // Voix indisponible : l'horloge reprend la main, la prière continue en silence
        voiceLineRef.current = -1;
      },
    });
  };

  const startPrayer = () => {
    primeAmbient(); // geste utilisateur : autorise le son (iOS)
    stopSpeech();
    voiceLineRef.current = -1;
    baseRef.current = 0;
    startRef.current = Date.now();
    setElapsedMs(0);
    setPhase("running");
    speakFrom(0);
  };

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      let e = baseRef.current + (Date.now() - startRef.current);
      // Tant que la voix lit une phrase, l'écran reste sur cette phrase
      // (même si la voix est plus lente que l'estimation).
      const vl = voiceLineRef.current;
      if (vl >= 0 && vl < schedule.ends.length) e = Math.min(e, schedule.ends[vl] - 1);
      if (e >= schedule.totalMs) {
        setElapsedMs(schedule.totalMs);
        setPhase("done");
        stopSpeech();
        clearInterval(id);
      } else {
        setElapsedMs(e);
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, schedule]);

  // Arrêt propre de la synthèse au démontage / changement d'étape
  useEffect(() => {
    return () => stopSpeech();
  }, []);
  useEffect(() => {
    if (step !== 3) {
      setPhase("idle");
      setElapsedMs(0);
      setPrayerFocus(false);
      stopSpeech();
    }
  }, [step]);

  const pausePrayer = () => {
    if (phase !== "running") return;
    let e = baseRef.current + (Date.now() - startRef.current);
    const vl = voiceLineRef.current;
    if (vl >= 0 && vl < schedule.ends.length) e = Math.min(e, schedule.ends[vl] - 1);
    baseRef.current = e;
    setElapsedMs(baseRef.current);
    setPhase("paused");
    stopSpeech(); // coupe la voix ET la chaîne de phrases en attente
  };
  const resumePrayer = () => {
    if (phase !== "paused") return;
    primeAmbient();
    startRef.current = Date.now();
    setPhase("running");
    // Reprend au DÉBUT de la phrase interrompue (plus naturel qu'au milieu d'un mot)
    speakFrom(voiceLineRef.current >= 0 ? voiceLineRef.current : lineIdx);
  };
  const skipLine = () => {
    if (phase !== "running" && phase !== "paused") return;
    stopSpeech(); // arrête la phrase en cours avant de passer à la suivante
    const target =
      lineIdx < schedule.ends.length ? schedule.ends[lineIdx] : schedule.totalMs;
    baseRef.current = Math.min(target, schedule.totalMs);
    startRef.current = Date.now();
    setElapsedMs(baseRef.current);
    voiceLineRef.current = -1;
    if (phase === "paused") setPhase("running");
    speakFrom(Math.min(lineIdx + 1, prayerLines.length));
    if (baseRef.current >= schedule.totalMs) {
      setPhase("done");
      stopSpeech();
    }
  };
  const restartPrayer = () => {
    primeAmbient();
    stopSpeech();
    voiceLineRef.current = -1;
    baseRef.current = 0;
    startRef.current = Date.now();
    setElapsedMs(0);
    setPhase("running");
    speakFrom(0);
  };

  // Focus accessibilité à chaque étape
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step, tab]);

  const begin = () => {
    if (!etat) return;
    setRx(pickPrescription(etat, entries));
    setSignals(readDaySignals());
    setGratitudes(["", "", ""]);
    setNote("");
    setCopied(false);
    setApollosMsg(false);
    setPhase("idle");
    setElapsedMs(0);
    setStep(1);
  };

  const finish = () => {
    if (!rx || !meta || !etat) return;
    const saved = saveSelahEntry({
      state: etat,
      ref: rx.ref,
      topic,
      gratitudes,
      pas: rx.pas,
      note,
    });
    void saved;
    // Sursis sauvé ? → mémoriser le jour manqué (🛡️)
    const after = new Set([...datesSet, getTodayKey()]);
    const res = isGraceSave(after, getTodayKey());
    if (res.saved && res.missedDate) addGraceShield(res.missedDate);
    // Sujet de prière suivi
    if (topic.trim()) addPrayerTopic(topic.trim(), getTodayKey());
    const merci = gratitudes.map((g) => g.trim()).filter(Boolean);
    addJournalEntry("private_note_added", `${l.journalLabel} — ${meta.fr}`, {
      detail: `${rx.ref} · ${rx.texte} | Pas : ${rx.pas}${
        topic.trim() ? ` | Sujet de prière : ${topic.trim()}` : ""
      }${merci.length ? ` | Merci : ${merci.join(" ; ")}` : ""}${
        note.trim() ? ` | Note : ${note.trim()}` : ""
      }`,
      reference: rx.ref,
    });
    setNowMs(Date.now());
    setFinished(true);
  };

  const restart = () => {
    stopSpeech();
    setFinished(false);
    setStep(0);
    setEtat(null);
    setTopic("");
    setNote("");
    setRx(null);
    setSignals(null);
    setGratitudes(["", "", ""]);
    setPhase("idle");
    setElapsedMs(0);
  };

  const shareText = async () => {
    if (!rx) return;
    const text = `${l.verse} : ${rx.ref}\n« ${rx.texte} »\n\n${l.pas} : ${rx.pas}\n— Selah · LILOBA`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Selah · LILOBA", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const shareImage = async () => {
    if (!rx || sharing) return;
    const el = cardRef.current;
    if (!el) {
      shareText();
      return;
    }
    setSharing(true);
    try {
      try {
        await (document as Document).fonts?.ready;
      } catch {
        // ignore
      }
      const blob = await elementToBlob(el);
      if (!blob) {
        shareText();
        return;
      }
      const filename = makeFilename(rx.ref || "selah");
      if (canShare()) {
        const ok = await shareBlob(blob, filename, "Selah · LILOBA", `${rx.ref} — ${rx.texte}`);
        if (!ok) downloadBlob(blob, filename);
      } else {
        downloadBlob(blob, filename);
      }
    } finally {
      setSharing(false);
    }
  };

  const goApollos = () => {
    if (!rx || !meta) return;
    const q =
      lang === "en"
        ? `My heart tonight: ${meta.en}. My verse: ${rx.ref} ("${rx.texte}"). Prayer subject: ${topic.trim() || "—"}. Explain this verse deeply and give me one concrete step for tomorrow.`
        : `Mon cœur ce soir : ${meta.fr}. Mon verset : ${rx.ref} (« ${rx.texte} »). Sujet de prière : ${topic.trim() || "—"}. Explique-moi ce verset en profondeur et donne-moi un pas concret pour demain.`;
    try {
      navigator.clipboard.writeText(q).catch(() => {});
    } catch {
      // ignore
    }
    setApollosMsg(true);
    if (compact) {
      openInOtherPane("selah", "chat");
    } else {
      setTimeout(() => router.push("/chat"), 1200);
    }
  };

  const chapterLink = !compact && rx ? chapterHref(rx.ref) : null;
  const story = etat ? pickStoryForState(etat) : null;
  const canAnother = Boolean(etat && rx && SELAH_RX[etat].length > 1);

  const anotherVerse = () => {
    if (!etat || !rx) return;
    setRx(pickAnotherPrescription(etat, rx.ref));
  };

  const wall = useMemo(
    () =>
      entries
        .flatMap((e) => e.gratitudes.map((g) => ({ g, date: e.date, id: e.id })))
        .slice(0, 12),
    [entries]
  );
  const fmtShort = (key: string) =>
    new Intl.DateTimeFormat(l.locale, { day: "numeric", month: "short" }).format(
      parseDateKey(key)
    );

  const fmtDate = (key: string) =>
    new Intl.DateTimeFormat(l.locale, { weekday: "long", day: "numeric", month: "long" }).format(
      parseDateKey(key)
    );

  // ---------- Souvenirs (il y a 7 / 30 jours) ----------
  const memories = useMemo(() => {
    const today = getTodayKey();
    return [7, 30]
      .map((delta) => {
        const key = graceAddDays(today, -delta);
        const e = entries.find((x) => x.date === key);
        if (!e || e.gratitudes.length === 0) return null;
        return { delta, date: key, gratitudes: e.gratitudes };
      })
      .filter((m): m is { delta: number; date: string; gratitudes: string[] } => m !== null);
  }, [entries]);

  // ---------- Bilan factuel de la semaine ----------
  const review = useMemo(() => {
    const today = getTodayKey();
    const keys = new Set(Array.from({ length: 7 }, (_, i) => graceAddDays(today, -i)));
    const last7 = entries.filter((e) => keys.has(e.date));
    return {
      pauses: last7.length,
      thanks: last7.reduce((n, e) => n + e.gratitudes.length, 0),
      states: new Set(last7.map((e) => e.state)).size,
      stepsDone: last7.filter((e) => e.pasDone === true).length,
    };
  }, [entries]);

  // ---------- Calendrier du mois ----------
  const calendar = useMemo(() => {
    const today = getTodayKey();
    const [ty, tm] = today.split("-").map(Number);
    const base = new Date(ty, tm - 1 + calOffset, 1, 12);
    const y = base.getFullYear();
    const m = base.getMonth();
    const label = new Intl.DateTimeFormat(l.locale, { month: "long", year: "numeric" }).format(base);
    const first = new Date(y, m, 1);
    const mondayOffset = (first.getDay() + 6) % 7; // lundi = 0
    const start = new Date(y, m, 1 - mondayOffset, 12);
    const cells: { key: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ key, day: d.getDate(), inMonth: d.getMonth() === m });
    }
    return { label, cells, today };
  }, [calOffset, l.locale, entries.length]);
  const byDate = useMemo(() => new Map(entries.map((e) => [e.date, e])), [entries]);
  const dowHeaders =
    lang === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["L", "M", "M", "J", "V", "S", "D"];

  const progressPct = Math.round(((step + 1) / (LAST_STEP + 1)) * 100);
  const immersive = tab === "tonight" && !finished && step >= 1;

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6 md:max-w-6xl md:px-12 md:py-10">
      <style>{`
        @keyframes selah-breathe {
          0%, 100% { transform: scale(0.82); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes selah-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .selah-step { animation: selah-fade 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .selah-breathe { animation: none !important; }
          .selah-step { animation: none !important; }
        }
      `}</style>

      {/* Carte image du verset (hors écran, pour le partage) */}
      <div aria-hidden="true" className="pointer-events-none fixed left-[-9999px] top-0 h-0 overflow-hidden opacity-0">
        <div
          ref={cardRef}
          style={{
            width: 1080,
            padding: 96,
            background: "linear-gradient(135deg, #0b1026 0%, #1b2340 55%, #2b1a3a 100%)",
            color: "#f5efe4",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          <p style={{ fontSize: 56, lineHeight: 1.4 }}>« {rx?.texte ?? ""} »</p>
          <p style={{ marginTop: 40, fontSize: 40, fontWeight: 700, color: "#d4af37" }}>{rx?.ref ?? ""}</p>
          <p style={{ marginTop: 24, fontSize: 28, color: "#b9ac93" }}>Selah · LILOBA</p>
        </div>
      </div>

      <header className="mb-5 text-center md:mb-10 md:flex md:items-end md:justify-between md:border-b md:border-[var(--border)] md:pb-6 md:text-left">
        <div>
          {/* Titre avec la feuille à droite */}
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <h1
              className="text-2xl font-bold text-[var(--color-primary)] md:text-5xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {l.title}
            </h1>
            <span className="text-3xl md:text-4xl" aria-hidden="true">🌿</span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)] md:mt-2 md:text-lg md:font-light">{l.subtitle}</p>
          {!compact && (
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[var(--muted)] md:mx-0">
              {l.tagline}
            </p>
          )}
        </div>

        {/* Onglets */}
        <div className="mt-4 flex justify-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 md:mt-0 md:rounded-full md:p-2" role="tablist" aria-label={l.title}>
          {(["tonight", "path"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-[44px] min-w-0 rounded-lg px-4 py-2 text-sm font-medium transition-all md:rounded-full md:px-6 ${
                tab === id
                  ? "bg-[var(--color-accent)] text-white shadow-sm md:bg-[var(--color-accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {id === "tonight" ? l.tabTonight : l.tabPath}
              {id === "tonight" && evening === false && !finished && step === 0 && (
                <EveningLockIcon className="ml-1.5 inline h-3.5 w-3.5 align-[-2px]" />
              )}
              {id === "path" && stats.current > 0 ? ` · 🌿 ${stats.current}` : ""}
            </button>
          ))}
        </div>
      </header>

      {graceInfo.status === "grace" && graceInfo.hoursLeft !== null && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-center"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            🛡️ {l.graceBanner(graceInfo.hoursLeft)}
          </p>
        </div>
      )}

      {celebration !== null && (
        <div role="status" className="selah-step mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">{l.milestone(celebration)}</p>
          <button
            type="button"
            onClick={() => setCelebration(null)}
            className="mt-2 min-h-[44px] px-4 py-2 text-xs text-[var(--muted)] underline-offset-2 hover:underline"
          >
            OK
          </button>
        </div>
      )}

      <SelahCapsuleBanner
        lang={lang}
        onOpen={() => {
          setTab("path");
          setTimeout(() => {
            document.getElementById("selah-capsules")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }}
      />

      {/* Verrou du soir : avant 18h, chrono à la place de la pause (le parcours reste accessible) */}
      {tab === "tonight" && !finished && step === 0 && evening === false && (
        <SelahEveningGate
          lang={lang}
          compact={compact}
          streak={stats.current}
          onGoPath={() => setTab("path")}
        />
      )}

      {tab === "tonight" && !finished && !(step === 0 && evening !== true) && (
        <div className="flex flex-col gap-6 md:gap-10">
          {/* Belle barre de progression */}
          <div role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label={l.steps[step]} className="relative">
            {/* Mobile : Barre pleine */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)] md:hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: accent }}
              />
            </div>
            <ol className="mt-2 flex items-center justify-between gap-1 md:hidden" aria-label="Progression">
              {l.steps.map((label, i) => (
                <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      i === step ? "font-bold" : "text-[var(--muted)]"
                    }`}
                    style={i === step ? { color: accent } : undefined}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>

            {/* Desktop : Ligne traversante */}
            <div className="hidden md:flex items-center justify-between relative mt-2">
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[var(--border)] z-0" />
              {l.steps.map((label, i) => (
                <span key={label} className={`relative z-10 bg-[var(--background)] px-4 text-xs uppercase tracking-[0.2em] ${i === step ? "font-bold" : "text-[var(--muted)] font-medium"}`} style={i === step ? { color: accent } : undefined}>{label}</span>
              ))}
            </div>
          </div>

          {step === 0 && (
            <div className="selah-step flex flex-col gap-6 md:gap-10" key={`step0-${lang}`}>
              {/* Graine plantée dans la journée : on la récolte ce soir */}
              <SelahSeedHarvest lang={lang} />

              {yesterday && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 md:flex md:items-center md:justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                      {l.yesterday}
                    </p>
                    <p className="text-sm text-[var(--foreground)] md:text-base">{yesterday.pas}</p>
                  </div>
                  {yesterday.pasDone === true ? (
                    <p className="mt-2 text-xs font-medium text-green-600 md:mt-0 md:text-sm">✓ {l.yesterdayYes}</p>
                  ) : (
                    <div className="mt-3 flex gap-2 md:mt-0">
                      <button
                        type="button"
                        onClick={() => setPasDone(yesterday.id, true)}
                        className="min-h-[44px] rounded-xl bg-[var(--color-accent)] px-6 py-2 text-xs font-bold text-white transition-all hover:brightness-90 md:text-sm"
                      >
                        {l.yesterdayDone}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasDone(yesterday.id, false)}
                        className="min-h-[44px] rounded-xl border border-[var(--border)] px-6 py-2 text-xs font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)] md:text-sm"
                      >
                        {l.yesterdayNot}
                      </button>
                    </div>
                  )}
                </section>
              )}

              <section className="md:bg-transparent md:border-none md:p-0">
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mb-3 text-sm font-semibold text-[var(--foreground)] outline-none md:text-2xl md:mb-8">
                  {l.step0}
                </h2>
                
                {/* Boutons des états : Grid sur mobile, Flex sur desktop */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:gap-3" role="radiogroup" aria-label={l.step0}>
                  {SELAH_STATES.map((s, index) => {
                    const isLast = index === SELAH_STATES.length - 1;
                    const spanClass = isLast ? "col-span-2 sm:col-span-3 md:col-span-1" : "";
                    const Icon = STATE_ICONS[s.id];
                    const selected = etat === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setEtat(s.id)}
                        className={`${spanClass} flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm transition-all active:scale-95 md:flex-1 md:min-w-[140px] md:py-5 md:rounded-2xl ${
                          selected
                            ? "font-semibold text-white"
                            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)]/40 md:bg-[var(--surface)] md:hover:bg-[var(--surface-hover)] md:hover:border-[var(--color-accent)]"
                        }`}
                        style={
                          selected
                            ? { background: STATE_ACCENTS[s.id], borderColor: STATE_ACCENTS[s.id] }
                            : undefined
                        }
                      >
                        <span className="shrink-0">{Icon && <Icon />}</span>
                        <span className="truncate md:text-base">{lang === "en" ? s.en : s.fr}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input + Bouton : Empilés sur mobile, côte à côte sur desktop */}
                <div className="mt-4 md:mt-10 md:flex md:items-end md:gap-6 md:bg-[var(--surface)] md:p-6 md:rounded-3xl md:border md:border-[var(--border)]">
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-semibold text-[var(--foreground)] md:text-xs md:uppercase md:tracking-widest md:text-[var(--muted)] md:mb-3">
                      {l.topicLabel}
                    </p>
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={l.topicPh}
                      maxLength={140}
                      className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)] md:bg-transparent md:border-none md:p-0 md:text-xl md:placeholder:text-[var(--muted)]/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={begin}
                    disabled={!etat}
                    className="mt-4 min-h-[44px] w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40 md:mt-0 md:w-auto md:px-10 md:py-4 md:text-base"
                  >
                    {l.begin}
                  </button>
                </div>
                {/* TEXTE CONSERVÉ */}
                {!etat && (
                  <p className="mt-2 text-center text-[11px] text-[var(--muted)]">{l.startFirst}</p>
                )}
              </section>

              {/* TEXTE CONSERVÉ */}
              <p className="px-2 text-center text-[11px] leading-relaxed text-[var(--muted)]">
                {l.meaning}
              </p>
            </div>
          )}

          {step === 1 && rx && signals && (
            <div className="selah-step flex flex-col gap-4 md:gap-8" key={`step1-${rx.ref}`}>
              {/* Pause du soir immersive : fond nocturne en dégradé */}
              <div
                className="overflow-hidden rounded-3xl p-5 md:p-10"
                style={{
                  background: "linear-gradient(180deg, #0b1026 0%, #1b2340 55%, #3a2350 100%)",
                  color: "#f5efe4",
                }}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#d4af37" }}>
                  {l.verse}
                </p>
                <h2
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-semibold leading-relaxed outline-none md:text-3xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  « {rx.texte} »
                </h2>
                <p className="mt-3 text-base font-bold md:text-lg" style={{ color: accent === "var(--color-accent)" ? "#d4af37" : "#ffffff", background: etat ? STATE_ACCENTS[etat] : undefined, display: "inline-block", padding: "2px 12px", borderRadius: 999 }}>
                  {rx.ref}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {chapterLink ? (
                    <Link
                      href={chapterLink}
                      className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[#f5efe4] underline-offset-2 hover:underline md:text-sm"
                    >
                      {l.readChapter}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openInOtherPane("selah", "bible")}
                      className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[#f5efe4] underline-offset-2 hover:underline md:text-sm"
                    >
                      {l.openBible}
                    </button>
                  )}
                  {canAnother && (
                    <button
                      type="button"
                      onClick={anotherVerse}
                      className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[#cfc4ad] underline-offset-2 transition-colors hover:text-white hover:underline md:text-sm"
                    >
                      ↻ {l.another}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    {l.day}
                  </p>
                  <ul className="flex flex-col gap-1.5 text-sm md:text-base text-[var(--foreground)]">
                    <li>{signals.chapitres > 0 ? l.chapters(signals.chapitres) : l.noChapter}</li>
                    {signals.versets > 0 && <li>{l.verses(signals.versets)}</li>}
                    {signals.serie >= 2 && <li>{l.streakRead(signals.serie)}</li>}
                  </ul>
                </section>

                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    {l.meditation}
                  </p>
                  <p className="text-sm md:text-base leading-relaxed text-[var(--foreground)]">{rx.meditation}</p>
                  {topic.trim() && (
                    <p className="mt-2 border-l-2 pl-2 text-xs md:text-sm italic text-[var(--muted)]" style={{ borderColor: accent }}>
                      {topic.trim()}
                    </p>
                  )}
                </section>
              </div>
            </div>
          )}

          {step === 2 && (
            <section className="selah-step rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8 md:max-w-2xl md:mx-auto md:w-full" key={`step2-${lang}`}>
              <h2 ref={stepHeadingRef} tabIndex={-1} className="text-sm md:text-lg font-semibold text-[var(--foreground)] outline-none">
                {l.thanks}
              </h2>
              <p className="mb-3 md:mb-4 mt-1 text-xs md:text-sm text-[var(--muted)]">{l.thanksHint}</p>
              <div className="flex flex-col gap-2 md:gap-3">
                {gratitudes.map((g, i) => (
                  <input
                    key={i}
                    value={g}
                    aria-label={l.thanksPh[i]}
                    onChange={(e) =>
                      setGratitudes((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    placeholder={l.thanksPh[i]}
                    maxLength={120}
                    className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 md:px-4 md:py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
                  />
                ))}
              </div>
            </section>
          )}

          {step === 3 && rx && (
            <div className="selah-step flex flex-col gap-4 md:gap-8 md:max-w-4xl md:mx-auto md:w-full" key={`step3-${duration}-${lang}`}>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.prayerReceived}
                </p>
                <p
                  className="text-base md:text-lg italic leading-relaxed text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {rx.priere}
                </p>
              </section>

              {/* Prière immersive */}
              <section
                className="overflow-hidden rounded-3xl p-5 md:p-10 text-center"
                aria-label={l.prayer}
                style={{
                  background: "linear-gradient(180deg, #0b1026 0%, #1b2340 55%, #3a2350 100%)",
                  color: "#f5efe4",
                }}
              >
                <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xs md:text-sm font-bold uppercase tracking-widest outline-none" style={{ color: "#d4af37" }}>
                  {l.prayer} · {formatPrayerCountdown(timing.totalSeconds)}
                </h2>

                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-[#cfc4ad] md:hidden">
                  {l.durationLabel}
                </p>
                <div className="grid grid-cols-3 gap-2 md:flex md:justify-center md:gap-4" role="radiogroup" aria-label={l.durationLabel}>
                  {(["courte", "moyenne", "profonde"] as PrayerDuration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={duration === d}
                      onClick={() => setPrayerDuration(d)}
                      className={`min-h-[44px] rounded-xl border px-2 py-2.5 text-xs md:text-sm font-bold transition-all md:px-8 md:py-3 ${
                        duration === d ? "text-white" : "text-[#cfc4ad]"
                      }`}
                      style={
                        duration === d
                          ? { background: accent, borderColor: accent }
                          : { borderColor: "#ffffff33", background: "#ffffff10" }
                      }
                    >
                      {d === "courte" ? l.durationCourte : d === "moyenne" ? l.durationMoyenne : l.durationProfonde}
                    </button>
                  ))}
                </div>

                {/* Halo qui respire autour du chrono */}
                <div className="relative mx-auto my-5 md:my-8 flex h-40 w-40 md:h-56 md:w-56 items-center justify-center" aria-live="polite">
                  <div
                    className="selah-breathe absolute inset-0 rounded-full"
                    aria-hidden="true"
                    style={{
                      background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
                      animation:
                        phase === "running" && !reducedMotion
                          ? "selah-breathe 8s ease-in-out infinite"
                          : undefined,
                    }}
                  />
                  <div
                    className="absolute inset-4 md:inset-6 rounded-full border"
                    aria-hidden="true"
                    style={{ borderColor: `${accent}88` }}
                  />
                  <span className="relative text-3xl md:text-5xl font-semibold tabular-nums">
                    {phase === "done" ? "✓" : formatPrayerCountdown(remainingSec)}
                  </span>
                </div>

                {/* Progression de la prière */}
                <div className="mx-auto mb-4 md:mb-6 h-1.5 w-full max-w-xs md:max-w-md overflow-hidden rounded-full bg-[#ffffff22]" role="progressbar" aria-valuenow={Math.round((elapsedMs / schedule.totalMs) * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (elapsedMs / schedule.totalMs) * 100)}%`, background: accent }}
                  />
                </div>

                {/* Lignes de la prière, ligne en cours mise en valeur */}
                <div className="mx-auto flex max-w-md md:max-w-2xl flex-col gap-1.5 md:gap-2 text-left">
                  {prayerLines.map((line, i) => {
                    const active = phase !== "idle" && i === lineIdx;
                    const said = phase !== "idle" && i < lineIdx;
                    return (
                      <p
                        key={i}
                        aria-current={active ? "true" : undefined}
                        className="rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base leading-relaxed transition-all"
                        style={{
                          fontFamily: "var(--font-serif)",
                          background: active ? "#ffffff18" : undefined,
                          borderLeft: active ? `3px solid ${typeof accent === "string" ? accent : "#d4af37"}` : "3px solid transparent",
                          color: active ? "#ffffff" : said ? "#8f846e" : "#cfc4ad",
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
                {inSilence && phase !== "done" && (
                  <p className="mt-3 text-sm italic text-[#cfc4ad]">{l.prayerSilence}</p>
                )}
                {phase === "done" && (
                  <p className="mt-3 text-sm font-semibold" style={{ color: "#d4af37" }}>{l.prayerDone}</p>
                )}

                <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={startPrayer}
                      className="min-h-[44px] rounded-xl px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold text-white transition-all hover:brightness-110"
                      style={{ background: accent }}
                    >
                      {l.prayerStart}
                    </button>
                  )}
                  {phase === "running" && (
                    <>
                      <button
                        type="button"
                        onClick={pausePrayer}
                        className="min-h-[44px] rounded-xl border border-[#ffffff44] px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-bold text-white transition-all hover:bg-[#ffffff18]"
                      >
                        {l.prayerPause}
                      </button>
                      <button
                        type="button"
                        onClick={skipLine}
                        className="min-h-[44px] rounded-xl px-4 py-2.5 md:text-base text-sm text-[#cfc4ad] underline-offset-2 hover:underline"
                      >
                        {l.prayerSkip} →
                      </button>
                    </>
                  )}
                  {phase === "paused" && (
                    <>
                      <button
                        type="button"
                        onClick={resumePrayer}
                        className="min-h-[44px] rounded-xl px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold text-white transition-all hover:brightness-110"
                        style={{ background: accent }}
                      >
                        {l.prayerResume}
                      </button>
                      <button
                        type="button"
                        onClick={skipLine}
                        className="min-h-[44px] rounded-xl px-4 py-2.5 md:text-base text-sm text-[#cfc4ad] underline-offset-2 hover:underline"
                      >
                        {l.prayerSkip} →
                      </button>
                    </>
                  )}
                  {phase === "done" && (
                    <button
                      type="button"
                      onClick={restartPrayer}
                      className="min-h-[44px] rounded-xl border border-[#ffffff44] px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-bold text-white transition-all hover:bg-[#ffffff18]"
                    >
                      ↻ {l.prayerRestart}
                    </button>
                  )}
                  {(phase === "running" || phase === "paused") && (
                    <button
                      type="button"
                      onClick={() => setPrayerFocus(true)}
                      className="min-h-[44px] rounded-xl border border-[#ffffff44] px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-semibold text-[#cfc4ad] transition-all hover:text-white"
                    >
                      ⛶ {l.prayerFullscreen}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {speechAvailable ? (
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs md:text-sm text-[#cfc4ad]">
                      <input
                        type="checkbox"
                        checked={speechOn}
                        onChange={(e) => {
                          const on = e.target.checked;
                          speechOnRef.current = on;
                          setReadAloud(on);
                          if (!on) {
                            stopSpeech();
                            voiceLineRef.current = -1;
                          } else if (phase === "running") {
                            // activée en pleine prière : la voix rejoint la phrase affichée
                            speakFrom(lineIdx);
                          }
                        }}
                        className="h-5 w-5 accent-[#d4af37]"
                      />
                      🔊 {l.readAloud}
                    </label>
                  ) : (
                    <p className="text-[11px] md:text-xs text-[#8f846e]">{l.readAloudOff}</p>
                  )}
                </div>

                {/* Ambiance sonore vivante + guide de souffle */}
                <SelahSoundscape
                  phase={phase}
                  etat={etat}
                  lang={lang}
                  ambientOn={prefs.ambient}
                  breathOn={prefs.breath}
                  accent={accent}
                />
              </section>

              {/* Plein écran sans distraction pendant la prière */}
              {prayerFocus && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label={l.prayer}
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto p-6"
                  style={{ background: "linear-gradient(180deg, #070b1d 0%, #141b36 60%, #2b1a3a 100%)", color: "#f5efe4" }}
                >
                  <button
                    type="button"
                    onClick={() => setPrayerFocus(false)}
                    autoFocus
                    className="absolute right-4 top-4 md:right-10 md:top-10 min-h-[44px] min-w-[44px] rounded-full border border-[#ffffff55] px-4 py-2 text-sm font-bold text-white"
                  >
                    ✕ {l.prayerExitFullscreen}
                  </button>
                  <p className="text-5xl md:text-7xl font-semibold tabular-nums" aria-live="polite">
                    {phase === "done" ? "✓" : formatPrayerCountdown(remainingSec)}
                  </p>
                  <p
                    className="mt-6 md:mt-8 max-w-md md:max-w-2xl text-center text-2xl md:text-4xl italic leading-relaxed"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {phase === "done"
                      ? l.prayerDone
                      : inSilence
                        ? l.prayerSilence
                        : (prayerLines[lineIdx] ?? "")}
                  </p>
                  {prefs.breath && (phase === "running" || phase === "paused") && (
                    <div className="mt-6">
                      <SelahBreathRing active={phase === "running"} lang={lang} accent={accent} drive={false} size={150} />
                    </div>
                  )}
                  <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
                    {phase === "running" && (
                      <button type="button" onClick={pausePrayer} className="min-h-[44px] rounded-xl border border-[#ffffff55] px-6 py-3 md:px-8 text-sm md:text-base font-bold text-white">
                        {l.prayerPause}
                      </button>
                    )}
                    {phase === "paused" && (
                      <button type="button" onClick={resumePrayer} className="min-h-[44px] rounded-xl bg-white px-6 py-3 md:px-8 text-sm md:text-base font-bold text-black">
                        {l.prayerResume}
                      </button>
                    )}
                    {(phase === "running" || phase === "paused") && (
                      <button type="button" onClick={skipLine} className="min-h-[44px] rounded-xl px-4 py-3 md:px-6 text-sm md:text-base text-[#cfc4ad] underline-offset-2 hover:underline">
                        {l.prayerSkip} →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && rx && (
            <div className="selah-step flex flex-col gap-4 md:gap-6 md:max-w-2xl md:mx-auto md:w-full" key={`step4-${lang}`}>
              <section className="rounded-2xl border p-4 md:p-6" style={{ borderColor: `${accent}66`, background: "color-mix(in srgb, var(--surface) 85%, transparent)" }}>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                  {l.pas}
                </p>
                <p className="text-base md:text-lg font-medium leading-relaxed text-[var(--foreground)]">
                  {rx.pas}
                </p>
              </section>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                <label
                  htmlFor="selah-note"
                  className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--muted)]"
                >
                  {l.noteLabel}
                </label>
                <textarea
                  id="selah-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder={l.notePh}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 md:px-4 md:py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
                />
                <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
                  {note.length}/280
                </p>
              </section>
            </div>
          )}

          {step > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-2 md:flex md:justify-center md:gap-4 md:mt-4">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:px-10 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
              >
                {l.back}
              </button>
              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(LAST_STEP, s + 1))}
                  className="min-h-[44px] rounded-xl bg-[var(--color-accent)] py-3 md:px-10 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99]"
                >
                  {step === 2 && gratitudes.every((g) => !g.trim()) ? l.skip : l.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="min-h-[44px] rounded-xl bg-[var(--color-accent)] py-3 md:px-10 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99]"
                >
                  {l.finish}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "tonight" && finished && rx && (
        <div className="flex flex-col gap-4 md:gap-6 md:max-w-3xl md:mx-auto md:w-full">
          <section className="rounded-2xl border p-5 md:p-10 text-center" style={{ borderColor: `${accent}66` }}>
            <p className="text-3xl md:text-5xl" aria-hidden="true">
              🌿
            </p>
            <h2
              className="mt-1 md:mt-3 text-xl md:text-3xl font-bold text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {l.doneTitle}
            </h2>
            <p className="mt-2 md:mt-4 text-sm md:text-base text-[var(--foreground)]">{l.doneText}</p>
            <p className="mt-3 md:mt-5 text-sm md:text-lg font-semibold text-[var(--color-accent)]">
              {stats.current} {stats.current === 1 ? l.streakOne : l.streak}
            </p>
          </section>

          {story && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 md:flex md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.storyTitle}
                </p>
                <div className="flex items-center gap-3 md:gap-4">
                  <span
                    className={`flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-3xl md:text-4xl ${story.gradient}`}
                    aria-hidden="true"
                  >
                    {story.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-lg font-bold leading-snug text-[var(--foreground)]">
                      {story.title}
                    </p>
                    <p className="mt-0.5 md:mt-1 text-[11px] md:text-sm text-[var(--muted)]">
                      {story.theme} · ⏱ {story.durationMin} min
                    </p>
                  </div>
                </div>
              </div>
              {compact ? (
                <button
                  type="button"
                  onClick={() => openStoryInOtherPane(story.slug)}
                  className="mt-3 md:mt-0 min-h-[44px] w-full md:w-auto rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
                >
                  {l.storyRead}
                </button>
              ) : (
                <Link
                  href={`/histoires/${story.slug}`}
                  className="mt-3 md:mt-0 block w-full md:w-auto rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-center text-sm font-bold text-white transition-all hover:brightness-90"
                >
                  {l.storyRead}
                </Link>
              )}
            </section>
          )}

          {/* Graine pour demain : revient demain soir à l'ouverture de Selah */}
          <SelahSeedPlanter lang={lang} tomorrow />

          <SelahReminderCard lang={lang} variant="compact" />

          <SelahCapsules lang={lang} entries={entries} variant="composer" verseRef={rx.ref} state={etat ?? undefined} />

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <button
              type="button"
              onClick={shareText}
              className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 md:text-base text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
            >
              {copied ? l.copied : l.shareText}
            </button>
            <button
              type="button"
              onClick={shareImage}
              disabled={sharing}
              className="min-h-[44px] rounded-xl bg-[var(--color-accent)] py-3 md:text-base text-sm font-bold text-white transition-all hover:brightness-90 disabled:opacity-50"
            >
              {sharing ? l.sharing : `🖼️ ${l.shareImage}`}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setTab("path")}
            className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 md:mt-2 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
          >
            {l.seePath}
          </button>

          <button
            type="button"
            onClick={goApollos}
            className="min-h-[44px] rounded-xl border border-dashed border-[var(--color-accent)]/60 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5"
          >
            {l.apollos}
          </button>
          {apollosMsg && (
            <p className="text-center text-xs text-[var(--muted)]">{l.apollosCopied}</p>
          )}

          <button
            type="button"
            onClick={restart}
            className="mx-auto mt-2 flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-xs font-medium text-[var(--muted)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {l.again}
          </button>
        </div>
      )}

      {tab === "path" && (
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 md:items-start">
          {entries.length === 0 && capsules.length > 0 && (
            <div className="md:col-span-2">
              <SelahCapsules lang={lang} entries={entries} variant="full" />
            </div>
          )}
          {entries.length === 0 ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-8 text-center md:col-span-2">
              <p className="text-sm md:text-base leading-relaxed text-[var(--muted)]">{l.emptyPath}</p>
              <button
                type="button"
                onClick={() => setTab("tonight")}
                className="mt-4 md:mt-6 min-h-[44px] rounded-xl bg-[var(--color-accent)] px-5 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold text-white transition-all hover:brightness-90"
              >
                {l.tabTonight}
              </button>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-3 gap-2 md:col-span-2 md:gap-6" aria-label={l.tabPath}>
                <div className="min-w-0 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-3 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[var(--color-accent)]">
                    🌿 {stats.current}
                  </p>
                  <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs uppercase tracking-wide text-[var(--muted)]">
                    {stats.current === 1 ? l.streakOne : l.streak}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{stats.longest}</p>
                  <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs uppercase tracking-wide text-[var(--muted)]">
                    {l.best}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{stats.total}</p>
                  <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs uppercase tracking-wide text-[var(--muted)]">
                    {l.total}
                  </p>
                </div>
              </section>

              <div className="md:col-span-2">
                <SelahConstellation
                  entries={entries}
                  shields={shields}
                  topics={topics}
                  today={getTodayKey()}
                  streak={stats.current}
                  lang={lang}
                />
              </div>

              <div className="md:col-span-2">
                <SelahCapsules lang={lang} entries={entries} variant="full" />
              </div>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.week}
                </p>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {week.map((d) => (
                    <div key={d.date} className="flex min-w-0 flex-col items-center gap-1 md:gap-2">
                      <span
                        className={`flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full border text-base md:text-lg ${
                          d.entry
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : d.grace
                              ? "border-amber-500/60 bg-amber-500/10"
                              : d.isToday
                                ? "border-dashed border-[var(--color-accent)]/60"
                                : "border-[var(--border)]"
                        }`}
                        title={d.grace ? l.graceShield : undefined}
                      >
                        {d.entry ? "🌿" : d.grace ? "🛡️" : ""}
                      </span>
                      <span
                        className={`text-[10px] md:text-xs uppercase ${
                          d.isToday ? "font-bold text-[var(--color-accent)]" : "text-[var(--muted)]"
                        }`}
                      >
                        {d.weekday}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Calendrier du mois */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCalOffset((o) => o - 1)}
                    aria-label={l.prevMonth}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]"
                  >
                    ‹
                  </button>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    {l.calendar} · <span className="capitalize">{calendar.label}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setCalOffset((o) => Math.min(0, o + 1))}
                    aria-label={l.nextMonth}
                    disabled={calOffset >= 0}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)] disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
                <p className="mb-3 text-center text-[11px] md:text-xs text-[var(--muted)]">{l.calendarHint}</p>
                <div className="grid grid-cols-7 gap-1 md:gap-2" role="grid" aria-label={calendar.label}>
                  {dowHeaders.map((d, i) => (
                    <span key={i} className="pb-1 text-center text-[10px] md:text-xs font-bold uppercase text-[var(--muted)]">
                      {d}
                    </span>
                  ))}
                  {calendar.cells.map((c) => {
                    const has = byDate.has(c.key);
                    const shield = !has && shields.includes(c.key);
                    const isToday = c.key === calendar.today;
                    return (
                      <span
                        key={c.key}
                        role="gridcell"
                        className={`flex h-9 md:h-11 w-full items-center justify-center rounded-lg border text-xs md:text-sm ${
                          !c.inMonth
                            ? "border-transparent opacity-30"
                            : has
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-bold"
                              : shield
                                ? "border-amber-500/60 bg-amber-500/10"
                                : isToday
                                  ? "border-dashed border-[var(--color-accent)]/60"
                                  : "border-[var(--border)]"
                        } ${isToday ? "ring-1 ring-[var(--color-accent)]" : ""} text-[var(--foreground)]`}
                        title={shield ? l.graceShield : undefined}
                      >
                        {has ? "🌿" : shield ? "🛡️" : c.day}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* Bilan factuel de la semaine */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
                <p className="mb-2 md:mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.reviewTitle}
                </p>
                <ul className="flex flex-col gap-1 md:gap-2 text-sm md:text-base text-[var(--foreground)]">
                  <li>· {l.reviewPauses(review.pauses)}</li>
                  <li>· {l.reviewThanks(review.thanks)}</li>
                  <li>· {l.reviewStates(review.states)}</li>
                  <li>· {l.reviewSteps(review.stepsDone)}</li>
                </ul>
              </section>

              {/* Souvenirs */}
              {memories.length > 0 && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 md:col-span-2">
                  <p className="mb-2 md:mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    🕰️ {l.memoriesTitle}
                  </p>
                  <ul className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-6">
                    {memories.map((m) => (
                      <li key={m.delta} className="text-sm md:text-base text-[var(--foreground)]">
                        <p className="text-xs md:text-sm italic text-[var(--muted)]">{l.memoryDays(m.delta)}</p>
                        <ul className="mt-1 md:mt-2 flex flex-col gap-0.5 md:gap-1">
                          {m.gratitudes.map((g, i) => (
                            <li key={i} className="break-words">• {g}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Sujets de prière suivis */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  🙏 {l.topicsTitle}
                </p>
                <p className="mt-0.5 md:mt-1 text-[11px] md:text-sm text-[var(--muted)]">{l.topicsHint}</p>
                <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 md:gap-3">
                  <input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTopic.trim()) {
                        addPrayerTopic(newTopic.trim(), getTodayKey());
                        setNewTopic("");
                      }
                    }}
                    placeholder={l.topicsPh}
                    maxLength={140}
                    aria-label={l.topicsPh}
                    className="w-full flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 md:px-4 md:py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTopic.trim()) {
                        addPrayerTopic(newTopic.trim(), getTodayKey());
                        setNewTopic("");
                      }
                    }}
                    className="min-h-[44px] rounded-xl bg-[var(--color-accent)] px-4 py-2.5 md:px-6 md:py-3 text-sm font-bold text-white hover:brightness-90"
                  >
                    {l.topicsAdd}
                  </button>
                </div>
                {topics.length === 0 ? (
                  <p className="mt-3 md:mt-4 text-xs md:text-sm text-[var(--muted)]">{l.topicsEmpty}</p>
                ) : (
                  <ul className="mt-3 md:mt-4 flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-3">
                    {topics.slice(0, 20).map((t) => (
                      <li
                        key={t.id}
                        className="flex min-w-0 items-center gap-2 md:gap-3 rounded-xl border border-[var(--border)] px-3 py-2 md:p-3"
                      >
                        <button
                          type="button"
                          onClick={() => toggleTopicAnswered(t.id)}
                          aria-pressed={Boolean(t.answeredAt)}
                          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-base ${
                            t.answeredAt
                              ? "border-green-600 bg-green-600/10"
                              : "border-[var(--border)]"
                          }`}
                          title={t.answeredAt ? l.topicsAnswered : l.topicsNotYet}
                        >
                          {t.answeredAt ? "✅" : "○"}
                        </button>
                        <span
                          className={`min-w-0 flex-1 break-words text-sm md:text-base ${
                            t.answeredAt ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"
                          }`}
                        >
                          {t.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => deletePrayerTopic(t.id)}
                          aria-label={l.remove}
                          className="shrink-0 px-2 py-2 text-[11px] md:text-xs text-[var(--muted)] underline-offset-2 hover:underline"
                        >
                          {l.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {wall.length > 0 && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    🙏 {l.wall}
                  </p>
                  <p className="mt-0.5 md:mt-1 text-[11px] md:text-sm text-[var(--muted)]">{l.wallHint}</p>
                  <ul className="mt-3 md:mt-4 flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-3">
                    {wall.map((w, i) => (
                      <li
                        key={`${w.id}-${i}`}
                        className="flex min-w-0 items-baseline gap-2 text-sm md:text-base text-[var(--foreground)]"
                      >
                        <span className="shrink-0 text-[10px] md:text-xs uppercase text-[var(--muted)]">
                          {fmtShort(w.date)}
                        </span>
                        <span className="min-w-0 break-words">{w.g}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="flex flex-col gap-3 md:gap-4 md:col-span-2">
                <p className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.recent}
                </p>
                <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-4">
                  {entries.slice(0, 30).map((e) => {
                    const m = getStateMeta(e.state);
                    const href = compact ? null : chapterHref(e.ref);
                    return (
                      <article
                        key={e.id}
                        className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm capitalize text-[var(--muted)]">{fmtDate(e.date)}</p>
                            <p className="mt-0.5 md:mt-1 text-sm md:text-base font-semibold text-[var(--foreground)]">
                              {lang === "en" ? m.en : m.fr}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(l.confirmRemove)) deleteSelahEntry(e.id);
                            }}
                            className="shrink-0 px-2 py-2 text-[11px] md:text-xs text-[var(--muted)] underline-offset-2 hover:underline"
                          >
                            {l.remove}
                          </button>
                        </div>

                        {e.ref &&
                          (href ? (
                            <Link
                              href={href}
                              className="mt-2 inline-block min-h-[44px] text-sm md:text-base font-bold text-[var(--color-accent)] underline-offset-2 hover:underline"
                            >
                              {e.ref}
                            </Link>
                          ) : (
                            <p className="mt-2 text-sm md:text-base font-bold text-[var(--color-accent)]">{e.ref}</p>
                          ))}

                        {e.gratitudes.length > 0 && (
                          <div className="mt-2 md:mt-3">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                              {l.thanksFor}
                            </p>
                            <ul className="mt-1 flex flex-col gap-0.5 md:gap-1 text-sm md:text-base text-[var(--foreground)]">
                              {e.gratitudes.map((g, i) => (
                                <li key={i} className="break-words">
                                  • {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {e.topic && (
                          <p className="mt-2 break-words text-xs md:text-sm italic text-[var(--muted)]">
                            {l.prayerFor} : {e.topic}
                          </p>
                        )}

                        {e.note && (
                          <p className="mt-2 break-words border-l-2 border-[var(--color-accent)] pl-2 text-xs md:text-sm text-[var(--foreground)]">
                            <span className="font-semibold">{l.noteFor} : </span>
                            {e.note}
                          </p>
                        )}

                        {e.pas && (
                          <p className="mt-2 break-words text-xs md:text-sm text-[var(--muted)]">
                            {e.pas}{" "}
                            <span
                              className={
                                e.pasDone === true ? "font-semibold text-green-600" : "text-[var(--muted)]"
                              }
                            >
                              {e.pasDone === true ? `· ✓ ${l.stepDone}` : ""}
                            </span>
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <button
                type="button"
                onClick={() => {
                  if (confirm(l.confirmClear)) clearSelah();
                }}
                className="min-h-[44px] py-2 text-center text-xs md:text-sm text-red-500 underline-offset-2 hover:underline md:col-span-2 mt-4"
              >
                {l.clearAll}
              </button>
            </>
          )}
        </div>
      )}
      {immersive && <span className="sr-only">{l.subtitle}</span>}
    </div>
  );
}
