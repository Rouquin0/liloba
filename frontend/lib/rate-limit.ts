"use client";

// ============================================================
// LILOBA — Rate Limiting côté client (Apollos)
// ============================================================

const STORAGE_KEY = "liloba:apollos-rate-limit";

// Limites
const MAX_PER_MINUTE = 2;
const MAX_PER_DAY = 10;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Détection d'horloge modifiée
const MAX_FORWARD_JUMP_MS = 2 * 60 * 60 * 1000; // 2h de saut max autorisé
const CLOCK_TAMPER_KEY = "liloba:apollos-clock-tamper";

interface RateLimitState {
  timestamps: number[];
  /** Heure du dernier enregistrement (pour détecter les sauts temporels) */
  lastSeen?: number;
}

// ============================================================
// STOCKAGE
// ============================================================

function loadState(): RateLimitState {
  if (typeof window === "undefined") return { timestamps: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timestamps: [] };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.timestamps)) {
      return {
        timestamps: parsed.timestamps,
        lastSeen: typeof parsed.lastSeen === "number" ? parsed.lastSeen : undefined,
      };
    }
    return { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function saveState(state: RateLimitState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("liloba:rate-limit-updated"));
  } catch {}
}

// ============================================================
// DÉTECTION D'HORLOGE MODIFIÉE
// ============================================================

/**
 * Vérifie si l'horloge a été modifiée.
 * Renvoie `true` si on suspecte une fraude.
 */
function isClockTampered(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Marqueur persistant de fraude détectée
    const tamperFlag = localStorage.getItem(CLOCK_TAMPER_KEY);
    if (tamperFlag === "true") return true;

    const state = loadState();
    const now = Date.now();

    if (!state.lastSeen) return false;

    // Cas 1 : L'heure recule (horloge inversée)
    if (now < state.lastSeen) {
      markClockTampered();
      return true;
    }

    // Cas 2 : Saut en avant suspect (> 2h sans activité)
    const delta = now - state.lastSeen;
    if (delta > MAX_FORWARD_JUMP_MS) {
      // Vérifie qu'il n'y a pas eu de vraie pause (fermeture de l'app)
      // Si le dernier message date de < 2h et que lastSeen a plus de 2h
      // d'écart, c'est suspect
      const lastMessage = state.timestamps.length > 0
        ? Math.max(...state.timestamps)
        : 0;

      if (lastMessage > 0 && delta > MAX_FORWARD_JUMP_MS) {
        markClockTampered();
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function markClockTampered(): void {
  try {
    localStorage.setItem(CLOCK_TAMPER_KEY, "true");
  } catch {}
}

/**
 * Reset manuel du flag de fraude (debug/dev uniquement).
 */
export function resetClockTamper(): void {
  try {
    localStorage.removeItem(CLOCK_TAMPER_KEY);
    window.dispatchEvent(new Event("liloba:rate-limit-updated"));
  } catch {}
}

// ============================================================
// LOGIQUE
// ============================================================

function getFreshState(): RateLimitState {
  const state = loadState();
  const now = Date.now();
  const fresh = state.timestamps.filter((t) => now - t < DAY_MS);
  return { timestamps: fresh, lastSeen: now };
}

export function getCountLastMinute(): number {
  const state = getFreshState();
  const now = Date.now();
  return state.timestamps.filter((t) => now - t < MINUTE_MS).length;
}

export function getCountLastDay(): number {
  return getFreshState().timestamps.length;
}

export function getRemainingToday(): number {
  return Math.max(0, MAX_PER_DAY - getCountLastDay());
}

export function getSecondsUntilNextAllowed(): number {
  const state = getFreshState();
  const now = Date.now();
  const lastMinute = state.timestamps
    .filter((t) => now - t < MINUTE_MS)
    .sort((a, b) => a - b);

  if (lastMinute.length < MAX_PER_MINUTE) return 0;

  const oldest = lastMinute[0];
  const secondsLeft = Math.ceil((oldest + MINUTE_MS - now) / 1000);
  return Math.max(0, secondsLeft);
}

export interface SendCheck {
  allowed: boolean;
  reason?: "minute" | "day" | "clock";
  remainingToday: number;
  secondsUntilAllowed: number;
}

export function canSend(): SendCheck {
  // 🛡️ 1. Vérifie si l'horloge a été modifiée
  if (isClockTampered()) {
    return {
      allowed: false,
      reason: "clock",
      remainingToday: 0,
      secondsUntilAllowed: 0,
    };
  }

  const countMinute = getCountLastMinute();
  const countDay = getCountLastDay();
  const remaining = MAX_PER_DAY - countDay;

  // 🛡️ 2. Limite quotidienne
  if (countDay >= MAX_PER_DAY) {
    return {
      allowed: false,
      reason: "day",
      remainingToday: 0,
      secondsUntilAllowed: 0,
    };
  }

  // 🛡️ 3. Limite par minute
  if (countMinute >= MAX_PER_MINUTE) {
    return {
      allowed: false,
      reason: "minute",
      remainingToday: remaining,
      secondsUntilAllowed: getSecondsUntilNextAllowed(),
    };
  }

  return {
    allowed: true,
    remainingToday: remaining,
    secondsUntilAllowed: 0,
  };
}

export function registerMessage(): void {
  const state = getFreshState();
  state.timestamps.push(Date.now());
  state.lastSeen = Date.now();
  saveState(state);
}

export function resetRateLimit(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("liloba:rate-limit-updated"));
  } catch {}
}

export const RATE_LIMIT_CONFIG = {
  maxPerMinute: MAX_PER_MINUTE,
  maxPerDay: MAX_PER_DAY,
};
