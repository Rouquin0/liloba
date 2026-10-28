"use client";

import { useEffect, useState } from "react";

export default function AndroidInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Détecter si on est sur Android
    const userAgent = navigator.userAgent.toLowerCase();
    const android = /android/.test(userAgent);
    setIsAndroid(android);

    // 2. Vérifier si l'app est déjà installée (mode standalone)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Écouter l'événement beforeinstallprompt (déclenché par Chrome sur Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Écouter l'événement appinstalled (déclenché après installation)
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Déclenche l'invite native de Chrome
    deferredPrompt.prompt();

    // Attend la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Installation acceptée");
    } else {
      console.log("Installation refusée");
    }

    // L'invite ne peut être utilisée qu'une seule fois
    setDeferredPrompt(null);
  };

  // On n'affiche rien si :
  // - on n'est pas sur Android
  // - l'app est déjà installée
  // - l'invite n'est pas encore disponible (Chrome ne l'a pas encore déclenchée)
  if (!isAndroid || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-90 active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
      Installer LILOBA
    </button>
  );
}
