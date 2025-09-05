# 🗄️ Supabase Connection Troubleshooting Guide
**Fix Memory Persistence in 10 Minutes**

---

## 🎯 **Priority 2: Get Memory Persistence Working**

Currently Maya can't save memories due to Supabase DNS issues. This guide fixes that.

---

## 🔍 **Step 1: Diagnose the Issue (2 minutes)**

### **1.1 Test Current Connection**
```bash
# Load your environment
source .env.local

# Test basic connectivity
curl -s "$SUPABASE_URL/rest/v1/" | jq .

# Expected: JSON response with version info
# If timeout/error: DNS/connectivity issue
```

### **1.2 Check Current Configuration** 
```bash
echo "Supabase URL: $SUPABASE_URL"
echo "Region: $(echo $SUPABASE_URL | cut -d. -f1 | cut -d/ -f3)"

# Current URL: jkbetmadzcpoinjogkli.supabase.co
# Region: likely US East
```

### **1.3 Test from Maya's Backend**
```bash
# Test via your app's health endpoint
curl -s http://localhost:3002/api/v1/health | jq .supabase

# Expected: "connected"  
# If "disconnected": Backend can't reach Supabase
```

---

## 🛠️ **Step 2: Quick Fixes (try in order)**

### **2.1 DNS Flush & Retry**
```bash
# Clear DNS cache (macOS)
sudo dscacheutil -flushcache

# Test again
curl -s "$SUPABASE_URL/rest/v1/" | jq .
```

### **2.2 Try Direct IP (bypass DNS)**
```bash
# Get Supabase IP
nslookup jkbetmadzcpoinjogkli.supabase.co

# Test with IP (replace with actual IP)
curl -s "https://[IP-ADDRESS]/rest/v1/" \
  -H "Host: jkbetmadzcpoinjogkli.supabase.co" | jq .
```

### **2.3 Check Network/Firewall**
```bash
# Test basic HTTPS connectivity
curl -I https://supabase.co

# If fails: Network/firewall blocking HTTPS
# If works: Issue specific to your project
```

---

## 🔄 **Step 3: Create New Supabase Project (8 minutes)**

If the current project is unreachable, create a fresh one:

### **3.1 Create New Project**
1. Go to https://supabase.com/dashboard
2. Click "New Project"  
3. Choose:
   - **Name**: `maya-oracle-v2`
   - **Region**: `US East (N. Virginia)` or your closest
   - **Database Password**: Generate strong password

### **3.2 Get New Credentials**
Once created, go to **Settings > API**:
```bash
# Copy these values:
PROJECT_URL=https://[new-id].supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cC...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cC...
```

### **3.3 Update Environment**
```bash
# Update .env.local
cp .env.local .env.local.backup

# Replace Supabase config
sed -i '' "s|SUPABASE_URL=.*|SUPABASE_URL=https://[new-id].supabase.co|" .env.local
sed -i '' "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=[new-anon-key]|" .env.local  
sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=[new-service-key]|" .env.local

# Also update VITE versions
sed -i '' "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=https://[new-id].supabase.co|" .env.local
sed -i '' "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=[new-anon-key]|" .env.local
```

### **3.4 Create Required Tables**
The backend will auto-create tables on first run, or manually:

```sql
-- Go to Supabase > SQL Editor > New Query
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS oracle_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  agent_type TEXT DEFAULT 'maya',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_insights ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (adjust as needed)
CREATE POLICY "Allow anonymous access" ON memories FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON oracle_insights FOR ALL USING (true);
```

---

## ✅ **Step 4: Verify Fix (2 minutes)**

### **4.1 Test New Connection**
```bash
# Restart your backend to pick up new config
./scripts/start-beta.sh

# Should see in logs:
# "✅ Supabase Connection: Connected"
```

### **4.2 Test Memory Persistence**
```bash
# Test write/read cycle
curl -X POST http://localhost:3002/api/v1/memory/test \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","content":"Connection test"}'

# Should return success
```

### **4.3 Full Oracle Test**
- Go to http://localhost:3000/oracle
- Ask Maya: "Remember that I like coffee"
- Refresh page and ask: "What do you remember about me?"
- Should recall the coffee preference

---

## 🔍 **Alternative Solutions**

### **Option A: Use Different Region**
If US East has issues, try:
- **EU West (Ireland)**: Usually stable
- **Asia Pacific (Sydney)**: Good for Asia/Pacific
- **US West (Oregon)**: Alternative US region

### **Option B: Local Database (Development)**
```bash
# Use SQLite for development
echo "DATABASE_URL=sqlite:./maya-memory.db" >> .env.local
echo "SUPABASE_ENABLED=false" >> .env.local

# Backend will fall back to local storage
```

### **Option C: Alternative Backend-as-a-Service**
- **PlanetScale**: MySQL-compatible
- **Neon**: Postgres-compatible  
- **Firebase Firestore**: Document-based

---

## 📊 **Success Criteria**

Memory persistence is working when:

1. **🟢 Health Check**: `/api/v1/health` shows `"supabase":"connected"`
2. **💾 Write Test**: Can save memories via API
3. **📖 Read Test**: Can retrieve saved memories  
4. **🔄 Full Cycle**: Oracle remembers conversations across sessions
5. **⚡ Performance**: Database queries < 200ms

---

## 🎯 **Priority 3: Monitoring (Optional)**

Once both Sesame + Supabase are working:
1. Set up alerts for voice engine failures
2. Monitor database connection health  
3. Track voice generation performance
4. Add Slack/email notifications for outages

---

**🚨 Most Common Issue**: DNS propagation delays for new Supabase projects
**🛡️ Best Solution**: Create new project in same region, update credentials
**⏰ Time to fix**: 10 minutes max