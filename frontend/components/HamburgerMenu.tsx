"use client";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { KeyCapButton, KeyCapLink } from "@/components/KeyCap";
import OnlineBadge from "./OnlineBadge";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import { ANCIEN_TESTAMENT, NOUVEAU_TESTAMENT } from "@/lib/bible-utils";
import MenuAccordion from "@/components/ui/MenuAccordion";
import ProfileSwitcher from "@/components/profile/ProfileSwitcher";
import ReadingPlanButton from "@/components/plan/ReadingPlan";
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
  const { user, loading } = useUser();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Gestion du profil (Pseudo + Avatar)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [tempPseudo, setTempPseudo] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const loadRef = useRef(loadConversations);
  loadRef.current = loadConversations;

  const pinnedConversations = conversations.filter((c) => c.pinned);
  const recentConversations = conversations.filter((c) => !c.pinned);

  useEffect(() => {
    setMounted(true);
    // Charger la photo et le pseudo depuis le localStorage
    const savedAvatar = localStorage.getItem("liloba-profile-avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);
    
    const savedPseudo = localStorage.getItem("liloba-profile-pseudo");
    if (savedPseudo) setPseudo(savedPseudo);
  }, []);

  useEffect(() => {
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erreur de déconnexion", err);
    } finally {
      setShowProfileMenu(false);
      onClose();
    }
  };

  // Gestion de l'upload de la photo
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        if (ctx) {
          const minSize = Math.min(img.width, img.height);
          const sx = (img.width - minSize) / 2;
          const sy = (img.height - minSize) / 2;
          ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
          
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          localStorage.setItem("liloba-profile-avatar", base64);
          setAvatarUrl(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    setShowProfileMenu(false);
  };

  // Sauvegarde du pseudo
  const handleSavePseudo = () => {
    if (tempPseudo.trim()) {
      localStorage.setItem("liloba-profile-pseudo", tempPseudo.trim());
      setPseudo(tempPseudo.trim());
    } else {
      localStorage.removeItem("liloba-profile-pseudo");
      setPseudo(null);
    }
    setIsEditingPseudo(false);
    setShowProfileMenu(false);
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
              <Link href="/" className="flex min-w-0 shrink items-center gap-2" onClick={onClose}>
                <Logo size={26} />
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  {BRANDING.app.name}
                </span>
              </Link>
              <div className="flex-1" aria-hidden="true" />

              <div className="flex items-center gap-2 md:gap-1 md:rounded-full md:border md:border-[var(--border)] md:bg-[var(--background)] md:px-1.5 md:py-1 md:shadow-sm">
                <KeyCapButton label="Nouvelle discussion" onClick={handleNewDiscussion}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-3.5 md:w-3.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M12 8v6" />
                    <path d="M9 11h6" />
                  </svg>
                </KeyCapButton>

                <div className="mx-0.5 hidden h-4 w-[1px] bg-[var(--border)] md:block"></div>

                <KeyCapLink href="/recherche" onClick={onClose} label="Rechercher dans la Bible">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-3.5 md:w-3.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </KeyCapLink>

                <div className="mx-0.5 hidden h-4 w-[1px] bg-[var(--border)] md:block"></div>

                <div className="flex items-center px-1">
                  <OnlineBadge />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==================== CONTENU ==================== */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* ... (le contenu de la sidebar reste identique) ... */}
          
          {history.length > 0 && !searchQuery && (
            <Link href="/historique" onClick={onClose} className="group flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all hover:bg-[var(--surface-hover)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
              </span>
              <span className="flex-1 text-sm text-[var(--foreground)]">Historique</span>
              <span className="rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">{history.length}</span>
            </Link>
          )}

          {!searchQuery && (
            <Link href="/carnet" onClick={onClose} className="group flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all hover:bg-[var(--surface-hover)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M12 7v6" /><path d="M9 10h6" /></svg>
              </span>
              <span className="flex-1 text-sm text-[var(--foreground)]">Mon Carnet</span>
            </Link>
          )}

          {!searchQuery && (
            <Link href="/selah" onClick={onClose} className="group mb-4 flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all hover:bg-[var(--surface-hover)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
              </span>
              <span className="min-w-0 flex-1 text-sm text-[var(--foreground)]">Selah<span className="ml-1.5 text-xs text-[var(--muted)]">pause du soir</span></span>
            </Link>
          )}

          {/* Mode famille + plan de lecture */}
          {!searchQuery && (
            <MenuAccordion
              key={`famille-${pathname}-${isOpen ? 1 : 0}`}
              className="mb-4"
              label="Profil et plan de lecture"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            >
              <div className="flex flex-col gap-2 px-2 pb-2 pt-1">
                <ProfileSwitcher variant="pill" />
                <ReadingPlanButton onNavigate={onClose} />
              </div>
            </MenuAccordion>
          )}

          {!searchQuery && (
            <Link href="/histoires" onClick={onClose} className="group mb-4 flex items-center gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-3 py-2 transition-all hover:bg-[var(--color-primary)]/10">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--foreground)]">Histoires bibliques<span className="ml-1.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">NOUVEAU</span></span>
            </Link>
          )}

          <section className="mb-6">
            <MenuAccordion
              key={`bible-${pathname}-${isOpen ? 1 : 0}`}
              label="La Bible"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              }
            >
              <div className="px-1 pb-1 pt-1">
                <Link href="/bible" onClick={onClose} className={`group relative mb-0.5 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all ${pathname === "/bible" ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5" : "border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--muted)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                  </span>
                  <span className={`flex-1 font-medium ${pathname === "/bible" ? "text-[var(--color-accent)]" : ""}`}>Tous les livres</span>
                </Link>
                <div className="ml-2 flex flex-col gap-0.5">
                  <Link href="/bible?testament=at" onClick={onClose} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]">
                    <span>Ancien Testament</span>
                    <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px]">{ANCIEN_TESTAMENT.length}</span>
                  </Link>
                  <Link href="/bible?testament=nt" onClick={onClose} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]">
                    <span>Nouveau Testament</span>
                    <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px]">{NOUVEAU_TESTAMENT.length}</span>
                  </Link>
                </div>
              </div>
            </MenuAccordion>
          </section>

          {pinnedConversations.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-[var(--color-accent)]"><path d="M16 3a1 1 0 0 1 .7 1.7L14.4 7l3.3 3.3a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L11.6 9.8l-4.2 4.2 2 2a1 1 0 0 1-.7 1.7H4a1 1 0 0 1-1-1v-4.7a1 1 0 0 1 1.7-.7l2 2 4.2-4.2-3.3-3.3a1 1 0 0 1 0-1.4L9 3.2a1 1 0 0 1 1.4 0L13.7 6.5l2.3-2.3A1 1 0 0 1 16 3z" /></svg>
                <span>Épinglées</span>
                <span className="font-mono font-normal opacity-60">({pinnedConversations.length})</span>
              </h3>
              <div className="flex flex-col gap-1">
                {pinnedConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button key={conv.id} type="button" onClick={() => handleSelectConversation(conv)} onContextMenu={(e) => handleContextMenu(e, conv)} onTouchStart={(e) => handleTouchStart(e, conv)} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} className={`group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${isActive ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5" : "border-[var(--border)] bg-[var(--surface-hover)]/50 hover:bg-[var(--surface-hover)]"}`}>
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0 text-[var(--color-accent)]"><path d="M16 3a1 1 0 0 1 .7 1.7L14.4 7l3.3 3.3a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L11.6 9.8l-4.2 4.2 2 2a1 1 0 0 1-.7 1.7H4a1 1 0 0 1-1-1v-4.7a1 1 0 0 1 1.7-.7l2 2 4.2-4.2-3.3-3.3a1 1 0 0 1 0-1.4L9 3.2a1 1 0 0 1 1.4 0L13.7 6.5l2.3-2.3A1 1 0 0 1 16 3z" /></svg>
                        <span className={`truncate text-sm font-medium ${isActive ? "text-[var(--color-accent)]" : ""}`}>{conv.title}</span>
                      </span>
                      <span className="truncate font-mono text-[10px] text-[var(--muted)]">{formatRelativeDate(conv.updatedAt)}{conv.messageCount > 0 && ` · ${conv.messageCount} msg`}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <span>{searchQuery ? "Résultats" : "Récentes"}</span>
              {recentConversations.length > 0 && <span className="font-mono font-normal opacity-60">({recentConversations.length})</span>}
            </h3>
            {recentConversations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center">
                <p className="text-xs text-[var(--muted)]">{searchQuery ? "Aucun résultat" : pinnedConversations.length > 0 ? "Toutes tes discussions sont épinglées" : "Aucune discussion pour l'instant"}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button key={conv.id} type="button" onClick={() => handleSelectConversation(conv)} onContextMenu={(e) => handleContextMenu(e, conv)} onTouchStart={(e) => handleTouchStart(e, conv)} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} className={`group relative flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${isActive ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5" : "border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"}`}>
                      <span className={`truncate text-sm font-medium ${isActive ? "text-[var(--color-accent)]" : ""}`}>{conv.title}</span>
                      <span className="truncate font-mono text-[10px] text-[var(--muted)]">{formatRelativeDate(conv.updatedAt)}{conv.messageCount > 0 && ` · ${conv.messageCount} msg`}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ==================== BAS : Profil Utilisateur + Actions ==================== */}
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-2">
          <div className="flex items-center gap-1.5">
            
            {/* BLOC COMPTE UTILISATEUR */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--surface-hover)]" />
              ) : user ? (
                <div className="relative flex items-center gap-2">
                  {/* BOUTON ROND AVATAR */}
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm overflow-hidden border border-[var(--border)] transition-transform hover:scale-105 active:scale-95"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profil" className="h-full w-full object-cover" />
                    ) : (
                      user.email?.charAt(0).toUpperCase()
                    )}
                  </button>
                  
                  {/* PSEUDO OU EMAIL */}
                  <span className="truncate text-xs font-medium text-[var(--foreground)]">
                    {pseudo || user.email}
                  </span>

                  {/* MENU DÉROULANT PROFIL */}
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => { setShowProfileMenu(false); setIsEditingPseudo(false); }} />
                      <div className="absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl animate-scale-in">
                        
                        {isEditingPseudo ? (
                          <div className="p-3">
                            <input
                              type="text"
                              value={tempPseudo}
                              onChange={(e) => setTempPseudo(e.target.value)}
                              placeholder="Ton pseudo..."
                              maxLength={20}
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--color-accent)] mb-2"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setIsEditingPseudo(false)} className="flex-1 rounded-lg border border-[var(--border)] py-1.5 text-[10px] font-medium">Annuler</button>
                              <button onClick={handleSavePseudo} className="flex-1 rounded-lg bg-[var(--color-accent)] py-1.5 text-[10px] font-bold text-white">Enregistrer</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setTempPseudo(pseudo || ""); setIsEditingPseudo(true); }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)]">
                                <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
                              </svg>
                              Modifier le pseudo
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)]">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              </svg>
                              Changer la photo
                            </button>
                            <button
                              onClick={handleSignOut}
                              className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3 text-left text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                              </svg>
                              Se déconnecter
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* INPUT CACHÉ POUR L'UPLOAD */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <Link
                  href="/auth/sign-in"
                  onClick={onClose}
                  className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-2 transition-all hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--muted)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-[var(--foreground)] truncate">Se connecter</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Recherche Discussions */}
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

      {/* ... (menu contextuel et modale de confirmation restent identiques) ... */}
      
      {menu && (
        <div data-custom-menu className="animate-scale-in fixed z-[60] w-[200px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl" style={{ left: menu.x, top: menu.y }} onContextMenu={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={handlePin} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)]"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></svg>
            <span>{menu.conv.pinned ? "Désépingler" : "Épingler"}</span>
          </button>
          <button type="button" onClick={handleDeleteClick} className="flex w-full items-center gap-3 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            <span>Supprimer</span>
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="animate-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">Supprimer cette discussion ?</h3>
              <p className="mb-4 text-xs text-[var(--muted)]">« {confirmDelete.title} » sera définitivement supprimée.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]">Annuler</button>
                <button type="button" onClick={handleConfirmDelete} className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90 active:scale-[0.98]">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
