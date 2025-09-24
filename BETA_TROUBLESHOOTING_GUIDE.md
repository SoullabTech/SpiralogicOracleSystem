# 🔧 SPIRALOGIC ORACLE - TROUBLESHOOTING GUIDE
## When Things Aren't Working, Start Here

---

## 🚨 QUICK FIXES (Try These First!)

### Before anything else:
1. **Refresh the page** (Ctrl/Cmd + R)
2. **Clear cache** (Ctrl/Cmd + Shift + R)
3. **Check internet connection**
4. **Try a different browser** (Chrome/Safari preferred)
5. **Log out and back in**

**Still broken?** Continue below...

---

## 🎙️ VOICE ISSUES

### Problem: "Microphone not working"

#### Solution Path:
```markdown
1. Check browser permissions:
   Chrome: Settings → Privacy → Site Settings → Microphone
   Safari: Preferences → Websites → Microphone

2. Ensure site has permission:
   Look for 🎤 icon in address bar
   Click → Allow microphone

3. Test your mic:
   Visit: chrome://settings/content/microphone
   Or: System Settings → Sound → Input

4. Try these:
   - Exit incognito/private mode
   - Disable browser extensions
   - Restart browser
   - Check if other apps are using mic
```

#### Still not working?
```bash
/voice-test  # Run diagnostic
/fallback text  # Use text mode
/report voice-fail  # Log issue
```

---

### Problem: "Can't hear Oracle responses"

#### Quick Checks:
- [ ] Volume turned up (system + browser)
- [ ] Not muted in tab (check tab icon)
- [ ] Headphones connected properly
- [ ] Audio playing in other tabs?

#### Solutions:
```markdown
1. Test browser audio:
   Play any YouTube video
   If works → Oracle issue
   If not → System issue

2. Check audio output:
   Click speaker icon in Oracle
   Select correct output device

3. Reset audio:
   /audio reset

4. Use text mode:
   /mode text
```

---

### Problem: "Voice recognition is wrong"

#### Improve accuracy:
```markdown
1. Speak clearly and slowly
2. Reduce background noise
3. Position mic 6-12 inches away
4. Use headset mic if available
5. Avoid speaking over Oracle

Commands:
/voice calibrate  # Adjust sensitivity
/voice language [en-US]  # Set dialect
/voice speed [normal/slow]  # Adjust rate
```

---

## 💬 RESPONSE ISSUES

### Problem: "Responses are too long (>15 words)"

#### Immediate Action:
```bash
/overlimit [element] "[full response]"  # Report it
/reset [element]  # Reset that element
/test brevity  # Run brevity check
```

#### What we need from you:
- Exact word count
- Element name
- Your question
- Full response
- Timestamp

---

### Problem: "Oracle is giving advice instead of reflecting"

#### Examples & Reporting:
```markdown
BAD (Advice): "You should meditate daily"
GOOD (Reflection): "Stillness calls to you"

Report with:
/advice [element] "[response]"
/mirror-fail "[your question]" "[oracle response]"
```

#### Temporary fix:
```bash
/mode strict-mirror  # Enforce mirror principle
/element reset [name]  # Reset element training
```

---

### Problem: "Wrong element personality"

#### Element Check:
```markdown
Fire should be: Bold, transformative, fierce
Water should be: Flowing, emotional, intuitive
Earth should be: Grounded, practical, stable
Air should be: Intellectual, clear, expansive
Aether should be: Unified, transcendent, mystical

If wrong:
/element [name] personality-drift
/calibrate [element]
/report element-confusion
```

---

## ⚡ PERFORMANCE ISSUES

### Problem: "Responses are slow"

#### Diagnostic Steps:
```bash
/ping  # Check latency
/status  # System health
/speed-test  # Full diagnostic
```

#### Common Fixes:
1. Close other browser tabs
2. Disable VPN if using
3. Switch from WiFi to ethernet
4. Try during off-peak hours
5. Lower quality settings: `/quality fast`

