"use client";

import type { ReactNode } from "react";
import { formatDateFr, type PlanView } from "@/lib/reading-plan";
import { CheckIcon, FlagIcon, FlameIcon, TargetIcon, TrendIcon, ChartIcon } from "@/components/plan/PlanIcons";

// ============================================================
// LILOBA — Plan : bilan (rythme, avance, fin estimée, série, jalons)
// ============================================================

function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] p-3">
      <span className="flex items-center gap-1.5 text-[var(--muted)]">
        {icon}
        <span className="text-[11px] font-semibold">{label}</span>
      </span>
      <span className="text-base font-bold leading-tight text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
        {value}
      </span>
      {hint && <span className="text-[11px] leading-snug text-[var(--muted)]">{hint}</span>}
    </div>
  );
}

function fmtPace(n: number): string {
  if (n <= 0) return "0";
  return n >= 10 ? `${Math.round(n)}` : `${Math.round(n * 10) / 10}`.replace(".", ",");
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

/** Avance / retard en une phrase. */
function standing(view: PlanView): { value: string; hint: string } {
  if (view.finished) return { value: "Terminé", hint: "Tout le parcours est lu." };
  if (view.notStarted) return { value: "Pas commencé", hint: `Début le ${formatDateFr(view.startDate)}.` };
  if (view.late.length > 0) {
    return {
      value: `${plural(view.late.length, "chapitre", "chapitres")} de retard`,
      hint: "Recale le calendrier dans les options pour repartir à zéro.",
    };
  }
  if (view.ahead > 0) return { value: `${plural(view.ahead, "chapitre", "chapitres")} d'avance`, hint: "Tu lis plus vite que prévu." };
  return { value: "À jour", hint: "Tu suis exactement le calendrier." };
}

const MILESTONES = [25, 50, 75, 100];

export default function PlanStats({ view }: { view: PlanView }) {
  const st = standing(view);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat
          icon={<FlameIcon className="h-3.5 w-3.5" />}
          label="Série"
          value={plural(view.streak, "jour", "jours")}
          hint={view.bestStreak > view.streak ? `Record : ${view.bestStreak}` : view.streak > 0 ? "C'est ton record" : "Lis aujourd'hui pour la lancer"}
        />
        <Stat
          icon={<CheckIcon className="h-3.5 w-3.5" />}
          label="Jours de lecture"
          value={`${view.activeDays}`}
          hint="Jours où tu as coché un chapitre"
        />
        <Stat
          icon={<TrendIcon className="h-3.5 w-3.5" />}
          label="Rythme"
          value={`${fmtPace(view.pace)} chap. / jour`}
          hint={`Prévu : ${fmtPace(view.total / view.def.days)} par jour`}
        />
        <Stat icon={<TargetIcon className="h-3.5 w-3.5" />} label="Situation" value={st.value} hint={st.hint} />
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] p-3">
        <span className="flex items-center gap-1.5 text-[var(--muted)]">
          <FlagIcon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">Fin du parcours</span>
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-[var(--muted)]">Selon ton rythme</span>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {view.finished ? "Terminé" : view.projectedEnd ? formatDateFr(view.projectedEnd) : "Lis un chapitre pour l'estimer"}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-[var(--muted)]">Selon le calendrier</span>
          <span className="text-sm font-semibold text-[var(--foreground)]">{formatDateFr(view.plannedEnd)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-3">
        <span className="flex items-center gap-1.5 text-[var(--muted)]">
          <ChartIcon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">Jalons</span>
        </span>
        <div className="relative flex items-center justify-between">
          <span className="absolute left-3 right-3 top-1/2 h-0.5 -translate-y-1/2 bg-[var(--border)]" aria-hidden="true" />
          <span
            className="absolute left-3 top-1/2 h-0.5 -translate-y-1/2 bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `calc((100% - 1.5rem) * ${view.percent / 100})` }}
            aria-hidden="true"
          />
          {MILESTONES.map((m) => {
            const reached = view.percent >= m;
            return (
              <span
                key={m}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  reached
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
                aria-label={`${m} % ${reached ? "atteint" : "pas encore atteint"}`}
              >
                {reached ? <CheckIcon className="h-3.5 w-3.5" /> : `${m}`}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
