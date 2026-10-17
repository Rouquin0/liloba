"use client";

import { PaneTab, getTabLabel } from "@/lib/split-view";
import BiblePane from "./panes/BiblePane";
import ChatPane from "./panes/ChatPane";
import SearchPane from "./panes/SearchPane";
import ComparePane from "./panes/ComparePane";

interface PanePanelProps {
  side: "left" | "right";
  currentTab: PaneTab;
  onChangeTab: (tab: PaneTab) => void;
  onClose?: () => void;
  onSwap?: () => void;
}

const TABS: PaneTab[] = ["bible", "chat", "search", "compare"];

function TabIcon({ tab }: { tab: PaneTab }) {
  const cls = "h-4 w-4";
  switch (tab) {
    case "bible":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case "chat":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "search":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "compare":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M9 3v18" />
          <path d="m15 9-3 3 3 3" />
        </svg>
      );
    default:
      return null;
  }
}

function renderContent(tab: PaneTab) {
  switch (tab) {
    case "bible":
      return <BiblePane />;
    case "chat":
      return <ChatPane />;
    case "search":
      return <SearchPane />;
    case "compare":
      return <ComparePane />;
    default:
      return null;
  }
}

export default function PanePanel({
  side,
  currentTab,
  onChangeTab,
  onClose,
  onSwap,
}: PanePanelProps) {
  return (
    <div
      className="flex h-full min-w-0 flex-col border-[var(--border)]"
      style={side === "right" ? { borderLeftWidth: 1 } : undefined}
    >
      {/* Barre d'onglets */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-1.5">
        {TABS.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeTab(tab)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
              title={getTabLabel(tab)}
            >
              <TabIcon tab={tab} />
              <span className="hidden md:inline">{getTabLabel(tab)}</span>
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Bouton échanger gauche ↔ droite */}
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            title="Échanger les panneaux (Alt+Shift+B)"
            aria-label="Échanger les panneaux"
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
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </button>
        )}

        {/* Bouton fermer */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            title="Fermer le split (Ctrl+B)"
            aria-label="Fermer le split"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Contenu du panneau */}
      <div className="flex-1 overflow-hidden">{renderContent(currentTab)}</div>
    </div>
  );
}
