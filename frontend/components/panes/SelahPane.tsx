"use client";

import SelahTab from "@/components/SelahTab";

// Panneau Selah du Split View : même contenu que /selah, en version compacte
// (pas de navigation de page : les actions pilotent l'autre panneau).
export default function SelahPane() {
  return (
    <div className="h-full overflow-y-auto">
      <SelahTab compact />
    </div>
  );
}
