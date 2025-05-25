# 🌿 Spiralogic Dream Oracle — Ritual Intelligence System

This module is part of the Spiralogic Oracle ecosystem, offering users personalized ritual guidance based on their growth phase, elemental energy, and archetypal patterns.

---

## 🔮 Core Features

- **GPT-4 Ritual Generation** based on latest `user_phases`
- **Supabase Database** for logging, storing, and visualizing ritual activity
- **Integrated Dashboards** for tracking elemental and archetypal evolution
- **Dream Journal Sync** — export ritual reflections to your dream log
- **Somatic Audio Player** for immersive elemental practices

---

## ⚙️ Tech Stack

- **Frontend**: React + Next.js + TailwindCSS + Framer Motion
- **Backend**: Supabase + OpenAI GPT-4
- **Database**: PostgreSQL (Supabase schema)

---

## 📁 Key Pages

| Path | Purpose |
|------|---------|
| `/rituals/recommend` | View & generate your current ritual |
| `/rituals/history`   | See all past rituals |
| `/rituals/dashboard` | Visual ritual intelligence dashboard |

---

## 📦 Components

| Component | Description |
|----------|-------------|
| `MantraCard.tsx` | Visual ritual output card |
| `SomaticPlayer.tsx` | Elemental audio player |
| `ExportToJournal.tsx` | Logs ritual into dream journal |
| `RitualStatsWidget.tsx` | Weekly summary card |
| `ElementalHeatmap.tsx` | Ritual calendar by element |
| `ArchetypeEvolutionChart.tsx` | Line graph of archetype evolution |
| `RitualTimeline.tsx` | Vertical timeline of rituals |

---

## 🗃️ Supabase Tables

### `user_phases`
Tracks user's Spiralogic phase, element, and archetype over time.

```sql
id UUID PRIMARY KEY,
user_id UUID,
phase TEXT,
element TEXT,
archetype TEXT,
timestamp TIMESTAMPTZ
