import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseStorage, getSupabaseREST } from '@/lib/supabase-rest';

export async function POST(request: NextRequest) {
  try {
    // Get explorer info from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const explorerId = formData.get('explorerId') as string;
    const explorerName = formData.get('explorerName') as string;

    if (!file || !explorerId) {
      return NextResponse.json(
        { error: 'File and explorer ID required' },
        { status: 400 }
      );
    }

    // Get storage client
    const storage = await getSupabaseStorage();
    if (!storage) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    // Create unique file path
    const timestamp = Date.now();
    const fileName = `${explorerId}/${timestamp}-${file.name}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await storage.upload(
      'beta-uploads',
      fileName,
      file
    );

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Save file metadata to database
    const supabase = await getSupabaseREST();
    if (supabase) {
      await supabase
        .from('file_uploads')
        .insert({
          explorer_id: explorerId,
          explorer_name: explorerName,
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          upload_date: new Date().toISOString()
        });
    }

    // Get public URL
    const publicUrl = storage.getPublicUrl('beta-uploads', fileName);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: fileName,
      publicUrl,
      uploadDate: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list user's files
export async function GET(request: NextRequest) {
  try {
    const explorerId = request.nextUrl.searchParams.get('explorerId');

    if (!explorerId) {
      return NextResponse.json(
        { error: 'Explorer ID required' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseREST();
    if (!supabase) {
      return NextResponse.json({ files: [] });
    }

    const { data, error } = await supabase
      .from('file_uploads')
      .eq('explorer_id', explorerId)
      .select('*');

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ files: [] });
    }

    return NextResponse.json({ files: data || [] });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ files: [] });
  }
}