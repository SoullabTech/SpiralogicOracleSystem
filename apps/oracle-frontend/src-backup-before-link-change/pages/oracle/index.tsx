// 📁 Frontend: File - src/pages/oracle/index.tsx

import Header from '@/components/Header';
import OracleChat from '@/components/OracleChat';
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { SpiralParticles } from '@/components/SpiralParticles';

export default function OraclePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-yellow-50 flex flex-col">
      <SpiralParticles />
      <Header />
      <PageTransition>
        <main className="flex-grow py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto w-full">
            <OracleChat />
          </div>
        </main>
      </PageTransition>
      <SacredFooter />
    </div>
  );
}
