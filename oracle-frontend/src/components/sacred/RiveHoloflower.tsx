'use client';

import React, { useEffect } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

type PetalKeys =
  | 'consciousness'
  | 'community'
  | 'connection'
  | 'medicine'
  | 'means'
  | 'mission'
  | 'holiness'
  | 'healing'
  | 'heart'
  | 'expansion'
  | 'expression'
  | 'experience'
  | string;

interface RiveHoloflowerProps {
  petals: Partial<Record<PetalKeys, number>>;
  debug?: boolean;
}

export const RiveHoloflower: React.FC<RiveHoloflowerProps> = ({ petals, debug }) => {
  const STATE_MACHINE = 'Oracle Reading';

  const { rive, RiveComponent } = useRive({
    src: '/holoflower.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const inputs = {
    consciousness: useStateMachineInput(rive, STATE_MACHINE, 'consciousness_distance'),
    community: useStateMachineInput(rive, STATE_MACHINE, 'community_distance'),
    connection: useStateMachineInput(rive, STATE_MACHINE, 'connection_distance'),
    medicine: useStateMachineInput(rive, STATE_MACHINE, 'medicine_distance'),
    means: useStateMachineInput(rive, STATE_MACHINE, 'means_distance'),
    mission: useStateMachineInput(rive, STATE_MACHINE, 'mission_distance'),
    holiness: useStateMachineInput(rive, STATE_MACHINE, 'holiness_distance'),
    healing: useStateMachineInput(rive, STATE_MACHINE, 'healing_distance'),
    heart: useStateMachineInput(rive, STATE_MACHINE, 'heart_distance'),
    expansion: useStateMachineInput(rive, STATE_MACHINE, 'expansion_distance'),
    expression: useStateMachineInput(rive, STATE_MACHINE, 'expression_distance'),
    experience: useStateMachineInput(rive, STATE_MACHINE, 'experience_distance'),
  };

  useEffect(() => {
    if (!rive) return;
    Object.entries(petals).forEach(([key, value]) => {
      const input = inputs[key as keyof typeof inputs];
      if (input && typeof value === 'number') {
        input.value = value;
      }
    });
  }, [petals, rive]);

  return (
    <div className="relative w-full h-full">
      <RiveComponent className="w-full h-full" />
      {debug && (
        <div className="absolute top-2 right-2 text-xs bg-white/80 p-2 rounded shadow">
          {Object.entries(petals).map(([key, val]) => (
            <div key={key}>
              {key}: {val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
