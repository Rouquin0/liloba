"use client";

import ProfileSwitcher from "@/components/profile/ProfileSwitcher";
import ReadingPlanButton from "@/components/plan/ReadingPlan";

// ============================================================
// LILOBA — Accueil : deux boutons ronds côte à côte
//   gauche : profil famille (avatar + prénom) · droite : plan de lecture
// ============================================================

export default function HomeQuickActions({ tone = "theme" }: { tone?: "theme" | "dark" }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ProfileSwitcher variant="pill" tone={tone} />
      <ReadingPlanButton tone={tone} />
    </div>
  );
}
