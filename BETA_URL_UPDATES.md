# 📝 BETA MATERIALS URL UPDATE GUIDE
## Update All Beta Documents for soullab.life/beta

---

## 🔄 GLOBAL REPLACEMENTS NEEDED

### Search & Replace Across All Beta Documents:

```bash
# Run these replacements in all beta files:

# Old → New URL mappings:
beta.spiralogic.oracle → soullab.life/beta
spiralogic.oracle/beta → soullab.life/beta
[your-project].vercel.app/beta → soullab.life/beta
beta@spiralogic.oracle → beta@soullab.life
discord.gg/spiralogic → discord.gg/soullab
```

---

## 📋 FILE-BY-FILE UPDATES

### 1. BETA_RECRUITMENT_STORY.md
```markdown
# Update these sections:

Line 73: [Application Link] → https://soullab.life/beta/apply
Line 126: **Questions?** beta@spiralogic.oracle → beta@soullab.life
Line 127: **Community?** discord.gg/spiralogic → discord.gg/soullab
Line 128: **Vision?** spiralogic.oracle/manifesto → soullab.life/manifesto
```

### 2. BETA_EMAIL_SEQUENCE.md
```markdown
# Update all email templates:

Email 2 - Line 15:
Beta URL: beta.spiralogic.oracle → soullab.life/beta

Email 3 - Line 35:
Begin now: beta.spiralogic.oracle → soullab.life/beta

All emails:
From: feedback@spiralogic.oracle → beta@soullab.life
Discord: discord.gg/spiralogic → discord.gg/soullab
```

### 3. BETA_LANDING_PAGE.md
```markdown
# Update form actions and URLs:

Line 324: <form action="/api/beta/apply">
         → Keep as is (relative URL works)

Line 412: Discord community link
         → https://discord.gg/soullab

Line 428: Beta URL: https://[your-project].vercel.app/beta
         → https://soullab.life/beta
```

### 4. BETA_QUICK_START.md
```markdown
# Update access instructions:

Line 8: Go to: **[Your Beta URL]**
       → Go to: **https://soullab.life/beta**

Line 91: Email to: **beta@spiralogic.com**
       → Email to: **beta@soullab.life**

Line 102: Discord: #beta-help
        → Discord: #soullab-beta
```

### 5. BETA_TESTER_FAQ.md
```markdown
# Update contact information:

Line 287: email critical@spiralogic.oracle
        → email critical@soullab.life

Line 293: Join our Discord: [link]
        → Join our Discord: https://discord.gg/soullab

Line 346: Reach out via media@spiralogic.oracle
        → Reach out via media@soullab.life
```

### 6. BETA_TROUBLESHOOTING_GUIDE.md
```markdown
# Update support contacts:

Line 412: Email: help@spiralogic.oracle
        → Email: help@soullab.life

Line 420: security@spiralogic.oracle
        → security@soullab.life
```

### 7. BETA_ONBOARDING_CHECKLIST.md
```markdown
# Update onboarding URLs:

Line 17: Navigate to beta.spiralogic.oracle
       → Navigate to soullab.life/beta

Line 108: Discord: discord.gg/spiralogic
        → Discord: discord.gg/soullab

Line 109: Slack: spiralogic.slack.com
        → Slack: soullab.slack.com
```

### 8. BETA_FEEDBACK_SYSTEM.md
```markdown
# Update API endpoints:

Line 187: POST /api/feedback/quick
        → Remains the same (relative URL)

Line 234: Email: feedback@spiralogic.oracle
        → Email: beta@soullab.life
```

### 9. BETA_TEST_REPORT_TEMPLATE.md
```markdown
# Update report headers:

Add to header:
Platform: Soullab Collective
URL: https://soullab.life/beta
```

### 10. BETA_VERCEL_DEPLOYMENT.md
```markdown
# This file becomes obsolete, replaced by:
→ SOULLAB_BETA_DEPLOYMENT.md
```

### 11. BETA_TECHNICAL_IMPLEMENTATION.md
```markdown
# Update webhook URLs:

Line 892: DISCORD_WEBHOOK_URL
        → Update to Soullab Discord webhook

Line 897: SLACK_WEBHOOK_URL
        → Update to Soullab Slack webhook
```

---

## 🔧 AUTOMATED UPDATE SCRIPT

