"use client";

import { useState } from "react";

interface VerseActionBarProps {
  verseText: string;
  reference: string;
}

export default function VerseActionBar({ verseText, reference }: VerseActionBarProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://liloba.vercel.app";
    const shareText = `« ${verseText} » - ${reference}\n\nDécouvre LILOBA :`;
    
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "LILOBA", text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`« ${verseText} » - ${reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMore(false);
    } catch (err) {}
  };

  return (
    <div className="relative mt-2 flex w-full items-center justify-between border-t border-[var(--border)] pt-4">
      {/* Bouton J'aime */}
      <button
        type="button"
        onClick={() => setLiked(!liked)}
        className="group flex flex-col items-center gap-1 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 transition-transform group-active:scale-90 ${
            liked ? "text-red-500" : "text-[var(--muted)] group-hover:text-[var(--color-accent)]"
          }`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className={`text-[10px] font-medium ${liked ? "text-red-500" : "text-[var(--muted)]"}`}>J'aime</span>
      </button>

      {/* Bouton Commenter */}
      <button type="button" className="group flex flex-col items-center gap-1 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[var(--muted)] transition-transform group-active:scale-90 group-hover:text-[var(--color-accent)]">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span className="text-[10px] font-medium text-[var(--muted)]">Commenter</span>
      </button>

      {/* Bouton Partager */}
      <button type="button" onClick={handleShare} className="group flex flex-col items-center gap-1 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[var(--muted)] transition-transform group-active:scale-90 group-hover:text-[var(--color-accent)]">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" x2="12" y1="2" y2="15" />
        </svg>
        <span className="text-[10px] font-medium text-[var(--muted)]">{copied ? "Copié !" : "Partager"}</span>
      </button>

      {/* Bouton Plus (3 petits points) */}
      <button type="button" onClick={() => setShowMore(!showMore)} className="group flex flex-col items-center gap-1 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 transition-transform group-active:scale-90 ${showMore ? "text-[var(--color-accent)]" : "text-[var(--muted)] group-hover:text-[var(--color-accent)]"}`}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
        <span className="text-[10px] font-medium text-[var(--muted)]">Plus</span>
      </button>

      {/* MENU DÉROULANT (3 points) */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl animate-fade-in">
            <button onClick={handleCopy} className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copier
            </button>
            <button onClick={() => setShowMore(false)} className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3 text-left text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Surligner
            </button>
          </div>
        </>
      )}
    </div>
  );
}
