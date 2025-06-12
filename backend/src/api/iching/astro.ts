import { Request, Response } from 'express';
import { z } from 'zod';
import { generateIChingAstroProfile, getTrigramArchetype, calculateTrigramCompatibility } from '../../services/ichingService';

// Request validation schemas
const IChingAstroRequestSchema = z.object({
  birthDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
});

const IChingCompatibilityRequestSchema = z.object({
  trigram1: z.string(),
  trigram2: z.string()
});

/**
 * GET /api/iching/astro
 * Calculate I Ching astrology profile from birth date
 */
export async function getIChingAstroProfile(req: Request, res: Response) {
  try {
    const { birthDate } = req.query;
    
    if (!birthDate) {
      return res.status(400).json({
        success: false,
        error: 'Birth date is required as query parameter'
      });
    }

    // Validate birth date
    const validation = IChingAstroRequestSchema.safeParse({ birthDate });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid birth date format. Use YYYY-MM-DD or ISO datetime',
        details: validation.error.issues
      });
    }

    const parsedDate = new Date(birthDate as string);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid birth date'
      });
    }

    // Generate I Ching profile
    const profile = generateIChingAstroProfile(parsedDate);
    
    // Get detailed archetype information
    const birthArchetype = getTrigramArchetype(profile.birthTrigram);
    const currentArchetype = getTrigramArchetype(profile.currentTrigramCycle);

    res.json({
      success: true,
      profile,
      birthArchetype,
      currentArchetype,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('I Ching astro profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate I Ching astrology profile'
    });
  }
}

/**
 * POST /api/iching/astro
 * Calculate I Ching astrology profile from request body
 */
export async function postIChingAstroProfile(req: Request, res: Response) {
  try {
    const validation = IChingAstroRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      });
    }

    const { birthDate } = validation.data;
    const parsedDate = new Date(birthDate);
    
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid birth date'
      });
    }

    // Generate I Ching profile
    const profile = generateIChingAstroProfile(parsedDate);
    
    // Get detailed archetype information
    const birthArchetype = getTrigramArchetype(profile.birthTrigram);
    const currentArchetype = getTrigramArchetype(profile.currentTrigramCycle);

    // Calculate self-compatibility (birth vs current year)
    const selfCompatibility = calculateTrigramCompatibility(
      profile.birthTrigram, 
      profile.currentTrigramCycle
    );

    res.json({
      success: true,
      profile,
      birthArchetype,
      currentArchetype,
      selfCompatibility,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('I Ching astro profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate I Ching astrology profile'
    });
  }
}

/**
 * POST /api/iching/compatibility
 * Calculate compatibility between two trigrams
 */
export async function calculateIChingCompatibility(req: Request, res: Response) {
  try {
    const validation = IChingCompatibilityRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      });
    }

    const { trigram1, trigram2 } = validation.data;
    
    // Get archetype details
    const archetype1 = getTrigramArchetype(trigram1);
    const archetype2 = getTrigramArchetype(trigram2);
    
    if (!archetype1 || !archetype2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trigram names provided'
      });
    }

    // Calculate compatibility
    const compatibility = calculateTrigramCompatibility(trigram1, trigram2);

    res.json({
      success: true,
      trigram1: archetype1,
      trigram2: archetype2,
      compatibility,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('I Ching compatibility error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate trigram compatibility'
    });
  }
}

/**
 * GET /api/iching/trigrams
 * Get all trigram archetypes reference data
 */
export async function getAllTrigrams(req: Request, res: Response) {
  try {
    const trigrams = [
      'Thunder', 'Wind', 'Fire', 'Earth', 
      'Lake', 'Heaven', 'Water', 'Mountain'
    ].map(name => getTrigramArchetype(name)).filter(Boolean);

    res.json({
      success: true,
      trigrams,
      count: trigrams.length,
      description: 'I Ching trigram archetypes with elemental and directional correspondences'
    });

  } catch (error) {
    console.error('Get trigrams error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trigram data'
    });
  }
}

/**
 * GET /api/iching/yearly-guidance
 * Get guidance for current year or specific year
 */
export async function getYearlyGuidance(req: Request, res: Response) {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    if (isNaN(targetYear) || targetYear < 1900 || targetYear > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year. Must be between 1900-2100'
      });
    }

    // Generate profile for the year
    const yearDate = new Date(targetYear, 0, 1); // January 1st of target year
    const profile = generateIChingAstroProfile(yearDate);
    const archetype = getTrigramArchetype(profile.currentTrigramCycle);

    res.json({
      success: true,
      year: targetYear,
      trigram: archetype,
      guidance: profile.yearlyGuidance,
      fractalPhase: profile.fractalPhase,
      cyclePosition: profile.cyclePosition
    });

  } catch (error) {
    console.error('Yearly guidance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate yearly guidance'
    });
  }
}