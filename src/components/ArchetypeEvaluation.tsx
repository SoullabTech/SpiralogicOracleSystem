import React from 'react';
import { Sparkles, Brain, Compass, Heart, Star, Lightbulb } from 'lucide-react';

interface Archetype {
  name: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

export const ArchetypeEvaluation: React.FC = () => {
  const archetypes: Archetype[] = [
    {
      name: 'The Creator',
      score: 75,
      icon: <Sparkles className="text-yellow-500" size={20} />,
      description: 'Innovative and expressive, bringing new ideas to life'
    },
    {
      name: 'The Sage',
      score: 50,
      icon: <Brain className="text-blue-500" size={20} />,
      description: 'Seeks wisdom and understanding through knowledge'
    },
    {
      name: 'The Explorer',
      score: 65,
      icon: <Compass className="text-green-500" size={20} />,
      description: 'Adventurous spirit seeking new experiences'
    },
    {
      name: 'The Nurturer',
      score: 40,
      icon: <Heart className="text-red-500" size={20} />,
      description: 'Compassionate and caring, supporting others\' growth'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Star className="text-purple-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Archetype Evaluation</h2>
          <p className="text-sm text-gray-500">Analysis of dominant personality patterns</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archetypes.map((archetype, index) => (
          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              {archetype.icon}
              <h3 className="font-medium">{archetype.name}</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Alignment</span>
                <span className="font-medium">{archetype.score}%</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${archetype.score}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {archetype.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-purple-50 rounded-lg flex items-center gap-3">
        <Lightbulb className="text-purple-600" size={20} />
        <p className="text-sm text-purple-900">
          Your dominant archetype is The Creator, suggesting a strong inclination towards innovation and self-expression.
        </p>
      </div>
    </div>
  );
};