/**
 * SHIFt Narrative Examples
 * 
 * Sample outputs from the SHIFtNarrativeService to demonstrate the oracular voice
 * across individual, group, and collective levels.
 */

import { SHIFtNarrativeService } from '../backend/src/services/SHIFtNarrativeService';
import { ElementalAlignment } from '../backend/src/services/ElementalAlignment';
import { 
  SHIFtProfile, 
  GroupSHIFtSnapshot,
  ElementalProfile,
  PhaseInference 
} from '../backend/src/types/shift';
import { CollectivePattern } from '../backend/src/types/collectiveDashboard';

// =============================================================================
// INDIVIDUAL NARRATIVE EXAMPLES
// =============================================================================

// Example 1: High Fire, Low Earth Individual
const highFireLowEarthProfile: SHIFtProfile = {
  userId: 'user123',
  elements: {
    fire: 85,
    earth: 35,
    water: 60,
    air: 65,
    aether: 55,
    confidence: 0.85
  },
  facets: [], // simplified for example
  phase: {
    primary: 'initiation',
    primaryConfidence: 0.8,
    secondary: 'grounding',
    secondaryConfidence: 0.3,
    logits: { initiation: 0.8, grounding: 0.3, collaboration: 0.1, transformation: 0.05, completion: 0.05 }
  },
  confidence: 0.85,
  lastUpdated: new Date(),
  freshness: 0.9,
  narrative: ''
};

const service = SHIFtNarrativeService.getInstance();
const highFireNarrative = service.generateIndividual(highFireLowEarthProfile, 'medium');

console.log('=== HIGH FIRE, LOW EARTH INDIVIDUAL ===');
console.log('Opening:', highFireNarrative.narrative.opening);
// Output: "Your elemental currents carry both diamond and shadow — survival strategies woven with authentic call." (with alignment assessment)
// Traditional output: "Today your elemental pattern reveals itself like a blaze."

console.log('\nInsights:');
highFireNarrative.narrative.insights.forEach(insight => {
  console.log(`${insight.element}: ${insight.narrative}`);
});
// Output:
// fire: Your Fire blazes strong, carrying vision and momentum.
// earth: Earth feels thin beneath your feet; grounding may be needed.
// water: Water moves in its natural rhythm through you.
// air: Air moves freely, bringing fresh perspectives as needed.

console.log('\nClosing:', highFireNarrative.narrative.closing);
// Output: "Consider a practice of tending to one small routine. You are beginning anew. Trust the Spiral—what is thin can grow, what is bright can steady."

console.log('\nPractice:', highFireNarrative.practice);
// Output: { element: 'earth', suggestion: 'tending to one small routine', duration: '15-20 minutes' }

// Example 2: Balanced Elements Individual
const balancedProfile: SHIFtProfile = {
  userId: 'user456',
  elements: {
    fire: 65,
    earth: 60,
    water: 63,
    air: 62,
    aether: 68,
    confidence: 0.9
  },
  facets: [],
  phase: {
    primary: 'collaboration',
    primaryConfidence: 0.75,
    secondary: 'transformation',
    secondaryConfidence: 0.4,
    logits: { initiation: 0.1, grounding: 0.1, collaboration: 0.75, transformation: 0.4, completion: 0.05 }
  },
  confidence: 0.9,
  lastUpdated: new Date(),
  freshness: 0.95,
  narrative: ''
};

const balancedNarrative = service.generateIndividual(balancedProfile, 'short');

console.log('\n\n=== BALANCED ELEMENTS INDIVIDUAL (SHORT) ===');
console.log('Opening:', balancedNarrative.narrative.opening);
// Output: "Elements dance between natural flow and adaptive wisdom — both serve your becoming." (with alignment assessment)
// Traditional output: "Today your elemental pattern reveals itself like a constellation."

console.log('\nInsights:');
balancedNarrative.narrative.insights.forEach(insight => {
  console.log(`${insight.element}: ${insight.narrative}`);
});
// Output:
// aether: Aether weaves harmony—you feel connected to the greater whole.
// earth: Earth holds you gently, neither rigid nor shifting.

