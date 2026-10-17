"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { detectPlatform, type Platform } from "@/lib/detect-platform";

// ============================================================
// LILOBA — Clavier de code (style iPhone sur iOS, carré ailleurs)
// ============================================================

interface PinKeypadProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  message?: string | null;
  leftSlot?: ReactNode;
}

const LETTERS: Record<string, string> = {
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
};

// ============================================================
// HELPERS
// ============================================================

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

// ============================================================
// TOUCHE RONDE (iOS)
// ============================================================

function RoundKey({
  digit,
  onPress,
  disabled,
}: {
  digit: string;
  onPress: (d: string) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(digit)}
      disabled={disabled}
      aria-label={digit}
      className="flex h-[4.5rem] w-[4.5rem] select-none flex-col items-center justify-center rounded-full transition-all duration-150 active:scale-90 active:opacity-60 disabled:opacity-40"
      style={{
        background: "color-mix(in srgb, var(--foreground) 7%, var(--surface))",
        boxShadow:
          "0 1px 2px color-mix(in srgb, var(--foreground) 6%, transparent)",
      }}
    >
      <span className="text-[1.75rem] font-light leading-none text-[var(--foreground)]">
        {digit}
      </span>
      <span
        className={`mt-1 text-[9px] font-semibold leading-none tracking-[0.2em] text-[var(--muted)] ${
          LETTERS[digit] ? "" : "invisible"
        }`}
      >
        {LETTERS[digit] ?? "."}
      </span>
    </button>
  );
}

// ============================================================
// TOUCHE CARRÉE (Android / Desktop)
// ============================================================

function SquareKey({
  digit,
  onPress,
  disabled,
}: {
  digit: string;
  onPress: (d: string) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(digit)}
      disabled={disabled}
      aria-label={digit}
      className="group flex aspect-square w-full select-none flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-150 hover:border-[var(--color-accent)]/40 hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-40"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <span className="text-2xl font-medium leading-none text-[var(--foreground)]">
        {digit}
      </span>
      <span
        className={`text-[9px] font-semibold uppercase leading-none tracking-[0.15em] text-[var(--muted)] ${
          LETTERS[digit] ? "" : "invisible"
        }`}
      >
        {LETTERS[digit] ?? "."}
      </span>
    </button>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function PinKeypad({
  value,
  onChange,
  length = 4,
  error = false,
  disabled = false,
  message = null,
  leftSlot,
}: PinKeypadProps) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPlatform(detectPlatform());
  }, []);

  const press = (digit: string) => {
    if (disabled || value.length >= length) return;
    vibrate(8);
    onChange(value + digit);
  };

  const back = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  // Clavier physique (PC / Mac)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  if (!mounted) return null;

  const isIOSPlatform = platform === "ios";

  return (
    <div className="flex flex-col items-center">
      {/* Keyframe secousse */}
      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(9px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(4px); }
        }
      `}</style>

      {/* Points du PIN */}
      <div
        className={`mb-3 flex justify-center ${
          isIOSPlatform ? "gap-4" : "gap-3"
        }`}
        style={{
          animation: error ? "pin-shake 0.45s ease-in-out" : undefined,
        }}
      >
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          return (
            <span
              key={i}
              className={`rounded-full transition-all duration-150 ${
                isIOSPlatform ? "h-3.5 w-3.5 border-2" : "h-3 w-3"
              }`}
              style={{
                borderColor: error
                  ? "#ef4444"
                  : filled
                  ? "var(--color-accent)"
                  : isIOSPlatform
                  ? "color-mix(in srgb, var(--foreground) 35%, transparent)"
                  : "var(--border)",
                background: error
                  ? "#ef4444"
                  : filled
                  ? "var(--color-accent)"
                  : isIOSPlatform
                  ? "transparent"
                  : "transparent",
                transform: filled ? "scale(1.15)" : "scale(1)",
              }}
            />
          );
        })}
      </div>

      {/* Message */}
      <div
        className="mb-6 h-5 text-center text-xs text-red-500"
        aria-live="polite"
      >
        {message}
      </div>

      {/* Clavier iOS — rond */}
      {isIOSPlatform && (
        <div className="grid grid-cols-3 justify-items-center gap-x-5 gap-y-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <RoundKey key={d} digit={d} onPress={press} disabled={disabled} />
          ))}

          {/* Bas gauche : slot */}
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center">
            {leftSlot}
          </div>

          <RoundKey digit="0" onPress={press} disabled={disabled} />

          {/* Effacer */}
          {value.length > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={disabled}
              aria-label="Effacer"
              className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-[var(--foreground)] transition-all duration-150 active:scale-90 active:opacity-60 disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 20H7L3 12l4-8h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </button>
          ) : (
            <div className="h-[4.5rem] w-[4.5rem]" />
          )}
        </div>
      )}

      {/* Clavier Android / Desktop — carré */}
      {!isIOSPlatform && (
        <div className="w-full max-w-xs">
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <SquareKey key={d} digit={d} onPress={press} disabled={disabled} />
            ))}

            {/* Bas gauche : slot */}
            <div className="flex aspect-square items-center justify-center">
              {leftSlot}
            </div>

            <SquareKey digit="0" onPress={press} disabled={disabled} />

            {/* Effacer */}
            {value.length > 0 ? (
              <button
                type="button"
                onClick={back}
                disabled={disabled}
                aria-label="Effacer"
                className="flex aspect-square w-full items-center justify-center rounded-xl border transition-all duration-150 hover:border-[var(--color-accent)]/40 hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-40"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-[var(--muted)]"
                >
                  <path d="M20 20H7L3 12l4-8h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </button>
            ) : (
              <div className="aspect-square w-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
