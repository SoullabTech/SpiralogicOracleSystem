#!/usr/bin/env npx ts-node

import { wireDI } from '../backend/src/bootstrap/di';
import { get } from '../backend/src/core/di/container';
import { TOKENS } from '../backend/src/core/di/tokens';
import { AsyncVoiceQueue } from '../backend/src/adapters/voice/AsyncVoiceQueue';
import { VoiceEventBus } from '../backend/src/core/events/VoiceEventBus';

async function testVoiceQueue() {
  console.log('🎤 Testing Async Voice Queue with SSE Events\n');
  
  // Initialize DI
  console.log('🔗 Wiring DI container...');
  wireDI();
  console.log('✅ DI container initialized!\n');
  
  // Get services
  const voiceQueue = get<AsyncVoiceQueue>(TOKENS.Voice);
  const eventBus = get<VoiceEventBus>(TOKENS.VOICE_EVENTS);
  
  // Subscribe to events
  let eventCount = 0;
  eventBus.subscribe((event) => {
    eventCount++;
    console.log(`📡 SSE Event ${eventCount}:`, {
      type: event.type,
      taskId: event.taskId.slice(-8), // last 8 chars
      userId: event.userId,
      timestamp: event.timestamp.toLocaleTimeString()
    });
  });
  
  console.log('🚀 Queueing voice synthesis jobs...\n');
  
  // Queue multiple tasks
  const tasks = [
    { text: 'Welcome to the consciousness oracle', voiceId: 'maya' },
    { text: 'Your awakening journey begins now', voiceId: 'sophia' },
    { text: 'Let wisdom guide your path forward', voiceId: 'oracle' }
  ];
  
  const taskIds: string[] = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const taskId = await voiceQueue.synthesize(task);
    taskIds.push(taskId);
    console.log(`📝 Queued task ${i + 1}: ${taskId.slice(-8)} - "${task.text.substring(0, 30)}..."`);
  }
  
  console.log('\n⏳ Processing queue (watching for events)...\n');
  
  // Wait for all tasks to complete
  let completed = 0;
  const startTime = Date.now();
  
  while (completed < tasks.length && (Date.now() - startTime) < 10000) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (const taskId of taskIds) {
      const task = await voiceQueue.getTaskStatus(taskId);
      if (task && (task.status === 'completed' || task.status === 'failed')) {
        const wasCompleted = taskIds.indexOf(taskId) < completed;
        if (!wasCompleted) {
          completed++;
          console.log(`✅ Task ${taskId.slice(-8)}: ${task.status} - ${task.result || task.error}`);
        }
      }
    }
  }
  
  console.log(`\n🎉 Voice Queue Test Complete!`);
  console.log(`   📊 ${completed}/${tasks.length} tasks processed`);
  console.log(`   📡 ${eventCount} SSE events emitted`);
  console.log(`   ⏱️  Total time: ${Date.now() - startTime}ms`);
  
  // Test task status endpoint format
  console.log('\n🔍 Sample task status:');
  if (taskIds.length > 0) {
    const sampleTask = await voiceQueue.getTaskStatus(taskIds[0]);
    if (sampleTask) {
      console.log({
        taskId: sampleTask.id.slice(-8),
        status: sampleTask.status,
        text: sampleTask.job.text.substring(0, 40) + '...',
        result: sampleTask.result,
        duration: sampleTask.completedAt 
          ? sampleTask.completedAt.getTime() - sampleTask.createdAt.getTime() 
          : null
      });
    }
  }
  
  console.log('\n✨ Ready for SSE integration!');
}

testVoiceQueue().catch(console.error);