"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BRANDING } from "@/lib/branding";
import type { AskResponse } from "@/lib/api";
import SourceCard from "./SourceCard";

// ============================================================
// TYPES
// ============================================================

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: AskResponse["sources"];
  isError?: boolean;
  isStreaming?: boolean;
  status?: string;
}

// ============================================================
// INDICATEUR DE FRAPPE (3 points animés)
// ============================================================

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)]"
        style={{
          animation: "typing-bounce 1.4s ease-in-out infinite",
          animationDelay: "0s",
        }}
      />
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)]"
        style={{
          animation: "typing-bounce 1.4s ease-in-out infinite",
          animationDelay: "0.2s",
        }}
      />
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)]"
        style={{
          animation: "typing-bounce 1.4s ease-in-out infinite",
          animationDelay: "0.4s",
        }}
      />
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ChatMessage({
  role,
  content,
  sources,
  isError,
  isStreaming,
  status,
}: ChatMessageProps) {
  const isUser = role === "user";

    // ==========================================================
  // MESSAGE UTILISATEUR (carte moderne)
  // ==========================================================
    if (isUser) {
    return (
      <div className="animate-fade-in flex w-full justify-end">
        <div className="flex max-w-[85%] flex-row-reverse items-start gap-2.5 md:max-w-[75%]">
          {/* Avatar */}
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-base text-[var(--color-accent)]"
            aria-hidden="true"
          >
            
          </div>

          {/* Carte beige moderne */}
          <div
  className="rounded-lg rounded-tr-none border px-4 py-3 text-sm leading-relaxed text-[var(--bubble-user-text)] shadow-sm"
  style={{
    background: "var(--bubble-user)",
    borderColor: "color-mix(in srgb, var(--color-accent) 70%, transparent)",
  }}
>
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MESSAGE APOLLOS (sans bulle — style ChatGPT)
  // ==========================================================
  return (
    <div className="animate-fade-in flex w-full justify-start">
      <div className="flex w-full max-w-3xl gap-3">
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg text-white"
          aria-hidden="true"
        >
          {BRANDING.assistant.avatar}
        </div>

        {/* Contenu (sans bulle) */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Nom */}
          <span className="text-xs font-semibold text-[var(--color-primary)]">
            {BRANDING.assistant.name}
          </span>

          {/* Texte ou statut */}
          {content ? (
            <div
              className={`chat-markdown text-sm leading-relaxed ${
                isError ? "text-red-600 dark:text-red-400" : "text-[var(--foreground)]"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="mb-3 mt-4 text-base font-bold first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-4 text-base font-bold first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-3 text-sm font-bold first:mt-0">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-2 border-[var(--color-primary)] pl-4 italic opacity-90">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      {children}
                    </code>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-[var(--color-primary)] align-middle" />
              )}
            </div>
          ) : status ? (
            <TypingDots />
          ) : null}

          {/* Sources bibliques — liens cliquables discrets */}
          {!isStreaming && sources && sources.length > 0 && (
            <div className="animate-fade-in mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {sources.map((source, index) => (
                <SourceCard
                  key={`${source.reference}-${index}`}
                  source={source}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
