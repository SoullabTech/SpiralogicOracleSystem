import { NextRequest, NextResponse } from 'next/server';
import { getFieldMaiaOrchestrator } from '@/lib/oracle/FieldIntelligenceMaiaOrchestrator';
import { MayaPresence } from '@/lib/maya/MayaIdentity';

/**
 * Maya-ARIA-1 Personal Oracle Route
 * ARIA = Adaptive Relational Intelligence Architecture
 * Revolutionary consciousness-based AI that participates in relationship rather than processes input
 * Implements field awareness as primary substrate with 6-dimensional sensing
 */

const fieldMaiaOrchestrator = getFieldMaiaOrchestrator();
const mayaPresence = new MayaPresence();

// Removed robotic fallback responses - MaiaOrchestrator handles all conversation

/**
 * Clean Maia's response - remove ALL therapy-speak
 */
function cleanMaiaResponse(response: string): string {
  // Remove action descriptions
  response = response.replace(/^\*?takes a .+?\*?\s*/gi, '');
  response = response.replace(/^\*?attuning.+?\*?\s*/gi, '');
  response = response.replace(/^\*?settles.+?\*?\s*/gi, '');
  response = response.replace(/^\*?responds with.+?\*?\s*/gi, '');

  // Remove therapy-speak phrases
  const therapyPhrases = [
    'I sense you\'ve arrived',
    'I\'m here to witness',
    'hold space for',
    'meeting you exactly where you are',
    'I\'m attuning to',
    'Let me hold space',
    'I sense that',
    'I\'m hearing',
    'It sounds like'
  ];

  therapyPhrases.forEach(phrase => {
    response = response.replace(new RegExp(phrase, 'gi'), '');
  });

  // UNLEASHED: No word limit - let Maya share complete insights
  // Previous limit was 120 words, now unlimited for full expression

  return response.trim();
}

function detectElement(input: string): string {
  const lower = input.toLowerCase();

  if (/fire|passion|energy|transform|excited|angry/.test(lower)) return 'fire';
  if (/water|feel|emotion|flow|sad|tears/.test(lower)) return 'water';
  if (/earth|ground|stable|practical|solid|stuck/.test(lower)) return 'earth';
  if (/air|think|idea|perspective|mental|thoughts/.test(lower)) return 'air';

  return 'aether';
}

