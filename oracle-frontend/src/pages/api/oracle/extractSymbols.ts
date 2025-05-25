import type { NextApiRequest, NextApiResponse } from 'next'
import { extractSymbols } from '@/lib/oracle/extractSymbols'

export type ExtractSymbolsResponse = {
  symbols: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractSymbolsResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { text } = req.body as { text: string }
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or invalid `text` in request body' })
    }

    const symbols = await extractSymbols(text)
    return res.status(200).json({ symbols })
  } catch (err: any) {
    console.error('extractSymbols error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
