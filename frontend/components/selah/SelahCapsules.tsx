"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { getTodayKey } from "@/lib/journal";
import type { SelahEntry } from "@/lib/selah";
import { SELAH_STATES, type SoulState } from "@/lib/selah-content";
import {
  CAPSULE_HORIZONS,
  CAPSULE_MAX_CHARS,
  daysUntil,
  deleteCapsule,
  getCapsules,
  getServerCapsules,
  isCapsuleReady,
  openCapsule,
  saveCapsuleReply,
  sealCapsule,
  subscribeCapsules,
  type CapsuleHorizon,
  type TimeCapsule,
} from "@/lib/selah-capsules";

// ============================================================
// SELAH · Capsule du temps
// Une lettre scellée à ton futur toi. Elle reste cachée dans l'app
// jusqu'à la date choisie, puis tu l'ouvres, tu relis, tu réponds.
// ============================================================

const UI = {
  fr: {
    title: "Capsule du temps",
    hint: "Écris à la personne que tu seras bientôt. La lettre reste scellée jusqu'au jour que tu choisis.",
    composeCta: "Écrire à mon futur moi",
    letterLabel: "Ta lettre",
    letterPh: "Ce que tu veux te dire, te rappeler, ou demander à Dieu de faire d'ici là…",
    horizonLabel: "S'ouvrira dans",
    horizons: { 7: "1 semaine", 30: "1 mois", 90: "3 mois", 365: "1 an" } as Record<number, string>,
    seal: "Sceller la lettre",
    sealed: (d: string) => `Lettre scellée. Elle s'ouvrira le ${d}.`,
    cancel: "Annuler",
    empty: "Aucune lettre pour l'instant.",
    opensOn: (d: string, n: number) =>
      n === 1 ? `S'ouvre le ${d} · demain` : `S'ouvre le ${d} · dans ${n} jours`,
    ready: "Une lettre t'attend",
    open: "Ouvrir la lettre",
    writtenOn: (d: string) => `Écrite le ${d}`,
    thatNight: "Ce soir-là, tu remerciais pour",
    heartThen: "Ton cœur",
    verse: "Ton verset",
    replyLabel: "Ta réponse aujourd'hui",
    replyPh: "Qu'as-tu vu Dieu faire depuis ? Que dirais-tu à celui que tu étais ?",
    replySave: "Enregistrer ma réponse",
    replySaved: "Réponse enregistrée",
    remove: "Supprimer",
    confirmRemove: "Supprimer cette lettre ? Cette action est irréversible.",
    banner: "Une lettre scellée t'attend.",
    bannerCta: "L'ouvrir",
    sealedHint: "Contenu caché jusqu'à l'ouverture",
    locale: "fr-FR",
  },
  en: {
    title: "Time capsule",
    hint: "Write to the person you'll soon be. The letter stays sealed until the day you choose.",
    composeCta: "Write to my future self",
    letterLabel: "Your letter",
    letterPh: "What you want to tell yourself, remember, or ask God to do between now and then…",
    horizonLabel: "Opens in",
    horizons: { 7: "1 week", 30: "1 month", 90: "3 months", 365: "1 year" } as Record<number, string>,
    seal: "Seal the letter",
    sealed: (d: string) => `Letter sealed. It will open on ${d}.`,
    cancel: "Cancel",
    empty: "No letters yet.",
    opensOn: (d: string, n: number) =>
      n === 1 ? `Opens ${d} · tomorrow` : `Opens ${d} · in ${n} days`,
    ready: "A letter is waiting for you",
    open: "Open the letter",
    writtenOn: (d: string) => `Written on ${d}`,
    thatNight: "That night, you were thankful for",
    heartThen: "Your heart",
    verse: "Your verse",
    replyLabel: "Your answer today",
    replyPh: "What have you seen God do since? What would you tell who you were?",
    replySave: "Save my answer",
    replySaved: "Answer saved",
    remove: "Delete",
    confirmRemove: "Delete this letter? This cannot be undone.",
    banner: "A sealed letter is waiting for you.",
    bannerCta: "Open it",
    sealedHint: "Content hidden until it opens",
    locale: "en-US",
  },
};

type Lang = "fr" | "en";

function fmtDate(key: string, locale: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(y, m - 1, d, 12)
  );
}

// ------------------------------------------------------------
// Icônes SVG
// ------------------------------------------------------------

