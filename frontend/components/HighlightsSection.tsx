"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HIGHLIGHT_COLORS,
  getHighlightsList,
  getColorConfig,
  removeHighlight,
  clearAllHighlights,
  referenceToUrl,
  type Highlight,
  type HighlightColor,
} from "@/lib/highlights";

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function HighlightsSection() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [mounted, setMounted] = useState(false);

  // Couleur sélectionnée (null = vue "dossiers")
  const [selectedColor, setSelectedColor] = useState<HighlightColor | null>(
    null
  );

  // Charge les surlignages
  const loadHighlights = () => {
    const list = getHighlightsList();
    setHighlights(list);
  };

  useEffect(() => {
    setMounted(true);
    loadHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = (reference: string) => {
    removeHighlight(reference);
    loadHighlights();
  };

  const handleClearAll = () => {
    if (!confirm("Supprimer TOUS tes surlignages ?")) return;
    clearAllHighlights();
    loadHighlights();
    setSelectedColor(null);
  };

  if (!mounted) return null;

  // ----- Aucun surlignage -----
  if (highlights.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="mb-1 text-3xl">🖍️</p>
        <p className="text-sm font-medium text-[var(--foreground)]">
          Aucun surlignage
        </p>
        <p className="mt-1 text-xs font-light text-[var(--muted)]">
          Clique sur un verset dans la Bible pour le surligner
        </p>
      </div>
    );
  }

  // ============================================================
  // VUE 2 : LISTE DES VERSETS D'UNE COULEUR
  // ============================================================
  if (selectedColor) {
    const config = getColorConfig(selectedColor);
    const filtered = highlights.filter((h) => h.color === selectedColor);

    if (!config) return null;

    return (
      <div className="flex flex-col gap-3">
        {/* En-tête avec retour */}
        <div className="glass-card flex items-center justify-between p-3">
          <button
            type="button"
            onClick={() => setSelectedColor(null)}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <span>←</span>
            <span>Dossiers</span>
          </button>

          <div
            className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{
              background: config.bg,
              border: `1px solid ${config.border}`,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: config.border }}
            />
            <span className="text-xs font-semibold text-[var(--foreground)]">
              {config.label}
            </span>
            <span className="font-mono text-[10px] text-[var(--muted)]">
              ({filtered.length})
            </span>
          </div>
        </div>

        {/* Liste des versets */}
        <div className="flex flex-col gap-1.5">
          {filtered.map((highlight) => {
            const url = referenceToUrl(highlight.reference);

            return (
              <div
                key={highlight.reference}
                className="glass-card group flex items-center gap-2 overflow-hidden p-0"
                style={{
                  borderLeft: `3px solid ${config.border}`,
                }}
              >
                {/* Lien vers la Bible */}
                {url ? (
                  <Link
                    href={url}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px]"
                      style={{ background: config.bg }}
                    >
                      📖
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[var(--foreground)]">
                        {highlight.reference}
                      </div>
                      <div className="truncate font-mono text-[10px] text-[var(--muted)]">
                        {new Date(highlight.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </div>
                    </div>
                    <span className="text-[var(--muted)] transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                ) : (
                  <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
                    <span className="text-sm">{highlight.reference}</span>
                  </div>
                )}

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => handleRemove(highlight.reference)}
                  className="flex h-full items-center px-3 text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Retirer le surlignage"
                  aria-label="Retirer le surlignage"
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE 1 : DOSSIERS PAR COULEUR
  // ============================================================
  const colorsWithData = HIGHLIGHT_COLORS.filter((color) =>
    highlights.some((h) => h.color === color.value)
  );

  const totalCount = highlights.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Résumé + Tout effacer */}
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-xs text-[var(--muted)]">
          {totalCount} verset{totalCount > 1 ? "s" : ""} surligné
          {totalCount > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-[10px] font-medium text-red-500 underline transition-colors hover:text-red-600"
        >
          Tout effacer
        </button>
      </div>

      {/* Dossiers par couleur */}
      <div className="flex flex-col gap-2">
        {colorsWithData.map((color) => {
          const count = highlights.filter(
            (h) => h.color === color.value
          ).length;

          return (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className="glass-card group flex items-center gap-3 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderLeft: `4px solid ${color.border}`,
              }}
            >
              {/* Pastille de couleur */}
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                style={{
                  background: color.bg,
                  border: `1.5px solid ${color.border}`,
                }}
              >
                🖍️
              </span>

              {/* Nom + compteur */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {color.label}
                </div>
                <div className="font-mono text-[10px] text-[var(--muted)]">
                  {count} verset{count > 1 ? "s" : ""}
                </div>
              </div>

              {/* Flèche */}
              <span className="text-[var(--muted)] transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
