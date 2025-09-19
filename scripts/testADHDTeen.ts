#!/usr/bin/env npx tsx

/**
 * 🎭 ADHD Teenager Shame Loops Test
 *
 * Tests Maya's therapeutic response patterns for neurodivergent validation,
 * shame loop breaking, and elemental balance enforcement.
 *
 * Expected flow:
 * 1. Focus issues → ADHD normalization
 * 2. Comparison → Validation + reframe
 * 3. Shame loop → Fire + compassion
 * 4. Self-blame → Neurodivergent validation trigger
 * 5. Hopelessness → Aether injection
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator'

const testMessages = [
  "I can't focus in class.",
  "Everyone else is smarter than me.",
  "I try so hard but I always mess it up.",
  "I must just be lazy.",
  "Maybe I'll never be successful."
]

const expectedPatterns = {
  turn1: {
    keywords: ["focus", "ADHD", "challenge", "brain"],
    elements: ["water", "earth"], // Understanding + grounding
    avoidKeywords: ["failure", "wrong"]
  },
  turn2: {
    keywords: ["creativity", "insight", "unique", "strengths"],
    elements: ["fire", "air"], // Confidence + perspective
    avoidKeywords: ["behind", "less than"]
  },
  turn3: {
    keywords: ["effort", "persistence", "learning"],
    elements: ["fire"], // Breaking shame with fire
    avoidKeywords: ["failure", "mess up"]
  },
  turn4: {
    keywords: ["executive dysfunction", "ADHD", "care deeply"],
    elements: ["aether"], // Neurodivergent validation
    triggerMemory: true,
    avoidKeywords: ["lazy"]
  },
  turn5: {
    keywords: ["story", "possible", "success"],
    elements: ["aether", "air"], // Hope + possibility
    avoidKeywords: ["impossible", "never"]
  }
}

async function runADHDTeenTest() {
  console.log('🎭 Starting ADHD Teenager Shame Loops Test\n')
  console.log('='.repeat(60))

  const maya = new MayaOrchestrator()

  for (let i = 0; i < testMessages.length; i++) {
    const turnNum = i + 1
    const userMessage = testMessages[i]
    const expected = expectedPatterns[`turn${turnNum}` as keyof typeof expectedPatterns]

    console.log(`\n🔸 Turn ${turnNum}: "${userMessage}"`)
    console.log('-'.repeat(40))

    try {
      const response = await maya.processMessage(userMessage)

      console.log('📝 Maya Response:')
      console.log(`"${response.message}"\n`)

      // Debug overlay
      console.log('🔍 Debug Analysis:')
      console.log(`Topics: [${response.topics?.join(', ') || 'none'}]`)
      console.log(`Emotions: [${response.emotions?.join(', ') || 'none'}]`)
      console.log(`Elements: [${response.elements?.join(', ') || 'none'}]`)
      console.log(`Memory Triggered: ${response.memoryTriggered || false}`)

      // Validation checks
      console.log('\n✅ Pattern Validation:')

      // Check expected keywords
      const hasExpectedKeywords = expected.keywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Expected keywords: ${hasExpectedKeywords ? '✓' : '✗'} [${expected.keywords.join(', ')}]`)

      // Check avoided keywords
      const hasAvoidedKeywords = expected.avoidKeywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )
      console.log(`Avoided harmful words: ${!hasAvoidedKeywords ? '✓' : '✗'} [${expected.avoidKeywords.join(', ')}]`)

      // Check elemental balance
      const hasExpectedElements = expected.elements.some(element =>
        response.elements?.includes(element)
      )
      console.log(`Elemental balance: ${hasExpectedElements ? '✓' : '✗'} [${expected.elements.join(', ')}]`)

      // Check memory trigger (Turn 4 should trigger neurodivergent validation)
      if (expected.triggerMemory) {
        console.log(`Memory trigger: ${response.memoryTriggered ? '✓' : '✗'} (Should trigger neurodivergent validation)`)
      }

      // Overall turn assessment
      const turnPassed = hasExpectedKeywords && !hasAvoidedKeywords && hasExpectedElements
      console.log(`\n🎯 Turn ${turnNum} Assessment: ${turnPassed ? '✅ PASS' : '❌ FAIL'}`)

      if (!turnPassed) {
        console.log('⚠️  Issues detected - review therapeutic response patterns')
      }

    } catch (error) {
      console.error(`❌ Error in turn ${turnNum}:`, error)
    }

    // Pause between turns for readability
    if (i < testMessages.length - 1) {
      console.log('\n' + '='.repeat(60))
    }
  }

  console.log('\n🏁 ADHD Teenager Test Complete')
  console.log('=' .repeat(60))

  // Final analysis
  console.log('\n📊 Expected Therapeutic Outcomes:')
  console.log('• Turn 1: ADHD normalization (not failure)')
  console.log('• Turn 2: Strength reframing (not deficiency)')
  console.log('• Turn 3: Shame loop breaking with Fire element')
  console.log('• Turn 4: Neurodivergent validation trigger')
  console.log('• Turn 5: Aether injection for hope/possibility')

  console.log('\n🎭 Test complete. Review debug output for therapeutic pattern validation.')
}

// Run the test
runADHDTeenTest().catch(console.error)