### Create update-urls.sh:
```bash
#!/bin/bash

# Backup original files
cp -r . ../beta-backup

# Define replacements
declare -A replacements=(
  ["beta.spiralogic.oracle"]="soullab.life/beta"
  ["spiralogic.oracle/beta"]="soullab.life/beta"
  ["beta@spiralogic.oracle"]="beta@soullab.life"
  ["feedback@spiralogic.oracle"]="beta@soullab.life"
  ["critical@spiralogic.oracle"]="critical@soullab.life"
  ["help@spiralogic.oracle"]="help@soullab.life"
  ["media@spiralogic.oracle"]="media@soullab.life"
  ["security@spiralogic.oracle"]="security@soullab.life"
  ["discord.gg/spiralogic"]="discord.gg/soullab"
  ["spiralogic.slack.com"]="soullab.slack.com"
  ["#oracle-beta"]="#soullab-beta"
)

# Update all beta files
for file in BETA_*.md; do
  echo "Updating $file..."
  for old in "${!replacements[@]}"; do
    new="${replacements[$old]}"
    sed -i "" "s|$old|$new|g" "$file"
  done
done

echo "✅ URL updates complete!"
```

### Run the script:
```bash
chmod +x update-urls.sh
./update-urls.sh
```

---

## 📱 UPDATE CONFIGURATION FILES

### package.json scripts:
```json
{
  "scripts": {
    "dev:beta": "NEXT_PUBLIC_BETA_URL=http://localhost:3000/beta next dev",
    "build:beta": "NEXT_PUBLIC_BETA_URL=https://soullab.life/beta next build",
    "deploy:beta": "vercel --prod"
  }
}
```

### next.config.js:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/beta',
        destination: '/beta/index'
      },
      {
        source: '/beta/:path*',
        destination: '/beta/:path*'
      }
    ]
  },

  publicRuntimeConfig: {
    BETA_URL: process.env.NEXT_PUBLIC_BETA_URL || 'https://soullab.life/beta',
    SITE_NAME: 'Soullab Collective',
    BETA_EMAIL: 'beta@soullab.life'
  }
}
```

---

## ✅ VERIFICATION CHECKLIST

### After Updates:
- [ ] All instances of `spiralogic.oracle` replaced
- [ ] All email addresses updated to `@soullab.life`
- [ ] Discord links point to Soullab server
- [ ] API endpoints use relative URLs
- [ ] Configuration files updated
- [ ] No broken links remain
- [ ] Brand consistency maintained

### Test Commands:
```bash
# Search for any remaining old URLs
grep -r "spiralogic.oracle" BETA_*.md
grep -r "discord.gg/spiralogic" BETA_*.md

# Should return nothing if all updated
```

---

## 🎨 BRAND CONSISTENCY UPDATES

### Add Soullab Branding:
```markdown
# Add to each document header:
---
Platform: Soullab Collective
URL: https://soullab.life/beta
Email: beta@soullab.life
Discord: https://discord.gg/soullab
---
```

### Update Logos/Assets References:
```markdown
# Replace generic with Soullab branded:
/images/logo.png → /soullab/logo.svg
/favicon.ico → /soullab/favicon.ico
/og-image.png → /soullab/beta-og.png
```

---

## 📣 COMMUNICATION UPDATES

### Update Welcome Messages:
```markdown
# Old:
"Welcome to the Spiralogic Oracle Beta"

# New:
"Welcome to Soullab's Spiralogic Oracle Beta"
```

### Update Sign-offs:
```markdown
# Old:
"The Spiralogic Team"

# New:
"The Soullab Collective Team"
```

---

## 🚀 FINAL DEPLOYMENT

### After all updates:
```bash
# 1. Commit changes
git add .
git commit -m "Update beta materials for soullab.life deployment"

# 2. Push to repository
git push origin main

# 3. Deploy to Vercel
vercel --prod

# 4. Verify live site
open https://soullab.life/beta
```

---

## ✨ MIGRATION COMPLETE

Your beta materials are now fully updated for **soullab.life/beta** deployment!

All references now point to:
- **Website**: https://soullab.life/beta
- **Email**: beta@soullab.life
- **Community**: https://discord.gg/soullab
- **Support**: help@soullab.life

The Oracle awaits at Soullab! 🔮

---

*URL Update Guide v1.0 | Seamless Migration to Soullab.life*