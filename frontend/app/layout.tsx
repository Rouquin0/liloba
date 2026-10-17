import type { Metadata, Viewport } from "next";
import { BRANDING } from "@/lib/branding";
import { EB_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
    statusBarStyle: "default",
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
        </ThemeProvider>
      </body>
                
    </html>
  );
}
