/**
 * Daimonic Encounter API Route
 * Provides access to the comprehensive daimonic facilitation system
 */

import { NextRequest, NextResponse } from 'next/server';
import { DaimonicFacilitationService } from '../../../../backend/src/services/DaimonicFacilitationService';

// Create service instance
const daimonicService = new DaimonicFacilitationService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, profile } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Facilitate daimonic encounter
    const result = await daimonicService.facilitateDaimonicEncounter(userId, profile || {});

    return NextResponse.json({
      success: true,
      data: {
        narrative: result.narrative,
        othernessScore: result.othernessScore,
        primaryChannel: result.recommendations.primaryChannel,
        engagementStrategy: result.recommendations.engagementStrategy,
        practicalGuidance: result.recommendations.practicalGuidance.slice(0, 3),
        mysticismWarnings: result.recommendations.mysticismWarnings,
        ongoingPractices: result.recommendations.ongoingPractices.slice(0, 3),
        collectiveField: result.collectiveField ? {
          fieldIntensity: result.collectiveField.fieldIntensity,
          activePatterns: result.collectiveField.activePatterns.slice(0, 3)
        } : null
      }
    });

  } catch (error) {
    console.error('Daimonic encounter error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Get user's ongoing daimonic relationship status
    const status = await daimonicService.getDaimonicRelationshipStatus(userId);

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Daimonic status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}