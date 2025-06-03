'use client';

import React from 'react';
import { RiveHoloflower } from '@/components/sacred/RiveHoloflower';

export default function HoloflowerTestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">🌸 Holoflower Live Test</h1>
      
      <div className="h-[600px] border border-soullab-gray/20 rounded-xl relative bg-gray-50">
        <RiveHoloflower
          petals={{
            consciousness: 60,
            heart: 30,
            community: -20,
            healing: 50,
          }}
          debug
        />
      </div>
    </div>
  );
}
