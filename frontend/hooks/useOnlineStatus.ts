"use client";

import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Fonction pour mettre à jour l'état
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Vérifier l'état initial au chargement
    updateStatus();

    // Écouter les événements de connexion/déconnexion du navigateur
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return isOnline;
}
