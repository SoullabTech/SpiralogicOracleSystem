#!/bin/bash

# File Upload System Canary Tests
echo "📁 File Upload System Canary Tests"
echo "=================================="

BASE_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name="$1"
    local url="$2" 
    local method="$3"
    local data="$4"
    local expected_field="$5"
    local auth_required="$6"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    
    if [ "$auth_required" = "true" ]; then
        echo "⚠️  This test requires authentication"
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        echo "Data: $data"
        response=$(curl -s -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -d "$data")
    fi
    
    if [ $? -eq 0 ]; then
        if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - $expected_field found"
            if [ "$expected_field" != ".error" ] && [ "$expected_field" != ".uploads" ]; then
                echo "$response" | jq "$expected_field" 2>/dev/null || echo "Response preview: $(echo "$response" | head -c 200)..."
            fi
        else
            echo -e "${RED}✗ FAIL${NC} - $expected_field not found"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
    fi
}

echo -e "\n${PURPLE}=== Phase 1: Upload API Endpoints ===${NC}"

echo -e "\n${BLUE}Testing upload endpoints (require auth):${NC}"

test_endpoint "Get User Uploads List" \
    "$BASE_URL/api/uploads" \
    "GET" \
    "" \
    ".uploads" \
    "true"

test_endpoint "Request Signed Upload URL" \
    "$BASE_URL/api/uploads" \
    "POST" \
    '{"fileName":"test-audio.wav","fileType":"audio/wav","sizeBytes":1024000,"conversationId":"test-conv"}' \
    ".signedUrl" \
    "true"

echo -e "\n${PURPLE}=== Phase 2: File Processing ===${NC}"

echo -e "\n${BLUE}File processing workflow (manual steps required):${NC}"
echo "1. Use the signedUrl from the previous test to upload a file:"
echo "   curl -X PUT '<signedUrl>' -H 'Content-Type: audio/wav' --data-binary @your-audio-file.wav"
echo ""
echo "2. Then process the uploaded file:"

test_endpoint "Process Upload (requires uploadId)" \
    "$BASE_URL/api/uploads/process" \
    "POST" \
    '{"uploadId":"test-upload-id"}' \
    ".status" \
    "true"

echo -e "\n${PURPLE}=== Phase 3: Upload Details ===${NC}"

test_endpoint "Get Upload Details (requires uploadId)" \
    "$BASE_URL/api/uploads/test-id" \
    "GET" \
    "" \
    ".file_name" \
    "true"

test_endpoint "Update Upload (requires uploadId)" \
    "$BASE_URL/api/uploads/test-id" \
    "PUT" \
    '{"conversation_id":"new-conv-id","meta":{"test":true}}' \
    ".upload" \
    "true"

echo -e "\n${PURPLE}=== Phase 4: File Type Validation ===${NC}"

echo -e "\n${BLUE}Testing file type validation:${NC}"

test_endpoint "Valid Audio File Type" \
    "$BASE_URL/api/uploads" \
    "POST" \
    '{"fileName":"test.mp3","fileType":"audio/mpeg","sizeBytes":5000000}' \
    ".signedUrl" \
    "true"

test_endpoint "Valid PDF File Type" \
    "$BASE_URL/api/uploads" \
    "POST" \
    '{"fileName":"document.pdf","fileType":"application/pdf","sizeBytes":2000000}' \
    ".signedUrl" \
    "true"

test_endpoint "Invalid File Type" \
    "$BASE_URL/api/uploads" \
    "POST" \
    '{"fileName":"malware.exe","fileType":"application/x-executable","sizeBytes":1000000}' \
    ".error" \
    "true"

test_endpoint "File Too Large" \
    "$BASE_URL/api/uploads" \
    "POST" \
    '{"fileName":"huge.wav","fileType":"audio/wav","sizeBytes":100000000}' \
    ".error" \
    "true"

echo -e "\n${PURPLE}=== Phase 5: Beta Events Integration ===${NC}"

echo -e "\n${BLUE}Testing upload event emission:${NC}"

test_endpoint "Emit Upload Ready Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"upload_ready","meta":{"upload_id":"test-id","file_type":"audio/wav","has_transcript":true}}' \
    ".success" \
    "true"

test_endpoint "Emit Upload Transcribed Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"upload_transcribed","meta":{"file_type":"audio/mpeg","duration":120,"word_count":250}}' \
    ".success" \
    "true"

test_endpoint "Emit Upload Context Used Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"upload_context_used","meta":{"upload_count":2,"mentioned_explicitly":true,"keywords":["recording","audio"]}}' \
    ".success" \
    "true"

