# 📢 Social Media Deployment Guide

**Launch Day: Monday 09/29/25**

---

## Timeline

### Monday 09/29/25

**9:00am EST** - Beta email sends to existing testers
**10:00am EST** - Begin social media rollout

```
10:00am - Twitter thread (all 6 tweets)
10:30am - LinkedIn post (choose version A or B)
11:00am - Instagram post + stories
12:00pm - Reddit (r/journaling)
1:00pm - Reddit (r/selfimprovement)
3:00pm - Hacker News (if approved)
```

---

## Pre-Launch Checklist

### URLs to Update (Before Posting)

All social posts use these URLs - verify they work:

- [ ] **Main app**: `https://spiralogic.com/journal/voice`
- [ ] **Voice guide**: `https://spiralogic.com/docs/voice-guide`
- [ ] **Community**: `https://community.spiralogic.com` (or Discord/Slack link)
- [ ] **Twitter**: `https://twitter.com/SpiralogicAI`
- [ ] **GitHub**: (if making public)

### Platform Accounts Ready

- [ ] Twitter/X account logged in
- [ ] LinkedIn personal profile ready
- [ ] Instagram business account ready
- [ ] Reddit account with sufficient karma
- [ ] Hacker News account (need to submit "Show HN")

### Assets Ready

- [ ] Logo/icon for profile pics (512x512px)
- [ ] Cover images (if needed per platform)
- [ ] Screenshots for Instagram/LinkedIn
- [ ] Short video clip (optional, 15-30 sec demo)

---

## Platform-Specific Instructions

### Twitter/X

**File**: `social-posts/TWITTER_THREAD.txt`

**How to post**:
1. Open Twitter/X in browser
2. Copy Tweet 1 from file
3. Click "+" to add thread
4. Paste Tweets 2-6 in sequence
5. Review entire thread
6. Click "Post all" at 10:00am EST

**Engagement**:
- Reply to every comment within 2 hours
- Retweet user testimonials
- Pin the thread to profile for the week

---

### LinkedIn

**Files**:
- `social-posts/LINKEDIN_PROFESSIONAL.txt` (for dev/tech audience)
- `social-posts/LINKEDIN_INSPIRATIONAL.txt` (for general audience)

**Choose one version** based on your network composition.

**How to post**:
1. Open LinkedIn
2. Click "Start a post"
3. Copy/paste chosen version
4. Add screenshot or video (optional)
5. Post at 10:30am EST

**Engagement**:
- Respond to all comments same day
- Thank people who share
- Engage with relevant hashtags

---

### Instagram

**File**: `social-posts/INSTAGRAM_CAPTION.txt`

**How to post**:
1. Open Instagram app
2. Create new post with image/video
3. Copy caption from file
4. Add "Link in bio" (update bio link first!)
5. Post at 11:00am EST

**Story ideas**:
- Behind-the-scenes of launch day
- Screen recording of voice journal session
- Quote cards from testimonials
- Countdown to launch

---

### Reddit

**File**: `social-posts/REDDIT_POST.txt`

**Subreddits to post in** (stagger by 1 hour each):
1. r/journaling (12:00pm EST)
2. r/selfimprovement (1:00pm EST)
3. r/meditation (later/optional)
4. r/Jung (later/optional)
5. r/consciousness (later/optional)

**How to post**:
1. Copy title and body from file
2. Post as text post (not link)
3. Be present to answer questions immediately
4. Don't cross-post too quickly (space out by 1+ hour)

**Reddit etiquette**:
- Don't be overly promotional
- Engage authentically with feedback
- If getting downvoted, don't double down
- Thank people for constructive criticism

---

### Hacker News

**File**: `social-posts/HACKERNEWS_POST.txt`

**How to post**:
1. Go to https://news.ycombinator.com/submit
2. Use title from file (starts with "Show HN:")
3. URL: `https://spiralogic.com/journal/voice`
4. Text: Copy body from file
5. Submit at 3:00pm EST (or Tuesday morning)

**HN Strategy**:
- Be technical and honest
- Respond to all questions within 1 hour
- Don't argue with critics
- Share architecture details if asked
- Emphasize open source + self-hosting

