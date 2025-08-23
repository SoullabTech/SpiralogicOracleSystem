import { z } from 'zod'

export const DreamSegmentSchema = z.object({
  type: z.enum(['dream','lucid','nap']),
  start: z.string().optional(),
  end: z.string().optional(),
  title: z.string().optional(),
  narrative: z.string().optional(),
  cues: z.array(z.string()).optional(),
  awareness: z.number().min(0).max(1).optional(),
  emotions: z.array(z.string()).optional(),
  insights: z.array(z.string()).optional(),
  actions_tomorrow: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional()
})

export const DreamNightSchema = z.object({
  night_date: z.string(), // "YYYY-MM-DD"
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  segments: z.array(DreamSegmentSchema),
  tags: z.array(z.string()).optional(),
  protocols: z.record(z.any()).optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
})

export type DreamNight = z.infer<typeof DreamNightSchema>