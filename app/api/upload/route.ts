import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["text", "audio", "video", "image", "document"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const timestamp = Date.now();
    const path = `${user.id}/${timestamp}-${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (uploadError) {
      // Check if bucket exists, create if not
      if (uploadError.message.includes("bucket")) {
        const { error: bucketError } = await supabase.storage.createBucket("documents", {
          public: false,
          allowedMimeTypes: ["image/*", "audio/*", "video/*", "text/*", "application/pdf"],
        });
        
        if (!bucketError) {
          // Retry upload
          const { error: retryError } = await supabase.storage
            .from("documents")
            .upload(path, file);
          
          if (retryError) {
            return NextResponse.json({ error: retryError.message }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: bucketError.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    // Insert into documents table
    const { data, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        filename: file.name,
        type,
        size_bytes: file.size,
        storage_path: path,
        status: "pending",
        mime_type: file.type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Clean up storage if database insert fails
      await supabase.storage.from("documents").remove([path]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Trigger async analysis (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/documents/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: data.id }),
    }).catch(async (error) => {
      console.error("Analysis trigger failed:", error);
      // Mark document as error status
      await supabase
        .from("documents")
        .update({ status: "error" })
        .eq("id", data.id);
    });

    return NextResponse.json({
      id: data.id,
      storagePath: path,
      status: "ok",
      message: "Document uploaded successfully. Analysis in progress.",
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}

// Optional: Add GET to check upload status
export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's recent uploads
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}