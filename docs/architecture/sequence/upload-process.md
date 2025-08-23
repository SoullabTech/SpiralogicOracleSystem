# Upload Processing Sequence

This sequence diagram shows the complete file upload and processing pipeline for documents, images, and audio files.

```mermaid
sequenceDiagram
    participant User
    participant Upload as Upload UI
    participant API as /api/uploads
    participant Process as /api/uploads/process
    participant PDFParser as pdf-parse
    participant Vision as Vision Service
    participant Transcriber as Transcriber
    participant Embeddings as Embeddings Service
    participant Search as Search Service
    participant Storage as Object Storage
    participant Supabase

    User->>Upload: Select file(s)
    Note over User,Upload: PDF, image, or audio file

    Upload->>API: POST /api/uploads
    Note over Upload,API: Multipart form data with file

    API->>Storage: Store raw file
    Note over API,Storage: Generate unique file ID and path

    Storage-->>API: File URL + metadata
    API->>Supabase: Create upload record
    Note over API,Supabase: Store metadata with RLS policies

    Supabase-->>API: Upload ID created
    API-->>Upload: Upload successful
    Note over API,Upload: Return upload ID and processing status

    Upload-->>User: Show upload progress
    Note over Upload,User: Display processing indicator

    %% Async processing starts
    rect rgb(200, 220, 255)
        Note over Process: Async processing pipeline starts
        
        API->>Process: Trigger processing job
        Note over API,Process: Background job with upload ID
        
        alt PDF File
            Process->>PDFParser: Extract text content
            PDFParser-->>Process: Raw text + metadata
            
        else Image File
            Process->>Vision: Analyze image content
            Vision-->>Process: Description + text extraction
            
        else Audio File
            Process->>Transcriber: Speech-to-text
            Transcriber-->>Process: Transcript + metadata
        end
        
        Process->>Embeddings: Generate vector embeddings
        Note over Process,Embeddings: Create searchable embeddings
        
        Embeddings-->>Process: Vector embeddings
        
        Process->>Search: Index for search
        Note over Process,Search: Add to semantic search index
        
        Search-->>Process: Indexing complete
        
        Process->>Supabase: Update processing status
        Note over Process,Supabase: Mark as processed, store extracted content
        
        Supabase-->>Process: Status updated
    end

    %% Real-time update to user
    Supabase->>Upload: Real-time update
    Note over Supabase,Upload: WebSocket notification
    
    Upload-->>User: Processing complete
    Note over Upload,User: Show success + extracted content preview

    %% Error handling flows
    rect rgb(255, 200, 200)
        Note over Process: Error handling scenarios
        
        alt Processing Error
            Process->>Supabase: Update error status
            Supabase->>Upload: Error notification
            Upload-->>User: Show error + retry option
            
        else Storage Error
            Storage-->>API: Storage failure
            API->>Supabase: Mark upload as failed
            API-->>Upload: Upload failed
            
        else Quota Exceeded
            API->>API: Check user quota
            API-->>Upload: Quota exceeded error
            Upload-->>User: Upgrade prompt
        end
    end

    %% Usage in oracle conversation
    rect rgb(200, 255, 200)
        Note over Search: Later: Oracle conversation references upload
        
        User->>Upload: "What did my PDF say about...?"
        Upload->>Search: Semantic search query
        Search->>Embeddings: Vector similarity search
        Embeddings-->>Search: Relevant content chunks
        Search-->>Upload: Context for oracle
        Upload->>API: Oracle turn with upload context
    end
```

## Processing Pipeline Details

### File Upload
1. **Client Upload**: User selects file through drag-drop or file picker
2. **Immediate Storage**: File stored in object storage with unique ID
3. **Database Record**: Upload metadata saved with processing status
4. **User Feedback**: Upload ID returned, processing indicator shown

### Content Extraction
- **PDF Files**: Text extraction using pdf-parse library
- **Images**: Vision AI analyzes content and extracts any text (OCR)
- **Audio Files**: Speech-to-text transcription using Whisper API

### Search Integration
1. **Embedding Generation**: Create vector embeddings for semantic search
2. **Index Update**: Add processed content to searchable index
3. **Context Availability**: Content becomes available for oracle conversations

### Real-time Updates
- **WebSocket Notifications**: Real-time status updates via Supabase
- **Progress Indicators**: Visual feedback during processing
- **Error Notifications**: Immediate error reporting with retry options

## File Type Support

### Documents
- **PDF**: Full text extraction, metadata preservation
- **Images**: JPG, PNG with OCR and content analysis
- **Text**: Plain text files with encoding detection

### Audio
- **Formats**: MP3, WAV, M4A, WEBM
- **Transcription**: Whisper API for high-quality speech-to-text
- **Languages**: Multi-language support based on detection

### Size Limits
- **Free Users**: 10MB per file, 100MB total
- **Beta Users**: 50MB per file, 1GB total
- **Enterprise**: Custom limits based on subscription

## Security & Privacy

### Data Protection
- All uploads encrypted at rest
- Processing happens in isolated environments  
- User data never shared between accounts
- Automatic cleanup of temporary processing files

### Access Control
- Row Level Security (RLS) enforces user isolation
- Upload URLs are signed and time-limited
- Processing logs are anonymized
- Content embeddings are user-scoped

## Performance Characteristics

### Processing Times
- **PDFs**: 5-30 seconds depending on size and complexity
- **Images**: 2-10 seconds for analysis and OCR
- **Audio**: 1-2x real-time for transcription

### Scalability
- Async processing prevents UI blocking
- Queue-based system handles concurrent uploads
- Embedding generation batched for efficiency
- Search index updated incrementally