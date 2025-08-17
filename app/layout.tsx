// Root layout with Apple-minimal theming and voice-first architecture
// Provides elemental accent theming and Mic HUD container
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "../components/nav/BottomNav";
import { MicHUD } from "../components/voice/MicHUD";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spiralogic Oracle System",
  description: "Voice-first elemental wisdom and integration support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-app-bg text-app-text antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Main content area */}
          <main className="flex-1 pb-20 pt-safe-top">
            {children}
          </main>
          
          {/* Bottom navigation */}
          <BottomNav />
          
          {/* Floating mic HUD container */}
          <div id="mic-hud-container" className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
            <MicHUD />
          </div>
        </div>
      </body>
    </html>
  );
}
