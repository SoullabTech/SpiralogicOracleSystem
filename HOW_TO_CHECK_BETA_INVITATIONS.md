# 📧 How to Check Beta Email Invitations

**Quick Answer:** Check your Resend dashboard and Supabase beta tables.

---

## 🔍 Three Ways to Verify Invitations Sent

### 1. **Resend Dashboard** (Recommended)

The `/api/send-invite` endpoint uses **Resend** to send emails.

**Steps:**
1. Go to [resend.com](https://resend.com) and log in
2. Navigate to **"Emails"** tab
3. Check recent sends for:
   - **From:** `Kelly @ Soullab <kelly@soullab.life>`
   - **Subject:** `✨ Your MAIA Beta Invitation`
   - **Status:** Delivered / Bounced / Failed

**What to Look For:**
- ✅ **Delivered** = Successfully sent
- ⚠️ **Pending** = Still sending
- ❌ **Failed/Bounced** = Issue with recipient email

**Resend API Key Location:**
```bash
# Check if configured:
cat apps/web/.env.local | grep RESEND_API_KEY
```

---

### 2. **Admin Send Interface**

Use the built-in admin UI at:
```
http://localhost:3000/admin/send-invites
```

**Features:**
- **Single Send:** Send to one person at a time
- **Batch Send:** Upload CSV (Name, Email format)
- **Live Results:** See success/failure for each send
- **Message IDs:** Track emails in Resend

**Example CSV Format:**
```csv
Kelly, kelly@example.com
Sarah, sarah@example.com
Michael, michael@example.com
```

**Rate Limiting:** Batch sends wait 2 seconds between emails for deliverability.

---

### 3. **Supabase Beta Signups Table**

Check who **signed up** (vs. who was invited):

```sql
-- In Supabase SQL Editor:
SELECT
  first_name,
  last_name,
  email,
  status,
  preferred_element,
  created_at
FROM beta_signups
ORDER BY created_at DESC;
```

**Or via API:**
```bash
curl http://localhost:3000/api/beta-signup \
  -H "Authorization: admin"
```

**Table Structure:**
- `beta_signups` - Who signed up via the form
- `beta_testers` - Active testers with profiles
- Status: `pending` → `approved` → `active`

---

## 🛠 How the Invitation System Works

### Flow:
1. **Admin sends invite** → `/api/send-invite` (POST)
2. **Resend delivers email** → Beautiful HTML template
3. **User clicks "Enter the Diamond"** → `https://soullab.life/beta-entry`
4. **User fills form** → `/api/beta-signup` (POST)
5. **Record created** → Supabase `beta_signups` table

---

## 📊 Check Invitation Status

### Quick Diagnostic Script:

```bash
# Check Resend API key
cat apps/web/.env.local | grep RESEND_API_KEY

# Check Supabase connection
cat apps/web/.env.local | grep SUPABASE

# Run dev server and access admin UI
cd apps/web && npm run dev
# Then visit: http://localhost:3000/admin/send-invites
```

---

## 🎯 Testing Invitations

### Send a Test Invite:

```bash
curl -X POST http://localhost:3000/api/send-invite \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "re_abc123xyz",
  "message": "Invitation sent to Test User at your-email@example.com"
}
```

---

## ✅ Verification Checklist

- [ ] **Resend API Key** configured in `.env.local`
- [ ] **Supabase** connection configured
- [ ] **Admin UI** accessible at `/admin/send-invites`
- [ ] **Test email** sent to yourself
- [ ] **Resend dashboard** shows "Delivered"
- [ ] **Email received** in inbox (check spam folder)
- [ ] **CTA link works** (`https://soullab.life/beta-entry`)

---

## 📧 Email Template Details

**File:** `apps/web/app/api/send-invite/route.ts`

**Template Features:**
- ✨ **Beautiful dark amber design** with Spiralogic Diamond
- 🔥 **Seven elemental facets** explained
- 🎯 **Clear CTA:** "Enter the Diamond"
- 📱 **Mobile-responsive** HTML
- 📨 **Plain-text fallback** included

**Customization:**
- Edit template in `route.ts:24-395`
- Change sender: Line 499 (`from: 'Kelly @ Soullab <kelly@soullab.life>'`)
- Change subject: Line 501 (`subject: '✨ Your MAIA Beta Invitation'`)

---

## 🔧 Troubleshooting

### Issue: "RESEND_API_KEY not configured"
**Fix:**
```bash
echo "RESEND_API_KEY=your-key-here" >> apps/web/.env.local
```

### Issue: Emails not delivering
**Check:**
1. Resend dashboard for error messages
2. Recipient email validity
3. SPF/DKIM records configured for domain
4. Check spam folder

### Issue: Can't access admin UI
**Fix:**
```bash
# Restart dev server
cd apps/web && npm run dev
# Visit: http://localhost:3000/admin/send-invites
```

---

## 🎁 Batch Invitation Example

**26 Beta Testers CSV:**
```csv
Kelly, kelly@example.com
Sarah, sarah@example.com
Michael, michael@example.com
...
```

**Send All:**
1. Go to `/admin/send-invites`
2. Click "Batch Send (CSV)"
3. Paste CSV data
4. Click "Send All Invitations"
5. Watch live progress (1 every 2 seconds)
6. Check Resend dashboard for delivery confirmation

---

## 📈 Monitor Beta Program

### Key Metrics:
- **Invitations sent:** Resend dashboard count
- **Signups received:** Supabase `beta_signups` count
- **Conversion rate:** Signups / Invitations
- **Preferred elements:** Most popular choice
- **Geographic distribution:** Cities represented

### SQL Query for Stats:
```sql
SELECT
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE has_microphone = true) as with_mic,
  json_object_agg(preferred_element, element_count) as element_breakdown
FROM (
  SELECT
    preferred_element,
    COUNT(*) as element_count
  FROM beta_signups
  GROUP BY preferred_element
) as element_stats, beta_signups;
```

---

## 🌟 Next Steps

1. **Verify Resend configuration**
2. **Send test invite to yourself**
3. **Access admin UI** for batch sending
4. **Monitor Resend dashboard**
5. **Check Supabase for signups**
6. **Approve beta testers** in `beta_signups` table

---

**Need Help?**
- Resend docs: https://resend.com/docs
- Check `/api/send-invite/route.ts:1-524` for implementation
- Admin UI: `/admin/send-invites/page.tsx:1-340`