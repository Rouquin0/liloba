"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BRANDING } from "@/lib/branding";
import { getTodayKey } from "@/lib/journal";
import { graceAddDays } from "@/lib/selah-grace";
import {
  EVENING_START_HOUR,
  msUntilOpening,
  pad2,
  splitDuration,
  sunProgress,
} from "@/lib/selah-evening";
import {
  SEED_MAX_CHARS,
  getSeeds,
  getServerSeeds,
  plantSeed,
  removeSeed,
  setSeedOutcome,
  subscribeSeeds,
  type SeedOutcome,
} from "@/lib/selah-seeds";
import { downloadEveningReminder } from "@/lib/selah-reminder";
import {
  getSelahPrefs,
  getServerSelahPrefs,
  setReminderAdded,
  subscribeSelahPrefs,
} from "@/lib/selah-prefs";

// ============================================================
// SELAH · Le verrou du soir
//   • Chrono + soleil qui descend jusqu'à 18h (heure locale, monde entier)
//   • Option 1 — Rappel quotidien de 18h dans l'agenda du téléphone
//   • Option 2 — Graine du jour : une intention plantée le jour,
//                récoltée le soir à l'ouverture de Selah
// ============================================================

type Lang = "fr" | "en";

const UI = {
  fr: {
    title: "Selah ouvre à 18h",
    sub: "Selah est la pause du soir. Quand la journée est finie, tu viens déposer ce que tu portes, recevoir un verset, remercier et prier. Reviens ce soir.",
    tz: "Heure locale de ton téléphone, où que tu sois dans le monde.",
    opensIn: "Ouverture dans",
    soon: "Le soleil se couche… encore quelques minutes.",
    streak: (n: number) => `Ta série de ${n} soir${n > 1 ? "s" : ""} t'attend ce soir.`,
    goPath: "Voir mon parcours",
    reminderTitle: "Rappel de 18h",
    reminderText:
      "Ajoute un rappel quotidien à ton agenda : une alarme sonne chaque soir à 18h, dans ton fuseau horaire, même quand l'app est fermée.",
    reminderBtn: "Ajouter à mon agenda",
    reminderDone: "Rappel ajouté",
    reminderAgain: "L'ajouter à nouveau",
    reminderNote: "Fichier agenda (.ics) : il s'ouvre dans l'application Agenda de ton téléphone.",
    reminderCompact: "Reviens chaque soir à 18h : ajoute le rappel à ton agenda.",
    seedTomorrowTitle: "Graine pour demain",
    seedTomorrowText:
      "Plante une intention pour ta journée de demain. Demain soir, Selah te demandera si elle est tombée en bonne terre.",
    seedTomorrowPlanted: "Graine plantée pour demain",
    seedTitle: "Graine du jour",
    seedText:
      "Plante une intention pour ta journée. Ce soir, Selah te demandera si elle est tombée en bonne terre.",
    seedPh: "Ex : rester patient, écouter vraiment…",
    seedPlant: "Planter la graine",
    seedPlanted: "Graine plantée",
    seedEdit: "Modifier",
    seedRemove: "Retirer",
    seedSave: "Enregistrer",
    seedCancel: "Annuler",
    urgent: "Besoin d'une parole maintenant ?",
    talk: (n: string) => `Parler à ${n}`,
    bible: "Lire la Bible",
    morning: "Ta graine du jour",
    ask: "Est-elle tombée en bonne terre ?",
    yes: "Oui",
    partly: "En partie",
    notyet: "Pas encore",
    thanksYes: "Quelle belle récolte. Remercie pour ça ce soir.",
    thanksPartly: "Un début, c'est déjà beaucoup. Dépose le reste dans ta prière.",
    thanksNotyet: "Ce n'est pas un échec : une graine a besoin de temps. Demande de l'aide à Dieu.",
  },
  en: {
    title: "Selah opens at 6 PM",
    sub: "Selah is the evening pause. When the day is done, you come lay down what you carry, receive a verse, give thanks and pray. Come back tonight.",
    tz: "Your phone's local time, wherever you are in the world.",
    opensIn: "Opens in",
    soon: "The sun is setting… just a few minutes left.",
    streak: (n: number) => `Your ${n}-evening streak is waiting for you tonight.`,
    goPath: "See my journey",
    reminderTitle: "6 PM reminder",
    reminderText:
      "Add a daily reminder to your calendar: an alarm rings every evening at 6 PM, in your time zone, even when the app is closed.",
    reminderBtn: "Add to my calendar",
    reminderDone: "Reminder added",
    reminderAgain: "Add it again",
    reminderNote: "Calendar file (.ics): it opens in your phone's Calendar app.",
    reminderCompact: "Come back every evening at 6 PM: add the reminder to your calendar.",
    seedTomorrowTitle: "Seed for tomorrow",
    seedTomorrowText:
      "Plant an intention for your day tomorrow. Tomorrow evening, Selah will ask whether it fell on good soil.",
    seedTomorrowPlanted: "Seed planted for tomorrow",
    seedTitle: "Seed of the day",
    seedText:
      "Plant an intention for your day. Tonight, Selah will ask whether it fell on good soil.",
    seedPh: "E.g. stay patient, truly listen…",
    seedPlant: "Plant the seed",
    seedPlanted: "Seed planted",
    seedEdit: "Edit",
    seedRemove: "Remove",
    seedSave: "Save",
    seedCancel: "Cancel",
    urgent: "Need a word right now?",
    talk: (n: string) => `Talk to ${n}`,
    bible: "Read the Bible",
    morning: "Your seed of the day",
    ask: "Did it fall on good soil?",
    yes: "Yes",
    partly: "Partly",
    notyet: "Not yet",
    thanksYes: "What a beautiful harvest. Give thanks for it tonight.",
    thanksPartly: "A beginning is already a lot. Lay the rest in your prayer.",
    thanksNotyet: "It's not a failure: a seed needs time. Ask God for help.",
  },
};

