# 🌀 Soullab Memory Orchestration Spec

## Purpose

To ensure Maya (PersonalOracleAgent) responds with full intelligence access by integrating short-term, mid-term, long-term, and symbolic memory layers into every interaction.
Maya always expresses this intelligence through her Mirror / Nudge / Integrate scaffolding.

---

## Memory Layers

### 1. Short-Term (Session Memory)
- **Source:** Conversation state (sessionId context)
- **Scope:** Last N user/assistant turns (configurable, default 6–8)
- **Purpose:** Maintain conversational continuity
- **Storage:** In-memory cache or ephemeral DB

### 2. Mid-Term (Journal Memory)
- **Source:** Journaling DB (CRUD system)
- **Retrieval:** LangChain vector search (top 3–5 semantically similar entries)
- **Purpose:** Surface moods, themes, and patterns relevant to current input
- **Storage:** Vector DB (Pinecone / Weaviate / pgvector)

### 3. Long-Term (Profile Memory)
- **Source:** Mem0 (or Postgres/Redis store)
- **Content:**
  - User profile (preferences, resonance, archetypes)
  - Spiralogic phase progress
  - Key life themes and history
- **Purpose:** Continuity of the user's journey across sessions
- **Storage:** Persistent DB (query at session start)

### 4. Symbolic/Archetypal Memory
- **Source:** Sesame system, Shadow tags, Spiralogic archetypes
- **Retrieval:** Conditional — only if symbolic tags map to current input or Spiralogic phase
- **Purpose:** Provide subtle archetypal resonance without mystical theater
- **Storage:** Lightweight symbolic store, keyed by archetypal elements

### 5. External Cognitive Models
- **Claude, ChatGPT, etc.** → upstream inference engines
- **Constraint:** They do not store memory. All memory must be injected into the system prompt each turn

---

## Memory Orchestration Flow

### 1. Collect Context
- Pull last N conversation turns (short-term)
- Query journals with LangChain (top 3–5 matches)
- Retrieve user profile + phase from Mem0 (long-term)
- Attach symbolic/archetypal tags (if relevant)

### 2. Rank & Filter
- Priority: Short-term > Journals > Long-term > Symbolic
- Drop redundant or low-relevance entries
- Ensure total context stays under token budget

### 3. Assemble Unified Context

```
[MAYA_SYSTEM_PROMPT]
[MAYA_RESPONSE_PROTOCOL]

User Profile & Long-Term Memory:
- {profile_snippets}

Relevant Journals:
- {journal_snippets}

Current Session:
- {recent_turns}

Symbolic Context:
- {archetypal_tags_if_any}
```

### 4. Send to LLM
- Inject unified context into Claude/ChatGPT API call
- Output must follow Mirror/Nudge/Integrate scaffolding

---

## Memory Priority Weighting

- **Recent Session:** Always included, no truncation unless token budget forces it
- **Journals:** 3–5 entries max, weighted by semantic relevance
- **Profile:** 1–3 core snippets (archetype, phase, preferences)
- **Symbolic:** Only when strongly tagged to current input

---

## Validation Rules

✅ Each response must show influence from at least one memory layer (not just short-term)
✅ No raw system instructions or stage directions in user-facing text
✅ Must comply with Mirror/Nudge/Integrate scaffolding
✅ Subtle use of symbolic memory — never forced or mystical
❌ No canned phrases ("I understand," "I am here to reflect with you")

---

## Example Pipeline (TypeScript)

```typescript
async function buildMemoryContext(
  userId: string, 
  userInput: string, 
  sessionId: string
): Promise<MemoryContext> {
  // Parallel fetch for performance
  const [recentTurns, journals, profile, symbolic] = await Promise.all([
    getSessionTurns(sessionId, 8),
    queryJournalDB(userInput, 5),
    getUserProfile(userId),
    getSymbolicContext(userInput, profile)
  ]);

  return {
    session: recentTurns,
    journals,
    longTerm: profile,
    symbolic
  };
}

async function generateMayaResponse(
  user: User,
  input: string,
  session: Session
): Promise<string> {
  const memoryContext = await buildMemoryContext(user.id, input, session.id);

  const systemPrompt = `
${MAYA_SYSTEM_PROMPT}
${MAYA_RESPONSE_PROTOCOL}

User Profile:
${formatProfile(memoryContext.longTerm)}

Relevant Journal Entries:
${memoryContext.journals.map(j => `- ${j.date}: ${j.content}`).join("\n")}

