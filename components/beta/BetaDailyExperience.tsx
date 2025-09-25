"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Droplets, Mountain, Wind, Sparkles,
  MessageCircle, BookOpen, Play, SkipForward,
  ThumbsUp, ThumbsDown, Heart
} from 'lucide-react';

interface DailyExperience {
  day: number;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'integration' | 'shadow';
  theme: string;
  entryPrompt: string;
  archetypeEnergy: string;
  archetypePrompts: string[];
  integrationCue: string;
  eveningCheck: string;
  skipOptions: boolean;
}

interface UserSession {
  entryResponse?: string;
  chatEngaged: boolean;
  practiceCompleted: boolean;
  sessionRating?: number;
  skipReasons?: string[];
}

const DAILY_EXPERIENCES: DailyExperience[] = [
  {
    day: 1,
    element: 'fire',
    theme: 'Initiation',
    entryPrompt: "What's calling for your attention today?",
    archetypeEnergy: 'Hero',
    archetypePrompts: [
      "What challenge are you ready to face?",
      "Where do you feel courage stirring?",
      "What wants to be born through you?"
    ],
    integrationCue: "Take one small bold action today",
    eveningCheck: "What sparked alive in you today?",
    skipOptions: true
  },
  {
    day: 2,
    element: 'water',
    theme: 'Flow',
    entryPrompt: "What feelings are moving through you?",
    archetypeEnergy: 'Lover',
    archetypePrompts: [
      "What do you deeply care about?",
      "Where do you feel most connected?",
      "What would love do here?"
    ],
    integrationCue: "Hand on heart, three deep breaths",
    eveningCheck: "What flowed through you today?",
    skipOptions: true
  },
  {
    day: 3,
    element: 'earth',
    theme: 'Grounding',
    entryPrompt: "What feels solid in your life right now?",
    archetypeEnergy: 'Sage',
    archetypePrompts: [
      "What pattern are you noticing?",
      "What wisdom is emerging?",
      "What supports you most deeply?"
    ],
    integrationCue: "Stand barefoot, feel your foundation",
    eveningCheck: "What foundation did you strengthen today?",
    skipOptions: true
  },
  {
    day: 4,
    element: 'air',
    theme: 'Perspective',
    entryPrompt: "What new understanding is emerging?",
    archetypeEnergy: 'Trickster',
    archetypePrompts: [
      "What assumption could you question?",
      "What would you see from a different angle?",
      "What rule could you playfully break?"
    ],
    integrationCue: "Write one clear insight",
    eveningCheck: "What became clearer in your thinking?",
    skipOptions: true
  },
  {
    day: 5,
    element: 'integration',
    theme: 'Synthesis',
    entryPrompt: "How are these elements dancing together in you?",
    archetypeEnergy: 'Your Choice',
    archetypePrompts: [
      "Which energy wants more exploration?",
      "What's integrating from this week?",
      "What pattern is emerging?"
    ],
    integrationCue: "Create something small (draw, write, gesture)",
    eveningCheck: "What's integrating from this week?",
    skipOptions: true
  },
  {
    day: 6,
    element: 'shadow',
    theme: 'Depth',
    entryPrompt: "What have you been dancing around this week?",
    archetypeEnergy: 'Truth-teller',
    archetypePrompts: [
      "What truth feels hard but important?",
      "What would you say if nobody was judging?",
      "What edge are you ready to honor?"
    ],
    integrationCue: "Write and release (optional)",
    eveningCheck: "How does it feel to honor that edge?",
    skipOptions: true
  },
  {
    day: 7,
    element: 'aether',
    theme: 'Renewal',
    entryPrompt: "Looking back at this week, what's shifting in you?",
    archetypeEnergy: 'Mystic',
    archetypePrompts: [
      "What's the deeper pattern you're living?",
      "What wants to emerge next?",
      "What wisdom will you carry forward?"
    ],
    integrationCue: "Set one intention for the coming week",
    eveningCheck: "What are you grateful for from this journey?",
    skipOptions: true
  }
];

