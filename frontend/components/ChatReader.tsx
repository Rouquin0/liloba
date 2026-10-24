"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link"; // <-- NOUVEL IMPORT
import { BRANDING } from "@/lib/branding";
import { getAge } from "@/lib/preferences";
import { useUser } from "@/hooks/useUser"; // <-- NOUVEL IMPORT
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
// SUPPRESSION de l'import lib/rate-limit
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
  ephemeral?: boolean;
}

export default function ChatReader({
  compact = false,
  ephemeral = false,
}: ChatReaderProps) {
  // 🔧 Mets false quand Apollos sera prêt à répondre
  const MAINTENANCE = true; 

  const isOnline = useOnlineStatus();
  const { user, loading: userLoading } = useUser(); // <-- AJOUT
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [bibleRef, setBibleRef] = useState<{
    livre: string;
    chapitre: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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
      if (MAINTENANCE) return; 
      if (isLoading) return;
      
      // VÉRIFICATION DE LA CONNEXION
      if (!user) {
        setError("Tu dois être connecté pour discuter avec Apollos.");
        return;
      }

      if (!isOnline) {
        setError("Apollos a besoin d'internet pour répondre.");
        return;
      }

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
          // Si l'erreur vient du backend (ex: 429 Limite atteinte ou 401 Session)
          errorText = err.message; 
        } else if (err instanceof Error && err.name !== "AbortError") {
          if (err.message.includes("fetch")) {
            errorText =
              "Impossible de contacter le serveur. Vérifie ta connexion internet.";
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
    [isLoading, messages, conversationId, isOnline, ephemeral, user]
  );

  // ============================================================
  // RENDU
  // ============================================================

  const hasMessages = messages.length > 0;
  const msgPadding = compact ? "px-3 py-4" : "px-4 py-6 md:px-6";

  // L'input est désactivé s'il n'y a pas d'utilisateur, si c'est en chargement, hors ligne ou en maintenance
  const inputDisabled = isLoading || !isOnline || MAINTENANCE || !user || userLoading;

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

      {/* BANNIÈRE DE CONNEXION SI NON CONNECTÉ */}
      {!user && !userLoading && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-3 py-4 md:px-4">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[var(--foreground)]">
              Connecte-toi pour discuter avec Apollos et sauvegarder tes conversations.
            </p>
            <Link
              href="/auth/sign-in"
              className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
            >
              Se connecter / S'inscrire
            </Link>
          </div>
        </div>
      )}

      {/* Chip : citer le passage biblique actif */}
      {bibleRef && !isLoading && user && (
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

      {/* Erreur globale */}
      {error && (
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
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input : on ne l'affiche que si l'utilisateur est connecté */}
      {user ? (
        <ChatInput
          onSend={handleSend}
          disabled={inputDisabled} 
          offline={!isOnline}
          bibleContext={bibleRef}
        />
      ) : null}
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