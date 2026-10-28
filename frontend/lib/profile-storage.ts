// ============================================================
// LILOBA — MODE FAMILLE · Stockage par profil
// ============================================================
// Chaque profil (parent, enfant…) a ses propres données : carnet, notes,
// favoris, historique, série, temps de lecture, intentions de prière,
// Selah, conversations, scores des jeux, âge, préférences de lecture…
//
// Comment ça marche :
//   • Les fichiers de l'app importent ce module sous le nom `localStorage`
//       import { localStorage } from "@/lib/profile-storage";
//     et continuent d'écrire `localStorage.getItem("liloba-journal")` comme
//     avant. Pour les clés « personnelles », le vrai nom stocké devient
//       liloba-<profil>-journal      (ex. liloba-main-journal)
//     Les clés « de l'appareil » (thème, langue, notifications, limites
//     Apollos, mise en page…) ne changent pas : elles restent communes.
//   • La liste des profils et le profil actif sont dans UNE clé commune :
//       liloba-profiles
//   • Au tout premier lancement après la mise à jour, les données existantes
//     sont COPIÉES dans le profil « Principal » (id « main »). Les anciennes
//     clés ne sont pas supprimées tout de suite (filet de sécurité 30 jours).
//
// 100 % local : aucun serveur, aucune dépendance, aucun compte.
// ============================================================

// ------------------------------------------------------------
// Types & constantes
// ------------------------------------------------------------

export type AvatarId = "dove" | "lamb" | "lion" | "fish" | "leaf" | "star" | "crown" | "anchor";

export const AVATAR_IDS: AvatarId[] = [
  "dove",
  "lamb",
  "lion",
  "fish",
  "leaf",
  "star",
  "crown",
  "anchor",
];

export const PROFILE_COLORS = [
  "#047857",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#4b5563",
];

export interface ProfilePin {
  salt: string;
  hash: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarId;
  color: string;
  /** Code PIN optionnel (haché, jamais stocké en clair). */
  pin?: ProfilePin;
  createdAt: number;
}

export interface ProfilesState {
  v: 1;
  activeId: string;
  profiles: Profile[];
}

export const MAIN_PROFILE_ID = "main";
export const MAX_PROFILES = 8;
export const MAX_NAME_LENGTH = 20;
export const PROFILES_EVENT = "liloba:profiles-updated";

export const PROFILES_META_KEY = "liloba-profiles";
const META_KEY = PROFILES_META_KEY;
const MIGRATION_KEY = "liloba-profiles-migration";
const LOCK_KEY = "liloba-profiles-lock";
const LEGACY_GRACE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const PRIVATE_SESSION_KEY = "liloba-private-session";

// Clés PERSONNELLES (une copie par profil)
const SCOPED_EXACT = new Set([
  "liloba-journal",
  "liloba-notes",
  "liloba-favorites",
  "liloba-highlights",
  "liloba-verse-history",
  "liloba-streak",
  "liloba-reading-time",
  "liloba-age",
  "liloba-onboarded",
  "liloba-accent-color",
  "liloba-text-size",
  "liloba-font-family",
  "liloba-line-height",
  "liloba-display-mode",
  "liloba-default-translation",
  "liloba-conversations",
  "liloba-active-conversation",
  "liloba-reading-plan", // plan de lecture biblique (plan choisi, date de début, progression)
]);

// Familles de clés personnelles (préfixes)
const SCOPED_PREFIXES = [
  "liloba-selah", // Selah : parcours, préférences, sursis, sujets, graines, capsules
  "liloba-private-", // notes privées chiffrées
  "liloba-prayer-", // favoris, intentions, série, amen
  "liloba-games-scores", // scores des jeux (+ -crossword, -wordsearch)
  "liloba-game-", // records memory / ordre
  "liloba-conversation-", // messages de chaque conversation
  "liloba-search-history", // historique de recherche (v1, v2)
];

/** Cette clé est-elle personnelle (propre à un profil) ? */
export function isScopedKey(key: string): boolean {
  if (!key.startsWith("liloba-")) return false;
  if (SCOPED_EXACT.has(key)) return true;
  for (const p of SCOPED_PREFIXES) if (key.startsWith(p)) return true;
  return false;
}

/** « liloba-journal » + profil « main » → « liloba-main-journal » */
export function scopedKey(key: string, profileId: string): string {
  return `liloba-${profileId}-${key.slice("liloba-".length)}`;
}

// ------------------------------------------------------------
// Accès au vrai localStorage
// ------------------------------------------------------------

