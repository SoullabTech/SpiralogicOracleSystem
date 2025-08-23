// Simple classifier to map dream segments → elemental recap buckets

import { RecapBuckets } from '@/types/recap'

export function dreamBucketize(segments: any[]): RecapBuckets {
  const buckets: RecapBuckets = {
    themes: [],
    emotions: [],
    steps: [],
    ideas: [],
    energy: []
  }

  for (const seg of segments) {
    // Themes (Aether) - recurring symbols / archetypes
    if (seg.symbols && seg.symbols.length) {
      buckets.themes.push(...seg.symbols.map((s: string) => `Symbol: ${s}`))
    }
    if (seg.insights) {
      buckets.themes.push(`Insight: ${seg.insights}`)
    }

    // Emotions (Water)
    if (seg.emotions && seg.emotions.length) {
      buckets.emotions.push(...seg.emotions)
    }

    // Steps (Earth) - practices, cues, real-world anchors
    if (seg.actions_tomorrow && seg.actions_tomorrow.length) {
      buckets.steps.push(...seg.actions_tomorrow)
    }
    if (seg.cues && seg.cues.length) {
      buckets.steps.push(...seg.cues.map((c: string) => `Reality cue: ${c}`))
    }

    // Ideas (Air) - reframes, metaphors
    if (seg.narrative) {
      buckets.ideas.push(`Dream idea: ${seg.narrative.slice(0, 80)}…`)
    }

    // Energy (Fire) - lucidity, drive, motivation
    if (seg.type === 'lucid') {
      buckets.energy.push(`Lucidity surge: awareness=${seg.awareness ?? 1}`)
    }
  }

  return buckets
}