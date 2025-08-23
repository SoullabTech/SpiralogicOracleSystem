import pdf from 'pdf-parse';

/**
 * Extract text content from a PDF buffer
 * @param buffer - The PDF file buffer
 * @param maxPages - Maximum number of pages to process (safety limit)
 * @returns Extracted text content
 */
export async function extractTextFromPDF(
  buffer: Buffer, 
  maxPages: number = 100
): Promise<string> {
  try {
    // Process PDF with page limit
    const data = await pdf(buffer, { 
      max: maxPages,
      // Disable images to speed up processing
      pagerender: undefined
    });
    
    // Clean up extracted text
    const cleanedText = (data.text || '')
      // Remove null characters
      .replace(/\u0000/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive line breaks
      .replace(/(\n\s*){3,}/g, '\n\n')
      .trim();
    
    // Return metadata along with text
    console.log(`Extracted ${data.numpages} pages, ${cleanedText.length} characters from PDF`);
    
    return cleanedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract metadata from PDF
 * @param buffer - The PDF file buffer
 * @returns PDF metadata
 */
export async function extractPDFMetadata(buffer: Buffer): Promise<{
  pages: number;
  info: any;
  metadata: any;
}> {
  try {
    const data = await pdf(buffer, { 
      max: 1, // Just need metadata, not all pages
      pagerender: undefined
    });
    
    return {
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('PDF metadata extraction failed:', error);
    return {
      pages: 0,
      info: {},
      metadata: {}
    };
  }
}

/**
 * Check if a file is likely a PDF based on magic bytes
 * @param buffer - File buffer to check
 * @returns true if file appears to be a PDF
 */
export function isPDFBuffer(buffer: Buffer): boolean {
  // PDF files start with %PDF-
  const header = buffer.slice(0, 5).toString('ascii');
  return header === '%PDF-';
}