"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OnlineBadge() {
  const isOnline = useOnlineStatus();

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
        isOnline ? "bg-green-500 animate-blink-green" : "bg-red-500 animate-blink-red"
      }`}
      title={isOnline ? "En ligne" : "Hors ligne"}
      aria-label={isOnline ? "En ligne" : "Hors ligne"}
    />
  );
}
