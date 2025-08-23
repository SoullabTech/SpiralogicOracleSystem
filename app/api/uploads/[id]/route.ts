import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const uploadId = params.id;

    // Get upload details (RLS ensures user can only access their own)
    const { data: upload, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Return full upload details including transcript
    return NextResponse.json({
      id: upload.id,
      file_name: upload.file_name,
      file_type: upload.file_type,
      size_bytes: upload.size_bytes,
      status: upload.status,
      transcript: upload.transcript,
      summary: upload.summary,
      conversation_id: upload.conversation_id,
      created_at: upload.created_at,
      updated_at: upload.updated_at,
      meta: upload.meta
    });

  } catch (error) {
    console.error('Upload detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const uploadId = params.id;
    const updates = await request.json();

    // Allow updating conversation_id and meta fields
    const allowedUpdates: any = {};
    
    if (updates.conversation_id !== undefined) {
      allowedUpdates.conversation_id = updates.conversation_id;
    }
    
    if (updates.meta !== undefined) {
      allowedUpdates.meta = updates.meta;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const { data: upload, error } = await supabase
      .from('uploads')
      .update(allowedUpdates)
      .eq('id', uploadId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update upload:', error);
      return NextResponse.json({ error: 'Failed to update upload' }, { status: 500 });
    }

    return NextResponse.json({ upload });

  } catch (error) {
    console.error('Upload update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const uploadId = params.id;
    const BUCKET = process.env.UPLOADS_BUCKET || 'uploads';

    // Get upload record first
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
    console.error('Upload delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}