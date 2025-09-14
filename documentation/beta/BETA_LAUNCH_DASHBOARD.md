# 📊 Beta Launch Dashboard
*Real-time monitoring for Maya's beta testing readiness*

## Overview
A lightweight Next.js dashboard that provides live KPIs and health monitoring during Maya's beta launch, pulling data from Supabase logs and health endpoints to ensure smooth tester experience.

## 🎯 Core Metrics Tracked

### Memory Performance
- **Session Memory Success Rate**: % of conversations with sessionEntries > 0 on recall
- **Memory Orchestration Health**: Rate of successful `🧠 [MAYA_DEBUG] Memory Orchestration Complete`
- **Persistence Rate**: % of conversations with `Conversation turn persisted successfully`
- **Memory Layer Coverage**: Breakdown of Profile/Journal/External/Session/Symbolic usage

### Voice & TTS Performance  
- **TTS Success Chain**: Sesame → ElevenLabs → Mock fallback usage rates
- **Voice Processing Time**: Average transcription + TTS generation time
- **STT Accuracy**: Interim vs final transcript match rates
- **Audio Generation**: Successful audioUrl generation rate

### Conversation Quality
- **Response Processing Time**: Average time for message vs streaming endpoints
- **Personalization Score**: % of responses containing user-specific context
- **Error Rate**: Type errors, memory failures, TTS failures
- **Cross-Endpoint Continuity**: Sessions switching between message/stream successfully

### User Experience
- **Session Duration**: Average conversation length
- **Return Rate**: Users with multiple sessions
- **Feature Adoption**: Voice vs text usage, element preferences
- **Satisfaction Proxies**: Session completion rates, follow-up questions

## 🏗️ Technical Architecture

### Data Sources
```typescript
// Health endpoints
const healthSources = {
  backend: 'http://localhost:3002/api/v1/health',
  conversation: 'http://localhost:3002/api/v1/converse/health', 
  voice: {
    tts: 'http://localhost:3002/api/v1/voice/health/tts',
    stt: 'http://localhost:3002/api/v1/voice/health/stt'
  }
}

// Supabase log queries
const logQueries = {
  memoryOrchestration: `
    SELECT * FROM system_logs 
    WHERE message LIKE '%Memory Orchestration Complete%' 
    AND created_at > now() - interval '1 hour'
  `,
  persistence: `
    SELECT * FROM system_logs 
    WHERE message LIKE '%Conversation turn persisted%'
    AND created_at > now() - interval '1 hour'  
  `,
  errors: `
    SELECT * FROM system_logs 
    WHERE level = 'ERROR'
    AND created_at > now() - interval '1 hour'
  `
}
```

### Dashboard Components

#### 1. **System Health Overview**
```jsx
const SystemHealth = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <HealthCard 
        title="Backend Health"
        status={backendHealth.status}
        uptime={backendHealth.uptime}
        color="green"
      />
      <HealthCard 
        title="Memory System" 
        status={memoryHealth.orchestrationRate}
        subtitle={`${memoryHealth.persistenceRate}% persistence`}
        color="blue"
      />
      <HealthCard 
        title="Voice Pipeline"
        status={voiceHealth.ttsChain}
        subtitle={`${voiceHealth.avgProcessingTime}ms avg`}
        color="purple"
      />
      <HealthCard
        title="User Experience"
        status={uxMetrics.satisfactionScore}
        subtitle={`${uxMetrics.activeUsers} active users`}
        color="orange"
      />
    </div>
  )
}
```

#### 2. **Memory Performance Dashboard**
```jsx
const MemoryDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Memory Orchestration Success Rate */}
      <MetricChart
        title="Memory Orchestration Success Rate"
        data={memoryMetrics.orchestrationSuccess}
        target={95}
        type="line"
        timeframe="1h"
      />
      
      {/* Session Memory Building */}
      <MetricChart 
        title="Session Memory Building"
        data={memoryMetrics.sessionEntries}
        description="sessionEntries: 0 → 1 → 2 progression"
        type="histogram"
      />
      
      {/* Memory Layer Usage */}
      <LayerBreakdown
        profile={memoryMetrics.layers.profile}
        journal={memoryMetrics.layers.journal}
        external={memoryMetrics.layers.external}
        session={memoryMetrics.layers.session}
        symbolic={memoryMetrics.layers.symbolic}
      />
    </div>
  )
}
```

#### 3. **Voice Performance Monitor**
```jsx
const VoiceMonitor = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* TTS Fallback Chain */}
      <FallbackChain
        title="TTS Fallback Usage"
        primary={{name: "Sesame", rate: ttsMetrics.sesame}}
        secondary={{name: "ElevenLabs", rate: ttsMetrics.elevenlabs}}
        fallback={{name: "Mock", rate: ttsMetrics.mock}}
      />
      
      {/* Processing Times */}
      <ProcessingTimes
        transcription={voiceMetrics.sttTime}
        generation={voiceMetrics.ttsTime}
        total={voiceMetrics.totalTime}
        target={3000} // 3 second target
      />
    </div>
  )
}
```

#### 4. **Live Beta Validation**
```jsx
const LiveValidation = () => {
  const [validationResults, setValidationResults] = useState([])
  
  useEffect(() => {
    // Auto-run validation scenarios every 5 minutes
    const interval = setInterval(async () => {
      const results = await runAutoValidation()
      setValidationResults(results)
    }, 300000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Live Beta Validation Results</h3>
      
      {validationResults.map((result, i) => (
        <ValidationResult
          key={i}
          scenario={result.scenario}
          success={result.success}
          metrics={result.metrics}
          timestamp={result.timestamp}
        />
      ))}
      
      {/* Manual test triggers */}
      <div className="flex space-x-2">
        <Button onClick={() => runMemoryTest()}>Test Memory</Button>
        <Button onClick={() => runStreamingTest()}>Test Streaming</Button>
        <Button onClick={() => runVoiceTest()}>Test Voice</Button>
      </div>
    </div>
  )
}
```

