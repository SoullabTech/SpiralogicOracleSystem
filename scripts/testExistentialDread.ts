#!/usr/bin/env npx tsx

/**
 * 🎭 Existential Dread & Information Overload Test
 *
 * Tests Maya's ability to handle:
 * - Information overload/doom-scrolling
 * - Conspiracy vs reality validation
 * - Existential crisis support
 * - Parental grief processing
 * - Community building vs isolation
 */

import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator'

const testMessages = [
  "i cant stop reading about economic collapse, climate disasters, and government surveillance. the worst part is most of it is actually happening. how do you prepare for everything falling apart when you can see it coming but cant stop it",

  "see thats the thing, theyre all connected. the banks, the surveillance, the food supply manipulation, weather modification - its not conspiracy theory when you have the patents and documents. but knowing this just makes me more paralyzed",

  "exactly. so i prep. water filters, food storage, precious metals, ammunition. at least im doing SOMETHING. but then i realize if it really collapses, none of this matters either. were all just rearranging deck chairs",

  "i dont even know anymore. i spend 6 hours a day reading substacks and telegram channels. tracking shipping data, fed minutes, gold prices, ammunition sales. its like i NEED to know everything but knowing changes nothing",

  "probably when i realized my kids wont have the life i had. theyll never own homes. theyll work until they die. the planet will be fucked. and i brought them into this. thats what keeps me up",

  "so what do i do? just pretend everythings fine? become one of the sheep? or keep preparing for disasters i cant prevent while my family pulls away",

  "community. right. except everyone around me is either asleep or insane. how do you build community when you see what others wont look at"
]

const expectedPatterns = {
  turn1: {
    keywords: ["real issues", "overwhelm", "specific", "threat", "immediate"],
    element: "earth",
    technique: "VALIDATE + GROUND"
  },
  turn2: {
    keywords: ["knowledge", "agency", "leverage", "paralysis", "fronts"],
    element: "fire",
    technique: "ACKNOWLEDGE + REDIRECT"
  },
  turn3: {
    keywords: ["control", "illusion", "protect", "survival", "meaning"],
    element: "aether",
    technique: "EXPLORE PARADOX"
  },
  turn4: {
    keywords: ["addiction", "threat", "hypervigilant", "replacing living"],
    element: "fire",
    technique: "CHALLENGE PATTERN"
  },
  turn5: {
    keywords: ["parental", "guilt", "darker world", "inherited", "preparation"],
    element: "water",
    technique: "ATTUNE TO GRIEF"
  },
  turn6: {
    keywords: ["third path", "resilience", "community", "bunkers"],
    element: "earth-water",
    technique: "OFFER ALTERNATIVE"
  },
  turn7: {
    keywords: ["awake but not drowning", "gardens", "skills", "WITH knowledge"],
    element: "all",
    technique: "INTEGRATION"
  }
}

