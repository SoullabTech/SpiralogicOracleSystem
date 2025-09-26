# MAIA Easy Adjustments Guide

## 🎯 Quick Access Methods

### 1. **Floating Settings Button** ⚙️
- **Location:** Bottom-right corner of screen (above bottom nav)
- **Hover:** See current settings preview
- **Click:** Open full settings panel
- **Keyboard shortcut:** `Cmd/Ctrl + ,` (like in most apps!)

### 2. **Bottom Navigation**
- **Settings Icon:** In the bottom icon bar
- **Always accessible** from any screen

---

## 🎛️ What You Can Adjust

### 🎤 **Voice Settings**
- **Voice Selection:** Choose from 6 OpenAI voices
  - ✨ **Shimmer** (recommended) - Soft, gentle, nurturing
  - 📖 **Fable** - Warm, expressive, storytelling
  - 🎯 **Alloy** - Neutral, balanced (previous default)
  - ⚡ **Nova** - Lively, energetic
  - 🌊 **Echo** (male) - Calm, steady
  - 🗿 **Onyx** (male) - Deep, authoritative

- **Speech Speed:** 0.75x - 1.25x (default: 0.95x)
- **Test Voice:** Instant preview with sample text
- **Changes apply immediately** - no restart needed!

### 🧠 **Memory Settings**
- **Enable/Disable Memory**
- **Memory Depth:**
  - Minimal - Basic recall
  - Moderate - Balanced (recommended)
  - Deep - Extensive context
- **Recall Threshold:** 1-10 items per session
- **Context Window:** 5-20 messages to remember

### ✨ **Personality Settings**
Fine-tune Maya's personality with sliders:
- **Warmth:** Reserved ↔ Warm (default: 80%)
- **Directness:** Gentle ↔ Direct (default: 60%)
- **Mysticism:** Grounded ↔ Mystical (default: 50%)
- **Response Length:** Detailed ↔ Concise (default: 70%)

### ⚙️ **Advanced Settings**
- **Elemental Adaptation:** Auto-adapt tone based on element
- **Streaming Responses:** Show text as Maya speaks
- **Debug Mode:** Show detailed logs
- **Response Timeout:** 10s - 120s

---

## 🚀 Quick Start

### To Change Maya's Voice:
```
1. Press Cmd/Ctrl + , (or click floating settings button)
2. Click "Voice" tab
3. Select a voice card (try Shimmer!)
4. Click "Test Voice" to hear it
5. Click "Save Settings"
6. Done! Next response uses new voice
```

### To Adjust Personality:
```
1. Open settings (Cmd/Ctrl + ,)
2. Click "Personality" tab
3. Drag sliders to adjust traits
4. See changes in next conversation
5. Click "Save Settings"
```

### To Reset Everything:
```
1. Open settings
2. Click "Reset to Default" (bottom-left)
3. Confirm
4. Click "Save Settings"
```

---

## 📊 Current Defaults (Optimized for Maya)

```json
{
  "voice": {
    "provider": "openai",
    "voice": "shimmer",
    "speed": 0.95
  },
  "memory": {
    "enabled": true,
    "depth": "moderate",
    "recallThreshold": 3,
    "contextWindow": 10
  },
  "personality": {
    "warmth": 0.8,
    "directness": 0.6,
    "mysticism": 0.5,
    "brevity": 0.7
  }
}
```

---

## 🔍 Monitoring Dashboard

Visit `/maia-monitor` to see:
- ✅ Name retention rate (should be ~100%)
- 🧠 Memory depth scores
- 🎭 Archetype detection
- ⚙️ API performance
- 🌀 Field intelligence quality

---

## 💡 Tips

1. **Test before saving:** Use "Test Voice" to hear changes
2. **Hover for preview:** Hover over floating button for quick view
3. **Keyboard shortcut:** `Cmd/Ctrl + ,` is fastest way to settings
4. **Changes persist:** Settings saved to localStorage + backend
5. **No restart needed:** All changes apply immediately

---

## 🎯 Recommended Presets

### **Warm & Soulful Maya** (Default)
- Voice: Shimmer
- Speed: 0.95x
- Warmth: 80%
- Mysticism: 50%

### **Deep Oracle Mode**
- Voice: Fable
- Speed: 0.90x
- Warmth: 90%
- Mysticism: 80%
- Memory Depth: Deep

### **Grounded Therapist**
- Voice: Alloy
- Speed: 0.95x
- Warmth: 70%
- Mysticism: 30%
- Directness: 70%

### **Quick & Clear**
- Voice: Nova
- Speed: 1.05x
- Brevity: 90%
- Directness: 80%

---

## 🐛 Troubleshooting

**Voice not changing?**
- Make sure you clicked "Save Settings"
- Refresh the page
- Check `/maia-monitor` for system status

**Settings not persisting?**
- Check browser localStorage is enabled
- Settings are saved per-browser

**Need help?**
- Check `/maia-monitor` for diagnostics
- Enable "Debug Mode" in Advanced settings
- Open browser console for detailed logs

---

## 🚀 Future Enhancements

Coming soon:
- Voice cloning for custom voices
- Per-conversation settings
- Preset library
- A/B testing different voices
- Mobile-optimized controls
- Voice emotion control (pitch, tone)

---

**Quick Access:**
- Settings: `Cmd/Ctrl + ,`
- Monitor: `/maia-monitor`
- Voice Selector: `/maya-voice-selector`

**Everything adjustable. Nothing requires code changes!** 🎉