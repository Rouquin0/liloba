"use client";

import Link from "next/link";
import type { SourceBiblique } from "@/lib/api";
import { parseReference } from "@/lib/bible-utils";

interface SourceCardProps {
  source: SourceBiblique;
}

export default function SourceCard({ source }: SourceCardProps) {
  const parsed = parseReference(source.reference);

  // Lien vers la page Bible si on a pu parser la référence
  const href = parsed
    ? `/bible/${parsed.slug}/${parsed.chapitre}`
    : undefined;

  const content = (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span aria-hidden="true">📖</span>
      <span className="font-medium underline decoration-dotted underline-offset-2">
        {source.reference}
      </span>
    </span>
  );

  // Si on a un lien : Link cliquable
  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex text-[var(--color-accent)] opacity-80 transition-opacity hover:opacity-100"
        title={`Ouvrir ${source.reference}`}
      >
        {content}
      </Link>
    );
  }

  // Sinon : juste un affichage statique
  return (
    <span className="inline-flex text-[var(--muted)]">
      {content}
    </span>
  );
}
