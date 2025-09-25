'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Save, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ReflectionPrompt {
  week: number;
  title: string;
  goal: string;
  prompts: {
    question: string;
    principle: string;
    tag: string;
  }[];
}

const WEEKLY_PROMPTS: ReflectionPrompt[] = [
  {
    week: 1,
    title: 'First Contact',
    goal: 'Orientation + first impressions',
    prompts: [
      {
        question: 'What was it like meeting Maya for the first time?',
        principle: 'Authentic Engagement',
        tag: 'authentic_engagement'
      },
      {
        question: 'Did anything surprise you about how she responded?',
        principle: 'Adaptive Communication',
        tag: 'adaptive_communication'
      },
      {
        question: 'What energy or protection pattern did you notice in yourself?',
        principle: 'Protection-as-Wisdom Framework',
        tag: 'protection_wisdom'
      }
    ]
  },
  {
    week: 2,
    title: 'Pattern Recognition',
    goal: 'Awareness of protection-as-wisdom',
    prompts: [
      {
        question: 'Which protection patterns did Maya reflect back to you this week?',
        principle: 'Protection-as-Wisdom Framework',
        tag: 'protection_wisdom'
      },
      {
        question: 'Did you notice these patterns outside of sessions?',
        principle: 'Container Awareness',
        tag: 'container_awareness'
      },
      {
        question: 'How do you feel about them when you see them as intelligent rather than obstacles?',
        principle: 'Honest Reflection',
        tag: 'honest_reflection'
      }
    ]
  },
  {
    week: 3,
    title: 'Deeper Exploration',
    goal: 'Moving beneath surface protections',
    prompts: [
      {
        question: 'Was there a moment that felt like a shift or breakthrough?',
        principle: 'Mental Health Awareness',
        tag: 'mental_health_awareness'
      },
      {
        question: 'What happened just before that moment? (thoughts, emotions, words)',
        principle: 'Critical Thinking & Truth-Telling',
        tag: 'critical_thinking'
      },
      {
        question: 'What felt supportive, and what felt too much?',
        principle: 'Adaptive Communication',
        tag: 'adaptive_communication'
      }
    ]
  },
  {
    week: 4,
    title: 'Integration',
    goal: 'Harvest + closure',
    prompts: [
      {
        question: 'Looking back, what feels different now compared to Week 1?',
        principle: 'Honest Reflection',
        tag: 'honest_reflection'
      },
      {
        question: 'Which protection patterns softened, evolved, or revealed new wisdom?',
        principle: 'Protection-as-Wisdom Framework',
        tag: 'protection_wisdom'
      },
      {
        question: 'What will you carry forward after this beta?',
        principle: 'Container Awareness',
        tag: 'container_awareness'
      }
    ]
  }
];

export default function ReflectionCapture() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedWeeks, setSavedWeeks] = useState<number[]>([]);
  const [explorerName, setExplorerName] = useState('');

  useEffect(() => {
    // Get explorer name from session
    const name = sessionStorage.getItem('explorerName') || 'Explorer';
    setExplorerName(name);

    // Calculate current week based on signup date
    const signupDate = sessionStorage.getItem('signupDate');
    if (signupDate) {
      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const week = Math.min(4, Math.floor(daysSinceSignup / 7) + 1);
      setCurrentWeek(week);
    }

    // Load saved weeks from localStorage
    const saved = JSON.parse(localStorage.getItem('savedReflections') || '[]');
    setSavedWeeks(saved);
  }, []);

  const currentPrompts = WEEKLY_PROMPTS[currentWeek - 1];

  const handleResponseChange = (promptTag: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [`week${currentWeek}_${promptTag}`]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to Supabase
      const reflectionData = currentPrompts.prompts.map(prompt => ({
        explorer_id: sessionStorage.getItem('betaUserId') || 'unknown',
        explorer_name: explorerName,
        week: currentWeek,
        question: prompt.question,
        response: responses[`week${currentWeek}_${prompt.tag}`] || '',
        principle: prompt.principle,
        principle_tag: prompt.tag,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('explorer_reflections')
        .insert(reflectionData);

      if (error) {
        console.error('Failed to save reflections:', error);
      } else {
        // Mark week as saved
        const newSavedWeeks = [...savedWeeks, currentWeek];
        setSavedWeeks(newSavedWeeks);
        localStorage.setItem('savedReflections', JSON.stringify(newSavedWeeks));

        // Clear responses for this week
        const clearedResponses = { ...responses };
        currentPrompts.prompts.forEach(prompt => {
          delete clearedResponses[`week${currentWeek}_${prompt.tag}`];
        });
        setResponses(clearedResponses);
      }
    } catch (error) {
      console.error('Error saving reflections:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = currentPrompts.prompts.some(
    prompt => responses[`week${currentWeek}_${prompt.tag}`]?.trim()
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Week {currentWeek} Reflection
              </h2>
              <p className="text-amber-100 mt-1">{currentPrompts.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-200">Explorer</p>
              <p className="font-semibold">{explorerName}</p>
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>This week's focus:</strong> {currentPrompts.goal}
          </p>
        </div>

        {/* Prompts */}
        <div className="p-6 space-y-6">
          {currentPrompts.prompts.map((prompt, index) => {
            const responseKey = `week${currentWeek}_${prompt.tag}`;
            const hasResponse = !!responses[responseKey];

            return (
              <motion.div
                key={prompt.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-start justify-between">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {prompt.question}
                    </span>
                    <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Principle: {prompt.principle}
                    </span>
                  </label>
                  {hasResponse && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-green-500"
                      title="Response provided"
                    />
                  )}
                </div>

                <textarea
                  value={responses[responseKey] || ''}
                  onChange={(e) => handleResponseChange(prompt.tag, e.target.value)}
                  placeholder="Take your time... there's no right answer"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:border-amber-500 focus:outline-none resize-none"
                  rows={3}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Privacy Note */}
        <div className="mx-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Your privacy is protected:</strong> Reflections are stored anonymously
              and never shared with other explorers. They help Maya learn patterns across
              the cohort without exposing individual content.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {savedWeeks.includes(currentWeek) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-600 dark:text-green-400"
              >
                ✓ Week {currentWeek} saved
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentWeek > 1 && (
              <button
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ← Previous Week
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                canSave && !isSaving
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Reflection'}</span>
            </button>

            {currentWeek < 4 && (
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Next Week →
              </button>
            )}
          </div>
        </div>

        {/* Week Navigation Dots */}
        <div className="px-6 pb-6 flex justify-center space-x-2">
          {[1, 2, 3, 4].map(week => (
            <button
              key={week}
              onClick={() => setCurrentWeek(week)}
              className={`w-2 h-2 rounded-full transition-colors ${
                week === currentWeek
                  ? 'bg-amber-600'
                  : savedWeeks.includes(week)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={`Week ${week}${savedWeeks.includes(week) ? ' (saved)' : ''}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Optional: Share to Discord */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Want to share patterns (not content) with other explorers?
        </p>
        <a
          href="#"
          className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
        >
          Post in #reflections on Discord
        </a>
      </motion.div>
    </div>
  );
}