## 🚨 Alert Thresholds

### Critical Alerts (Red)
- Memory orchestration success rate < 80%
- Conversation persistence rate < 90%
- TTS failure rate > 10%
- Average response time > 10 seconds
- Error rate > 5%

### Warning Alerts (Yellow)
- Memory orchestration success rate < 90%
- Session memory building rate < 70%
- Voice processing time > 5 seconds
- User session drop rate > 20%

### Success Targets (Green)
- Memory orchestration success rate > 95%
- Session memory persistence > 95%
- TTS primary (Sesame) usage > 80%
- Average response time < 3 seconds
- User satisfaction proxies > 80%

## 📱 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🧠 Maya Beta Dashboard - Live Status                   │
├─────────────────────────────────────────────────────────┤
│ System Health: [🟢][🟢][🟢][🟢] | Last Updated: 14:37  │ 
├─────────────────────────────────────────────────────────┤
│ Memory Performance                Voice Performance      │
│ ┌─────────────────────┐           ┌─────────────────────┐ │
│ │ 📊 Orchestration 96%│           │ 🎤 TTS Chain        │ │
│ │ 💾 Persistence 98%  │           │ Sesame: 85%         │ │
│ │ 🔗 Continuity 92%   │           │ ElevenLabs: 12%     │ │
│ │                     │           │ Mock: 3%            │ │
│ └─────────────────────┘           └─────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Live Validation Results                                 │
│ ✅ Phase 1: Message Endpoint (2 min ago)               │
│ ✅ Phase 2: Streaming Endpoint (4 min ago)             │  
│ ⚠️  Phase 3: Multi-Layer Test (Journal fetch error)    │
├─────────────────────────────────────────────────────────┤
│ Active Beta Metrics                                     │
│ Users: 12 active | Sessions: 47 today | Avg: 8.3 turns │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Auto-Validation Runner

```typescript
// Automated testing that mirrors BETA_MEMORY_VALIDATION_SCRIPT.md
const runAutoValidation = async (): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = []
  
  try {
    // Phase 1: Message endpoint test
    const messageTest = await fetch('/api/v1/converse/message', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userText: "Auto-test: My name is TestBot",
        userId: "auto-validation-001", 
        sessionId: `auto-session-${Date.now()}`
      })
    })
    
    results.push({
      scenario: "Message Endpoint",
      success: messageTest.ok,
      metrics: await extractMetrics(messageTest),
      timestamp: new Date()
    })
    
    // Phase 2: Streaming endpoint test  
    const streamTest = await testStreaming()
    results.push({
      scenario: "Streaming Endpoint",
      success: streamTest.success,
      metrics: streamTest.metrics,
      timestamp: new Date()
    })
    
    // Phase 3: Memory recall test
    const recallTest = await testMemoryRecall()
    results.push({
      scenario: "Memory Recall",
      success: recallTest.success,
      metrics: recallTest.metrics,
      timestamp: new Date()
    })
    
  } catch (error) {
    console.error('Auto-validation failed:', error)
  }
  
  return results
}
```

## 🛠️ Implementation Steps

### 1. Create Next.js Dashboard App
```bash
cd frontend
npx create-next-app@latest beta-dashboard
cd beta-dashboard
npm install @supabase/supabase-js recharts lucide-react
```

### 2. Add Health Endpoints Integration
```typescript
// lib/healthApi.ts
export const fetchSystemHealth = async () => {
  const endpoints = [
    'http://localhost:3002/api/v1/health',
    'http://localhost:3002/api/v1/converse/health',
    'http://localhost:3002/api/v1/voice/health/tts'
  ]
  
  const results = await Promise.allSettled(
    endpoints.map(url => fetch(url).then(r => r.json()))
  )
  
  return results
}
```

### 3. Add Supabase Log Analytics
```typescript
// lib/logAnalytics.ts
export const getMemoryMetrics = async (timeframe = '1h') => {
  const { data: orchestrationLogs } = await supabase
    .from('system_logs')
    .select('*')
    .like('message', '%Memory Orchestration Complete%')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
  const { data: persistenceLogs } = await supabase
    .from('system_logs') 
    .select('*')
    .like('message', '%Conversation turn persisted%')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
  return {
    orchestrationRate: calculateSuccessRate(orchestrationLogs),
    persistenceRate: calculateSuccessRate(persistenceLogs),
    totalConversations: orchestrationLogs.length
  }
}
```

### 4. Deploy Dashboard
```bash
# Add to existing Next.js app as /beta-dashboard route
# Or deploy as separate app on Vercel with environment variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🎯 Success Metrics for Dashboard

**Beta Launch Ready When:**
- ✅ All health endpoints return 200 status
- ✅ Memory orchestration rate > 95% over 1 hour
- ✅ Session memory building observed in auto-validation
- ✅ Voice pipeline showing <3s average response time
- ✅ Error rate < 2% over past hour
- ✅ Live validation scenarios all passing

**Dashboard ROI:**
- **Early Issue Detection**: Spot memory orchestration failures before testers report them
- **Performance Optimization**: Identify TTS fallback patterns and optimize primary chains
- **Confidence Building**: Visual proof that Maya's unified architecture is stable
- **Tester Success**: Proactive monitoring ensures smooth beta experience

This dashboard becomes the **command center** for Maya's beta launch, giving your team real-time visibility into whether the memory orchestration, voice pipeline, and conversation quality are maintaining the standards needed for a successful beta experience! 🚀