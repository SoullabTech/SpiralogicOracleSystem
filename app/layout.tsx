import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { BetaBanner } from "@/components/ui/BetaBanner";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import VoiceDebugOverlay from "@/components/debug/VoiceDebugOverlay";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spiralogic Oracle",
  description: "Sacred technology for inner transformation - Interactive Holoflower experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oracle"
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D4B896"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <AuthProvider>
          <BetaBanner />
          {children}
          <FeedbackWidget />
          <VoiceDebugOverlay />
        </AuthProvider>
      </body>
    </html>
  );
}
