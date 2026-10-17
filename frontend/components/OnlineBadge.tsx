"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OnlineBadge() {
  const { isOnline, mounted } = useOnlineStatus();

  if (!mounted) return null;

  if (isOnline) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400"
        title="Connecté à internet"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        En ligne
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400"
      title="Hors ligne — Bible accessible, Apollos indisponible"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      Hors ligne
    </span>
  );
}
