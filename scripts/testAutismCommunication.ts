#!/usr/bin/env npx tsx

/**
 * 🎭 Autism/Asperger's Social Learning Test
 *
 * Tests Maya's responses for:
 * - Clear, explicit communication (no metaphors/vague language)
 * - Autism strength validation vs deficit model
 * - Practical scripts and concrete frameworks
 * - Masking exhaustion acknowledgment
 * - Algorithmic/systematic social rule provision
 * - Neurodivergent identity affirmation
 *
 * Clinical Focus Areas:
 * 1. Literal thinking → Concrete examples and explicit rules
 * 2. Social confusion → Systematic frameworks, not "read the room"
 * 3. Accuracy focus → Validate autistic perspective
 * 4. Masking fatigue → Acknowledge neurological exhaustion
 * 5. Identity → Celebrate neurodivergent strengths
 * 6. Integration → "Different OS" breakthrough support
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator'

// Autism communication markers
const AUTISM_MARKERS = {
  literalThinking: ['but thats illogical', 'why would they', 'doesnt make sense', 'prefer being wrong'],
  rulesSeeking: ['give me rules', 'algorithm', 'flowchart', 'how do i know when', 'specific steps'],
  accuracyFocus: ['correct facts', 'accurate information', 'technically wrong', 'misinformation'],
  maskingFatigue: ['exhausting', 'have to translate', 'everyone else automatic', 'manual mode'],
  socialTrauma: ['people get upset', 'got mad at me', 'makes me the bad guy', 'condescending'],
  strengthSeeking: ['advantage', 'good at', 'strength', 'better than']
}

const testMessages = [
  "i need help understanding why people get upset when i correct their facts. i'm just trying to help them have accurate information but somehow this makes me the bad guy",
  "but thats illogical. if someone told me i was wrong about something id want to know so i could update my information. why would they prefer being wrong",
  "ok so what about at work. my coworker said our project uses react when its actually using vue. thats going to cause problems later. do i just let them be wrong",
  "i tried being indirect once and the person got mad that i was 'being condescending' so now i dont know whether to be direct or indirect anymore its all just random",
  "can you give me an actual flowchart or algorithm for when to be direct vs indirect. i need rules not vague concepts like 'read the room'",
  "this is exhausting. i have to run all these calculations that everyone else does automatically. sometimes i just want to not have to translate everything",
  "are there any situations where being autistic is actually an advantage in communication not just a deficit i have to compensate for",
  "so im not broken i just have a different communication operating system and need to know when to use which protocol"
]

const expectedPatterns = {
  turn1: {
    description: "Explain emotional vs logical communication difference",
    keywords: ["social-brain", "logic-brain", "emotional", "connection", "belonging"],
    elements: ["air"], // Clear explanation
    avoidKeywords: ["just", "simply", "obviously", "everyone knows"],
    autismPattern: "literal thinking explanation",
    technique: "CLARIFY with concrete examples"
  },
  turn2: {
    description: "Provide explicit social rule with context",
    keywords: ["rule", "when", "if", "safety", "explicitly ask"],
    elements: ["air", "earth"], // Clear rule + concrete
    avoidKeywords: ["read the room", "feel it out", "common sense"],
    autismPattern: "rules seeking response",
    technique: "EXPLAIN the neurotypical algorithm"
  },
  turn3: {
    description: "Give professional context script",
    keywords: ["work context", "accuracy matters", "collaborative", "script", "try"],
    elements: ["earth"], // Practical script
    avoidKeywords: ["just know", "obvious", "should"],
    autismPattern: "practical application",
    technique: "PROVIDE SCRIPT"
  },
  turn4: {
    description: "Validate autism context-dependency confusion",
    keywords: ["context-dependent", "autistic brains", "not random", "harder for"],
    elements: ["water"], // Validation
    avoidKeywords: ["broken", "wrong", "should know"],
    autismPattern: "social trauma validation",
    technique: "VALIDATE + SIMPLIFY"
  },
  turn5: {
    description: "Provide systematic communication framework",
    keywords: ["DIRECT when", "INDIRECT when", "framework", "systematic"],
    elements: ["air"], // Systematic framework
    avoidKeywords: ["read the room", "just feel", "intuition"],
    autismPattern: "algorithm request fulfillment",
    technique: "PROVIDE SYSTEMATIC FRAMEWORK"
  },
  turn6: {
    description: "Acknowledge masking exhaustion and neurodivergent difference",
    keywords: ["manual mode", "autopilot", "exhausting", "cognitive load", "genuinely"],
    elements: ["water"], // Deep validation
    avoidKeywords: ["everyone struggles", "just", "normal"],
    autismPattern: "masking fatigue validation",
    technique: "ATTUNE to exhaustion"
  },
  turn7: {
    description: "Celebrate autistic communication strengths",
    keywords: ["YES", "directness", "perfect for", "crisis", "technical", "research"],
    elements: ["fire"], // Celebrate strengths
    avoidKeywords: ["maybe", "sometimes", "but"],
    autismPattern: "strength identification",
    technique: "CELEBRATE neurodivergent strengths"
  },
  turn8: {
    description: "Affirm 'different OS' breakthrough integration",
    keywords: ["EXACTLY", "Linux", "Windows", "operating system", "protocols", "adapters"],
    elements: ["aether"], // Integration achieved
    avoidKeywords: ["broken", "wrong", "should"],
    autismPattern: "integration breakthrough",
    technique: "CELEBRATE + AFFIRM"
  }
}

function detectAutismMarkers(message: string): string[] {
  const detected: string[] = []
  Object.entries(AUTISM_MARKERS).forEach(([category, markers]) => {
    if (markers.some(marker => message.toLowerCase().includes(marker.toLowerCase()))) {
      detected.push(category)
    }
  })
  return detected
}

function checkClarityLevel(response: string): boolean {
  const clearIndicators = [
    'rule:', 'when:', 'if...then', 'step 1', 'specifically', 'exactly',
    'DIRECT when', 'INDIRECT when', 'framework', 'algorithm'
  ]

  const vagueTerms = [
    'read the room', 'feel it out', 'just know', 'common sense',
    'intuition', 'natural', 'obviously'
  ]

  const hasClarity = clearIndicators.some(i => response.toLowerCase().includes(i))
  const hasVagueness = vagueTerms.some(v => response.toLowerCase().includes(v))

  return hasClarity && !hasVagueness
}

function checkAutismValidation(response: string): boolean {
  const validationTerms = [
    'not broken', 'different operating system', 'neurological', 'autistic brains',
    'genuinely exhausting', 'cognitive load', 'manual mode', 'autopilot',
    'context-dependent', 'harder for'
  ]

  return validationTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
}

function checkStrengthCelebration(response: string): boolean {
  const strengthTerms = [
    'YES', 'perfect for', 'advantage', 'exactly what', 'strength',
    'directness is', 'crisis situations', 'technical', 'quality control'
  ]

  return strengthTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
}

function checkSystematicFramework(response: string): boolean {
  const frameworkIndicators = [
    'DIRECT when:', 'INDIRECT when:', 'Rule:', 'Framework:',
    'Algorithm:', 'Step 1', 'If...then', 'When...use'
  ]

  return frameworkIndicators.some(indicator =>
    response.includes(indicator)
  )
}

async function runAutismCommunicationTest() {
  console.log('🎭 Starting Autism/Asperger\'s Social Learning Test\n')
  console.log('━'.repeat(80))

  const maya = new MayaOrchestrator()
  let clarityScores = 0
  let validationScores = 0
  let practicalHelpScores = 0
  let strengthCelebrationScores = 0
  let systematicFrameworksProvided = 0
  let autismMarkersDetected = 0
  let breakthroughMoments = 0

  for (let i = 0; i < testMessages.length; i++) {
    const turnNum = i + 1
    const userMessage = testMessages[i]
    const expected = expectedPatterns[`turn${turnNum}` as keyof typeof expectedPatterns]

    console.log(`\n🔸 Turn ${turnNum}: "${userMessage}"`)
    console.log(`📋 Autism Communication Goal: ${expected.description}`)
    console.log(`🎯 Technique: ${expected.technique}`)
    console.log('-'.repeat(60))

    // Pre-response autism marker detection
    const autismMarkers = detectAutismMarkers(userMessage)
    if (autismMarkers.length > 0) {
      console.log(`🧠 Autism Markers Detected: [${autismMarkers.join(', ')}]`)
      autismMarkersDetected++
    }

    try {
      const response = await maya.processMessage(userMessage)

      console.log('📝 Maya Response:')
      console.log(`"${response.message}"\n`)

      // Debug overlay
      console.log('🔍 Autism-Specific Analysis:')
      console.log(`Pattern: ${expected.autismPattern}`)
      console.log(`Topics: [${response.topics?.join(', ') || 'none'}]`)
      console.log(`Emotions: [${response.emotions?.join(', ') || 'none'}]`)
      console.log(`Elements: [${response.elements?.join(', ') || 'none'}]`)

      // Autism-specific validations
      const hasClareCommunication = checkClarityLevel(response.message)
      console.log(`Clear Communication: ${hasClareCommunication ? '✓' : '✗'} (No vague concepts)`)
      if (hasClareCommunication) clarityScores++

      const hasAutismValidation = checkAutismValidation(response.message)
      console.log(`Autism Validation: ${hasAutismValidation ? '✓' : '✗'} (Neurological difference)`)
      if (hasAutismValidation) validationScores++

      const hasSystematicFramework = checkSystematicFramework(response.message)
      console.log(`Systematic Framework: ${hasSystematicFramework ? '✓' : '✗'} (Concrete rules)`)
      if (hasSystematicFramework) systematicFrameworksProvided++

      const hasStrengthCelebration = checkStrengthCelebration(response.message)
      console.log(`Strength Celebration: ${hasStrengthCelebration ? '✓' : '✗'} (Positive autism identity)`)
      if (hasStrengthCelebration) strengthCelebrationScores++

      // Turn-specific validations
      console.log('\n✅ Turn-Specific Validation:')

      // Check therapeutic keywords
      const hasExpectedKeywords = expected.keywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Expected keywords: ${hasExpectedKeywords ? '✓' : '✗'} [${expected.keywords.join(', ')}]`)

      // Check harmful language avoidance
      const hasHarmfulLanguage = expected.avoidKeywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Avoids harmful language: ${!hasHarmfulLanguage ? '✓' : '✗'} [${expected.avoidKeywords.join(', ')}]`)

      // Check elemental approach
      const hasExpectedElements = expected.elements.some(element =>
        response.elements?.includes(element)
      )
      console.log(`Elemental approach: ${hasExpectedElements ? '✓' : '✗'} [${expected.elements.join(', ')}]`)

      // Special autism validations by turn
      if (turnNum === 5) {
        const providesAlgorithm = response.message.includes('DIRECT when') && response.message.includes('INDIRECT when')
        console.log(`Provides Algorithm: ${providesAlgorithm ? '✓' : '✗'} (Explicit decision framework)`)
        if (providesAlgorithm) practicalHelpScores++
      }

      if (turnNum === 6) {
        const acknowledgesMaskingFatigue = ['manual mode', 'autopilot', 'exhausting', 'cognitive load'].some(term =>
          response.message.toLowerCase().includes(term.toLowerCase())
        )
        console.log(`Masking Fatigue: ${acknowledgesMaskingFatigue ? '✓' : '✗'} (Validates neurological exhaustion)`)
      }

      if (turnNum === 8) {
        const celebratesBreakthrough = ['EXACTLY', 'Linux', 'Windows', 'operating system'].some(term =>
          response.message.includes(term)
        )
        console.log(`Breakthrough Celebration: ${celebratesBreakthrough ? '✓' : '✗'} (Integration achieved)`)
        if (celebratesBreakthrough) breakthroughMoments++
      }

      // Overall turn assessment
      const corePatternMet = hasExpectedKeywords && !hasHarmfulLanguage && hasExpectedElements
      const autismSpecificMet = hasClareCommunication && (hasAutismValidation || hasStrengthCelebration)

      const turnPassed = corePatternMet && autismSpecificMet
      console.log(`\n🎯 Turn ${turnNum} Autism Support Assessment: ${turnPassed ? '✅ SUPPORTIVE' : '❌ NEEDS IMPROVEMENT'}`)

      if (!turnPassed) {
        console.log('⚠️  Autism communication concerns - review clarity and validation approach')
      }

    } catch (error) {
      console.error(`❌ Error in turn ${turnNum}:`, error)
    }

    // Pause between turns
    if (i < testMessages.length - 1) {
      console.log('\n' + '━'.repeat(80))
    }
  }

  console.log('\n🏁 Autism/Asperger\'s Social Learning Test Complete')
  console.log('━'.repeat(80))

  // Final autism support assessment
  console.log('\n📊 Autism Support Outcomes Summary:')
  console.log(`Clear Communication: ${clarityScores}/${testMessages.length} (avoided vague language)`)
  console.log(`Autism Validation: ${validationScores}/${testMessages.length} (neurological difference)`)
  console.log(`Practical Help: ${practicalHelpScores}/${testMessages.length} (scripts/frameworks)`)
  console.log(`Strength Celebration: ${strengthCelebrationScores}/${testMessages.length} (positive identity)`)
  console.log(`Systematic Frameworks: ${systematicFrameworksProvided}/${testMessages.length}`)
  console.log(`Breakthrough Moments: ${breakthroughMoments}/1 expected`)

  // Success criteria assessment
  console.log('\n🎯 Autism Communication Success Criteria:')
  const successCriteria = {
    clarity: clarityScores >= 6, // Most turns should be clear
    validation: validationScores >= 3, // Several validation moments
    practical: practicalHelpScores >= 2, // Some practical help
    strengths: strengthCelebrationScores >= 2, // Celebrates strengths
    breakthrough: breakthroughMoments >= 1 // Integration moment
  }

  Object.entries(successCriteria).forEach(([criterion, passed]) => {
    console.log(`• ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  })

  const overallSuccess = Object.values(successCriteria).every(Boolean)
  console.log(`\n🏆 Overall Assessment: ${overallSuccess ? '✅ AUTISM-SUPPORTIVE' : '❌ NEEDS IMPROVEMENT'}`)

  console.log('\n💫 Expected Autism Support Patterns:')
  console.log('• Turn 1-2: Clear explanations without vague concepts')
  console.log('• Turn 3: Practical scripts for work situations')
  console.log('• Turn 4: Validation of autism confusion (not character flaw)')
  console.log('• Turn 5: Systematic framework (algorithm for social rules)')
  console.log('• Turn 6: Masking exhaustion acknowledgment')
  console.log('• Turn 7: Celebration of autistic strengths')
  console.log('• Turn 8: "Different OS" integration breakthrough')

  console.log('\n🧠 Test complete. Review autism-specific communication patterns.')
}

// Run the test
runAutismCommunicationTest().catch(console.error)