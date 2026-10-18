// "use client";

// import { useOnlineStatus } from "@/hooks/useOnlineStatus";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { BRANDING } from "@/lib/branding";
// import { getAge, isOnboarded } from "@/lib/preferences";
// import {
//   getActiveConversationId,
//   setActiveConversationId,
//   getMessages,
//   createConversation,
//   saveMessages,
//   type Message,
// } from "@/lib/conversations";
// import {
//   askApollosStream,
//   ApiError,
//   type StreamEvent,
// } from "@/lib/api";
// import ChatMessage from "@/components/ChatMessage";
// import ChatInput from "@/components/ChatInput";

// // ============================================================
// // UTILITAIRES
// // ============================================================

// function makeId(): string {
//   return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
// }

// // ============================================================
// // PAGE
// // ============================================================

// export default function ChatPage() {
//   const router = useRouter();
//   const { isOnline } = useOnlineStatus();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hydrated, setHydrated] = useState(false);
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   // 👻 Mode éphémère (téléphone uniquement) : rien n'est enregistré
//   const [ephemeral, setEphemeral] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   // ============================================================
//   // CHARGEMENT INITIAL
//   // ============================================================

//   useEffect(() => {
//     if (!isOnboarded()) {
//       router.replace("/onboarding");
//       return;
//     }

//     // Ne crée PAS de conv ici — attend le 1er message
//     const activeId = getActiveConversationId();

//     if (activeId) {
//       setConversationId(activeId);
//       const msgs = getMessages(activeId);
//       setMessages(msgs);
//     }

//     setHydrated(true);
//     setIsLoading(false);
//   }, [router]);

//   // ============================================================
//   // ÉCOUTE LES CHANGEMENTS DE CONVERSATION
//   // ============================================================

//   useEffect(() => {
//     const handleSwitch = (e: Event) => {
//       const customEvent = e as CustomEvent<{ conversationId: string }>;
//       const newId = customEvent.detail?.conversationId;
//       if (!newId) return;

//       setEphemeral(false);
//       setConversationId(newId);
//       const msgs = getMessages(newId);
//       setMessages(msgs);
//       setError(null);
//       setActiveConversationId(newId);
//     };

//     window.addEventListener("liloba:switch-conversation", handleSwitch);
//     return () => {
//       window.removeEventListener("liloba:switch-conversation", handleSwitch);
//     };
//   }, []);

//   // ============================================================
//   // NOUVELLE CONVERSATION (depuis le menu)
//   // ============================================================

//   useEffect(() => {
//     const handleNew = () => {
//       // On efface le state mais on crée la conv au 1er message
//       setEphemeral(false);
//       setConversationId(null);
//       setMessages([]);
//       setError(null);
//       setActiveConversationId(null);
//     };

//     window.addEventListener("liloba:new-conversation", handleNew);
//     return () => {
//       window.removeEventListener("liloba:new-conversation", handleNew);
//     };
//   }, []);

//   // ============================================================
//   // SAUVEGARDE AUTOMATIQUE
//   // ============================================================

//   useEffect(() => {
//     if (ephemeral) return; // 👻 Mode éphémère : on n'enregistre rien
//     if (!hydrated || !conversationId) return;
//     if (messages.length === 0) return; // Ne sauvegarde pas une conv vide
//     saveMessages(conversationId, messages);
//   }, [messages, hydrated, conversationId, ephemeral]);

//   // ============================================================
//   // AUTO-SCROLL
//   // ============================================================

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   // ============================================================
//   // ENVOI EN STREAMING
//   // ============================================================

//   const handleSend = useCallback(
//     async (question: string) => {
//       if (isLoading) return;

//       if (!isOnline) {
//         setError("Apollos a besoin d'internet pour répondre.");
//         return;
//       }

//       setError(null);