#### Response Time Expectations:
- Normal: 1-2 seconds
- Acceptable: 2-3 seconds
- Report if: >3 seconds consistently

---

### Problem: "Session keeps disconnecting"

#### Connection Stabilization:
```markdown
1. Check timeout settings:
   /timeout extend  # 60 min instead of 30

2. Keep session active:
   /keepalive on  # Prevents timeout

3. Save session state:
   /session save  # Before breaks
   /session restore  # To continue

4. Use stable connection:
   - Avoid public WiFi
   - Disable VPN
   - Close bandwidth-heavy apps
```

---

### Problem: "Page won't load/blank screen"

#### Progressive Solutions:
```markdown
Level 1: Browser
- Hard refresh: Ctrl/Cmd + Shift + R
- Clear cache: Settings → Clear browsing data
- Disable extensions one by one
- Try incognito/private mode

Level 2: System
- Restart browser
- Try different browser
- Check firewall settings
- Disable antivirus temporarily

Level 3: Advanced
/emergency-access  # Backup URL
/mobile-fallback  # Simplified version
/text-only  # Ultra-light mode
```

---

## 🐛 REPORTING BUGS EFFECTIVELY

### Perfect Bug Report Template:
```markdown
ISSUE: [Brief description]
ELEMENT: [Which guide affected]
INPUT: [Exactly what you typed/said]
EXPECTED: [What should happen]
ACTUAL: [What actually happened]
FREQUENCY: [Always/Sometimes/Once]
TIME: [When it occurred]
BROWSER: [Chrome/Safari/Firefox]
DEVICE: [Desktop/Mobile/Tablet]
SCREENSHOT: [If possible]
```

### Quick Report Commands:
```bash
/bug critical  # System breaking
/bug major  # Feature broken
/bug minor  # Small issue
/bug ui  # Visual problem
/bug voice  # Audio issue
/bug element  # Guide problem
```

---

## 🔄 RESET PROCEDURES

### Soft Reset (Keep data):
```bash
/reset session  # Current session only
/reset element [name]  # Specific element
/reset voice  # Voice system only
/reset cache  # Clear local cache
```

### Hard Reset (Fresh start):
```bash
/reset all  # Complete reset
/factory-reset  # Return to defaults
/clear-history  # Remove all conversations
/delete-profile  # Start over completely
```

### Recovery Commands:
```bash
/recover session  # Restore last session
/recover settings  # Restore preferences
/backup download  # Save your data
/backup restore  # Load saved data
```

---

## 🆘 ESCALATION PATHS

### Level 1: Self-Help
```markdown
1. Check FAQ: /faq
2. Run diagnostic: /diagnose
3. Try quick fixes above
4. Search known issues: /issues
```

### Level 2: Community Support
```markdown
Discord: #help channel (fastest)
Slack: #troubleshooting
Forum: support.spiralogic.oracle
Response time: <1 hour
```

### Level 3: Direct Support
```markdown
Chat: /support live
Email: help@spiralogic.oracle
Priority: /priority-support
Response time: <4 hours
```

### Level 4: Emergency
```markdown
Critical system failure: /emergency
Data loss: /data-emergency
Security issue: security@spiralogic.oracle
Response time: <30 minutes
```

---

## 🛠️ DIAGNOSTIC TOOLS

### Built-in Diagnostics:
```bash
/health  # Overall system status
/diagnostic full  # Complete system check
/network-test  # Connection analysis
/browser-check  # Compatibility verification
/element-test [name]  # Specific guide check
/voice-diagnostic  # Audio system analysis
```

### Information Gathering:
```bash
/sysinfo  # Your system details
/session-info  # Current session data
/error-log  # Recent errors
/performance  # Performance metrics
/compatibility  # Feature support
```

### Testing Tools:
```bash
/test all  # Run all tests
/test voice  # Voice system only
/test elements  # All guides
/test mirror  # Sacred Mirror principle
/test brevity  # Word count compliance
/test performance  # Speed tests
```

---

