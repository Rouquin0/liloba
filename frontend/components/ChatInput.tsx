"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  offline?: boolean;
  /** Référence biblique active à inclure dans la question */
  bibleContext?: { livre: string; chapitre: number } | null;
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Pose ta question…",
  offline,
  bibleContext,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ============================================================
  // DICTÉE VOCALE
  // ============================================================
  const {
    isSupported: voiceSupported,
    isListening,
    toggle: toggleVoice,
  } = useVoiceInput({
    onResult: (text) => {
      setValue((prev) => (prev ? `${prev} ${text}` : text));
    },
    onError: (error) => {
      console.error("Erreur dictée :", error);
    },
  });

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || offline) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)] p-3 md:p-4">
      <div
        className={`mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border p-2 shadow-sm transition-shadow ${
          offline
            ? "border-red-500/30 bg-red-500/5"
            : "border-[var(--border)] bg-[var(--surface)] focus-within:shadow-md"
        }`}
      >
        {/* Bouton micro */}
        {voiceSupported && !offline && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40 ${
              isListening
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--color-primary)]"
            }`}
            title={isListening ? "Arrêter la dictée" : "Dicter une question"}
            aria-label="Dictée vocale"
          >
            {isListening && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-40" />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative h-5 w-5"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
        )}

                {/* Bouton "citer le passage" */}
        {bibleContext && !offline && (
          <button
            type="button"
            onClick={() => {
              const ref = `${bibleContext.livre} ${bibleContext.chapitre}`;
              setValue((prev) => {
                if (prev.includes(`[${ref}]`)) return prev;
                return prev ? `[${ref}] ${prev}` : `[${ref}] `;
              });
              textareaRef.current?.focus();
            }}
            disabled={disabled}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40"
            title="Citer le passage biblique actif"
            aria-label="Citer le passage biblique actif"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <span className="hidden md:inline">Citer</span>
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            offline
              ? "Apollos a besoin d'internet…"
              : isListening
                ? "🎤 Écoute en cours…"
                : placeholder
          }
          disabled={disabled || offline}
          rows={1}
          className="flex-1 resize-none border-0 px-2 py-2 text-sm outline-none disabled:opacity-50"
          style={{
            maxHeight: "160px",
            background: "transparent",
            color: "var(--foreground)",
            caretColor: "var(--color-accent)",
          }}
        />

        {/* Bouton envoyer */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || offline || !value.trim()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all hover:scale-105 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
            offline ? "bg-red-500" : "bg-[var(--color-accent)]"
          }`}
          aria-label={offline ? "Hors ligne" : "Envoyer"}
        >
          {disabled ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : offline ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="2" x2="22" y1="2" y2="22" />
              <path d="M8.5 16.5a5 5 0 0 1 7 0" />
              <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
              <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
              <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
              <path d="M5 12.55a11 11 0 0 1 5.17-3.09" />
              <line x1="12" x2="12.01" y1="20" y2="20" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hint */}
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-[var(--muted)]">
        {offline ? (
          <span className="font-semibold text-red-500">
            📵 Hors ligne — Apollos a besoin d'internet
          </span>
        ) : isListening ? (
          <span className="font-semibold text-[var(--color-accent)]">
            🎤 Écoute en cours… Parle maintenant
          </span>
        ) : (
                  <span className="hidden md:inline">
          Entrée pour envoyer · Shift+Entrée pour un saut de ligne
        </span>
        )}
      </p>
    </div>
  );
}
