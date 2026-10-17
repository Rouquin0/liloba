"use client";

// ============================================================
// LILOBA — Détection de la plateforme
// ============================================================

export type Platform = "ios" | "android" | "desktop";

export function detectPlatform(): Platform {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  // iOS (iPhone, iPad, iPod)
  // Inclut iPad récents qui se font passer pour Mac
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) return "ios";

  // Android
  const isAndroid = /Android/i.test(ua);
  if (isAndroid) return "android";

  return "desktop";
}

export function isIOS(): boolean {
  return detectPlatform() === "ios";
}

export function isAndroid(): boolean {
  return detectPlatform() === "android";
}

export function isDesktop(): boolean {
  return detectPlatform() === "desktop";
}
