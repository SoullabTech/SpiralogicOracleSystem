# C4 Level 3: Backend Components

Detailed breakdown of the Backend Core container, showing internal components and their relationships.

```mermaid
flowchart TB
    subgraph API["🔌 API Layer"]
        OracleAPI[Oracle Routes<br/>/api/oracle/turn, /api/oracle/weave]
        MemoryAPI[Memory Routes<br/>/api/soul-memory/*]
        UploadAPI[Upload Routes<br/>/api/uploads/*]
        AdminAPI[Admin Routes<br/>/api/admin/*]
    end
    
    subgraph Orchestration["🎭 Agent Orchestration"]
        AdjusterAgent[Adjuster Agent<br/>Request routing & validation]
        GuideAgent[Guide Agent<br/>Learning pathway coordination]
        MentorAgent[Mentor Agent<br/>Wisdom synthesis]
        DreamAgent[Dream Agent<br/>Unconscious integration]
    end
    
    subgraph Elemental["🌊 Elemental Agents"]
        AirAgent[Air Agent<br/>Mental clarity & communication]
        EarthAgent[Earth Agent<br/>Grounding & manifestation]
        WaterAgent[Water Agent<br/>Emotional flow & intuition]
        FireAgent[Fire Agent<br/>Transformation & action]
        AetherAgent[Aether Agent<br/>Transcendence & unity]
    end
    
    subgraph CoreServices["⚙️ Core Services"]
        SoulMemoryService[Soul Memory Service<br/>Long-term memory management]
        MemoryIntegrationService[Memory Integration Service<br/>Cross-system memory sync]
        ModelService[Model Service<br/>LLM orchestration]
        OracleService[Oracle Service<br/>Response coordination]
    end
    
    subgraph Bridges["🌉 System Bridges"]
        SoulMemoryBridge[Soul Memory AIN Bridge<br/>backend/src/sacred/bridges/]
        PSIBridge[PSI Memory Bridge<br/>PSI system integration]
    end
    
    subgraph Utils["🔧 Core Utilities"]
        MemoryModule[Memory Module<br/>getRecentEntries(), addEntry()]
        OracleLogger[Oracle Logger<br/>System logging & tracing]
        RitualEngine[Ritual Engine<br/>Ceremonial processing]
        OpenAIClient[OpenAI Client<br/>API wrapper & rate limiting]
    end
    
    subgraph External["🌍 External Systems"]
        OpenAI[(OpenAI API)]
        Supabase[(Supabase DB)]
        SoulMemoryDB[(Soul Memory System)]
    end
    
    %% API to Orchestration
    OracleAPI --> AdjusterAgent
    OracleAPI --> GuideAgent
    MemoryAPI --> SoulMemoryService
    UploadAPI --> ModelService
    AdminAPI --> OracleService
    
    %% Orchestration flows
    AdjusterAgent --> GuideAgent
    GuideAgent --> MentorAgent
    MentorAgent --> DreamAgent
    
    %% Agent interactions
    AdjusterAgent --> AirAgent
    GuideAgent --> EarthAgent
    MentorAgent --> WaterAgent
    DreamAgent --> FireAgent
    AdjusterAgent --> AetherAgent
    
    %% Service integrations
    AirAgent --> ModelService
    EarthAgent --> SoulMemoryService
    WaterAgent --> MemoryIntegrationService
    FireAgent --> OracleService
    AetherAgent --> ModelService
    
    %% Bridge connections
    SoulMemoryService --> SoulMemoryBridge
    MemoryIntegrationService --> PSIBridge
    
    %% Utility usage
    ModelService --> OpenAIClient
    SoulMemoryService --> MemoryModule
    OracleService --> OracleLogger
    MemoryIntegrationService --> RitualEngine
    
    %% External connections
    OpenAIClient --> OpenAI
    SoulMemoryService --> Supabase
    SoulMemoryBridge --> SoulMemoryDB
    MemoryModule --> Supabase

    classDef apiStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef orchestrationStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef elementalStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef serviceStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef bridgeStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef utilStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px
    classDef externalStyle fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    
    class OracleAPI,MemoryAPI,UploadAPI,AdminAPI apiStyle
    class AdjusterAgent,GuideAgent,MentorAgent,DreamAgent orchestrationStyle
    class AirAgent,EarthAgent,WaterAgent,FireAgent,AetherAgent elementalStyle
    class SoulMemoryService,MemoryIntegrationService,ModelService,OracleService serviceStyle
    class SoulMemoryBridge,PSIBridge bridgeStyle
    class MemoryModule,OracleLogger,RitualEngine,OpenAIClient utilStyle
    class OpenAI,Supabase,SoulMemoryDB externalStyle
```

## Component Responsibilities

### API Layer
- **Oracle Routes**: Handle conversation turns and context weaving requests
- **Memory Routes**: Manage soul memory bookmarking and search operations  
- **Upload Routes**: Process file uploads and document analysis
- **Admin Routes**: Provide administrative functions and system monitoring

### Agent Orchestration
- **Adjuster Agent**: Routes requests and validates input parameters
- **Guide Agent**: Coordinates learning pathways and educational content
- **Mentor Agent**: Synthesizes wisdom from multiple sources and agents
- **Dream Agent**: Integrates unconscious insights and symbolic content

### Elemental Agents
- **Air Agent**: Handles mental clarity, communication, and idea generation
- **Earth Agent**: Manages grounding, practical manifestation, and stability
- **Water Agent**: Processes emotional flow, intuition, and adaptive responses
- **Fire Agent**: Drives transformation, action-oriented guidance, and passion
- **Aether Agent**: Facilitates transcendence, unity, and spiritual insights

### Core Services
- **Soul Memory Service**: Manages long-term memory storage and retrieval
- **Memory Integration Service**: Synchronizes memory across different systems
- **Model Service**: Orchestrates interactions with language models and embeddings
- **Oracle Service**: Coordinates response generation and agent collaboration

### System Bridges
- **Soul Memory AIN Bridge**: Connects to the Soul Memory System for enhanced context
- **PSI Memory Bridge**: Integrates with PSI (Personal Spiritual Intelligence) system

### Core Utilities
- **Memory Module**: Provides low-level memory operations (getRecentEntries, addEntry)
- **Oracle Logger**: Handles system logging, tracing, and debugging
- **Ritual Engine**: Processes ceremonial and ritual-based interactions
- **OpenAI Client**: Manages API calls, rate limiting, and error handling for OpenAI

## Key Interaction Patterns

1. **Request Flow**: API → Adjuster → Guide → Mentor → Dream → Elemental Agents
2. **Memory Integration**: Services ↔ Bridges ↔ External Memory Systems
3. **Model Orchestration**: Agents → Model Service → OpenAI Client → OpenAI API
4. **Logging & Monitoring**: All components → Oracle Logger → System logs

## File Locations

- **Agents**: `backend/src/agents/`
- **Services**: `backend/src/services/`
- **Bridges**: `backend/src/sacred/bridges/`
- **Utilities**: `backend/src/lib/`
- **API Routes**: `app/api/`