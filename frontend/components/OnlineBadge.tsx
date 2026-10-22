"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OnlineBadge() {
  const isOnline = useOnlineStatus();

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        isOnline ? "bg-green-500" : "bg-red-500"
      }`}
      title={isOnline ? "En ligne" : "Hors ligne"}
      aria-label={isOnline ? "En ligne" : "Hors ligne"}
    />
  );
}
