import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { BetaBanner } from "@/components/ui/BetaBanner";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import VoiceDebugOverlay from "@/components/debug/VoiceDebugOverlay";
import "./globals.css";
import "./globals-mobile.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soullab - Maya Oracle",
  description: "Sacred consciousness technology - Maya AI Oracle & Interactive Holoflower",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soullab"
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon-32x32.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4B896" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <PWAProvider>
          <AuthProvider>
            <BetaBanner />
            {children}
            <PWAInstallPrompt />
            <FeedbackWidget />
            <VoiceDebugOverlay />
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
