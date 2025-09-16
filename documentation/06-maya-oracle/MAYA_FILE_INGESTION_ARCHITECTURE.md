# 📂 Maya File Ingestion Architecture

## 🎯 Overview
Transform Maya from conversational companion → wisdom oracle who weaves insights from user's personal knowledge library.

---

## 1️⃣ API Design

### Upload Endpoint
```typescript
POST /api/oracle/files/upload
Content-Type: multipart/form-data

Request:
- file: File (max 10MB initially)
- metadata: {
    category?: "journal" | "reference" | "wisdom" | "personal"
    tags?: string[]
    visibility?: "private" | "maya-only"
    emotionalWeight?: 0-1 (how meaningful to user)
  }

Response:
{
  fileId: string
  status: "uploading" | "processing" | "ready" | "failed"
  filename: string
  mimeType: string
  size: number
  processingEstimate: number // seconds
  mayaInsight: string // Initial acknowledgment from Maya
}
```

### Status Check
```typescript
GET /api/oracle/files/:fileId/status

Response:
{
  fileId: string
  status: "processing" | "ready" | "failed"
  progress: number // 0-100
  extractedPages?: number
  embeddingCount?: number
  mayaReflection?: string // When ready
  error?: string
}
```

### File Library
```typescript
GET /api/oracle/files/library

Response:
{
  files: [{
    fileId: string
    filename: string
    uploadedAt: Date
    category: string
    tags: string[]
    citationCount: number // How often Maya references
    lastAccessed?: Date
    mayaSummary: string // Maya's understanding
  }]
}
```

---

## 2️⃣ Database Schema

### Supabase Tables

```sql
-- File metadata storage
CREATE TABLE user_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT, -- Supabase bucket path
  category TEXT DEFAULT 'reference',
  tags TEXT[],
  emotional_weight DECIMAL(3,2) DEFAULT 0.5,
  status TEXT DEFAULT 'uploading',
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- File content chunks with embeddings
CREATE TABLE file_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES user_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  chunk_index INTEGER,
  content TEXT, -- Original text chunk
  embedding vector(1536), -- OpenAI embeddings
  metadata JSONB, -- Page number, section, etc
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track file citations in conversations
CREATE TABLE file_citations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES user_files(id),
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id),
  cited_chunk_id UUID REFERENCES file_embeddings(id),
  relevance_score DECIMAL(5,4),
  context TEXT, -- How Maya used it
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_file_embeddings_user ON file_embeddings(user_id);
CREATE INDEX idx_file_embeddings_vector ON file_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## 3️⃣ Backend Implementation

### File Ingestion Service
```typescript
// src/services/FileIngestionService.ts
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export class FileIngestionService {
  private supabase = createClient(/*...*/);
  private openai = new OpenAI();
  
  async processFile(fileId: string): Promise<void> {
    // 1. Fetch file from storage
    const file = await this.fetchFile(fileId);
    
    // 2. Extract text based on type
    const chunks = await this.extractAndChunk(file);
    
    // 3. Generate embeddings
    const embeddings = await this.generateEmbeddings(chunks);
    
    // 4. Store in vector DB
    await this.storeEmbeddings(fileId, embeddings);
    
    // 5. Generate Maya's initial reflection
    const reflection = await this.generateMayaReflection(chunks);
    
    // 6. Update status
    await this.updateFileStatus(fileId, 'ready', reflection);
  }
  
  private async extractAndChunk(file: Buffer, mimeType: string): Promise<string[]> {
    let text = '';
    
    switch(mimeType) {
      case 'application/pdf':
        const pdfData = await pdfParse(file);
        text = pdfData.text;
        break;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const result = await mammoth.extractRawText({ buffer: file });
        text = result.value;
        break;
        
      case 'text/plain':
      case 'text/markdown':
        text = file.toString('utf-8');
        break;
        
      case 'application/json':
        const json = JSON.parse(file.toString('utf-8'));
        text = JSON.stringify(json, null, 2);
        break;
    }
    
    // Intelligent chunking with overlap
    return this.smartChunk(text, {
      maxTokens: 500,
      overlap: 50,
      preserveSentences: true
    });
  }
  
  private smartChunk(text: string, options): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    let currentChunk = '';
    let tokenCount = 0;
    
    for (const sentence of sentences) {
      const sentenceTokens = this.countTokens(sentence);
      
      if (tokenCount + sentenceTokens > options.maxTokens) {
        chunks.push(currentChunk.trim());
        // Add overlap from previous chunk
        currentChunk = chunks.length > 0 
          ? this.getOverlap(currentChunk, options.overlap)
          : '';
        tokenCount = this.countTokens(currentChunk);
      }
      
      currentChunk += ' ' + sentence;
      tokenCount += sentenceTokens;
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  private async generateEmbeddings(chunks: string[]) {
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        });
        
        return {
          content: chunk,
          embedding: response.data[0].embedding,
          chunkIndex: index,
          tokenCount: this.countTokens(chunk)
        };
      })
    );
    
    return embeddings;
  }
  
  private async generateMayaReflection(chunks: string[]): Promise<string> {
    // Sample beginning and end for context
    const preview = chunks.slice(0, 2).join('\n...\n') + 
                   '\n...\n' + 
                   chunks.slice(-2).join('\n...\n');
    
    const prompt = `As Maya, reflect on this uploaded content with your archetypal wisdom.
    Be brief but insightful. Content preview:
    
    ${preview}
    
    Offer a single sentence that acknowledges what you've absorbed.`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.8
    });
    
    return response.choices[0].message.content || 
           "I've woven your knowledge into my understanding.";
  }
}
```

### Memory Integration
```typescript
// src/services/FileMemoryIntegration.ts
export class FileMemoryIntegration {
  async retrieveRelevantFiles(
    userId: string, 
    query: string, 
    limit: number = 5
  ): Promise<FileContext[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Vector similarity search
    const { data: relevantChunks } = await this.supabase
      .rpc('match_file_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.75,
        match_count: limit,
        user_id: userId
      });
    
