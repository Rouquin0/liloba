"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import PinKeypad from "@/components/PinKeypad";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { useProfiles } from "@/hooks/useProfiles";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import {
  AVATAR_IDS,
  MAX_NAME_LENGTH,
  MAX_PROFILES,
  PROFILE_COLORS,
  createProfile,
  deleteProfile,
  pinLockSeconds,
  setProfilePin,
  switchProfile,
  updateProfile,
  verifyProfilePin,
  type AvatarId,
  type Profile,
} from "@/lib/profile-storage";

// ============================================================
// LILOBA — MODE FAMILLE · Sélecteur de profil
// ------------------------------------------------------------
// Une puce (avatar + prénom) visible en haut du menu et sur l'accueil :
// 1 clic → « Qui lit aujourd'hui ? » → on choisit → la page se recharge
// avec les données de ce profil (carnet, série, trophées, Selah…).
// Les profils protégés par un code demandent ce code pour être ouverts.
// 100 % local, aucune dépendance.
// ============================================================

const UI = {
  fr: {
    change: "Changer de profil",
    title: "Qui lit aujourd'hui ?",
    active: "Actif",
    add: "Ajouter un profil",
    max: `${MAX_PROFILES} profils au maximum`,
    edit: "Modifier",
    newProfile: "Nouveau profil",
    editProfile: "Modifier le profil",
    nameLabel: "Prénom",
    namePh: "Prénom ou surnom",
    avatarLabel: "Avatar",
    colorLabel: "Couleur",
    pinTitle: "Code PIN (optionnel)",
    pinHint: "Un code à 4 chiffres, demandé pour ouvrir ce profil. Idéal pour les parents.",
    pinOn: "Profil protégé par un code",
    pinSet: "Définir un code",
    pinChange: "Changer le code",
    pinRemove: "Retirer le code",
    pinPending: "Code prêt : il sera enregistré",
    save: "Enregistrer",
    cancel: "Annuler",
    back: "Retour",
    close: "Fermer",
    del: "Supprimer ce profil",
    confirmDelete: (n: string) =>
      `Supprimer le profil « ${n} » et TOUTES ses données (carnet, notes, série, Selah, conversations…) ?\n\nCette action est irréversible.`,
    lastProfile: "Il faut garder au moins un profil.",
    enterPin: (n: string) => `Entre le code de ${n}`,
    newPin: "Choisis un code à 4 chiffres",
    confirmPin: "Confirme le code",
    mismatch: "Les deux codes ne correspondent pas",
    wrong: "Code incorrect",
    locked: (s: number) => `Trop d'essais. Réessaie dans ${s} s`,
    switching: (n: string) => `Profil de ${n}…`,
  },
  en: {
    change: "Switch profile",
    title: "Who's reading today?",
    active: "Active",
    add: "Add a profile",
    max: `${MAX_PROFILES} profiles maximum`,
    edit: "Edit",
    newProfile: "New profile",
    editProfile: "Edit profile",
    nameLabel: "First name",
    namePh: "Name or nickname",
    avatarLabel: "Avatar",
    colorLabel: "Color",
    pinTitle: "PIN code (optional)",
    pinHint: "A 4-digit code asked to open this profile. Ideal for parents.",
    pinOn: "Profile protected by a code",
    pinSet: "Set a code",
    pinChange: "Change the code",
    pinRemove: "Remove the code",
    pinPending: "Code ready: it will be saved",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    close: "Close",
    del: "Delete this profile",
    confirmDelete: (n: string) =>
      `Delete the profile “${n}” and ALL its data (journal, notes, streak, Selah, conversations…)?\n\nThis cannot be undone.`,
    lastProfile: "You must keep at least one profile.",
    enterPin: (n: string) => `Enter ${n}'s code`,
    newPin: "Choose a 4-digit code",
    confirmPin: "Confirm the code",
    mismatch: "The two codes don't match",
    wrong: "Wrong code",
    locked: (s: number) => `Too many tries. Try again in ${s}s`,
    switching: (n: string) => `${n}'s profile…`,
  },
};

type Dict = (typeof UI)["fr"];

type View =
  | { kind: "list" }
  | { kind: "verify"; target: Profile; then: "switch" | "edit" | "delete" }
  | { kind: "edit"; profileId: string | null }
  | { kind: "switching"; profile: Profile };

