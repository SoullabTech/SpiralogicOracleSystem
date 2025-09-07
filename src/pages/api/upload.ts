import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for storage operations
);

interface UploadResponse {
  success: boolean;
  document?: {
    id: string;
    filename: string;
    type: string;
    size_bytes: number;
    storage_path: string;
    preview_path?: string;
    resonance: any;
  };
  error?: string;
}

// Helper function to determine file type category
function getFileTypeCategory(mimeType: string): string {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'document';
  return 'document';
}

// Helper function to extract audio metadata (duration, frequency)
async function extractAudioMetadata(filePath: string): Promise<{ duration?: number; frequency?: number }> {
  try {
    // This would typically use ffprobe or similar
    // For now, return mock data - implement with actual audio analysis
    const filename = path.basename(filePath);
    const frequencyMatch = filename.match(/(\d{3,4})Hz/i);
    
    return {
      frequency: frequencyMatch ? parseInt(frequencyMatch[1]) : undefined,
      duration: undefined // Would extract from ffprobe
    };
  } catch (error) {
    console.error('Error extracting audio metadata:', error);
    return {};
  }
}

// Helper function to generate preview for assets
async function generatePreview(
  filePath: string, 
  type: string, 
  filename: string
): Promise<string | null> {
  try {
    const previewsDir = path.join(process.cwd(), 'docs/assets/previews');
    
    if (type === 'audio') {
      const waveformDir = path.join(previewsDir, 'audio-waveforms');
      await fs.promises.mkdir(waveformDir, { recursive: true });
      
      const name = path.parse(filename).name;
      const waveformPath = path.join(waveformDir, `${name}.svg`);
      
      // Generate simple waveform SVG (in production, use audiowaveform or ffmpeg)
      const svg = `
        <svg width='800' height='100' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='waveGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' style='stop-color:#d4af37;stop-opacity:1' />
              <stop offset='100%' style='stop-color:#8b6914;stop-opacity:0.3' />
            </linearGradient>
          </defs>
          <rect width='800' height='100' fill='#000000' opacity='0.1'/>
          <path d='M 0 50 ${Array.from({length: 100}, (_, i) => `L ${i * 8} ${50 + Math.sin(i * 0.5) * 20}`).join(' ')}' stroke='url(#waveGradient)' stroke-width='2' fill='none'/>
          <text x='400' y='90' text-anchor='middle' fill='#d4af37' font-family='monospace' font-size='12'>🎵 ${name}</text>
        </svg>
      `.trim();
      
      await fs.promises.writeFile(waveformPath, svg);
      return `/docs/assets/previews/audio-waveforms/${name}.svg`;
    } else if (type === 'video' || type === 'image') {
      // For images, use the file itself as preview
      // For video, would generate thumbnail with ffmpeg
      return null; // Return null for now, implement thumbnail generation
    }
    
    return null;
  } catch (error) {
    console.error('Error generating preview:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const originalFilename = uploadedFile.originalFilename || 'unknown';
    const mimeType = uploadedFile.mimetype || 'application/octet-stream';
    const fileTypeCategory = getFileTypeCategory(mimeType);
    const fileExtension = path.extname(originalFilename);
    const cleanFilename = path.parse(originalFilename).name.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    // Generate unique filename for storage
    const uniqueFilename = `${cleanFilename}_${uuidv4()}${fileExtension}`;
    const storagePath = `${user.id}/${fileTypeCategory}/${uniqueFilename}`;

    // Read file data
    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('sacred-documents')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return res.status(500).json({ success: false, error: 'Failed to upload file' });
    }

    // Extract metadata based on file type
    let metadata: any = {};
    if (fileTypeCategory === 'audio') {
      metadata = await extractAudioMetadata(uploadedFile.filepath);
    }

    // Generate preview
    const previewPath = await generatePreview(uploadedFile.filepath, fileTypeCategory, originalFilename);

    // Calculate resonance using the database function
    const { data: resonanceData } = await supabase.rpc('calculate_document_resonance', {
      p_filename: originalFilename,
      p_type: fileTypeCategory,
      p_extracted_text: null // Would extract text for PDFs/documents
    });

    // Insert document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: originalFilename,
        type: fileTypeCategory,
        mime_type: mimeType,
        size_bytes: uploadedFile.size,
        storage_path: storagePath,
        preview_path: previewPath,
        resonance: {
          ...resonanceData,
          ...metadata // Include duration, frequency if available
        },
        session_id: sessionId || null,
        status: 'processed'
      })
      .select('*')
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('sacred-documents').remove([storagePath]);
      return res.status(500).json({ success: false, error: 'Failed to save document record' });
    }

    // Clean up temp file
    await fs.promises.unlink(uploadedFile.filepath);

    // Update assets.json manifest for static site
    try {
      const assetsManifestPath = path.join(process.cwd(), 'docs/assets/assets.json');
      let manifest = [];
      
      try {
        const existingManifest = await fs.promises.readFile(assetsManifestPath, 'utf-8');
        manifest = JSON.parse(existingManifest);
      } catch {
        // File doesn't exist or is invalid, start fresh
      }

      // Add new asset to manifest
      const publicPath = `/api/documents/${document.id}/download`;
      manifest.push({
        id: document.id,
        filename: originalFilename,
        type: fileTypeCategory,
        path: publicPath,
        preview: previewPath || publicPath,
        ...metadata,
        resonance: document.resonance,
        createdAt: document.created_at
      });

      // Write updated manifest
      await fs.promises.writeFile(
        assetsManifestPath, 
        JSON.stringify(manifest, null, 2)
      );
    } catch (manifestError) {
      console.error('Failed to update assets manifest:', manifestError);
      // Don't fail the upload for this
    }

    return res.status(200).json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        type: document.type,
        size_bytes: document.size_bytes,
        storage_path: document.storage_path,
        preview_path: document.preview_path,
        resonance: document.resonance
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}