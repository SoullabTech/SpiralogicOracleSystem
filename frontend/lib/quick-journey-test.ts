// ===============================================
// QUICK TRANSFORMATION JOURNEY TEST
// Simple console commands to test the journey
// ===============================================

// Quick test function
window.checkJourney = async function() {
  const authToken = localStorage.getItem('auth_token');
  
  console.log('🌟 Checking Transformation Journey...\n');
  
  const response = await fetch('/api/soul-memory/transformation-journey', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    const journey = data.journey;
    console.log('Current Phase:', journey.currentPhase);
    console.log('Milestones:', journey.milestones.length);
    console.log('Next Step:', journey.nextSpiralSuggestion);
    
    if (journey.milestones.length > 0) {
      console.log('\nLatest Milestone:');
      const latest = journey.milestones[0];
      console.log(`- Type: ${latest.type}`);
      console.log(`- Content: ${latest.content}`);
      console.log(`- Date: ${new Date(latest.date).toLocaleString()}`);
    }
    
    return journey;
  }
  
  return null;
};

// Add a breakthrough
window.addBreakthrough = async function(message = "I just realized why I've been stuck!") {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('💫 Adding breakthrough...');
  
  await fetch('/api/oracle/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ userId, message })
  });
  
  console.log('Waiting for processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Checking updated journey...');
  await checkJourney();
};

// Quick journey summary
window.journeySummary = async function() {
  const journey = await checkJourney();
  
  if (!journey) return;
  
  console.log('\n📊 Journey Summary:');
  console.log('=================');
  
  // Phase progress
  const phases = ['initiation', 'exploration', 'deepening', 'integration', 'mastery'];
  const currentIndex = phases.indexOf(journey.currentPhase);
  
  console.log('\nPhase Progress:');
  phases.forEach((phase, i) => {
    const marker = i === currentIndex ? '→' : i < currentIndex ? '✓' : ' ';
    console.log(`${marker} ${phase.toUpperCase()}`);
  });
  
  // Milestone types
  console.log('\nMilestone Breakdown:');
  const types = {};
  journey.milestones.forEach(m => {
    types[m.type] = (types[m.type] || 0) + 1;
  });
  
  Object.entries(types).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`);
  });
  
  // Recent activity
  console.log('\nRecent Activity:');
  journey.milestones.slice(0, 3).forEach((m, i) => {
    const timeAgo = getTimeAgo(new Date(m.date));
    console.log(`${i + 1}. ${m.type} (${timeAgo})`);
  });
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

console.log('🌟 Journey Test Commands:');
console.log('checkJourney() - View current journey status');
console.log('addBreakthrough() - Add a transformation milestone');
console.log('journeySummary() - Get detailed journey summary');

export { checkJourney, addBreakthrough, journeySummary };