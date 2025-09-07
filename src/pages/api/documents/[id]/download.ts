import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Document ID required' });
    }

    // Get user from session (optional for public access)
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Get document record
    let query = supabase
      .from('documents')
      .select('*')
      .eq('id', id);
    
    // If user is authenticated, filter by user_id (RLS will handle this anyway)
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: document, error: dbError } = await query.single();
    
    if (dbError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get signed URL from Supabase Storage
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('sacred-documents')
      .createSignedUrl(document.storage_path, 3600); // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return res.status(500).json({ error: 'Failed to access file' });
    }

    // Fetch the file from storage
    const fileResponse = await fetch(signedUrlData.signedUrl);
    
    if (!fileResponse.ok) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Stream the file
    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}