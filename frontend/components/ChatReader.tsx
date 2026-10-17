"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useState, useRef, useEffect, useCallback } from "react";
import { BRANDING } from "@/lib/branding";
import { getAge } from "@/lib/preferences";
import {
  getActiveConversationId,
  setActiveConversationId,
  getMessages,
  createConversation,
  saveMessages,
  type Message,
} from "@/lib/conversations";
import {
  askApollosStream,
  ApiError,
  type StreamEvent,
} from "@/lib/api";
import {
  canSend,
  registerMessage,
  RATE_LIMIT_CONFIG,
} from "@/lib/rate-limit";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

// ============================================================
// UTILITAIRES
// ============================================================

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================
// ChatReader — Version réutilisable du chat Apollos
// ============================================================

interface ChatReaderProps {
  compact?: boolean;
  /** Mode éphémère (contrôlé par le parent, ex. ChatPage) */
  ephemeral?: boolean;
}

export default function ChatReader({
  compact = false,
  ephemeral = false,
}: ChatReaderProps) {
  const { isOnline } = useOnlineStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [bibleRef, setBibleRef] = useState<{
    livre: string;
    chapitre: number;
  } | null>(null);

  // 🚦 Rate limiting
  const [remainingToday, setRemainingToday] = useState(
    RATE_LIMIT_CONFIG.maxPerDay
  );
  const [secondsUntilAllowed, setSecondsUntilAllowed] = useState(0);
    const [blockedReason, setBlockedReason] = useState<
    "minute" | "day" | "clock" | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ============================================================
  // RATE LIMIT — refresh
  // ============================================================

  const refreshRateLimit = useCallback(() => {
    const check = canSend();
    setRemainingToday(check.remainingToday);
    setSecondsUntilAllowed(check.secondsUntilAllowed);
    setBlockedReason(check.allowed ? null : check.reason ?? null);
  }, []);

  useEffect(() => {
    refreshRateLimit();
    const onUpdate = () => refreshRateLimit();
    window.addEventListener("liloba:rate-limit-updated", onUpdate);
    return () => {
      window.removeEventListener("liloba:rate-limit-updated", onUpdate);
    };
  }, [refreshRateLimit]);

  // Timer pour décompter les secondes
  useEffect(() => {
    if (secondsUntilAllowed <= 0) return;
    const timer = setInterval(() => {
      refreshRateLimit();
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsUntilAllowed, refreshRateLimit]);

  // ============================================================
  // CHARGEMENT INITIAL
  // ============================================================

  useEffect(() => {
    const activeId = getActiveConversationId();
    if (activeId) {
      setConversationId(activeId);
      const msgs = getMessages(activeId);
      setMessages(msgs);
    }
    setHydrated(true);
    setIsLoading(false);
  }, []);

  // ============================================================
  // ÉCOUTE LES CHANGEMENTS DE CONVERSATION
  // ============================================================

  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId: string }>;
      const newId = customEvent.detail?.conversationId;
      if (!newId) return;

      setConversationId(newId);
      const msgs = getMessages(newId);
      setMessages(msgs);
      setError(null);
      setActiveConversationId(newId);
    };

    window.addEventListener("liloba:switch-conversation", handleSwitch);
    return () => {
      window.removeEventListener("liloba:switch-conversation", handleSwitch);
    };
  }, []);

  // ============================================================
  // NOUVELLE CONVERSATION
  // ============================================================

  useEffect(() => {
    const handleNew = () => {
      setConversationId(null);
      setMessages([]);
      setError(null);
      setActiveConversationId(null);
    };

    window.addEventListener("liloba:new-conversation", handleNew);
    return () => {
      window.removeEventListener("liloba:new-conversation", handleNew);
    };
  }, []);

  // ============================================================
  // ÉCOUTE LE CHAPITRE BIBLE ACTIF
  // ============================================================

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ livre: string; chapitre: number }>)
        .detail;
      if (detail?.livre && detail?.chapitre) {
        setBibleRef({ livre: detail.livre, chapitre: detail.chapitre });
      }
    };

    window.addEventListener("liloba:bible-chapter-changed", handler);
    return () => {
      window.removeEventListener("liloba:bible-chapter-changed", handler);
    };
  }, []);

  // ============================================================
  // SAUVEGARDE AUTOMATIQUE
  // ============================================================

  useEffect(() => {
    if (ephemeral) return;
    if (!hydrated || !conversationId) return;
    if (messages.length === 0) return;
    saveMessages(conversationId, messages);
  }, [messages, hydrated, conversationId, ephemeral]);

  // ============================================================
  // AUTO-SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ============================================================
  // ENVOI EN STREAMING
  // ============================================================

  const handleSend = useCallback(
    async (question: string) => {
      if (isLoading) return;

      if (!isOnline) {
        setError("Apollos a besoin d'internet pour répondre.");
        return;
      }

      // 🚦 Vérifie le rate limit AVANT d'envoyer
      const check = canSend();
      if (!check.allowed) {
        if (check.reason === "day") {
          setError(
            "Limite quotidienne de messages atteinte pour Apollos. Revenez demain !"
          );
        } else {
          setError(
            "Vous envoyez des messages trop rapidement. Veuillez patienter une minute."
          );
        }
        refreshRateLimit();
        return;
      }

      // Enregistre l'envoi
      registerMessage();
      refreshRateLimit();

      setError(null);

      let activeConvId = conversationId;
      if (!ephemeral && !activeConvId) {
        const conv = createConversation();
        activeConvId = conv.id;
        setConversationId(conv.id);
      }

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: question,
      };

      const assistantId = makeId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
        status: "Recherche des passages…",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      const historique = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      const updateAssistant = (patch: Partial<Message>) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m))
        );
      };

      let charQueue = "";
      let isTyping = false;

      const flushQueue = () => {
        if (isTyping) return;
        isTyping = true;

        const interval = setInterval(() => {
          if (charQueue.length === 0) {
            clearInterval(interval);
            isTyping = false;
            return;
          }

          const take = Math.min(2, charQueue.length);
          const chunk = charQueue.slice(0, take);
          charQueue = charQueue.slice(take);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        }, 15);
      };

      const pushToQueue = (text: string) => {
        charQueue += text;
        flushQueue();
      };

      const waitForQueueEmpty = async () => {
        while (charQueue.length > 0 || isTyping) {
          await new Promise((r) => setTimeout(r, 30));
        }
      };

      const userAge = getAge() ?? "18+";

      try {
        await askApollosStream(
          {
            question,
            niveau: userAge,
            user_id: "web",
            historique,
          },
          (event: StreamEvent) => {
            switch (event.type) {
              case "status":
                updateAssistant({ status: event.message });
                break;

              case "sources":
                updateAssistant({
                  sources: event.sources,
                  status: undefined,
                });
                break;

              case "chunk":
                pushToQueue(event.content);
                updateAssistant({ status: undefined });
                break;

              case "error":
                updateAssistant({
                  content: event.message,
                  isError: true,
                  isStreaming: false,
                  status: undefined,
                });
                break;

              case "done":
                waitForQueueEmpty().then(() => {
                  updateAssistant({
                    isStreaming: false,
                    status: undefined,
                  });
                });
                break;
            }
          },
          controller.signal
        );

        await waitForQueueEmpty();
        updateAssistant({ isStreaming: false, status: undefined });
      } catch (err) {
        let errorText = "Désolé, une erreur technique est survenue. Réessaie.";

        if (err instanceof ApiError) {
          errorText = err.message;
        } else if (err instanceof Error && err.name !== "AbortError") {
          if (err.message.includes("fetch")) {
            errorText =
              "Impossible de contacter le serveur. Vérifie que le backend est bien lancé sur le port 8000.";
          }
        }

        if (err instanceof Error && err.name === "AbortError") {
          updateAssistant({
            content: "[Réponse annulée]",
            isStreaming: false,
            status: undefined,
          });
        } else {
          setError(errorText);
          updateAssistant({
            content: errorText,
            isError: true,
            isStreaming: false,
            status: undefined,
          });
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, messages, conversationId, isOnline, ephemeral, refreshRateLimit]
  );

  // ============================================================
  // RENDU
  // ============================================================

  const hasMessages = messages.length > 0;
  const msgPadding = compact ? "px-3 py-4" : "px-4 py-6 md:px-6";

  const inputDisabled = isLoading || !isOnline || blockedReason !== null;

  return (
    <div className="flex h-full flex-col">
      {/* ==================== MESSAGES ==================== */}
      <div className={`flex-1 overflow-y-auto ${msgPadding}`}>
        <div
          className={`mx-auto flex ${
            compact ? "max-w-full" : "max-w-3xl"
          } flex-col gap-6`}
        >
          {ephemeral && hasMessages && (
            <div className="animate-fade-in mx-auto flex items-center gap-2 rounded-full border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--muted)]">
              <span>Discussion éphémère · non enregistrée</span>
            </div>
          )}

          {!hasMessages && (
            <WelcomeScreen
              onSuggestionClick={handleSend}
              ephemeral={ephemeral}
              compact={compact}
            />
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
              isError={msg.isError}
              isStreaming={msg.isStreaming}
              status={msg.status}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chip : citer le passage biblique actif */}
      {bibleRef && !isLoading && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-3 pt-2 md:px-4">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Contexte :
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {bibleRef.livre} {bibleRef.chapitre}
            </span>
          </div>
        </div>
      )}

      {/* 🚦 Rate limit banner */}
      {blockedReason && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-3 pt-2 md:px-4">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
                        <span>
              {blockedReason === "day" ? (
                <>
                  <strong>Limite quotidienne</strong> atteinte
                  ({RATE_LIMIT_CONFIG.maxPerDay}/jour). Revenez demain !
                </>
              ) : blockedReason === "clock" ? (
                <>
                  <strong>Horloge modifiée détectée.</strong> Vérifie l&apos;heure
                  de ton appareil et recharge l&apos;application.
                </>
              ) : (
                <>
                  <strong>Trop rapide.</strong> Patientez{" "}
                  {secondsUntilAllowed}s avant le prochain message.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Compteur discret (si proche de la limite) */}
      {remainingToday <= 5 && remainingToday > 0 && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-3 pt-1 md:px-4">
          <div className="mx-auto flex max-w-3xl items-center justify-end">
            <span className="text-[10px] text-[var(--muted)]">
              Messages restants aujourd&apos;hui :{" "}
              <strong>{remainingToday}</strong>/{RATE_LIMIT_CONFIG.maxPerDay}
            </span>
          </div>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={inputDisabled}
        offline={!isOnline}
        bibleContext={bibleRef}
      />
    </div>
  );
}

// ============================================================
// ÉCRAN D'ACCUEIL
// ============================================================

function WelcomeScreen({
  onSuggestionClick,
  ephemeral = false,
  compact = false,
}: {
  onSuggestionClick: (q: string) => void;
  ephemeral?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="animate-fade-in flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="relative mb-6">
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{ background: "var(--color-accent)" }}
          aria-hidden="true"
        />
        <div
          className={`relative flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg ${
            compact ? "h-14 w-14 text-3xl" : "h-20 w-20 text-4xl"
          }`}
        >
          {BRANDING.assistant.avatar}
        </div>
      </div>

      <h1
        className={`mb-3 text-center font-bold text-[var(--color-primary)] ${
          compact ? "text-lg" : "text-2xl md:text-3xl"
        }`}
      >
        Bonjour, je suis {BRANDING.assistant.name}
      </h1>

      <p
        className={`mb-6 max-w-md text-center leading-relaxed text-[var(--muted)] ${
          compact ? "text-xs" : "text-sm md:text-base"
        }`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {compact
          ? "Pose-moi tes questions sur les Écritures."
          : "Ton compagnon d'étude de la Parole. Pose-moi tes questions sur les Écritures."}
      </p>

      {ephemeral && (
        <p className="mb-6 max-w-lg rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--muted)]">
          Discussion éphémère : elle n&apos;apparaît pas dans « Récentes » et
          disparaît quand tu la quittes.
        </p>
      )}

      <div className="w-full max-w-2xl">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Essaie une question
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {BRANDING.suggestions.slice(0, compact ? 3 : 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className={`group rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-md ${
                compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{suggestion}</span>
                {!compact && (
                  <span className="text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
