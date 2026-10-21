"use client";

import { useEffect, useState } from "react";

// Liste de versets (tu peux en ajouter d'autres)
const VERSETS = [
  { ref: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique..." },
  { ref: "Psaumes 23:1", text: "L'Éternel est mon berger : je ne manquerai de rien." },
  { ref: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  { ref: "Proverbes 3:5", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse." },
  { ref: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu." },
  { ref: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu." },
  { ref: "Matthieu 11:28", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos." },
];

export default function BibleScreensaver() {
  const [isVisible, setIsVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // On ne l'active que sur desktop (écran > 768px)
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (isVisible) return; // Ne reset pas si déjà visible
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(true);
      }, 120000); // 2 minutes d'inactivité
    };

    const hideScreensaver = () => {
      if (isVisible) {
        setIsVisible(false);
        resetTimer();
      }
    };

    // Écoute les mouvements de souris et clavier
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", hideScreensaver);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", hideScreensaver);
    };
  }, [isVisible]);

  // Changement de verset toutes les 60 secondes
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % VERSETS.length);
    }, 60000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const current = VERSETS[index];

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--background)] p-12 text-center cursor-pointer"
      onClick={() => setIsVisible(false)}
    >
      <div className="max-w-4xl">
        <p
          className="text-4xl font-bold leading-relaxed text-[var(--color-primary)] md:text-6xl md:leading-snug"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          « {current.text} »
        </p>
        <p className="mt-8 text-xl font-bold tracking-widest text-[var(--muted)] uppercase md:text-2xl">
          {current.ref}
        </p>
      </div>
      <p className="absolute bottom-8 text-xs text-[var(--muted)] opacity-50">
        Cliquez ou bougez la souris pour continuer
      </p>
    </div>
  );
}