// ------------------------------------------------------------
// Icônes SVG
// ------------------------------------------------------------

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function EveningLockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function CalendarBell({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <circle cx="12" cy="15.5" r="2.2" />
    </svg>
  );
}

function Sprout({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <path d="M12 21v-9" />
      <path d="M12 12c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6Z" />
      <path d="M12 14c0-3 2.2-5.2 6-5.2 0 3-2.2 5.2-6 5.2Z" />
    </svg>
  );
}

// ------------------------------------------------------------
// Soleil qui descend vers l'horizon (SVG)
// ------------------------------------------------------------

function SunArc({ progress }: { progress: number }) {
  const cx = 160;
  const cy = 108;
  const rx = 124;
  const ry = 84;
  const at = (p: number) => {
    const th = Math.PI * (1 - p);
    return { x: cx + rx * Math.cos(th), y: cy - ry * Math.sin(th) };
  };
  const sun = at(progress);
  // portion déjà parcourue de l'arc
  const steps = Math.max(2, Math.round(progress * 48));
  const done = Array.from({ length: steps + 1 }, (_, i) => at((progress * i) / steps))
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");
  const warm = progress > 0.82; // le soleil rougit près de l'horizon

  return (
    <svg viewBox="0 0 320 140" className="mx-auto block w-full max-w-sm" aria-hidden="true">
      <defs>
        <radialGradient id="selah-sun-glow">
          <stop offset="0%" stopColor={warm ? "#f97316" : "#fbbf24"} stopOpacity="0.55" />
          <stop offset="100%" stopColor={warm ? "#f97316" : "#fbbf24"} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* arc complet, pointillé discret */}
      <path
        d={`M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        strokeDasharray="3 6"
        strokeLinecap="round"
      />
      {/* chemin parcouru */}
      {progress > 0.01 && (
        <path d={done} fill="none" stroke={warm ? "#f97316" : "#f5b942"} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
      )}
      {/* horizon */}
      <line x1="18" y1={cy} x2="302" y2={cy} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <text x={cx - rx} y={cy + 20} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.55">
        6h
      </text>
      <text x={cx + rx} y={cy + 20} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.8" fontWeight="700">
        {EVENING_START_HOUR}h
      </text>
      {/* soleil */}
      <circle cx={sun.x} cy={sun.y} r="30" fill="url(#selah-sun-glow)" />
      <circle cx={sun.x} cy={sun.y} r="10" fill={warm ? "#f97316" : "#fbbf24"} />
      <circle cx={sun.x} cy={sun.y} r="4" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

// ------------------------------------------------------------
// Carte « Rappel de 18h » (agenda)
// ------------------------------------------------------------

export function SelahReminderCard({
  lang,
  variant = "full",
}: {
  lang: Lang;
  variant?: "full" | "compact";
}) {
  const l = UI[lang];
  const prefs = useSyncExternalStore(subscribeSelahPrefs, getSelahPrefs, getServerSelahPrefs);
  const [failed, setFailed] = useState(false);

  const add = () => {
    const ok = downloadEveningReminder(lang);
    setFailed(!ok);
    if (ok) setReminderAdded(true);
  };

  if (variant === "compact") {
    if (prefs.reminderAdded) return null;
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 md:p-4">
        <span className="text-[var(--color-accent)]">
          <CalendarBell />
        </span>
        <p className="min-w-0 flex-1 text-xs text-[var(--foreground)] md:text-sm">{l.reminderCompact}</p>
        <button
          type="button"
          onClick={add}
          className="min-h-[44px] shrink-0 rounded-xl border border-[var(--color-accent)]/60 px-3 py-2 text-xs font-bold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5 active:scale-95 md:text-sm"
        >
          {l.reminderBtn}
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--color-accent)]">
          <CalendarBell className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{l.reminderTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] md:text-sm">{l.reminderText}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99]"
        >
          {prefs.reminderAdded ? l.reminderAgain : l.reminderBtn}
        </button>
        {prefs.reminderAdded && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {l.reminderDone}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted)]">{failed ? "…" : l.reminderNote}</p>
    </section>
  );
}

// ------------------------------------------------------------
// Carte « Graine du jour » (plantation, pendant la journée)
// ------------------------------------------------------------

export function SelahSeedPlanter({
  lang,
  tomorrow = false,
}: {
  lang: Lang;
  /** true : la graine est plantée pour DEMAIN (écran « pause enregistrée »). */
  tomorrow?: boolean;
}) {
  const l = UI[lang];
  const inputId = useId();
  const seeds = useSyncExternalStore(subscribeSeeds, getSeeds, getServerSeeds);
  // « today » désigne ici le jour cible de la graine (aujourd'hui ou demain)
  const today = tomorrow ? graceAddDays(getTodayKey(), 1) : getTodayKey();
  const seed = seeds.find((s) => s.date === today) ?? null;
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const showForm = !seed || editing;

  const save = () => {
    if (!draft.trim()) return;
    plantSeed(draft, today);
    setDraft("");
    setEditing(false);
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--color-accent)]">
          <Sprout className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            {tomorrow ? l.seedTomorrowTitle : l.seedTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] md:text-sm">
            {tomorrow ? l.seedTomorrowText : l.seedText}
          </p>
        </div>
      </div>

      {showForm ? (
        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor={inputId} className="sr-only">
            {tomorrow ? l.seedTomorrowTitle : l.seedTitle}
          </label>
          <input
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={SEED_MAX_CHARS}
            placeholder={l.seedPh}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="min-h-[44px] flex-1 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40"
            >
              {seed ? l.seedSave : l.seedPlant}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft("");
                }}
                className="min-h-[44px] rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)]"
              >
                {l.seedCancel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="selah-step mt-4 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
            {tomorrow ? l.seedTomorrowPlanted : l.seedPlanted}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
            {seed?.text}
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            <button
              type="button"
              onClick={() => {
                setDraft(seed?.text ?? "");
                setEditing(true);
              }}
              className="min-h-[44px] font-semibold text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {l.seedEdit}
            </button>
            <button
              type="button"
              onClick={() => removeSeed(today)}
              className="min-h-[44px] font-semibold text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {l.seedRemove}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------
// Récolte du soir : la graine du jour revient à l'ouverture de Selah
// ------------------------------------------------------------

export function SelahSeedHarvest({ lang }: { lang: Lang }) {
  const l = UI[lang];
  const seeds = useSyncExternalStore(subscribeSeeds, getSeeds, getServerSeeds);
  const today = getTodayKey();
  const seed = seeds.find((s) => s.date === today);
  if (!seed) return null;

  const answers: { id: SeedOutcome; label: string }[] = [
    { id: "yes", label: l.yes },
    { id: "partly", label: l.partly },
    { id: "notyet", label: l.notyet },
  ];
  const thanks = seed.outcome
    ? { yes: l.thanksYes, partly: l.thanksPartly, notyet: l.thanksNotyet }[seed.outcome]
    : null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:flex md:items-center md:justify-between md:gap-6 md:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 text-[var(--color-accent)]">
          <Sprout className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{l.morning}</p>
          <p className="text-sm text-[var(--foreground)] md:text-base" style={{ fontFamily: "var(--font-serif)" }}>
            {seed.text}
          </p>
          {thanks ? (
            <p className="selah-step mt-2 text-xs font-medium text-green-600 md:text-sm">{thanks}</p>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted)] md:text-sm">{l.ask}</p>
          )}
        </div>
      </div>
      {!seed.outcome && (
        <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:shrink-0">
          {answers.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSeedOutcome(seed.date, a.id)}
              className={`min-h-[44px] rounded-xl px-5 py-2 text-xs font-bold transition-all active:scale-95 md:text-sm ${
                a.id === "yes"
                  ? "bg-[var(--color-accent)] text-white hover:brightness-90"
                  : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)]"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------
// L'écran de verrou
// ------------------------------------------------------------

export default function SelahEveningGate({
  lang,
  compact = false,
  streak,
  onGoPath,
}: {
  lang: Lang;
  compact?: boolean;
  streak: number;
  onGoPath: () => void;
}) {
  const l = UI[lang];
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = useMemo(() => splitDuration(msUntilOpening(now)), [now]);
  const progress = sunProgress(now);
  const soon = remaining.h === 0 && remaining.m < 15;
  const label = `${pad2(remaining.h)}:${pad2(remaining.m)}:${pad2(remaining.s)}`;
  const assistant = BRANDING.assistant.name;

  return (
    <div className="selah-step flex flex-col gap-4 md:gap-6" aria-label={l.title}>
      <section
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-[var(--muted)] md:px-10 md:py-10"
      >
        <SunArc progress={progress} />

        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{l.opensIn}</p>
        <p
          role="timer"
          aria-label={`${l.opensIn} ${label}`}
          className={`mt-1 font-mono font-bold tabular-nums text-[var(--color-primary)] ${
            compact ? "text-4xl" : "text-5xl md:text-7xl"
          }`}
        >
          {label}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {EVENING_START_HOUR}:00 · {l.tz}
        </p>

        <h2
          className="mt-5 text-lg font-bold text-[var(--foreground)] md:text-2xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {soon ? l.soon : l.title}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">{l.sub}</p>

        {streak > 0 && (
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{l.streak(streak)}</p>
        )}

        <button
          type="button"
          onClick={onGoPath}
          className="mt-4 min-h-[44px] rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
        >
          {l.goPath}
        </button>
      </section>

      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2 md:gap-6"}`}>
        <SelahSeedPlanter lang={lang} />
        <SelahReminderCard lang={lang} />
      </div>

      {!compact && (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-[var(--muted)]">
        <span>{l.urgent}</span>
        <Link href="/chat" className="inline-flex min-h-[44px] items-center font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline">
          {l.talk(assistant)}
        </Link>
        <Link href="/bible" className="inline-flex min-h-[44px] items-center font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline">
          {l.bible}
        </Link>
      </div>
      )}
    </div>
  );
}