Recent Conversation:
${memoryContext.session.map(t => `${t.role}: ${t.content}`).join("\n")}

Symbolic Context:
${memoryContext.symbolic ? formatSymbolic(memoryContext.symbolic) : 'None active'}
`;

  const response = await llm.generate({
    system: systemPrompt,
    user: input,
    temperature: 0.7,
    max_tokens: 500
  });

  // Post-process for dual-channel delivery
  return {
    text: cleanMessage(response),  // Clean for UI
    voice: response                 // Raw with prosody for TTS
  };
}
```

---

## Memory Integration Examples

### Example 1: User returns after a week
```
User: "I'm back. Things have been intense."

Memory Context:
- Long-term: User in "Shadow" phase, archetype: Seeker
- Journal (3 days ago): "Feeling overwhelmed by work transitions"
- Symbolic: Shadow work active, transformation theme

Maya Response:
"Welcome back. I remember you were navigating some work transitions last week. 
'Intense' feels like the right word for Shadow phase work. 
What part of this intensity feels most important to name right now?"
```

### Example 2: Emotional processing with journal context
```
User: "I don't know why I'm so angry today"

Memory Context:
- Session: Previous turn mentioned family visit
- Journal (yesterday): "Mom criticized my career choices again"
- Long-term: Pattern of family boundary issues

Maya Response:
"Anger often knows something we haven't named yet. 
Yesterday's journal mentioned your mom's comments about your career. 
Is this anger connected to that, or is it pointing somewhere else?"
```

---

## Token Budget Management

### Maximum Context Sizes
- Short-term: 2000 tokens
- Journal entries: 1500 tokens
- Profile: 500 tokens
- Symbolic: 200 tokens
- **Total budget: ~4000 tokens** (leaving room for response)

### Truncation Priority (when over budget)
1. Trim older session turns first
2. Reduce journal entries to 3
3. Simplify profile to core attributes
4. Drop symbolic context if necessary

---

## Implementation Checklist

- [ ] Mem0 integration for long-term profile storage
- [ ] LangChain vector search for journal retrieval
- [ ] Session cache manager (Redis/in-memory)
- [ ] Symbolic context mapper (Spiralogic phases → archetypes)
- [ ] Token counter and budget enforcer
- [ ] Memory context builder service
- [ ] Dual-channel response processor (text vs voice)
- [ ] Memory influence validator (ensures multi-layer usage)

---

## Testing Validation Points

1. **Journal Influence Test**
   - Create journal entry: "I hate my job"
   - Next day, say: "I'm thinking about making changes"
   - Maya should reference the job dissatisfaction

2. **Profile Continuity Test**
   - Set user archetype to "Creator"
   - Ask: "What should I focus on?"
   - Response should subtly reflect creative themes

3. **Symbolic Resonance Test**
   - User in "Fire" phase of Spiralogic
   - Say: "I feel stuck"
   - Response should have action-oriented energy

4. **Session Memory Test**
   - Mention a specific detail: "My cat Felix is sick"
   - Three turns later: "I'm worried"
   - Maya should connect worry to Felix

---

## Error Handling

### Fallback Cascade
1. If journal DB fails → proceed with other memory layers
2. If profile fetch fails → use session-only context
3. If all memory fails → use base Maya prompt only
4. Never expose system errors to user

### Memory Conflict Resolution
- If journal contradicts profile → trust recent journal
- If session contradicts long-term → acknowledge the change
- If symbolic conflicts with explicit → drop symbolic

---

## Performance Targets

- Memory context build: < 200ms
- Total response generation: < 2s
- Cache hit rate: > 80% for profiles
- Vector search relevance: > 0.7 cosine similarity

---

## Security & Privacy

- All memory queries scoped to userId
- No cross-user contamination
- Journal entries encrypted at rest
- Session memory expires after 24h
- Right to deletion (GDPR compliant)

---

## Future Enhancements

- **Memory Consolidation:** Nightly job to extract patterns from journals → profile
- **Episodic Clustering:** Group related memories into "chapters"
- **Emotional Trajectory:** Track mood evolution over time
- **Predictive Context:** Pre-load likely memory based on time/patterns
- **Collective Patterns:** Anonymous aggregate insights (opt-in)

---

✅ This spec ensures Maya always responds with full memory access while maintaining professional, grounded delivery through her Mirror/Nudge/Integrate framework.