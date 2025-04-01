import React, { useState, useEffect } from 'react';
import { ReflectionInterface } from './ReflectionInterface';
import { ArchetypeDisplay } from './ArchetypeDisplay';
import { useSpiralContext, getArchetype } from '../lib/spiral-context';
import { oracleService } from '../lib/oracle-service';

export const SpiralMirror: React.FC = () => {
  const { context, history, addInteraction } = useSpiralContext();
  const [isLoading, setIsLoading] = useState(false);
  const [currentArchetype, setCurrentArchetype] = useState<any>(null);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    const initOracle = async () => {
      await oracleService.initialize();
      const location = await oracleService.getUserLocation();
      setUserLocation(location);
    };

    initOracle();
  }, []);

  const handleReflection = async (reflection: string) => {
    setIsLoading(true);
    
    try {
      const archetype = getArchetype(reflection);
      
      // Get enhanced response from multiple AI sources
      const response = await oracleService.getOracleResponse(reflection, archetype, context);
      
      setCurrentArchetype(archetype);
      setCurrentResponse(response);
      
      addInteraction(reflection, response, archetype.name);
    } catch (error) {
      console.error('Error processing reflection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {userLocation && (
        <div className="text-center text-sm text-gray-500 mb-4">
          Connecting from {userLocation}
        </div>
      )}
      
      <ReflectionInterface
        onSubmit={handleReflection}
        isLoading={isLoading}
      />
      
      {currentArchetype && (
        <div className="mt-8">
          <ArchetypeDisplay
            archetype={currentArchetype}
            response={currentResponse}
          />
        </div>
      )}
    </div>
  );
};