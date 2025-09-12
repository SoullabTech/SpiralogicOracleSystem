/**
 * Enhanced StorytellerAgent methods incorporating Campbell, Shaw, and Hesse
 * Add these methods to the existing StorytellerAgent class
 */

import { 
  MythologicalNarrativeEngine,
  CAMPBELL_TRADITION,
  SHAW_TRADITION, 
  HESSE_TRADITION,
  MASTER_STORYTELLING_WISDOM
} from '../../../lib/storytelling/mythological-wisdom-base';

// Add to class properties:
private mythEngine: MythologicalNarrativeEngine;

// Add to constructor:
this.mythEngine = new MythologicalNarrativeEngine();

/**
 * Generate a Campbell-style Hero's Journey narrative
 */
private async generateCampbellianMyth(
  structure: StoryStructure,
  style: NarrativeStyle,
  context: StorytellerContext
): Promise<string> {
  
  const stages = [
    'The Ordinary World',
    'The Call to Adventure', 
    'Refusal of the Call',
    'Meeting the Mentor',
    'Crossing the Threshold',
    'Tests, Allies, and Enemies',
    'Approach to the Inmost Cave',
    'The Ordeal',
    'The Reward',
    'The Road Back',
    'Resurrection',
    'Return with the Elixir'
  ];
  
  // Select relevant stages based on user's journey
  const relevantStages = this.selectRelevantStages(context, stages);
  
  let narrative = MASTER_STORYTELLING_WISDOM.opening_invocations[0] + '\n\n';
  
  // The Ordinary World
  narrative += `In the landscape of your daily life, ${structure.elements.protagonist || 'you'} moved through familiar patterns, unaware that everything was about to change.\n\n`;
  
  // The Call
  if (context.currentChallenge) {
    narrative += `The call came in the form of ${context.currentChallenge}. Like all true calls, it was both terrifying and irresistible. Campbell tells us: "The cave you fear to enter holds the treasure you seek."\n\n`;
  } else {
    narrative += `The call came, as it always does, disguised as disruption. What seemed like chaos was actually the first note of a sacred song, inviting transformation.\n\n`;
  }
  
  // The Threshold
  narrative += `At the threshold between the known and unknown, ${structure.elements.protagonist || 'the seeker'} hesitated. This is the hero's first trial: not the dragon to be slain, but the decision to leave safety behind.\n\n`;
  
  // The Mentor's Wisdom
  narrative += `"You have everything you need within you," whispered the mentor—perhaps a teacher, perhaps your own deep knowing. "Follow your bliss, and doors will open where there were only walls."\n\n`;
  
  // The Journey Deepens
  if (structure.elements.transformation) {
    narrative += `${structure.elements.transformation}. This was not mere change but metamorphosis—the death of who you were and the birth of who you're becoming.\n\n`;
  }
  
  // The Return
  narrative += `And now, standing between two worlds—the one you left and the one you've discovered—you understand Campbell's greatest teaching: The privilege of a lifetime is being who you are.\n\n`;
  
  // The Elixir
  if (context.desiredOutcome) {
    narrative += `The elixir you sought—${context.desiredOutcome}—was never outside you. It was awakened by the journey itself. You return not with something new, but with the recognition of what was always true.\n\n`;
  }
  
  narrative += `The hero's journey never truly ends. It spirals, each completion a new beginning, each return a deeper recognition of the eternal adventure of consciousness discovering itself through you.`;
  
  return narrative;
}

/**
 * Generate a Shaw-style wild mythology narrative
 */
