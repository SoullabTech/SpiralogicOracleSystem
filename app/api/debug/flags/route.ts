// Debug endpoint to check pipeline flags - prevents conversational regression
import { NextResponse } from 'next/server';

export async function GET() {
  const flags = {
    USE_CLAUDE: process.env.USE_CLAUDE === 'true',
    DEMO_PIPELINE_DISABLED: process.env.DEMO_PIPELINE_DISABLED === 'true',
    ATTENDING_ENFORCEMENT_MODE: process.env.ATTENDING_ENFORCEMENT_MODE ?? 'relaxed',
    MAYA_GREETING_ENABLED: process.env.MAYA_GREETING_ENABLED === 'true',
    MAYA_MODE_DEFAULT: process.env.MAYA_MODE_DEFAULT ?? 'conversational',
    START_SERVER: process.env.START_SERVER ?? 'full',
    UPLOADS_ENABLED: process.env.UPLOADS_ENABLED === 'true',
    MICROPSI_ENABLED: process.env.USE_MICROPSI_BACH === 'true',
    SOUL_MEMORY_ENRICH_SYNC: process.env.SOUL_MEMORY_ENRICH_SYNC === 'true',
    SOUL_MEMORY_ENRICH_BUDGET_MS: Number(process.env.SOUL_MEMORY_ENRICH_BUDGET_MS ?? 350),
  };

  const conversationalMode =
    flags.DEMO_PIPELINE_DISABLED &&
    flags.USE_CLAUDE &&
    flags.ATTENDING_ENFORCEMENT_MODE === 'relaxed' &&
    flags.MAYA_GREETING_ENABLED;

  return NextResponse.json({ 
    conversationalMode, 
    flags, 
    hints: conversationalMode ? [] : [
      'Set DEMO_PIPELINE_DISABLED=true',
      'Set USE_CLAUDE=true',
      'Set ATTENDING_ENFORCEMENT_MODE=relaxed',
      'Set MAYA_GREETING_ENABLED=true'
    ],
    timestamp: new Date().toISOString()
  });
}