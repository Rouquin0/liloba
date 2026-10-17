"use client";

// ============================================================
// LILOBA — Verse Card Generator
// ============================================================

export type CardTemplate = "beige" | "night" | "gold" | "minimal";
export type CardFormat = "square" | "portrait" | "landscape";

export interface TemplateConfig {
  value: CardTemplate;
  label: string;
  description: string;
  // Style du fond
  background: string;      // CSS background (gradient ou couleur)
  textColor: string;       // Couleur du texte du verset
  refColor: string;        // Couleur de la référence
  accentColor: string;     // Couleur d'accent (logo, ligne)
  fontFamily: string;      // Police du verset
  pattern?: string;        // SVG pattern éventuel
}

export const TEMPLATES: TemplateConfig[] = [
  {
    value: "beige",
    label: "Beige",
    description: "Chaleureux",
    background:
      "linear-gradient(135deg, #f5efe4 0%, #ede4d3 100%)",
    textColor: "#1a1a1a",
    refColor: "#78350f",
    accentColor: "#78350f",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "night",
    label: "Nuit",
    description: "Élégant",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    textColor: "#f0e5d0",
    refColor: "#d4af37",
    accentColor: "#d4af37",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "gold",
    label: "Doré",
    description: "Manuscrit",
    background:
      "linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)",
    textColor: "#451a03",
    refColor: "#78350f",
    accentColor: "#78350f",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Épuré",
    background: "#ffffff",
    textColor: "#1a1a1a",
    refColor: "#78350f",
    accentColor: "#78350f",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
];

export const FORMATS: {
  value: CardFormat;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectLabel: string;
}[] = [
  {
    value: "square",
    label: "Carré",
    description: "Instagram, Facebook",
    width: 1080,
    height: 1080,
    aspectLabel: "1:1",
  },
  {
    value: "portrait",
    label: "Portrait",
    description: "Stories, WhatsApp",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16",
  },
  {
    value: "landscape",
    label: "Paysage",
    description: "Twitter, bannière",
    width: 1920,
    height: 1080,
    aspectLabel: "16:9",
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getTemplate(value: CardTemplate): TemplateConfig {
  return TEMPLATES.find((t) => t.value === value) ?? TEMPLATES[0];
}

export function getFormat(value: CardFormat) {
  return FORMATS.find((f) => f.value === value) ?? FORMATS[0];
}

// ============================================================
// GÉNÉRATION & TÉLÉCHARGEMENT
// ============================================================

/**
 * Convertit un élément DOM en PNG et retourne un Blob.
 */
export async function elementToBlob(
  element: HTMLElement
): Promise<Blob | null> {
  try {
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(element, {
      quality: 0.95,
      pixelRatio: 2, // double la résolution pour un rendu net
      cacheBust: true,
    });
    return blob;
  } catch (err) {
    console.error("Erreur lors de la génération de l'image :", err);
    return null;
  }
}

/**
 * Télécharge un Blob en tant qu'image PNG.
 */
export function downloadBlob(
  blob: Blob,
  filename: string
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Vérifie si la Web Share API est dispo (mobile).
 */
export function canShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
}

/**
 * Partage un Blob via Web Share API.
 */
export async function shareBlob(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> {
  try {
    const file = new File([blob], filename, { type: "image/png" });

    if (
      typeof navigator.canShare === "function" &&
      !navigator.canShare({ files: [file] })
    ) {
      return false;
    }

    await navigator.share({
      files: [file],
      title,
      text,
    });
    return true;
  } catch (err) {
    // L'utilisateur a annulé → pas grave
    if (err instanceof Error && err.name === "AbortError") return false;
    console.error("Erreur de partage :", err);
    return false;
  }
}

/**
 * Génère un nom de fichier propre.
 * Exemple : "Jean 3:16" → "liloba-jean-3-16.png"
 */
export function makeFilename(reference: string): string {
  const slug = reference
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `liloba-${slug}.png`;
}