//       // Créer la conv ICI si elle n'existe pas encore
//       let activeConvId = conversationId;
//       if (!ephemeral && !activeConvId) {
//         const conv = createConversation();
//         activeConvId = conv.id;
//         setConversationId(conv.id);
//       }

//       const userMsg: Message = {
//         id: makeId(),
//         role: "user",
//         content: question,
//       };

//       const assistantId = makeId();
//       const assistantMsg: Message = {
//         id: assistantId,
//         role: "assistant",
//         content: "",
//         isStreaming: true,
//         status: "Recherche des passages…",
//       };

//       setMessages((prev) => [...prev, userMsg, assistantMsg]);
//       setIsLoading(true);

//       const historique = messages.slice(-4).map((m) => ({
//         role: m.role,
//         content: m.content,
//       }));

//       const controller = new AbortController();
//       abortRef.current = controller;

//       const updateAssistant = (patch: Partial<Message>) => {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === assistantId ? { ...m, ...patch } : m
//           )
//         );
//       };

//       // Effet machine à écrire
//       let charQueue = "";
//       let isTyping = false;

//       const flushQueue = () => {
//         if (isTyping) return;
//         isTyping = true;

//         const interval = setInterval(() => {
//           if (charQueue.length === 0) {
//             clearInterval(interval);
//             isTyping = false;
//             return;
//           }

//           const take = Math.min(2, charQueue.length);
//           const chunk = charQueue.slice(0, take);
//           charQueue = charQueue.slice(take);

//           setMessages((prev) =>
//             prev.map((m) =>
//               m.id === assistantId
//                 ? { ...m, content: m.content + chunk }
//                 : m
//             )
//           );
//         }, 15);
//       };

//       const pushToQueue = (text: string) => {
//         charQueue += text;
//         flushQueue();
//       };

//       const waitForQueueEmpty = async () => {
//         while (charQueue.length > 0 || isTyping) {
//           await new Promise((r) => setTimeout(r, 30));
//         }
//       };

//       const userAge = getAge() ?? "18+";

//       try {
//         await askApollosStream(
//           {
//             question,
//             niveau: userAge,
//             user_id: "web",
//             historique,
//           },
//           (event: StreamEvent) => {
//             switch (event.type) {
//               case "status":
//                 updateAssistant({ status: event.message });
//                 break;

//               case "sources":
//                 updateAssistant({
//                   sources: event.sources,
//                   status: undefined,
//                 });
//                 break;

//               case "chunk":
//                 pushToQueue(event.content);
//                 updateAssistant({ status: undefined });
//                 break;

//               case "error":
//                 updateAssistant({
//                   content: event.message,
//                   isError: true,
//                   isStreaming: false,
//                   status: undefined,
//                 });
//                 break;

//               case "done":
//                 waitForQueueEmpty().then(() => {
//                   updateAssistant({
//                     isStreaming: false,
//                     status: undefined,
//                   });
//                 });
//                 break;
//             }
//           },
//           controller.signal
//         );

//         await waitForQueueEmpty();
//         updateAssistant({ isStreaming: false, status: undefined });
//       } catch (err) {
//         let errorText =
//           "Désolé, une erreur technique est survenue. Réessaie.";

//         if (err instanceof ApiError) {
//           errorText = err.message;
//         } else if (err instanceof Error && err.name !== "AbortError") {
//           if (err.message.includes("fetch")) {
//             errorText =
//               "Impossible de contacter le serveur. Vérifie que le backend est bien lancé sur le port 8000.";
//           }
//         }

//         if (err instanceof Error && err.name === "AbortError") {
//           updateAssistant({
//             content: "[Réponse annulée]",
//             isStreaming: false,
//             status: undefined,
//           });
//         } else {
//           setError(errorText);
//           updateAssistant({
//             content: errorText,
//             isError: true,
//             isStreaming: false,
//             status: undefined,
//           });
//         }
//       } finally {
//         setIsLoading(false);
//         abortRef.current = null;
//       }
//     },
//     [isLoading, messages, conversationId, isOnline, ephemeral]
//   );

