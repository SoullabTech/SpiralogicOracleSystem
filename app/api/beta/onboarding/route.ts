import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/storage/userStore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('Beta onboarding data received:', {
      explorerId: data.explorerId,
      name: data.name,
      hasAge: !!data.age,
      hasPronouns: !!data.pronouns,
      hasLocation: !!data.location,
      hasBiography: !!data.biography,
      hasFiles: !!data.uploadedFiles?.length,
      greetingStyle: data.greetingStyle,
      communicationPreference: data.communicationPreference,
      focusAreas: data.focusAreas,
      researchConsent: data.researchConsent
    });

    const userId = data.explorerId || data.userId || `user_${Date.now()}`;

    const savedUser = userStore.saveUser({
      userId,
      explorerId: data.explorerId,
      explorerName: data.explorerName,
      name: data.name,
      email: data.email,
      age: data.age,
      pronouns: data.pronouns,
      location: data.location,
      biography: data.biography,
      greetingStyle: data.greetingStyle,
      communicationPreference: data.communicationPreference,
      explorationLens: data.explorationLens,
      wisdomFacets: data.wisdomFacets,
      focusAreas: data.focusAreas,
      researchConsent: data.researchConsent,
    });

    console.log('✅ User data saved to server storage:', savedUser.userId, savedUser.name);

    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully',
      userId: savedUser.userId,
      user: savedUser
    });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}