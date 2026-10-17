"use client";

import { useState, useEffect } from "react";
import {
  PRAYER_CATEGORIES,
  getTotalPrayers,
  type Prayer,
} from "@/lib/prayers";
import { isFavorite, toggleFavorite } from "@/lib/prayers-fav";
import { addJournalEntry } from "@/lib/journal";

// ============================================================
// ICÔNES SVG PAR CATÉGORIE
// ============================================================

function CategoryIcon({ icon }: { icon: string }) {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
  };

  switch (icon) {
    case "confort":
      return (
        <svg {...commonProps}>
          <path d="M12 2v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="M20 12h2" />
          <path d="m19.07 4.93-1.41 1.41" />
          <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
          <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
        </svg>
      );
    case "guerison":
      return (
        <svg {...commonProps}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </svg>
      );
    case "protection":
      return (
        <svg {...commonProps}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      );
    case "gratitude":
      return (
        <svg {...commonProps}>
          <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
          <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 13 6 6" />
        </svg>
      );
    case "guidance":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    case "pardon":
      return (
        <svg {...commonProps}>
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case "intercession":
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "force":
      return (
        <svg {...commonProps}>
          <path d="M6.5 6.5a2 2 0 0 0 0 4h4a2 2 0 0 0 0-4z" />
          <path d="M6.5 10.5v3a4 4 0 0 0 4 4h2.5" />
          <path d="M10.5 6.5v-2a2 2 0 0 1 2-2h.5" />
          <path d="M13 17.5V20a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2v-1" />
          <path d="M16 15h2.5a2 2 0 0 1 2 2" />
        </svg>
      );
    case "adoration":
      return (
        <svg {...commonProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "action":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case "biblique":
      return (
        <svg {...commonProps}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

// ============================================================
// BADGE "BIBLE"
// ============================================================

function BibleBadge() {
  return (
    <span
      className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{
        background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
        color: "var(--color-accent)",
      }}
    >
      Bible
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function PrayerTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshFavorites();
  }, []);

  const refreshFavorites = () => {
    const favs = new Set<string>();
    PRAYER_CATEGORIES.forEach((cat) =>
      cat.prayers.forEach((p) => {
        if (isFavorite(p.id)) favs.add(p.id);
      })
    );
    setFavoriteIds(favs);
  };

    const handleToggleFav = (prayerId: string) => {
    const isNowFav = toggleFavorite(prayerId);

    // 📔 Ajoute au journal (seulement si on ajoute)
    if (isNowFav) {
      // Trouve le titre de la prière
      let prayerTitle = prayerId;
      for (const cat of PRAYER_CATEGORIES) {
        const p = cat.prayers.find((pr) => pr.id === prayerId);
        if (p) {
          prayerTitle = p.title;
          break;
        }
      }
      addJournalEntry("prayer_favorited", prayerTitle, {
        detail: "Prière ajoutée aux favoris",
      });
    }

    refreshFavorites();
  };

  const handleCopy = async (prayer: Prayer) => {
    const text = `${prayer.title}\n\n${prayer.text}\n\n📖 ${prayer.verse}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // 🔍 Recherche
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const results = PRAYER_CATEGORIES.flatMap((cat) =>
      cat.prayers
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.text.toLowerCase().includes(q) ||
            p.verse.toLowerCase().includes(q)
        )
        .map((p) => ({ prayer: p, category: cat }))
    );

    return (
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une prière…"
          autoFocus
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
        />

        {results.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">
            Aucune prière trouvée
          </p>
        ) : (
          <div className="flex flex-col">
            {results.map(({ prayer, category }) => (
              <button
                key={prayer.id}
                type="button"
                onClick={() => setSelectedPrayer(prayer)}
                className="group flex items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-all hover:bg-[var(--surface-hover)] hover:pl-1"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors group-hover:text-[var(--color-accent)]">
                  <CategoryIcon icon={category.icon} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                      {prayer.title}
                    </span>
                    {category.id === "prayers-bibliques" && <BibleBadge />}
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {prayer.text}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 📖 Vue détail d'une prière
  if (selectedPrayer) {
    const isFav = favoriteIds.has(selectedPrayer.id);
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
            onClick={() => handleToggleFav(selectedPrayer.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
              isFav
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            {isFav ? "Favori" : "Ajouter aux favoris"}
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

  // 📂 Vue catégorie
  if (selectedCategory) {
    const category = PRAYER_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 self-start text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Toutes les catégories
        </button>

        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              color: "var(--color-accent)",
            }}
          >
            <CategoryIcon icon={category.icon} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {category.name}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {category.prayers.length} prière{category.prayers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {category.prayers.map((prayer) => (
            <button
              key={prayer.id}
              type="button"
              onClick={() => setSelectedPrayer(prayer)}
              className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-all hover:border-[var(--color-accent)]/40"
            >
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {prayer.title}
                  </span>
                  {category.id === "prayers-bibliques" && <BibleBadge />}
                  {favoriteIds.has(prayer.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0" style={{ color: "var(--color-accent)" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                  )}
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                  {prayer.text}
                </p>
                <p className="mt-1 font-mono text-[10px] text-[var(--color-accent)]">
                  {prayer.verse}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 🏠 Vue principale
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher une prière…"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-accent)]"
      />

      <p className="text-xs text-[var(--muted)]">
        {PRAYER_CATEGORIES.length} catégories · {getTotalPrayers()} prières
      </p>

      <div className="flex flex-col gap-2">
        {PRAYER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-all hover:border-[var(--color-accent)]/40 hover:bg-[var(--surface-hover)]"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                color: "var(--color-accent)",
              }}
            >
              <CategoryIcon icon={cat.icon} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {cat.name}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {cat.description}
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-[var(--surface-hover)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">
              {cat.prayers.length}
            </span>
          </button>
        ))}
      </div>

      {/* Mention honnête — discrète, en bas */}
      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <p className="text-[10px] leading-relaxed text-[var(--muted)] opacity-70">
          Les prières marquées{" "}
          <span
            className="rounded px-1 py-0.5 font-bold uppercase tracking-wider"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent) 15%, transparent)",
              color: "var(--color-accent)",
              fontSize: "8px",
            }}
          >
            Bible
          </span>{" "}
          sont extraites directement de la Bible. Les autres sont composées
          pour LILOBA dans un esprit chrétien fidèle aux Écritures.
        </p>
      </div>
    </div>
  );
}
