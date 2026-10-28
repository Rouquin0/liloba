"use client";

import { useSyncExternalStore } from "react";
import {
  getProfilesState,
  getServerProfilesState,
  subscribeProfiles,
  type Profile,
} from "@/lib/profile-storage";

/** Liste des profils + profil actif (se met à jour tout seul). */
export function useProfiles(): {
  profiles: Profile[];
  active: Profile;
  activeId: string;
} {
  const state = useSyncExternalStore(subscribeProfiles, getProfilesState, getServerProfilesState);
  const active = state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0];
  return { profiles: state.profiles, active, activeId: active.id };
}
