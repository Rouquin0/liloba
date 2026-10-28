"use client";

import CryptoJS from "crypto-js";
import { localStorage } from "@/lib/profile-storage";

// ============================================================
// LILOBA — Notes privées chiffrées (AES)
// ============================================================

const STORAGE_KEY = "liloba-private-notes";
const CONFIG_KEY = "liloba-private-config";
const SALT_KEY = "liloba-private-salt";

// ---------- Types ----------

export interface PrivateNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;          // Note épinglée en haut de la liste
}

export interface PrivateConfig {
  hasSetup: boolean;
  pinHash: string;           // Hash du PIN (jamais en clair)
  securityQuestion: string;
  securityAnswerHash: string;
  createdAt: number;
}

// ---------- Utilitaires crypto ----------

function hashString(str: string): string {
  return CryptoJS.SHA256(str).toString();
}

function getSalt(): string {
  if (typeof window === "undefined") return "default-salt";
  try {
    let salt = localStorage.getItem(SALT_KEY);
    if (!salt) {
      salt = CryptoJS.lib.WordArray.random(16).toString();
      localStorage.setItem(SALT_KEY, salt);
    }
    return salt;
  } catch {
    return "default-salt";
  }
}

function encrypt(plainText: string, pin: string): string {
  const salt = getSalt();
  const key = CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
  const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
  return encrypted;
}

function decrypt(cipherText: string, pin: string): string | null {
  try {
    const salt = getSalt();
    const key = CryptoJS.PBKDF2(pin, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
    const decrypted = CryptoJS.AES.decrypt(cipherText, key);
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text || null;
  } catch {
    return null;
  }
}

// ============================================================
// CONFIGURATION (PIN + question de secours)
// ============================================================

export function isPrivateNotesSetup(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config: PrivateConfig = JSON.parse(raw);
    return config.hasSetup === true;
  } catch {
    return false;
  }
}

export function setupPrivateNotes(
  pin: string,
  securityQuestion: string,
  securityAnswer: string
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const config: PrivateConfig = {
      hasSetup: true,
      pinHash: hashString(pin),
      securityQuestion,
      securityAnswerHash: hashString(securityAnswer.toLowerCase().trim()),
      createdAt: Date.now(),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function verifyPin(pin: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config: PrivateConfig = JSON.parse(raw);
    return config.pinHash === hashString(pin);
  } catch {
    return false;
  }
}

export function getSecurityQuestion(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const config: PrivateConfig = JSON.parse(raw);
    return config.securityQuestion;
  } catch {
    return null;
  }
}

export function verifySecurityAnswer(answer: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config: PrivateConfig = JSON.parse(raw);
    return config.securityAnswerHash === hashString(answer.toLowerCase().trim());
  } catch {
    return false;
  }
}