function rawStore(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Lecture / validation de l'état des profils
// ------------------------------------------------------------

const ID_RE = /^[a-z0-9-]{1,24}$/;

function defaultProfile(): Profile {
  return {
    id: MAIN_PROFILE_ID,
    name: "Principal",
    avatar: "dove",
    color: PROFILE_COLORS[0],
    createdAt: 0,
  };
}

const SERVER_STATE: ProfilesState = {
  v: 1,
  activeId: MAIN_PROFILE_ID,
  profiles: [defaultProfile()],
};

function parseState(raw: string | null): ProfilesState | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<ProfilesState> | null;
    if (!o || o.v !== 1 || !Array.isArray(o.profiles)) return null;
    const seen = new Set<string>();
    const profiles: Profile[] = [];
    for (const p of o.profiles) {
      if (!p || typeof p !== "object") continue;
      const q = p as Partial<Profile>;
      if (typeof q.id !== "string" || !ID_RE.test(q.id) || seen.has(q.id)) continue;
      const name = typeof q.name === "string" ? q.name.trim().slice(0, MAX_NAME_LENGTH) : "";
      seen.add(q.id);
      profiles.push({
        id: q.id,
        name: name || "Profil",
        avatar: AVATAR_IDS.includes(q.avatar as AvatarId) ? (q.avatar as AvatarId) : "dove",
        color: typeof q.color === "string" && /^#[0-9a-fA-F]{6}$/.test(q.color) ? q.color : PROFILE_COLORS[0],
        pin:
          q.pin && typeof q.pin.salt === "string" && typeof q.pin.hash === "string"
            ? { salt: q.pin.salt, hash: q.pin.hash }
            : undefined,
        createdAt: typeof q.createdAt === "number" ? q.createdAt : 0,
      });
    }
    if (profiles.length === 0) return null;
    const activeId =
      typeof o.activeId === "string" && seen.has(o.activeId) ? o.activeId : profiles[0].id;
    return { v: 1, activeId, profiles };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Migration des anciennes données vers un profil
// ------------------------------------------------------------

/** Clés « anciennes » (sans profil) qui devraient être personnelles. */
function legacyKeys(ls: Storage): string[] {
  const out: string[] = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (k && isScopedKey(k)) out.push(k);
  }
  return out;
}

/**
 * COPIE les anciennes clés dans le profil donné. Ne supprime rien.
 * `overwrite` : remplace aussi une valeur déjà présente (import d'une
 * ancienne sauvegarde).
 */
export function migrateLegacyKeys(
  profileId: string,
  overwrite = false
): { copied: number; failed: number } {
  const ls = rawStore();
  if (!ls) return { copied: 0, failed: 0 };
  let copied = 0;
  let failed = 0;
  for (const key of legacyKeys(ls)) {
    try {
      const value = ls.getItem(key);
      if (value === null) continue;
      const dest = scopedKey(key, profileId);
      if (!overwrite && ls.getItem(dest) !== null) continue;
      ls.setItem(dest, value);
      if (ls.getItem(dest) === value) copied++;
      else failed++;
    } catch {
      failed++;
    }
  }
  return { copied, failed };
}

/** Si des profils existent déjà dans les clés mais que la liste est perdue : on la reconstruit. */
function recoverProfilesFromKeys(ls: Storage): Profile[] {
  const ids = new Set<string>();
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    const m = k ? /^liloba-(main|p-[a-z0-9]{3,12})-/.exec(k) : null;
    if (m) ids.add(m[1]);
  }
  const list: Profile[] = [];
  let n = 0;
  for (const id of ids) {
    n++;
    list.push({
      id,
      name: id === MAIN_PROFILE_ID ? "Principal" : `Profil ${n}`,
      avatar: AVATAR_IDS[(n - 1) % AVATAR_IDS.length],
      color: PROFILE_COLORS[(n - 1) % PROFILE_COLORS.length],
      createdAt: Date.now(),
    });
  }
  return list;
}

function bootstrap(ls: Storage): ProfilesState {
  // 1) récupération éventuelle d'une liste de profils perdue
  let profiles = recoverProfilesFromKeys(ls);
  if (!profiles.some((p) => p.id === MAIN_PROFILE_ID)) {
    profiles = [{ ...defaultProfile(), createdAt: Date.now() }, ...profiles];
  }
  const state: ProfilesState = { v: 1, activeId: MAIN_PROFILE_ID, profiles };

  // 2) migration des données existantes → profil Principal (copie, sans rien supprimer)
  const res = migrateLegacyKeys(MAIN_PROFILE_ID, false);

  try {
    ls.setItem(META_KEY, JSON.stringify(state));
    if (res.failed === 0) {
      ls.setItem(
        MIGRATION_KEY,
        JSON.stringify({ at: Date.now(), copied: res.copied, ok: true, cleaned: false })
      );
    }
  } catch {
    // stockage plein / indisponible : l'état reste en mémoire, les lectures de
    // « Principal » retombent sur les anciennes clés (voir getItem)
  }
  return state;
}

