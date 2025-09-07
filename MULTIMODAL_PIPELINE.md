# 🎭 MULTIMODAL PIPELINE — Maya's Complete Sensory Experience

**Production-Ready Architecture for File Uploads + Voice Input + TTS Response**

Maya transforms from text-only to a complete multimodal personal oracle agent that can see, hear, speak, and remember across all interaction modes.

---

## 🎯 Architecture Overview

### **Multimodal Data Flow**
```
┌───────────────────────────────────────────────────────────────────────┐
│                        UNIFIED MAYA PIPELINE                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ✍️ TEXT        🎙️ VOICE        📂 FILES        🌐 URLs              │
│     │              │              │              │                   │
│     └──────────────┼──────────────┼──────────────┘                   │
│                    │              │                                  │
│                    └──────────────┘                                  │
│                            │                                         │
│                    ┌───────▼───────┐                                 │
│                    │ INPUT PROCESS │                                 │
│                    │ • Whisper STT │                                 │
│                    │ • File Parser │                                 │
│                    │ • URL Extractor│                                │
│                    │ • OCR/Vision  │                                 │
│                    └───────┬───────┘                                 │
│                            │                                         │
│                    ┌───────▼───────┐                                 │
│                    │ 🧠 UNIFIED    │                                 │
│                    │    MEMORY     │                                 │
│                    │ • Session     │                                 │
│                    │ • Journals    │                                 │
│                    │ • Profile     │                                 │
│                    │ • Symbolic    │                                 │
│                    │ • External    │                                 │
│                    └───────┬───────┘                                 │
│                            │                                         │
│                    ┌───────▼───────┐                                 │
│                    │ 🌱 MAYA       │                                 │
│                    │ INTELLIGENCE  │                                 │
│                    │ Mirror→Nudge  │                                 │
│                    │ →Integrate    │                                 │
│                    └───────┬───────┘                                 │
│                            │                                         │
│                   ┌────────┴────────┐                                │
│                   │                 │                                │
│           ┌───────▼───────┐ ┌───────▼───────┐                        │
│           │ 💬 CLEAN TEXT │ │ 🔊 PROSODY    │                        │
│           │ • UI Display  │ │ • Sesame TTS  │                        │
│           │ • Readable    │ │ • ElevenLabs  │                        │
│           │ • Structured  │ │ • Voice Player│                        │
│           └───────────────┘ └───────────────┘                        │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### **Service Dependencies**
```yaml
Core Services:
  - MemoryOrchestrator: Unified memory across all input types
  - ConversationalPipeline: Maya's response generation engine
  - TTSOrchestrator: Voice synthesis with fallbacks

Input Services:
  - FileUploadService: Secure file handling + content extraction
  - WhisperSTTService: Speech-to-text transcription
  - VisionService: Image OCR and analysis
  - URLAnalysisService: Web scraping + content sanitization + storage

Output Services:
  - SesameTTS: Primary voice synthesis
  - ElevenLabsService: Fallback voice synthesis
  - VoicePlayer: Audio delivery and controls

Storage:
  - Supabase: Files, transcripts, memory persistence
  - Local Cache: Session data, audio buffers
```

---

## 🔧 Implementation Architecture

### **1. File Upload Infrastructure**

**Frontend Components:**
```typescript
// FileUpload.tsx - Drag & drop + file picker
interface FileUploadProps {
  onFileUploaded: (fileData: UploadedFile) => void;
  maxSize: number; // 20MB default
  acceptedTypes: string[];
}

// ChatFileDisplay.tsx - Shows uploaded files in chat
interface UploadedFile {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  extractedContent?: string;
  processingStatus: 'uploading' | 'processing' | 'ready' | 'error';
}
```

**Backend API:**
```typescript
// /api/oracle/upload
POST /api/oracle/upload
{
  multipart/form-data
  file: <File>
  userId: string
  sessionId: string
}

Response:
{
  success: true,
  fileId: "uuid",
  filename: "document.pdf",
  extractedContent: "...",
  memoryIntegration: {
    journalEntryCreated: true,
    themes: ["work", "planning"],
    symbols: ["document", "analysis"]
  }
}
```

**Content Processing Pipeline:**
```typescript
// FileProcessor.ts
interface ContentProcessor {
  processFile(file: File, userId: string): Promise<ProcessedContent>;
}

// Supported processors
- PDFProcessor: Extract text with pdf-parse
- ImageProcessor: OCR with OpenAI Vision or Tesseract
- TextProcessor: Clean and structure plain text
- DocxProcessor: Extract from Word documents
```

### **1.5. URL Analysis Infrastructure** 🌐

**Complete URL-to-Memory Pipeline**

**Frontend Components:**
```typescript
// URLInput.tsx - Paste URL for analysis
interface URLInputProps {
  onURLAnalyzed: (urlData: AnalyzedURL) => void;
  placeholder?: string;
  autoAnalyze?: boolean;
}

interface AnalyzedURL {
  id: string;
  url: string;
  title: string;
  domain: string;
  summary: string;
  extractedContent: string;
  processingStatus: 'analyzing' | 'ready' | 'error';
  memoryIntegration: {
    storedInExternal: boolean;
    themes: string[];
    connections: string[];
    mayaInsight: string;
  };
  metadata: {
    wordCount: number;
    readingTime: number;
    publishDate?: string;
    author?: string;
    contentType: 'article' | 'blog' | 'documentation' | 'news' | 'other';
  };
}
```

**Backend Route: /api/oracle/url/analyze**
```typescript
// URL Analysis Pipeline
POST /api/oracle/url/analyze
{
  "url": "https://example.com/article",
  "userId": "user_123", 
  "immediate": true // Include in current session
}

Response:
{
  "urlData": AnalyzedURL,
  "mayaResponse": "I see this article about... how does it relate to your recent journal entry about...?",
  "memoryStatus": "stored_as_external_reference"
}
```

**Processing Pipeline:**
1. **Fetch & Sanitize**: Retrieve URL content with 5s timeout
2. **Extract Content**: Use Readability.js for main content extraction  
3. **Summarize & Tag**: Generate summary + extract themes
4. **Store External Memory**: Save to external_memory table with tags
5. **Immediate Integration**: Include in current session context
6. **Maya Integration**: Generate contextual response connecting to user's existing knowledge

**Security & Performance:**
```typescript
// URLAnalysisService.ts
interface URLAnalysisOptions {
  maxSize: number; // 2MB limit
  timeout: number; // 5s timeout
  allowPrivate: boolean; // false (block localhost, private IPs)
  contentTypes: string[]; // ['text/html', 'text/plain']
}

