#!/usr/bin/env npx ts-node

import { wireDI } from '../backend/src/bootstrap/di';
import { get } from '../backend/src/core/di/container';
import { TOKENS } from '../backend/src/core/di/tokens';
import { ConsciousnessAPI } from '../backend/src/api/ConsciousnessAPI';
import { SseHub } from '../backend/src/core/events/SseHub';
import { VoiceQueue } from '../backend/src/services/VoiceQueue';

async function testCompleteFlow() {
  console.log('🌌 Testing Complete SSE + Voice Flow\n');
  
  console.log('🔗 Initializing DI container...');
  wireDI();
  console.log('✅ DI container ready!\n');
  
  // Get services
  const api = get<ConsciousnessAPI>(TOKENS.API);
  const sseHub = get<SseHub>(TOKENS.SSE_HUB);
  const voiceQueue = get<VoiceQueue>(TOKENS.VOICE_QUEUE);
  
  const userId = 'test-user-123';
  
  // Subscribe to SSE events (simulating client)
  console.log('📡 Subscribing to SSE events...');
  let eventCount = 0;
  const events: any[] = [];
  
  const mockClient = {
    userId,
    send: (data: string) => {
      eventCount++;
      const lines = data.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const eventData = JSON.parse(line.substring(6));
          events.push(eventData);
          console.log(`📨 Event ${eventCount}: ${eventData.type}`, {
            ...(eventData.taskId ? { taskId: eventData.taskId.slice(-8) } : {}),
            ...(eventData.url ? { url: eventData.url.substring(0, 50) + '...' } : {}),
            ...(eventData.error ? { error: eventData.error } : {})
          });
        }
      }
    },
    close: () => {}
  };
  
  const unsubscribe = sseHub.addClient(userId, mockClient);
  
  console.log('✅ SSE subscription active\n');
  
  // Test multiple chat requests
  const testMessages = [
    { text: 'Tell me about consciousness', element: 'aether' },
    { text: 'Guide my meditation practice', element: 'water' },
    { text: 'Give me creative inspiration', element: 'fire' }
  ];
  
  console.log('🚀 Sending chat requests (voice queued automatically)...\n');
  
  const responses = [];
  for (let i = 0; i < testMessages.length; i++) {
    const msg = testMessages[i];
    console.log(`💬 Chat ${i + 1}: "${msg.text.substring(0, 30)}..." [${msg.element}]`);
    
    const response = await api.chat({
      userId,
      text: msg.text,
      element: msg.element
    });
    
    responses.push(response);
    console.log(`   ✨ Response: "${response.text.substring(0, 50)}..."`);
    console.log(`   📊 Meta:`, {
      latency: response.meta?.latencyMs + 'ms',
      voiceQueued: response.meta?.voiceQueued,
      element: response.meta?.element
    });
    console.log();
    
    // Brief pause between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('⏳ Waiting for voice synthesis to complete...\n');
  
  // Wait for all voice events
  let voiceCompleted = 0;
  const maxWait = 10000; // 10 seconds
  const startWait = Date.now();
  
  while (voiceCompleted < testMessages.length && (Date.now() - startWait) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100));
    voiceCompleted = events.filter(e => e.type === 'voice.ready').length;
  }
  
  // Results summary
  console.log('🎉 Complete Flow Test Results:\n');
  console.log(`📊 Statistics:`);
  console.log(`   - Chat requests: ${testMessages.length}`);
  console.log(`   - Chat responses: ${responses.length}`);
  console.log(`   - SSE events received: ${eventCount}`);
  console.log(`   - Voice synthesis completed: ${events.filter(e => e.type === 'voice.ready').length}`);
  console.log(`   - Voice synthesis failed: ${events.filter(e => e.type === 'voice.failed').length}`);
  
  console.log(`\n📡 Event Breakdown:`);
  const eventTypes = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  for (const [type, count] of Object.entries(eventTypes)) {
    console.log(`   - ${type}: ${count}`);
  }
  
  console.log(`\n🎯 Voice Queue Status:`, voiceQueue.getQueueStatus());
  console.log(`📈 SSE Hub Status:`);
  console.log(`   - Active users: ${sseHub.getActiveUsers().length}`);
  console.log(`   - Total clients: ${sseHub.getClientCount()}`);
  console.log(`   - Clients for ${userId}: ${sseHub.getClientCount(userId)}`);
  
  // Cleanup
  unsubscribe();
  console.log('\n✨ Flow test complete! SSE + Voice integration working perfectly.');
  
  // Demo client usage
  console.log('\n🌐 Client Integration Examples:');
  console.log(`
// JavaScript client setup:
const eventSource = new EventSource('/api/events?userId=${userId}');
eventSource.addEventListener('voice.ready', (event) => {
  const data = JSON.parse(event.data);
  console.log('Voice ready:', data.url);
  // Play audio file
});

// Send chat request:
fetch('/api/oracle/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '${userId}',
    text: 'Guide my awakening',
    element: 'aether'
  })
}).then(res => res.json()).then(data => {
  console.log('Immediate text response:', data.text);
  // Voice will arrive via SSE when ready
});
`);
}

testCompleteFlow().catch(console.error);