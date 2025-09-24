// pages/api/beta/apply.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, why, commitment, agreement } = req.body

    // Validate required fields
    if (!name || !email || !why || !commitment || !agreement) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Here you would normally save to Supabase
    // For now, we'll simulate success
    console.log('Beta application received:', { name, email, commitment })

    // In production, you would:
    // 1. Save to Supabase
    // 2. Send confirmation email
    // 3. Notify admin

    res.status(200).json({
      success: true,
      message: 'Application received successfully'
    })
  } catch (error) {
    console.error('Beta application error:', error)
    res.status(500).json({ error: 'Application failed' })
  }
}