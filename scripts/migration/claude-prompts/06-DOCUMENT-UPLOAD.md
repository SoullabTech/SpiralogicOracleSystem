# 📄 Prompt 6: Document Upload Integration

## Claude Code Prompt

```
You are Claude Code. Implement document upload functionality that mirrors ChatGPT/Claude's drag-and-drop interface while mapping uploads to the sacred facet system.

## Task:

1. Create upload component in conversation area:
   ```typescript
   // /components/sacred/DocumentUpload.tsx
   interface DocumentUploadProps {
     onUpload: (files: File[]) => void;
     maxSize?: number; // MB
     allowedTypes?: string[];
     className?: string;
   }
   
   Features:
   - Drag-and-drop zone over entire conversation area
   - Click to browse files
   - Multiple file support
   - Visual feedback during drag
   - File preview cards
   - Upload progress indicator
   - Remove uploaded files
   ```

2. Integrate with OracleConversation.tsx:
   ```typescript
   // Add to OracleConversation.tsx
   const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
   
   return (
     <div className="relative">
       <DocumentUpload 
         onUpload={handleFileUpload}
         className="absolute inset-0 pointer-events-none"
       />
       {/* Existing conversation UI */}
       {uploadedFiles.length > 0 && (
         <div className="flex gap-2 p-4 border-t">
           {uploadedFiles.map(file => (
             <FilePreviewCard 
               key={file.name}
               file={file}
               onRemove={() => removeFile(file)}
             />
           ))}
         </div>
       )}
     </div>
   );
   ```

3. File processing pipeline:
   ```typescript
   // /lib/oracle/document-processor.ts
   interface ProcessedDocument {
     url: string;
     type: string;
     content: string;
     metadata: {
       title?: string;
       author?: string;
       created?: Date;
     };
     extraction: {
       themes: string[];
       emotions: string[];
       facets: string[];
       coherenceContribution: number;
     };
   }
   
   export async function processDocument(file: File): Promise<ProcessedDocument> {
     // 1. Upload to Supabase storage
     const url = await uploadToStorage(file);
     
     // 2. Extract text content
     const content = await extractContent(file);
     
     // 3. Analyze with Claude
     const analysis = await analyzeWithClaude(content);
     
     // 4. Map to facets
     const facets = mapToFacets(analysis);
     
     // 5. Calculate coherence contribution
     const coherence = calculateDocumentCoherence(analysis);
     
     return {
       url,
       type: file.type,
       content: content.slice(0, 1000), // Preview
       metadata: extractMetadata(file),
       extraction: {
         themes: analysis.themes,
         emotions: analysis.emotions,
         facets,
         coherenceContribution: coherence
       }
     };
   }
   ```

4. Update Oracle API to accept documents:
   ```typescript
   // Update /app/api/oracle/route.ts
   interface OracleRequest {
     // ... existing fields
     documents?: Array<{
       url: string;
       content: string;
       extraction: DocumentExtraction;
     }>;
   }
   
   // In processing:
   if (body.documents?.length) {
     // Weave document themes into oracle response
     const documentContext = synthesizeDocuments(body.documents);
     cascadeInput.documentContext = documentContext;
     
     // Adjust coherence based on document alignment
     coherence += calculateDocumentCoherence(body.documents);
   }
   ```

5. Visual feedback in Holoflower:
   ```typescript
   // When documents uploaded, show as orbital elements
   interface DocumentOrbitProps {
     documents: ProcessedDocument[];
     centerX: number;
     centerY: number;
   }
   
   // Render small glyphs orbiting the Holoflower
   // Color-coded by dominant facet
   // Pulse when referenced in oracle response
   ```

6. Timeline integration:
   ```typescript
   // Show uploaded documents in session timeline
   interface TimelineEntry {
     type: 'voice' | 'journal' | 'document';
     timestamp: Date;
     content: string;
     facets: string[];
     documentUrl?: string;
   }
   
   // Mini document icons in timeline
   // Click to expand and see extraction
   ```

7. Supported file types:
   - Text: .txt, .md, .rtf
   - Documents: .pdf, .docx, .odt
   - Code: .js, .ts, .py, .java
   - Data: .json, .csv, .xml
   - Images: .jpg, .png (for OCR)

8. Privacy & Security:
   - Client-side file validation
   - Max file size: 10MB
   - Virus scanning via Supabase
   - Encrypted storage
   - Auto-delete after 30 days
   - No permanent storage of content

## Deliver:

1. DocumentUpload.tsx component with drag-drop
2. Document processing pipeline
3. Oracle API updates for document context
4. Visual integration in Holoflower
5. Timeline display of uploaded documents
6. File type handlers for each format
7. Security & privacy implementation
```

