# Maya Memory Orchestration Specification
## Unified Memory Layer for Deep Intelligence

### Architecture Overview

```
User Input → Memory Orchestrator → Unified Context → Maya Response
                     ↓
        [Mem0] [LangChain] [Sesame] [Journal] [Session]
```

### Memory Strata

#### 1. Short-term (Session Context)
- **Storage**: In-memory conversation state
- **Scope**: Last N turns (configurable, default: 10)
- **Access**: Direct array lookup
- **Purpose**: Immediate conversational continuity
- **TTL**: Session duration

#### 2. Mid-term (Journal & Reflections)
- **Storage**: PostgreSQL/Supabase journaling tables
- **Index**: LangChain vector store (embeddings)
- **Scope**: Last 30 days of entries
- **Access**: Semantic search via embeddings
- **Purpose**: Personal themes, patterns, emotional arcs

#### 3. Long-term (Persistent Profile)
- **Storage**: Mem0 persistent store
- **Scope**: User profile, Spiralogic phase, oracle relationship history
- **Access**: Key-value lookup + semantic search
- **Purpose**: Evolving self-model, growth tracking

#### 4. Symbolic Layer (Sesame Integration)
- **Storage**: Sesame CSM service
- **Scope**: Archetypal resonances, elemental affinities, sacred geometry
- **Access**: Tagged enrichment, not raw retrieval
- **Purpose**: Depth dimension, symbolic coherence

#### 5. Shadow Memory (Optional)
- **Storage**: Encrypted journal entries with shadow tags
- **Scope**: Repressed patterns, integration work
- **Access**: Explicit request or crisis detection only
- **Purpose**: Deep psychological work

---

## MemoryManager Implementation

### Core Interface

```typescript
// lib/memory/MemoryManager.ts

export interface MemoryContext {
  session: ConversationTurn[];      // Last N turns
  journals: JournalEntry[];          // Relevant recent entries
  longTerm: UserProfile;             // Persistent profile from Mem0
  symbolic: ArchetypalContext | null; // Sesame enrichment
  shadow: ShadowEntry[] | null;      // Shadow work if relevant
  metadata: {
    timestamp: Date;
    phase: SpiralogicPhase;
    emotionalState: EmotionalVector;
    memoryQuality: 'full' | 'partial' | 'minimal';
  };
}

export class MemoryOrchestrator {
  private mem0Client: Mem0Client;
  private langchain: LangChainVectorStore;
  private sesame: SesameClient;
  private journalDb: JournalDatabase;
  
  async buildContext(
    userId: string,
    userInput: string,
    options?: MemoryOptions
  ): Promise<MemoryContext> {
    // Parallel fetch from all sources
    const [session, journals, profile, symbolic] = await Promise.all([
      this.getSessionContext(userId),
      this.getRelevantJournals(userId, userInput),
      this.getLongTermProfile(userId),
      this.getSymbolicEnrichment(userId, userInput)
    ]);
    
    // Rank and filter
    const filtered = this.rankAndFilter({
      session,
      journals,
      profile,
      symbolic
    });
    
    // Check for shadow relevance
    const shadow = await this.checkShadowRelevance(userInput, filtered);
    
    return {
      ...filtered,
      shadow,
      metadata: this.generateMetadata(userId, filtered)
    };
  }
}
```

### Memory Priority Algorithm

```typescript
// lib/memory/prioritizer.ts

export class MemoryPrioritizer {
  private weights = {
    recency: 0.4,        // How recent
    relevance: 0.3,      // Semantic similarity
    emotional: 0.2,      // Emotional intensity
    frequency: 0.1       // How often referenced
  };
  
  rank(entries: MemoryEntry[]): RankedMemory[] {
    return entries
      .map(entry => ({
        ...entry,
        score: this.calculateScore(entry)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CONTEXT_ITEMS);
  }
  
  private calculateScore(entry: MemoryEntry): number {
    const recencyScore = this.getRecencyScore(entry.timestamp);
    const relevanceScore = this.getRelevanceScore(entry.embedding);
    const emotionalScore = this.getEmotionalIntensity(entry.sentiment);
    const frequencyScore = this.getReferenceFrequency(entry.id);
    
    return (
      recencyScore * this.weights.recency +
      relevanceScore * this.weights.relevance +
      emotionalScore * this.weights.emotional +
      frequencyScore * this.weights.frequency
    );
  }
}
```

