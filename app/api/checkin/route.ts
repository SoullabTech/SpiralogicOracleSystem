import { NextRequest, NextResponse } from 'next/server';

interface CheckInData {
  timestamp: string;
  petalValues: number[];
  quadrants: {
    mind: number;
    body: number;
    spirit: number;
    heart: number;
  };
  coherence: number;
  configuration: string;
}

// Beta insights database - expand as patterns emerge
const INSIGHTS = {
  balanced: [
    "Your inner harmony radiates outward. Today, trust the balance you've cultivated.",
    "All elements dance in equilibrium. You are the still point at the center of motion.",
    "Perfect coherence creates space for spontaneous wisdom to emerge.",
    "Balance isn't stillness—it's dynamic equilibrium. Ride the wave.",
    "You've found the center. From here, all directions are possible."
  ],
  fire_dominant: [
    "Your vision burns bright. Channel this creative force into tangible action.",
    "The fire within seeks expression. What transformation are you ready to ignite?",
    "Passion leads, but remember to tend the other flames that sustain you.",
    "Creative power surges through you. Direct it with intention.",
    "Your will is strong today. Use it to forge something meaningful."
  ],
  water_dominant: [
    "Deep currents move through you. Honor what flows beneath the surface.",
    "Your emotional wisdom is heightened. Trust what you feel more than what you think.",
    "The waters are speaking. Create space for their messages to surface.",
    "Intuition flows strong. Let it guide you past logical barriers.",
    "Emotional intelligence is your superpower today. Lead with empathy."
  ],
  air_dominant: [
    "Clarity pierces through confusion. Your mind sees patterns others miss.",
    "Mental agility is your gift today. Use it to untangle what seemed impossible.",
    "The air element brings messages. Listen to the whispers between thoughts.",
    "Your perspective shifts easily today. Use this flexibility wisely.",
    "Communication channels open. Speak your truth with clarity."
  ],
  earth_dominant: [
    "Grounding is your superpower. Others will seek your stabilizing presence.",
    "The earth reminds you: slow, steady progress creates lasting change.",
    "Your body knows. Trust its wisdom over mental chatter today.",
    "Practical magic is available. Turn dreams into tangible reality.",
    "Roots deepen before branches spread. Honor this foundational time."
  ],
  expanding: [
    "You're entering an expansion phase. Say yes to what stretches you.",
    "Growth edges are calling. Comfort zones are meant to be transcended.",
    "Your field is widening. New possibilities enter through the periphery.",
    "Expansion requires courage. You have more than you know.",
    "The spiral opens outward. Follow where it leads."
  ],
  contracting: [
    "Sacred contraction creates the pearl. Pressure serves your becoming.",
    "Drawing inward is not retreat—it's gathering power for the next emergence.",
    "The spiral turns inward before it expands. Trust this natural rhythm.",
    "Conservation of energy now means abundance later. Rest is productive.",
    "Sometimes the most powerful move is stillness. Be the eye of your storm."
  ],
  mixed: [
    "Complexity is your friend today. Multiple truths can coexist.",
    "You're integrating opposites. This tension creates evolution.",
    "Mixed signals aren't confusion—they're your system updating.",
    "Hold space for paradox. The answer lives between extremes.",
    "You're weaving disparate threads into a new pattern. Trust the process."
  ]
};

function analyzeConfiguration(checkIn: CheckInData): string {
  const { quadrants, coherence } = checkIn;

  // Calculate element dominance
  const elements = [
    { name: 'fire', value: (quadrants.mind + quadrants.heart) / 2 },
    { name: 'water', value: (quadrants.spirit + quadrants.heart) / 2 },
    { name: 'air', value: (quadrants.mind + quadrants.spirit) / 2 },
    { name: 'earth', value: (quadrants.body + quadrants.heart) / 2 }
  ];

  elements.sort((a, b) => b.value - a.value);
  const dominant = elements[0];
  const variance = Math.max(...Object.values(quadrants)) - Math.min(...Object.values(quadrants));

  // Determine pattern
  if (variance < 2) {
    return 'balanced';
  } else if (coherence > 0.7) {
    return 'expanding';
  } else if (coherence < 0.4) {
    return 'contracting';
  } else if (variance > 4) {
    return 'mixed';
  } else {
    return `${dominant.name}_dominant`;
  }
}

function selectInsight(category: string): string {
  const insights = INSIGHTS[category as keyof typeof INSIGHTS] || INSIGHTS.mixed;
  return insights[Math.floor(Math.random() * insights.length)];
}

export async function POST(request: NextRequest) {
  try {
    const checkIn = await request.json() as CheckInData;

    // Analyze configuration
    const pattern = analyzeConfiguration(checkIn);
    const insight = selectInsight(pattern);

    // In production, save to database here
    // For beta, we're just returning the insight

    // Log for beta analysis
    console.log('Beta Check-in:', {
      timestamp: checkIn.timestamp,
      configuration: checkIn.configuration,
      pattern,
      coherence: checkIn.coherence
    });

    return NextResponse.json({
      success: true,
      insight,
      pattern,
      configuration: checkIn.configuration
    });
  } catch (error) {
    console.error('Check-in error:', error);

    // Return a fallback insight even on error
    return NextResponse.json({
      success: false,
      insight: "Trust your inner compass today. The path reveals itself one step at a time.",
      error: 'Failed to process check-in'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return beta status
  return NextResponse.json({
    status: 'Beta Active',
    message: 'Daily Oracle Check-in API',
    version: '0.1.0-beta'
  });
}