import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully'
    });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}