---

## Integration Points

### 1. Mem0 Integration

```typescript
// lib/memory/clients/Mem0Client.ts

export class Mem0Client {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const profile = await this.client.get(`user:${userId}:profile`);
    const phase = await this.client.get(`user:${userId}:spiralogic:phase`);
    const history = await this.client.search({
      userId,
      type: 'oracle_interaction',
      limit: 10
    });
    
    return {
      ...profile,
      currentPhase: phase,
      oracleHistory: history
    };
  }
  
  async updateMemory(userId: string, key: string, value: any): Promise<void> {
    await this.client.set(`user:${userId}:${key}`, value, {
      ttl: null, // Persistent
      indexed: true
    });
  }
}
```

### 2. LangChain Vector Store

```typescript
// lib/memory/clients/LangChainStore.ts

export class LangChainVectorStore {
  private vectorStore: VectorStore;
  
  async searchJournals(
    userId: string, 
    query: string, 
    limit = 5
  ): Promise<JournalEntry[]> {
    const embedding = await this.embedder.embed(query);
    
    const results = await this.vectorStore.similaritySearch(
      embedding,
      limit,
      {
        filter: { userId, type: 'journal' },
        threshold: 0.7
      }
    );
    
    return results.map(r => r.document as JournalEntry);
  }
  
  async indexJournal(entry: JournalEntry): Promise<void> {
    const embedding = await this.embedder.embed(entry.content);
    await this.vectorStore.addDocument({
      ...entry,
      embedding
    });
  }
}
```

### 3. Sesame Symbolic Layer

```typescript
// lib/memory/clients/SesameClient.ts

export class SesameClient {
  async getSymbolicContext(
    userId: string,
    input: string
  ): Promise<ArchetypalContext | null> {
    try {
      const analysis = await this.sesame.analyze({
        text: input,
        userId,
        mode: 'archetypal'
      });
      
      if (!analysis.hasSignificantSymbols) return null;
      
      return {
        dominantArchetype: analysis.archetype,
        elementalResonance: analysis.elements,
        geometricPattern: analysis.sacredGeometry,
        collectiveTheme: analysis.collectivePattern
      };
    } catch (error) {
      console.warn('Sesame enrichment failed, continuing without', error);
      return null;
    }
  }
}
```

---

## Pipeline Integration

### In ConversationalPipeline.ts

```typescript
// backend/src/services/ConversationalPipeline.ts

export class ConversationalPipeline {
  private memoryOrchestrator: MemoryOrchestrator;
  
  async processWithMemory(
    userId: string,
    userInput: string
  ): Promise<MayaResponse> {
    // 1. Build unified memory context
    const memoryContext = await this.memoryOrchestrator.buildContext(
      userId,
      userInput
    );
    
    // 2. Construct system prompt with all memory layers
    const systemPrompt = this.buildSystemPrompt(memoryContext);
    
    // 3. Generate response through LLM
    const response = await this.llm.generate({
      system: systemPrompt,
      user: userInput,
      temperature: 0.7,
      maxTokens: 150 // Keep responses concise
    });
    
    // 4. Update memory stores
    await this.updateMemoryStores(userId, userInput, response);
    
    // 5. Validate response mode
    const mode = this.detectResponseMode(response);
    
    return {
      content: response,
      mode,
      memoryUsed: memoryContext.metadata.memoryQuality,
      timestamp: new Date()
    };
  }
  
  private buildSystemPrompt(context: MemoryContext): string {
    const sections = [
      MAYA_RESPONSE_PROTOCOL,
      
      context.longTerm && `User Profile:
- Phase: ${context.longTerm.currentPhase}
- Preferences: ${JSON.stringify(context.longTerm.preferences)}
- Oracle Relationship: ${context.longTerm.oracleHistory?.length || 0} sessions`,
      
      context.journals.length > 0 && `Recent Journals:
${context.journals.map(j => `- ${j.date}: ${j.summary}`).join('\n')}`,
      
      context.session.length > 0 && `Conversation:
${context.session.map(t => `${t.role}: ${t.content}`).join('\n')}`,
      
      context.symbolic && `Archetypal Context:
- Dominant: ${context.symbolic.dominantArchetype}
- Elemental: ${context.symbolic.elementalResonance}`,
      
      `Current emotional state: ${context.metadata.emotionalState}`
    ];
    
    return sections.filter(Boolean).join('\n\n---\n\n');
  }
}
```

---

## Fallback Strategy

```typescript
// lib/memory/fallback.ts

export class MemoryFallbackHandler {
  async handlePartialFailure(
    failures: MemorySourceFailure[]
  ): Promise<MemoryContext> {
    // Priority fallback chain
    const fallbackChain = [
      'session',     // Always available (in-memory)
      'journals',    // Usually available (local DB)
      'longTerm',    // May fail (external service)
      'symbolic'     // Optional enrichment
    ];
    
    const context: Partial<MemoryContext> = {};
    
    for (const source of fallbackChain) {
      if (!failures.find(f => f.source === source)) {
        context[source] = await this.fetchFallback(source);
      }
    }
    
    return {
      ...context,
      metadata: {
        ...this.getDefaultMetadata(),
        memoryQuality: this.assessQuality(context)
      }
    } as MemoryContext;
  }
  
  private assessQuality(context: Partial<MemoryContext>): MemoryQuality {
    const sources = Object.keys(context).length;
    if (sources >= 4) return 'full';
    if (sources >= 2) return 'partial';
    return 'minimal';
  }
}
```

---

## Testing & Validation

### Memory Integration Tests

```typescript
// __tests__/memory-orchestration.test.ts

describe('MemoryOrchestrator', () => {
  it('should fetch from all sources in parallel', async () => {
    const context = await orchestrator.buildContext(userId, 'I feel stuck');
    
    expect(context).toHaveProperty('session');
    expect(context).toHaveProperty('journals');
    expect(context).toHaveProperty('longTerm');
    expect(context.metadata.memoryQuality).toBe('full');
  });
  
  it('should gracefully degrade on service failure', async () => {
    jest.spyOn(mem0Client, 'getUserProfile').mockRejectedValue(new Error());
    
    const context = await orchestrator.buildContext(userId, 'test');
    
    expect(context.longTerm).toBeNull();
    expect(context.metadata.memoryQuality).toBe('partial');
  });
  
  it('should rank memories by relevance and recency', async () => {
    const journals = await orchestrator.getRelevantJournals(userId, 'anxiety');
    
    expect(journals[0].relevanceScore).toBeGreaterThan(journals[1].relevanceScore);
    expect(journals).toHaveLength(5); // Max limit
  });
});
```

---

## Deployment Checklist

- [ ] Mem0 service configured and accessible
- [ ] LangChain vector store initialized with embeddings
- [ ] Sesame CSM endpoint available (with fallback)
- [ ] Journal DB indexed for semantic search
- [ ] Session store configured (Redis or in-memory)
- [ ] Memory prioritization weights tuned
- [ ] Fallback handlers tested
- [ ] Response mode validation working
- [ ] Memory update pipeline functional
- [ ] Performance monitoring enabled

---

## Performance Targets

- Memory context build: < 500ms
- Parallel fetch completion: < 300ms  
- Vector similarity search: < 100ms
- Total pipeline latency: < 2s
- Memory quality score: > 80% full contexts

---

## Next Steps

1. Implement MemoryOrchestrator class
2. Wire into ConversationalPipeline
3. Add memory quality monitoring
4. Test with beta users
5. Tune ranking weights based on user feedback