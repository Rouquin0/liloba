"use client";

import { useState, useEffect } from "react";
import {
  verifyPin,
  getSecurityQuestion,
  verifySecurityAnswer,
  getLockoutRemaining,
  registerFailedAttempt,
  resetFailedAttempts,
  formatLockout,
  deletePrivateNotesConfig,
} from "@/lib/private-notes";
import PinKeypad from "./PinKeypad";

interface PrivateNotesUnlockProps {
  onUnlock: (pin: string) => void;
  onCancel: () => void;
  /** Appelé après une réinitialisation (notes effacées) pour relancer la création du code */
  onReset?: () => void;
}

export default function PrivateNotesUnlock({
  onUnlock,
  onCancel,
  onReset,
}: PrivateNotesUnlockProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"pin" | "recovery" | "reset">("pin");
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [lockMs, setLockMs] = useState(0);

  useEffect(() => {
    setQuestion(getSecurityQuestion());
  }, []);

  // Compte à rebours du blocage (après trop d'essais)
  useEffect(() => {
    const tick = () => setLockMs(getLockoutRemaining());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const locked = lockMs > 0;
  const lockMessage = locked
    ? `Trop d'essais · réessaie dans ${formatLockout(lockMs)}`
    : null;

  // ---------- Saisie du code ----------

  const submit = (code: string) => {
    if (getLockoutRemaining() > 0) {
      setPin("");
      return;
    }

    if (verifyPin(code)) {
      resetFailedAttempts();
      onUnlock(code);
      return;
    }

    const r = registerFailedAttempt();
    setShake(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([60, 40, 60]);
      } catch {
        // ignore
      }
    }
    setLockMs(getLockoutRemaining());
    setMessage(
      r.locked
        ? null
        : `Code incorrect · ${r.attemptsLeft} essai${
            r.attemptsLeft > 1 ? "s" : ""
          } restant${r.attemptsLeft > 1 ? "s" : ""}`
    );

    setTimeout(() => {
      setPin("");
      setShake(false);
    }, 700);
  };

  const handleChange = (next: string) => {
    if (locked || shake) return;
    setPin(next);
    if (next.length === 1) setMessage(null);
    if (next.length === 4) submit(next);
  };

  // ---------- Récupération ----------

  const handleRecovery = () => {
    if (getLockoutRemaining() > 0) {
      setLockMs(getLockoutRemaining());
      return;
    }
    if (verifySecurityAnswer(answer)) {
      resetFailedAttempts();
      setError(null);
      setMode("reset");
    } else {
      const r = registerFailedAttempt();
      setLockMs(getLockoutRemaining());
      setError(r.locked ? null : "Réponse incorrecte");
    }
  };

  // Efface les notes (impossibles à déchiffrer sans l'ancien code) et repart de zéro
  const handleConfirmReset = () => {
    deletePrivateNotesConfig();
    if (onReset) onReset();
    else onCancel();
  };

  // ============================================================
  // Mode confirmation de réinitialisation
  // ============================================================
  if (mode === "reset") {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mb-1 text-sm font-semibold text-[var(--color-accent)]">
            Réponse correcte
          </p>
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Tes notes sont chiffrées avec ton ancien code : sans lui, elles ne
            peuvent pas être relues. Tu peux repartir de zéro avec un{" "}
            <strong className="text-[var(--foreground)]">nouveau code</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            <strong className="text-red-500">Attention :</strong> toutes tes
            notes privées actuelles seront{" "}
            <strong className="text-red-500">définitivement effacées</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition-all hover:brightness-90"
          >
            Effacer et recommencer
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Mode récupération
  // ============================================================
  if (mode === "recovery") {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-accent)]"
            style={{ background: "var(--surface-hover)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Récupération
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Réponds à ta question de secours
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Question de secours
          </label>
          <p className="mb-3 text-sm text-[var(--foreground)]">
            {question || "Aucune question définie"}
          </p>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ta réponse…"
            autoFocus
            disabled={locked}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
          />
        </div>

        {(lockMessage || error) && (
          <p className="mb-3 text-xs text-red-500">{lockMessage || error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("pin");
              setAnswer("");
              setError(null);
            }}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={handleRecovery}
            disabled={!answer.trim() || locked}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-all hover:brightness-90 disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Mode code (clavier rond)
  // ============================================================
  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--color-accent)]"
        style={{ background: "var(--surface-hover)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">
        Notes personnelles
      </h2>
      <p className="mb-6 text-xs text-[var(--muted)]">
        Entre ton code à 4 chiffres
      </p>

      <PinKeypad
        value={pin}
        onChange={handleChange}
        error={shake}
        disabled={locked || shake}
        message={lockMessage || message}
        leftSlot={
          <button
            type="button"
            onClick={() => setMode("recovery")}
            className="text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Oublié ?
          </button>
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
  );
}
