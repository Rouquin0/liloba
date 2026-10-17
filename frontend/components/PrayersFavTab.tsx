"use client";

import { useState, useEffect } from "react";
import { PRAYER_CATEGORIES, type Prayer } from "@/lib/prayers";
import {
  getFavoritesList,
  removeFavorite,
  formatFavDate,
} from "@/lib/prayers-fav";

export default function PrayersFavTab() {
  const [favorites, setFavorites] = useState<
    { prayer: Prayer; categoryName: string; categoryIcon: string; addedAt: number }[]
  >([]);
  const [mounted, setMounted] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favList = getFavoritesList();

    const enriched = favList
      .map((fav) => {
        for (const cat of PRAYER_CATEGORIES) {
          const prayer = cat.prayers.find((p) => p.id === fav.prayerId);
          if (prayer) {
            return {
              prayer,
              categoryName: cat.name,
              categoryIcon: cat.icon,
              addedAt: fav.addedAt,
            };
          }
        }
        return null;
      })
      .filter(Boolean) as {
        prayer: Prayer;
        categoryName: string;
        categoryIcon: string;
        addedAt: number;
      }[];

    setFavorites(enriched);
  };

  const handleRemove = (prayerId: string) => {
    removeFavorite(prayerId);
    setConfirmRemove(null);
    loadFavorites();
  };

  const handleCopy = async (prayer: Prayer) => {
    const text = `${prayer.title}\n\n${prayer.text}\n\n${prayer.verse}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // ============================================================
  // VUE DÉTAIL
  // ============================================================
  if (selectedPrayer) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelectedPrayer(null)}
          className="flex items-center gap-2 self-start text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Retour
        </button>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2
            className="mb-4 text-lg font-bold text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {selectedPrayer.title}
          </h2>

          <p
            className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {selectedPrayer.text}
          </p>

          <div className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-3">
            <p className="mb-1 text-xs font-semibold text-[var(--color-accent)]">
              {selectedPrayer.verse}
            </p>
            {selectedPrayer.verseText && (
              <p className="text-xs italic leading-relaxed text-[var(--muted)]">
                « {selectedPrayer.verseText} »
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmRemove(selectedPrayer.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Retirer
          </button>

          <button
            type="button"
            onClick={() => handleCopy(selectedPrayer)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-all hover:brightness-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  // ============================================================
  // VUE LISTE
  // ============================================================
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        {favorites.length} prière{favorites.length > 1 ? "s" : ""} favorite
        {favorites.length > 1 ? "s" : ""}
      </p>

      {favorites.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-hover)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--muted)]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
            Aucune prière favorite
          </p>
          <p className="max-w-xs text-xs text-[var(--muted)]">
            Ajoute des prières à tes favoris depuis l&apos;onglet Prière de ton carnet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {favorites.map(({ prayer, categoryName, addedAt }) => (
            <div
              key={prayer.id}
              className="group border-b border-[var(--border)] py-4"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPrayer(prayer)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0" style={{ color: "var(--color-accent)" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="truncate text-sm font-medium text-[var(--foreground)]">
                      {prayer.title}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {prayer.text}
                  </p>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-[var(--color-accent)]">
                      {prayer.verse}
                    </span>
                    <span className="text-[var(--muted)]">
                      · {categoryName}
                    </span>
                    <span className="text-[var(--muted)]">
                      · {formatFavDate(addedAt)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmRemove(prayer.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Retirer des favoris"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de confirmation */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="mb-2 text-base font-semibold text-[var(--foreground)]">
                Retirer des favoris ?
              </h3>
              <p className="mb-4 text-xs text-[var(--muted)]">
                Cette prière sera retirée de tes favoris. Tu pourras toujours la
                retrouver dans l&apos;onglet Prière.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmRemove(null)}
                  className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(confirmRemove)}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
