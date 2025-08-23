import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { validateFileType } from '@/lib/uploads/transcriber';

const BUCKET = process.env.UPLOADS_BUCKET || 'uploads';
const MAX_SIZE_MB = Number(process.env.MAX_UPLOAD_MB) || 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const UploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1),
  sizeBytes: z.number().positive().max(MAX_SIZE_BYTES),
  conversationId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: uploads, error } = await supabase
      .from('v_user_uploads')
      .select('*');

    if (error) {
      console.error('Failed to fetch uploads:', error);
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }

    return NextResponse.json({ uploads: uploads || [] });

  } catch (error) {
    console.error('Uploads GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UploadRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const { fileName, fileType, sizeBytes, conversationId } = parsed.data;

    // Validate file type
    if (!validateFileType(fileType)) {
      return NextResponse.json({ 
        error: 'File type not allowed',
        allowedTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || []
      }, { status: 400 });
    }

    // Generate storage path: user_id/timestamp_filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath, {
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to create signed URL:', uploadError);
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }

    // Insert upload metadata
    const { data: uploadRecord, error: insertError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        file_name: fileName,
        file_type: fileType,
        size_bytes: sizeBytes,
        storage_path: storagePath,
        status: 'uploaded'
      })
      .select('id, storage_path')
      .single();

    if (insertError) {
      console.error('Failed to insert upload record:', insertError);
      return NextResponse.json({ error: 'Failed to create upload record' }, { status: 500 });
    }

    return NextResponse.json({
      uploadId: uploadRecord.id,
      storagePath: uploadRecord.storage_path,
      signedUrl: uploadData.signedUrl,
      token: uploadData.token
    });

  } catch (error) {
    console.error('Uploads POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('id');

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 });
    }

    // Get upload record (RLS ensures user can only access their own)
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('storage_path')
      .eq('id', uploadId)
      .single();

    if (fetchError || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([upload.storage_path]);

    if (storageError) {
      console.warn('Failed to delete from storage:', storageError);
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId);

    if (deleteError) {
      console.error('Failed to delete upload record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Uploads DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}