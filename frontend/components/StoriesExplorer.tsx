"use client";

import { useMemo, useState } from "react";
import type { BibleStory } from "@/lib/stories-content";
import StoriesList from "./StoriesList";

// Filtres par thème fonctionnels (client) pour /histoires
export default function StoriesExplorer({ stories }: { stories: BibleStory[] }) {
  const themes = useMemo(
    () => ["Tous", ...Array.from(new Set(stories.map((s) => s.theme)))],
    [stories]
  );
  const [active, setActive] = useState("Tous");

  const filtered =
    active === "Tous" ? stories : stories.filter((s) => s.theme === active);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par thème">
        {themes.map((t) => {
          const isActive = t === active;
          const count =
            t === "Tous"
              ? stories.length
              : stories.filter((s) => s.theme === t).length;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 md:text-sm ${
                isActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              {t} · {count}
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-xs text-[var(--muted)] md:text-sm" aria-live="polite">
        {filtered.length} histoire{filtered.length > 1 ? "s" : ""}
        {active !== "Tous" && (
          <>
            {" "}sur le thème <strong>{active}</strong>
          </>
        )}
      </p>

      <StoriesList stories={filtered} />
    </>
  );
}