// ------------------------------------------------------------
// Icônes SVG (stroke)
// ------------------------------------------------------------

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Chevron({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ico} strokeWidth={3} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...ico} aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

// ------------------------------------------------------------
// Clavier de code (vérification ou création)
// ------------------------------------------------------------

function CodeEntry({
  prompt,
  error,
  disabled,
  onComplete,
}: {
  prompt: string;
  error: string | null;
  disabled?: boolean;
  onComplete: (code: string) => void;
}) {
  const [value, setValue] = useState("");
  // Une erreur fait vibrer les points, puis le code est effacé
  const shake = !!error;
  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => setValue(""), 600);
    return () => window.clearTimeout(t);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-2">
      <p className="mb-4 text-center text-sm font-medium text-[var(--foreground)]">{prompt}</p>
      <PinKeypad
        value={value}
        onChange={(next) => {
          setValue(next);
          if (next.length === 4) onComplete(next);
        }}
        length={4}
        error={shake}
        disabled={disabled}
        message={error}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Éditeur (création / modification)
// ------------------------------------------------------------

function Editor({
  l,
  profile,
  canDelete,
  onDone,
  onDelete,
}: {
  l: Dict;
  profile: Profile | null;
  canDelete: boolean;
  onDone: (created?: Profile) => void;
  onDelete: () => void;
}) {
  const nameId = useId();
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState<AvatarId>(profile?.avatar ?? "lamb");
  const [color, setColor] = useState(profile?.color ?? PROFILE_COLORS[1]);
  const [pinPending, setPinPending] = useState<string | null>(null);
  const [pinRemoved, setPinRemoved] = useState(false);
  const [pinStep, setPinStep] = useState<null | "new" | "confirm">(null);
  const [firstCode, setFirstCode] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasPin = pinPending !== null || (!!profile?.pin && !pinRemoved);

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (profile) {
        updateProfile(profile.id, { name, avatar, color });
        if (pinPending) await setProfilePin(profile.id, pinPending);
        else if (pinRemoved) await setProfilePin(profile.id, null);
        onDone();
      } else {
        const created = await createProfile({ name, avatar, color, pin: pinPending });
        onDone(created ?? undefined);
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- Étape code PIN ----
  if (pinStep) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setPinStep(null);
            setPinError(null);
          }}
          className="mb-1 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <BackIcon />
          {l.back}
        </button>
        <CodeEntry
          key={pinStep}
          prompt={pinStep === "new" ? l.newPin : l.confirmPin}
          error={pinError}
          onComplete={(code) => {
            if (pinStep === "new") {
              setFirstCode(code);
              setPinError(null);
              setPinStep("confirm");
            } else if (code === firstCode) {
              setPinPending(code);
              setPinRemoved(false);
              setPinStep(null);
              setPinError(null);
            } else {
              setPinError(l.mismatch);
              window.setTimeout(() => {
                setPinError(null);
                setPinStep("new");
              }, 700);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Aperçu + prénom */}
      <div className="flex items-center gap-3">
        <ProfileAvatar avatar={avatar} color={color} size={56} />
        <div className="min-w-0 flex-1">
          <label htmlFor={nameId} className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
            {l.nameLabel}
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder={l.namePh}
            autoFocus={!profile}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Avatar */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">{l.avatarLabel}</p>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={l.avatarLabel}>
          {AVATAR_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={avatar === id}
              aria-label={id}
              onClick={() => setAvatar(id)}
              className={`flex min-h-[56px] items-center justify-center rounded-xl border transition-all active:scale-95 ${
                avatar === id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--border)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              <ProfileAvatar avatar={id} color={color} size={40} />
            </button>
          ))}
        </div>
      </div>

      {/* Couleur */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">{l.colorLabel}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={l.colorLabel}>
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ background: c }}
            >
              {color === c && <span className="text-white"><CheckIcon className="h-4 w-4" /></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Code PIN */}
      <div className="rounded-2xl border border-[var(--border)] p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
          <LockIcon />
          {l.pinTitle}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {pinPending ? l.pinPending : hasPin ? l.pinOn : l.pinHint}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPinError(null);
              setPinStep("new");
            }}
            className="min-h-[44px] rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
          >
            {hasPin ? l.pinChange : l.pinSet}
          </button>
          {hasPin && (
            <button
              type="button"
              onClick={() => {
                setPinPending(null);
                setPinRemoved(true);
              }}
              className="min-h-[44px] rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--muted)] transition-all hover:border-red-500/50 hover:text-red-500"
            >
              {l.pinRemove}
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!name.trim() || saving}
          className="min-h-[48px] w-full rounded-xl bg-[var(--color-accent)] px-5 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40"
        >
          {l.save}
        </button>
        <button
          type="button"
          onClick={() => onDone()}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-[var(--muted)] transition-all hover:border-[var(--color-accent)]"
        >
          {l.cancel}
        </button>
        {profile && (
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            title={canDelete ? undefined : l.lastProfile}
            className="mt-1 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 text-xs font-semibold text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/5 disabled:opacity-30"
          >
            <TrashIcon />
            {l.del}
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Feuille « Qui lit aujourd'hui ? »
// ------------------------------------------------------------

function Sheet({ l, onClose }: { l: Dict; onClose: () => void }) {
  const { profiles, activeId } = useProfiles();
  const [view, setView] = useState<View>({ kind: "list" });
  const [pinError, setPinError] = useState<string | null>(null);
  const [lockLeft, setLockLeft] = useState(0);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Échap ferme (sauf pendant le changement)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view.kind !== "switching") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view.kind]);

  // Compte à rebours du verrou (5 mauvais codes)
  useEffect(() => {
    if (lockLeft <= 0) return;
    const t = window.setTimeout(() => setLockLeft(pinLockSeconds()), 1000);
    return () => window.clearTimeout(t);
  }, [lockLeft]);

  const doSwitch = (p: Profile) => {
    setView({ kind: "switching", profile: p });
    switchProfile(p.id);
    // on laisse l'animation se voir, puis on recharge : toutes les pages relisent leurs données
    window.setTimeout(() => window.location.reload(), 450);
  };

  const requestAccess = (p: Profile, then: "switch" | "edit" | "delete") => {
    if (p.pin) {
      setPinError(null);
      setLockLeft(pinLockSeconds());
      setView({ kind: "verify", target: p, then });
      return;
    }
    proceed(p, then);
  };

  const proceed = (p: Profile, then: "switch" | "edit" | "delete") => {
    if (then === "switch") doSwitch(p);
    else if (then === "edit") setView({ kind: "edit", profileId: p.id });
    else handleDelete(p);
  };

  const handleDelete = (p: Profile) => {
    if (profiles.length <= 1) return;
    if (!confirm(l.confirmDelete(p.name))) {
      setView({ kind: "list" });
      return;
    }
    const wasActive = p.id === activeId;
    deleteProfile(p.id);
    if (wasActive) {
      setView({ kind: "switching", profile: profiles.find((x) => x.id !== p.id) ?? p });
      window.setTimeout(() => window.location.reload(), 450);
    } else {
      setView({ kind: "list" });
    }
  };

  const onVerify = async (code: string) => {
    if (view.kind !== "verify") return;
    const { target, then } = view;
    const ok = await verifyProfilePin(target.id, code);
    if (ok) {
      setPinError(null);
      proceed(target, then);
    } else {
      const left = pinLockSeconds();
      setLockLeft(left);
      setPinError(left > 0 ? l.locked(left) : l.wrong);
      window.setTimeout(() => setPinError(null), 700);
    }
  };

  const editing =
    view.kind === "edit" && view.profileId
      ? profiles.find((p) => p.id === view.profileId) ?? null
      : null;

  const headerTitle =
    view.kind === "edit" ? (view.profileId ? l.editProfile : l.newProfile) : l.title;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm md:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && view.kind !== "switching") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={headerTitle}
    >
      <div className="relative max-h-[88dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--foreground)] shadow-2xl md:p-5">
        {view.kind === "switching" ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <ProfileAvatar avatar={view.profile.avatar} color={view.profile.color} size={72} />
            <p className="text-sm font-semibold">{l.switching(view.profile.name)}</p>
            <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin text-[var(--muted)]" {...ico} aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.2-8.6" />
            </svg>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                {headerTitle}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={l.close}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                <CloseIcon />
              </button>
            </div>

            {view.kind === "list" && (
              <div className="flex flex-col gap-2">
                {profiles.map((p) => {
                  const isActive = p.id === activeId;
                  return (
                    <div key={p.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => (isActive ? onClose() : requestAccess(p, "switch"))}
                        className={`flex min-h-[56px] min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3 text-left transition-all active:scale-[0.99] ${
                          isActive
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                            : "border-[var(--border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <ProfileAvatar avatar={p.avatar} color={p.color} size={40} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{p.name}</span>
                          {isActive && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)]">
                              <CheckIcon className="h-3 w-3" />
                              {l.active}
                            </span>
                          )}
                        </span>
                        {p.pin && (
                          <span className="text-[var(--muted)]">
                            <LockIcon className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => requestAccess(p, "edit")}
                        aria-label={`${l.edit} ${p.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                      >
                        <PencilIcon />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setView({ kind: "edit", profileId: null })}
                  disabled={profiles.length >= MAX_PROFILES}
                  title={profiles.length >= MAX_PROFILES ? l.max : undefined}
                  className="mt-1 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-accent)]/60 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5 disabled:opacity-40"
                >
                  <PlusIcon />
                  {l.add}
                </button>
              </div>
            )}

            {view.kind === "verify" && (
              <div>
                <button
                  type="button"
                  onClick={() => setView({ kind: "list" })}
                  className="mb-1 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <BackIcon />
                  {l.back}
                </button>
                <div className="mb-1 flex justify-center">
                  <ProfileAvatar avatar={view.target.avatar} color={view.target.color} size={56} />
                </div>
                <CodeEntry
                  prompt={lockLeft > 0 ? l.locked(lockLeft) : l.enterPin(view.target.name)}
                  error={pinError}
                  disabled={lockLeft > 0}
                  onComplete={onVerify}
                />
              </div>
            )}

            {view.kind === "edit" && (
              <Editor
                key={view.profileId ?? "new"}
                l={l}
                profile={editing}
                canDelete={profiles.length > 1}
                onDone={() => setView({ kind: "list" })}
                onDelete={() => {
                  if (editing) requestAccess(editing, "delete");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ------------------------------------------------------------
// La puce (avatar + prénom) — à placer où l'on veut
// ------------------------------------------------------------

export default function ProfileSwitcher({
  variant = "menu",
  tone = "theme",
  className = "",
}: {
  /** « pill » : bouton rond d'accueil · « menu » : pleine largeur · « chip » : pastille compacte */
  variant?: "pill" | "menu" | "chip";
  /** « dark » : fond sombre forcé (accueil desktop) */
  tone?: "theme" | "dark";
  className?: string;
}) {
  const { active } = useProfiles();
  const { lang } = useAppLanguage();
  const l = UI[lang === "en" ? "en" : "fr"];
  const [open, setOpen] = useState(false);

  let trigger: ReactNode;
  if (variant === "pill") {
    const dark = tone === "dark";
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${l.change} : ${active.name}`}
        className={`group flex h-12 w-full min-w-0 items-center gap-2 rounded-full border pl-1.5 pr-3 text-sm font-semibold transition-all active:scale-[0.97] ${
          dark
            ? "border-white/10 bg-white/5 text-white hover:border-[#fcd34d]/50 hover:bg-white/10"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-accent)]"
        } ${className}`}
      >
        <ProfileAvatar avatar={active.avatar} color={active.color} size={36} />
        <span className="min-w-0 flex-1 truncate text-left">{active.name}</span>
        <span className={dark ? "text-white/60" : "text-[var(--muted)]"}>
          <Chevron className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  } else if (variant === "menu") {
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${l.change} : ${active.name}`}
        className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/40 px-2 text-left transition-all hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)]/70 active:scale-[0.99] ${className}`}
      >
        <ProfileAvatar avatar={active.avatar} color={active.color} size={30} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--foreground)]">{active.name}</span>
          <span className="block truncate text-[10px] text-[var(--muted)]">{l.change}</span>
        </span>
        <span className="text-[var(--muted)]">
          <Chevron />
        </span>
      </button>
    );
  } else {
    const dark = tone === "dark";
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${l.change} : ${active.name}`}
        className={`inline-flex min-h-[36px] max-w-[150px] items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-semibold transition-all active:scale-95 ${
          dark
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--color-accent)]/50"
        } ${className}`}
      >
        <ProfileAvatar avatar={active.avatar} color={active.color} size={26} />
        <span className="min-w-0 truncate">{active.name}</span>
        <span className={dark ? "text-white/60" : "text-[var(--muted)]"}>
          <Chevron className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  return (
    <>
      {trigger}
      {open && typeof document !== "undefined" && <Sheet l={l} onClose={() => setOpen(false)} />}
    </>
  );
}
