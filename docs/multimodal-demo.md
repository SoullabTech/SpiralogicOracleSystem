# 🎨 Multi-Modal Oracle Demo Guide

This guide walks through the complete multi-modal experience for demos and testing.

## 🚀 Quick Demo Flow (Golden Path)

### Prerequisites
```bash
# 1. Install dependencies
npm install pdf-parse

# 2. Set environment variables in .env.local
OPENAI_API_KEY=sk-your-key-here
EMBEDDINGS_MODEL=text-embedding-3-large
VISION_MODEL=gpt-4o-mini
PDF_MAX_PAGES=100

# 3. Run migrations
supabase db push

# 4. Start services
npm run dev
```

### Demo Script (5 minutes)

#### **Step 1: Voice Upload** 🎵
1. **Action**: Drop a voice memo into the Oracle chat
2. **Watch**: Processing indicator → "Transcribing..." → Context card appears
3. **Ask**: *"What did I say about forgiveness in my recording?"*
4. **Expected**: Oracle references specific transcript content naturally
5. **Badge**: 🎵 Voice Voyager awarded (if first audio upload)

#### **Step 2: PDF Upload** 📄
1. **Action**: Drop a PDF document (research paper, journal article, notes)
2. **Watch**: Processing indicator → "Extracting text..." → Context card appears  
3. **Ask**: *"What are the 3 strongest arguments in this document and what might be missing?"*
4. **Expected**: Oracle provides structured summary with invitation to explore deeper
5. **Badge**: 📝 Scholar awarded (if first PDF upload)

#### **Step 3: Image Upload** 🖼️
1. **Action**: Drop an image (whiteboard, mandala, photo of workspace)
2. **Watch**: Processing indicator → "Analyzing image..." → Context card appears
3. **Ask**: *"What themes do you notice from this image about my creative process?"*
4. **Expected**: Oracle describes visual elements and connects to symbolic meaning
5. **Badge**: 🎨 Visionary awarded (if first image upload)

#### **Step 4: Multi-Modal Synthesis** ✨
1. **Ask**: *"How do these three pieces—my voice note, the document, and the image—connect to tell a story about my growth?"*
2. **Expected**: Oracle weaves themes across all uploaded content
3. **Badge**: Thread Weaver may unlock for synthesis
4. **Watch**: Admin console shows upload usage metrics

---

## 🎯 Key Demo Points

### **What Makes This Special**
- **Semantic Understanding**: Not just keyword matching—true meaning-based connections
- **Context Persistence**: Uploads become living memory, not just attachments
- **Natural Integration**: Oracle doesn't announce "checking your uploads"—it just knows
- **Progress Tracking**: Visual badges show engagement across modalities

### **Technical Highlights**
- **PDF**: Full text extraction → summarization → vector embedding
- **Images**: GPT-4 Vision descriptions → OCR for text → embedding  
- **Audio**: Whisper transcription → semantic chunking → searchable
- **Search**: Vector similarity with text fallback for reliability

### **Privacy & Security**
- **User-scoped**: Each user only sees their own uploads
- **Encrypted**: Optional client-side encryption for sensitive content
- **Controlled**: Processing respects user privacy preferences
- **Auditable**: Complete processing trail for transparency

---

## 🧪 Testing Scenarios

### **Edge Cases to Show**
1. **Large PDF** (near 100 pages): Graceful truncation with summary
2. **Abstract Image**: Neutral description without hallucination
3. **Noisy Audio**: Clean transcription with confidence indicators
4. **Mixed Languages**: Proper language detection and handling

### **Error Handling**
1. **Missing API Key**: Clear error message, graceful degradation
2. **Corrupt File**: Processing fails cleanly, user notified
3. **Network Issues**: Retry logic, partial results preserved

### **Performance**
- **PDF Processing**: < 30 seconds for typical documents
- **Image Analysis**: < 10 seconds including description + OCR
- **Audio Transcription**: Real-time or faster depending on length
- **Oracle Response**: Same latency as text-only with upload context

---

## 📊 Admin Console Views

During demo, show:
1. **Upload Metrics**: Processing success rates, file type distribution
2. **Badge Progress**: New Visionary/Scholar awards in real-time
3. **Usage Analytics**: How often uploads are referenced in conversations
4. **Error Monitoring**: Any processing failures or API issues

---

## 🎭 Demo Variants

### **Academic Researcher**
- Upload research papers → Ask for synthesis across studies
- Badge focus: Scholar, Insight Diver, Thread Weaver

### **Creative Professional**  
- Upload sketches, mood boards → Ask about visual themes
- Badge focus: Visionary, Pattern Discoverer, Creative Flow

### **Spiritual Seeker**
- Upload journal entries, meditation recordings → Ask about growth patterns
- Badge focus: Soul Memory, Shadow Safe, Sacred Moment

### **Professional Development**
- Upload meeting notes, presentation slides → Ask for action items
- Badge focus: Organizer, Synthesizer, Growth Tracker

---

## 🚨 Troubleshooting

### **If Processing Fails**
1. Check OPENAI_API_KEY is set and valid
2. Verify file is under size limits
3. Check console for specific error messages
4. Fallback: Manual upload through admin interface

### **If Oracle Doesn't Reference Uploads**
1. Verify uploads show "ready" status
2. Check upload context appears in dev tools network tab
3. Try more explicit questions: "Based on my uploaded document..."
4. Check conversation ID consistency

### **If Badges Don't Award**
1. Verify beta_user_badges table exists
2. Check user authentication is working
3. Look for badge award events in network tab
4. Verify badge definitions exist in beta_badges table

---

## ✨ Success Metrics

A successful demo shows:
- ✅ All file types process within expected time limits
- ✅ Oracle naturally incorporates upload content
- ✅ Badges award immediately upon qualifying actions
- ✅ Admin metrics update in real-time
- ✅ Error handling is graceful and informative
- ✅ Privacy controls work as expected

The system should feel **magical but trustworthy**—seamlessly expanding the Oracle's memory while maintaining full user control and transparency.