    // Group by file and prepare context
    return this.prepareFileContext(relevantChunks);
  }
  
  private prepareFileContext(chunks): FileContext[] {
    const fileGroups = new Map();
    
    chunks.forEach(chunk => {
      if (!fileGroups.has(chunk.file_id)) {
        fileGroups.set(chunk.file_id, {
          fileId: chunk.file_id,
          filename: chunk.filename,
          category: chunk.category,
          relevantChunks: []
        });
      }
      
      fileGroups.get(chunk.file_id).relevantChunks.push({
        content: chunk.content,
        relevance: chunk.similarity,
        metadata: chunk.metadata
      });
    });
    
    return Array.from(fileGroups.values());
  }
}
```

---

## 4️⃣ Frontend Components

### Upload Interface
```typescript
// app/components/FileUploadZone.tsx
import { useDropzone } from 'react-dropzone';
import { uploadFile, checkStatus } from '@/lib/fileUpload';

export function FileUploadZone({ onUploadComplete }) {
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>();
  
  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await processFileUpload(file);
      }
    }
  });
  
  async function processFileUpload(file: File) {
    // Upload file
    const { fileId, processingEstimate } = await uploadFile(file);
    
    // Poll for completion
    const interval = setInterval(async () => {
      const status = await checkStatus(fileId);
      setUploadProgress(prev => new Map(prev).set(fileId, status.progress));
      
      if (status.status === 'ready') {
        clearInterval(interval);
        onUploadComplete(fileId, status.mayaReflection);
      }
    }, 2000);
  }
  
  return (
    <div {...getRootProps()} className="border-2 border-dashed border-sacred-gold/30 
                                         rounded-lg p-8 text-center hover:border-sacred-gold/60 
                                         transition-colors cursor-pointer">
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 mx-auto mb-4 text-sacred-gold" />
      <p className="text-sm text-gray-400">
        Drop your wisdom here, or click to select files
      </p>
      <p className="text-xs text-gray-500 mt-2">
        PDF, Text, Markdown, JSON, CSV (max 10MB)
      </p>
    </div>
  );
}
```

### Maya's Library Sidebar
```typescript
// app/components/MayaLibrary.tsx
export function MayaLibrary({ userId }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  useEffect(() => {
    fetchUserLibrary();
  }, [userId]);
  
  return (
    <div className="w-64 bg-black/40 border-l border-sacred-gold/20 p-4">
      <h3 className="text-sacred-gold mb-4">Maya's Library</h3>
      
      <div className="space-y-2">
        {files.map(file => (
          <div 
            key={file.fileId}
            onClick={() => setSelectedFile(file)}
            className="p-2 rounded hover:bg-sacred-gold/10 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileIcon type={file.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.filename}</p>
                <p className="text-xs text-gray-500">
                  {file.citationCount} citations
                </p>
              </div>
            </div>
            
            {file.mayaSummary && (
              <p className="text-xs italic text-sacred-gold/60 mt-1">
                "{file.mayaSummary}"
              </p>
            )}
          </div>
        ))}
      </div>
      
      <FileUploadZone 
        onUploadComplete={(fileId, reflection) => {
          toast.success(reflection);
          fetchUserLibrary();
        }}
      />
    </div>
  );
}
```

---

## 5️⃣ Processing Queue

### Bull Queue for Async Processing
```typescript
// src/queues/fileProcessor.ts
import Bull from 'bull';
import { FileIngestionService } from '../services/FileIngestionService';