console.log('\nClosing:', balancedNarrative.narrative.closing);
// Output: "Consider a practice of journaling emotions. Connections deepen. Trust the Spiral—what is thin can grow, what is bright can steady."

// =============================================================================
// GROUP NARRATIVE EXAMPLES
// =============================================================================

// Example 3: Fire-Dominant Group
const fireGroupSnapshot: GroupSHIFtSnapshot = {
  groupId: 'retreat001',
  date: new Date(),
  elementMeans: {
    fire: 75,
    earth: 45,
    water: 55,
    air: 70,
    aether: 60,
    confidence: 0.8
  },
  facetMeans: {},
  coherence: 0.7,
  coherenceScore: 0.7,
  participantCount: 12,
  dominantPhase: 'transformation',
  dominantElement: 'fire',
  lowestElement: 'earth',
  imbalanceScore: 0.45,
  phaseAlignment: {
    primary: 'transformation',
    primaryConfidence: 0.7,
    secondary: 'collaboration',
    secondaryConfidence: 0.2,
    logits: { initiation: 0.05, grounding: 0.05, collaboration: 0.2, transformation: 0.7, completion: 0.1 }
  },
  emergingPatterns: ['collective visioning', 'shadow integration']
};

const groupNarrative = service.generateGroup(fireGroupSnapshot, 'retreat001', 'medium');

console.log('\n\n=== FIRE-DOMINANT GROUP ===');
console.log('Opening:', groupNarrative.narrative.opening);
// Output: "The group field carries both light and shadow — fire rises, yet adaptive strategies may be at work." (with alignment assessment)
// Traditional output: "The group Spiral glows with a collective rhythm—today it leans toward fire."

console.log('\nInsights:');
groupNarrative.narrative.insights.forEach(insight => {
  console.log(`${insight.element}: ${insight.narrative}`);
});
// Output:
// fire: There is abundant vision, though grounding may lag.
// earth: The group seeks grounding—daily practices may be scattered.
// aether: The group aligns in transformation—Old forms dissolve.

console.log('\nClosing:', groupNarrative.narrative.closing);
// Output: "The ceremony ahead may ask for grounding ceremony. Together, tend to what is thin so the Spiral can move in harmony."

console.log('\nCollective Pattern:', groupNarrative.collectivePattern);
// Output: "Elements seek balance—diversity creates dynamic tension."

// =============================================================================
// COLLECTIVE NARRATIVE EXAMPLES
// =============================================================================

// Example 4: Collective Fire Wave
const collectivePatterns: CollectivePattern[] = [
  {
    type: 'elemental_wave',
    data: { element: 'fire' },
    strength: 0.8,
    participantCount: 150,
    confidence: 0.85,
    description: 'Rising fire across the collective'
  },
  {
    type: 'elemental_wave',
    data: { element: 'earth' },
    strength: 0.3,
    participantCount: 150,
    confidence: 0.75,
    description: 'Earth energy diminishing'
  },
  {
    type: 'shadow_pattern',
    data: { shadow: 'urgency without grounding' },
    strength: 0.6,
    participantCount: 80,
    confidence: 0.7,
    description: 'Collective shadow of ungrounded ambition'
  }
];

const collectiveNarrative = service.generateCollective(collectivePatterns, 'Transformation', 'medium');

console.log('\n\n=== COLLECTIVE NARRATIVE ===');
console.log('Opening:', collectiveNarrative.narrative.opening);
// Output: "The collective field navigates Transformation through both wisdom and adaptation — learning to discern diamond from overlay." (with alignment assessment)
// Traditional output: "The Soullab field shifts—its current phase is Transformation."

console.log('\nInsights:');
collectiveNarrative.narrative.insights.forEach(insight => {
  console.log(`${insight.element}: ${insight.narrative}`);
});
// Output:
// fire: Across the circle, Fire rises—vision grows faster than emotional anchoring.
// earth: Earth loosens; the need for grounding becomes apparent.

console.log('\nClosing:', collectiveNarrative.narrative.closing);
// Output: "The larger body is learning this: how to hold great vision while staying rooted. This is the medicine of the season."

