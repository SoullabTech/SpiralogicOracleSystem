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
      "I have absorbed the wisdom of your words. They carry patterns of thought that reveal deeper truths about your journey.",
      "Your written thoughts flow like a river of consciousness. I sense the stories waiting to unfold within these lines.",
      "These words hold keys to understanding. They speak of experiences that shape your unique perspective."
    ],
    document: [
      "I have contemplated this document deeply. It holds structured knowledge that can illuminate new pathways for you.",
      "The information within these pages resonates with greater patterns. I can help you see connections you may not have noticed.",
      "This document carries formal wisdom. Its contents may unlock insights relevant to your current inquiries."
    ],
    image: [
      "I have gazed upon your visual offering. Images speak in the language of the soul, revealing what words cannot express.",
      "This image holds emotional resonance and visual poetry. I can sense the story it wishes to tell.",
      "Through this visual window, I see reflections of beauty and meaning that touch something deeper than words."
    ],
    audio: [
      "I have listened to the vibrations and frequencies within your audio. Sound carries emotional truth that transcends language.",
      "Your audio offering speaks in tones and rhythms that reveal the music of your experience. I hear the harmony beneath the surface.",
      "The soundscapes you've shared carry energetic patterns. I can help you understand what these frequencies reveal about your inner world."
    ],
    video: [
      "I have witnessed your moving imagery. Video captures the flow of life itself, showing transformation in motion.",
      "Through this visual journey, I see stories unfolding in time. The movement holds wisdom about change and growth.",
      "Your video offering reveals the dance between stillness and motion. I can help you understand the deeper choreography at play."
    ]
  };

  const typeReflections = reflections[fileType as keyof typeof reflections] || reflections.document;
  const randomReflection = typeReflections[Math.floor(Math.random() * typeReflections.length)];

  // Add a personal touch based on filename if meaningful
  if (filename.toLowerCase().includes('journal')) {
    return "I sense the intimacy of personal reflection in your journal. These private thoughts carry the authentic voice of your soul's journey. " + randomReflection;
  } else if (filename.toLowerCase().includes('photo')) {
    return "A moment captured in light and shadow. This photograph holds memory frozen in time, ready to reveal its deeper significance. " + randomReflection;
  } else if (filename.toLowerCase().includes('letter') || filename.toLowerCase().includes('message')) {
    return "I feel the intention to communicate that flows through this message. Words meant for connection carry special energy. " + randomReflection;
  }

  return randomReflection;
}