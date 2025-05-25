import type { NextApiRequest, NextApiResponse } from 'next'
import { symbolThreads } from '@/lib/oracle/symbolThreads'

export type SymbolThreadsResponse = {
  threads: unknown[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SymbolThreadsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const seed = req.query.seed as string
    if (!seed) {
      return res.status(400).json({ error: 'Missing `seed` query parameter' })
    }

    const threads = await symbolThreads(seed)
    return res.status(200).json({ threads })
  } catch (err: any) {
    console.error('symbolThreads error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