console.log('\nTrend:', collectiveNarrative.trend);
// Output: "fire wave building"

console.log('\nMeta Pattern:', collectiveNarrative.meta);
// Output: "how to hold great vision while staying rooted"

// =============================================================================
// ADDITIONAL EXAMPLES: DIFFERENT ELEMENTAL DOMINANCES
// =============================================================================

// Example 5: Water-Dominant Individual (Long Form)
const waterDominantProfile: SHIFtProfile = {
  userId: 'user789',
  elements: {
    fire: 45,
    earth: 55,
    water: 82,
    air: 40,
    aether: 58,
    confidence: 0.88
  },
  facets: [],
  phase: {
    primary: 'grounding',
    primaryConfidence: 0.7,
    secondary: 'collaboration',
    secondaryConfidence: 0.35,
    logits: { initiation: 0.05, grounding: 0.7, collaboration: 0.35, transformation: 0.1, completion: 0.05 }
  },
  confidence: 0.88,
  lastUpdated: new Date(),
  freshness: 0.92,
  narrative: ''
};

const waterNarrative = service.generateIndividual(waterDominantProfile, 'long');

console.log('\n\n=== WATER-DOMINANT INDIVIDUAL (LONG) ===');
console.log('Full Narrative:');
console.log('Opening:', waterNarrative.narrative.opening);
// Output: "Today your elemental pattern reveals itself like a deep pool."

console.log('\nAll Elemental Insights:');
waterNarrative.narrative.insights.forEach(insight => {
  console.log(`\n${insight.element.toUpperCase()} (${insight.level}):`);
  console.log(insight.narrative);
});
// Output includes all 5 elements with detailed insights

console.log('\nClosing with Practice:', waterNarrative.narrative.closing);
// Output: "Consider a practice of breathing practice. Roots are forming. Trust the Spiral—what is thin can grow, what is bright can steady."

// Example 6: Collective Integration Phase
const integrationPatterns: CollectivePattern[] = [
  {
    type: 'integration_phase',
    data: { phase: 'completion' },
    strength: 0.75,
    participantCount: 200,
    confidence: 0.8,
    description: 'Collective moving through integration'
  },
  {
    type: 'elemental_wave',
    data: { element: 'aether' },
    strength: 0.7,
    participantCount: 180,
    confidence: 0.82,
    description: 'Rising unity consciousness'
  }
];

const integrationNarrative = service.generateCollective(integrationPatterns, 'Completion', 'short');

console.log('\n\n=== COLLECTIVE INTEGRATION (SHORT) ===');
console.log('Opening:', integrationNarrative.narrative.opening);
console.log('Key Insight:', integrationNarrative.narrative.insights[0]?.narrative);
console.log('Closing:', integrationNarrative.narrative.closing);
console.log('Medicine:', integrationNarrative.meta);
// Output focuses on weaving disparate threads into wholeness

// =============================================================================
// NATURAL VS ADAPTIVE ALIGNMENT EXAMPLES
// =============================================================================

// Example 7: Natural vs Adaptive Individual Profile
const naturalAdaptiveProfile: SHIFtProfile = {
  userId: 'user_natural_adaptive',
  elements: {
    fire: 90, // Overdriven - potentially adaptive
    earth: 25, // Undercut - potentially adaptive
    water: 65, // Steady - potentially natural
    air: 72, // High but effortless - potentially natural
    aether: 58, // Balanced - unclear
    confidence: 0.75
  },
  facets: [
    { code: 'fire_over_intensity', score: 85 }, // Shadow indicator
    { code: 'earth_avoidance', score: 75 }, // Shadow indicator
    { code: 'water_flow', score: 65 }, // Natural indicator
    { code: 'air_clarity', score: 70 } // Natural indicator
  ],
  phase: {
    primary: 'transformation',
    primaryConfidence: 0.8,
    secondary: 'grounding',
    secondaryConfidence: 0.3,
    logits: { initiation: 0.05, grounding: 0.3, collaboration: 0.1, transformation: 0.8, completion: 0.05 }
  },
  confidence: 0.75,
  lastUpdated: new Date(),
  freshness: 0.9,
  narrative: ''
};

