# Send Beta Invites Yourself

You can now send beautiful email invitations directly from your app!

## ✅ Setup (5 minutes)

### 1. Get Free Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier: 100 emails/day, 3,000/month)
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `re_`)

### 2. Add to Your Environment

Add to `.env.local`:

```bash
RESEND_API_KEY=re_your_key_here
```

### 3. Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🚀 Send Invites

Navigate to:
```
http://localhost:3000/admin/send-invites
```

### Option 1: Send Single Invite

1. Enter name: `Kelly`
2. Enter email: `kelly@example.com`
3. Click "Send Invitation"
4. Check their inbox!

### Option 2: Batch Send (All 26 at once)

1. Click "Batch Send (CSV)" tab
2. Paste your list:
   ```
   Kelly, kelly@example.com
   Sarah, sarah@example.com
   Michael, michael@example.com
   ```
3. Click "Send All Invitations"
4. Sends one every 2 seconds (safe for deliverability)

### CSV Template

Edit `public/email-templates/beta-testers.csv` with your 26 beta testers:

```csv
Name,Email
Kelly Thompson,kelly@example.com
Sarah Chen,sarah@example.com
Michael Rodriguez,michael@example.com
... (23 more)
```

Then copy/paste into the batch send form.

## 📧 What Gets Sent

- **From:** Kelly @ Soullab <kelly@soullab.life>
- **Subject:** ✨ Your MAIA Beta Invitation
- **Template:** Your beautiful dark-amber HTML email
- **Personalized:** Each recipient sees their own name
- **CTA:** Links to https://soullab.life/beta-entry

## 🔍 Testing

### Test Before Mass Send

1. Send to yourself first
2. Check Gmail, Apple Mail, Outlook
3. Click the CTA button
4. Verify everything looks right

### Deliverability Tips

**Better deliverability:**
- ✅ Verify your domain in Resend (optional but recommended)
- ✅ Send in batches (already does 1 every 2 seconds)
- ✅ Use real "from" name (Kelly @ Soullab)
- ✅ Include plain text version (already included)

**Avoid spam:**
- ❌ Don't send 26 at exact same time
- ❌ Don't use all caps in subject
- ❌ Don't use spammy words

## 🎯 Production (Optional Better Setup)

### Verify Your Domain

**In Resend Dashboard:**
1. Domains → Add Domain
2. Add `soullab.life`
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (~5 minutes)

**Benefits:**
- Better deliverability
- Lower spam score
- Professional sender reputation

### Track Opens/Clicks

Resend automatically tracks:
- Who opened the email
- Who clicked the CTA
- Delivery status

View in Resend dashboard → Emails → Activity

## 🆚 vs Mailmeter/Email Platform

### Using This Admin Page

**Pros:**
- ✅ Complete control
- ✅ Beautiful Soullab aesthetic
- ✅ Free (100/day)
- ✅ Instant sending
- ✅ Track results in code

**Cons:**
- ❌ Need API key setup (5 min)
- ❌ No unsubscribe management
- ❌ Manual CSV entry

### Using Mailmeter

**Pros:**
- ✅ Unsubscribe handling
- ✅ Contact management
- ✅ Compliance built-in

**Cons:**
- ❌ Complex UI
- ❌ Custom HTML limitations
- ❌ May cost money
- ❌ Your screenshot shows basic editor

## 📊 Which Should You Use?

**For Beta (26 people) → Use Admin Page**
- Faster setup
- More control
- Perfect for small batch

**For Production (thousands) → Use Email Platform**
- Need unsubscribe management
- Need list management
- Legal requirements

## 🔧 Troubleshooting

### "RESEND_API_KEY not configured"

Add to `.env.local` and restart dev server.

### Emails not arriving

1. Check spam folder
2. Wait 2-3 minutes
3. Check Resend dashboard for delivery status
4. Verify email address is correct

### "Failed to send"

- Check Resend dashboard for error details
- May have hit daily limit (100/day free)
- Check recipient email is valid

### HTML looks broken

The template is already tested, but if issues:
1. Send to yourself first
2. Check in Gmail/Apple Mail
3. Let me know which client has issues

## 📝 Quick Checklist

Before sending to all 26:

- [ ] Resend API key added to `.env.local`
- [ ] Dev server restarted
- [ ] Sent test to yourself
- [ ] Checked email in Gmail/Outlook
- [ ] CTA button works
- [ ] Holoflower image loads
- [ ] CSV file ready with all 26 names/emails
- [ ] Email addresses verified

## 🎉 You're Ready!

Go to: `http://localhost:3000/admin/send-invites`

Send your beautiful beta invitations! 🚀