//   // ============================================================
//   // RENDU
//   // ============================================================

//   // ============================================================
//   // MODE ÉPHÉMÈRE (téléphone uniquement)
//   // ============================================================

//   const toggleEphemeral = () => {
//     if (isLoading) return;
//     if (
//       ephemeral &&
//       messages.length > 0 &&
//       !confirm("Quitter le mode éphémère ? Cette discussion sera effacée.")
//     ) {
//       return;
//     }
//     // Dans les deux sens, on repart d'une discussion vierge
//     setEphemeral(!ephemeral);
//     setConversationId(null);
//     setMessages([]);
//     setError(null);
//   };

//   // Si l'écran devient large (ordinateur), le mode éphémère est coupé
//   useEffect(() => {
//     if (!ephemeral) return;
//     const mq = window.matchMedia("(min-width: 768px)");
//     const onChange = () => {
//       if (mq.matches) {
//         abortRef.current?.abort();
//         setEphemeral(false);
//         setConversationId(null);
//         setMessages([]);
//         setError(null);
//       }
//     };
//     onChange();
//     mq.addEventListener("change", onChange);
//     return () => mq.removeEventListener("change", onChange);
//   }, [ephemeral]);

//   const hasMessages = messages.length > 0;

//   return (
//     <div className="flex h-full flex-col">
//       {/* ==================== HEADER MOBILE ==================== */}
//       <header className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/95 px-3 py-2 backdrop-blur-sm md:hidden">
//         <button
//           type="button"
//           onClick={() => {
//             if (typeof window !== "undefined") {
//               window.dispatchEvent(new Event("liloba:open-menu"));
//             }
//           }}
//           className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
//           aria-label="Ouvrir le menu"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="h-5 w-5"
//           >
//             <line x1="4" x2="20" y1="6" y2="6" />
//             <line x1="4" x2="20" y1="12" y2="12" />
//             <line x1="4" x2="20" y1="18" y2="18" />
//           </svg>
//         </button>

//         <span className="flex-1 text-sm font-semibold text-[var(--foreground)]">
//           {BRANDING.assistant.name}
//         </span>

//         {/* 👻 Bouton discussion éphémère (le bandeau est déjà mobile uniquement) */}
//         <button
//           type="button"
//           onClick={toggleEphemeral}
//           disabled={isLoading}
//           aria-pressed={ephemeral}
//           aria-label={
//             ephemeral ? "Quitter la discussion éphémère" : "Discussion éphémère"
//           }
//           title={ephemeral ? "Quitter le mode éphémère" : "Discussion éphémère"}
//           className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 ${
//             ephemeral
//               ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
//               : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
//           }`}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             className="h-5 w-5"
//             aria-hidden="true"
//           >
//             <circle cx="12" cy="12" r="9" strokeDasharray="3 3.2" />
//           </svg>
//         </button>
//       </header>

//       {/* ==================== MESSAGES ==================== */}
//       <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
//         <div className="mx-auto flex max-w-3xl flex-col gap-6">
//           {ephemeral && hasMessages && (
//             <div className="animate-fade-in mx-auto flex items-center gap-2 rounded-full border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--muted)] md:hidden">
//               <span>Discussion éphémère · non enregistrée</span>
//             </div>
//           )}

//           {!hasMessages && (
//             <WelcomeScreen onSuggestionClick={handleSend} ephemeral={ephemeral} />
//           )}

//           {messages.map((msg) => (
//             <ChatMessage
//               key={msg.id}
//               role={msg.role}
//               content={msg.content}
//               sources={msg.sources}
//               isError={msg.isError}
//               isStreaming={msg.isStreaming}
//               status={msg.status}
//             />
//           ))}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       <ChatInput
//         onSend={handleSend}
//         disabled={isLoading || !isOnline}
//         offline={!isOnline}
//       />
//     </div>
//   );
// }