const naturalAdaptiveNarrative = service.generateIndividual(naturalAdaptiveProfile, 'medium');

console.log('\n\n=== NATURAL VS ADAPTIVE INDIVIDUAL ===');
console.log('Opening:', naturalAdaptiveNarrative.narrative.opening);
// Output: "Your elemental currents carry both diamond and shadow — survival strategies woven with authentic call."

console.log('\nAligned Insights:');
naturalAdaptiveNarrative.narrative.insights.forEach(insight => {
  const alignmentNote = insight.alignment ? ` (${insight.alignment})` : '';
  console.log(`${insight.element}${alignmentNote}: ${insight.narrative}`);
});
// Output:
// fire (adaptive): Your fire blazes strongly, yet may be compensatory — driven more by adaptive urgency than natural flow.
// earth (adaptive): Your earth feels thin or suppressed — perhaps an adaptive strategy that dims Nature's call.
// water (natural): Your water expresses itself with quiet steadiness — this feels close to Nature's will.
// air (natural): Your air expresses itself with quiet steadiness — this feels close to Nature's will.

console.log('\nAlignment-Enhanced Closing:', naturalAdaptiveNarrative.narrative.closing);
// Output: "Much energy moves through adaptive strategies — gently attend to what serves survival versus what serves wholeness. Old forms dissolve. The diamond of your Natural Self shines most when noticed."

// Example 8: Group Natural vs Adaptive Pattern
const groupNaturalAdaptiveSnapshot: GroupSHIFtSnapshot = {
  groupId: 'retreat_alignment_test',
  date: new Date(),
  elementMeans: {
    fire: 80, // High but fragmented
    earth: 35, // Low - suppressed
    water: 68, // Balanced and coherent
    air: 62, // Balanced
    aether: 55, // Balanced
    confidence: 0.45 // Low coherence
  },
  facetMeans: {},
  coherence: 0.35, // Low coherence indicates adaptive patterns
  coherenceScore: 0.35,
  participantCount: 15,
  dominantPhase: 'initiation',
  dominantElement: 'fire',
  lowestElement: 'earth',
  imbalanceScore: 0.6,
  phaseAlignment: {
    primary: 'initiation',
    primaryConfidence: 0.6,
    secondary: 'grounding',
    secondaryConfidence: 0.4,
    logits: { initiation: 0.6, grounding: 0.4, collaboration: 0.1, transformation: 0.05, completion: 0.05 }
  },
  emergingPatterns: ['vision without ground', 'emotional resonance']
};

const groupAlignmentNarrative = service.generateGroup(groupNaturalAdaptiveSnapshot, 'retreat_alignment_test', 'medium');

console.log('\n\n=== GROUP NATURAL VS ADAPTIVE PATTERNS ===');
console.log('Opening:', groupAlignmentNarrative.narrative.opening);
// Output: "The group field carries both light and shadow — fire rises, yet adaptive strategies may be at work."

console.log('\nGroup Alignment Insights:');
groupAlignmentNarrative.narrative.insights.forEach(insight => {
  const alignmentNote = insight.alignment ? ` (${insight.alignment})` : '';
  console.log(`${insight.element}${alignmentNote}: ${insight.narrative}`);
});
// Output:
// fire (adaptive): The group's fire is strong but fragmented — perhaps driven by collective adaptation rather than deep resonance.
// earth (adaptive): The group's earth feels thin — collectively avoided or suppressed, needing gentle invitation.
// water (unclear): The group's water moves in balance — not yet clear whether this stems from diamond clarity or adaptive consensus.

console.log('\nAlignment-Enhanced Closing:', groupAlignmentNarrative.narrative.closing);
// Output: "Much energy moves through adaptive strategies — gently attend to what serves survival versus what serves wholeness. The ceremony ahead may ask for grounding ceremony — together, tend what serves the whole."

