"use client";

import { useId, useState } from "react";
import type { BibleStory } from "@/lib/stories-content";

// ============================================================
// Visuel d'une histoire : image locale (/images/stories/*.jpg)
// avec fallback automatique (dégradé + motif SVG + emoji).
// Si tu ajoutes le fichier JPG dans public/images/stories/,
// il s'affiche. Sinon, le dégradé s'affiche (aucune erreur).
// ============================================================

export function StoryArt({
  story,
  size = "card",
  className = "",
}: {
  story: BibleStory;
  size?: "card" | "hero";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const height =
    size === "hero" ? "h-56 md:h-80" : "h-40 md:h-44";

  const patternId = useId();

  if (failed) {
    return <StoryFallback story={story} height={height} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${height} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={story.image}
        alt={`Illustration : ${story.title}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Voile bas pour lisibilité du badge */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {/* Fallback motif (visible si l'image est claire) */}
      <PatternOverlay id={patternId} />
    </div>
  );
}

export function StoryFallback({
  story,
  height = "h-40 md:h-44",
  className = "",
}: {
  story: BibleStory;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${story.gradient} ${height} ${className}`}
      role="img"
      aria-label={`Illustration : ${story.title}`}
    >
      <PatternOverlay id={`${story.slug}-fallback`} />
      <span className="relative text-6xl drop-shadow-lg md:text-7xl" aria-hidden="true">
        {story.emoji}
      </span>
      {/* Soleil / halo décoratif */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-sm" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/15 blur-sm" />
    </div>
  );
}

function PatternOverlay({ id }: { id: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
