import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OnboardingData } from '../../types/onboarding';
import { MemoryPayloadInterface } from '../../core/MemoryPayloadInterface';
import { saveOnboardingData, getOnboardingData, convertToMemoryPayload } from '../../lib/onboarding/memoryStore';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      return handleCreateOnboarding(req, res);
    case 'GET':
      return handleGetOnboarding(req, res);
    case 'PUT':
      return handleUpdateOnboarding(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleCreateOnboarding(req: NextApiRequest, res: NextApiResponse) {
  try {
    const onboardingData = req.body as Omit<OnboardingData, 'userId' | 'createdAt' | 'updatedAt'>;
    
    // Validate required fields
    if (!onboardingData.elementalAffinity || !onboardingData.spiralPhase || !onboardingData.tonePreference) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate user ID (in production, this would come from authentication)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to memory store
    const savedData = saveOnboardingData(userId, onboardingData);
    
    // Initialize memory payload
    const memoryInterface = new MemoryPayloadInterface();
    const userMetadata = convertToMemoryPayload(savedData, memoryInterface);
    
    // Save to Supabase if configured
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .insert([{
            user_id: userId,
            elemental_affinity: savedData.elementalAffinity,
            spiral_phase: savedData.spiralPhase,
            tone_preference: savedData.tonePreference,
            name: savedData.name,
            spiritual_backgrounds: savedData.spiritualBackgrounds,
            current_challenges: savedData.currentChallenges,
            guidance_preferences: savedData.guidancePreferences,
            experience_level: savedData.experienceLevel,
            intentions: savedData.intentions,
            voice_personality: savedData.voicePersonality,
            communication_style: savedData.communicationStyle,
            onboarding_data: savedData
          }]);

        if (error) {
          console.error('Supabase error:', error);
          // Continue without failing - memory store is sufficient
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        // Continue without failing
      }
    }

    return res.status(201).json({
      success: true,
      userId: userId,
      data: savedData,
      userMetadata: userMetadata
    });

  } catch (error) {
    console.error('Onboarding creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetOnboarding(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Try memory store first
    const onboardingData = getOnboardingData(userId);
    
    if (onboardingData) {
      return res.status(200).json({
        success: true,
        data: onboardingData
      });
    }

    // Try Supabase if configured
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data && !error) {
          return res.status(200).json({
            success: true,
            data: data.onboarding_data || data
          });
        }
      } catch (supabaseError) {
        console.error('Supabase query error:', supabaseError);
      }
    }

    return res.status(404).json({ error: 'Onboarding data not found' });

  } catch (error) {
    console.error('Onboarding retrieval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateOnboarding(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    const updates = req.body as Partial<OnboardingData>;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get existing data
    const existingData = getOnboardingData(userId);
    if (!existingData) {
      return res.status(404).json({ error: 'Onboarding data not found' });
    }

    // Update memory store
    const updatedData = saveOnboardingData(userId, { ...existingData, ...updates });
    
    // Update memory payload
    const memoryInterface = new MemoryPayloadInterface();
    const userMetadata = convertToMemoryPayload(updatedData, memoryInterface);
    
    // Update Supabase if configured
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { error } = await supabase
          .from('user_onboarding')
          .update({
            elemental_affinity: updatedData.elementalAffinity,
            spiral_phase: updatedData.spiralPhase,
            tone_preference: updatedData.tonePreference,
            name: updatedData.name,
            spiritual_backgrounds: updatedData.spiritualBackgrounds,
            current_challenges: updatedData.currentChallenges,
            guidance_preferences: updatedData.guidancePreferences,
            experience_level: updatedData.experienceLevel,
            intentions: updatedData.intentions,
            voice_personality: updatedData.voicePersonality,
            communication_style: updatedData.communicationStyle,
            onboarding_data: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase update error:', error);
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedData,
      userMetadata: userMetadata
    });

  } catch (error) {
    console.error('Onboarding update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}