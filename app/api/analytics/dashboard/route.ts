import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiClient, API_ENDPOINTS } from '../../../../frontend/lib/config';
import { getSupabaseConfig } from '../../../../lib/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig.isConfigured) {
      return NextResponse.json(
        { error: 'Analytics service not available in demo mode' },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type, research_participation')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') as 'week' | 'month' | 'quarter' | 'year' || 'month';
    const analyticsType = url.searchParams.get('type') || 'user';

    if (analyticsType === 'user') {
      // Proxy request to backend API
      try {
        const endpoint = `${API_ENDPOINTS.analytics.dashboard}?userId=${user.id}&timeframe=${timeframe}&type=${analyticsType}`;
        const data = await apiClient.get(endpoint);
        return NextResponse.json(data);
      } catch (error) {
        console.error('Backend API error:', error);
        return NextResponse.json(
          { error: 'Analytics service temporarily unavailable' },
          { status: 503 }
        );
      }

    } else if (analyticsType === 'platform' && profile.account_type === 'admin') {
      // Platform analytics only for admins
      try {
        const platformTimeframe = timeframe === 'week' ? 'month' : timeframe as 'month' | 'quarter' | 'year';
        const endpoint = `${API_ENDPOINTS.analytics.dashboard}?timeframe=${platformTimeframe}&type=${analyticsType}`;
        const data = await apiClient.get(endpoint);
        return NextResponse.json(data);
      } catch (error) {
        console.error('Backend API error:', error);
        return NextResponse.json(
          { error: 'Platform analytics temporarily unavailable' },
          { status: 503 }
        );
      }

    } else if (analyticsType === 'research' && profile.account_type === 'researcher') {
      // Research insights only for researchers
      try {
        const endpoint = `${API_ENDPOINTS.analytics.dashboard}?type=${analyticsType}`;
        const data = await apiClient.get(endpoint);
        return NextResponse.json({
          ...data,
          disclaimer: 'All data has been anonymized and aggregated to protect user privacy'
        });
      } catch (error) {
        console.error('Backend API error:', error);
        return NextResponse.json(
          { error: 'Research insights temporarily unavailable' },
          { status: 503 }
        );
      }

    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions for requested analytics type' },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('Analytics dashboard error:', error);

    if (error instanceof Error && error.message.includes('Insufficient data')) {
      return NextResponse.json(
        {
          error: 'Insufficient anonymized data available',
          message: 'Analytics require minimum user cohorts to protect privacy'
        },
        { status: 204 } // No Content
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

// Update user analytics preferences
export async function PUT(request: NextRequest) {
  try {
    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig.isConfigured) {
      return NextResponse.json(
        { error: 'Analytics service not available in demo mode' },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analyticsPreferences } = await request.json();

    // Update user's analytics and privacy preferences
    const { error } = await supabase
      .from('user_profiles')
      .update({
        analytics_preferences: analyticsPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Log preference change for audit
    await supabase
      .from('user_privacy_changes')
      .insert({
        user_id: user.id,
        change_type: 'analytics_preferences',
        previous_settings: null, // Would fetch previous in real implementation
        new_settings: analyticsPreferences,
        changed_at: new Date().toISOString()
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}