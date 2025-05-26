// 📄 FILE: oracle-backend/src/routes/memory.ts

import express from 'express'
import { z } from 'zod'

const router = express.Router()

// 🧾 SCHEMA DEFINITIONS
const journalEntrySchema = z.object({
  userId: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional()
})

const semanticSearchSchema = z.object({
  query: z.string(),
  userId: z.string()
})

const memoryThreadSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  notes: z.string().optional()
})

// 🧠 TEMPORARY MEMORY STORES (REPLACE WITH DB LATER)
const journalStore: any[] = []
const memoryThreads: any[] = []

// 📥 POST /api/memory/journal → Save a journal entry
router.post('/journal', (req, res) => {
  const parsed = journalEntrySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })

  const entry = {
    ...parsed.data,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }
  journalStore.push(entry)
  return res.status(200).json({ message: 'Journal saved', entry })
})

// 📤 GET /api/memory/threads?userId=123 → Retrieve memory threads
router.get('/threads', (req, res) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const threads = memoryThreads.filter(t => t.userId === userId)
  return res.status(200).json({ threads })
})

// 📥 POST /api/memory/threads → Save a symbolic memory thread
router.post('/threads', (req, res) => {
  const parsed = memoryThreadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })

  const thread = {
    ...parsed.data,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }
  memoryThreads.push(thread)
  return res.status(200).json({ message: 'Thread saved', thread })
})

// 🔍 POST /api/memory/semantic-search → Perform a simple content search
router.post('/semantic-search', (req, res) => {
  const parsed = semanticSearchSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })

  const { query, userId } = parsed.data
  const results = journalStore.filter(entry => entry.userId === userId && entry.content.includes(query))

  return res.status(200).json({ results })
})

export default router