export function resetPrivateNotes(pin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!verifyPin(pin)) return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function deletePrivateNotesConfig(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(SALT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function changePin(oldPin: string, newPin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!verifyPin(oldPin)) return false;

  try {
    // Déchiffre les notes avec l'ancien PIN, rechiffre avec le nouveau
    const notes = getNotes(oldPin);
    if (notes === null) return false;

    // Change le PIN
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config: PrivateConfig = JSON.parse(raw);
    config.pinHash = hashString(newPin);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

    // Rechiffre toutes les notes
    saveAllNotes(notes, newPin);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// NOTES CHIFFRÉES
// ============================================================

interface EncryptedStore {
  version: 1;
  items: { id: string; data: string }[]; // data = AES chiffré
}

function readStore(): EncryptedStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) {
      return { version: 1, items: [] };
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(store: EncryptedStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function getNotes(pin: string): PrivateNote[] | null {
  const store = readStore();
  if (!store) return null;

  const notes: PrivateNote[] = [];

  for (const item of store.items) {
    const decrypted = decrypt(item.data, pin);
    if (decrypted === null) {
      // Mauvaise clé → PIN incorrect
      return null;
    }
    try {
      const note: PrivateNote = JSON.parse(decrypted);
      notes.push(note);
    } catch {
      return null;
    }
  }

  // Notes épinglées d'abord, puis les plus récentes
  return notes.sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.updatedAt - a.updatedAt;
  });
}

function saveAllNotes(notes: PrivateNote[], pin: string): void {
  const store: EncryptedStore = {
    version: 1,
    items: notes.map((note) => ({
      id: note.id,
      data: encrypt(JSON.stringify(note), pin),
    })),
  };
  writeStore(store);
}

export function addNote(
  note: Omit<PrivateNote, "id" | "createdAt" | "updatedAt">,
  pin: string
): boolean {
  const existing = getNotes(pin);
  if (existing === null) return false;

  const now = Date.now();
  const newNote: PrivateNote = {
    id: `pn-${now}-${Math.random().toString(36).slice(2, 9)}`,
    title: note.title,
    content: note.content,
    createdAt: now,
    updatedAt: now,
  };

  saveAllNotes([newNote, ...existing], pin);
  return true;
}

export function updateNote(
  id: string,
  updates: { title?: string; content?: string },
  pin: string
): boolean {
  const notes = getNotes(pin);
  if (notes === null) return false;

  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return false;

  notes[idx] = {
    ...notes[idx],
    ...updates,
    updatedAt: Date.now(),
  };

  saveAllNotes(notes, pin);
  return true;
}

export function deleteNote(id: string, pin: string): boolean {
  const notes = getNotes(pin);
  if (notes === null) return false;

  const filtered = notes.filter((n) => n.id !== id);
  saveAllNotes(filtered, pin);
  return true;
}

// Épingle / désépingle une note (sans changer sa date de modification)
export function togglePinNote(id: string, pin: string): boolean {
  const notes = getNotes(pin);
  if (notes === null) return false;

  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return false;

  notes[idx] = { ...notes[idx], pinned: !notes[idx].pinned };
  saveAllNotes(notes, pin);
  return true;
}

export function countNotes(pin: string): number {
  const notes = getNotes(pin);
  return notes ? notes.length : 0;
}

// ---------- Helpers ----------

export function formatNoteDate(timestamp: number): string {
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
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

// ---------- Session (verrouillage auto) ----------

const SESSION_KEY = "liloba-private-session";

export function saveSession(pin: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, pin);
  } catch {
    // ignore
  }
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// ============================================================
// PROTECTION CONTRE LES ESSAIS RÉPÉTÉS
// ============================================================
// Après 5 mauvais codes : blocage de 30 s, puis 1 min, 2 min…
// (maximum 15 min). Protection côté appareil.

const ATTEMPTS_KEY = "liloba-private-attempts";
const MAX_ATTEMPTS = 5;
const BASE_LOCK_MS = 30000;
const MAX_LOCK_MS = 15 * 60 * 1000;

interface AttemptsState {
  count: number;
  lockedUntil: number;
}

function readAttempts(): AttemptsState {
  if (typeof window === "undefined") return { count: 0, lockedUntil: 0 };
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      count: Number(parsed.count) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeAttempts(state: AttemptsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// Temps de blocage restant (en millisecondes), 0 si pas bloqué
export function getLockoutRemaining(): number {
  const { lockedUntil } = readAttempts();
  return Math.max(0, lockedUntil - Date.now());
}

export function registerFailedAttempt(): {
  locked: boolean;
  remainingMs: number;
  attemptsLeft: number;
} {
  const state = readAttempts();
  const count = state.count + 1;
  let lockedUntil = state.lockedUntil;
  let locked = false;

  if (count % MAX_ATTEMPTS === 0) {
    const level = count / MAX_ATTEMPTS; // 1, 2, 3…
    const duration = Math.min(
      BASE_LOCK_MS * Math.pow(2, level - 1),
      MAX_LOCK_MS
    );
    lockedUntil = Date.now() + duration;
    locked = true;
  }

  writeAttempts({ count, lockedUntil });

  return {
    locked,
    remainingMs: Math.max(0, lockedUntil - Date.now()),
    attemptsLeft: locked ? 0 : MAX_ATTEMPTS - (count % MAX_ATTEMPTS),
  };
}

export function resetFailedAttempts(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function formatLockout(ms: number): string {
  const total = Math.ceil(ms / 1000);
  if (total < 60) return `${total} s`;
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return sec === 0 ? `${m} min` : `${m} min ${sec} s`;
}

// ============================================================
// DÉLAI DE VERROUILLAGE AUTOMATIQUE (inactivité)
// ============================================================

const AUTOLOCK_KEY = "liloba-private-autolock";
const DEFAULT_AUTOLOCK = 30;

export const AUTOLOCK_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 s" },
  { value: 30, label: "30 s" },
  { value: 60, label: "1 min" },
  { value: 300, label: "5 min" },
];

export function getAutoLockSeconds(): number {
  if (typeof window === "undefined") return DEFAULT_AUTOLOCK;
  try {
    const raw = Number(localStorage.getItem(AUTOLOCK_KEY));
    return AUTOLOCK_OPTIONS.some((o) => o.value === raw)
      ? raw
      : DEFAULT_AUTOLOCK;
  } catch {
    return DEFAULT_AUTOLOCK;
  }
}

export function setAutoLockSeconds(seconds: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTOLOCK_KEY, String(seconds));
  } catch {
    // ignore
  }
}