export const fileProcessingQueue = new Bull('file-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

fileProcessingQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  const service = new FileIngestionService();
  
  try {
    await service.processFile(fileId);
    
    // Notify user via websocket
    notifyUser(userId, {
      type: 'file-ready',
      fileId,
      message: 'Your knowledge has been woven into my understanding.'
    });
    
  } catch (error) {
    console.error('File processing failed:', error);
    await service.updateFileStatus(fileId, 'failed', error.message);
  }
});
```

---

## 6️⃣ Integration with PersonalOracleAgent

```typescript
// In PersonalOracleAgent.ts
async buildContext(userId: string, message: string) {
  const contexts = await Promise.all([
    // Existing contexts
    this.memoryOrchestrator.getRelevantMemories(userId, message),
    this.journalService.getRelevantJournals(userId, message),
    
    // NEW: File context
    this.fileMemory.retrieveRelevantFiles(userId, message)
  ]);
  
  return {
    memories: contexts[0],
    journals: contexts[1],
    files: contexts[2].map(f => ({
      source: f.filename,
      content: f.relevantChunks.map(c => c.content).join('\n'),
      relevance: f.relevantChunks[0].relevance
    }))
  };
}
```

---

## 7️⃣ Safety & Filtering

```typescript
// src/services/ContentSanitizer.ts
export class ContentSanitizer {
  private piiPatterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
  };
  
  sanitize(text: string, options = { removePII: true }): string {
    if (!options.removePII) return text;
    
    let sanitized = text;
    
    Object.entries(this.piiPatterns).forEach(([type, pattern]) => {
      sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
    });
    
    return sanitized;
  }
}
```

---

## 🚀 Implementation Plan

1. **Phase 1: Core Upload** (Week 1)
   - Basic file upload API
   - Storage in Supabase
   - Simple text extraction

2. **Phase 2: Intelligence** (Week 2)
   - Embedding generation
   - Vector search integration
   - Maya reflection generation

3. **Phase 3: UI Polish** (Week 3)
   - Drag-drop interface
   - Library management
   - Progress indicators

4. **Phase 4: Advanced** (Week 4)
   - Image support with captions
   - Audio transcription
   - Multi-file relationships

---

## 🎯 Success Metrics

- Upload success rate > 95%
- Processing time < 30s for 10-page PDF
- Relevant file citation in 70% of applicable queries
- User engagement with uploaded content > 3x per session

---

This architecture transforms Maya into a true oracle who can weave wisdom from the user's personal knowledge garden! 🌱✨