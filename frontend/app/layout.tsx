import type { Metadata, Viewport } from "next";
import { BRANDING } from "@/lib/branding";
import { EB_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ProfileSync from "@/components/profile/ProfileSync";
import "./globals.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

// Splash screens iOS générés sur fond #0a0a0f (voir scripts/generate-splash.py).
// iOS ignore le manifest pour le splash : sans ces liens, écran blanc au retour
// après purge du cache (~24h d'inactivité). Avec : écran sombre brandé LILOBA.
const IOS_SPLASH: { url: string; media: string }[] = [
  { url: "/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/splash/splash-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/splash/splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/splash/splash-1668x2420.png", media: "(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
];

export const metadata: Metadata = {
  title: {
    default: `${BRANDING.app.name} — ${BRANDING.app.tagline}`,
    template: `%s | ${BRANDING.app.name}`,
  },
  description: BRANDING.app.description,
  applicationName: BRANDING.app.name,
  appleWebApp: {
    capable: true,
    title: BRANDING.app.name,
    // "black-translucent" = barre de statut sombre, assortie au splash #0a0a0f.
    // Avant : "default" → flash blanc sur iPhone au lancement.
    statusBarStyle: "black-translucent",
    startupImage: IOS_SPLASH,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  // Filet pour vieux iOS qui ne lit pas appleWebApp.capable via Next :
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": BRANDING.app.name,
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: BRANDING.colors.primary,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${serif.variable} antialiased`}>
                <ThemeProvider>
          <AppShell>{children}</AppShell>
          <ServiceWorkerRegister />
          <ProfileSync />
        </ThemeProvider>
      </body>

    </html>
  );
}