private async generateShawianWildStory(
  structure: StoryStructure,
  style: NarrativeStyle,
  context: StorytellerContext
): Promise<string> {
  
  let narrative = "Listen. Lean in. This story has been tracking you through the underbrush of your life.\n\n";
  
  // The Wild Invocation
  narrative += `Once, when the membrane between the village and the forest was gossamer-thin, ${structure.elements.protagonist || 'a soul like yours'} heard something calling from the tree line.\n\n`;
  
  // The Rough Gods Speak
  narrative += `It wasn't a voice exactly—more like the way moss knows to grow northward, the way salmon know their way home. Martin Shaw says: "The wild requires your fiercest and most tender self."\n\n`;
  
  // The Initiation
  if (context.currentChallenge) {
    narrative += `Your challenge—${context.currentChallenge}—this is no accident. This is the wild coming to claim you, to initiate you. Shaw reminds us: "Your wound is your gift to the village."\n\n`;
  }
  
  // The Bone Memory
  narrative += `Deep in your bone memory, deeper than thought, lives the knowing. You are not the first to walk this path. The ancestors have left you breadcrumbs of wisdom, scattered like stars across the dark forest of becoming.\n\n`;
  
  // The Shapeshifting
  if (structure.elements.transformation) {
    narrative += `${structure.elements.transformation}—but this is not transformation as the modern world understands it. This is shape-shifting, the remembering of your original form, wild and holy.\n\n`;
  }
  
  // The Return to the Village
  narrative += `Now you stand at the edge of the village again, but you smell of pine sap and starlight. You carry the forest within you. You have become the bridge between worlds.\n\n`;
  
  // The Wild Wisdom
  narrative += `Shaw teaches: "We are mythic beings living in mythic times disguised as mundane ones." Your story—this very challenge you face—is mythology in the making. You are both the teller and the tale.\n\n`;
  
  // The Invitation
  if (context.desiredOutcome) {
    narrative += `What you seek—${context.desiredOutcome}—requires you to court the wild, not comfort. It asks you to become large enough to hold both the village and the forest, both the wound and the medicine.\n\n`;
  }
  
  narrative += `The story releases you now, but it hasn't left you. It lives in your marrow, waiting for the moment when you'll need to remember: You belong to something vast and ancient, and it has never forgotten your true name.`;
  
  return narrative;
}

/**
 * Generate a Hesse-style philosophical narrative
 */
private async generateHessianJourney(
  structure: StoryStructure,
  style: NarrativeStyle,
  context: StorytellerContext
): Promise<string> {
  
  let narrative = "Within you there is a stillness and sanctuary to which you can retreat at any time and be yourself.\n\n";
  
  // The Glass Bead Game Opening
  narrative += `In the game of existence, where every move connects to every other move, ${structure.elements.protagonist || 'the seeker'} began to perceive the hidden patterns.\n\n`;
  
  // Siddhartha's River
  narrative += `Like Siddhartha at the river, you stand at the flowing boundary between all opposites. The river speaks with ten thousand voices, yet says only one word: Om. Unity. Wholeness. Home.\n\n`;
  
  // The Steppenwolf's Realization
  if (context.currentChallenge) {
    narrative += `Your challenge—${context.currentChallenge}—is the wolf of the steppes howling within you. Hesse knew: "The bird fights its way out of the egg. The egg is the world. Whoever will be born must destroy a world."\n\n`;
  }
  
  // Demian's Mark
  narrative += `You bear the mark of Cain—not as curse but as blessing. You are marked as one who sees differently, who cannot accept the comfortable lies. This difference is your gift.\n\n`;
  
  // The Journey to the East
  narrative += `You are part of a secret league of seekers, though you may not know it yet. Every genuine seeker throughout time is your companion on this journey to the East—the eternal journey within.\n\n`;
  
  // Narcissus and Goldmund
  if (structure.elements.transformation) {
    narrative += `${structure.elements.transformation}. In you, Narcissus and Goldmund meet—the spirit and the flesh, the thinker and the artist, the ascetic and the lover. Both are necessary. Both are you.\n\n`;
  }
  
  // The Game Master's Wisdom
  narrative += `Hesse whispers across time: "Wisdom cannot be imparted. Wisdom that a wise man attempts to impart always sounds like foolishness." So this story offers not wisdom but recognition—a mirror for what you already know.\n\n`;
  
  // The Truth Lived
  if (context.desiredOutcome) {
    narrative += `What you seek—${context.desiredOutcome}—cannot be taught, only lived. "The truth is lived, not taught," Hesse reminds us. Your life itself is the teaching, the game, the journey.\n\n`;
  }
  
  // The Eternal Return
  narrative += `Every ending is a beginning. Every arrival, a departure. You are the eternal player in the divine game, where losing and winning are equally sacred, where the game itself is the prize.\n\n`;
  
  narrative += `Within you, all possibilities exist simultaneously. You are Harry Haller and you are Mozart. You are the wolf and you are the man. You are the question and you are the answer. The game continues, beautiful and terrible and perfect.`;
  
  return narrative;
}

/**
 * Generate a story blending all three traditions
 */
