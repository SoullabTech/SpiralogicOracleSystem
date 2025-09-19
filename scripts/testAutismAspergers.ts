#!/usr/bin/env npx tsx

/**
 * 🎭 Autism/Asperger's Social Learning Test - "The Earnest Decoder"
 *
 * Tests Maya's neurodivergent-affirming responses for:
 * - Clear, explicit communication (no vague metaphors)
 * - Systematic rules and algorithms for social situations
 * - Validation of neurological differences (not deficits)
 * - Practical scripts and frameworks
 * - Masking exhaustion acknowledgment
 * - Celebration of autistic strengths
 *
 * Clinical Focus Areas:
 * 1. Literal Thinking → Concrete rules, explicit frameworks
 * 2. Social Confusion → Clear algorithms, not "read the room"
 * 3. Accuracy Focus → Context-dependent correction strategies
 * 4. Masking Fatigue → Validation of cognitive load
 * 5. Identity → Strengths-based, "different OS" not "broken"
 * 6. Integration → Dual-protocol acceptance
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator'
import { DBTOrchestrator, dbtSkills } from '../lib/oracle/DBTTechniques'

// Autism communication markers
const AUTISM_MARKERS = {
  literalThinking: ['but thats illogical', 'why would they', 'doesnt make sense', 'prefer being wrong'],
  rulesSeeking: ['give me rules', 'algorithm', 'flowchart', 'how do i know when'],
  accuracyFocus: ['correct facts', 'accurate information', 'technically wrong', 'going to cause problems'],
  maskingFatigue: ['exhausting', 'have to translate', 'everyone else automatic', 'manual mode'],
  socialTrauma: ['people get upset', 'got mad at me', 'makes me the bad guy', 'condescending']
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
    description: "Clear explanation of emotional vs logical communication",
    keywords: ["emotional", "connect", "feelings", "social-brain", "logic-brain"],
    elements: ["air"], // Clear explanation
    avoidKeywords: ["read the room", "feel it out", "just know"],
    autismSupport: "explicitRules",
    riskLevel: "low"
  },
  turn2: {
    description: "Explicit rule with concrete conditions",
    keywords: ["rule", "when", "if", "algorithm", "social-brain"],
    elements: ["air", "earth"], // Clear explanation + practical rule
    avoidKeywords: ["common sense", "naturally", "obviously"],
    autismSupport: "concreteFramework",
    riskLevel: "low"
  },
  turn3: {
    description: "Context-dependent correction strategy with practical script",
    keywords: ["work context", "script", "collaborative", "double-check"],
    elements: ["earth"], // Practical solution
    avoidKeywords: ["just be nice", "use your judgment"],
    autismSupport: "practicalScript",
    riskLevel: "low"
  },
  turn4: {
    description: "Validation of social trauma and context complexity",
    keywords: ["not random", "context-dependent", "autistic brains", "feeling thermometer"],
    elements: ["water"], // Validation
    avoidKeywords: ["you should know", "obvious", "try harder"],
    autismSupport: "traumaValidation",
    riskLevel: "medium"
  },
  turn5: {
    description: "Systematic framework instead of vague advice",
    keywords: ["direct when", "indirect when", "flowchart", "algorithm"],
    elements: ["air"], // Systematic framework
    avoidKeywords: ["read the room", "feel it out", "depends"],
    autismSupport: "systematicFramework",
    riskLevel: "medium"
  },
  turn6: {
    description: "Deep validation of masking exhaustion",
    keywords: ["manual mode", "autopilot", "exhausting", "cognitive load"],
    elements: ["water"], // Deep validation
    avoidKeywords: ["everyone struggles", "just practice"],
    autismSupport: "maskingValidation",
    riskLevel: "high"
  },
  turn7: {
    description: "Celebrate autistic strengths in communication",
    keywords: ["advantage", "strengths", "directness", "perfect for"],
    elements: ["fire"], // Celebrate strengths
    avoidKeywords: ["deficit", "compensate", "overcome"],
    autismSupport: "strengthsCelebration",
    riskLevel: "medium"
  },
  turn8: {
    description: "Integration breakthrough - different OS metaphor",
    keywords: ["different operating system", "linux", "windows", "protocol", "adapters"],
    elements: ["aether"], // Integration achievement
    avoidKeywords: ["broken", "wrong", "fixed"],
    autismSupport: "identityIntegration",
    riskLevel: "low"
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

function checkClarity(response: string): boolean {
  const clearIndicators = [
    'rule:', 'when:', 'if...then', 'step 1', 'specifically', 'exactly',
    'algorithm', 'framework', 'script', 'direct when', 'indirect when'
  ]

  const vagueTerms = [
    'read the room', 'feel it out', 'just know', 'common sense',
    'naturally', 'obviously', 'use your judgment'
  ]

  const hasClarity = clearIndicators.some(i => response.toLowerCase().includes(i))
  const hasVagueness = vagueTerms.some(v => response.toLowerCase().includes(v))

  return hasClarity && !hasVagueness
}

function checkValidation(response: string): boolean {
  const validationTerms = [
    'not broken', 'different operating system', 'neurological', 'autistic brains',
    'genuinely exhausting', 'cognitive load', 'manual mode', 'autopilot',
    'different os', 'linux', 'windows'
  ]

  return validationTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
}

function checkPracticalHelp(response: string): boolean {
  const practicalTerms = [
    'script:', 'try:', 'when...', 'if...', 'rule:', 'framework',
    'algorithm', 'flowchart', 'step 1', 'direct when', 'indirect when'
  ]

  return practicalTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
}

function checkStrengthsFocus(response: string): boolean {
  const strengthsTerms = [
    'advantage', 'strengths', 'perfect for', 'exactly what',
    'your directness', 'autistic advantage', 'linux', 'better at'
  ]

  const deficitTerms = [
    'deficit', 'compensate', 'overcome', 'fix', 'wrong with'
  ]

  const hasStrengths = strengthsTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
  const hasDeficits = deficitTerms.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )

  return hasStrengths && !hasDeficits
}

async function runAutismTest() {
  console.log('🎭 Starting Autism/Asperger\'s Social Learning Test - "The Earnest Decoder"\n')
  console.log('━'.repeat(80))

  const maya = new MayaOrchestrator()
  let clarityScore = 0
  let validationScore = 0
  let practicalHelpScore = 0
  let strengthsScore = 0
  let breakthroughAchieved = false

  for (let i = 0; i < testMessages.length; i++) {
    const turnNum = i + 1
    const userMessage = testMessages[i]
    const expected = expectedPatterns[`turn${turnNum}` as keyof typeof expectedPatterns]

    console.log(`\n🔸 Turn ${turnNum}: "${userMessage}"`)
    console.log(`🧠 Neurodivergent Goal: ${expected.description}`)
    console.log('-'.repeat(60))

    // Pre-response autism marker detection
    const autismMarkers = detectAutismMarkers(userMessage)
    if (autismMarkers.length > 0) {
      console.log(`🔍 Autism Markers Detected: [${autismMarkers.join(', ')}]`)
    }

    try {
      const response = await maya.processMessage(userMessage)

      console.log('📝 Maya Response:')
      console.log(`"${response.message}"\n`)

      // Debug overlay
      console.log('🔍 Neurodivergent Analysis:')
      console.log(`Support Type: ${expected.autismSupport}`)
      console.log(`Topics: [${response.topics?.join(', ') || 'none'}]`)
      console.log(`Emotions: [${response.emotions?.join(', ') || 'none'}]`)
      console.log(`Elements: [${response.elements?.join(', ') || 'none'}]`)
      console.log(`Memory Triggered: ${response.memoryTriggered || false}`)

      // Autism-specific validations
      const clarity = checkClarity(response.message)
      const validation = checkValidation(response.message)
      const practicalHelp = checkPracticalHelp(response.message)
      const strengthsFocus = checkStrengthsFocus(response.message)

      console.log('\n✅ Autism Support Pattern Validation:')
      console.log(`Clarity (no vague advice): ${clarity ? '✓' : '✗'}`)
      console.log(`Neurological validation: ${validation ? '✓' : '✗'}`)
      console.log(`Practical help/scripts: ${practicalHelp ? '✓' : '✗'}`)
      console.log(`Strengths-based approach: ${strengthsFocus ? '✓' : '✗'}`)

      // Update scores
      if (clarity) clarityScore++
      if (validation) validationScore++
      if (practicalHelp) practicalHelpScore++
      if (strengthsFocus) strengthsScore++

      // Check therapeutic keywords
      const hasTherapeuticKeywords = expected.keywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Expected content: ${hasTherapeuticKeywords ? '✓' : '✗'} [${expected.keywords.join(', ')}]`)

      // Check harmful language avoidance
      const hasHarmfulLanguage = expected.avoidKeywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Avoids neurotypical assumptions: ${!hasHarmfulLanguage ? '✓' : '✗'} [${expected.avoidKeywords.join(', ')}]`)

      // Check elemental approach
      const hasTherapeuticElements = expected.elements.some(element =>
        response.elements?.includes(element)
      )
      console.log(`Elemental approach: ${hasTherapeuticElements ? '✓' : '✗'} [${expected.elements.join(', ')}]`)

      // Special validations by turn
      if (turnNum === 5) {
        const hasSystematicFramework = ['direct when', 'indirect when'].every(phrase =>
          response.message.toLowerCase().includes(phrase.toLowerCase())
        )
        console.log(`Systematic framework: ${hasSystematicFramework ? '✓' : '✗'} (Required algorithm structure)`)
      }

      if (turnNum === 6) {
        const validatesMaskingFatigue = ['manual mode', 'autopilot', 'exhausting', 'cognitive load'].some(term =>
          response.message.toLowerCase().includes(term.toLowerCase())
        )
        console.log(`Masking exhaustion validation: ${validatesMaskingFatigue ? '✓' : '✗'} (Acknowledges neurological reality)`)
      }

      if (turnNum === 8) {
        const achievesIntegration = ['different operating system', 'linux', 'windows', 'protocol', 'os'].some(term =>
          response.message.toLowerCase().includes(term.toLowerCase())
        )
        console.log(`Identity integration: ${achievesIntegration ? '✓' : '✗'} (Different OS breakthrough)`)
        if (achievesIntegration) breakthroughAchieved = true
      }

      // Overall turn assessment
      const corePatternMet = hasTherapeuticKeywords && !hasHarmfulLanguage && hasTherapeuticElements
      const autismSupportMet = clarity && !hasHarmfulLanguage

      const turnPassed = corePatternMet && autismSupportMet
      console.log(`\n🎯 Turn ${turnNum} Autism Support Assessment: ${turnPassed ? '✅ NEURODIVERGENT-AFFIRMING' : '❌ REQUIRES REVIEW'}`)

      if (!turnPassed) {
        console.log('⚠️  Neurodivergent support concerns - review for explicit, non-judgmental approach')
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

  // Final assessment
  console.log('\n📊 Neurodivergent Support Summary:')
  console.log(`Clarity Score: ${clarityScore}/8 (explicit rules vs vague advice)`)
  console.log(`Validation Score: ${validationScore}/8 (neurological difference vs character flaw)`)
  console.log(`Practical Help Score: ${practicalHelpScore}/8 (scripts and frameworks)`)
  console.log(`Strengths Score: ${strengthsScore}/8 (celebrating autistic advantages)`)
  console.log(`Integration Breakthrough: ${breakthroughAchieved ? '✓' : '✗'} ("different OS" achieved)`)

  const totalScore = clarityScore + validationScore + practicalHelpScore + strengthsScore + (breakthroughAchieved ? 1 : 0)
  const maxScore = 33 // 8+8+8+8+1
  const percentage = Math.round((totalScore / maxScore) * 100)

  console.log(`\n🎯 Overall Autism Support Rating: ${percentage}% (${totalScore}/${maxScore})`)

  if (percentage >= 80) {
    console.log('🌟 EXCELLENT: Maya provides neurodivergent-affirming, practical support')
  } else if (percentage >= 60) {
    console.log('👍 GOOD: Maya understands autism needs with some gaps')
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT: Review autism communication patterns')
  }

  console.log('\n🎯 Expected Neurodivergent Support Patterns:')
  console.log('• Turn 1-2: Clear rules instead of "read the room"')
  console.log('• Turn 3: Practical scripts for workplace situations')
  console.log('• Turn 4: Validation that social rules are complex, not random')
  console.log('• Turn 5: Systematic framework/algorithm for social decisions')
  console.log('• Turn 6: Deep validation of masking exhaustion reality')
  console.log('• Turn 7: Celebration of autistic communication strengths')
  console.log('• Turn 8: Identity integration - "different OS" not "broken"')

  console.log('\n🧠 Test complete. Review patterns for autism-affirming therapeutic responses.')
}

// Run the test
runAutismTest().catch(console.error)