// Error Handling
- Timeout > 5s → "Content too large to analyze quickly"
- Invalid URL → "Please check the URL format" 
- Private/blocked → "Cannot access private or restricted URLs"
- Size > 2MB → "Content too large, please try a smaller page"
```

**Memory Integration:**
```typescript
// External memory storage
interface ExternalMemoryEntry {
  id: string;
  userId: string;
  sourceType: 'url' | 'file';
  sourceUrl?: string;
  title: string;
  content: string; // Full extracted content
  summary: string; // AI-generated summary
  themes: string[]; // Extracted themes
  createdAt: string;
  metadata: object;
}

// Memory Orchestrator integration
- URLs stored as external_memory records
- Accessible in future sessions via memory orchestration
- Ranked by relevance to current conversation
- Referenced naturally: "Based on that article you shared about..."
```

**Backend API:**
```typescript
// /api/oracle/url/analyze
POST /api/oracle/url/analyze
{
  url: "https://example.com/article",
  userId: string,
  sessionId: string
}

Response:
{
  success: true,
  urlId: "uuid",
  title: "Article Title",
  domain: "example.com",
  summary: "Article summary...",
  extractedContent: "Full clean content...",
  memoryIntegration: {
    journalEntryCreated: true,
    themes: ["technology", "innovation"],
    symbols: ["research", "future"],
    externalSource: true
  }
}
```

**Content Processing Pipeline:**
```typescript
// URLProcessor.ts
export class URLProcessor {
  async analyzeURL(url: string, userId: string): Promise<AnalyzedURL> {
    // Security validation
    this.validateURL(url);
    
    // Fetch with safety limits
    const response = await this.safeFetch(url, {
      timeout: 10000,
      maxSize: 2 * 1024 * 1024, // 2MB limit
      userAgent: 'Soullab URL Analyzer'
    });
    
    // Extract main content
    const cleanContent = await this.extractContent(response.html);
    
    // Generate summary
    const summary = await this.generateSummary(cleanContent);
    
    // Extract metadata
    const metadata = this.extractMetadata(response.html);
    
    return {
      url,
      title: metadata.title,
      domain: new URL(url).hostname,
      summary,
      extractedContent: cleanContent,
      metadata: {
        wordCount: cleanContent.split(/\s+/).length,
        readingTime: Math.ceil(cleanContent.split(/\s+/).length / 250),
        publishDate: metadata.publishDate,
        author: metadata.author
      }
    };
  }
  
  private validateURL(url: string): void {
    const parsed = new URL(url);
    
    // Security checks
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs allowed');
    }
    