const ELEMENT_ICONS = {
  fire: <Flame className="w-6 h-6 text-red-500" />,
  water: <Droplets className="w-6 h-6 text-blue-500" />,
  earth: <Mountain className="w-6 h-6 text-green-500" />,
  air: <Wind className="w-6 h-6 text-gray-500" />,
  aether: <Sparkles className="w-6 h-6 text-amber-500" />,
  integration: <Sparkles className="w-6 h-6 text-indigo-500" />,
  shadow: <div className="w-6 h-6 bg-gray-800 rounded-full" />
};

export default function BetaDailyExperience({
  currentDay,
  userPreferences,
  onSessionComplete,
  onSkip
}: {
  currentDay: number;
  userPreferences: any;
  onSessionComplete: (session: UserSession) => void;
  onSkip: (reason: string) => void;
}) {
  const [currentPhase, setCurrentPhase] = useState<'entry' | 'journal' | 'chat' | 'integration' | 'feedback'>('entry');
  const [session, setSession] = useState<UserSession>({
    chatEngaged: false,
    practiceCompleted: false
  });
  const [entryResponse, setEntryResponse] = useState('');
  const [showSkipOptions, setShowSkipOptions] = useState(false);

  const experience = DAILY_EXPERIENCES[currentDay - 1];

  if (!experience) {
    return <div>Invalid day</div>;
  }

  const handlePhaseComplete = (phase: string, data?: any) => {
    switch (phase) {
      case 'entry':
        setSession(prev => ({ ...prev, entryResponse: data }));
        setCurrentPhase('journal');
        break;
      case 'journal':
        setCurrentPhase('chat');
        break;
      case 'chat':
        setSession(prev => ({ ...prev, chatEngaged: true }));
        setCurrentPhase('integration');
        break;
      case 'integration':
        setSession(prev => ({ ...prev, practiceCompleted: true }));
        setCurrentPhase('feedback');
        break;
      case 'feedback':
        onSessionComplete({ ...session, sessionRating: data });
        break;
    }
  };

  const handleSkip = (reason: string) => {
    onSkip(reason);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {ELEMENT_ICONS[experience.element]}
              <div>
                <CardTitle className="text-xl">
                  Day {experience.day}: {experience.theme}
                </CardTitle>
                <p className="text-gray-600 capitalize">
                  {experience.element} Energy • {experience.archetypeEnergy} Archetype
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSkipOptions(true)}
                className="text-gray-500"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Today
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Skip Options Modal */}
      <AnimatePresence>
        {showSkipOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSkipOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Skip today's experience?</h3>
              <p className="text-gray-600 mb-6">
                That's completely okay! Help us understand why:
              </p>
              <div className="space-y-2">
                {[
                  "Not feeling it today",
                  "Too busy right now",
                  "Want to try a different element",
                  "Need something lighter",
                  "Just want to explore freely"
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant="ghost"
                    className="w-full text-left justify-start"
                    onClick={() => {
                      handleSkip(reason);
                      setShowSkipOptions(false);
                    }}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowSkipOptions(false)}
              >
                Actually, let's continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentPhase === 'entry' && (
            <EntryPhase
              experience={experience}
              userPreferences={userPreferences}
              onComplete={handlePhaseComplete}
            />
          )}

          {currentPhase === 'journal' && (
            <JournalPhase
              experience={experience}
              entryResponse={session.entryResponse}
              onComplete={handlePhaseComplete}
            />
          )}

          {currentPhase === 'chat' && (
            <ChatPhase
              experience={experience}
              userPreferences={userPreferences}
              onComplete={handlePhaseComplete}
            />
          )}

          {currentPhase === 'integration' && (
            <IntegrationPhase
              experience={experience}
              userPreferences={userPreferences}
              onComplete={handlePhaseComplete}
            />
          )}

          {currentPhase === 'feedback' && (
            <FeedbackPhase
              experience={experience}
              onComplete={handlePhaseComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EntryPhase({
  experience,
  userPreferences,
  onComplete
}: {
  experience: DailyExperience;
  userPreferences: any;
  onComplete: (phase: string, data?: any) => void;
}) {
  const [response, setResponse] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {experience.entryPrompt}
          </h3>
          <p className="text-gray-600 text-sm">
            Take a moment to notice what's alive for you right now
          </p>
        </div>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write whatever comes to mind..."
          className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => onComplete('entry', 'Checked in silently')}
          >
            Skip writing, just continue
          </Button>
          <Button
            onClick={() => onComplete('entry', response)}
            disabled={!response.trim()}
            className="bg-gradient-to-r from-amber-500 to-pink-500 text-white"
          >
            Continue to Journaling
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function JournalPhase({
  experience,
  entryResponse,
  onComplete
}: {
  experience: DailyExperience;
  entryResponse?: string;
  onComplete: (phase: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Explore Deeper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">From your check-in:</h4>
          <p className="text-gray-700 italic">"{entryResponse || 'Ready to explore...'}"</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Would you like to explore this further?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => onComplete('journal')}
            >
              <div>
                <div className="font-medium">Continue in Journal</div>
                <div className="text-sm text-gray-600">Write freely about this theme</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => onComplete('journal')}
            >
              <div>
                <div className="font-medium">Talk it Through</div>
                <div className="text-sm text-gray-600">Chat with MAIA about this</div>
              </div>
            </Button>
          </div>
        </div>

        <Button
          onClick={() => onComplete('journal')}
          className="w-full bg-gradient-to-r from-amber-500 to-pink-500 text-white"
        >
          Continue to Chat
        </Button>
      </CardContent>
    </Card>
  );
}

function ChatPhase({
  experience,
  userPreferences,
  onComplete
}: {
  experience: DailyExperience;
  userPreferences: any;
  onComplete: (phase: string) => void;
}) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {experience.archetypeEnergy} Energy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-amber-50 rounded-lg">
          <p className="text-gray-700">
            The {experience.archetypeEnergy} in you wants to explore...
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Choose a question that resonates:</h4>
          {experience.archetypePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedPrompt === prompt
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPrompt(prompt)}
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => onComplete('chat')}
          >
            Skip chat for now
          </Button>
          <Button
            onClick={() => onComplete('chat')}
            disabled={!selectedPrompt}
            className="bg-gradient-to-r from-amber-500 to-pink-500 text-white"
          >
            Start Conversation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationPhase({
  experience,
  userPreferences,
  onComplete
}: {
  experience: DailyExperience;
  userPreferences: any;
  onComplete: (phase: string) => void;
}) {
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const shouldShowPractice = userPreferences?.practiceOpenness !== false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {shouldShowPractice ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Practice Invitation:</h4>
              <p className="text-green-700">{experience.integrationCue}</p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant={practiceCompleted ? "default" : "outline"}
                onClick={() => setPracticeCompleted(true)}
                className="flex-1"
              >
                {practiceCompleted ? "✓ Completed" : "I'll try this"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onComplete('integration')}
                className="flex-1"
              >
                Skip practice
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Take a moment to let today's exploration settle
            </p>
          </div>
        )}

        <Button
          onClick={() => onComplete('integration')}
          className="w-full bg-gradient-to-r from-amber-500 to-pink-500 text-white"
        >
          Complete Today's Journey
        </Button>
      </CardContent>
    </Card>
  );
}

function FeedbackPhase({
  experience,
  onComplete
}: {
  experience: DailyExperience;
  onComplete: (phase: string, data?: any) => void;
}) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          How was today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-700 mb-4">{experience.eveningCheck}</p>

          <div className="space-y-4">
            <h4 className="font-medium">Quick feedback on today's flow:</h4>
            <div className="flex justify-center space-x-4">
              <Button
                variant={rating === 1 ? "default" : "outline"}
                onClick={() => setRating(1)}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Too much
              </Button>
              <Button
                variant={rating === 2 ? "default" : "outline"}
                onClick={() => setRating(2)}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Just right
              </Button>
              <Button
                variant={rating === 3 ? "default" : "outline"}
                onClick={() => setRating(3)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Want more
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onComplete('feedback', rating)}
          className="w-full bg-gradient-to-r from-amber-500 to-pink-500 text-white"
        >
          Complete Day {experience.day}
        </Button>
      </CardContent>
    </Card>
  );
}