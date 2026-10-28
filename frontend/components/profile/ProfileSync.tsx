"use client";

import { useEffect } from "react";
import {
  PROFILES_META_KEY,
  getActiveProfileId,
  getProfilesState,
} from "@/lib/profile-storage";

// ============================================================
// LILOBA — Mode famille : synchronisation
//  1. Au lancement : réveille le système de profils → la migration des
//     données existantes vers « Principal » se fait ici, une seule fois.
//  2. Si le profil change dans UN AUTRE onglet / fenêtre, celui-ci se
//     recharge pour ne jamais écrire dans le mauvais profil.
// Ne rend rien à l'écran.
// ============================================================

export default function ProfileSync() {
  useEffect(() => {
    getProfilesState();
    const current = getActiveProfileId();
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PROFILES_META_KEY) return;
      if (getActiveProfileId() !== current) window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