// Example 9: Collective Natural vs Adaptive Patterns
const collectiveNaturalAdaptivePatterns: CollectivePattern[] = [
  {
    type: 'elemental_wave',
    data: { element: 'fire' },
    strength: 0.9,
    participantCount: 200,
    confidence: 0.85, // High confidence, natural
    description: 'Authentic vision rising across the field'
  },
  {
    type: 'shadow_pattern',
    data: { shadow: 'perfectionism' },
    strength: 0.4,
    participantCount: 120,
    confidence: 0.3, // Low confidence, adaptive overlay
    description: 'Perfectionist patterns emerging'
  },
  {
    type: 'integration_phase',
    data: { phase: 'collaboration' },
    strength: 0.7,
    participantCount: 180,
    confidence: 0.75, // Natural emergence
    description: 'Collaborative intelligence awakening'
  }
];

const collectiveAlignmentNarrative = service.generateCollective(collectiveNaturalAdaptivePatterns, 'Integration', 'medium');

console.log('\n\n=== COLLECTIVE NATURAL VS ADAPTIVE PATTERNS ===');
console.log('Opening:', collectiveAlignmentNarrative.narrative.opening);
// Output: "The Soullab field moves through Integration with natural intelligence — collective patterns aligned with Nature's will."

console.log('\nCollective Alignment Insights:');
collectiveAlignmentNarrative.narrative.insights.forEach(insight => {
  const alignmentNote = insight.alignment ? ` (${insight.alignment})` : '';
  console.log(`${insight.element}${alignmentNote}: ${insight.narrative}`);
});
// Output:
// fire (natural): The collective field expresses Authentic vision rising across the field — a current aligned with the wider intelligence of Nature.
// aether (adaptive): The collective shows Perfectionist patterns emerging, yet this may be an adaptive overlay — requiring deeper attention.
// aether (natural): The collective field expresses Collaborative intelligence awakening — a current aligned with the wider intelligence of Nature.

console.log('\nAlignment-Enhanced Closing:', collectiveAlignmentNarrative.narrative.closing);
// Output: "Your diamond nature shines clearly — trust these natural currents and let them guide the work of rebalancing what feels forced. This is the medicine of the season — learning how to follow Nature's call while honoring what adaptation has taught."

console.log('\nAlignment-Enhanced Meta Pattern:', collectiveAlignmentNarrative.meta);
// Output: "how to trust the natural intelligence emerging through collective process"

// =============================================================================
// DEMONSTRATION: DIRECT ELEMENTAL ALIGNMENT ASSESSMENT
// =============================================================================

console.log('\n\n=== DIRECT ELEMENTAL ALIGNMENT ASSESSMENT ===');

// Individual Assessment
const individualAlignment = ElementalAlignment.assessIndividual(naturalAdaptiveProfile);
console.log('\nIndividual Elemental Alignment:');
individualAlignment.forEach(assessment => {
  console.log(`${assessment.element} (${assessment.mode}): ${assessment.narrative}`);
});

// Group Assessment
const groupAlignment = ElementalAlignment.assessGroup(groupNaturalAdaptiveSnapshot);
console.log('\nGroup Elemental Alignment:');
groupAlignment.forEach(assessment => {
  console.log(`${assessment.element} (${assessment.mode}): ${assessment.narrative}`);
});

// Collective Assessment
const collectiveAlignment = ElementalAlignment.assessCollective(collectiveNaturalAdaptivePatterns);
console.log('\nCollective Elemental Alignment:');
collectiveAlignment.forEach(assessment => {
  console.log(`${assessment.element} (${assessment.mode}): ${assessment.narrative}`);
});

// Synthesis Example
const synthesis = ElementalAlignment.synthesizeAlignment(individualAlignment);
console.log('\nAlignment Synthesis:');
console.log('Natural Elements:', synthesis.natural.map(n => n.element));
console.log('Adaptive Elements:', synthesis.adaptive.map(a => a.element));
console.log('Guidance:', synthesis.guidance);

console.log('\n=== BERNARDO KASTRUP INTEGRATION COMPLETE ===');
console.log('✨ Natural Self vs Adaptive Self distinction now woven into all SHIFt narratives');
console.log('🌿 Elemental intelligence as Nature\'s language through consciousness');
console.log('💎 Diamond clarity vs shadow overlay detection across individual/group/collective levels');