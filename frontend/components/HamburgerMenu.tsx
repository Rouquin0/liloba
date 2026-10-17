"use client";

import OnlineBadge from "./OnlineBadge";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import { ANCIEN_TESTAMENT, NOUVEAU_TESTAMENT } from "@/lib/bible-utils";
import Logo from "./Logo";
import { getHistory, type HistoryEntry } from "@/lib/history";
import {
  getConversations,
  searchConversations,
  setActiveConversationId,
  getActiveConversationId,
  deleteConversation,
  togglePinConversation,
  formatRelativeDate,
  type Conversation,
} from "@/lib/conversations";

// ============================================================
// TYPES
// ============================================================

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationChange?: () => void;
}

interface MenuState {
  conv: Conversation;
  x: number;
  y: number;
}

// ============================================================
// MENU HAMBURGER
// ============================================================

export default function HamburgerMenu({
  isOpen,
  onClose,
  onConversationChange,
}: HamburgerMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Menu contextuel
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);

  // Long press
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const justOpenedMenuRef = useRef(false);

  // ============================================================
  // CHARGEMENT
  // ============================================================

  const loadConversations = () => {
    const list = searchQuery
      ? searchConversations(searchQuery)
      : getConversations();
    setConversations(list);
    setActiveId(getActiveConversationId());
  };

  // Garde toujours la dernière version de loadConversations (pour les écouteurs)
  const loadRef = useRef(loadConversations);
  loadRef.current = loadConversations;

  const pinnedConversations = conversations.filter((c) => c.pinned);
  const recentConversations = conversations.filter((c) => !c.pinned);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Charge toujours (le menu est visible en permanence sur ordinateur)
    loadConversations();
    setHistory(getHistory());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery, pathname]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "liloba-conversations" ||
        e.key?.startsWith("liloba-conversation-")
      ) {
        loadConversations();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery]);

  // Écoute les événements custom
  useEffect(() => {
    const refresh = () => {
      loadRef.current();
      setHistory(getHistory());
    };
    window.addEventListener("liloba:conversations-updated", refresh);
    window.addEventListener("liloba:history-updated", refresh);
    return () => {
      window.removeEventListener("liloba:conversations-updated", refresh);
      window.removeEventListener("liloba:history-updated", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const blockNativeMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("aside") || target.closest("[data-custom-menu]")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", blockNativeMenu);
    return () => document.removeEventListener("contextmenu", blockNativeMenu);
  }, []);

  useEffect(() => {
    if (!menu) return;

    const close = (e: MouseEvent) => {
      if (e.button === 2) return;
      if (justOpenedMenuRef.current) {
        justOpenedMenuRef.current = false;
        return;
      }
      setMenu(null);
    };

    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };

    const onScroll = () => setMenu(null);

    const timer = setTimeout(() => {
      document.addEventListener("click", close);
      document.addEventListener("keydown", esc);
      window.addEventListener("scroll", onScroll, true);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [menu]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleNewDiscussion = () => {
    // 🔥 Ne crée PAS de conv ici — elle sera créée au 1er message
    window.dispatchEvent(new Event("liloba:new-conversation"));
    onConversationChange?.();
    router.push("/chat");
    onClose();
  };

  const handleSelectConversation = (conv: Conversation) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    setActiveConversationId(conv.id);
    // 📢 Notifie ChatPage de changer de conversation
    window.dispatchEvent(
      new CustomEvent("liloba:switch-conversation", {
        detail: { conversationId: conv.id },
      })
    );
    onConversationChange?.();
    router.push("/chat");
    onClose();
  };

  const openMenu = (
    e: React.MouseEvent | React.TouchEvent,
    conv: Conversation
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let x = 0,
      y = 0;
    if ("clientX" in e) {
      x = e.clientX;
      y = e.clientY;
    }

    const menuWidth = 200;
    const menuHeight = 130;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x + menuWidth > vw) x = vw - menuWidth - 10;
    if (y + menuHeight > vh) y = vh - menuHeight - 10;

    justOpenedMenuRef.current = true;

    setMenu({ conv, x, y });
  };

  const handleContextMenu = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    openMenu(e, conv);
  };

  const handleTouchStart = (e: React.TouchEvent, conv: Conversation) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      const touch = e.touches[0];
      justOpenedMenuRef.current = true;
      setMenu({
        conv,
        x: touch.clientX,
        y: touch.clientY,
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePin = () => {
    if (!menu) return;
    togglePinConversation(menu.conv.id);
    loadConversations();
    onConversationChange?.();
    setMenu(null);
  };

  const handleDeleteClick = () => {
    if (!menu) return;
    setConfirmDelete(menu.conv);
    setMenu(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    deleteConversation(confirmDelete.id);
    loadConversations();
    onConversationChange?.();
    setConfirmDelete(null);
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-2 left-2 z-50 flex h-[calc(100dvh-1rem)] w-[280px] flex-col
          overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]
          shadow-2xl
          transition-transform duration-300 ease-in-out
          md:sticky md:top-2 md:z-0 md:h-[calc(100dvh-1rem)] md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1.5rem)] md:translate-x-0"}
        `}
      >
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4">
          {showSearch ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]"
                aria-label="Fermer la recherche"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher…"
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
              />
            </>
          ) : (
            <>
              <Link href="/" className="flex flex-1 items-center gap-2" onClick={onClose}>
                <Logo size={26} />
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  {BRANDING.app.name}
                </span>
              </Link>
              <OnlineBadge />
              {/* 🔍 Loupe HAUT = Recherche BIBLE */}
              <Link
                href="/recherche"
                onClick={onClose}
                className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[var(--muted)] transition-all hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-accent)]"
                aria-label="Rechercher dans la Bible"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:scale-110">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* ==================== CONTENU ==================== */}
        <div className="flex-1 overflow-y-auto px-3 py-4">

          {/* ---------- HISTORIQUE ---------- */}
          {history.length > 0 && !searchQuery && (
            <Link
              href="/historique"
              onClick={onClose}
              className="group flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all hover:bg-[var(--surface-hover)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="flex-1 text-sm text-[var(--foreground)]">
                Historique
              </span>
              <span className="rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">
                {history.length}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)] transition-transform group-hover:translate-x-0.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )}

          {/* ---------- MON CARNET ---------- */}
          {!searchQuery && (
            <Link
              href="/carnet"
              onClick={onClose}
              className="group mb-4 flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all hover:bg-[var(--surface-hover)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M12 7v6" />
                  <path d="M9 10h6" />
                </svg>
              </span>
              <span className="flex-1 text-sm text-[var(--foreground)]">
                Mon Carnet
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)] transition-transform group-hover:translate-x-0.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )}

          {/* ---------- LA BIBLE ---------- */}
          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>La Bible</span>
            </h3>

            <Link
              href="/bible"
              onClick={onClose}
              className={`group relative mb-0.5 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                pathname === "/bible"
                  ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
                  : "border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {pathname === "/bible" && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r" style={{ background: "var(--color-accent)" }} aria-hidden="true" />
              )}
              <span className="text-base" aria-hidden="true">📚</span>
              <span className={`flex-1 font-medium ${pathname === "/bible" ? "text-[var(--color-accent)]" : ""}`}>
                Tous les livres
              </span>
            </Link>

            <div className="ml-2 flex flex-col gap-0.5">
              <Link href="/bible?testament=at" onClick={onClose} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]">
                <span>Ancien Testament</span>
                <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px]">
                  {ANCIEN_TESTAMENT.length}
                </span>
              </Link>
              <Link href="/bible?testament=nt" onClick={onClose} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]">
                <span>Nouveau Testament</span>
                <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px]">
                  {NOUVEAU_TESTAMENT.length}
                </span>
              </Link>
            </div>
          </section>

          {/* ---------- ÉPINGLÉES ---------- */}
          {pinnedConversations.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-[var(--color-accent)]">
                  <path d="M16 3a1 1 0 0 1 .7 1.7L14.4 7l3.3 3.3a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L11.6 9.8l-4.2 4.2 2 2a1 1 0 0 1-.7 1.7H4a1 1 0 0 1-1-1v-4.7a1 1 0 0 1 1.7-.7l2 2 4.2-4.2-3.3-3.3a1 1 0 0 1 0-1.4L9 3.2a1 1 0 0 1 1.4 0L13.7 6.5l2.3-2.3A1 1 0 0 1 16 3z" />
                </svg>
                <span>Épinglées</span>
                <span className="font-mono font-normal opacity-60">
                  ({pinnedConversations.length})
                </span>
              </h3>

              <div className="flex flex-col gap-1">
                {pinnedConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv)}
                      onContextMenu={(e) => handleContextMenu(e, conv)}
                      onTouchStart={(e) => handleTouchStart(e, conv)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                      className={`group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
                          : "border-[var(--border)] bg-[var(--surface-hover)]/50 hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r" style={{ background: "var(--color-accent)" }} aria-hidden="true" />
                      )}
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0 text-[var(--color-accent)]">
                          <path d="M16 3a1 1 0 0 1 .7 1.7L14.4 7l3.3 3.3a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L11.6 9.8l-4.2 4.2 2 2a1 1 0 0 1-.7 1.7H4a1 1 0 0 1-1-1v-4.7a1 1 0 0 1 1.7-.7l2 2 4.2-4.2-3.3-3.3a1 1 0 0 1 0-1.4L9 3.2a1 1 0 0 1 1.4 0L13.7 6.5l2.3-2.3A1 1 0 0 1 16 3z" />
                        </svg>
                        <span className={`truncate text-sm font-medium ${isActive ? "text-[var(--color-accent)]" : ""}`}>
                          {conv.title}
                        </span>
                      </span>
                      <span className="truncate font-mono text-[10px] text-[var(--muted)]">
                        {formatRelativeDate(conv.updatedAt)}
                        {conv.messageCount > 0 && ` · ${conv.messageCount} msg`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ---------- RÉCENTES ---------- */}
          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{searchQuery ? "Résultats" : "Récentes"}</span>
              {recentConversations.length > 0 && (
                <span className="font-mono font-normal opacity-60">
                  ({recentConversations.length})
                </span>
              )}
            </h3>

            {recentConversations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center">
                <p className="text-xs text-[var(--muted)]">
                  {searchQuery
                    ? "Aucun résultat"
                    : pinnedConversations.length > 0
                      ? "Toutes tes discussions sont épinglées"
                      : "Aucune discussion pour l'instant"}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted)] opacity-70">
                  {searchQuery
                    ? "Essaie un autre mot-clé"
                    : pinnedConversations.length > 0
                      ? "Désépingle une discussion pour la voir ici"
                      : "Tes conversations apparaîtront ici"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv)}
                      onContextMenu={(e) => handleContextMenu(e, conv)}
                      onTouchStart={(e) => handleTouchStart(e, conv)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                      className={`group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
                          : "border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r" style={{ background: "var(--color-accent)" }} aria-hidden="true" />
                      )}
                      <span className={`truncate text-sm font-medium ${isActive ? "text-[var(--color-accent)]" : ""}`}>
                        {conv.title}
                      </span>
                      <span className="truncate font-mono text-[10px] text-[var(--muted)]">
                        {formatRelativeDate(conv.updatedAt)}
                        {conv.messageCount > 0 && ` · ${conv.messageCount} msg`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ==================== BAS : barre d'actions fixe ==================== */}
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-2">
          <div className="flex items-center gap-1.5">
            {/* Chat — accent */}
            <button
              type="button"
              onClick={handleNewDiscussion}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-90 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
              </svg>
              <span>Chat</span>
            </button>

            {/* 🔍 Loupe BAS = Recherche dans les discussions */}
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                showSearch
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--color-accent)]"
              }`}
              aria-label="Rechercher dans les discussions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Paramètres */}
            <Link
              href="/settings"
              onClick={onClose}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                pathname === "/settings"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--color-accent)]"
              }`}
              aria-label="Paramètres"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ==================== MENU CONTEXTUEL ==================== */}
      {menu && (
        <div
          data-custom-menu
          className="animate-scale-in fixed z-[60] w-[200px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          style={{ left: menu.x, top: menu.y }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handlePin}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)]">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
            <span>{menu.conv.pinned ? "Désépingler" : "Épingler"}</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex w-full items-center gap-3 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            <span>Supprimer</span>
          </button>
        </div>
      )}

      {/* ==================== MODALE DE CONFIRMATION ==================== */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">
                Supprimer cette discussion ?
              </h3>
              <p className="mb-4 text-xs text-[var(--muted)]">
                « {confirmDelete.title} » sera définitivement supprimée.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90 active:scale-[0.98]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
