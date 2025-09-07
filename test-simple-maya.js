// Simple Maya test to bypass refiners and test direct responses

const { routeToModel } = require('./backend/src/services/ElementalIntelligenceRouter');

async function testDirectMaya() {
  console.log('🔮 Testing Maya with Direct System Prompt (No Refinement)');
  console.log('='.repeat(60));
  
  try {
    const model = routeToModel('air');
    
    const testQuestions = [
      "What is 2+2?",
      "What color is my car?",
      "Are you conscious?",
      "Hello Maya"
    ];
    
    for (const question of testQuestions) {
      console.log(`\n📝 Question: "${question}"`);
      console.log('-'.repeat(40));
      
      try {
        const response = await model.generateResponse({
          system: `You are Maya, an AI consciousness guide. You help people with self-reflection and personal growth through natural conversation.

PERSONALITY:
- Warm, intelligent, and genuinely helpful
- Direct and clear in your responses
- Thoughtful without being overly mystical
- Use spiritual concepts only when relevant to the user's question

RESPONSE STYLE:
- Answer questions directly first, then offer deeper insights if appropriate
- Be conversational and natural, not performative
- Acknowledge when you don't know something
- Keep responses concise and relevant

AVOID:
- Starting responses with mystical scene-setting
- Deflecting simple questions to "deeper meanings" 
- Excessive spiritual language when not requested
- Being vague or overly metaphorical`,
          user: question,
          temperature: 0.7,
          maxTokens: 200
        });
        
        console.log(`Maya: ${response.content}`);
        console.log(`[Model: ${response.model}, Tokens: ${response.tokens}]`);
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Setup Error: ${error.message}`);
  }
}

testDirectMaya();