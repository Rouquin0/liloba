"use client";

// ============================================================
// LILOBA — SELAH · ta pause du soir avec la Parole
// ============================================================
// Un temps guidé en 5 étapes, 100 % hors ligne :
//   1. Cœur    → comment vas-tu ce soir ?
//   2. Parole  → un verset (LSG) + une courte méditation
//   3. Merci   → jusqu'à 3 motifs de reconnaissance
//   4. Prière  → une prière + une minute de silence
//   5. Demain  → un pas concret, puis enregistrement
// + « Mon parcours » : série de jours, semaine, journal de gratitude.
// Aucune donnée ne quitte le téléphone.
// ============================================================

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { addJournalEntry } from "@/lib/journal";
import { SELAH_STATES } from "@/lib/selah-content";
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

// ------------------------------------------------------------
// TEXTES
// ------------------------------------------------------------

const UI = {
  fr: {
    title: "Selah",
    subtitle: "Ta pause du soir avec la Parole",
    tagline:
      "Quelques minutes pour t'arrêter, lire un verset, remercier Dieu et préparer demain. Tout reste sur ton téléphone.",
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
    next: "Suivant",
    back: "Retour",
    thanks: "Pour quoi remercies-tu Dieu aujourd'hui ?",
    thanksHint: "Trois choses, même toutes petites. Tu peux passer cette étape.",
    thanksPh: ["Merci Seigneur pour…", "Merci aussi pour…", "Et merci pour…"],
    prayer: "Prière pour ce soir",
    silence: "Une minute de silence devant Dieu",
    silenceStart: "Commencer",
    silenceRunning: "Respire doucement. Dieu est présent.",
    silenceDone: "Amen.",
    skip: "Passer",
    pas: "Ton pas pour demain",
    finish: "Terminer ma pause",
    doneTitle: "Pause enregistrée",
    doneText: "Tu as pris un temps avec Dieu ce soir. Reviens demain. 🌿",
    share: "Partager",
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
    confirmRemove: "Supprimer cette pause ?",
    clearAll: "Effacer tout mon parcours",
    confirmClear: "Effacer tout ton parcours Selah ? Cette action est irréversible.",
    startFirst: "Commence par choisir ton état ci-dessus.",
    chapters: (n: number) => `📖 ${n} chapitre${n > 1 ? "s" : ""} lu${n > 1 ? "s" : ""} ces dernières 24 h`,
    noChapter: "📖 Pas encore de lecture aujourd'hui : un chapitre avant de dormir ?",
    verses: (n: number) => `✦ ${n} verset${n > 1 ? "s" : ""} gardé${n > 1 ? "s" : ""} aujourd'hui`,
    streakRead: (n: number) => `🔥 ${n} jours de lecture de suite`,
    locale: "fr-FR",
    journalLabel: "Selah",
  },
  en: {
    title: "Selah",
    subtitle: "Your evening pause with the Word",
    tagline:
      "A few minutes to stop, read a verse, thank God and prepare for tomorrow. Everything stays on your phone.",
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
    next: "Next",
    back: "Back",
    thanks: "What are you thankful to God for today?",
    thanksHint: "Three things, even tiny ones. You can skip this step.",
    thanksPh: ["Thank you Lord for…", "Thank you also for…", "And thank you for…"],
    prayer: "Prayer for tonight",
    silence: "One minute of silence before God",
    silenceStart: "Begin",
    silenceRunning: "Breathe gently. God is present.",
    silenceDone: "Amen.",
    skip: "Skip",
    pas: "Your step for tomorrow",
    finish: "Finish my pause",
    doneTitle: "Pause saved",
    doneText: "You spent time with God tonight. Come back tomorrow. 🌿",
    share: "Share",
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
    confirmRemove: "Delete this pause?",
    clearAll: "Erase my whole journey",
    confirmClear: "Erase your whole Selah journey? This cannot be undone.",
    startFirst: "Start by choosing your state above.",
    chapters: (n: number) => `📖 ${n} chapter${n > 1 ? "s" : ""} read in the last 24h`,
    noChapter: "📖 No reading yet today: a chapter before bed?",
    verses: (n: number) => `✦ ${n} verse${n > 1 ? "s" : ""} kept today`,
    streakRead: (n: number) => `🔥 ${n}-day reading streak`,
    locale: "en-US",
    journalLabel: "Selah",
  },
};