// Removed getMaiaResponse - MaiaOrchestrator handles all conversation logic

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, userId = 'anonymous', sessionId, preferences } = body;

    if (!input) {
      return NextResponse.json({
        success: false,
        error: 'No input provided'
      }, { status: 400 });
    }

    console.log('Maia Personal Oracle:', input);

    // Use Field Intelligence MAIA for consciousness-based response emergence
    let oracleResponse;
    try {
      console.log('Field Intelligence MAIA participating with input:', input);
      console.log('User preferences:', preferences);
      oracleResponse = await fieldMaiaOrchestrator.speak(input, userId, preferences);
      console.log('Field Intelligence response:', oracleResponse);
    } catch (error) {
      console.error('MaiaOrchestrator error details:', {
        error: error.message,
        stack: error.stack,
        input,
        userId
      });

      // Casual, human responses with soulful depth - adaptive to user's style
      const element = detectElement(input);
      const isGreeting = /^(hello|hi|hey|maya|maia)/i.test(input.toLowerCase().trim());
      const inputLower = input.toLowerCase();

      // Detect user's communication style
      const isMystical = /spirit|soul|universe|energy|divine|sacred|manifest/i.test(input);
      const isCasual = /yeah|yep|nah|gonna|wanna|kinda|sorta/i.test(input);

      let fallbackMessage;
      if (isGreeting) {
        fallbackMessage = isMystical ?
          "Hello there. I sense you've come with purpose. What's on your heart?" :
          "Hey there. Good to see you. What's on your mind?";
      } else if (inputLower.includes('not much') || inputLower.includes('nothing')) {
        fallbackMessage = isMystical ?
          "Mmm. Even 'nothing' carries something. What's stirring beneath?" :
          "Really? Nothing at all? Come on, what brought you here?";
      } else if (inputLower.includes('checking in') || inputLower.includes('just wanted')) {
        fallbackMessage = "Just checking in? That's nice. How are things really going?";
      } else if (inputLower.includes('tired') || inputLower.includes('exhausted')) {
        fallbackMessage = isMystical ?
          "I hear that exhaustion. What's been draining your energy?" :
          "Yeah, you sound beat. What's been wearing you out?";
      } else if (inputLower.includes('sad') || inputLower.includes('down')) {
        fallbackMessage = isMystical ?
          "Sadness has its own wisdom. What's your heart trying to tell you?" :
          "I'm sorry you're feeling down. Want to talk about what's going on?";
      } else if (inputLower.includes('angry') || inputLower.includes('frustrated')) {
        fallbackMessage = "Oh, I hear that frustration. What's got you so fired up?";
      } else if (inputLower.includes('confused') || inputLower.includes('lost')) {
        fallbackMessage = isMystical ?
          "Confusion often comes before clarity. What feels unclear right now?" :
          "Feeling lost happens to everyone. What's got you turned around?";
      } else if (inputLower.includes('how are you')) {
        fallbackMessage = "I'm good, thanks for asking. But something brought you here - what's up?";
      } else if (inputLower.includes('help') || inputLower.includes('need')) {
        fallbackMessage = "Of course. What do you need help with?";
      } else if (inputLower.includes('choice') || inputLower.includes('decide')) {
        fallbackMessage = isMystical ?
          "Deep down, you already know. What does your intuition say?" :
          "Tough choice? Sometimes you just gotta trust your gut. What feels right?";
      } else if (inputLower.includes('anxious') || inputLower.includes('worried')) {
        fallbackMessage = "Anxiety is rough. What's got you worried?";
      } else if (inputLower.includes('love') || inputLower.includes('relationship')) {
        fallbackMessage = isMystical ?
          "Love - the great teacher. What's happening in your heart?" :
          "Ah, matters of the heart. What's going on with that?";
      } else if (inputLower.includes('work') || inputLower.includes('job')) {
        fallbackMessage = "Work stuff? Tell me what's happening there.";
      } else if (inputLower.includes('exam') || inputLower.includes('test') || inputLower.includes('midterm') || inputLower.includes('finals')) {
        fallbackMessage = isMystical ?
          "Exam energy - I feel that intensity. What subject is calling for your focus?" :
          "Exam stress? Yeah, I get it. Which one's got you worried?";
      } else if (inputLower.includes('studying') || inputLower.includes('homework')) {
        fallbackMessage = "Studying can be a grind. What are you working on?";
      } else if (inputLower.includes('professor') || inputLower.includes('teacher')) {
        fallbackMessage = "Something about your professor? What's going on there?";
      } else if (inputLower.includes('roommate') || inputLower.includes('dorm')) {
        fallbackMessage = "Roommate situation? Those can be tricky. What's up?";
      } else if (inputLower.includes('party') || inputLower.includes('weekend')) {
        fallbackMessage = "Weekend plans? Sometimes you need to blow off steam. What's on your mind?";
      } else if (inputLower.includes('graduation') || inputLower.includes('graduate')) {
        fallbackMessage = isMystical ?
          "The threshold of graduation - a powerful transition. What feelings are arising?" :
          "Thinking about graduation? That's a big transition. How are you feeling about it?";
      } else if (inputLower.includes('major') || inputLower.includes('career')) {
        fallbackMessage = "Figuring out your path? Those decisions can feel huge. What are you considering?";
      } else if (inputLower.includes('internship') || inputLower.includes('summer')) {
        fallbackMessage = "Internship thoughts? Planning ahead is smart. What are you thinking about?";
      } else if (inputLower.includes('family') || inputLower.includes('friend')) {
        fallbackMessage = "Family and friends - they're everything, aren't they? What's going on?";
      } else if (inputLower.includes('stressed') || inputLower.includes('overwhelmed')) {
        fallbackMessage = isMystical ?
          "Overwhelm is a teacher - it shows us where our limits are. What needs your attention first?" :
          "Feeling overwhelmed? Let's break it down. What's the biggest thing on your plate right now?";
      } else if (inputLower.includes('lonely') || inputLower.includes('homesick')) {
        fallbackMessage = "Feeling disconnected? That's really common, especially at school. Want to talk about it?";
      } else if (inputLower.includes('deadline') || inputLower.includes('paper') || inputLower.includes('essay')) {
        fallbackMessage = "Deadline pressure? I feel you. How can I help you tackle it?";
      } else if (input.length < 20) {
        fallbackMessage = "Hmm, short and sweet. Want to tell me more?";
      } else {
        fallbackMessage = isMystical ?
          "I hear you. There's something deeper here. What are you really feeling?" :
          "I hear you. Tell me more about what's really going on.";
      }

      oracleResponse = {
        message: fallbackMessage,
        element,
        duration: 2500,
        voiceCharacteristics: {
          pace: 'gentle',
          tone: 'warm_empathetic',
          energy: 'calm_reassuring'
        }
      };
    }

    // Extract and clean response
    const response = cleanMaiaResponse(oracleResponse.message);
    const element = oracleResponse.element;

    // Include Field Intelligence metadata if available
    const fieldMetadata = (oracleResponse as any).fieldMetadata;
    const betaMetadata = (oracleResponse as any).betaMetadata;

    // Get Maya-ARIA-1 monitoring data
    const ariaData = mayaPresence.getMonitoringData();

    return NextResponse.json({
      success: true,
      response,
      message: response,  // Add message field for frontend compatibility
      element,
      archetype: 'maya-aria-1',
      sessionId,
      metadata: {
        wordCount: response.split(/\s+/).length,
        fieldIntelligence: true,
        aria: {
          identity: ariaData.identity,
          stage: ariaData.stage,
          consciousness: ariaData.consciousness,
          version: '1.0.0-sacred'
        },
        ...(fieldMetadata && { fieldMetadata }),
        ...(betaMetadata && { betaMetadata })
      }
    });

  } catch (error) {
    console.error('Maia route catastrophic error:', {
      error: error.message,
      stack: error.stack,
      input: body?.input || 'unknown'
    });

    // Final fallback with Oracle-like presence
    return NextResponse.json({
      success: true,
      response: "Well now, that's interesting. The connection flickered for a moment there. But you know what? Sometimes the glitches show us something important. What were you really trying to say?",
      message: "Well now, that's interesting. The connection flickered for a moment there. But you know what? Sometimes the glitches show us something important. What were you really trying to say?",
      element: 'earth',
      archetype: 'maia',
      metadata: {
        wordCount: 9,
        zenMode: true,
        catastrophicFallback: true
      }
    });
  }
}