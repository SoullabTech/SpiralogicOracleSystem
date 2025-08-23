# Oracle Weave Sequence

This sequence diagram shows the conversation thread weaving process, which creates meaningful summaries and recaps from recent conversation memories.

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js UI
    participant API as /api/oracle/weave
    participant Trace as Trace Middleware
    participant SoulClient as Soul Memory Client
    participant Memory as Memory Storage
    participant Reflection as Reflection Speech

    User->>NextJS: Request conversation recap
    Note over User,NextJS: User wants summary of recent conversation

    NextJS->>API: POST /api/oracle/weave
    Note over NextJS,API: Include conversationId, userId, turnCount

    API->>Trace: withTraceNext wrapper
    Note over API,Trace: Request tracing and monitoring

    API->>API: Validate request body (Zod)
    Note over API: conversationId required, turnCount 1-50

    API->>SoulClient: Dynamic import (lazy loading)
    Note over API,SoulClient: Better cold-start performance

    API->>SoulClient: initializeUserMemory(userId)
    Note over API,SoulClient: Timeout: 8 seconds
    
    SoulClient->>Memory: Initialize user memory context
    Memory-->>SoulClient: Memory context ready
    SoulClient-->>API: User memory initialized

    API->>SoulClient: retrieveConversationMemories(userId, conversationId)
    Note over API,SoulClient: Limit: 5, filterSensitive: true, Timeout: 10s

    SoulClient->>Memory: Query recent conversation memories
    Memory-->>SoulClient: Recent memory entries
    SoulClient-->>API: Filtered conversation memories

    API->>API: Process memories
    Note over API: Redact sensitive content (SSN, email, phone, CC)
    
    API->>API: extractMeaningfulQuote()
    Note over API: Extract key insight from latest memory

    alt No memories found
        API-->>NextJS: 404 - No memories for weaving
        NextJS-->>User: No conversation to summarize
    else Memories available
        API->>Reflection: buildRecap(userQuote, turnCount)
        Note over API,Reflection: Generate meaningful conversation summary
        
        Reflection-->>API: Woven recap text
        
        alt Weaving failed
            API-->>NextJS: 400 - Unable to weave thread
            NextJS-->>User: Summary generation failed
        else Weaving successful
            API->>SoulClient: storeBookmark(woven recap)
            Note over API,SoulClient: Save with metadata, Timeout: 10s
            
            SoulClient->>Memory: Store thread weave as bookmark
            Note over SoulClient,Memory: memoryType: 'thread_weave'
            
            Memory-->>SoulClient: Bookmark stored
            SoulClient-->>API: Bookmark ID returned
            
            API-->>NextJS: Success response
            Note over API,NextJS: Include woven text, bookmark ID, metadata
            
            NextJS-->>User: Display conversation recap
        end
    end

    %% Error handling flows
    rect rgb(255, 200, 200)
        Note over API: Timeout handling (12s total)
        
        alt Initialization timeout
            SoulClient-->>API: Timeout error (8s)
            API-->>NextJS: 504 - Service timeout
            
        else Memory retrieval timeout
            SoulClient-->>API: Timeout error (10s)
            API-->>NextJS: 504 - Service timeout
            
        else Storage timeout
            SoulClient-->>API: Timeout error (10s)
            API-->>NextJS: 504 - Service timeout
        end
    end

    %% Privacy protection
    rect rgb(200, 255, 200)
        Note over API: Privacy safeguards throughout
        
        API->>API: redactSensitiveContent()
        Note over API: Remove SSN, emails, phones, credit cards
        
        SoulClient->>Memory: filterSensitive: true
        Note over SoulClient,Memory: Server-side sensitive content filtering
    end
```

## Weave Processing Details

### Request Validation
1. **Required Fields**: `conversationId` must be provided
2. **Optional Fields**: `userId` (defaults to 'anonymous'), `turnCount` (1-50, defaults to 3)
3. **Zod Validation**: Type-safe request parsing with detailed error messages

### Memory Retrieval
1. **User Initialization**: Ensure user memory context exists
2. **Conversation Query**: Retrieve up to 5 recent memories with sensitive content filtering
3. **Processing**: Take last 3 memories, redact any remaining sensitive content
4. **Element Context**: Include elemental context (aether, air, earth, water, fire)

### Content Processing
1. **Quote Extraction**: Find meaningful quote from latest conversation turn
2. **Recap Generation**: Use reflection speech engine to build conversational summary
3. **Privacy Protection**: Multiple layers of sensitive content redaction

### Storage & Response
1. **Bookmark Creation**: Store woven recap as searchable bookmark
2. **Metadata**: Include session context, weave count, timestamps, user quote
3. **Response**: Return woven text, storage confirmation, and metadata

## Privacy & Security Features

### Sensitive Content Redaction
- **SSN Patterns**: `000-00-0000` format detection
- **Email Addresses**: Comprehensive email pattern matching
- **Phone Numbers**: `###-###-####` format detection  
- **Credit Cards**: 13-19 digit sequences with separators

### Multi-Layer Protection
- **Client-Side**: Initial content filtering before API call
- **API-Level**: `redactSensitiveContent()` function processing
- **Storage-Level**: `filterSensitive: true` in memory queries
- **Response-Level**: Final privacy check before user display

## Performance Optimizations

### Lazy Loading
- **Dynamic Imports**: Soul Memory Client loaded only when needed
- **Cold Start**: Reduces initial bundle size and improves response times
- **Error Isolation**: Clear error messages if imports fail

### Timeout Management
- **Operation Timeouts**: Each async operation has specific timeout limits
- **Total Request**: 12-second overall request timeout with early termination
- **Cleanup**: Proper timeout cleanup prevents resource leaks

### Memory Efficiency
- **Limited Retrieval**: Query only last 5 memories, process only 3
- **Filtered Content**: Server-side filtering reduces data transfer
- **Focused Processing**: Extract only meaningful quotes for weaving

## Error Handling

### Validation Errors (400)
- Invalid request body structure
- Missing required conversationId
- turnCount outside 1-50 range

### Not Found Errors (404)  
- No conversation memories available for weaving
- User memory context not found

### Timeout Errors (504)
- Memory initialization timeout (>8s)
- Memory retrieval timeout (>10s)
- Bookmark storage timeout (>10s)

### Server Errors (500)
- Weaving engine failures
- Storage system unavailable
- Unexpected processing errors

## Usage Patterns

### Typical Flow
1. User completes meaningful conversation with oracle
2. System offers "weave thread" option to create recap
3. User requests weave → meaningful summary generated
4. Summary stored as searchable bookmark for future reference

### Integration Points
- **Oracle Chat**: Post-conversation weaving option
- **Memory Search**: Woven recaps appear in memory search results
- **Progress Tracking**: Thread weaves show conversation evolution
- **Insight Collection**: Meaningful quotes extracted for user reflection