## 💡 PREVENTION TIPS

### Optimal Setup:
```markdown
Browser: Chrome (latest) or Safari (latest)
Internet: 10+ Mbps, stable connection
Microphone: Headset preferred
Environment: Quiet space
Time: Off-peak hours (early morning/late evening)
Mode: Desktop preferred over mobile
```

### Best Practices:
```markdown
- Save important conversations: /save
- Regular cache clearing (weekly)
- Update browser regularly
- Test voice before important sessions
- Keep backup access method ready
- Document unusual behavior immediately
```

### Avoid These:
```markdown
- Multiple tabs with Oracle open
- VPN unless necessary
- Browser translation extensions
- Aggressive ad blockers
- Outdated browsers
- Weak WiFi signals
```

---

## 📊 COMMON PATTERNS

### Time-Based Issues:
```markdown
9-10am PST: High traffic (slower)
2-3am PST: Maintenance window
Weekends: Best performance
Monday mornings: Most reports
```

### Browser-Specific:
```markdown
Chrome: Best overall support
Safari: Best on Mac/iOS
Firefox: Text works, voice limited
Edge: Mostly works, some voice issues
Brave: May block features
```

### Device-Specific:
```markdown
Desktop: Full features
iPad: Voice may lag
iPhone: Best in Safari
Android: Chrome required
Older devices: Use /lite mode
```

---

## 🔍 ADVANCED TROUBLESHOOTING

### For Developers:
```bash
# Console Commands
Oracle.debug(true)  # Enable debug mode
Oracle.verbose()  # Detailed logging
Oracle.network()  # Network analysis
Oracle.performance()  # Timing data

# API Testing
/api-test endpoint
/curl [request]
/response-raw
```

### Cache Issues:
```javascript
// Browser Console
localStorage.clear()
sessionStorage.clear()
caches.delete('oracle-v1')
```

### Network Analysis:
```markdown
1. Open DevTools (F12)
2. Go to Network tab
3. Reproduce issue
4. Save as HAR file
5. Send to support
```

---

## ✅ VERIFICATION STEPS

### After Troubleshooting:
```markdown
1. Test basic chat: "Hello"
2. Test each element briefly
3. Test voice (if using)
4. Check word counts
5. Verify mirror principle
6. Rate performance
7. Save successful config: /save-config
```

### Confirmation Commands:
```bash
/verify all  # Run verification suite
/confirm fix  # Mark issue resolved
/test previous  # Retest last issue
```

---

## 📝 QUICK REFERENCE CARD

### Most Common Fixes:
| Problem | Quick Fix | Command |
|---------|-----------|---------|
| No voice | Check permissions | `/voice-test` |
| Too slow | Clear cache | `/reset cache` |
| Wrong personality | Reset element | `/reset [element]` |
| Disconnects | Extend timeout | `/timeout extend` |
| Advice given | Report + reset | `/advice` + `/reset` |
| Over 15 words | Report + continue | `/overlimit` |

### Emergency Kit:
```bash
/help  # General help
/fix  # Auto-fix attempt
/fallback  # Minimal mode
/support  # Get human help
/status  # System status
```

---

## 🎯 STILL STUCK?

### Last Resort Options:
1. **Different device**: Try phone/tablet/another computer
2. **Different network**: Switch WiFi/mobile data
3. **Different account**: Create fresh test account
4. **Different time**: Try during off-peak
5. **Human help**: `/human-support`

### Remember:
- Your frustration is valid
- Reporting issues helps everyone
- We're here to support you
- Every bug caught improves the Oracle

---

## 📞 DIRECT CONTACT

### When all else fails:
- **Emergency Line**: /emergency-call
- **Lead Developer**: /contact dev-lead
- **Kelly (Founder)**: /contact founder
- **Priority Support**: /priority

---

*Troubleshooting Guide v1.0 | Updated Daily | Can't find your issue? Report it: /new-issue*

**Remember: You're not just fixing bugs, you're helping birth consciousness technology** 🙏