"use client";

import Logo from "@/components/Logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_OPTIONS, setAge, type AgeLevel } from "@/lib/preferences";
import { BRANDING } from "@/lib/branding";

// ============================================================
// NUMÉRAUX ROMAINS
// ============================================================

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

// ============================================================
// PAGE
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AgeLevel | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setAge(selected);
    router.push("/");
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--background)]">
      {/* Halos discrets */}
      <div
        className="pointer-events-none absolute top-0 left-[20%] h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[20%] h-[400px] w-[400px] translate-x-1/2 rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Zone scrollable */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pt-8 pb-4">
        <div className="mx-auto w-full max-w-[440px]">
          {/* ==================== HEADER ==================== */}
          <div className="mb-8 text-center">
                      {/* Logo LILOBA */}
          <div className="mb-4 flex justify-center">
            <Logo size={64} />
          </div>
                      

            <h1 className="mb-2 text-2xl font-bold leading-tight text-[var(--color-primary)] md:text-3xl">
              Bienvenue sur {BRANDING.app.name}
            </h1>

            <p className="text-sm font-light tracking-wide text-[var(--muted)]">
              Pour te répondre au mieux, dis-nous ton âge
            </p>
          </div>

          {/* ==================== LISTE DES ÂGES ==================== */}
          <div className="flex flex-col gap-2.5">
            {AGE_OPTIONS.map((option, index) => {
              const isSelected = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className={`group relative flex items-center overflow-hidden rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--surface)] shadow-md"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-primary)] hover:shadow-sm"
                  }`}
                >
                  {/* Numéral romain */}
                  <span
                    className={`mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                      isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--border)] text-[var(--muted)] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {ROMAN_NUMERALS[index] ?? "•"}
                  </span>

                  {/* Infos */}
                  <div className="flex-1">
                    <div
                      className={`mb-0.5 text-sm font-medium transition-colors md:text-base ${
                        isSelected
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-[11px] font-light text-[var(--muted)] md:text-xs">
                      {option.description}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <span className="ml-2 text-lg font-bold text-[var(--color-accent)]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== BOUTON CONTINUER (fixe en bas) ==================== */}
      <div className="relative z-10 border-t border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mx-auto w-full max-w-[440px]">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className="w-full rounded-2xl bg-[var(--color-accent)] px-6 py-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:brightness-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {selected ? "Continuer →" : "Choisis ton âge"}
          </button>
        </div>
      </div>
    </div>
  );
}
