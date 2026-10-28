"use client";


import { localStorage } from "@/lib/profile-storage";
// ============================================================
// LILOBA — SELAH · sujets de prière suivis (« exaucé »)
// ============================================================
// L'utilisateur peut ajouter un sujet depuis l'étape « Cœur »
// (champ existant) et le retrouver ici, le marquer « exaucé »
// ou le supprimer. 100 % local, hors ligne.
// Clé "liloba-selah-topics" (sauvegarde/export automatiques).
// ============================================================

const KEY = "liloba-selah-topics";
const EVENT = "liloba:selah-topics-updated";
const MAX_TOPICS = 60;

export interface PrayerTopic {
  id: string;
  text: string;
  createdAt: number;
  /** Date locale (AAAA-MM-JJ) où le sujet vient de la pause. */
  date: string;
  /** Timestamp du marquage « exaucé », ou undefined. */
  answeredAt?: number;
}

function isDateKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function parse(raw: string | null): PrayerTopic[] {
  if (!raw) return [];
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const out: PrayerTopic[] = [];
    for (const e of arr) {
      if (!e || typeof e !== "object") continue;
      const o = e as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.text !== "string") continue;
      if (!o.text.trim()) continue;
      out.push({
        id: o.id,
        text: o.text.slice(0, 140),
        createdAt: typeof o.createdAt === "number" ? o.createdAt : 0,
        date: isDateKey(o.date) ? o.date : "",
        answeredAt: typeof o.answeredAt === "number" ? o.answeredAt : undefined,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_TOPICS);
  } catch {
    return [];
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: PrayerTopic[] = [];

export function getPrayerTopics(): PrayerTopic[] {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // ignore
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheVal = parse(raw);
  }
  return cacheVal;
}

export function getServerPrayerTopics(): PrayerTopic[] {
  return [];
}

export function subscribePrayerTopics(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function write(topics: PrayerTopic[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(topics.slice(0, MAX_TOPICS)));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addPrayerTopic(text: string, date: string): PrayerTopic | null {
  const t = text.trim().slice(0, 140);
  if (!t) return null;
  // Évite les doublons exacts non exaucés
  const cur = getPrayerTopics();
  const existing = cur.find((x) => x.text.toLowerCase() === t.toLowerCase() && !x.answeredAt);
  if (existing) return existing;
  const entry: PrayerTopic = {
    id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: t,
    createdAt: Date.now(),
    date: isDateKey(date) ? date : "",
  };
  write([entry, ...cur]);
  return entry;
}

/** Bascule « exaucé » / « pas encore ». */
export function toggleTopicAnswered(id: string): void {
  write(
    getPrayerTopics().map((t) =>
      t.id === id ? { ...t, answeredAt: t.answeredAt ? undefined : Date.now() } : t
    )
  );
}

export function deletePrayerTopic(id: string): void {
  write(getPrayerTopics().filter((t) => t.id !== id));
}

export function clearPrayerTopics(): void {
  write([]);
}