echo -e "\n${PURPLE}=== Phase 6: Oracle Context Integration ===${NC}"

echo -e "\n${BLUE}Testing Oracle conversation with upload context:${NC}"

test_endpoint "Oracle Turn with Upload Reference" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"Can you summarize my recent recording?","context":{"conversationId":"test-conv"}}}' \
    ".response.text" \
    "true"

test_endpoint "Oracle Turn with Explicit Upload Mention" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"What did I say in that audio file about trust?","context":{"conversationId":"test-conv"}}}' \
    ".response.text" \
    "true"

test_endpoint "Oracle Turn - Check Upload Context in Response" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"Help me understand my patterns from the document I shared","context":{"conversationId":"test-conv"}}}' \
    ".metadata.context.uploads" \
    "true"

echo -e "\n${PURPLE}=== Phase 7: Badge Verification ===${NC}"

echo -e "\n${BLUE}Checking upload-related badges:${NC}"

test_endpoint "Check Badge Status After Upload Events" \
    "$BASE_URL/api/beta/status" \
    "GET" \
    "" \
    ".badges" \
    "true"

echo -e "\n${PURPLE}=== Phase 8: Manual Verification Steps ===${NC}"

echo -e "\n${BLUE}Manual UI Tests (check these manually):${NC}"
echo "1. Visit: $BASE_URL/oracle"
echo "   • Should see paperclip upload button in message composer"
echo "   • Drag and drop should work anywhere on the page"
echo "   • Upload progress should be visible with status chips"
echo "   • Recent uploads should appear as context cards above input"
echo ""
echo "2. Upload an audio file (.wav, .mp3, .m4a):"
echo "   • Should auto-transcribe in background"
echo "   • Should show 'processing...' then 'ready' status"
echo "   • Voice Voyager badge should be awarded"
echo "   • Audio should appear in upload context with transcript note"
echo ""
echo "3. Upload multiple files (3+):"
echo "   • PDF, text, and images supported"
echo "   • Archivist badge should be awarded"
echo "   • All files should show in context with summaries"
echo ""
echo "4. Reference uploads in conversation:"
echo "   • Say 'Tell me about my recording' or 'Summarize that document'"
echo "   • Oracle should use upload context automatically"
echo "   • Response should reference specific content from uploads"
echo "   • Insight Diver badge should be awarded"
echo ""
echo "5. Full Integration Test:"
echo "   • Upload voice memo about a personal challenge"
echo "   • Wait for transcription to complete"
echo "   • Ask: 'Oracle, what patterns do you notice in my reflection?'"
echo "   • Oracle should quote specific parts of transcript"
echo "   • Upload context should be visible in message composer"
echo ""
echo "6. Multi-File Context Test:"
echo "   • Upload audio, text, and image files"
echo "   • Ask: 'Help me synthesize these different aspects of my experience'"
echo "   • Oracle should weave insights from all file types"
echo "   • Context cards should show all uploads with appropriate icons"

echo -e "\n${PURPLE}=== Phase 9: Database Verification ===${NC}"

echo -e "\n${BLUE}Run these SQL queries in Supabase console:${NC}"
echo ""
echo "-- Check uploads table structure"
echo "SELECT id, file_name, file_type, status, created_at FROM uploads ORDER BY created_at DESC LIMIT 5;"
echo ""
echo "-- Check upload events"
echo "SELECT kind, COUNT(*) FROM beta_events WHERE kind LIKE '%upload%' GROUP BY kind;"
echo ""
echo "-- Check upload badges awarded"
echo "SELECT badge_id, COUNT(*) FROM beta_user_badges WHERE badge_id IN ('VOICE_VOYAGER', 'ARCHIVIST', 'INSIGHT_DIVER') GROUP BY badge_id;"
echo ""
echo "-- Check storage bucket contents"
echo "SELECT name, size, created_at FROM storage.objects WHERE bucket_id = 'uploads' ORDER BY created_at DESC LIMIT 5;"

echo -e "\n${PURPLE}=== Phase 10: Environment Check ===${NC}"

echo -e "\n${BLUE}Environment Variables:${NC}"
ENV_VARS=("UPLOADS_BUCKET" "TRANSCRIBE_PROVIDER" "MAX_UPLOAD_MB" "ALLOWED_MIME_TYPES" "OPENAI_API_KEY")

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${YELLOW}⚠${NC} $var is set but empty"
        fi
    else
        echo -e "${RED}✗${NC} $var is not set in .env.local"
    fi
done

echo -e "\n${PURPLE}=== Expected Behaviors Summary ===${NC}"

