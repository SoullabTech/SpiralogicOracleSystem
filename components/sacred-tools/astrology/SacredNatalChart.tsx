"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Sun, Moon, Star, Sparkles, Info, 
  ZoomIn, ZoomOut, Maximize2, Filter 
} from 'lucide-react';

interface SacredNatalChartProps {
  userId: string;
  birthData?: {
    date: string;
    time: string;
    location: { lat: number; lng: number };
  };
  onComplete?: (sessionData: any) => void;
}

// Planetary glyphs and symbols
const PLANET_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

// Zodiac signs
const ZODIAC_SIGNS = [
  '♈', '♉', '♊', '♋', '♌', '♍',
  '♎', '♏', '♐', '♑', '♒', '♓'
];

// Element colors matching Sacred Portal aesthetic
const ELEMENT_COLORS = {
  fire: '#ff6b6b',
  water: '#4dabf7',
  earth: '#51cf66',
  air: '#ffd43b',
  aether: '#e5dbff'
};

export function SacredNatalChart({ 
  userId, 
  birthData,
  onComplete 
}: SacredNatalChartProps) {
  const [chartState, setChartState] = useState<'loading' | 'germinating' | 'blooming' | 'ready'>('loading');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showReading, setShowReading] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();

  // Initialize chart animation sequence
  useEffect(() => {
    const initializeChart = async () => {
      // Cosmic seed germination
      setChartState('germinating');
      await controls.start({
        scale: [0, 0.1, 1],
        opacity: [0, 1, 1],
        transition: { duration: 1.5, ease: "easeOut" }
      });
      
      // Bloom into full chart
      setChartState('blooming');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ready for interaction
      setChartState('ready');
      
      // Start coherence pulse
      controls.start({
        scale: [1, 1.02, 1],
        transition: { 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    };
    
    initializeChart();
  }, [controls]);

  // Handle pinch to zoom
  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.5 : prev - 0.5;
      return Math.max(1, Math.min(3, newZoom));
    });
  };

  // Handle element filter
  const toggleElementFilter = (element: string) => {
    setActiveElement(prev => prev === element ? null : element);
  };

  // Generate sacred reading
  const generateSacredReading = () => {
    setShowReading(true);
    
    // Save session data
    const sessionData = {
      type: 'natal-chart',
      userId,
      birthData,
      timestamp: new Date().toISOString(),
      elementalResonance: {
        fire: 0.3,
        water: 0.25,
        earth: 0.2,
        air: 0.15,
        aether: 0.1
      },
      dominantArchetypes: ['Seeker', 'Mystic', 'Creator'],
      sacredReflection: "Your fire burns brightly in the 9th house — a restless spirit seeking truth across horizons."
    };
    
    onComplete?.(sessionData);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          onClick={() => handleZoom('in')}
          className="p-2 bg-black/40 backdrop-blur rounded-lg border border-white/20"
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </motion.button>
        
        <motion.button
          onClick={() => handleZoom('out')}
          className="p-2 bg-black/40 backdrop-blur rounded-lg border border-white/20"
          whileTap={{ scale: 0.95 }}
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </motion.button>
        
        <motion.button
          onClick={generateSacredReading}
          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Element Filter */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {Object.entries(ELEMENT_COLORS).slice(0, 4).map(([element, color]) => (
          <motion.button
            key={element}
            onClick={() => toggleElementFilter(element)}
            className={`p-2 rounded-lg border transition-all ${
              activeElement === element 
                ? 'bg-white/20 border-white/40' 
                : 'bg-black/40 border-white/20'
            }`}
            style={{
              borderColor: activeElement === element ? color : undefined
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: color }}
            />
          </motion.button>
        ))}
      </div>

      {/* Main Chart Container */}
      <motion.div
        className="relative aspect-square bg-gradient-to-br from-purple-900/20 to-black rounded-3xl overflow-hidden"
        animate={controls}
        style={{
          transform: `scale(${zoomLevel})`
        }}
      >
        {/* Background stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Cosmic Mandala SVG */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient definitions */}
            <radialGradient id="aetherGlow">
              <stop offset="0%" stopColor={ELEMENT_COLORS.aether} stopOpacity="0.5" />
              <stop offset="100%" stopColor={ELEMENT_COLORS.aether} stopOpacity="0" />
            </radialGradient>
            
            {/* Golden thread gradient */}
            <linearGradient id="goldenThread">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffed4e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Aether center halo */}
          <motion.circle
            cx="400"
            cy="400"
            r="80"
            fill="url(#aetherGlow)"
            initial={{ r: 0 }}
            animate={chartState === 'ready' ? { r: [80, 90, 80] } : { r: 80 }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* House divisions */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = 400 + 100 * Math.cos(angle);
            const y1 = 400 + 100 * Math.sin(angle);
            const x2 = 400 + 350 * Math.cos(angle);
            const y2 = 400 + 350 * Math.sin(angle);
            
            return (
              <motion.line
                key={`house-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              />
            );
          })}

          {/* Zodiac circle */}
          <motion.circle
            cx="400"
            cy="400"
            r="320"
            fill="none"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />

          {/* Zodiac signs */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const angle = (i * 30 - 75) * Math.PI / 180;
            const x = 400 + 340 * Math.cos(angle);
            const y = 400 + 340 * Math.sin(angle);
            
            return (
              <motion.text
                key={`sign-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="20"
                opacity="0.6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.1 * i }}
              >
                {sign}
              </motion.text>
            );
          })}

          {/* Planets */}
          {Object.entries(PLANET_SYMBOLS).map(([planet, symbol], i) => {
            // Mock positions - would be calculated from ephemeris
            const angle = (i * 36 - 90) * Math.PI / 180;
            const radius = 150 + (i % 3) * 50;
            const x = 400 + radius * Math.cos(angle);
            const y = 400 + radius * Math.sin(angle);
            
            const planetSize = ['sun', 'moon'].includes(planet) ? 30 : 20;
            
            return (
              <motion.g
                key={planet}
                onClick={() => setSelectedPlanet(planet)}
                style={{ cursor: 'pointer' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 * i, type: "spring" }}
              >
                {/* Planet glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={planetSize}
                  fill={`url(#${planet}Glow)`}
                  opacity="0.3"
                />
                
                {/* Planet orb */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={planetSize / 2}
                  fill="#ffd700"
                  animate={{
                    scale: selectedPlanet === planet ? [1, 1.3, 1] : 1
                  }}
                />
                
                {/* Planet symbol */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {symbol}
                </text>
              </motion.g>
            );
          })}

          {/* Aspect lines (golden threads) */}
          {chartState === 'ready' && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Mock aspects - would be calculated */}
              <motion.line
                x1="400"
                y1="250"
                x2="520"
                y2="400"
                stroke="url(#goldenThread)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
            </motion.g>
          )}

          {/* Elemental ring */}
          <g opacity={chartState === 'ready' ? 1 : 0}>
            {Object.entries(ELEMENT_COLORS).slice(0, 4).map(([element, color], i) => {
              const startAngle = i * 90 - 90;
              const endAngle = startAngle + 90;
              const isActive = !activeElement || activeElement === element;
              
              return (
                <motion.path
                  key={element}
                  d={describeArc(400, 400, 360, 380, startAngle, endAngle)}
                  fill={color}
                  opacity={isActive ? 0.3 : 0.1}
                  animate={{
                    opacity: isActive ? [0.3, 0.5, 0.3] : 0.1
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              );
            })}
          </g>
        </svg>

        {/* Loading/State Overlay */}
        <AnimatePresence>
          {chartState === 'germinating' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-white text-xl font-light"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🌱 Cosmic seed germinating...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planet Tooltip */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="text-white">
                <div className="text-2xl mb-2">{PLANET_SYMBOLS[selectedPlanet as keyof typeof PLANET_SYMBOLS]}</div>
                <div className="text-sm opacity-80">5th House in Leo</div>
                <div className="mt-3 text-xs space-y-1">
                  <div>🔥 Fire: 45%</div>
                  <div>💧 Water: 20%</div>
                  <div>🌍 Earth: 25%</div>
                  <div>🌬️ Air: 10%</div>
                </div>
                <div className="mt-3 text-xs italic opacity-70">
                  "Creative fire illuminates your path"
                </div>
              </div>
              <button
                className="absolute top-2 right-2 text-white/60"
                onClick={() => setSelectedPlanet(null)}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sacred Reading Overlay */}
        <AnimatePresence>
          {showReading && (
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-md text-center text-white">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-2xl font-light mb-4">Sacred Reflection</h3>
                <p className="text-lg leading-relaxed opacity-90">
                  "Your fire burns brightly in the 9th house — a restless spirit seeking truth across horizons. 
                  Water flows through your emotional depths, while earth grounds your ambitions in practical wisdom."
                </p>
                <button
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  onClick={() => setShowReading(false)}
                >
                  Close Reading
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Helper function for SVG arc paths
function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}