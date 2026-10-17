// ============================================================
// LILOBA — Branding centralisé
// ============================================================
// Modifier ici pour rebrander TOUTE l'application.
// ============================================================

export const BRANDING = {
  // ---------- Application ----------
  app: {
    name: "LILOBA",
    tagline: "La Parole, éclairée",
    description:
      "Comprendre la Bible, simplement. Lecture, recherche et assistant IA.",
    url: "https://liloba.app",
  },

  // ---------- Assistant IA ----------
  assistant: {
    name: "Apollos",
    role: "assistant biblique",
    greeting:
      "Bonjour ! Je suis Apollos, ton assistant biblique. Pose-moi une question sur la Bible, un verset, un personnage ou un thème — je te réponds avec les passages correspondants.",
    avatar: "📖",
  },

  // ---------- Suggestions de démarrage ----------
  suggestions: [
    "Qui est Jésus ?",
    "Qu'est-ce que le pardon ?",
    "Explique-moi Jean 3:16",
    "Qui était Abraham ?",
    "Que dit la Bible sur l'amour ?",
  ],

  // ---------- Palette de couleurs ----------
  colors: {
    // Couleurs principales
    primary: "#B91C1C", // rouge profond (accent principal)
    accent: "#B91C1C", // rouge profond (utilisé pour les bulles user)
    gold: "#D4AF37", // or chaud
    cream: "#F5EFE4", // beige crème
    cyan: "#D4AF37", // or (alias pour compatibilité)

    // Neutres
    background: "#F5EFE4", // beige crème (mode clair)
    backgroundDark: "#000000", // noir absolu (mode sombre)
    text: "#1A1A1A", // noir doux
    textDark: "#F0E5D0", // beige clair (mode sombre)
    muted: "#7A6E5D", // brun gris
  },
} as const;

// Type exporté pour l'autocomplétion
export type Branding = typeof BRANDING;
