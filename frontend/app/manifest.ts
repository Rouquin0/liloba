import type { MetadataRoute } from "next";
import { BRANDING } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRANDING.app.name} — ${BRANDING.app.tagline}`,
    short_name: BRANDING.app.name,
    description: BRANDING.app.description,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5EFE4",
    theme_color: BRANDING.colors.primary,
    lang: "fr",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["books", "education", "lifestyle"],
  };
}
