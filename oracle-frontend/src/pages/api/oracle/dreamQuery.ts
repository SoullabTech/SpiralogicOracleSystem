import type { NextApiRequest, NextApiResponse } from 'next'
import { dreamQuery } from '@/lib/oracle/dreamQuery'

export type DreamQueryResponse = {
  result: unknown
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DreamQueryResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { prompt } = req.body as { prompt: string }
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing or invalid `prompt` in request body' })
    }

    const result = await dreamQuery(prompt)
    return res.status(200).json({ result })
  } catch (err: any) {
    console.error('dreamQuery error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
