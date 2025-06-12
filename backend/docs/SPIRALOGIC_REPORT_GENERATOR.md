# 🌀 Spiralogic Astrology Report Generator

A sacred technology for generating personalized, mythic astrology reports that serve as soul mirrors and spiritual guides.

## 🔮 Overview

The Spiralogic Report Generator creates comprehensive astrological reports that blend:
- **Archetypal Psychology** (Jung)
- **Mythic Storytelling** (Campbell)
- **Elemental Wisdom** (Sacred traditions)
- **Personalized Soul Guidance**

## 📋 Features

### Core Capabilities
- ✨ **Personalized Narrative Reports**: Each report is a unique mythic story
- 🌟 **Archetypal Integration**: Three primary archetypes per person
- 🔥 **Elemental Balance Analysis**: Dominant and underactive elements
- 🌙 **Nodal Axis Journey**: Shadow to gift transformation
- 🍃 **Seasonal Timeline**: Spring to Winter soul cycles
- 🎭 **Life Stage Context**: Age-appropriate guidance
- 💫 **Neurodivergent Affirming**: Celebrates unique perception gifts

### Report Sections
1. **Soul's Welcome Message** - Personal greeting acknowledging current journey
2. **Mythic Chart Narrative** - Sun, Moon, Rising woven into story
3. **Soul Journey Arc** - South Node shadows to North Node destiny
4. **Elemental Alchemy** - Balance practices for elements
5. **Archetypal Trinity** - Deep dive into three archetypes
6. **Seasonal Timeline** - Year-round guidance
7. **Sacred Practices** - Personalized rituals
8. **Hero/ine's Journey Blessing** - Poetic closing

## 🚀 Quick Start

### 1. Generate a Sample Report

```bash
# Using curl
curl -X POST http://localhost:3000/api/spiralogic-report/sample

# Response includes full mythic report
```

### 2. Generate for Authenticated User

```javascript
// Set birth data first (if not already set)
await astrologicalService.setUserBirthData(userId, {
  date: new Date('1990-03-15'),
  time: '14:30',
  location: { lat: 37.7749, lng: -122.4194 }
});

// Generate report
const report = await astrologicalService.generateSpiralogicReport(userId, {
  lifeStage: 'Saturn Return',
  personalityNotes: ['Creative', 'HSP']
});
```

### 3. API Endpoints

```bash
# Generate report (requires auth)
POST /api/spiralogic-report/generate
Authorization: Bearer <token>
{
  "lifeStage": "Quarter-life transition",
  "personalityNotes": ["ADD", "Creative"]
}

# Get report history (requires auth)
GET /api/spiralogic-report/history
Authorization: Bearer <token>

# Get specific report (requires auth)
GET /api/spiralogic-report/:reportId
Authorization: Bearer <token>

# Generate sample report (no auth)
POST /api/spiralogic-report/sample
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          API Routes                     │
│   /api/spiralogic-report/*             │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│      AstrologicalService               │
│   generateSpiralogicReport()           │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│      GenerateReportFlow                │
│   Orchestrates report generation       │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│      Claude/GPT-4 Prompt               │
│   Sacred narrative generation          │
└────────────────────────────────────────┘
```

## 📝 Example Report Output

```json
{
  "success": true,
  "report": {
    "content": "Full mythic narrative text...",
    "sections": {
      "souls-welcome-message": "Beloved Noemi, Earth Priestess...",
      "mythic-chart-narrative": "Your Virgo Sun in the 5th house...",
      "soul-journey-arc": "From Virgo South Node perfection...",
      "elemental-alchemy": "Earth dominant, Fire calls...",
      "archetypal-trinity": "Mystic Guide awakens...",
      "seasonal-timeline": "Spring: Plant seeds of...",
      "sacred-practices": "Daily grounding rituals...",
      "the-heroines-journey-blessing": "Walk gently, dear one..."
    },
    "metadata": {
      "userId": "user-123",
      "reportType": "astrology",
      "elements": {
        "dominant": "earth",
        "underactive": "fire"
      },
      "archetypes": ["Mystic Guide", "Earth Priestess", "Visionary Alchemist"],
      "timestamp": "2025-06-11T10:30:00Z"
    },
    "version": "1.0.0"
  }
}
```

## 🎨 Customization

### Life Stages
- "Childhood Wonder"
- "Teenage Awakening"
- "Quarter-life Quest"
- "Saturn Return"
- "Mid-life Transformation"
- "Elder Wisdom"
- "Rite of Passage"

### Personality Notes
- Neurodivergent traits (ADD, Autism, etc.)
- Sensitivity markers (HSP, Empath)
- Creative expressions
- Shadow work focus
- Healing journey stage

### Archetypes
- Classic: Warrior, Lover, Sage, Innocent
- Shadow: Shadow Worker, Wounded Healer
- Mystic: Oracle, Shaman, Priestess
- Creative: Artist, Visionary, Alchemist

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-claude-key  # Optional
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### Database Schema
```sql
-- Run migration
supabase migration up 20250611_create_spiralogic_reports.sql
```

## 🧪 Testing

```bash
# Run example generator
npm run example:spiralogic-report

# Run tests
npm test spiralogic-report

# Generate sample for Noemi
curl -X POST http://localhost:3000/api/spiralogic-report/sample
```

## 🌟 Best Practices

1. **Birth Data Accuracy**: Ensure accurate birth time for house placements
2. **Context Matters**: Include life stage and personality notes
3. **Elemental Balance**: Use for ritual recommendations
4. **Regular Updates**: Generate new reports at major transitions
5. **Privacy First**: Reports contain sensitive spiritual data

## 🔮 Future Enhancements

- [ ] PDF generation with sacred geometry
- [ ] Audio narration option
- [ ] Transit updates
- [ ] Synastry reports
- [ ] Group dynamics reports
- [ ] Integration with holoflower visualization

## 📚 Resources

- [Prompt Template](../src/core/agents/prompts/spiralogic-report.prompt)
- [Example Usage](../src/core/agents/examples/SpiralogicReportExample.ts)
- [API Documentation](./oracle.openapi.yaml)

---

*"Your birth chart is not your destiny—it's your palette. You are the artist." - Spiralogic Wisdom*