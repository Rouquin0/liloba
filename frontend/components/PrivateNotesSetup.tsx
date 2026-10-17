"use client";

import { useState } from "react";
import PinKeypad from "./PinKeypad";

interface PrivateNotesSetupProps {
  onComplete: (
    pin: string,
    question: string,
    answer: string
  ) => void;
  onCancel: () => void;
}

export default function PrivateNotesSetup({
  onComplete,
  onCancel,
}: PrivateNotesSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pinPhase, setPinPhase] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [shake, setShake] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ---------- Étape 1 : saisie du code au clavier rond ----------

  const handlePinChange = (next: string) => {
    if (shake) return;
    setError(null);

    if (pinPhase === "create") {
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => setPinPhase("confirm"), 200);
      }
      return;
    }

    setConfirmPin(next);
    if (next.length === 4) {
      if (next === pin) {
        setTimeout(() => setStep(2), 250);
      } else {
        setShake(true);
        setError("Les 2 codes ne correspondent pas");
        setTimeout(() => {
          setPin("");
          setConfirmPin("");
          setPinPhase("create");
          setShake(false);
        }, 700);
      }
    }
  };

  const backToPinCreate = () => {
    setPin("");
    setConfirmPin("");
    setError(null);
    setPinPhase("create");
  };

  const handleStep2 = () => {
    if (!question.trim()) {
      setError("Écris une question");
      return;
    }
    if (!answer.trim()) {
      setError("Écris une réponse");
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleFinish = () => {
    onComplete(pin, question, answer);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-accent)]"
          style={{ background: "var(--surface-hover)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Notes personnelles
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Étape {step} sur 3
          </p>
        </div>
      </div>

      {/* Étape 1 — Code */}
      {step === 1 && (
        <div className="flex flex-col items-center">
          <p className="mb-1 text-base font-semibold text-[var(--foreground)]">
            {pinPhase === "create" ? "Choisis ton code" : "Confirme ton code"}
          </p>
          <p className="mb-6 text-center text-xs text-[var(--muted)]">
            {pinPhase === "create" ? (
              <>
                Un <strong className="text-[var(--foreground)]">code à 4 chiffres</strong> pour protéger tes notes.
              </>
            ) : (
              "Entre-le une seconde fois."
            )}
          </p>

          <PinKeypad
            value={pinPhase === "create" ? pin : confirmPin}
            onChange={handlePinChange}
            error={shake}
            disabled={shake}
            message={error}
            leftSlot={
              pinPhase === "confirm" ? (
                <button
                  type="button"
                  onClick={backToPinCreate}
                  className="text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  Retour
                </button>
              ) : undefined
            }
          />

          <button
            type="button"
            onClick={onCancel}
            className="mt-6 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Étape 2 — Question secours */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[var(--muted)]">
            Choisis une <strong className="text-[var(--foreground)]">question de secours</strong> au cas où tu oublierais ton code.
          </p>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex : Nom de mon premier animal ?"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Réponse
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Ta réponse"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                backToPinCreate();
                setStep(1);
              }}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleStep2}
              disabled={!question.trim() || !answer.trim()}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-all hover:brightness-90 disabled:opacity-50"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 — Confirmation */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-1 text-sm font-semibold text-[var(--color-accent)]">
              Configuration terminée
            </p>
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              Tes notes seront <strong className="text-[var(--foreground)]">chiffrées avec AES</strong> et protégées par ton code à 4 chiffres.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Important :</strong> Si tu oublies ton code ET ta réponse de secours, tes notes seront <strong className="text-red-500">définitivement perdues</strong>. Note bien ces informations quelque part.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-all hover:brightness-90"
          >
            Commencer à écrire
          </button>
        </div>
      )}
    </div>
  );
}