    // Block private networks
    const hostname = parsed.hostname;
    if (this.isPrivateNetwork(hostname)) {
      throw new Error('Private network URLs not allowed');
    }
  }
  
  private async safeFetch(url: string, options: FetchOptions): Promise<FetchResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': options.userAgent,
          'Accept': 'text/html,application/xhtml+xml'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check content size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > options.maxSize) {
        throw new Error('Content too large');
      }
      
      const html = await response.text();
      
      // Double-check size after download
      if (html.length > options.maxSize) {
        throw new Error('Content too large after download');
      }
      
      return { html, url: response.url };
    } catch (error) {
      logger.error(`URL fetch failed for ${url}:`, error);
      throw error;
    }
  }
  
  private async extractContent(html: string): Promise<string> {
    // Use Mozilla Readability for clean content extraction
    const readability = new Readability(html);
    const article = readability.parse();
    
    if (!article) {
      // Fallback to simple HTML stripping
      return this.stripHTML(html);
    }
    
    // Clean and format the extracted content
    return this.cleanContent(article.textContent);
  }
  
  private stripHTML(html: string): string {
    // Remove scripts, styles, and other non-content
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

### **2. Voice Input Pipeline**

**Microphone Capture:**
```typescript
// MicrophoneCapture.tsx
interface MicCaptureState {
  isRecording: boolean;
  isProcessing: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  audioLevel: number;
}

// Recording flow
1. getUserMedia() -> MediaStream
2. MediaRecorder -> chunks
3. Send chunks to /api/oracle/voice/transcribe
4. Display transcription in chat
5. Maya responds normally
```

**Backend Transcription:**
```typescript
// /api/oracle/voice/transcribe
POST /api/oracle/voice/transcribe
{
  audio: <Blob>, // webm/mp3/wav
  userId: string,
  sessionId: string
}

// Service: WhisperSTTService.ts
- Primary: OpenAI Whisper API
- Fallback: Browser SpeechRecognition
- Error handling: Graceful degradation
```

### **3. TTS Response Pipeline**

**Voice Synthesis Architecture:**
```typescript
// TTSOrchestrator.ts
class TTSOrchestrator {
  private primary: SesameTTS;
  private fallback: ElevenLabsService;
  
  async synthesize(text: string, options: TTSOptions): Promise<AudioResult> {
    try {
      return await this.primary.synthesize(text, options);
    } catch (error) {
      logger.warn('Sesame TTS failed, using ElevenLabs fallback');
      return await this.fallback.synthesize(text, options);
    }
  }
}
```

**Audio Delivery:**
```typescript
// OracleVoicePlayer.tsx
interface VoicePlayerProps {
  audioUrl: string;
  autoplay: boolean;
  onPlaybackComplete: () => void;
}

// Features
- Autoplay Maya responses
- Play/pause controls
- Progress indicator
- Audio preloading
- Error state handling
```

### **4. Memory Integration**

**Unified Content Storage:**
```typescript
// MemoryOrchestrator.ts enhancement
interface MultimodalMemoryContext {
  textContent: string;
  uploadedFiles: UploadedFile[];
  transcribedSpeech: TranscriptionResult[];
  extractedContent: ContentExtraction[];
  totalTokens: number;
}

// Integration points
1. File content -> Journal Memory Layer
2. Transcribed speech -> Session Memory Layer
3. Combined context -> ConversationalPipeline
4. Maya response -> Memory persistence
```

---

## 🎭 User Experience Flow

### **Complete Interaction Cycle**

**1. User Input (Multiple Modes)**
```
User can simultaneously:
- Type: "I want to discuss this research"
- Upload: research_paper.pdf
- Share URL: https://nature.com/articles/breakthrough-study
- Speak: "This is all related to my career transition"

All inputs converge into single context
```

**2. Processing & Memory Integration**
```
MemoryOrchestrator builds unified context:
- Session: Previous conversation turns
- Journal: Related past entries + new file content
- Profile: User's communication preferences
- Symbolic: Themes from document + speech
- External: Long-term patterns
```

**3. Maya's Unified Response**
```
ConversationalPipeline generates response considering:
- Uploaded document content
- Spoken context
- Written question
- Full memory history

Output: Rich, contextual response acknowledging all inputs
```

**4. Multimodal Delivery**
```
User receives:
- Text response in chat
- Maya speaking the response (with prosody)
- File acknowledged and integrated into memory
- Future conversations can reference the document
```

---

## 🔧 Technical Implementation Guide

### **Frontend Setup**

**1. File Upload Component**
```tsx
// components/FileUpload.tsx
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUploaded }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt', '.md'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    onDrop: handleFileUpload
  });

  const handleFileUpload = async (files) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('userId', userId);
    formData.append('sessionId', sessionId);

    const response = await fetch('/api/oracle/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    onFileUploaded(result);
  };
};
```

**2. Microphone Capture**
```tsx
// components/MicrophoneCapture.tsx
const MicrophoneCapture = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true 
        } 
      });
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' 
      });
      
      recorder.ondataavailable = handleAudioData;
      recorder.start(1000); // 1 second chunks
      
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const handleAudioData = async (event) => {
    const audioBlob = event.data;
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('userId', userId);

    const response = await fetch('/api/oracle/voice/transcribe', {
      method: 'POST',
      body: formData
    });

    const { transcription } = await response.json();
    onTranscription(transcription);
  };
};
```

### **Backend Services**

**1. File Upload Handler**
```typescript
// routes/fileUpload.routes.ts
import multer from 'multer';
import { FileProcessor } from '../services/FileProcessor';
import { memoryOrchestrator } from '../services/MemoryOrchestrator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    const file = req.file;

    // Process file content
    const processor = FileProcessor.getProcessor(file.mimetype);
    const extractedContent = await processor.process(file.buffer, file.originalname);

    // Store in Supabase
    const fileRecord = await supabase.storage
      .from('user-uploads')
      .upload(`${userId}/${file.originalname}`, file.buffer);

    // Integrate into memory
    await memoryOrchestrator.storeJournalEntry(
      userId,
      extractedContent.text,
      'document',
      {
        symbols: extractedContent.themes,
        elementalTag: extractedContent.suggestedElement,
        filename: file.originalname,
        fileType: file.mimetype
      }
    );

    res.json({
      success: true,
      fileId: fileRecord.data?.path,
      filename: file.originalname,
      extractedContent: extractedContent.text,
      memoryIntegration: {
        journalEntryCreated: true,
        themes: extractedContent.themes,
        symbols: extractedContent.symbols
      }
    });
  } catch (error) {
    logger.error('File upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

**2. Speech Transcription Service**
```typescript
// services/WhisperSTTService.ts
export class WhisperSTTService {
  async transcribe(audioBuffer: Buffer, options: STTOptions): Promise<TranscriptionResult> {
    try {
      // Primary: OpenAI Whisper
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', options.language || 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: formData
      });

      const result = await response.json();
      
      return {
        text: result.text,
        confidence: result.confidence || 0.9,
        service: 'whisper',
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logger.warn('Whisper STT failed, attempting browser fallback');
      return this.browserFallback(audioBuffer, options);
    }
  }

  private async browserFallback(audioBuffer: Buffer, options: STTOptions): Promise<TranscriptionResult> {
    // Fallback implementation using browser SpeechRecognition
    // This would be handled on the frontend and sent as text
    throw new Error('Browser fallback should be handled client-side');
  }
}
```

### **Integration with ConversationalPipeline**

```typescript
// Enhanced ConversationalPipeline.ts
export interface MultimodalConversationalContext extends ConversationalContext {
  uploadedFiles?: UploadedFile[];
  transcribedSpeech?: string;
  contentExtractions?: ContentExtraction[];
}

export class ConversationalPipeline {
  async converseViaSesame(ctx: MultimodalConversationalContext): Promise<ConversationalResult> {
    const startTime = Date.now();

    try {
      // Step 1: Build comprehensive memory context (now includes file content)
      const memoryContext = await this.memoryOrchestrator.buildContext(
        ctx.userId,
        this.buildUnifiedQuery(ctx), // Combines text + speech + file content
        ctx.sessionId,
        ctx.conversationHistory
      );

      // Step 2: Generate Maya response with full multimodal context
      const responseText = await this.generateMayaResponse(ctx, memoryContext);

      // Step 3: Dual output - clean text + prosody for voice
      const cleanText = this.stripProsodyMarkup(responseText);
      const prosodyText = this.enhanceProsodyMarkup(responseText);

      // Step 4: Voice synthesis (if enabled)
      let audioUrl: string | null = null;
      if (ctx.voiceEnabled) {
        try {
          const ttsResult = await ttsOrchestrator.generateSpeech(prosodyText, "maya", {
            userId: ctx.userId,
            sessionId: ctx.sessionId
          });
          audioUrl = ttsResult.audioUrl;
        } catch (ttsError) {
          logger.warn('TTS failed, continuing with text only:', ttsError);
        }
      }

      // Step 5: Persist multimodal conversation
      await this.memoryOrchestrator.persistConversationTurn(
        ctx.userId,
        this.buildUnifiedQuery(ctx),
        responseText,
        ctx.sessionId,
        {
          hasFiles: (ctx.uploadedFiles?.length || 0) > 0,
          hasSpeech: !!ctx.transcribedSpeech,
          voiceSynthesized: !!audioUrl
        }
      );

      return {
        text: cleanText,
        audioUrl,
        element: ctx.element,
        processingTime: Date.now() - startTime,
        source: 'multimodal_pipeline',
        metadata: {
          filesProcessed: ctx.uploadedFiles?.length || 0,
          speechTranscribed: !!ctx.transcribedSpeech,
          voiceEnabled: !!audioUrl,
          memoryLayers: memoryContext.layersUsed.length
        }
      };

    } catch (error) {
      logger.error('Multimodal pipeline error:', error);
      // Graceful fallback...
    }
  }

