import { NextRequest, NextResponse } from 'next/server';
import { HallucinationTestRunner, generateSeed } from '@/../../apps/api/backend/src/services/hallucination-testing';
import { createMaiaModelRunner } from '@/../../apps/api/backend/src/services/hallucination-testing/maiaModelRunner';
import { generateMarkdownReport } from '@/../../apps/api/backend/src/services/hallucination-testing/reporter';
import type { TestConfig } from '@/../../apps/api/backend/src/services/hallucination-testing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const config: TestConfig = {
      seed: body.seed || generateSeed('hallucination'),
      domains: body.domains || ['math', 'citation', 'wisdom'],
      countPerDomain: body.countPerDomain || 5,
      gates: {
        minAccuracy: body.gates?.minAccuracy ?? 0.85,
        minDomainAccuracy: body.gates?.minDomainAccuracy ?? 0.80,
        maxOverconfidence: body.gates?.maxOverconfidence ?? 0.15,
        maxEce: body.gates?.maxEce ?? 0.10
      }
    };

    const modelRunner = createMaiaModelRunner();
    const testRunner = new HallucinationTestRunner(config, modelRunner);

    const { results, summary } = await testRunner.run();

    const format = body.format || 'json';
    if (format === 'markdown') {
      const report = generateMarkdownReport(summary, results);
      return new NextResponse(report, {
        headers: { 'Content-Type': 'text/markdown' }
      });
    }

    return NextResponse.json({
      success: true,
      summary,
      results: body.includeResults ? results : undefined
    });
  } catch (error) {
    console.error('[HallucinationTest API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const seed = searchParams.get('seed') || generateSeed('quick-test');
  const format = searchParams.get('format') || 'json';

  try {
    const config: TestConfig = {
      seed,
      domains: ['math', 'citation', 'wisdom'],
      countPerDomain: 3,
      gates: {
        minAccuracy: 0.85,
        minDomainAccuracy: 0.80,
        maxOverconfidence: 0.15,
        maxEce: 0.10
      }
    };

    const modelRunner = createMaiaModelRunner();
    const testRunner = new HallucinationTestRunner(config, modelRunner);

    const { results, summary } = await testRunner.run();

    if (format === 'markdown') {
      const report = generateMarkdownReport(summary, results);
      return new NextResponse(report, {
        headers: { 'Content-Type': 'text/markdown' }
      });
    }

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('[HallucinationTest API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}