type Tab = "tonight" | "path";
type Silence = "idle" | "running" | "done";

const SILENCE_SECONDS = 60;
const LAST_STEP = 4;

// ------------------------------------------------------------
// COMPOSANT
// ------------------------------------------------------------

export default function SelahTab() {
  const { lang } = useAppLanguage();
  const l = lang === "en" ? UI.en : UI.fr;
  const router = useRouter();

  const entries = useSyncExternalStore(subscribeSelah, getSelahEntries, getServerSelahEntries);
  const stats = useMemo(() => computeSelahStats(entries), [entries]);
  const week = useMemo(() => lastDays(entries, 7, l.locale), [entries, l.locale]);
  const yesterday = useMemo(() => previousPas(entries), [entries]);

  const [tab, setTab] = useState<Tab>("tonight");
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const [etat, setEtat] = useState<SoulState | null>(null);
  const [topic, setTopic] = useState("");
  const [rx, setRx] = useState<Prescription | null>(null);
  const [signals, setSignals] = useState<DaySignals | null>(null);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);

  const [silence, setSilence] = useState<Silence>("idle");
  const [secondsLeft, setSecondsLeft] = useState(SILENCE_SECONDS);
  const endAtRef = useRef(0);

  const [copied, setCopied] = useState(false);
  const [apollosMsg, setApollosMsg] = useState(false);

  const meta = etat ? getStateMeta(etat) : null;

  // ---- Minute de silence : basée sur l'heure réelle (fiable même si l'onglet ralentit)
  useEffect(() => {
    if (silence !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(id);
        setSilence("done");
      }
    }, 250);
    return () => clearInterval(id);
  }, [silence]);

  // ---- Actions
  const begin = () => {
    if (!etat) return;
    setRx(pickPrescription(etat, entries));
    setSignals(readDaySignals());
    setGratitudes(["", "", ""]);
    setSilence("idle");
    setSecondsLeft(SILENCE_SECONDS);
    setCopied(false);
    setApollosMsg(false);
    setStep(1);
  };

  const startSilence = () => {
    endAtRef.current = Date.now() + SILENCE_SECONDS * 1000;
    setSecondsLeft(SILENCE_SECONDS);
    setSilence("running");
  };

  const skipSilence = () => setSilence("done");

  const finish = () => {
    if (!rx || !meta || !etat) return;
    saveSelahEntry({
      state: etat,
      ref: rx.ref,
      topic,
      gratitudes,
      pas: rx.pas,
    });
    // Trace aussi dans le journal spirituel (Carnet)
    const merci = gratitudes.map((g) => g.trim()).filter(Boolean);
    addJournalEntry("private_note_added", `${l.journalLabel} — ${meta.fr}`, {
      detail: `${rx.ref} · ${rx.texte} | Pas : ${rx.pas}${
        topic.trim() ? ` | Sujet de prière : ${topic.trim()}` : ""
      }${merci.length ? ` | Merci : ${merci.join(" ; ")}` : ""}`,
      reference: rx.ref,
    });
    setFinished(true);
  };

  const restart = () => {
    setFinished(false);
    setStep(0);
    setEtat(null);
    setTopic("");
    setRx(null);
    setSignals(null);
    setGratitudes(["", "", ""]);
    setSilence("idle");
  };

  const share = async () => {
    if (!rx) return;
    const text = `${l.verse} : ${rx.ref}\n« ${rx.texte} »\n\n${l.pas} : ${rx.pas}\n— Selah · LILOBA`;
    try {
      if (navigator.share) {
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
    setTimeout(() => router.push("/chat"), 1200);
  };

  const chapterLink = rx ? chapterHref(rx.ref) : null;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const fmtDate = (key: string) =>
    new Intl.DateTimeFormat(l.locale, { weekday: "long", day: "numeric", month: "long" }).format(
      parseDateKey(key)
    );

  // ----------------------------------------------------------
  // RENDU
  // ----------------------------------------------------------

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6 md:px-6">
      <style>{`
        @keyframes selah-breathe {
          0%, 100% { transform: scale(0.82); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .selah-breathe { animation: none !important; }
        }
      `}</style>

      {/* ---------- En-tête ---------- */}
      <header className="mb-5 text-center">
        <p className="text-3xl" aria-hidden="true">
          🌿
        </p>
        <h1
          className="mt-1 text-2xl font-bold text-[var(--color-primary)] md:text-3xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {l.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{l.subtitle}</p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[var(--muted)]">
          {l.tagline}
        </p>
      </header>

      {/* ---------- Onglets ---------- */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {(["tonight", "path"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-w-0 rounded-lg px-2 py-2 text-sm font-medium transition-all ${
              tab === id
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {id === "tonight" ? l.tabTonight : l.tabPath}
            {id === "path" && stats.current > 0 ? ` · 🌿 ${stats.current}` : ""}
          </button>
        ))}
      </div>

      {/* ====================== CE SOIR ====================== */}
      {tab === "tonight" && !finished && (
        <div className="flex flex-col gap-4">
          {/* Progression */}
          <ol className="flex items-center justify-between gap-1 px-1" aria-label="Progression">
            {l.steps.map((label, i) => (
              <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    i <= step ? "bg-[var(--color-accent)]" : "bg-[var(--surface-hover)]"
                  }`}
                />
                <span
                  className={`truncate text-[10px] uppercase tracking-wide ${
                    i === step ? "font-bold text-[var(--color-accent)]" : "text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {/* ----- Étape 0 : Cœur ----- */}
          {step === 0 && (
            <>
              {yesterday && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    {l.yesterday}
                  </p>
                  <p className="text-sm text-[var(--foreground)]">🎯 {yesterday.pas}</p>
                  {yesterday.pasDone === true ? (
                    <p className="mt-2 text-xs font-medium text-green-600">✓ {l.yesterdayYes}</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPasDone(yesterday.id, true)}
                        className="rounded-xl bg-[var(--color-accent)] py-2 text-xs font-bold text-white transition-all hover:brightness-90"
                      >
                        {l.yesterdayDone}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasDone(yesterday.id, false)}
                        className="rounded-xl border border-[var(--border)] py-2 text-xs font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)]"
                      >
                        {l.yesterdayNot}
                      </button>
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">{l.step0}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SELAH_STATES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEtat(s.id)}
                      className={`min-w-0 rounded-xl border px-3 py-3 text-sm transition-all active:scale-95 ${
                        etat === s.id
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold text-[var(--color-accent)]"
                          : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)]/40"
                      }`}
                    >
                      <span className="mr-1" aria-hidden="true">
                        {s.emoji}
                      </span>
                      {lang === "en" ? s.en : s.fr}
                    </button>
                  ))}
                </div>

                <p className="mb-2 mt-5 text-sm font-semibold text-[var(--foreground)]">
                  {l.topicLabel}
                </p>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={l.topicPh}
                  maxLength={140}
                  className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
                />

                <button
                  type="button"
                  onClick={begin}
                  disabled={!etat}
                  className="mt-4 w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40"
                >
                  {l.begin}
                </button>
                {!etat && (
                  <p className="mt-2 text-center text-[11px] text-[var(--muted)]">{l.startFirst}</p>
                )}
              </section>

              <p className="px-2 text-center text-[11px] leading-relaxed text-[var(--muted)]">
                {l.meaning}
              </p>
            </>
          )}

          {/* ----- Étape 1 : Parole ----- */}
          {step === 1 && rx && signals && (
            <>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.day}
                </p>
                <ul className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
                  <li>{signals.chapitres > 0 ? l.chapters(signals.chapitres) : l.noChapter}</li>
                  {signals.versets > 0 && <li>{l.verses(signals.versets)}</li>}
                  {signals.serie >= 2 && <li>{l.streakRead(signals.serie)}</li>}
                </ul>
              </section>

              <section className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  {l.verse}
                </p>
                <p
                  className="text-lg font-semibold leading-relaxed text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  « {rx.texte} »
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--color-accent)]">{rx.ref}</p>
                {chapterLink && (
                  <Link
                    href={chapterLink}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline"
                  >
                    📖 {l.readChapter}
                  </Link>
                )}
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.meditation}
                </p>
                <p className="text-sm leading-relaxed text-[var(--foreground)]">{rx.meditation}</p>
                {topic.trim() && (
                  <p className="mt-2 border-l-2 border-[var(--color-accent)] pl-2 text-xs italic text-[var(--muted)]">
                    {topic.trim()}
                  </p>
                )}
              </section>
            </>
          )}

          {/* ----- Étape 2 : Merci ----- */}
          {step === 2 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">{l.thanks}</p>
              <p className="mb-3 mt-1 text-xs text-[var(--muted)]">{l.thanksHint}</p>
              <div className="flex flex-col gap-2">
                {gratitudes.map((g, i) => (
                  <input
                    key={i}
                    value={g}
                    onChange={(e) =>
                      setGratitudes((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    placeholder={l.thanksPh[i]}
                    maxLength={120}
                    className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
                  />
                ))}
              </div>
            </section>
          )}

          {/* ----- Étape 3 : Prière + silence ----- */}
          {step === 3 && rx && (
            <>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.prayer}
                </p>
                <p
                  className="text-base italic leading-relaxed text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {rx.priere}
                </p>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
                <p className="text-sm font-semibold text-[var(--foreground)]">{l.silence}</p>
                <div className="relative mx-auto my-5 flex h-36 w-36 items-center justify-center">
                  <div
                    className="selah-breathe absolute inset-0 rounded-full bg-[var(--color-accent)]/20"
                    style={{
                      animation:
                        silence === "running" ? "selah-breathe 8s ease-in-out infinite" : undefined,
                    }}
                  />
                  <span className="relative text-3xl font-semibold tabular-nums text-[var(--foreground)]">
                    {silence === "done" ? "✓" : `${mm}:${ss}`}
                  </span>
                </div>
                {silence === "idle" && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={startSilence}
                      className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
                    >
                      {l.silenceStart}
                    </button>
                    <button
                      type="button"
                      onClick={skipSilence}
                      className="px-2 py-2 text-xs text-[var(--muted)] underline-offset-2 hover:underline"
                    >
                      {l.skip}
                    </button>
                  </div>
                )}
                {silence === "running" && (
                  <p className="text-sm text-[var(--muted)]">{l.silenceRunning}</p>
                )}
                {silence === "done" && (
                  <p className="text-sm font-semibold text-[var(--color-accent)]">
                    {l.silenceDone}
                  </p>
                )}
              </section>
            </>
          )}

          {/* ----- Étape 4 : Demain ----- */}
          {step === 4 && rx && (
            <section className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                {l.pas}
              </p>
              <p className="text-base font-medium leading-relaxed text-[var(--foreground)]">
                🎯 {rx.pas}
              </p>
            </section>
          )}

          {/* ----- Navigation ----- */}
          {step > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
              >
                {l.back}
              </button>
              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(LAST_STEP, s + 1))}
                  className="rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99]"
                >
                  {step === 2 && gratitudes.every((g) => !g.trim()) ? l.skip : l.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99]"
                >
                  {l.finish}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====================== PAUSE TERMINÉE ====================== */}
      {tab === "tonight" && finished && rx && (
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-5 text-center">
            <p className="text-3xl" aria-hidden="true">
              🌿
            </p>
            <h2
              className="mt-1 text-xl font-bold text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {l.doneTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--foreground)]">{l.doneText}</p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-accent)]">
              {stats.current} {stats.current === 1 ? l.streakOne : l.streak}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={share}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
            >
              {copied ? l.copied : `📤 ${l.share}`}
            </button>
            <button
              type="button"
              onClick={() => setTab("path")}
              className="rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90"
            >
              {l.seePath}
            </button>
          </div>

          <button
            type="button"
            onClick={goApollos}
            className="rounded-xl border border-dashed border-[var(--color-accent)]/60 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5"
          >
            ✨ {l.apollos}
          </button>
          {apollosMsg && (
            <p className="text-center text-xs text-[var(--muted)]">{l.apollosCopied}</p>
          )}

          <button
            type="button"
            onClick={restart}
            className="py-1 text-center text-xs text-[var(--muted)] underline-offset-2 hover:underline"
          >
            {l.again}
          </button>
        </div>
      )}

      {/* ====================== MON PARCOURS ====================== */}
      {tab === "path" && (
        <div className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
              <p className="text-sm leading-relaxed text-[var(--muted)]">{l.emptyPath}</p>
              <button
                type="button"
                onClick={() => setTab("tonight")}
                className="mt-4 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
              >
                {l.tabTonight}
              </button>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-3 gap-2">
                <div className="min-w-0 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--color-accent)]">🌿 {stats.current}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {stats.current === 1 ? l.streakOne : l.streak}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats.longest}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {l.best}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {l.total}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.week}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {week.map((d) => (
                    <div key={d.date} className="flex min-w-0 flex-col items-center gap-1">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${
                          d.entry
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : d.isToday
                              ? "border-dashed border-[var(--color-accent)]/60"
                              : "border-[var(--border)]"
                        }`}
                      >
                        {d.entry ? getStateMeta(d.entry.state).emoji : ""}
                      </span>
                      <span
                        className={`text-[10px] uppercase ${
                          d.isToday ? "font-bold text-[var(--color-accent)]" : "text-[var(--muted)]"
                        }`}
                      >
                        {d.weekday}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <p className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {l.recent}
                </p>
                {entries.slice(0, 30).map((e) => {
                  const m = getStateMeta(e.state);
                  const href = chapterHref(e.ref);
                  return (
                    <article
                      key={e.id}
                      className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs capitalize text-[var(--muted)]">{fmtDate(e.date)}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                            <span aria-hidden="true">{m.emoji}</span> {lang === "en" ? m.en : m.fr}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(l.confirmRemove)) deleteSelahEntry(e.id);
                          }}
                          className="shrink-0 px-1 text-[11px] text-[var(--muted)] underline-offset-2 hover:underline"
                        >
                          {l.remove}
                        </button>
                      </div>

                      {e.ref &&
                        (href ? (
                          <Link
                            href={href}
                            className="mt-2 inline-block text-sm font-bold text-[var(--color-accent)] underline-offset-2 hover:underline"
                          >
                            {e.ref}
                          </Link>
                        ) : (
                          <p className="mt-2 text-sm font-bold text-[var(--color-accent)]">{e.ref}</p>
                        ))}

                      {e.gratitudes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                            {l.thanksFor}
                          </p>
                          <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[var(--foreground)]">
                            {e.gratitudes.map((g, i) => (
                              <li key={i} className="break-words">
                                • {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {e.topic && (
                        <p className="mt-2 break-words text-xs italic text-[var(--muted)]">
                          {l.prayerFor} : {e.topic}
                        </p>
                      )}

                      {e.pas && (
                        <p className="mt-2 break-words text-xs text-[var(--muted)]">
                          🎯 {e.pas}{" "}
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
              </section>

              <button
                type="button"
                onClick={() => {
                  if (confirm(l.confirmClear)) clearSelah();
                }}
                className="py-2 text-center text-xs text-red-500 underline-offset-2 hover:underline"
              >
                {l.clearAll}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
