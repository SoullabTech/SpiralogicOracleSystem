// Simple audio test endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  // Return a basic test sound as base64 (sine wave beep)
  // This is a minimal valid WAV file with a short beep
  const testWavBase64 = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBh