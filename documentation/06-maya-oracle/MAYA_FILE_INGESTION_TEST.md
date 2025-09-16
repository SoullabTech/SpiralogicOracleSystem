# 🧪 Maya File Ingestion Test Guide

## Test the Complete Pipeline: Upload → Extract → Embed → Memory Integration

---

## 🎯 What We Built

### 1. Upload API (`/api/oracle/files/upload`)
- ✅ Handles PDF, DOCX, TXT, MD, JSON files
- ✅ Supabase storage integration
- ✅ File metadata tracking
- ✅ Triggers background processing

### 2. Processing Pipeline (`/api/oracle/files/process`)
- ✅ Text extraction by file type
- ✅ Smart chunking (preserves sentences)
- ✅ OpenAI embeddings generation
- ✅ Vector storage in Supabase

### 3. Database Schema (`database/migrations/001_file_ingestion_tables.sql`)
- ✅ `user_files` table with metadata
- ✅ `file_embeddings` table with vector search
- ✅ `file_access_log` for analytics
- ✅ RLS policies and indexes

### 4. Progress Tracking (`/api/oracle/files/status`)
- ✅ Real-time processing status
- ✅ Progress percentages
- ✅ Maya's acknowledgment messages

### 5. React Hook (`app/hooks/useFileUpload.ts`)
- ✅ Upload with progress
- ✅ Status polling
- ✅ File management

---

## 🧪 Test Steps

### Step 1: Database Setup

Run the migration in your Supabase dashboard:

```sql
-- Copy contents of database/migrations/001_file_ingestion_tables.sql
-- Run in Supabase SQL Editor
```

Create the storage bucket:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('maya-files', 'maya-files', false);
```

### Step 2: Environment Variables

Ensure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI for embeddings
OPENAI_API_KEY=your_openai_api_key

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
```

### Step 3: Test File Upload

Create a test file `test-document.txt`:

```
Maya Memory Integration Test

This is a test document to verify that Maya can:
1. Upload and process files successfully
2. Extract text content accurately
3. Create meaningful memory chunks
4. Generate embeddings for semantic search
5. Store everything in the memory system

Maya should be able to reference this content in future conversations, 
demonstrating her ability to weave uploaded knowledge into her responses.

The sacred mirror method guides her approach:
- Receive: Accept the uploaded wisdom with presence
- Reflect: Mirror back the patterns and insights found
- Inquire: Ask curious questions about the content
- Hold: Maintain the knowledge in her memory system
- Honor: Respect the trust placed in sharing this information

This test validates the complete file-to-memory pipeline.
```

### Step 4: API Test

Test upload via curl:

```bash
curl -X POST http://localhost:3001/api/oracle/files/upload \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "file=@test-document.txt" \
  -F "metadata={\"category\":\"reference\",\"tags\":[\"test\",\"memory\"],\"emotionalWeight\":0.7}"
```

### Step 5: Check Processing Status

```bash
curl "http://localhost:3001/api/oracle/files/status?fileId=FILE_ID_FROM_UPLOAD"
```

Expected response progression:
1. `"status": "processing", "progress": 25` - Text extraction
2. `"status": "processing", "progress": 50` - Creating chunks  
3. `"status": "processing", "progress": 75` - Generating embeddings
4. `"status": "completed", "progress": 100` - Done!

### Step 6: Verify Database

Check the data was stored correctly:

```sql
-- Check file record
SELECT * FROM user_files WHERE user_id = 'your_email@example.com';

-- Check embeddings were created
SELECT 
  fe.id,
  fe.chunk_index,
  fe.token_count,
  LEFT(fe.text_content, 100) as preview
FROM file_embeddings fe 
JOIN user_files uf ON fe.file_id = uf.id 
WHERE uf.user_id = 'your_email@example.com'
ORDER BY fe.chunk_index;

-- Verify vector similarity search works
SELECT 
  text_content,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM file_embeddings 
WHERE user_id = 'your_email@example.com'
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

---

## ✅ Success Criteria

### Upload API
- [ ] File uploads successfully to Supabase storage
- [ ] Metadata saved in `user_files` table
- [ ] Maya's acknowledgment message returned
- [ ] Background processing triggered

### Processing Pipeline  
- [ ] Text extracted correctly from file
- [ ] Smart chunks created (preserving sentence boundaries)
- [ ] Embeddings generated for each chunk
- [ ] All data stored in `file_embeddings` table

### Status Tracking
- [ ] Progress updates correctly (25% → 50% → 75% → 100%)
- [ ] Maya's messages are contextual and warm
- [ ] Final status shows chunk/token counts

### Database Integration
- [ ] Vector similarity search returns relevant results
- [ ] RLS policies protect user data
- [ ] All indexes working for fast queries

---

## 🔧 Troubleshooting

### Common Issues

**Upload fails with 401 Unauthorized**
- Check NextAuth session is working
- Verify user is logged in

**Processing gets stuck at "Extracting text"**
- Check OpenAI API key is valid
- Verify file type is supported
- Check file isn't corrupted

**No embeddings generated**
- Ensure text extraction worked
- Check OpenAI API quotas/limits
- Verify embedding model name is correct

**Vector search not working**
- Confirm pgvector extension is enabled
- Check embedding dimensions (1536 for text-embedding-3-small)
- Verify index was created successfully

### Debug Commands

```bash
# Check processing logs
docker logs spiralogic-backend

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Supabase connection
curl "https://your-project.supabase.co/rest/v1/user_files?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## 🎉 Next Steps After Testing

Once the pipeline is working:

1. **Memory Integration** - Connect to Maya's memory orchestration
2. **Frontend UI** - Build drag-and-drop upload interface
3. **File Management** - Add delete, rename, re-process features
4. **Advanced Processing** - DOCX support, OCR for images
5. **Semantic Search** - Query API for Maya to cite files

---

## 📊 Expected Performance

- **Upload**: <5 seconds for 10MB file
- **Text Extraction**: <10 seconds for most files
- **Chunking**: <5 seconds for 10k words
- **Embeddings**: ~2 seconds per chunk (OpenAI API)
- **Storage**: <2 seconds to save to Supabase

**Total pipeline**: ~30-60 seconds for typical document

Maya will start referencing your uploaded content in conversations once processing completes! 🌟