function EnvelopeSeal({ ready, size = 44 }: { ready?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 14l18 13 18-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="27" r="6.5" fill="var(--color-accent)" className={ready ? "selah-seal-pulse" : undefined} />
      <path d="M24 23.5v7M20.5 27h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function SealBreak() {
  return (
    <svg viewBox="0 0 48 48" className="selah-seal-break pointer-events-none absolute left-1/2 top-4 h-16 w-16 -translate-x-1/2" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="10" fill="var(--color-accent)" />
      <path d="M24 17l-3 6 4 2-3 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SEAL_STYLE = `
  @keyframes selah-seal-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.14) } }
  @keyframes selah-seal-break { 0% { transform: translateX(-50%) scale(1); opacity: 1 } 100% { transform: translateX(-50%) scale(2.2); opacity: 0 } }
  .selah-seal-pulse { transform-box: fill-box; transform-origin: center; animation: selah-seal-pulse 2.4s ease-in-out infinite; }
  .selah-seal-break { animation: selah-seal-break .9s ease-out forwards; }
  @media (prefers-reduced-motion: reduce) {
    .selah-seal-pulse, .selah-seal-break { animation: none !important; }
    .selah-seal-break { opacity: 0; }
  }
`;

// ------------------------------------------------------------
// Rédaction
// ------------------------------------------------------------

function Composer({
  l,
  verseRef,
  state,
  onSealed,
  onCancel,
}: {
  l: (typeof UI)["fr"];
  verseRef?: string;
  state?: SoulState;
  onSealed: (openOn: string) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = useState("");
  const [days, setDays] = useState<CapsuleHorizon>(30);

  const submit = () => {
    const cap = sealCapsule({ text, days, today: getTodayKey(), ref: verseRef, state });
    if (!cap) return;
    setText("");
    onSealed(cap.openOn);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor="selah-capsule-text" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
          {l.letterLabel}
        </label>
        <textarea
          id="selah-capsule-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={CAPSULE_MAX_CHARS}
          rows={4}
          placeholder={l.letterPh}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)] md:px-4 md:py-3"
          style={{ fontFamily: "var(--font-serif)" }}
        />
        <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
          {text.length}/{CAPSULE_MAX_CHARS}
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{l.horizonLabel}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={l.horizonLabel}>
          {CAPSULE_HORIZONS.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={days === d}
              onClick={() => setDays(d)}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-semibold transition-all active:scale-95 ${
                days === d
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              {l.horizons[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          {l.seal}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)]"
          >
            {l.cancel}
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Une capsule
// ------------------------------------------------------------

function CapsuleCard({
  c,
  l,
  lang,
  entries,
  today,
}: {
  c: TimeCapsule;
  l: (typeof UI)["fr"];
  lang: Lang;
  entries: SelahEntry[];
  today: string;
}) {
  const [justOpened, setJustOpened] = useState(false);
  const [reply, setReply] = useState(c.reply ?? "");
  const [savedMsg, setSavedMsg] = useState(false);

  const left = daysUntil(c.openOn, today);
  const ready = isCapsuleReady(c, today);
  const opened = Boolean(c.openedAt);
  const thatNight = entries.find((e) => e.date === c.sealedOn);
  const stateMeta = c.state ? SELAH_STATES.find((s) => s.id === c.state) : null;

  const remove = () => {
    if (confirm(l.confirmRemove)) deleteCapsule(c.id);
  };

  const trash = (
    <button
      type="button"
      onClick={remove}
      aria-label={l.remove}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
      </svg>
    </button>
  );

  // ---- Scellée (ou prête) : contenu jamais rendu ----
  if (!opened) {
    return (
      <article
        className={`relative flex items-center gap-3 rounded-2xl border p-4 ${
          ready ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        <span className={ready ? "text-[var(--color-accent)]" : "text-[var(--muted)]"}>
          <EnvelopeSeal ready={ready} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {ready ? l.ready : l.opensOn(fmtDate(c.openOn, l.locale), Math.max(1, left))}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            {l.writtenOn(fmtDate(c.sealedOn, l.locale))}
            {!ready && ` · ${l.sealedHint}`}
          </p>
        </div>
        {ready ? (
          <button
            type="button"
            onClick={() => {
              setJustOpened(true);
              openCapsule(c.id);
            }}
            className="min-h-[44px] shrink-0 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-95"
          >
            {l.open}
          </button>
        ) : (
          trash
        )}
      </article>
    );
  }

  // ---- Ouverte ----
  return (
    <article className="selah-step relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
      {justOpened && <SealBreak />}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
          {l.writtenOn(fmtDate(c.sealedOn, l.locale))}
        </p>
        {trash}
      </div>

      <p
        className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground)] md:text-lg"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {c.text}
      </p>

      {(stateMeta || c.ref) && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {stateMeta && (
            <>
              {l.heartThen} : <span className="font-semibold text-[var(--foreground)]">{lang === "en" ? stateMeta.en : stateMeta.fr}</span>
            </>
          )}
          {stateMeta && c.ref && " · "}
          {c.ref && (
            <>
              {l.verse} : <span className="font-semibold text-[var(--foreground)]">{c.ref}</span>
            </>
          )}
        </p>
      )}

      {thatNight && thatNight.gratitudes.length > 0 && (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">{l.thatNight}</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[var(--foreground)]">
            {thatNight.gratitudes.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor={`reply-${c.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          {l.replyLabel}
        </label>
        <textarea
          id={`reply-${c.id}`}
          value={reply}
          onChange={(e) => {
            setReply(e.target.value);
            setSavedMsg(false);
          }}
          maxLength={CAPSULE_MAX_CHARS}
          rows={3}
          placeholder={l.replyPh}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              saveCapsuleReply(c.id, reply);
              setSavedMsg(true);
            }}
            disabled={reply.trim() === (c.reply ?? "")}
            className="min-h-[44px] rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] disabled:opacity-40"
          >
            {l.replySave}
          </button>
          {savedMsg && <span className="text-xs font-medium text-green-600">{l.replySaved}</span>}
        </div>
      </div>
    </article>
  );
}

// ------------------------------------------------------------
// Section principale
// ------------------------------------------------------------

export default function SelahCapsules({
  lang,
  entries,
  variant = "full",
  verseRef,
  state,
}: {
  lang: Lang;
  entries: SelahEntry[];
  /** "full" : rédaction + liste (onglet parcours). "composer" : carte repliée (fin de pause). */
  variant?: "full" | "composer";
  verseRef?: string;
  state?: SoulState;
}) {
  const l = UI[lang];
  const capsules = useSyncExternalStore(subscribeCapsules, getCapsules, getServerCapsules);
  const [composing, setComposing] = useState(variant === "full");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const today = getTodayKey();

  // Prêtes d'abord, puis à venir (par date), puis déjà ouvertes (récentes d'abord)
  const ordered = useMemo(() => {
    const t = getTodayKey();
    const rank = (c: TimeCapsule) => (isCapsuleReady(c, t) ? 0 : c.openedAt ? 2 : 1);
    return [...capsules].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      if (ra === 2) return (b.openedAt ?? 0) - (a.openedAt ?? 0);
      return a.openOn < b.openOn ? -1 : 1;
    });
  }, [capsules]);

  const onSealed = (openOn: string) => {
    setConfirmation(l.sealed(fmtDate(openOn, l.locale)));
    if (variant === "composer") setComposing(false);
  };

  return (
    <section
      id={variant === "full" ? "selah-capsules" : undefined}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6"
      aria-label={l.title}
    >
      <style>{SEAL_STYLE}</style>

      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--color-accent)]">
          <EnvelopeSeal size={36} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{l.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] md:text-sm">{l.hint}</p>
        </div>
      </div>

      {confirmation && (
        <p role="status" className="selah-step mt-3 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 px-3 py-2 text-sm font-medium text-[var(--foreground)]">
          {confirmation}
        </p>
      )}

      <div className="mt-4">
        {composing ? (
          <Composer
            l={l}
            verseRef={verseRef}
            state={state}
            onSealed={onSealed}
            onCancel={variant === "composer" ? () => setComposing(false) : undefined}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirmation(null);
              setComposing(true);
            }}
            className="min-h-[44px] w-full rounded-xl border border-dashed border-[var(--color-accent)]/60 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5"
          >
            {l.composeCta}
          </button>
        )}
      </div>

      {variant === "full" && (
        <div className="mt-5 flex flex-col gap-3">
          {ordered.length === 0 ? (
            <p className="text-center text-xs text-[var(--muted)]">{l.empty}</p>
          ) : (
            ordered.map((c) => (
              <CapsuleCard key={c.id} c={c} l={l} lang={lang} entries={entries} today={today} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------
// Bandeau « une lettre t'attend » (visible sur les deux onglets)
// ------------------------------------------------------------

export function SelahCapsuleBanner({ lang, onOpen }: { lang: Lang; onOpen: () => void }) {
  const l = UI[lang];
  const capsules = useSyncExternalStore(subscribeCapsules, getCapsules, getServerCapsules);
  const today = getTodayKey();
  const readyCount = capsules.filter((c) => isCapsuleReady(c, today)).length;
  if (readyCount === 0) return null;

  return (
    <div
      role="status"
      className="selah-step mb-4 flex items-center gap-3 rounded-2xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 p-3 md:p-4"
    >
      <style>{SEAL_STYLE}</style>
      <span className="text-[var(--color-accent)]">
        <EnvelopeSeal ready size={36} />
      </span>
      <p className="min-w-0 flex-1 text-sm font-semibold text-[var(--foreground)]">{l.banner}</p>
      <button
        type="button"
        onClick={onOpen}
        className="min-h-[44px] shrink-0 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-95"
      >
        {l.bannerCta}
      </button>
    </div>
  );
}