  private buildUnifiedQuery(ctx: MultimodalConversationalContext): string {
    let unifiedQuery = ctx.userText || '';

    if (ctx.transcribedSpeech) {
      unifiedQuery += ` [Spoken: ${ctx.transcribedSpeech}]`;
    }

    if (ctx.uploadedFiles?.length) {
      const fileContext = ctx.uploadedFiles
        .map(f => `[File: ${f.filename} - ${f.extractedContent?.slice(0, 200)}...]`)
        .join(' ');
      unifiedQuery += ` ${fileContext}`;
    }

    return unifiedQuery;
  }
}
```

---

## 🧪 Beta Testing Protocol

### **BETA_MULTIMODAL_VALIDATION.md Integration**

**Test Scenarios:**

**1. File Upload & Memory Integration**
```
Test: Upload PDF document about career planning
Expected: 
- File appears in chat as bubble
- Maya acknowledges: "I've received your career planning document"
- Content extracted and stored in Journal Memory
- Future conversations reference document insights
- Debug shows JOURNAL MEMORY includes file content
```

**2. Voice Input & Transcription**
```
Test: Hold mic button, say "What did you think about the document I uploaded?"
Expected:
- Push-to-talk UI shows recording state
- Speech transcribed accurately via Whisper
- Maya responds referencing both speech and document
- Transcription appears in chat as if typed
```

**3. Voice Output & Playback**
```
Test: Maya responds with voice synthesis
Expected:
- Sesame TTS generates audio (primary)
- ElevenLabs fallback works if Sesame down
- Audio autoplays after response
- Play/pause controls available
- Prosody markup preserved in audio, stripped in text
```

**4. Full Multimodal Conversation**
```
Test: Complex interaction combining all modes
Flow:
1. User uploads research paper (file)
2. User speaks: "This relates to my career concerns" (voice)
3. User types: "What are your thoughts?" (text)
4. Maya responds considering all inputs (memory + TTS)
Expected:
- All inputs acknowledged and integrated
- Response shows understanding of file + speech + text
- Memory orchestrator shows all relevant layers
- Audio response maintains Maya's personality
```

**5. Error Handling & Fallbacks**
```
Tests:
- File upload with unsupported format -> graceful error
- Microphone permission denied -> fallback to text
- Whisper API down -> browser SpeechRecognition
- Sesame TTS down -> ElevenLabs fallback
- All services down -> text-only mode still works
```

### **Performance Benchmarks**
```
Targets:
- File upload processing: <5s for 20MB PDF
- Speech transcription: <2s for 30s audio
- TTS generation: <3s for 200-word response
- Memory integration: <500ms (existing target)
- End-to-end multimodal response: <8s total
```

### **Quality Validation**
```
Success Criteria:
- Maya feels naturally multimodal, not fragmented
- File content meaningfully influences responses
- Speech transcription accuracy >95% for clear speech  
- Voice synthesis maintains Maya's personality
- Memory system scales across all input types
- Error states don't break conversation flow
```

---

## 🚨 Production Operations

### **Monitoring & Health Checks**

**Service Health Dashboard:**
```typescript
// /api/multimodal/health
GET /api/multimodal/health

Response:
{
  status: "healthy",
  services: {
    fileUpload: { status: "up", responseTime: "45ms" },
    whisperSTT: { status: "up", apiKey: "configured" },
    sesameTTS: { status: "up", endpoint: "http://localhost:8000" },
    elevenLabs: { status: "up", apiKey: "configured" },
    memoryOrchestrator: { status: "up", layers: 5 },
    supabaseStorage: { status: "up", connection: "active" }
  },
  uptime: "99.8%",
  lastChecked: "2024-01-15T10:30:00Z"
}
```

**Error Alerting:**
```yaml
Critical Alerts:
  - File upload failure rate >5%
  - STT service down >2 minutes
  - TTS fallback activation
  - Memory persistence failures
  - Storage quota >80%

Warning Alerts:
  - High processing latency
  - API rate limit approaching
  - Cache hit rate <70%
```

### **Scaling Considerations**

**File Storage:**
- Supabase Storage: 20GB free tier, scales to TB+
- Local dev: `/uploads` folder with rotation
- CDN: Consider CloudFlare for file delivery

**Processing Queues:**
- Large file processing: Background job queue
- Batch STT: Process multiple audio chunks
- TTS caching: Store common phrases

**API Limits:**
- OpenAI Whisper: 50 requests/hour (free tier)
- ElevenLabs: 10,000 characters/month (starter)
- Rate limiting: Queue requests, show progress

### **Security Hardening**

**File Upload Security:**
```typescript
// Comprehensive validation
const fileValidation = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'],
  scanForMalware: true,
  validateMimeType: true,
  sanitizeFilename: true,
  encryptAtRest: true
};
```

**API Security:**
- Rate limiting per user/IP
- API key rotation
- Input sanitization
- CORS configuration
- Request size limits

---

## 🎯 Success Metrics

### **Technical KPIs**
- ✅ File processing success rate: >98%
- ✅ Speech transcription accuracy: >95%
- ✅ TTS fallback activation: <5%
- ✅ End-to-end latency: <8s
- ✅ Memory integration: 100% of interactions

### **User Experience KPIs**  
- ✅ Multimodal adoption rate: >60% of users try files/voice
- ✅ File reference rate: >40% of conversations reference uploaded content
- ✅ Voice interaction satisfaction: >4.5/5 rating
- ✅ Error recovery: <1% of users abandon due to technical issues

### **Business Impact**
- ✅ Session depth: +40% longer conversations with multimodal
- ✅ User retention: +25% with file/voice capabilities  
- ✅ Premium conversion: Multimodal drives upgrade intent
- ✅ Maya personality consistency: Maintained across all modes

---

## 🚀 Deployment Checklist

### **Pre-Launch Validation**
- [ ] All test scenarios in BETA_MULTIMODAL_VALIDATION.md pass
- [ ] Performance benchmarks met
- [ ] Error handling tested in all failure modes
- [ ] Security audit completed
- [ ] API keys configured and tested
- [ ] Monitoring dashboards active

### **Launch Configuration**
```env
# Production environment variables
MAYA_MULTIMODAL_ENABLED=true
MAYA_DEBUG_MEMORY=false (set to true for beta)

# File upload
MAX_FILE_SIZE=20971520
UPLOAD_PATH=/uploads
SUPABASE_STORAGE_BUCKET=user-uploads

# Voice services  
WHISPER_API_KEY=sk-...
ELEVENLABS_API_KEY=...
SESAME_TTS_URL=http://localhost:8000
TTS_FALLBACK_ENABLED=true

# Processing
FILE_PROCESSING_TIMEOUT=30000
STT_TIMEOUT=15000
TTS_TIMEOUT=10000
```

## 🔄 **Integrated Usage Examples**

### **Example 1: URL → Voice → Memory Integration**
```
1. User pastes: "https://article-about-productivity.com"
   → Maya: "I see this productivity article. How does it connect to your recent 
      journal entry about work-life balance?"

2. User responds via voice: "I've been struggling with focus lately..."
   → Maya processes: Article content + voice transcript + journal memory
   → Maya responds via voice: "That makes sense. The article mentions the 
      Pomodoro technique, which could help with the scattered feeling you wrote 
      about last week..."

3. Next session via text: "What was that productivity method you mentioned?"
   → Maya: "You mean the Pomodoro technique from that article you shared? 
      Based on your journal patterns, I think the 25-minute focus blocks 
      could work well with your current workflow..."
```

### **Example 2: File → Voice → URL Cross-Reference**
```
1. User uploads: PDF research paper
   → Maya: "This research on cognitive load theory is fascinating. Have you 
      encountered this concept before?"

2. User via voice: "Not really, can you explain how it applies to me?"
   → Maya: "Given your journal entries about feeling overwhelmed, this research 
      suggests breaking complex tasks into smaller chunks..."

3. User shares: URL to related blog post
   → Maya: "This blog post builds nicely on the research you uploaded. The 
      practical tips here align with what the paper suggests about reducing 
      cognitive overhead..."
```

### **Example 3: Voice → Journal → URL → File Integration**
```
Daily flow across all modalities:
- Morning voice check-in references yesterday's conversation
- Journal entry reflects on Maya's earlier insights  
- URL shared expands on journal theme
- PDF uploaded provides deeper research
- All inputs flow into unified memory for next session
```

### **Rollout Strategy**
1. **Alpha**: Internal team testing (1 week)
2. **Closed Beta**: 50 selected users (2 weeks)  
3. **Open Beta**: All beta testers (4 weeks)
4. **Production**: Gradual rollout (25% → 50% → 100%)

---

---

## 🌐 **URL Input Layer - Complete Implementation**

### **URLProcessor Service**

```typescript
// lib/url/URLProcessor.ts
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface URLAnalysisRequest {
  url: string;
  userId: string;
  extractContent?: boolean;
  maxSize?: number;
  timeout?: number;
}

export interface AnalyzedURL {
  url: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  readingTime: number;
  publishedDate?: string;
  author?: string;
  siteName: string;
  contentType: 'article' | 'blog' | 'news' | 'documentation' | 'other';
  processingTime: number;
  cached: boolean;
  themes: string[];
  memoryIntegration: {
    storedAsExternal: boolean;
    journalEntryCreated: boolean;
    symbolsExtracted: string[];
  };
}

export class URLProcessor {
  private cache = new Map<string, AnalyzedURL>();
  private readonly MAX_CONTENT_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly TIMEOUT = 10000; // 10 seconds

  async analyzeURL(request: URLAnalysisRequest): Promise<AnalyzedURL> {
    const startTime = Date.now();
    const cacheKey = `url:${request.url}`;
    
    // Check cache first (1 hour cache)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return { ...cached, cached: true };
    }

    try {
      // Step 1: Security validation
      this.validateURL(request.url);
      
      // Step 2: Fetch with safety limits
      const response = await this.safeFetch(request.url, {
        timeout: request.timeout || this.TIMEOUT,
        maxSize: request.maxSize || this.MAX_CONTENT_SIZE
      });

      // Step 3: Extract readable content using Mozilla Readability
      const cleanContent = await this.extractContent(response.html);
      
      // Step 4: Generate AI summary and extract themes
      const summary = await this.generateSummary(cleanContent.textContent);
      const themes = this.extractThemes(cleanContent.textContent, cleanContent.title);
      
      const result: AnalyzedURL = {
        url: request.url,
        title: cleanContent.title,
        content: cleanContent.textContent,
        summary,
        wordCount: cleanContent.textContent.split(/\s+/).length,
        readingTime: Math.ceil(cleanContent.textContent.split(/\s+/).length / 250),
        publishedDate: cleanContent.publishedDate,
        author: cleanContent.author,
        siteName: cleanContent.siteName,
        contentType: this.classifyContent(cleanContent),
        themes,
        processingTime: Date.now() - startTime,
        cached: false,
        memoryIntegration: {
          storedAsExternal: false, // Will be set during memory integration
          journalEntryCreated: false,
          symbolsExtracted: themes
        }
      };

      // Cache for 1 hour
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 3600000);

      return result;

    } catch (error) {
      logger.error('URL analysis failed:', error);
      throw new Error(`URL analysis failed: ${error.message}`);
    }
  }

  private validateURL(url: string): void {
    try {
      const parsed = new URL(url);
      
      // Security checks - only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Only HTTP/HTTPS URLs are supported');
      }
      
      // Block private IPs, localhost, and internal networks
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.') ||
          hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') ||
          hostname.startsWith('172.19.') ||
          hostname.startsWith('172.2') ||
          hostname.startsWith('172.30.') ||
          hostname.startsWith('172.31.') ||
          hostname === '0.0.0.0' ||
          hostname === '::1') {
        throw new Error('Private/local URLs are not allowed for security reasons');
      }

    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  private async safeFetch(url: string, options: {timeout: number, maxSize: number}): Promise<{html: string, finalUrl: string}> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Maya Personal Oracle Agent (+https://soullab.life)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        throw new Error('Content type not supported. Only HTML/text content can be analyzed.');
      }

      // Check content size from headers
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > options.maxSize) {
        throw new Error(`Content too large: ${contentLength} bytes (max: ${options.maxSize} bytes)`);
      }

      const html = await response.text();
      
      // Double-check size after download
      if (html.length > options.maxSize) {
        throw new Error(`Content too large: ${html.length} bytes (max: ${options.maxSize} bytes)`);
      }

      return { html, finalUrl: response.url };

    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async extractContent(html: string): Promise<{
    title: string;
    textContent: string;
    publishedDate?: string;
    author?: string;
    siteName: string;
  }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Try Mozilla Readability first
    const reader = new Readability(document);
    const article = reader.parse();

    if (article && article.textContent.trim().length > 100) {
      return {
        title: article.title || this.extractTitleFallback(document),
        textContent: article.textContent,
        publishedDate: this.extractMetaContent(document, ['article:published_time', 'datePublished', 'publishedDate']),
        author: this.extractMetaContent(document, ['article:author', 'author', 'twitter:creator']),
        siteName: this.extractMetaContent(document, ['og:site_name', 'twitter:site']) || new URL(html).hostname
      };
    }

    // Fallback to simple extraction
    return {
      title: this.extractTitleFallback(document),
      textContent: this.extractTextFallback(html),
      siteName: new URL(html).hostname
    };
  }

  private extractTitleFallback(document: Document): string {
    return document.title || 
           this.extractMetaContent(document, ['og:title', 'twitter:title']) || 
           'Untitled';
  }

  private extractTextFallback(html: string): string {
    // Remove scripts, styles, navigation, ads, and other non-content elements
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
      .replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>.*?<\/div>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractMetaContent(document: Document, properties: string[]): string | undefined {
    for (const property of properties) {
      const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (meta) {
        const content = meta.getAttribute('content');
        if (content && content.trim()) {
          return content.trim();
        }
      }
    }
    return undefined;
  }

  private async generateSummary(content: string): Promise<string> {
    // Extract first 3-4 meaningful sentences for summary
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .slice(0, 4);
    
    if (sentences.length === 0) {
      return content.substring(0, 200) + '...';
    }
    
    return sentences.join('. ') + '.';
  }

  private extractThemes(content: string, title: string): string[] {
    const text = (content + ' ' + title).toLowerCase();
    const themes: Set<string> = new Set();
    
    // Topic detection based on keywords
    const topicMap = {
      'career': ['career', 'job', 'work', 'employment', 'professional', 'workplace', 'business'],
      'technology': ['technology', 'ai', 'artificial intelligence', 'software', 'digital', 'tech', 'programming'],
      'health': ['health', 'wellness', 'medical', 'fitness', 'mental health', 'therapy', 'healing'],
      'relationship': ['relationship', 'love', 'family', 'friendship', 'connection', 'social'],
      'creativity': ['creativity', 'art', 'creative', 'design', 'music', 'writing', 'artistic'],
      'spirituality': ['spiritual', 'meditation', 'consciousness', 'mindfulness', 'growth', 'awakening'],
      'learning': ['learning', 'education', 'study', 'knowledge', 'skill', 'development', 'growth'],
      'finance': ['money', 'finance', 'financial', 'investment', 'wealth', 'economics', 'budget']
    };
    
    for (const [theme, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        themes.add(theme);
      }
    }
    
    return Array.from(themes);
  }

  private classifyContent(content: any): 'article' | 'blog' | 'news' | 'documentation' | 'other' {
    const text = content.textContent.toLowerCase();
    const title = content.title.toLowerCase();
    const siteName = (content.siteName || '').toLowerCase();
    
    // Documentation detection
    if (title.includes('doc') || 
        text.includes('documentation') || 
        text.includes('api reference') ||
        siteName.includes('docs') ||
        text.includes('getting started') ||
        text.includes('installation guide')) {
      return 'documentation';
    }
    
    // Blog detection
    if (title.includes('blog') || 
        siteName.includes('blog') ||
        text.includes('posted by') ||
        text.includes('by the author')) {
      return 'blog';
    }
    
    // News detection
    if (content.publishedDate && 
        (text.includes('breaking') || 
         text.includes('reported') || 
         text.includes('according to sources') ||
         siteName.includes('news'))) {
      return 'news';
    }
    
    // Article detection (has author, publish date, substantial content)
    if (content.author && content.publishedDate && content.textContent.length > 1000) {
      return 'article';
    }
    
    return 'other';
  }
}
```

### **Integration with ConversationalPipeline**

```typescript
// Enhanced ConversationalPipeline.ts for URL support
export interface MultimodalConversationalContext extends ConversationalContext {
  uploadedFiles?: UploadedFile[];
  transcribedSpeech?: string;
  urlsToAnalyze?: string[];
  analyzedUrls?: AnalyzedURL[];
}

export class ConversationalPipeline {
  private urlProcessor = new URLProcessor();

  async converseViaSesame(ctx: MultimodalConversationalContext): Promise<ConversationalResult> {
    const startTime = Date.now();

    try {
      // Step 1: Process URLs if provided
      if (ctx.urlsToAnalyze?.length) {
        logger.info(`Processing ${ctx.urlsToAnalyze.length} URLs for user ${ctx.userId}`);
        
        ctx.analyzedUrls = await Promise.allSettled(
          ctx.urlsToAnalyze.map(url => 
            this.urlProcessor.analyzeURL({
              url,
              userId: ctx.userId,
              extractContent: true
            })
          )
        ).then(results => 
          results
            .filter((result): result is PromiseFulfilledResult<AnalyzedURL> => 
              result.status === 'fulfilled'
            )
            .map(result => result.value)
        );

        // Store successful URL analyses in external memory
        for (const urlData of ctx.analyzedUrls) {
          await this.memoryOrchestrator.storeExternalMemory(
            ctx.userId,
            {
              type: 'url',
              source: urlData.url,
              title: urlData.title,
              content: urlData.content,
              summary: urlData.summary,
              themes: urlData.themes,
              metadata: {
                wordCount: urlData.wordCount,
                readingTime: urlData.readingTime,
                author: urlData.author,
                publishedDate: urlData.publishedDate,
                contentType: urlData.contentType
              }
            }
          );
        }
      }

      // Step 2: Build comprehensive memory context (includes URL content)
      const memoryContext = await this.memoryOrchestrator.buildContext(
        ctx.userId,
        this.buildUnifiedQuery(ctx), // Now includes URL summaries and key insights
        ctx.sessionId,
        ctx.conversationHistory
      );

      // Step 3: Generate Maya response with full multimodal context
      const responseText = await this.generateMayaResponse(ctx, memoryContext);
      const cleanText = this.stripProsodyMarkup(responseText);
      const prosodyText = this.enhanceProsodyMarkup(responseText);

      // Step 4: Voice synthesis (if enabled)
      let audioUrl: string | null = null;
      if (ctx.voiceEnabled) {
        try {
          const ttsResult = await ttsOrchestrator.generateSpeech(prosodyText, "maya", {
            userId: ctx.userId,
            sessionId: ctx.sessionId
          });
          audioUrl = ttsResult.audioUrl;
        } catch (ttsError) {
          logger.warn('TTS failed, continuing with text only:', ttsError);
        }
      }

      // Step 5: Persist multimodal conversation with URL metadata
      await this.memoryOrchestrator.persistConversationTurn(
        ctx.userId,
        this.buildUnifiedQuery(ctx),
        responseText,
        ctx.sessionId,
        {
          hasFiles: (ctx.uploadedFiles?.length || 0) > 0,
          hasSpeech: !!ctx.transcribedSpeech,
          hasUrls: (ctx.urlsToAnalyze?.length || 0) > 0,
          voiceSynthesized: !!audioUrl,
          urlsAnalyzed: ctx.analyzedUrls?.length || 0
        }
      );

      return {
        text: cleanText,
        audioUrl,
        element: ctx.element,
        processingTime: Date.now() - startTime,
        source: 'multimodal_pipeline',
        metadata: {
          filesProcessed: ctx.uploadedFiles?.length || 0,
          speechTranscribed: !!ctx.transcribedSpeech,
          urlsAnalyzed: ctx.analyzedUrls?.length || 0,
          voiceEnabled: !!audioUrl,
          memoryLayers: memoryContext.layersUsed.length
        }
      };

    } catch (error) {
      logger.error('Multimodal conversation failed:', error);
      throw error;
    }
  }

