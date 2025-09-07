import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ElementalAnalysis {
  primary_element: 'earth' | 'water' | 'fire' | 'air' | 'ether';
  elemental_breakdown: {
    earth: number;
    water: number;
    fire: number;
    air: number;
    ether: number;
  };
  shadow_themes?: string[];
  aether_connections?: string[];
  key_insights: string[];
  resonance_tags: string[];
}

async function extractTextFromFile(supabase: any, storagePath: string, mimeType: string): Promise<string> {
  // Get file from storage
  const { data, error } = await supabase.storage
    .from("documents")
    .download(storagePath);

  if (error) throw new Error(`Failed to download file: ${error.message}`);

  // Extract text based on mime type
  if (mimeType.startsWith("text/")) {
    return await data.text();
  }
  
  if (mimeType === "application/pdf") {
    // For PDF, we'd need a PDF parser (like pdf-parse)
    // For now, return placeholder
    return "[PDF content - parser needed]";
  }
  
  if (mimeType.startsWith("audio/")) {
    // For audio, we'd need speech-to-text
    return "[Audio content - transcription needed]";
  }
  
  if (mimeType.startsWith("video/")) {
    // For video, we'd extract audio then transcribe
    return "[Video content - transcription needed]";
  }

  return "[Content type not supported for text extraction]";
}

async function analyzeElementalResonance(content: string): Promise<ElementalAnalysis> {
  const prompt = `Analyze this content for elemental resonance and sacred themes. Return ONLY valid JSON:

Content: """${content.slice(0, 4000)}"""

Analyze for:
1. Primary element (earth, water, fire, air, ether)
2. Elemental breakdown (percentages as decimals 0-1, must sum to 1.0)
3. Shadow themes (unconscious patterns, projections, resistance)
4. Aether connections (spiritual insights, transcendent themes)
5. Key insights (3-5 reflective observations)
6. Resonance tags (5-8 descriptive keywords)

Rules:
- Non-prescriptive analysis only
- Focus on patterns, not diagnosis
- Reflective questions over answers
- Respect user sovereignty

Return as JSON matching this exact structure:
{
  "primary_element": "earth|water|fire|air|ether",
  "elemental_breakdown": {
    "earth": 0.0,
    "water": 0.0,
    "fire": 0.0,
    "air": 0.0,
    "ether": 0.0
  },
  "shadow_themes": ["theme1", "theme2"],
  "aether_connections": ["connection1", "connection2"],
  "key_insights": ["insight1", "insight2", "insight3"],
  "resonance_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content_text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = content_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    const required = ['primary_element', 'elemental_breakdown', 'key_insights', 'resonance_tags'];
    for (const field of required) {
      if (!analysis[field]) throw new Error(`Missing field: ${field}`);
    }
    
    // Validate elemental breakdown sums to ~1.0
    const sum = Object.values(analysis.elemental_breakdown).reduce((a: any, b: any) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.1) {
      console.warn("Elemental breakdown doesn't sum to 1.0, normalizing...");
      const factor = 1.0 / sum;
      for (const element in analysis.elemental_breakdown) {
        analysis.elemental_breakdown[element] *= factor;
      }
    }
    
    return analysis;
  } catch (error) {
    console.error("Analysis error:", error);
    // Fallback analysis
    return {
      primary_element: 'earth',
      elemental_breakdown: {
        earth: 0.4,
        water: 0.3,
        fire: 0.1,
        air: 0.1,
        ether: 0.1
      },
      key_insights: ["Analysis in progress", "Content being processed"],
      resonance_tags: ["pending", "analysis"]
    };
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    // Get document info
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if already analyzed
    if (document.status === "analyzed") {
      return NextResponse.json({ 
        message: "Document already analyzed",
        analysis: document.analysis 
      });
    }

    // Extract content
    let content = "";
    try {
      content = await extractTextFromFile(supabase, document.storage_path, document.mime_type);
    } catch (error) {
      console.error("Content extraction error:", error);
      content = `[Unable to extract content from ${document.filename}]`;
    }

    // Analyze content
    const analysis = await analyzeElementalResonance(content);

    // Update document with analysis
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "analyzed",
        analysis: analysis,
        content_preview: content.slice(0, 500),
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create library asset entry
    const { error: assetError } = await supabase
      .from("library_assets")
      .insert({
        user_id: document.user_id,
        title: document.filename,
        type: mapDocumentTypeToAssetType(document.type),
        element: analysis.primary_element,
        file_url: document.storage_path,
        tags: analysis.resonance_tags,
        insights: analysis.key_insights,
        metadata: {
          elemental_breakdown: analysis.elemental_breakdown,
          shadow_themes: analysis.shadow_themes,
          aether_connections: analysis.aether_connections,
          original_document_id: document.id
        }
      });

    if (assetError) {
      console.error("Asset creation error:", assetError);
      // Continue - analysis still succeeded
    }

    return NextResponse.json({
      status: "analyzed",
      analysis,
      message: "Document analyzed and added to Sacred Library"
    });

  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function mapDocumentTypeToAssetType(docType: string): string {
  const mapping: Record<string, string> = {
    text: 'document',
    audio: 'audio',
    video: 'video',
    image: 'image',
    document: 'document'
  };
  return mapping[docType] || 'document';
}

// GET route to check analysis status
export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const { data: document, error } = await supabase
      .from("documents")
      .select("id, filename, status, analysis, analyzed_at")
      .eq("id", documentId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: document.id,
      filename: document.filename,
      status: document.status,
      analysis: document.analysis,
      analyzedAt: document.analyzed_at
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to get analysis status" }, { status: 500 });
  }
}