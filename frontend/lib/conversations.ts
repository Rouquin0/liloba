"use client";

import type { SourceBiblique } from "./api";

// ============================================================
// TYPES
// ============================================================

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceBiblique[];
  isError?: boolean;
  isStreaming?: boolean;
  status?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  preview: string;
  pinned?: boolean;
}

// ============================================================
// CLÉS
// ============================================================

const LIST_KEY = "liloba-conversations";
const ACTIVE_KEY = "liloba-active-conversation";
const CONV_PREFIX = "liloba-conversation-";
const MAX_CONVERSATIONS = 100;
const MAX_STORED_MESSAGES = 200;

// ============================================================
// HELPERS
// ============================================================

function makeId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function messageKey(convId: string): string {
  return `${CONV_PREFIX}${convId}`;
}

// 📢 Prévient le menu (Récentes) qu'il doit se rafraîchir
function notifyConversationsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("liloba:conversations-updated"));
}

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, " ");
  const noMarkdown = cleaned.replace(/[#*_`>\[\]()]/g, "").trim();
  const words = noMarkdown.split(" ").slice(0, 6).join(" ");
  if (words.length <= 50) return words;
  return words.slice(0, 47) + "…";
}

function generatePreview(messages: Message[]): string {
  if (messages.length === 0) return "";
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.content);
  const text =
    lastAssistant?.content || messages[messages.length - 1]?.content || "";
  const cleaned = text.replace(/[#*_`]/g, "").trim().replace(/\s+/g, " ");
  if (cleaned.length <= 100) return cleaned;
  return cleaned.slice(0, 97) + "…";
}

// ============================================================
// TRI
// ============================================================

export function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const aPin = a.pinned ? 1 : 0;
    const bPin = b.pinned ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    return b.updatedAt - a.updatedAt;
  });
}

// ============================================================
// LECTURE — Simple, sans nettoyage
// ============================================================

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortConversations(parsed);
  } catch {
    return [];
  }
}

export function getConversation(id: string): Conversation | null {
  return getConversations().find((c) => c.id === id) || null;
}

export function getMessages(convId: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(messageKey(convId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: Message) => ({
      ...m,
      isStreaming: false,
      status: undefined,
    }));
  } catch {
    return [];
  }
}

export function getActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

// ============================================================
// ÉCRITURE
// ============================================================

export function setActiveConversationId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch {
    // ignore
  }
}

export function createConversation(): Conversation {
  const now = Date.now();
  const conv: Conversation = {
    id: makeId(),
    title: "Nouvelle discussion",
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    preview: "",
    pinned: false,
  };

  const list = getConversations();
  const updated = [conv, ...list].slice(0, MAX_CONVERSATIONS);

  if (typeof window !== "undefined") {
    localStorage.setItem(LIST_KEY, JSON.stringify(updated));
    localStorage.setItem(messageKey(conv.id), "[]");
    setActiveConversationId(conv.id);
    notifyConversationsUpdated();
  }

  return conv;
}

export function saveMessages(convId: string, messages: Message[]): void {
  if (typeof window === "undefined") return;

  try {
    const clean = messages
      .filter((m) => !m.isStreaming)
      .slice(-MAX_STORED_MESSAGES);

    const json = JSON.stringify(clean);

    // Rien n'a changé (ex : pendant que la réponse s'écrit) → on ne fait rien
    if (localStorage.getItem(messageKey(convId)) === json) return;

    // 1. Sauvegarde les messages
    localStorage.setItem(messageKey(convId), json);

    // 2. Met à jour la conv dans la liste
    const raw = localStorage.getItem(LIST_KEY);
    const list: Conversation[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return;

    const idx = list.findIndex((c) => c.id === convId);
    if (idx === -1) return;

    // Titre : basé sur le 1er message utilisateur s'il existe
    const firstUserMsg = clean.find((m) => m.role === "user");
    const newTitle =
      firstUserMsg && firstUserMsg.content.trim().length > 0
        ? generateTitle(firstUserMsg.content)
        : list[idx].title;

    list[idx] = {
      ...list[idx],
      title: newTitle,
      updatedAt: Date.now(),
      messageCount: clean.length,
      preview: generatePreview(clean),
    };

    localStorage.setItem(LIST_KEY, JSON.stringify(list));

    // 📢 Le menu se met à jour tout de suite
    notifyConversationsUpdated();
  } catch {
    // ignore
  }
}

export function deleteConversation(convId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return;
    const list: Conversation[] = JSON.parse(raw);
    if (!Array.isArray(list)) return;

    const filtered = list.filter((c) => c.id !== convId);
    localStorage.setItem(LIST_KEY, JSON.stringify(filtered));
    localStorage.removeItem(messageKey(convId));

    if (getActiveConversationId() === convId) {
      setActiveConversationId(null);
    }
    notifyConversationsUpdated();
  } catch {
    // ignore
  }
}

export function deleteAllConversations(): void {
  if (typeof window === "undefined") return;
  try {
    const list = getConversations();
    for (const conv of list) {
      localStorage.removeItem(messageKey(conv.id));
    }
    localStorage.removeItem(LIST_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    notifyConversationsUpdated();
  } catch {
    // ignore
  }
}

// ============================================================
// ÉPINGLER / DÉSÉPINGLER
// ============================================================

export function togglePinConversation(convId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return false;
    const list: Conversation[] = JSON.parse(raw);
    if (!Array.isArray(list)) return false;

    const idx = list.findIndex((c) => c.id === convId);
    if (idx === -1) return false;

    const wasPinned = list[idx].pinned === true;
    list[idx] = { ...list[idx], pinned: !wasPinned };

    localStorage.setItem(LIST_KEY, JSON.stringify(list));
    notifyConversationsUpdated();
    return list[idx].pinned ?? false;
  } catch {
    return false;
  }
}

// ============================================================
// RECHERCHE
// ============================================================

export function searchConversations(query: string): Conversation[] {
  if (!query.trim()) return getConversations();

  const q = query.toLowerCase().trim();
  const all = getConversations();

  return all.filter((conv) => {
    if (conv.title.toLowerCase().includes(q)) return true;
    if (conv.preview.toLowerCase().includes(q)) return true;

    const messages = getMessages(conv.id);
    return messages.some((m) => m.content.toLowerCase().includes(q));
  });
}

// ============================================================
// FORMAT DATE
// ============================================================

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "à l'instant";
  if (diff < hour) return `il y a ${Math.floor(diff / minute)} min`;
  if (diff < day) return `il y a ${Math.floor(diff / hour)} h`;
  if (diff < 2 * day) return "hier";
  if (diff < 7 * day) return `il y a ${Math.floor(diff / day)} j`;

  const date = new Date(timestamp);
  const mois = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${date.getDate()} ${mois[date.getMonth()]}`;
}
