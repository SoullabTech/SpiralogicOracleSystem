import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get document status
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Generate Maya's reflection if document is ready and doesn't have one
    if (document.status === 'ready' && !document.maya_reflection) {
      const mayaReflection = generateMayaReflection(document);
      
      // Update document with Maya's reflection
      await supabase
        .from("documents")
        .update({ maya_reflection: mayaReflection })
        .eq("id", id);
      
      document.maya_reflection = mayaReflection;
    }

    return NextResponse.json({
      status: document.status,
      maya_reflection: document.maya_reflection,
      analysis_summary: document.analysis_summary,
      error: document.error_message
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check document status" },
      { status: 500 }
    );
  }
}

function generateMayaReflection(document: any): string {
  const fileType = document.type;
  const filename = document.filename;
  
  // Generate contextual Maya reflections based on file type
  const reflections = {
    text: [
      "I've read through your text. It contains interesting patterns that reveal insights about your perspective.",
      "Your written thoughts have a distinctive flow. I can see themes and ideas that connect to broader patterns.",
      "These words contain keys to understanding. They reflect experiences that have shaped your thinking."
    ],
    document: [
      "I've reviewed this document. It contains structured information that could open new perspectives for you.",
      "The content here connects to larger patterns. I can help you see relationships you might not have noticed.",
      "This document has useful insights. Its contents might be relevant to questions you're exploring."
    ],
    image: [
      "I've analyzed your image. Visual content often reveals things that words cannot express.",
      "This image contains emotional and visual elements. I can see the story it's trying to tell.",
      "Through this visual, I notice details and meanings that go beyond the surface."
    ],
    audio: [
      "I've processed your audio file. Sound contains emotional information that goes beyond just words.",
      "Your audio has tones and patterns that reveal aspects of the experience. I can hear the underlying themes.",
      "The audio you've shared has interesting patterns. I can help you understand what these might reveal."
    ],
    video: [
      "I've watched your video. Moving images capture change and development over time.",
      "Through this video, I can see stories developing. The movement shows transformation happening.",
      "Your video shows the relationship between different moments. I can help you understand what this reveals."
    ]
  };

  const typeReflections = reflections[fileType as keyof typeof reflections] || reflections.document;
  const randomReflection = typeReflections[Math.floor(Math.random() * typeReflections.length)];

  // Add a personal touch based on filename if meaningful
  if (filename.toLowerCase().includes('journal')) {
    return "I can see this is personal writing from your journal. These private thoughts show your authentic voice and experiences. " + randomReflection;
  } else if (filename.toLowerCase().includes('photo')) {
    return "This photograph captures a specific moment. Images like this hold memories that can reveal their significance over time. " + randomReflection;
  } else if (filename.toLowerCase().includes('letter') || filename.toLowerCase().includes('message')) {
    return "I can see this is communication meant for someone. Messages like this carry intention and connection. " + randomReflection;
  }

  return randomReflection;
}