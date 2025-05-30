'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

interface ElementalAssessmentProps {
  sacredName?: string;
  onComplete: (data: any) => void;
}

interface ElementalQuestion {
  id: string;
  question: string;
  answers: {
    text: string;
    element: ElementType;
    weight: number;
  }[];
}

type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

const elementalQuestions: ElementalQuestion[] = [
  {
    id: 'calling',
    question: 'What calls to you most deeply right now?',
    answers: [
      { text: 'Transformation and breaking through old patterns', element: 'fire', weight: 1 },
      { text: 'Flowing with emotions and finding deeper feeling', element: 'water', weight: 1 },
      { text: 'Creating stability and manifesting in the physical', element: 'earth', weight: 1 },
      { text: 'Gaining clarity and new perspectives', element: 'air', weight: 1 },
      { text: 'Connecting with the mystery and unity of all', element: 'aether', weight: 1 }
    ]
  },
  {
    id: 'challenge',
    question: 'What feels most challenging for you?',
    answers: [
      { text: 'Cooling down my intensity and finding patience', element: 'fire', weight: 0.8 },
      { text: 'Setting boundaries and not getting overwhelmed', element: 'water', weight: 0.8 },
      { text: 'Embracing change and letting go of control', element: 'earth', weight: 0.8 },
      { text: 'Staying grounded and following through', element: 'air', weight: 0.8 },
      { text: 'Being present in everyday life', element: 'aether', weight: 0.8 }
    ]
  },
  {
    id: 'energy',
    question: 'How does your energy typically express itself?',
    answers: [
      { text: 'Passionate, intense, quick to ignite and act', element: 'fire', weight: 0.9 },
      { text: 'Deep, emotional, intuitive and receptive', element: 'water', weight: 0.9 },
      { text: 'Steady, practical, patient and enduring', element: 'earth', weight: 0.9 },
      { text: 'Quick, mental, curious and communicative', element: 'air', weight: 0.9 },
      { text: 'Expansive, mystical, connected to everything', element: 'aether', weight: 0.9 }
    ]
  },
  {
    id: 'healing',
    question: 'What brings you the deepest healing?',
    answers: [
      { text: 'Taking bold action and expressing myself fully', element: 'fire', weight: 0.7 },
      { text: 'Crying, feeling deeply, being held in compassion', element: 'water', weight: 0.7 },
      { text: 'Nature, physical touch, creating with my hands', element: 'earth', weight: 0.7 },
      { text: 'Fresh perspectives, learning, meaningful conversations', element: 'air', weight: 0.7 },
      { text: 'Meditation, prayer, experiencing oneness', element: 'aether', weight: 0.7 }
    ]
  },
  {
    id: 'shadow',
    question: 'What shadow pattern do you most need to integrate?',
    answers: [
      { text: 'Destructive anger or burning myself/others out', element: 'fire', weight: 0.6 },
      { text: 'Drowning in emotions or manipulating through feelings', element: 'water', weight: 0.6 },
      { text: 'Stubbornness, materialism, or stagnation', element: 'earth', weight: 0.6 },
      { text: 'Overthinking, anxiety, or being ungrounded', element: 'air', weight: 0.6 },
      { text: 'Spiritual bypassing or disconnection from life', element: 'aether', weight: 0.6 }
    ]
  }
];

export const ElementalAssessment: React.FC<ElementalAssessmentProps> = ({
  sacredName,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { element: ElementType; weight: number }>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (element: ElementType, weight: number) => {
    const question = elementalQuestions[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [question.id]: { element, weight }
    }));

    if (currentQuestion < elementalQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 500);
    } else {
      // Calculate results
      setTimeout(() => {
        calculateResults();
      }, 500);
    }
  };

  const calculateResults = () => {
    // Calculate elemental scores
    const scores: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    Object.values(answers).forEach(answer => {
      scores[answer.element] += answer.weight;
    });

    // Normalize scores
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const normalizedScores: Record<ElementType, number> = {} as any;
    
    Object.entries(scores).forEach(([element, score]) => {
      normalizedScores[element as ElementType] = score / totalScore;
    });

    // Find primary and secondary elements
    const sortedElements = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a);
    
    const primaryElement = sortedElements[0][0] as ElementType;
    const secondaryElement = sortedElements[1][0] as ElementType;

    setShowResults(true);

    // Delay before completing
    setTimeout(() => {
      onComplete({
        primaryElement,
        secondaryElement,
        elementalBalance: normalizedScores,
        answers
      });
    }, 5000);
  };

  const getElementIcon = (element: ElementType) => {
    switch (element) {
      case 'fire': return <Flame className="w-8 h-8" />;
      case 'water': return <Droplets className="w-8 h-8" />;
      case 'earth': return <Mountain className="w-8 h-8" />;
      case 'air': return <Wind className="w-8 h-8" />;
      case 'aether': return <Sparkles className="w-8 h-8" />;
    }
  };

  const getElementColor = (element: ElementType) => {
    switch (element) {
      case 'fire': return 'text-red-500';
      case 'water': return 'text-blue-500';
      case 'earth': return 'text-green-600';
      case 'air': return 'text-gray-400';
      case 'aether': return 'text-purple-400';
    }
  };

  if (showResults) {
    const scores: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    Object.values(answers).forEach(answer => {
      scores[answer.element] += answer.weight;
    });

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const sortedElements = Object.entries(scores)
      .map(([element, score]) => ({
        element: element as ElementType,
        percentage: Math.round((score / totalScore) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-8">
            Your Elemental Resonance
          </h2>
          
          <div className="space-y-6 mb-12">
            {sortedElements.map((result, index) => (
              <motion.div
                key={result.element}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={getElementColor(result.element)}>
                      {getElementIcon(result.element)}
                    </div>
                    <span className="text-xl font-semibold text-white capitalize">
                      {result.element}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {result.percentage}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      result.element === 'fire' ? 'from-red-500 to-orange-500' :
                      result.element === 'water' ? 'from-blue-500 to-cyan-500' :
                      result.element === 'earth' ? 'from-green-600 to-emerald-600' :
                      result.element === 'air' ? 'from-gray-400 to-gray-300' :
                      'from-purple-500 to-pink-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xl text-soullab-gray-300"
          >
            {sacredName}, your primary element is <span className={`font-bold ${getElementColor(sortedElements[0].element)}`}>
              {sortedElements[0].element}
            </span> with <span className={`font-bold ${getElementColor(sortedElements[1].element)}`}>
              {sortedElements[1].element}
            </span> as your supporting force.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const question = elementalQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / elementalQuestions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="max-w-2xl w-full"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-soullab-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {elementalQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-soullab-purple-500 to-soullab-indigo-500 rounded-full"
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          {question.question}
        </h2>

        {/* Answers */}
        <div className="space-y-4">
          {question.answers.map((answer, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAnswer(answer.element, answer.weight)}
              className="w-full p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/20 hover:border-soullab-purple-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className={`${getElementColor(answer.element)} opacity-50 group-hover:opacity-100 transition-opacity`}>
                  {getElementIcon(answer.element)}
                </div>
                <span className="text-lg text-white">
                  {answer.text}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};