// src/components/SpiralMemory/SpiralCalendar.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SpiralCalendar({ breaths }: { breaths: any[] }) {
  const [selectedBreath, setSelectedBreath] = useState<any>(null);
  const [selectedDream, setSelectedDream] = useState<any>(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const daysArray = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const breathForDay = breaths.find((b) => new Date(b.date).getDate() === i);
    daysArray.push({ day: i, breath: breathForDay });
  }

  const lightnessColor = {
    Dense: 'bg-gray-400',
    Emerging: 'bg-blue-300',
    Awakening: 'bg-pink-300',
    Radiant: 'bg-yellow-300',
  };

  const elementIcons = {
    Fire: '🔥',
    Water: '🌊',
    Earth: '🌎',
    Air: '🌬️',
    Aether: '🌀',
  };

  const drawDreamPetal = async () => {
    const dreamPetals = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];
    const randomPetal = dreamPetals[Math.floor(Math.random() * dreamPetals.length)];

    setSelectedDream((prev: any) => ({
      ...prev,
      dreamPetal: randomPetal,
    }));

    if (selectedDream?.id) {
      const { error } = await supabase
        .from('spiral_breaths')
        .update({ dream_petal: randomPetal })
        .eq('id', selectedDream.id);

      if (error) {
        console.error('Error saving Dream Petal to Supabase:', error.message);
      } else {
        console.log('🌸 Dream Petal saved successfully!');
      }
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((dayData, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (dayData?.breath?.dream) {
                setSelectedDream(dayData.breath);
              } else if (dayData?.breath) {
                setSelectedBreath(dayData.breath);
              }
            }}
            className={`h-24 w-24 flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer ${
              dayData?.breath
                ? `${lightnessColor[dayData.breath.lightness] || 'bg-white'} animate-pulse`
                : 'bg-gray-100'
            }`}
          >
            {dayData && (
              <>
                <p className="font-bold">{dayData.day}</p>
                {dayData.breath && (
                  <>
                    <p>{dayData.breath.lightness}</p>
                    <div className="flex flex-wrap justify-center">
                      {dayData.breath.elements &&
                        Object.keys(dayData.breath.elements).map((element) => (
                          <span key={element} className="mr-1">
                            {elementIcons[element] || ''}
                          </span>
                        ))}
                    </div>
                    {dayData.breath.wild_petals?.length > 0 && (
                      <div className="mt-1 text-lg animate-bounce">🌸</div>
                    )}
                    {dayData.breath.dream && <div className="mt-1 text-lg">💭</div>}
                  </>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* 🌸 Breath Detail Modal */}
      <AnimatePresence>
        {selectedBreath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setSelectedBreath(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 shadow-2xl text-center w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">🌸 Spiral Breath Detail</h2>
              <p className="mb-2">
                Lightness: <strong>{selectedBreath.lightness}</strong>
              </p>
              <div className="flex justify-center flex-wrap">
                {selectedBreath.elements &&
                  Object.keys(selectedBreath.elements).map((element) => (
                    <span key={element} className="text-lg mx-1">
                      {elementIcons[element]}
                    </span>
                  ))}
              </div>
              {selectedBreath.wild_petals?.length > 0 && (
                <div className="mt-4">
                  <p className="font-bold text-purple-600">Wild Petals:</p>
                  {selectedBreath.wild_petals.map((petal: string, idx: number) => (
                    <p key={idx} className="text-sm italic text-gray-600">
                      "{petal}"
                    </p>
                  ))}
                </div>
              )}
              <button
                className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                onClick={() => setSelectedBreath(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌙 Dream Spiral Modal */}
      <AnimatePresence>
        {selectedDream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setSelectedDream(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 shadow-2xl text-center w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-700">
                🌙 Dream Spiral Reflection
              </h2>
              <p className="mb-4 italic text-gray-700">"{selectedDream.dream}"</p>
              {selectedDream.dreamPetal && (
                <div className="text-2xl mb-4">
                  🌀 Dream Petal: <span className="font-bold">{selectedDream.dreamPetal}</span>
                </div>
              )}
              {!selectedDream.dreamPetal && (
                <button
                  onClick={drawDreamPetal}
                  className="mt-4 px-6 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition"
                >
                  🌸 Draw Dream Petal
                </button>
              )}
              <button
                className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                onClick={() => setSelectedDream(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
