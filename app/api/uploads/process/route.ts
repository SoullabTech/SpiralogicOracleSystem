import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { transcribeAudio, summarizeText, isAudioFile, isTextFile, isImageFile } from '@/lib/uploads/transcriber';
import { extractTextFromPDF, isPDFBuffer } from '@/lib/uploads/pdf';
import { describeImage, softOCR, analyzeImage } from '@/lib/uploads/vision';
import { embedText, prepareTextForEmbedding } from '@/lib/uploads/embeddings';
import { emitBetaEventServer } from '@/lib/beta/emit';

const BUCKET = process.env.UPLOADS_BUCKET || 'uploads';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { uploadId } = await request.json();
    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 });
    }

    // Get upload record (RLS ensures user owns it)
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (fetchError || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    if (upload.status !== 'uploaded') {
      return NextResponse.json({ 
        error: 'Upload already processed or in progress',
        status: upload.status 
      }, { status: 400 });
    }

    // Mark as processing
    await supabase
      .from('uploads')
      .update({ status: 'processing' })
      .eq('id', uploadId);

    try {
      // Get signed URL to access the file
      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(upload.storage_path, 60 * 10); // 10 minutes

      if (signedError || !signedData) {
        throw new Error('Failed to get file access URL');
      }

      let transcript = null;
      let summary = null;
      let textContent = null;
      let imageCaption = null;
      let ocrText = null;
      let embedding = null;
      let processingMeta: any = {};

      // Download file for processing
      const response = await fetch(signedData.signedUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isAudioFile(upload.file_type)) {
        // Audio/Video Processing (existing logic)
        console.log(`Transcribing ${upload.file_type} file: ${upload.file_name}`);
        
        const transcriptionResult = await transcribeAudio(signedData.signedUrl, {
          language: process.env.TRANSCRIBE_LANG || 'en'
        });

        transcript = {
          text: transcriptionResult.text,
          segments: transcriptionResult.segments || [],
          language: transcriptionResult.language,
          duration: transcriptionResult.duration
        };

        textContent = transcriptionResult.text;

        // Generate summary from transcript
        if (transcriptionResult.text) {
          summary = await summarizeText(transcriptionResult.text, {
            maxLength: 300,
            style: 'paragraph'
          });
        }

        processingMeta = {
          transcription_provider: process.env.TRANSCRIBE_PROVIDER || 'openai',
          duration_seconds: transcriptionResult.duration,
          word_count: transcriptionResult.text.split(' ').length
        };

        // Emit beta event for audio processing
        await emitBetaEventServer(user.id, 'voice_transcribed', {
          uploadId: upload.id,
          duration: transcriptionResult.duration,
          wordCount: transcriptionResult.text.split(' ').length
        });

      } else if (upload.file_type === 'application/pdf' || isPDFBuffer(buffer)) {
        // PDF Processing
        console.log(`Processing PDF file: ${upload.file_name}`);
        
        const maxPages = Number(process.env.PDF_MAX_PAGES ?? 100);
        const rawText = await extractTextFromPDF(buffer, maxPages);
        
        if (rawText) {
          textContent = rawText;
          summary = await summarizeText(rawText, {
            maxLength: 300,
            style: 'paragraph'
          });
        }

        processingMeta = {
          character_count: rawText.length,
          extraction_method: 'pdf-parse',
          max_pages_limit: maxPages
        };

        // Emit beta events for PDF processing
        await emitBetaEventServer(user.id, 'document_summarized', {
          uploadId: upload.id,
          fileType: upload.file_type,
          characterCount: rawText.length
        });

      } else if (isImageFile(upload.file_type)) {
        // Image Processing
        console.log(`Processing image file: ${upload.file_name}`);
        
        // Generate image description
        imageCaption = await describeImage(signedData.signedUrl);
        
        // Extract text from image if any (OCR)
        ocrText = await softOCR(signedData.signedUrl);
        
        // Analyze image attributes
        const analysis = await analyzeImage(signedData.signedUrl);
        
        // Use caption as summary
        summary = imageCaption;

        processingMeta = {
          image_analysis: analysis,
          has_visible_text: ocrText.length > 0,
          ocr_character_count: ocrText.length
        };

        // Emit beta events for image processing
        await emitBetaEventServer(user.id, 'image_described', {
          uploadId: upload.id,
          containsFace: analysis.hasFaces,
          complexity: analysis.complexity
        });

      } else if (isTextFile(upload.file_type)) {
        // Text File Processing (existing logic)
        console.log(`Processing ${upload.file_type} file: ${upload.file_name}`);
        
        const text = buffer.toString('utf-8');
        
        if (text) {
          textContent = text;
          summary = await summarizeText(text, {
            maxLength: 300,
            style: 'paragraph'
          });
        }

        processingMeta = {
          file_size_bytes: upload.size_bytes,
          character_count: text.length
        };

        // Emit beta event for text processing
        await emitBetaEventServer(user.id, 'upload_processed', {
          uploadId: upload.id,
          fileType: upload.file_type,
          characterCount: text.length
        });

      } else {
        // Unknown file type - mark as ready without processing
        processingMeta = {
          file_size_bytes: upload.size_bytes,
          processing_note: 'File uploaded successfully, no text extraction available'
        };

        await emitBetaEventServer(user.id, 'upload_completed', {
          uploadId: upload.id,
          fileType: upload.file_type
        });
      }

      // Generate embedding for semantic search
      const semanticContent = prepareTextForEmbedding({
        title: upload.file_name,
        content: textContent,
        description: imageCaption,
        summary: summary,
        ocr_text: ocrText
      });

      if (semanticContent.trim().length > 0) {
        try {
          embedding = await embedText(semanticContent);
          console.log(`Generated embedding for ${upload.file_name}`);
        } catch (embeddingError) {
          console.warn('Embedding generation failed:', embeddingError);
          // Continue without embedding - non-critical
        }
      }

      // Update upload record with all results
      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          status: 'ready',
          transcript: transcript,
          summary: summary,
          text_content: textContent,
          image_caption: imageCaption,
          ocr_text: ocrText,
          embedding: embedding ? `[${embedding.join(',')}]` : null,
          meta: { 
            ...upload.meta, 
            processing: processingMeta,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', uploadId);

      if (updateError) {
        throw updateError;
      }

      // Award badges based on file type
      if (isImageFile(upload.file_type)) {
        // Award Visionary badge for first image upload
        await maybeAwardBadge(user.id, 'visionary');
      } else if (upload.file_type === 'application/pdf') {
        // Award Scholar badge for first PDF upload
        await maybeAwardBadge(user.id, 'scholar');
      }

      // Emit general upload success event
      await emitBetaEventServer(user.id, 'upload_ready', {
        upload_id: uploadId,
        file_name: upload.file_name,
        file_type: upload.file_type,
        has_transcript: !!transcript,
        has_summary: !!summary,
        has_image_caption: !!imageCaption,
        has_embedding: !!embedding
      });

      // Prepare Maya's post-upload voice cue
      const mayaPostUploadCue = {
        shouldSpeak: true,
        text: "I've received your upload. I'll weave its insights into our conversation. What would you like to focus on first?",
        context: 'post_upload'
      };

      return NextResponse.json({
        status: 'ready',
        has_transcript: !!transcript,
        has_summary: !!summary,
        has_text_content: !!textContent,
        has_image_caption: !!imageCaption,
        has_ocr_text: !!ocrText,
        has_embedding: !!embedding,
        transcript: transcript,
        summary: summary,
        image_caption: imageCaption,
        maya_voice_cue: mayaPostUploadCue
      });

    } catch (processingError) {
      console.error('Upload processing failed:', processingError);
      
      // Mark as error
      await supabase
        .from('uploads')
        .update({ 
          status: 'error',
          error: processingError instanceof Error ? processingError.message : 'Processing failed',
          meta: {
            ...upload.meta,
            error_at: new Date().toISOString(),
            error_details: processingError instanceof Error ? processingError.stack : String(processingError)
          }
        })
        .eq('id', uploadId);

      return NextResponse.json({
        status: 'error',
        error: processingError instanceof Error ? processingError.message : 'Processing failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to award badges
async function maybeAwardBadge(userId: string, badgeCode: 'visionary' | 'scholar') {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from('beta_user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_code', badgeCode)
      .limit(1);

    if (!existingBadge?.length) {
      // Award the badge
      await supabase
        .from('beta_user_badges')
        .insert({ user_id: userId, badge_code: badgeCode });

      console.log(`Awarded ${badgeCode} badge to user ${userId}`);
    }
  } catch (error) {
    console.warn(`Failed to award ${badgeCode} badge:`, error);
  }
}