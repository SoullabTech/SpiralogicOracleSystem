# 📖 Sacred Mirror Beta — Implementation Playbook

This playbook merges **frontend** + **backend** Claude prompt packs with Supabase migrations and test instructions. It's structured in phases so you can feed prompts directly into Claude and build step by step.

---

## 🚀 Overview

* **Frontend Path**: `app/oracle/page-beta.tsx`
* **Backend Path**: `backend/src/api/journal/*` + `backend/src/api/chat/*`
* **Database**: Supabase (Postgres)
* **Agent**: Maya (Sacred Tech design system)
* **Design System**: Deep blue (#0F172A) + gold (#F59E0B), no purple

---

## 🔮 Phase 1 — Deploy Sacred Mirror Beta Page

**Frontend Prompt:**

* Replace `app/oracle/page.tsx` with `page-beta.tsx` as default
* Ensure Sacred Tech UI (deep blue + gold, no purple)
* Implement conversational interface with Maya
* Add voice recording capability
* Show real-time streaming responses

**Key Components:**
* Voice recorder with real-time transcription
* Streaming chat interface
* Memory/journal display panel
* Elemental selector

---

## 📂 Phase 2 — File Upload Integration

**Frontend Prompt:**

* Add file input → POST `/api/journal/upload`
* Support `.txt`, `.docx`, `.pdf` files
* Show upload progress
* Display results in Memory view

**Backend Prompt:**

* Create `api/journal/upload.ts`
* Accept multipart/form-data
* Parse document content
* Save in `journals` table
* Return `{ success: true, journalId, content }`

**Supabase Migration:**

```sql
create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  content text not null,
  type text check (type in ('journal','upload','voice')) default 'journal',
  element text check (element in ('air','fire','water','earth','aether')) default 'aether',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table journals enable row level security;

create policy "Users can view own journals" on journals
  for select using (auth.uid() = user_id);

create policy "Users can create own journals" on journals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own journals" on journals
  for update using (auth.uid() = user_id);
```

---

## 📝 Phase 3 — Journal Creation

**Frontend Prompt:**

* Add "New Journal Entry" button + modal
* Rich text editor for journal content
* Save to `/api/journal/create`
* Refresh Memory view after save
* Show success/error notifications

**Backend Prompt:**

* Implement `api/journal/create.ts`
* Accept JSON `{ content, type: "journal", element }`
* Validate content length (min 10 chars)
* Save into `journals` table
* Return created journal with ID

**API Schema:**
```typescript
// Request
POST /api/journal/create
{
  content: string,
  type: "journal" | "voice" | "upload",
  element: "air" | "fire" | "water" | "earth" | "aether"
}

// Response
{
  success: boolean,
  journal?: {
    id: string,
    content: string,
    type: string,
    element: string,
    created_at: string
  },
  error?: string
}
```

---

## 🌬 Phase 4 — Elemental Selection

**Frontend Prompt:**

* Add Air/Fire/Water/Earth/Aether selector
* Visual icons for each element
* Store in component state
* Attach to all journal/chat requests
* Persist user's last selection

**Backend Prompt:**

* Add `element` field to all requests
* Forward element into AI system prompt
* Adjust Maya's responses based on element:
  - Air: Intellectual, analytical
  - Fire: Passionate, transformative
  - Water: Emotional, intuitive
  - Earth: Grounded, practical
  - Aether: Spiritual, transcendent

**Supabase Migration:**

```sql
-- Add element to chat messages
alter table chat_messages add column if not exists element text default 'aether';

-- Add index for performance
create index idx_journals_user_element on journals(user_id, element);
create index idx_chat_messages_user_element on chat_messages(user_id, element);
```

---

## 🔐 Phase 5 — Authentication

**Frontend Prompt:**

* Wrap Sacred Mirror Beta in `AuthGuard`
* Redirect to `/auth/login` if unauthenticated
* Show user profile/logout in header
* Handle session expiry gracefully

**Backend Prompt:**

* Use `verifyAuth(req)` middleware on all endpoints
* Extract `userId` from JWT token, not request body
* Return 401 for invalid/expired tokens
* Apply to: `journal/create`, `journal/upload`, `chat/send`

**Auth Flow:**
1. User logs in → receives JWT token
2. Frontend stores token in secure cookie
3. All API requests include `Authorization: Bearer {token}`
4. Backend validates token → extracts userId
5. Database queries filtered by userId

---

## 💬 Phase 6 — Chat Integration

**Backend Prompt:**

* Create `api/chat/send.ts` endpoint
* Stream responses using Server-Sent Events
* Integrate with Maya personality system
* Include user's journals as context
* Save conversation to `chat_messages`

**Supabase Schema:**

```sql
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  role text check (role in ('user','assistant','system')) not null,
  content text not null,
  element text default 'aether',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS policies
alter table chat_messages enable row level security;

create policy "Users can view own messages" on chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can create own messages" on chat_messages
  for insert with check (auth.uid() = user_id);
```

---

## 🎤 Phase 7 — Voice Integration

**Frontend Prompt:**

* Add voice recorder component
* Real-time audio waveform visualization
* Auto-stop on silence detection
* Send audio to `/api/voice/transcribe`
* Show transcription in chat

**Backend Prompt:**

* Create `api/voice/transcribe.ts`
* Accept audio blob (webm/wav)
* Use Whisper API for transcription
* Return `{ text, confidence }`
* Optional: save audio to storage

---

## 🧪 Testing Commands

**1. Upload Test:**
```bash
curl -X POST http://localhost:3000/api/journal/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.txt" \
  -F "element=fire"
```

**2. Journal Create Test:**
```bash
curl -X POST http://localhost:3000/api/journal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Today I reflected on the nature of change...",
    "type": "journal",
    "element": "water"
  }'
```

**3. Chat Send Test:**
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What patterns do you see in my recent journals?",
    "element": "air"
  }'