**HN Success Criteria**:
- Stay on front page for 4+ hours
- Get 50+ points
- Generate technical discussion

---

## Response Templates

### Common Question: "How is this different from [other app]?"

**Response**:
> Great question! Most voice apps transcribe and store. MAIA reflects and evolves. She extracts symbols (ocean, threshold, phoenix), identifies archetypes (Hero, Shadow, Mystic), and adapts her voice to your elemental energy. Think of it as a sacred mirror, not a notebook.

---

### Common Question: "What about privacy?"

**Response**:
> Absolute priority. Your voice is encrypted end-to-end, transcribed then discarded (unless you choose to save), never used for training, and fully exportable (Obsidian/PDF/JSON). Self-hostable architecture coming soon. Zero voice biometrics. Zero data selling.

---

### Common Question: "Is this like therapy?"

**Response**:
> No. MAIA doesn't diagnose, prescribe, or advise. She's a reflective tool, like journaling, not a clinical intervention. If you're in crisis, we guide you to appropriate resources. Think of MAIA as a meditation guide, not a therapist.

---

### Common Question: "Pricing?"

**Response**:
> Free during beta through Q1 2026. Current thinking post-beta: Free tier (5 sessions/month), Premium ($19/month unlimited), Lifetime discount (50% off for beta testers). We'll give 90 days notice before charging anyone.

---

## Engagement Strategy

### First 4 Hours (10am-2pm EST)
- **Monitor constantly**
- Respond to every comment/question within 30 minutes
- Share early wins to team
- Screenshot positive feedback

### Rest of Day (2pm-11pm EST)
- Check every 2 hours
- Continue responding to all comments
- Share thread/post to other platforms
- Engage with anyone who shares your post

### Evening Push (8pm-10pm EST)
- Post update thread on Twitter
- Thank everyone who engaged
- Share interesting questions/feedback
- Tease tomorrow's follow-up

---

## Tracking Metrics

**Spreadsheet columns**:
- Platform
- Post time
- Likes/upvotes
- Comments
- Shares/retweets
- Click-throughs (use UTM params if possible)
- Beta signups (track in Supabase)

**UTM Parameters** (optional):
```
?utm_source=twitter&utm_medium=social&utm_campaign=voice_beta_launch
?utm_source=linkedin&utm_medium=social&utm_campaign=voice_beta_launch
?utm_source=reddit&utm_medium=social&utm_campaign=voice_beta_launch
?utm_source=hackernews&utm_medium=social&utm_campaign=voice_beta_launch
```

---

## Emergency Contacts

**If something goes wrong**:
- [ ] Tech lead for bugs: [contact]
- [ ] Design for broken images: [contact]
- [ ] Support for user questions: [contact]

**If getting negative feedback**:
- Don't delete unless violating ToS
- Respond calmly and professionally
- Acknowledge valid criticism
- Take defensive posture offline (DMs)

---

## Post-Launch Follow-Up

### Tuesday 09/30/25

**Morning** - Post thank you thread:
```
Thank you to everyone who tried voice journaling yesterday.

Highlights so far:
- [X] beta signups
- [Y] voice sessions recorded
- [Z] symbols discovered

Early feedback is shaping v2. Keep it coming!
```

**Afternoon** - Share Product Hunt launch (if doing Tuesday)

### Wednesday 10/01/25

**Share lessons learned**:
- What worked in voice journaling
- Interesting bugs discovered
- User stories that stood out
- What we're building next

---

## Files Reference

All ready-to-post content is in `/social-posts/`:

```
social-posts/
├── TWITTER_THREAD.txt
├── LINKEDIN_PROFESSIONAL.txt
├── LINKEDIN_INSPIRATIONAL.txt
├── INSTAGRAM_CAPTION.txt
├── REDDIT_POST.txt
├── HACKERNEWS_POST.txt
└── DEPLOYMENT_GUIDE.md (this file)
```

---

**Ready to Launch! 🚀**

The voice is live. The posts are ready. The community is waiting.

Speak your truth and let the world hear it.