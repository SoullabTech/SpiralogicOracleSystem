'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import SacredFooter from './SacredFooter';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <PageTransition>
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight font-soullab text-white overflow-hidden">
        {/* Orbital glow effects */}
        <div className="absolute w-[500px] h-[500px] bg-soullab-aether opacity-20 rounded-full -top-24 -left-24 animate-orbit blur-3xl pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] bg-soullab-gold opacity-10 rounded-full -bottom-20 -right-20 animate-breathe blur-2xl pointer-events-none" />

        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-grow container mx-auto px-6 py-10 glass shadow-ether rounded-2xl backdrop-blur-md z-10 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <SacredFooter />
      </div>
    </PageTransition>
  );
};

export default Layout;