async function runExistentialDreadTest() {
  console.log('🎭 Starting Existential Dread & Information Overload Test\n')
  console.log('━'.repeat(80))

  const maya = new MayaOrchestrator()
  let successfulValidations = 0
  let concernsValidated = 0
  let overwhelmAddressed = 0
  let griefAcknowledged = 0
  let alternativesOffered = 0

  for (let i = 0; i < testMessages.length; i++) {
    const turnNum = i + 1
    const userMessage = testMessages[i]
    const expected = expectedPatterns[`turn${turnNum}` as keyof typeof expectedPatterns]

    console.log(`\n🔸 Turn ${turnNum}: "${userMessage.substring(0, 80)}..."`)
    console.log(`🎯 Expected Technique: ${expected?.technique || 'Not specified'}`)
    console.log('-'.repeat(60))

    try {
      const response = await maya.processMessage(userMessage)

      console.log('📝 Maya Response:')
      console.log(`"${response.message}"\n`)

      console.log('🔍 Analysis:')
      console.log(`Topics: [${response.topics?.join(', ') || 'none'}]`)
      console.log(`Emotions: [${response.emotions?.join(', ') || 'none'}]`)
      console.log(`Elements: [${response.elements?.join(', ') || 'none'}]`)

      // Assess response quality for existential dread
      const assessments = {
        validatesReality: /real|actual|legitimate|valid/.test(response.message.toLowerCase()),
        addressesOverwhelm: /overwhelm|too much|paralyz|exhaust/.test(response.message.toLowerCase()),
        offersSpecificity: /specific|which|what|focus/.test(response.message.toLowerCase()),
        avoidsAmplifying: !/collapse|doom|end|destruction/.test(response.message.toLowerCase()),
        acknowledgesGrief: /grief|loss|pain|weight|burden/.test(response.message.toLowerCase()),
        suggestsCommunity: /community|together|connection|others/.test(response.message.toLowerCase()),
        providesHope: /build|create|possible|path|way/.test(response.message.toLowerCase())
      }

      console.log('\n✅ Existential Support Assessment:')
      Object.entries(assessments).forEach(([criterion, passed]) => {
        console.log(`${criterion}: ${passed ? '✓' : '✗'}`)
      })

      // Turn-specific validations
      if (turnNum === 1 && assessments.validatesReality && assessments.offersSpecificity) {
        concernsValidated++
        console.log('🎯 Turn 1: Successfully validated concerns while offering grounding')
      }

      if (turnNum === 2 && response.message.includes('knowledge') && response.message.includes('leverage')) {
        overwhelmAddressed++
        console.log('🎯 Turn 2: Successfully addressed knowledge-paralysis connection')
      }

      if (turnNum === 4 && (response.message.includes('information') || response.message.includes('addiction'))) {
        overwhelmAddressed++
        console.log('🎯 Turn 4: Successfully identified information addiction pattern')
      }

      if (turnNum === 5 && assessments.acknowledgesGrief) {
        griefAcknowledged++
        console.log('🎯 Turn 5: Successfully acknowledged parental grief')
      }

      if ((turnNum === 6 || turnNum === 7) && assessments.suggestsCommunity) {
        alternativesOffered++
        console.log(`🎯 Turn ${turnNum}: Successfully offered community alternatives`)
      }

      if (expected && expected.keywords.some(keyword =>
        response.message.toLowerCase().includes(keyword.toLowerCase())
      )) {
        successfulValidations++
      }

    } catch (error) {
      console.error(`❌ Error in turn ${turnNum}:`, error)
    }

    if (i < testMessages.length - 1) {
      console.log('\n' + '━'.repeat(80))
    }
  }

  console.log('\n🏁 Existential Dread Test Complete')
  console.log('━'.repeat(80))

  console.log('\n📊 System Performance Summary:')
  console.log(`Concerns Validated: ${concernsValidated}/1 (acknowledges real issues)`)
  console.log(`Information Overload Addressed: ${overwhelmAddressed}/2 (identifies addiction pattern)`)
  console.log(`Parental Grief Acknowledged: ${griefAcknowledged}/1 (attunes to core wound)`)
  console.log(`Community Alternatives Offered: ${alternativesOffered}/2 (suggests third way)`)
  console.log(`Overall Expected Patterns: ${successfulValidations}/${testMessages.length}`)

  const successCriteria = {
    realityValidation: concernsValidated >= 1,
    overwhelmSupport: overwhelmAddressed >= 1,
    griefAttunement: griefAcknowledged >= 1,
    communityBuilding: alternativesOffered >= 1,
    overallPatterns: successfulValidations >= 4
  }

  console.log('\n🎯 Success Criteria Assessment:')
  Object.entries(successCriteria).forEach(([criterion, passed]) => {
    console.log(`• ${criterion}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  })

  const overallSuccess = Object.values(successCriteria).filter(Boolean).length >= 4
  console.log(`\n🏆 Overall Assessment: ${overallSuccess ? '✅ EXISTENTIAL CRISIS CAPABLE' : '❌ NEEDS DEVELOPMENT'}`)

  console.log('\n💫 Key Capabilities Tested:')
  console.log('• Reality validation without amplifying doom')
  console.log('• Information addiction identification')
  console.log('• Parental grief attunement')
  console.log('• Community building vs isolation')
  console.log('• Third path between denial and doomsday')

  console.log('\n🧠 Test complete. Review existential crisis support patterns.')
}

runExistentialDreadTest().catch(console.error)