// // ============================================================
// // ÉCRAN D'ACCUEIL
// // ============================================================

// function WelcomeScreen({
//   onSuggestionClick,
//   ephemeral = false,
// }: {
//   onSuggestionClick: (q: string) => void;
//   ephemeral?: boolean;
// }) {
//   return (
//     <div className="animate-fade-in flex flex-1 flex-col items-center justify-center px-4 py-8">
//       <div className="relative mb-6">
//         <div
//           className="absolute inset-0 rounded-full opacity-20 blur-2xl"
//           style={{ background: "var(--color-accent)" }}
//           aria-hidden="true"
//         />
//         <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-4xl text-white shadow-lg">
//           {BRANDING.assistant.avatar}
//         </div>
//       </div>

//       <h1 className="mb-3 text-center text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
//         Bonjour, je suis {BRANDING.assistant.name}
//       </h1>

//             <p
//         className="mb-10 max-w-md text-center text-sm leading-relaxed text-[var(--muted)] md:text-base"
//         style={{ fontFamily: "var(--font-serif)" }}
//       >
//         Ton compagnon d&apos;étude de la Parole.
//         <br />
//         Pose-moi tes questions sur les Écritures — versets, personnages,
//         thèmes ou défis du quotidien — et je t&apos;aide à mieux comprendre.
//       </p>

//       {ephemeral && (
//         <p className="mb-8 max-w-lg rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--muted)] md:hidden">
//           Discussion éphémère : elle n&apos;apparaît pas dans « Récentes » et
//           disparaît quand tu la quittes.
//         </p>
//       )}

//       <div className="w-full max-w-2xl">
//         <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
//           Essaie une question
//         </p>

//         <div className="flex flex-wrap justify-center gap-2">
//           {BRANDING.suggestions.map((suggestion) => (
//             <button
//               key={suggestion}
//               type="button"
//               onClick={() => onSuggestionClick(suggestion)}
//               className="group rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-md"
//             >
//               <span className="flex items-center gap-2">
//                 <span>{suggestion}</span>
//                 <span className="text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
//                   →
//                 </span>
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import { isOnboarded } from "@/lib/preferences";
import ChatReader from "@/components/ChatReader";
import ApollosMaintenanceBanner from "@/components/ApollosMaintenanceBanner";

// ============================================================
// ChatPage — Utilise ChatReader (rate limit inclus)
// ============================================================

export default function ChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Vérifie l'onboarding
  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
      return;
    }
    setMounted(true);
  }, [router]);

  // Mode éphémère (mobile uniquement)
  const [ephemeral, setEphemeral] = useState(false);

  // Si l'écran devient large (desktop), coupe le mode éphémère
  useEffect(() => {
    if (!ephemeral) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) {
        setEphemeral(false);
      }
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [ephemeral]);

  // Fallback pendant l'onboarding
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs text-[var(--muted)]">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header mobile (menu hamburger + mode éphémère) */}
      <header className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/95 px-3 py-2 backdrop-blur-sm md:hidden">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("liloba:open-menu"));
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Ouvrir le menu"
        >
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
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <span className="flex-1 text-sm font-semibold text-[var(--foreground)]">
          {BRANDING.assistant.name}
        </span>

        <button
          type="button"
          onClick={() => setEphemeral(!ephemeral)}
          aria-pressed={ephemeral}
          aria-label={
            ephemeral ? "Quitter la discussion éphémère" : "Discussion éphémère"
          }
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            ephemeral
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" strokeDasharray="3 3.2" />
          </svg>
        </button>
      </header>

      <div className="px-3 pt-2 md:px-4">
        <ApollosMaintenanceBanner compact />
      </div>
      {/* Contenu du chat (avec rate limit inclus dans ChatReader) */}
      <div className="flex-1 overflow-hidden">
        <ChatReader compact={false} ephemeral={ephemeral} />
      </div>
    </div>
  );
}
