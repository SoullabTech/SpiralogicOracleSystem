import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import { supabase } from '../../lib/supabaseClient'; // ✅ Add this import!
import PortalAnimation from './PortalAnimation';
import WildPetalButton from './WildPetalButton';

// 🌀 Elemental Wild Petal Messages
const wildPetalMessages: { [key: string]: string[] } = {
  Fire: [
    "🔥 Leap before you're ready.",
    '🔥 Ignite something bold today.',
    '🔥 Let passion pull you forward.',
  ],
  Water: [
    '🌊 Flow where resistance disappears.',
    '🌊 Feel beyond the surface.',
    '🌊 Trust your inner tides.',
  ],
  Earth: [
    '🌎 Root deeper into your body.',
    '🌎 Walk slowly and listen to the stones.',
    '🌎 Build the next layer with care.',
  ],
  Air: [
    '🌬️ Speak a truth you’ve hidden.',
    '🌬️ Let the unseen carry your prayers.',
    '🌬️ Dance lightly through uncertainty.',
  ],
  Aether: [
    '🌀 Breathe the infinite spiral within you.',
    '🌀 Listen for dreams singing through the stars.',
    '🌀 You are the mystery unfolding.',
  ],
};

// 🌀 Separate Component: Wild Petal Message
function WildPetalMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="text-center text-xl text-indigo-700 bg-white bg-opacity-80 rounded-xl shadow-lg p-6 mt-8"
    >
      {message}
    </motion.div>
  );
}

// 🌀 Main Portal Page
export default function WildPortalPage() {
  const [message, setMessage] = useState('');
  const playPortalOpen = useSoundEffect('/sounds/portal-open.mp3');

  const summonWildPetal = async () => {
    playPortalOpen();

    const elements = Object.keys(wildPetalMessages);
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    const messages = wildPetalMessages[randomElement];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    setMessage(randomMessage);

    // 🌀 Save the Wild Petal blessing into Supabase
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data: existing, error: fetchError } = await supabase
      .from('spiral_breaths')
      .select('*')
      .like('date', `${today}%`);

    if (fetchError) {
      console.error("Error checking today's Spiral Breath:", fetchError.message);
      return;
    }

    if (existing.length > 0) {
      // 🌸 Update today's Breath
      const breath = existing[0];
      const updatedWildPetals = [...(breath.wild_petals || []), randomMessage];

      const { error: updateError } = await supabase
        .from('spiral_breaths')
        .update({ wild_petals: updatedWildPetals })
        .eq('id', breath.id);

      if (updateError) {
        console.error('Error updating Wild Petals:', updateError.message);
      } else {
        console.log('🌸 Wild Petal blessing saved!');
      }
    } else {
      // 🌀 No Breath exists yet today ➔ Create one
      const { error: insertError } = await supabase.from('spiral_breaths').insert([
        {
          date: new Date().toISOString(),
          elements: {},
          lightness: 'Emerging',
          wild_petals: [randomMessage],
        },
      ]);

      if (insertError) {
        console.error('Error creating new Spiral Breath:', insertError.message);
      } else {
        console.log('🌟 New Spiral Breath created and Wild Petal saved!');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-indigo-700">Wild Petal Portal 🌀🌸</h1>
        <PortalAnimation />
        <WildPetalButton onClick={summonWildPetal} />
        {message && <WildPetalMessage message={message} />}
      </div>
    </div>
  );
}
