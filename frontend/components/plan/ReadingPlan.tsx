"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ModalShell from "@/components/ui/ModalShell";
import ProgressRing from "@/components/plan/ProgressRing";
import { slugify } from "@/lib/bible-utils";
import { getTodayKey } from "@/lib/journal";
import {
  PLANS,
  buildPlanView,
  chaptersPerDay,
  getPlanState,
  getServerPlanState,
  markChaptersRead,
  planChapters,
  refLabel,
  startPlan,
  stopPlan,
  subscribePlan,
  toggleChapter,
  type PlanDef,
  type PlanItem,
} from "@/lib/reading-plan";

// ============================================================
// LILOBA — Plan de lecture : bouton rond d'accueil + fenêtre
// Design épuré : anneau de progression, lectures du jour avec case à
// cocher, parcours au choix. Aucun emoji, SVG stroke, variables du thème.
// ============================================================

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <path d="m9 15.5 2 2 4-4" />
    </svg>
  );
}
function BookOpenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} strokeWidth={3} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function perDay(def: PlanDef): string {
  const n = chaptersPerDay(def);
  return n >= 10 ? `${Math.round(n)}` : `${Math.round(n * 10) / 10}`.replace(".", ",");
}

// ------------------------------------------------------------
// Une ligne de lecture : case à cocher + chapitre + « Lire »
// ------------------------------------------------------------

function ReadingRow({ item, onOpen }: { item: PlanItem; onOpen: () => void }) {
  return (
    <div
      className={`flex items-center gap-1 rounded-2xl border px-1 transition-colors ${
        item.read
          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
          : "border-[var(--border)]"
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={item.read}
        aria-label={`${refLabel(item.ref)} : marquer comme lu`}
        onClick={() => toggleChapter(item.index)}
        className="flex h-12 w-12 shrink-0 items-center justify-center"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
            item.read
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--border)] text-transparent hover:border-[var(--color-accent)]"
          }`}
        >
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
      </button>
      <span
        className={`min-w-0 flex-1 truncate text-sm font-semibold ${
          item.read ? "text-[var(--muted)] line-through decoration-[var(--muted)]/50" : "text-[var(--foreground)]"
        }`}
      >
        {refLabel(item.ref)}
      </span>
      <Link
        href={`/bible/${slugify(item.ref.book)}/${item.ref.chapter}`}
        onClick={onOpen}
        className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10"
      >
        Lire
        <ChevronRight />
      </Link>
    </div>
  );
}

// ------------------------------------------------------------
// Choix du parcours
// ------------------------------------------------------------