let cacheRaw: string | null | undefined;
let cacheState: ProfilesState | null = null;
let cleanupDone = false;

/** Supprime les anciennes clés 30 jours après une migration réussie (copie déjà en place). */
function cleanupLegacyOnce(ls: Storage): void {
  if (cleanupDone) return;
  cleanupDone = true;
  try {
    const m = JSON.parse(ls.getItem(MIGRATION_KEY) ?? "null") as
      | { at?: number; ok?: boolean; cleaned?: boolean }
      | null;
    if (!m?.ok || m.cleaned || typeof m.at !== "number") return;
    if (Date.now() - m.at < LEGACY_GRACE_MS) return;
    for (const key of legacyKeys(ls)) {
      // on ne supprime que si la copie du profil Principal existe bien
      if (ls.getItem(scopedKey(key, MAIN_PROFILE_ID)) !== null) ls.removeItem(key);
    }
    ls.setItem(MIGRATION_KEY, JSON.stringify({ ...m, cleaned: true }));
  } catch {
    // ignore
  }
}

/** État courant des profils (même référence tant que rien ne change). */
export function getProfilesState(): ProfilesState {
  const ls = rawStore();
  if (!ls) return SERVER_STATE;
  let raw: string | null = null;
  try {
    raw = ls.getItem(META_KEY);
  } catch {
    return cacheState ?? SERVER_STATE;
  }
  if (cacheState && raw === cacheRaw) return cacheState;

  let state = parseState(raw);
  if (!state) {
    state = bootstrap(ls);
    try {
      raw = ls.getItem(META_KEY);
    } catch {
      raw = null;
    }
  }
  cacheRaw = raw;
  cacheState = state;
  cleanupLegacyOnce(ls);
  return state;
}

export function getServerProfilesState(): ProfilesState {
  return SERVER_STATE;
}

export function subscribeProfiles(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PROFILES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getActiveProfileId(): string {
  return getProfilesState().activeId;
}

export function getActiveProfile(): Profile {
  const s = getProfilesState();
  return s.profiles.find((p) => p.id === s.activeId) ?? s.profiles[0];
}

function writeState(next: ProfilesState): void {
  const ls = rawStore();
  if (!ls) return;
  ls.setItem(META_KEY, JSON.stringify(next));
  cacheRaw = undefined; // force la relecture
  cacheState = null;
  window.dispatchEvent(new Event(PROFILES_EVENT));
}

// ------------------------------------------------------------
// Le « localStorage » profil-conscient (à importer à la place du global)
// ------------------------------------------------------------

function resolve(key: string): string {
  return isScopedKey(key) ? scopedKey(key, getActiveProfileId()) : key;
}

function migrationOk(ls: Storage): boolean {
  try {
    return JSON.parse(ls.getItem(MIGRATION_KEY) ?? "null")?.ok === true;
  } catch {
    return false;
  }
}

export const localStorage = {
  getItem(key: string): string | null {
    const ls = rawStore();
    if (!ls) return null;
    const pid = getActiveProfileId();
    if (!isScopedKey(key)) return ls.getItem(key);
    const value = ls.getItem(scopedKey(key, pid));
    // Filet de sécurité : si la migration n'a pas pu se terminer (stockage plein),
    // « Principal » continue de lire ses anciennes données.
    if (value === null && pid === MAIN_PROFILE_ID && !migrationOk(ls)) return ls.getItem(key);
    return value;
  },
  setItem(key: string, value: string): void {
    const ls = rawStore();
    if (!ls) return;
    ls.setItem(resolve(key), value);
  },
  removeItem(key: string): void {
    const ls = rawStore();
    if (!ls) return;
    ls.removeItem(resolve(key));
  },
};

// ------------------------------------------------------------
// Gestion des profils
// ------------------------------------------------------------

function makeId(existing: Set<string>): string {
  for (;;) {
    const id = `p-${Math.random().toString(36).slice(2, 7)}`;
    if (ID_RE.test(id) && id.length >= 5 && !existing.has(id)) return id;
  }
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export interface NewProfileInput {
  name: string;
  avatar: AvatarId;
  color: string;
  pin?: string | null;
}

export async function createProfile(input: NewProfileInput): Promise<Profile | null> {
  const state = getProfilesState();
  const name = cleanName(input.name);
  if (!name || state.profiles.length >= MAX_PROFILES) return null;
  const id = makeId(new Set(state.profiles.map((p) => p.id)));
  const profile: Profile = {
    id,
    name,
    avatar: AVATAR_IDS.includes(input.avatar) ? input.avatar : "dove",
    color: /^#[0-9a-fA-F]{6}$/.test(input.color) ? input.color : PROFILE_COLORS[0],
    createdAt: Date.now(),
  };
  if (input.pin) profile.pin = await makePin(input.pin);
  const latest = getProfilesState();
  if (latest.profiles.length >= MAX_PROFILES) return null;
  writeState({ ...latest, profiles: [...latest.profiles, profile] });
  return profile;
}

export function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "name" | "avatar" | "color">>
): void {
  const state = getProfilesState();
  const profiles = state.profiles.map((p) => {
    if (p.id !== id) return p;
    const name = patch.name !== undefined ? cleanName(patch.name) || p.name : p.name;
    return {
      ...p,
      name,
      avatar:
        patch.avatar && AVATAR_IDS.includes(patch.avatar) ? patch.avatar : p.avatar,
      color:
        patch.color && /^#[0-9a-fA-F]{6}$/.test(patch.color) ? patch.color : p.color,
    };
  });
  writeState({ ...state, profiles });
}

export async function setProfilePin(id: string, pin: string | null): Promise<void> {
  const next = pin ? await makePin(pin) : undefined;
  const state = getProfilesState();
  writeState({
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, pin: next } : p)),
  });
}

