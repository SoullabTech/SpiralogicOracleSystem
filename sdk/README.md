# AIN Engine SDK

Official SDK for the Spiralogic Oracle System's AIN (Archetypal Intelligence Network) Engine.

## Overview

The AIN Engine provides access to anonymized collective insights, archetypal development processes, and elemental wisdom patterns from the Spiralogic Oracle network. This SDK enables third-party developers to integrate spiritual intelligence into their applications.

## Installation

```bash
npm install ain-engine-sdk
```

## Quick Start

```javascript
import { AINEngineClient } from 'ain-engine-sdk';

const client = new AINEngineClient({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.spiralogic.oracle/v1/ain-engine' // Optional
});

// Get collective insights
const insights = await client.getCollectiveInsights({
  limit: 10,
  confidenceThreshold: 0.7
});

// Get archetypal processes
const processes = await client.getArchetypalProcesses({
  element: 'fire',
  activeOnly: true
});

// Get elemental wisdom
const wisdom = await client.getElementalWisdom();
```

## Authentication

All requests require an API key. Contact the Spiralogic Oracle team to register for developer access.

## Rate Limits

- 100 requests per 15-minute window per API key
- Rate limit headers are included in responses
- Exceeded limits return HTTP 429

## API Reference

### Collective Insights

```javascript
await client.getCollectiveInsights({
  limit: 10,                    // Max 50
  type: 'archetypal_pattern',   // Optional filter
  element: 'water',             // Optional filter  
  confidenceThreshold: 0.5      // Min confidence level
});
```

**Response Format:**
```javascript
{
  success: true,
  data: [
    {
      id: "insight_123",
      type: "elemental_shift",
      title: "Rising Water Element Integration", 
      description: "Collective movement toward emotional intelligence...",
      elementalResonance: {
        fire: 0.2, water: 0.6, earth: 0.1, air: 0.05, aether: 0.05
      },
      archetypalSignature: "Healer",
      confidenceLevel: 0.85,
      relevantUsers: 247,
      timeframe: "Last 30 days",
      guidance: "Optimal time for emotional healing work...",
      createdAt: "2024-01-15T10:30:00Z"
    }
  ],
  metadata: {
    timestamp: "2024-01-15T12:00:00Z",
    totalResults: 1,
    filtersApplied: { ... }
  }
}
```

### Archetypal Processes

```javascript
await client.getArchetypalProcesses({
  element: 'fire',     // Optional filter
  archetype: 'Warrior', // Optional filter
  activeOnly: true     // Default true
});
```

**Response Format:**
```javascript
{
  success: true,
  data: [
    {
      id: "fire_warrior_integration",
      name: "Fire Warrior Integration",
      element: "fire", 
      archetype: "Warrior",
      description: "Process for integrating Fire Warrior archetype...",
      phases: ["Recognition", "Channeling", "Refinement", ...],
      practices: ["Dynamic breathwork", "Courage cultivation", ...],
      indicators: ["Increased confidence", "Balanced assertiveness", ...],
      integrationGuidance: "Balance fiery nature with earth grounding...",
      isActive: true
    }
  ]
}
```

### Elemental Wisdom

```javascript
await client.getElementalWisdom();
```

**Response Format:**
```javascript
{
  success: true,
  data: {
    fire: {
      element: "fire",
      principle: "Action and Transformation",
      currentTrend: "Balanced assertiveness and conscious leadership",
      guidance: "Channel fire energy through purposeful action...",
      practices: ["Dynamic breathwork", "Courage cultivation", ...],
      balance: "Ground with earth, temper with water wisdom"
    },
    // ... other elements
  }
}
```

### System Status

```javascript
await client.getSystemStatus();
```

## Error Handling

```javascript
try {
  const insights = await client.getCollectiveInsights();
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('API error:', error.message);
  }
}
```

## Data Privacy

- All insights are completely anonymized
- No personal information is exposed through the API
- User data is aggregated using privacy-preserving techniques

## Support

- Documentation: https://docs.spiralogic.oracle/ain-engine
- Issues: https://github.com/spiralogic/ain-engine-sdk/issues
- Contact: developers@spiralogic.oracle

## License

MIT License - See LICENSE file for details.