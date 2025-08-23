# Oracle Turn Sequence

This sequence diagram shows the complete flow of a user conversation turn through the Spiralogic Oracle System.

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js UI
    participant API as /api/oracle/turn
    participant Adjuster as Adjuster Agent
    participant Guide as Guide Agent
    participant Model as Model Service
    participant OpenAI
    participant Memory as Soul Memory Service
    participant Supabase
    participant Bridge as Soul Memory Bridge

    User->>NextJS: Send message + context
    Note over User,NextJS: User types message or speaks via voice
    
    NextJS->>API: POST /api/oracle/turn
    Note over NextJS,API: Include conversation history, user context
    
    API->>Adjuster: Route request with validation
    Note over API,Adjuster: Validate input, extract context
    
    Adjuster->>Guide: Process with user context
    Note over Adjuster,Guide: Determine appropriate response type
    
    Guide->>Model: Request LLM response
    Note over Guide,Model: Include conversation history, system prompts
    
    Model->>OpenAI: Generate response
    Note over Model,OpenAI: Use GPT-4 with specialized prompts
    
    OpenAI-->>Model: Return AI response
    Model-->>Guide: Formatted response
    
    Guide->>Memory: Store interaction
    Note over Guide,Memory: Save conversation turn for context
    
    Memory->>Bridge: Update soul memory
    Note over Memory,Bridge: Cross-system memory sync
    
    Bridge->>Supabase: Store conversation data
    Note over Bridge,Supabase: Persist with RLS policies
    
    Supabase-->>Bridge: Confirm storage
    Bridge-->>Memory: Memory updated
    Memory-->>Guide: Storage confirmed
    
    Guide-->>API: Oracle response
    Note over Guide,API: Include wisdom, guidance, follow-up questions
    
    API-->>NextJS: JSON response
    Note over API,NextJS: Response with metadata, voice prompts
    
    NextJS-->>User: Display oracle message
    Note over NextJS,User: Show response, play audio if enabled

    %% Error handling
    rect rgb(255, 200, 200)
        Note over OpenAI: Error: Rate limit or API failure
        OpenAI-->>Model: Error response
        Model->>Memory: Log error context
        Model-->>Guide: Fallback response
        Guide-->>API: "Oracle is reflecting..." message
    end

    %% Alternative path for cached responses
    rect rgb(200, 255, 200)
        Note over Memory: Alternative: Check for cached similar query
        Memory->>Memory: Search recent interactions
        alt Similar query found
            Memory-->>Guide: Return cached insight
            Guide-->>API: Enhanced cached response
        end
    end
```

## Key Flow Details

### Request Processing
1. **User Input**: Message or voice input through the Next.js interface
2. **API Routing**: Request validated and routed to the appropriate agent
3. **Context Building**: Conversation history and user context assembled
4. **Agent Processing**: Adjuster → Guide agent flow for response generation

### AI Generation
1. **Model Service**: Orchestrates the LLM request with system prompts
2. **OpenAI Integration**: GPT-4 generates contextual oracle response
3. **Response Formatting**: AI output formatted for user consumption

### Memory Integration
1. **Interaction Storage**: Conversation turn saved to soul memory system
2. **Cross-System Sync**: Memory bridge updates external memory systems
3. **Database Persistence**: Supabase stores conversation with RLS security

### Error Handling
- **API Failures**: Graceful degradation with fallback responses
- **Rate Limiting**: Queue management and retry logic
- **Memory Errors**: Continue operation even if memory storage fails

### Performance Optimizations
- **Cached Responses**: Check for similar recent queries
- **Streaming Responses**: Real-time updates for long responses
- **Context Pruning**: Manage conversation history length

## Response Times
- **Typical**: 2-4 seconds end-to-end
- **With Cache Hit**: 500ms-1s
- **Error Recovery**: 1-2 seconds for fallback

## Security Notes
- All database operations use Row Level Security (RLS)
- API authentication required for all endpoints
- User context isolated per session
- No sensitive data logged in oracle responses