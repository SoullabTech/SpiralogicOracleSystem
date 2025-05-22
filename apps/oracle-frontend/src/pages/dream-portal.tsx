import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { SpiralParticles } from '@/components/SpiralParticles';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { BookOpen, LucideBrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DreamPortalPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100">
      <SpiralParticles />

      <PageTransition>
        <main className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="bg-white bg-opacity-80 rounded-3xl shadow-2xl p-10 max-w-2xl w-full"
          >
            <h1 className="text-4xl font-bold text-purple-700 mb-4">🌙 Welcome to the Dream Portal</h1>
            <p className="text-gray-700 mb-6">
              Your dreams are messages from the deeper self. Here you can explore, record, and reflect on the
              symbols of the night. What wants to be remembered?
            </p>

            <div className="flex flex-col gap-4 mt-8">
              <Button
                onClick={() => navigate('/dream-journal')}
                className="w-full text-lg flex items-center justify-center gap-2"
              >
                <BookOpen size={18} /> Open Dream Journal
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/dream-symbols')}
                className="w-full text-lg flex items-center justify-center gap-2"
              >
                <LucideBrainCircuit size={18} /> Explore Dream Symbols
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/oracle/dream')}
                className="w-full text-sm text-purple-700 hover:underline mt-2"
              >
                🌌 Meet Your Dream Agent
              </Button>
            </div>
          </motion.div>
        </main>
      </PageTransition>

      <SacredFooter />
    </div>
  );
}