## Expected Implementation:

```typescript
// /components/sacred/DocumentUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
}

export function DocumentUpload({
  onUpload,
  maxSize = 10, // MB
  allowedTypes = ['.pdf', '.txt', '.md', '.docx'],
  className = ''
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    onUpload(acceptedFiles);
  }, [onUpload]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    maxSize: maxSize * 1024 * 1024,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });
  
  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f !== file));
  };
  
  return (
    <>
      {/* Invisible drop zone over entire area */}
      <div
        {...getRootProps()}
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
      >
        <input {...getInputProps()} />
        
        {/* Drop overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sacred/10 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-black/80 rounded-2xl p-8 border border-sacred/30">
                <Upload className="w-16 h-16 text-sacred mx-auto mb-4" />
                <p className="text-white text-lg">Drop files to upload</p>
                <p className="text-white/60 text-sm mt-2">
                  PDF, TXT, MD, DOCX • Max {maxSize}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* File preview cards */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {uploadedFiles.map((file, i) => (
            <motion.div
              key={file.name + i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 bg-sacred/10 rounded-lg p-3 border border-sacred/20"
            >
              <div className="flex items-start gap-2">
                {file.type.includes('image') ? (
                  <Image className="w-5 h-5 text-sacred" />
                ) : (
                  <FileText className="w-5 h-5 text-sacred" />
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate max-w-[150px]">
                    {file.name}
                  </p>
                  <p className="text-white/40 text-xs">
                    {(file.size / 1024).toFixed(1)}KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="ml-2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

// /lib/oracle/document-processor.ts
import { createClient } from '@supabase/supabase-js';

export async function processDocument(file: File) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Upload to storage
  const fileName = `${Date.now()}_${file.name}`;
  const { data: uploadData, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // Extract content based on type
  let content = '';
  if (file.type === 'text/plain' || file.name.endsWith('.md')) {
    content = await file.text();
  } else if (file.type === 'application/pdf') {
    // Use PDF.js or similar
    content = await extractPDFContent(file);
  }
  
  // Analyze with sacred lens
  const analysis = await analyzeDocument(content);
  
  // Map to facets
  const facetMapping = mapContentToFacets(analysis);
  
  return {
    url: uploadData.path,
    type: file.type,
    content: content.slice(0, 1000),
    extraction: {
      themes: analysis.themes,
      emotions: analysis.emotions,
      facets: facetMapping.facets,
      coherenceContribution: facetMapping.coherence
    }
  };
}

async function mapContentToFacets(analysis: any) {
  const facetKeywords = {
    'Presence': ['awareness', 'mindful', 'present', 'here', 'now'],
    'Wisdom': ['insight', 'understanding', 'knowledge', 'truth'],
    'Creation': ['build', 'make', 'generate', 'birth', 'new'],
    'Destruction': ['end', 'release', 'dissolve', 'break'],
    'Order': ['structure', 'organize', 'system', 'pattern'],
    'Chaos': ['random', 'wild', 'unknown', 'mystery'],
    'Power': ['strength', 'force', 'will', 'agency'],
    'Vulnerability': ['open', 'soft', 'tender', 'exposed'],
    'Connection': ['together', 'relate', 'bond', 'unite'],
    'Solitude': ['alone', 'inner', 'self', 'quiet'],
    'Joy': ['happy', 'light', 'play', 'celebrate'],
    'Shadow': ['dark', 'hidden', 'unconscious', 'denied']
  };
  
  const detectedFacets = [];
  let coherenceScore = 0;
  
  // Map themes to facets
  for (const [facet, keywords] of Object.entries(facetKeywords)) {
    const matches = keywords.filter(kw => 
      analysis.content.toLowerCase().includes(kw)
    );
    if (matches.length > 0) {
      detectedFacets.push(facet);
      coherenceScore += matches.length * 0.1;
    }
  }
  
  return {
    facets: detectedFacets,
    coherence: Math.min(coherenceScore, 1)
  };
}
```