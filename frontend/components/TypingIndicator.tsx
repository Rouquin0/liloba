"use client";

import { BRANDING } from "@/lib/branding";

export default function TypingIndicator() {
  return (
    <div className="animate-fade-in flex w-full justify-start">
      <div className="flex max-w-[85%] flex-row gap-3">
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg text-white"
          aria-hidden="true"
        >
          {BRANDING.assistant.avatar}
        </div>

        {/* Bulle avec 3 points qui rebondissent */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[var(--color-primary)]">
            {BRANDING.assistant.name}
          </span>
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-[var(--bubble-assistant)] px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                style={{
                  animation: "typing-bounce 1.4s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              />
              <span
                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                style={{
                  animation: "typing-bounce 1.4s ease-in-out infinite",
                  animationDelay: "0.2s",
                }}
              />
              <span
                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                style={{
                  animation: "typing-bounce 1.4s ease-in-out infinite",
                  animationDelay: "0.4s",
                }}
              />
            </div>
            <span className="ml-1 text-xs text-[var(--muted)]">
              Apollos réfléchit…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