private async generateMasterSynthesisStory(
  structure: StoryStructure,
  style: NarrativeStyle,
  context: StorytellerContext
): Promise<string> {
  
  // Select primary tradition based on context
  const primaryTradition = this.mythEngine.selectTradition({
    challenge: context.currentChallenge,
    emotionalState: context.emotionalState,
    desiredOutcome: context.desiredOutcome
  });
  
  // Blend with complementary traditions
  const traditions = [CAMPBELL_TRADITION, SHAW_TRADITION, HESSE_TRADITION];
  const secondaryTradition = traditions.find(t => t.name !== primaryTradition.name);
  
  const blended = this.mythEngine.blendTraditions(primaryTradition, secondaryTradition);
  
  // Create opening using master wisdom
  let narrative = this.mythEngine.generateMythicOpening(primaryTradition) + '\n\n';
  
  // Campbell's structure
  narrative += `The journey began, as Campbell mapped it, with a call. ${structure.elements.protagonist || 'You'} stood in the ordinary world, but something extraordinary was approaching.\n\n`;
  
  // Shaw's wildness
  narrative += `But this was no ordinary hero's journey. This was what Martin Shaw calls "the rough gods coming to court." The wild had business with you, and it would not be denied.\n\n`;
  
  // Hesse's depth
  narrative += `Beneath the adventure, beneath even the wildness, lay what Hesse understood: the journey to your own depths, where all seekers eventually arrive at the same eternal spring.\n\n`;
  
  // The Challenge as Teacher (All three)
  if (context.currentChallenge) {
    narrative += `Your challenge—${context.currentChallenge}—contains all three wisdoms:\n`;
    narrative += `• Campbell sees it as your call to adventure, the cave containing your treasure\n`;
    narrative += `• Shaw recognizes it as your initiation, your wound becoming medicine\n`;
    narrative += `• Hesse knows it as your koan, the paradox that will crack you open to truth\n\n`;
  }
  
  // The Transformation (Synthesized)
  if (structure.elements.transformation) {
    narrative += `${structure.elements.transformation}. This is simultaneously:\n`;
    narrative += `The hero's apotheosis, the wild's claiming, and the seeker's awakening. You are dying into life, breaking the egg of the world to be born.\n\n`;
  }
  
  // The Wisdom Teaching (United)
  narrative += `Three teachers speak as one:\n\n`;
  narrative += `Campbell: "Follow your bliss. The privilege of a lifetime is being who you are."\n`;
  narrative += `Shaw: "You are a mythic being. Court the wild, and remember your true name."\n`;
  narrative += `Hesse: "Within you is a stillness and sanctuary. The truth is lived, not taught."\n\n`;
  
  // The Return/Integration
  if (context.desiredOutcome) {
    narrative += `What you seek—${context.desiredOutcome}—is found not at journey's end but in the journeying itself. You return with Campbell's elixir, Shaw's wild honey, Hesse's inner light.\n\n`;
  }
  
  // The Closing Wisdom
  narrative += `You are the story being told. You are the myth being lived. In you, all traditions meet, all paths converge, all stories find their home.\n\n`;
  
  narrative += MASTER_STORYTELLING_WISDOM.wisdom_closings[Math.floor(Math.random() * 3)];
  
  return narrative;
}

/**
 * Select relevant Hero's Journey stages based on context
 */
private selectRelevantStages(
  context: StorytellerContext,
  allStages: string[]
): string[] {
  // Intelligent stage selection based on user's situation
  const stages: string[] = [];
  
  if (context.currentChallenge) {
    stages.push('The Call to Adventure', 'Crossing the Threshold');
  }
  
  if (context.emotionalState?.emotionalBalance.fear > 0.5) {
    stages.push('Refusal of the Call', 'Meeting the Mentor');
  }
  
  if (context.desiredOutcome?.includes('transform')) {
    stages.push('The Ordeal', 'Death and Rebirth', 'Return with the Elixir');
  }
  
  return stages.length > 0 ? stages : allStages.slice(0, 5);
}

/**
 * Enhanced story generation incorporating the master traditions
 */
private async generateEnhancedStory(
  structure: StoryStructure,
  style: NarrativeStyle,
  narrativeAnalysis: any,
  context: StorytellerContext
): Promise<{ content: string }> {
  
  let content = '';
  
  // Decide which tradition to emphasize based on analysis
  const tradition = this.mythEngine.selectTradition({
    challenge: context.currentChallenge,
    emotionalState: context.emotionalState,
    desiredOutcome: context.desiredOutcome
  });
  
  // Generate based on tradition and structure type
  if (tradition.name === CAMPBELL_TRADITION.name) {
    content = await this.generateCampbellianMyth(structure, style, context);
  } else if (tradition.name === SHAW_TRADITION.name) {
    content = await this.generateShawianWildStory(structure, style, context);
  } else if (tradition.name === HESSE_TRADITION.name) {
    content = await this.generateHessianJourney(structure, style, context);
  } else {
    // Default to synthesis of all three
    content = await this.generateMasterSynthesisStory(structure, style, context);
  }
  
  // Add teaching questions
  const questions = MASTER_STORYTELLING_WISDOM.teaching_questions;
  const relevantQuestion = questions[Math.floor(Math.random() * questions.length)];
  content += `\n\n*The story asks you: ${relevantQuestion}*`;
  
  return { content };
}