/** Change de profil actif. L'interface recharge ensuite la page. */
export function switchProfile(id: string): boolean {
  const state = getProfilesState();
  if (!state.profiles.some((p) => p.id === id)) return false;
  if (state.activeId === id) return true;
  try {
    // le code des notes privées est gardé le temps de la session : on l'oublie
    window.sessionStorage.removeItem(PRIVATE_SESSION_KEY);
  } catch {
    // ignore
  }
  writeState({ ...state, activeId: id });
  return true;
}

/** Supprime un profil ET toutes ses données. Refuse de supprimer le dernier. */
export function deleteProfile(id: string): boolean {
  const state = getProfilesState();
  if (state.profiles.length <= 1) return false;
  if (!state.profiles.some((p) => p.id === id)) return false;
  const ls = rawStore();
  if (!ls) return false;
  const prefix = `liloba-${id}-`;
  const doomed: string[] = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (k && k.startsWith(prefix)) doomed.push(k);
  }
  for (const k of doomed) ls.removeItem(k);
  const profiles = state.profiles.filter((p) => p.id !== id);
  const activeId = state.activeId === id ? profiles[0].id : state.activeId;
  writeState({ ...state, profiles, activeId });
  return true;
}

// ------------------------------------------------------------
// Code PIN (famille : simple, haché avec SHA-256 + sel, jamais en clair)
// ------------------------------------------------------------
// Ce n'est pas un coffre-fort : un code à 4 chiffres protège des enfants
// curieux, pas d'un attaquant qui lirait le stockage de l'appareil.

function randomSalt(): string {
  const a = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(a);
  else for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = `${salt}:${pin}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // contexte non sécurisé : repli ci-dessous
  }
  let h = 2166136261;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv-${(h >>> 0).toString(16)}`;
}

async function makePin(pin: string): Promise<ProfilePin> {
  const salt = randomSalt();
  return { salt, hash: await hashPin(pin, salt) };
}

function readLock(): { fails: number; until: number } {
  try {
    const o = JSON.parse(rawStore()?.getItem(LOCK_KEY) ?? "null");
    if (o && typeof o.fails === "number" && typeof o.until === "number") return o;
  } catch {
    // ignore
  }
  return { fails: 0, until: 0 };
}

/** Secondes restantes avant de pouvoir réessayer un code (0 = libre). */
export function pinLockSeconds(): number {
  return Math.max(0, Math.ceil((readLock().until - Date.now()) / 1000));
}

export async function verifyProfilePin(id: string, pin: string): Promise<boolean> {
  const profile = getProfilesState().profiles.find((p) => p.id === id);
  if (!profile?.pin) return true;
  if (pinLockSeconds() > 0) return false;
  const ok = (await hashPin(pin, profile.pin.salt)) === profile.pin.hash;
  const ls = rawStore();
  try {
    if (ok) {
      ls?.removeItem(LOCK_KEY);
    } else {
      const cur = readLock();
      const fails = cur.fails + 1;
      // 5 erreurs de suite → 30 secondes d'attente
      ls?.setItem(
        LOCK_KEY,
        JSON.stringify({ fails: fails % 5 === 0 ? 0 : fails, until: fails % 5 === 0 ? Date.now() + 30_000 : 0 })
      );
    }
  } catch {
    // ignore
  }
  return ok;
}