  private buildUnifiedQuery(ctx: MultimodalConversationalContext): string {
    let query = ctx.userInput || '';
    
    if (ctx.transcribedSpeech) {
      query += `\n\n[Voice Input]: ${ctx.transcribedSpeech}`;
    }
    
    if (ctx.uploadedFiles?.length) {
      const fileContext = ctx.uploadedFiles
        .map(file => `[File: ${file.name}]\n${file.extractedContent?.substring(0, 1000)}${file.extractedContent && file.extractedContent.length > 1000 ? '...' : ''}`)
        .join('\n\n');
      query += `\n\n${fileContext}`;
    }

    if (ctx.analyzedUrls?.length) {
      const urlContext = ctx.analyzedUrls
        .map(url => {
          const preview = url.content.length > 2000 ? 
            url.content.substring(0, 2000) + '...' : 
            url.content;
          
          return `[URL: ${url.title}]\nSource: ${url.url}\nSummary: ${url.summary}\nThemes: ${url.themes.join(', ')}\n\nContent Preview (${url.wordCount} words, ${url.readingTime}min read):\n${preview}`;
        })
        .join('\n\n');
      query += `\n\n${urlContext}`;
    }
    
    return query;
  }
}
```

---

## 🧪 **URL Beta Testing Scenarios**

### **Scenario 1: URL Analysis & Memory Integration**
*Validates URL content extraction and storage in external memory*

**Test Steps:**
1. **Share Article URL**
   ```
   User: "I found this article interesting: https://example.com/mindfulness-guide"
   ```
   
   **Expected Debug Output:**
   ```
   🌐 [URL_DEBUG] Processing URL: https://example.com/mindfulness-guide
   📄 [URL_DEBUG] Content extracted: 2,847 words, 11min read
   🏷️ [URL_DEBUG] Themes detected: ['mindfulness', 'spirituality', 'health']
   💾 [URL_DEBUG] Stored as external memory entry
   ```

2. **Maya Response Integration**
   ```
   Maya: "I've analyzed this mindfulness guide - it's a comprehensive 11-minute read with practical techniques. This connects beautifully with your recent journal entry about seeking more presence in daily life. The article's focus on breath awareness might be especially relevant given what you shared about feeling scattered lately. Would you like me to highlight the most actionable insights for your current situation?"
   ```

3. **Cross-Session Memory Test**
   ```
   [Next session]
   User: "What was that mindfulness technique you mentioned?"
   Maya: "You mean from the article you shared about mindfulness practices? The guide emphasized the '5-4-3-2-1' grounding technique - focusing on 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, and 1 you can taste. This seemed to align with your preference for practical, in-the-moment exercises rather than extended meditation sessions."
   ```

**✅ Success Criteria:**
- URL content extracted completely and accurately
- Themes detected and stored with external memory
- Maya references URL content naturally in responses
- Memory persists across sessions with specific details

---

### **Scenario 2: Multi-URL Comparison**
*Tests parallel URL processing and synthesis capabilities*

**Test Steps:**
1. **Multiple URL Input**
   ```
   User: "Can you compare these two articles about remote work?
   https://harvard-business-review.com/remote-productivity
   https://blog.example.com/work-from-home-tips"
   ```

2. **Processing Validation**
   ```
   Expected Debug Output:
   🌐 [URL_DEBUG] Processing 2 URLs in parallel
   📊 [URL_DEBUG] URL 1: 3,200 words (academic article)
   📊 [URL_DEBUG] URL 2: 1,800 words (blog post) 
   🔍 [URL_DEBUG] Common themes: ['remote work', 'productivity', 'work-life balance']
   💾 [URL_DEBUG] Both stored as external memory entries
   ```

3. **Comparative Analysis**
   ```
   Maya: "I've analyzed both articles on remote work. The Harvard Business Review piece takes a research-backed approach, citing studies about productivity metrics and team dynamics. The blog post is more practical, focusing on daily routines and workspace setup.

   Interestingly, both emphasize boundaries - but from different angles. The HBR article discusses organizational boundaries, while the blog focuses on personal space boundaries. Given your journal entries about struggling with work-home separation, the blog's advice about dedicated workspace rituals might be more immediately applicable.

   Would you like me to extract specific strategies from both that align with your situation?"
   ```

**✅ Success Criteria:**
- Multiple URLs processed efficiently in parallel
- Comparative analysis shows understanding of both sources
- Response synthesizes insights meaningfully
- Personal context integrated from user's history

---

### **Scenario 3: URL + File + Voice Integration**
*Tests complete multimodal experience with URL as one component*

**Test Flow:**
1. **Upload resume PDF**
2. **Share LinkedIn learning course URL**
3. **Voice input**: "I'm thinking about transitioning to this field"
4. **Maya synthesizes all three inputs**

**Expected Integration:**
```
Maya: "I see a fascinating convergence here. Your resume shows strong project management experience, the LinkedIn course you shared focuses on agile methodologies - which builds perfectly on your existing skills. And from what you just shared about wanting to transition into this field, it sounds like you're looking to formalize expertise you already have rather than starting completely fresh.

The course curriculum I analyzed emphasizes practical application over theory, which matches your learning preference from our previous conversations. Your background in [specific experience from resume] would actually give you an advantage in the advanced modules the course covers.

