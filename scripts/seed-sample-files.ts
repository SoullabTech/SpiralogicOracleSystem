#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local if it exists
config({ path: '.env.local' });
config(); // Also load from .env

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Sample user ID for seeding (in production, this would be the actual user)
const SEED_USER_ID = 'seed-user-maya-samples';

interface SampleFile {
  filename: string;
  category: string;
  content: string;
  tags: string[];
  summary: string;
}

const SAMPLE_FILES: SampleFile[] = [
  {
    filename: 'maya-sample-notes.md',
    category: 'personal-notes',
    content: readFileSync(join(__dirname, 'sample-files', 'maya-sample-notes.md'), 'utf-8'),
    tags: ['flow', 'psychology', 'performance'],
    summary: 'Notes on flow states and optimal performance conditions'
  },
  {
    filename: 'maya-sample-mindfulness.md', 
    category: 'mindfulness',
    content: readFileSync(join(__dirname, 'sample-files', 'maya-sample-mindfulness.md'), 'utf-8'),
    tags: ['mindfulness', 'awareness', 'practice'],
    summary: 'Core principles and practices of mindful awareness'
  },
  {
    filename: 'maya-sample-creativity.md',
    category: 'creativity',
    content: readFileSync(join(__dirname, 'sample-files', 'maya-sample-creativity.md'), 'utf-8'),
    tags: ['creativity', 'expression', 'play'],
    summary: 'Insights on creative process and authentic expression'
  }
];

/**
 * Generate embeddings for text chunks
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Split text into semantic chunks
 */
function chunkText(text: string, filename: string): Array<{
  content: string;
  chunkIndex: number;
  pageNumber?: number;
  sectionTitle?: string;
  sectionLevel?: number;
  preview: string;
}> {
  const chunks = [];
  
  // For markdown files, split by headers and paragraphs
  const sections = text.split(/^#+ .+$/gm);
  let chunkIndex = 0;
  
  // Extract headers for section metadata
  const headerMatches = text.match(/^(#+) (.+)$/gm) || [];
  let currentSectionIndex = 0;
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;
    
    // Get section metadata
    let sectionTitle: string | undefined;
    let sectionLevel: number | undefined;
    
    if (i > 0 && headerMatches[currentSectionIndex]) {
      const headerMatch = headerMatches[currentSectionIndex].match(/^(#+) (.+)$/);
      if (headerMatch) {
        sectionLevel = headerMatch[1].length;
        sectionTitle = headerMatch[2];
        currentSectionIndex++;
      }
    }
    
    // Split long sections into smaller chunks (max 500 chars)
    if (section.length > 500) {
      const paragraphs = section.split(/\n\n+/);
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > 500 && currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            chunkIndex: chunkIndex++,
            pageNumber: 1, // For markdown, all content is "page 1"
            sectionTitle,
            sectionLevel,
            preview: currentChunk.trim().slice(0, 200) + (currentChunk.length > 200 ? '...' : '')
          });
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
      
      if (currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
          pageNumber: 1,
          sectionTitle,
          sectionLevel,
          preview: currentChunk.trim().slice(0, 200) + (currentChunk.length > 200 ? '...' : '')
        });
      }
    } else {
      chunks.push({
        content: section,
        chunkIndex: chunkIndex++,
        pageNumber: 1,
        sectionTitle,
        sectionLevel,
        preview: section.slice(0, 200) + (section.length > 200 ? '...' : '')
      });
    }
  }
  
  return chunks;
}

/**
 * Check if sample files already exist for any user
 */
async function checkExistingSampleFiles(): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_files')
    .select('id')
    .or('file_name.eq.maya-sample-notes.md,file_name.eq.maya-sample-mindfulness.md,file_name.eq.maya-sample-creativity.md')
    .limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      // Table doesn't exist - this is expected on first run
      console.log('📋 Database tables not yet created - seeding will be skipped until after deployment');
      return true; // Return true to skip seeding gracefully
    }
    console.error('Error checking existing files:', error);
    return false;
  }
  
  return (data && data.length > 0);
}