function Chooser({ onPicked }: { onPicked: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-xs leading-relaxed text-[var(--muted)]">
        Choisis un parcours. Chaque jour, LILOBA te donne les chapitres à lire : tu les coches, ton anneau se remplit.
      </p>
      {PLANS.map((def) => (
        <button
          key={def.id}
          type="button"
          onClick={() => {
            startPlan(def.id);
            onPicked();
          }}
          className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-[var(--border)] px-3 text-left transition-all hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/5 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <BookOpenIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--foreground)]">{def.label}</span>
            <span className="block truncate text-xs text-[var(--muted)]">
              {def.scope} · {planChapters(def).length} chapitres · ~{perDay(def)} par jour
            </span>
          </span>
          <span className="text-[var(--muted)]">
            <ChevronRight />
          </span>
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Plan en cours
// ------------------------------------------------------------

function Active({ onClose, onNavigate }: { onClose: () => void; onNavigate?: () => void }) {
  // « Lire » quitte la page : on ferme la fenêtre ET, si le bouton est dans le menu, le menu
  const leave = () => {
    onNavigate?.();
    onClose();
  };
  const state = useSyncExternalStore(subscribePlan, getPlanState, getServerPlanState);
  const [showAllLate, setShowAllLate] = useState(false);
  if (!state) return null;
  const view = buildPlanView(state, getTodayKey());
  if (!view) return null;

  const lateShown = showAllLate ? view.late : view.late.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Anneau */}
      <div className="flex flex-col items-center">
        <ProgressRing percent={view.percent} size={168} stroke={12}>
          <span className="text-4xl font-bold leading-none text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
            {view.percent}
            <span className="text-xl">%</span>
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">lu</span>
        </ProgressRing>
        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
          {view.finished
            ? "Plan terminé"
            : view.notStarted
              ? "Le plan commence bientôt"
              : view.overtime
                ? "Durée du plan écoulée"
                : `Jour ${view.dayNumber} sur ${view.def.days}`}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {view.readCount} / {view.total} chapitres · {view.def.scope}
        </p>
      </div>

      {/* Terminé */}
      {view.finished && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
            <CheckIcon className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-[var(--foreground)]">Bravo, tu as lu tout le parcours.</p>
          <p className="text-xs text-[var(--muted)]">Tu peux en choisir un nouveau ci-dessous.</p>
        </div>
      )}

      {/* Aujourd'hui */}
      {!view.finished && view.today.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Lecture du jour
            </h3>
            {view.todayDone && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)]">
                <CheckIcon className="h-3 w-3" />
                Terminée
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {view.today.map((it) => (
              <ReadingRow key={it.index} item={it} onOpen={leave} />
            ))}
          </div>
          {!view.todayDone && (
            <button
              type="button"
              onClick={() => markChaptersRead(view.today.map((x) => x.index))}
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <CheckIcon className="h-4 w-4" />
              Marquer comme lu
            </button>
          )}
        </section>
      )}

      {/* Rien de prévu aujourd'hui */}
      {!view.finished && view.today.length === 0 && view.late.length > 0 && view.overtime && (
        <p className="rounded-2xl border border-[var(--border)] p-3 text-center text-xs text-[var(--muted)]">
          Le calendrier est terminé : il te reste {view.late.length} chapitre{view.late.length > 1 ? "s" : ""} à lire.
        </p>
      )}

      {/* À rattraper */}
      {!view.finished && view.late.length > 0 && (
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
            À rattraper · {view.late.length}
          </h3>
          <div className="flex flex-col gap-2">
            {lateShown.map((it) => (
              <ReadingRow key={it.index} item={it} onOpen={leave} />
            ))}
          </div>
          {view.late.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllLate((v) => !v)}
              className="mt-1 min-h-[44px] w-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {showAllLate ? "Voir moins" : `Voir les ${view.late.length - 5} autres`}
            </button>
          )}
        </section>
      )}

      {/* Changer de plan */}
      <button
        type="button"
        onClick={() => {
          if (
            view.readCount > 0 &&
            !view.finished &&
            !confirm("Changer de plan remet ta progression à zéro. Continuer ?")
          ) {
            return;
          }
          stopPlan();
        }}
        className="min-h-[44px] w-full rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--foreground)]"
      >
        {view.finished ? "Choisir un nouveau plan" : "Changer de plan"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// Fenêtre
// ------------------------------------------------------------

function PlanSheet({ onClose, onNavigate }: { onClose: () => void; onNavigate?: () => void }) {
  const state = useSyncExternalStore(subscribePlan, getPlanState, getServerPlanState);
  const def = state ? PLANS.find((p) => p.id === state.planId) : null;
  return (
    <ModalShell label="Plan de lecture" onClose={onClose}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="min-w-0 truncate text-base font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          {def ? def.label : "Plan de lecture"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <CloseIcon />
        </button>
      </div>
      {state ? <Active onClose={onClose} onNavigate={onNavigate} /> : <Chooser onPicked={() => {}} />}
    </ModalShell>
  );
}

// ------------------------------------------------------------
// Le bouton rond de l'accueil
// ------------------------------------------------------------

export default function ReadingPlanButton({
  tone = "theme",
  className = "",
  onNavigate,
}: {
  tone?: "theme" | "dark";
  className?: string;
  /** Appelé quand un lien « Lire » quitte la page (ex. fermer le menu qui contient ce bouton). */
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const state = useSyncExternalStore(subscribePlan, getPlanState, getServerPlanState);
  const view = state ? buildPlanView(state, getTodayKey()) : null;
  const dark = tone === "dark";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={view ? `Plan de lecture : ${view.percent} % lu` : "Plan de lecture"}
        className={`group flex h-12 w-full min-w-0 items-center gap-2 rounded-full border pl-1.5 pr-3 text-sm font-semibold transition-all active:scale-[0.97] ${
          dark
            ? "border-white/10 bg-white/5 text-white hover:border-[#fcd34d]/50 hover:bg-white/10"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-accent)]"
        } ${className}`}
      >
        {view ? (
          <ProgressRing percent={view.percent} size={36} stroke={4}>
            <BookOpenIcon className="h-3.5 w-3.5" />
          </ProgressRing>
        ) : (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              dark ? "bg-white/10 text-[#fcd34d]" : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            }`}
          >
            <CalendarIcon className="h-[18px] w-[18px]" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-left">Plan de lecture</span>
        {view && (
          <span className={`shrink-0 font-mono text-[11px] ${dark ? "text-white/60" : "text-[var(--muted)]"}`}>
            {view.percent}%
          </span>
        )}
      </button>
      {open && <PlanSheet onClose={() => setOpen(false)} onNavigate={onNavigate} />}
    </>
  );
}