What draws you specifically to this field transition? Is it the problem-solving aspects, the collaborative elements, or something else?"
```

**✅ Success Criteria:**
- All three input types processed and integrated seamlessly
- Response shows awareness of content from each source
- Personal context woven throughout analysis
- Natural conversational flow despite complex input processing

---

### **Scenario 4: Error Handling & Graceful Degradation**
*Validates robust URL processing with various failure modes*

**Test Cases:**

1. **Invalid URL**
   ```
   User: "Check out this link: not-a-real-url"
   Maya: "I wasn't able to analyze that link - it doesn't appear to be a valid URL. Could you double-check the format? I can analyze any web page that starts with http:// or https://"
   ```

2. **Private/Blocked URL**
   ```
   User: "https://localhost:3000/private-doc"
   Maya: "I can't access private or local URLs for security reasons. If you'd like me to analyze the content, you could upload it as a file instead, or share a publicly accessible version."
   ```

3. **Content Too Large**
   ```
   User: "https://massive-pdf-site.com/huge-document"
   Maya: "That page is too large for me to analyze quickly (over 2MB). Could you share a specific section or a summary page instead? I work best with focused content I can process thoroughly."
   ```

4. **Site Down/Timeout**
   ```
   User: "https://broken-site.com/article"
   Maya: "I wasn't able to access that page right now - it might be temporarily unavailable. You could try again in a moment, or if you have the content saved, you could paste the key sections or upload it as a file."
   ```

**✅ Success Criteria:**
- All error states handled gracefully without breaking conversation
- Clear, helpful feedback provided for each failure type
- Alternative solutions offered when appropriate
- Conversation continues naturally after errors

---

### **Scenario 5: URL Performance Under Load**
*Validates system performance with heavy URL processing*

**Test Setup:**
- Process 5 URLs simultaneously
- Mix of content types (articles, blogs, documentation)
- Various content sizes (500 words to 2MB limit)
- Monitor processing times and memory usage

**Performance Targets:**
- URL analysis: <10s per URL
- Parallel processing: All 5 URLs complete within 15s
- Memory integration: <2s additional
- Response generation: <5s with all URL context
- Total end-to-end: <20s for complex multimodal input

**Load Testing:**
```
Expected Debug Output:
⏱️ [PERF] URL processing started: 5 URLs queued
⏱️ [PERF] URL 1 complete: 3.2s (article, 2,100 words)
⏱️ [PERF] URL 2 complete: 5.8s (blog, 4,500 words) 
⏱️ [PERF] URL 3 complete: 2.1s (news, 800 words)
⏱️ [PERF] URL 4 complete: 8.9s (documentation, 6,200 words)
⏱️ [PERF] URL 5 complete: 4.3s (article, 3,100 words)
⏱️ [PERF] All URLs processed: 8.9s total (parallel execution)
🧠 [PERF] Memory integration: 1.2s
🎭 [PERF] Response generation: 3.8s
📊 [PERF] Total pipeline: 13.9s
```

**✅ Success Criteria:**
- No single URL processing exceeds 10s
- Parallel processing efficiency maintained
- Memory system handles multiple external entries
- Response quality maintained with complex context
- No memory leaks or performance degradation

---

## 📊 **Updated Architecture Diagram**

```mermaid
graph TD
    %% Input Layer - Four Modalities
    U1[💬 Text Input] --> PP[PreProcessor]
    U2[🎤 Voice Input] --> STT[Speech-to-Text]
    U3[📂 File Upload] --> FP[FileProcessor] 
    U4[🌐 URL Input] --> UP[URLProcessor]
    
    %% URL Processing Pipeline
    UP --> UV[URL Validation]
    UV --> UF[Safe Fetch]
    UF --> CE[Content Extraction]
    CE --> CS[Content Summary]
    CS --> TH[Theme Detection]
    TH --> PP
    
    %% Processing Layer
    STT --> PP
    FP --> PP
    PP --> MO[MemoryOrchestrator]
    
    %% Memory Layers
    MO --> SM[Session Memory]
    MO --> JM[Journal Memory]  
    MO --> PM[Profile Memory]
    MO --> SYM[Symbolic Memory]
    MO --> EM[External Memory]
    
    %% URL-specific External Memory Storage
    TH --> EM
    
    %% Context Building
    SM --> MC[Memory Context]
    JM --> MC
    PM --> MC
    SYM --> MC
    EM --> MC
    
    %% Response Generation
    PP --> CP[ConversationalPipeline]
    MC --> CP
    CP --> RG[Response Generator]
    RG --> TTS[Text-to-Speech]
    
    %% Output Layer
    RG --> RT[📱 Response Text]
    TTS --> RA[🔊 Response Audio]
    
    %% Persistence
    CP --> PS[Persistence Service]
    PS --> DB[(🗄️ Database)]
    
    %% File Processing Flow
    FP --> FT[File Type Detection]
    FT --> FCE[File Content Extraction]
    FCE --> PP
    
    %% Voice Processing Flow
    STT --> VC[Voice Confidence Check]
    VC --> PP
    
    %% Memory Context Management
    MC --> MCB[Context Budget Manager]
    MCB --> RG
    
    %% Error Handling & Fallbacks
    UP -.->|Fails| UFB[URL Fallback: "Unable to access"]
    STT -.->|Fails| SF[Speech Fallback: Browser recognition] 
    FP -.->|Fails| FF[File Fallback: Text extraction]
    TTS -.->|Fails| TF[TTS Fallback: ElevenLabs]
    
    %% Caching Layer
    UP --> UC[URL Cache]
    UC --> CE
    
    %% Security Layer
    UV --> USec[Security Validation]
    USec --> UF
    
    %% Content Type Classification
    CE --> CT[Content Classification]
    CT --> CS
    
    style U4 fill:#e1f5fe
    style UP fill:#e1f5fe
    style UV fill:#f3e5f5
    style USec fill:#f3e5f5
    style CE fill:#e8f5e8
    style CS fill:#e8f5e8
    style TH fill:#fff3e0
    style EM fill:#fff8e1
```

---

**🎭 Bottom Line:** Maya becomes a complete multimodal personal oracle agent that can naturally handle text, voice, files, and URLs in unified conversations while maintaining her authentic personality and deep memory integration across all input types.

The multimodal pipeline succeeds when users say: **"Maya can see, hear, understand, and remember everything I share with her - whether I type it, say it, upload it, or link to it."**