/**
 * Seed sample files into the database
 */
async function seedSampleFiles() {
  console.log('🌱 Seeding Maya sample files...');
  
  // Check if files already exist
  const samplesExist = await checkExistingSampleFiles();
  if (samplesExist) {
    console.log('📄 Sample files already exist or database not ready, skipping seeding');
    return;
  }
  
  let seededCount = 0;
  
  for (const sampleFile of SAMPLE_FILES) {
    console.log(`📝 Processing ${sampleFile.filename}...`);
    
    try {
      // 1. Insert into user_files
      const { data: fileData, error: fileError } = await supabase
        .from('user_files')
        .insert({
          user_id: SEED_USER_ID,
          file_name: sampleFile.filename,
          file_path: `samples/${sampleFile.filename}`,
          file_size: sampleFile.content.length,
          file_type: 'text/markdown',
          category: sampleFile.category,
          tags: sampleFile.tags,
          summary: sampleFile.summary,
          processing_status: 'completed',
          metadata: {
            originalName: sampleFile.filename,
            uploadedAt: new Date().toISOString(),
            sessionId: 'seed-session',
            isSample: true
          }
        })
        .select()
        .single();
      
      if (fileError) {
        console.error(`Error inserting file ${sampleFile.filename}:`, fileError);
        continue;
      }
      
      const fileId = fileData.id;
      console.log(`  ✅ File record created (ID: ${fileId})`);
      
      // 2. Create chunks and embeddings
      const chunks = chunkText(sampleFile.content, sampleFile.filename);
      console.log(`  📊 Generated ${chunks.length} chunks`);
      
      const chunkInserts = [];
      for (const chunk of chunks) {
        try {
          const embedding = await generateEmbedding(chunk.content);
          chunkInserts.push({
            file_id: fileId,
            chunk_index: chunk.chunkIndex,
            content: chunk.content,
            embedding: JSON.stringify(embedding), // Store as JSON for now
            page_number: chunk.pageNumber,
            section_title: chunk.sectionTitle,
            section_level: chunk.sectionLevel,
            metadata: {
              preview: chunk.preview,
              chunkSize: chunk.content.length
            }
          });
        } catch (embeddingError) {
          console.error(`Error generating embedding for chunk ${chunk.chunkIndex}:`, embeddingError);
        }
      }
      
      if (chunkInserts.length > 0) {
        const { error: chunkError } = await supabase
          .from('file_chunks')
          .insert(chunkInserts);
          
        if (chunkError) {
          console.error(`Error inserting chunks for ${sampleFile.filename}:`, chunkError);
          continue;
        }
        
        console.log(`  🔗 Inserted ${chunkInserts.length} chunks with embeddings`);
      }
      
      // 3. Create a sample citation to demonstrate the feature
      const { error: citationError } = await supabase
        .from('file_citations')
        .insert({
          file_id: fileId,
          cited_at: new Date().toISOString(),
          citation_context: `Sample citation for ${sampleFile.filename}`,
          relevance_score: 0.95,
          page_number: 1,
          section_title: chunks[0]?.sectionTitle,
          snippet: chunks[0]?.preview || sampleFile.summary,
          metadata: {
            demo: true,
            auto_generated: true
          }
        });
      
      if (!citationError) {
        console.log(`  📄 Created sample citation`);
      }
      
      console.log(`✨ Successfully seeded ${sampleFile.filename}`);
      seededCount++;
      
    } catch (error) {
      console.error(`Error processing ${sampleFile.filename}:`, error);
    }
  }
  
  console.log(`\n🎉 Seeding complete! Successfully seeded ${seededCount}/${SAMPLE_FILES.length} files`);
  console.log(`\n📚 Users will now see these files in their Library:`);
  SAMPLE_FILES.forEach(file => {
    console.log(`   📄 ${file.filename} — ✨ Woven into memory`);
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    await seedSampleFiles();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedSampleFiles };