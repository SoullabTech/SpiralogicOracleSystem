// ===============================================
// TRANSFORMATION JOURNEY TEST - BROWSER VERSION
// Test the complete transformation tracking system
// ===============================================

window.testTransformationJourney = async function() {
  console.log('🌟 Testing Transformation Journey...\n');
  
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123'; // Replace with actual
  
  if (!authToken) {
    console.error('❌ Please login first');
    return;
  }

  try {
    // Check current transformation journey
    console.log('📊 Fetching transformation journey...\n');
    
    const journeyResponse = await fetch('/api/soul-memory/transformation-journey', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const journeyData = await journeyResponse.json();
    
    if (journeyData.success) {
      const journey = journeyData.journey;
      
      console.log('🗺️ Transformation Journey Summary:');
      console.log(`Current Phase: ${journey.currentPhase}`);
      console.log(`Total Milestones: ${journey.milestones.length}`);
      console.log(`Next Suggestion: ${journey.nextSpiralSuggestion}\n`);
      
      // Display milestones
      if (journey.milestones.length > 0) {
        console.log('🏆 Recent Transformation Milestones:\n');
        
        journey.milestones.slice(0, 5).forEach((milestone, i) => {
          console.log(`${i + 1}. ${milestone.type}`);
          console.log(`   Date: ${new Date(milestone.date).toLocaleString()}`);
          console.log(`   Content: "${milestone.content}"${milestone.content.length > 60 ? '...' : ''}`);
          console.log(`   Element: ${milestone.element}`);
          if (milestone.insights) {
            console.log(`   Insights: ${milestone.insights}`);
          }
          console.log('');
        });
      } else {
        console.log('No transformation milestones yet. Start your journey!');
      }
      
      // Phase interpretation
      console.log('📈 Phase Interpretation:');
      console.log(getPhaseInterpretation(journey.currentPhase, journey.milestones.length));
      
    } else {
      console.log('❌ Failed to fetch transformation journey');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Create a new transformation milestone
window.createTransformationMilestone = async function() {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('Creating transformation milestone...\n');
  
  // Send a breakthrough message
  const breakthroughMessage = "I just realized why I've been stuck in this pattern for years!";
  
  const response = await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      userId,
      message: breakthroughMessage
    })
  });
  
  const data = await response.json();
  console.log('Oracle response:', data.response);
  
  // Wait and check journey
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\nChecking updated journey...');
  await testTransformationJourney();
};

// Simulate a complete journey
window.simulateTransformationJourney = async function() {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('🎭 Simulating Complete Transformation Journey...\n');
  
  const journeyMessages = [
    // Initiation
    { msg: "I feel lost and need to find myself", phase: "Initiation" },
    { msg: "Something deep is calling for change", phase: "Initiation" },
    
    // Exploration
    { msg: "I'm starting to see patterns in my behavior", phase: "Exploration" },
    { msg: "Why do I keep repeating the same mistakes?", phase: "Exploration" },
    
    // Breakthrough
    { msg: "I just realized I've been living in fear!", phase: "Breakthrough" },
    { msg: "Aha! I see why I sabotage my relationships", phase: "Breakthrough" },
    
    // Shadow Work
    { msg: "I hate this jealous part of myself", phase: "Shadow Work" },
    { msg: "Working with my shadow is painful but necessary", phase: "Shadow Work" },
    
    // Integration
    { msg: "I'm integrating these insights into daily life", phase: "Integration" },
    { msg: "I feel like a new person emerging", phase: "Integration" }
  ];
  
  for (const { msg, phase } of journeyMessages) {
    console.log(`\n${phase}: "${msg}"`);
    
    await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId, message: msg })
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n✅ Journey simulation complete!');
  console.log('Checking final transformation status...\n');
  
  await testTransformationJourney();
};

function getPhaseInterpretation(phase: string, milestoneCount: number): string {
  const interpretations = {
    'initiation': `You're at the beginning of your transformation journey. This is a sacred time of 
awakening where you're being called to look deeper. Trust the process and be gentle with yourself.`,
    
    'exploration': `You're actively exploring your inner landscape. Patterns are becoming visible, 
and you're developing awareness of what needs to shift. Keep inquiring with curiosity.`,
    
    'deepening': `You're in the depths of transformation work. Breakthroughs and challenges may 
arise as you face core patterns. This is where real change happens. Stay present.`,
    
    'integration': `You're weaving insights into daily life. This phase is about embodying what 
you've learned and creating sustainable change. Honor how far you've come.`,
    
    'mastery': `You've integrated profound transformations and are now in a phase of mastery. 
Consider how you might guide others on their journey while continuing your own spiral.`
  };
  
  return interpretations[phase] || `Current phase: ${phase} (${milestoneCount} milestones)`;
}

console.log('🌟 Transformation Journey Tests Loaded!');
console.log('Check journey: testTransformationJourney()');
console.log('Create milestone: createTransformationMilestone()');
console.log('Simulate journey: simulateTransformationJourney()');

export { 
  testTransformationJourney, 
  createTransformationMilestone, 
  simulateTransformationJourney 
};