echo -e "\n${GREEN}✓ Upload System Active:${NC}"
echo "• Users can upload audio, video, text, PDF, and image files"
echo "• Files are stored securely in Supabase Storage"
echo "• Audio/video files are automatically transcribed"
echo "• Text files and PDFs are summarized"
echo "• Upload metadata is tracked in database"

echo -e "\n${BLUE}🎵 Transcription:${NC}"
echo "• Audio files transcribed using OpenAI Whisper"
echo "• Transcripts stored as JSONB with segments"
echo "• Text extraction works for PDFs and text files"
echo "• Processing status tracked (uploaded → processing → ready)"

echo -e "\n${YELLOW}🧠 Context Integration:${NC}"
echo "• Recent uploads included in Oracle conversation context"
echo "• Upload references detected in user messages"
echo "• Context formatted appropriately for AI consumption"
echo "• Upload usage tracked and rewarded with badges"

echo -e "\n${GREEN}🏆 Badge System:${NC}"
echo "• Voice Voyager: First audio transcription"
echo "• Archivist: 3+ files uploaded and processed"
echo "• Insight Diver: Referenced uploads in conversation"
echo "• Events emitted throughout upload lifecycle"

echo -e "\n${BLUE}🚨 Troubleshooting Guide:${NC}"
echo "• No uploads showing? Check authentication and RLS policies"
echo "• Transcription failing? Verify OPENAI_API_KEY and file format"
echo "• File type rejected? Check ALLOWED_MIME_TYPES configuration"
echo "• Storage errors? Verify Supabase storage bucket and policies"
echo "• Context not working? Check buildContext integration"
echo "• Badges not awarded? Verify event emission and engine rules"

echo -e "\n${GREEN}📁 File upload tests complete!${NC}"
echo "If all tests pass and manual verification succeeds:"
echo "• Users can upload files via drag-and-drop or file picker"
echo "• Audio/video files are automatically transcribed"
echo "• Text content is extracted and summarized"
echo "• Upload context flows into Oracle conversations"
echo "• Upload badges are awarded for meaningful milestones"

echo -e "\n${BLUE}Copy/Paste Smoke Commands:${NC}"
echo "# List uploads"
echo "curl -s '$BASE_URL/api/uploads' | jq '.uploads | length'"
echo ""
echo "# Request upload URL"
echo "curl -s -X POST '$BASE_URL/api/uploads' -H 'Content-Type: application/json' -d '{\"fileName\":\"test.wav\",\"fileType\":\"audio/wav\",\"sizeBytes\":1024}' | jq '.signedUrl'"
echo ""
echo "# Check beta events"
echo "curl -s '$BASE_URL/api/beta/status' | jq '.badges[] | select(.badge_id | test(\"VOICE_VOYAGER|ARCHIVIST|INSIGHT_DIVER\"))'"
echo ""
echo "# Oracle turn with upload reference"
echo "curl -s -X POST '$BASE_URL/api/oracle/turn' -H 'Content-Type: application/json' -d '{\"input\":{\"text\":\"What did I say in my recording?\"}}' | jq '.response.text'"
echo ""
echo "# Check upload context in Oracle response"
echo "curl -s -X POST '$BASE_URL/api/oracle/turn' -H 'Content-Type: application/json' -d '{\"input\":{\"text\":\"Summarize my uploads\"}}' | jq '.metadata.context.uploads'"
echo ""
echo "# Full integration test sequence"
echo "echo 'Test sequence: Upload → Process → Query → Badge check'"
echo "UPLOAD_ID=\$(curl -s -X POST '$BASE_URL/api/uploads' -H 'Content-Type: application/json' -d '{\"fileName\":\"voice-memo.wav\",\"fileType\":\"audio/wav\",\"sizeBytes\":2048000}' | jq -r '.uploadId')"
echo "echo \"Created upload: \$UPLOAD_ID\""
echo "curl -s -X POST '$BASE_URL/api/uploads/process' -H 'Content-Type: application/json' -d \"{\\\"uploadId\\\":\\\"\$UPLOAD_ID\\\"}\""
echo "curl -s -X POST '$BASE_URL/api/oracle/turn' -H 'Content-Type: application/json' -d '{\"input\":{\"text\":\"What insights emerge from my voice memo?\"}}' | jq '.response.text'"
echo "curl -s '$BASE_URL/api/beta/status' | jq '.badges[] | select(.badge_id == \"VOICE_VOYAGER\")'"

echo -e "\n${PURPLE}📁 Ready for file uploads and transcription! 🎵${NC}"