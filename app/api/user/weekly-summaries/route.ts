import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent static generation
export const maxDuration = 10; // Timeout after 10 seconds

export async function GET(req: Request) {
  try {
    // Mock data for now to prevent timeout during build
    // TODO: Connect to real Supabase once database is configured
    const mockData = [
      {
        id: 1,
        start_date: new Date().toISOString(),
        summary: "Weekly summary placeholder",
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching weekly summaries:', error);
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
  }
}