import { NextApiRequest, NextApiResponse } from 'next';
// Temporarily stub out backend imports that are excluded from build
// import { UserMemoryService } from '../../../../backend/src/services/UserMemoryService';

// Stub UserMemoryService
const UserMemoryService = {
  getSessionIndicators: async (userId: string) => ({
    sessionCount: 0,
    lastSession: null,
    activeTopics: [],
    emotionalTone: 'neutral'
  })
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`[API] Fetching memory indicators for user: ${userId}`);

    // Get session indicators from UserMemoryService
    const indicators = await UserMemoryService.getSessionIndicators(userId);

    return res.status(200).json({
      success: true,
      indicators,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Error fetching memory indicators:', error);
    return res.status(500).json({
      error: 'Failed to fetch memory indicators',
      message: error.message
    });
  }
}