```

**4. Voice Transcribe Test:**
```bash
curl -X POST http://localhost:3000/api/voice/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@recording.webm" \
  -F "element=earth"
```

---

## 🎨 Sacred Tech Design System

**Colors:**
```css
--sacred-blue: #0F172A;     /* Deep sacred blue */
--sacred-gold: #F59E0B;     /* Illuminated gold */
--sacred-text: #E2E8F0;     /* Light grey text */
--sacred-bg: #020617;       /* Near black background */
```

**Typography:**
- Headers: Inter, -apple-system, system-ui
- Body: Inter, -apple-system, system-ui
- Code: 'Fira Code', 'Courier New', monospace

**Components:**
- Buttons: Rounded corners, gold hover states
- Cards: Dark backgrounds with subtle borders
- Inputs: Dark theme with gold focus rings
- Modals: Backdrop blur with centered content

---

## 🚀 Deployment Checklist

### Local Development:
- [ ] Node.js 18+ installed
- [ ] PostgreSQL or Supabase local running
- [ ] Environment variables configured
- [ ] `npm install` in both frontend and backend
- [ ] Run migrations: `npx supabase db push`

### Pre-Production:
- [ ] Sacred Mirror Beta page loads
- [ ] File upload works (all formats)
- [ ] Journal creation saves correctly
- [ ] Chat streaming functions
- [ ] Voice recording transcribes
- [ ] Elemental selection persists
- [ ] Auth redirects properly
- [ ] Memory view displays all content

### Production Ready:
- [ ] SSL certificates configured
- [ ] CORS headers set correctly
- [ ] Rate limiting implemented
- [ ] Error logging active
- [ ] Database backups scheduled
- [ ] Monitoring dashboards live

---

## 🔑 Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Backend (.env)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-jwt-secret
WHISPER_API_KEY=your-whisper-key
```

---

## 📊 Monitoring & Analytics

**Key Metrics:**
- User engagement (daily active users)
- Journal creation rate
- Chat conversation length
- Voice usage percentage
- Elemental distribution
- Error rates by endpoint

**Suggested Tools:**
- Supabase Dashboard (database metrics)
- Vercel Analytics (frontend performance)
- Sentry (error tracking)
- Mixpanel (user behavior)

---

## 🆘 Troubleshooting

**Common Issues:**

1. **Upload fails with 413 error**
   - Increase body size limit in API route
   - Check Vercel/hosting limits

2. **Chat responses cut off**
   - Verify streaming implementation
   - Check timeout settings

3. **Voice recording silent**
   - Ensure microphone permissions
   - Verify audio format compatibility

4. **Auth redirect loop**
   - Check cookie settings
   - Verify JWT expiry handling

---

## ✅ Next Steps for Switzerland Demo

1. **Day 1**: Deploy Sacred Mirror Beta page
2. **Day 2**: File upload + journal creation stable
3. **Day 3**: Elemental metadata live
4. **Day 4**: Auth enforced (test multiple accounts)
5. **Day 5**: Voice + memory integrated
6. **Demo Day**: Full walkthrough ready

---

## 📚 Additional Resources

- [Sacred Tech Design System](./docs/SACRED_TECH_DESIGN.md)
- [Maya Personality Guide](./docs/MAYA_PERSONALITY.md)
- [API Documentation](./docs/API_REFERENCE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)

---

**Kelly** — This playbook contains everything needed to implement the Sacred Mirror Beta. Each phase builds on the previous one, and the prompts can be fed directly to Claude for implementation.

For questions or updates, reference this document as the single source of truth for the Switzerland demo.