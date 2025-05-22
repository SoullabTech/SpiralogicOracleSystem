// 📁 File: src/components/layouts/AppLayout.tsx

import FaviconSetter from "@/components/FaviconSetter";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import { PageTransition } from "@/components/PageTransition";
import { SacredFooter } from "@/components/SacredFooter";
import { SpiralParticles } from "@/components/SpiralParticles";
import ThemeInjector from "@/components/ThemeInjector";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 relative">
      <FaviconSetter />
      <ThemeInjector />
      <SpiralParticles />
      <Header />
      <NavBar />
      <PageTransition>
        <main className="py-8 px-4 max-w-6xl mx-auto">{children}</main>
      </PageTransition>
      <SacredFooter />
    </div>
  );
}
