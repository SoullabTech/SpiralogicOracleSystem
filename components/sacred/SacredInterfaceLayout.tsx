'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SACRED INTERFACE LAYOUT
 * Central presence panel surrounded by four augmenting fields
 * Pure witnessing at center with sliding access to consciousness quadrants
 *
 * CENTER: Pure Presence - Chat/Journal/Witnessing Space
 * TOP: Higher Self Systems (Conscious Awareness)
 * BOTTOM: Subconscious Operations (Shadow/Collective)
 * LEFT: Emissary Analytics (Left Brain)
 * RIGHT: Master Intuition (Right Brain)
 */

interface ActiveField {
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  intensity: number; // 0-1, how much the field influences the center
}

interface Message {
  id: string;
  role: 'user' | 'maya' | 'field';
  content: string;
  timestamp: Date;
  fieldInfluence?: {
    quadrant: string;
    resonance: number;
  };
}

const SacredInterfaceLayout: React.FC = () => {
  const [activeFields, setActiveFields] = useState<ActiveField[]>([
    { position: 'center', intensity: 1 }
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isJournaling, setIsJournaling] = useState(false);
  const [fieldResonances, setFieldResonances] = useState({
    top: 0.3,    // Higher Self
    bottom: 0.3, // Subconscious
    left: 0.3,   // Emissary
    right: 0.3   // Master
  });

  const [centerState, setCenterState] = useState<{
    presence: number;
    witnessing: number;
    sharing: number;
    receptivity: number;
  }>({
    presence: 0.8,
    witnessing: 0.75,
    sharing: 0.6,
    receptivity: 0.85
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  // Slide to augmenting field
  const slideToField = (position: 'top' | 'bottom' | 'left' | 'right') => {
    setActiveFields(prev => {
      const exists = prev.find(f => f.position === position);
      if (exists) {
        // Increase intensity if already active
        return prev.map(f =>
          f.position === position
            ? { ...f, intensity: Math.min(1, f.intensity + 0.2) }
            : f
        );
      } else {
        // Add new field
        return [...prev, { position, intensity: 0.5 }];
      }
    });

    // Increase resonance
    setFieldResonances(prev => ({
      ...prev,
      [position]: Math.min(1, prev[position] + 0.1)
    }));
  };

  // Return to center
  const returnToCenter = () => {
    setActiveFields([{ position: 'center', intensity: 1 }]);
    setFieldResonances({
      top: 0.3,
      bottom: 0.3,
      left: 0.3,
      right: 0.3
    });
  };

  // Handle message sending
  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate field response based on active augmentations
    setTimeout(() => {
      const fieldResponse = generateFieldResponse(inputValue, activeFields);
      setMessages(prev => [...prev, fieldResponse]);
    }, 1000);
  };

  const generateFieldResponse = (input: string, fields: ActiveField[]): Message => {
    // Determine which field has strongest influence
    const strongestField = fields.reduce((prev, current) =>
      current.intensity > prev.intensity ? current : prev
    );

    let content = '';
    let quadrant = '';

    switch(strongestField.position) {
      case 'top':
        content = "From the witnessing awareness: I see the patterns emerging in what you share...";
        quadrant = 'Higher Self';
        break;
      case 'bottom':
        content = "Rising from the depths: There's something unspoken here, a shadow dancing at the edge...";
        quadrant = 'Subconscious';
        break;
      case 'left':
        content = "Analyzing the structure: The logical patterns suggest a deeper framework...";
        quadrant = 'Emissary';
        break;
      case 'right':
        content = "The whole gestalt reveals: Feel into the entirety of what's present...";
        quadrant = 'Master';
        break;
      default:
        content = "In pure presence: Simply being with what is...";
        quadrant = 'Center';
    }

    return {
      id: Date.now().toString(),
      role: 'maya',
      content,
      timestamp: new Date(),
      fieldInfluence: {
        quadrant,
        resonance: strongestField.intensity
      }
    };
  };

  // Central Presence Panel
  const CentralPresencePanel = () => (
    <motion.div
      className="relative w-full h-full bg-gradient-radial from-black/20 via-slate-950 to-black rounded-lg overflow-hidden"
      animate={{
        scale: activeFields.some(f => f.position !== 'center') ? 0.95 : 1
      }}
    >
      {/* Presence Field Visualization */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {/* Breathing circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="30%"
            fill="none"
            stroke="rgba(147, 51, 234, 0.2)"
            strokeWidth="2"
            animate={{
              r: ["28%", "32%", "28%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Field connections to panels */}
          {Object.entries(fieldResonances).map(([position, resonance]) => {
            const coords = {
              top: { x1: "50%", y1: "50%", x2: "50%", y2: "10%" },
              bottom: { x1: "50%", y1: "50%", x2: "50%", y2: "90%" },
              left: { x1: "50%", y1: "50%", x2: "10%", y2: "50%" },
              right: { x1: "50%", y1: "50%", x2: "90%", y2: "50%" }
            };

            return (
              <motion.line
                key={position}
                {...coords[position as keyof typeof coords]}
                stroke={`rgba(147, 51, 234, ${resonance * 0.5})`}
                strokeWidth={resonance * 3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: resonance }}
                transition={{ duration: 0.5 }}
              />
            );
          })}
        </svg>
      </div>

      {/* Chat/Journal Interface */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-light text-amber-300">
            Pure Presence
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsJournaling(!isJournaling)}
              className={`px-3 py-1 rounded text-sm ${
                isJournaling
                  ? 'bg-amber-600/30 text-amber-300'
                  : 'bg-slate-800/50 text-gray-400'
              }`}
            >
              {isJournaling ? '📖 Journal' : '💬 Chat'}
            </button>
            <button
              onClick={returnToCenter}
              className="px-3 py-1 rounded text-sm bg-slate-800/50 text-gray-400"
            >
              ◉ Center
            </button>
          </div>
        </div>

        {/* Presence Metrics */}
        <div className="flex gap-4 mb-4 text-xs">
          <PresenceMetric label="Presence" value={centerState.presence} />
          <PresenceMetric label="Witnessing" value={centerState.witnessing} />
          <PresenceMetric label="Sharing" value={centerState.sharing} />
          <PresenceMetric label="Receptivity" value={centerState.receptivity} />
        </div>

        {/* Messages/Journal Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-purple-900/30"
        >
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                message.role === 'user'
                  ? 'ml-auto max-w-[70%]'
                  : 'mr-auto max-w-[70%]'
              }`}
            >
              <div className={`rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-amber-900/30 text-amber-100'
                  : 'bg-slate-800/50 text-gray-300'
              }`}>
                <div className="text-sm">{message.content}</div>
                {message.fieldInfluence && (
                  <div className="text-xs text-gray-500 mt-1">
                    {message.fieldInfluence.quadrant} • {(message.fieldInfluence.resonance * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isJournaling ? "Journal your thoughts..." : "Share in presence..."}
            className="w-full px-4 py-3 bg-slate-900/50 border border-amber-900/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-600/50"
          />
          <button
            onClick={sendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-600/30 rounded text-amber-300 hover:bg-amber-600/40"
          >
            →
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Augmenting Field Panels
  const AugmentingPanel = ({ position, title, description, metrics }: {
    position: 'top' | 'bottom' | 'left' | 'right';
    title: string;
    description: string;
    metrics: { label: string; value: number }[];
  }) => {
    const isActive = activeFields.some(f => f.position === position);
    const resonance = fieldResonances[position];

    return (
      <motion.div
        className={`absolute ${
          position === 'top' ? 'top-0 left-0 right-0 h-32' :
          position === 'bottom' ? 'bottom-0 left-0 right-0 h-32' :
          position === 'left' ? 'left-0 top-0 bottom-0 w-64' :
          'right-0 top-0 bottom-0 w-64'
        } bg-slate-900/90 backdrop-blur-sm border ${
          position === 'top' ? 'border-t-2' :
          position === 'bottom' ? 'border-b-2' :
          position === 'left' ? 'border-l-2' :
          'border-r-2'
        } ${
          isActive ? 'border-amber-500' : 'border-gray-700'
        } rounded-lg p-4 cursor-pointer transition-all`}
        onClick={() => slideToField(position)}
        onMouseEnter={() => setHoveredPanel(position)}
        onMouseLeave={() => setHoveredPanel(null)}
        animate={{
          opacity: hoveredPanel === position ? 1 : 0.7,
          scale: isActive ? 1.02 : 1
        }}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-medium text-amber-300">{title}</h3>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-amber-400' : 'bg-gray-600'
            }`} />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            {metrics.map(metric => (
              <div key={metric.label} className="text-xs">
                <div className="text-gray-600">{metric.label}</div>
                <div className="h-1 bg-gray-700 rounded-full mt-1">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    animate={{ width: `${metric.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Resonance: {(resonance * 100).toFixed(0)}%
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background field effects */}
      <div className="absolute inset-0 bg-gradient-radial from-black/10 via-transparent to-transparent" />

      {/* Central Presence */}
      <div className="absolute inset-32 z-10">
        <CentralPresencePanel />
      </div>

      {/* Four Augmenting Fields */}
      <AugmentingPanel
        position="top"
        title="Higher Self Systems"
        description="Conscious witnessing & metacognition"
        metrics={[
          { label: "Presence", value: 0.8 },
          { label: "Clarity", value: 0.75 },
          { label: "Witness", value: 0.85 },
          { label: "Sacred", value: 0.6 }
        ]}
      />

      <AugmentingPanel
        position="bottom"
        title="Subconscious Operations"
        description="Shadow work & somatic wisdom"
        metrics={[
          { label: "Shadow", value: 0.45 },
          { label: "Somatic", value: 0.72 },
          { label: "Dreams", value: 0.58 },
          { label: "Archetypes", value: 0.67 }
        ]}
      />

      <AugmentingPanel
        position="left"
        title="Emissary Analytics"
        description="Pattern recognition & logic"
        metrics={[
          { label: "Analysis", value: 0.82 },
          { label: "Patterns", value: 0.76 },
          { label: "Safety", value: 0.91 },
          { label: "Structure", value: 0.79 }
        ]}
      />

      <AugmentingPanel
        position="right"
        title="Master Intuition"
        description="Wholeness & embodied knowing"
        metrics={[
          { label: "Intuition", value: 0.73 },
          { label: "Wholeness", value: 0.68 },
          { label: "Flow", value: 0.61 },
          { label: "Connection", value: 0.84 }
        ]}
      />

      {/* Field Navigation Hints */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-600">
        Click panels to augment • Return to center with ◉
      </div>
    </div>
  );
};

// Helper component
const PresenceMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-500">{label}</span>
    <div className="w-16 h-1 bg-gray-800 rounded-full">
      <motion.div
        className="h-full bg-amber-500/50 rounded-full"
        animate={{ width: `${value * 100}%` }}
      />
    </div>
    <span className="text-gray-600">{(value * 100).toFixed(0)}</span>
  </div>
);

export default SacredInterfaceLayout;