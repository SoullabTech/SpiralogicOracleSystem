// pages/api/beta/spots.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In production, this would query Supabase for actual count
    // For now, return mock data
    const totalSpots = 500
    const takenSpots = 353 // This would come from database
    const remaining = totalSpots - takenSpots

    res.status(200).json({ remaining })
  } catch (error) {
    console.error('Error fetching spots:', error)
    res.status(500).json({ error: 'Failed to fetch spots' })
  }
}