import OpenAI from 'openai';

const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate a concise, meaningful description of an image
 * @param publicUrl - Public URL of the image
 * @returns Description of the image content and themes
 */
export async function describeImage(publicUrl: string): Promise<string> {
  try {
    const model = process.env.VISION_MODEL ?? 'gpt-4o-mini';
    
    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Give a concise, vivid 1-3 sentence description of this image. Focus on the main subject, mood, colors, and any symbolic or thematic elements. Be descriptive but brief.' 
          },
          { 
            type: 'image_url', 
            image_url: { 
              url: publicUrl,
              detail: 'auto' 
            } 
          }
        ]
      }],
      max_tokens: 200,
      temperature: 0.5
    });
    
    const description = response.choices[0]?.message?.content?.trim() ?? '';
    console.log(`Image described: ${description.slice(0, 100)}...`);
    
    return description;
  } catch (error) {
    console.error('Image description failed:', error);
    throw new Error(`Failed to describe image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract visible text from an image (soft OCR)
 * @param publicUrl - Public URL of the image
 * @returns Extracted text or empty string if none found
 */
export async function softOCR(publicUrl: string): Promise<string> {
  try {
    const model = process.env.VISION_MODEL ?? 'gpt-4o-mini';
    
    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Extract any visible text from this image. Include signs, labels, handwriting, or printed text. If there is no readable text, respond with only "—". Be precise and include only actual text visible in the image.' 
          },
          { 
            type: 'image_url', 
            image_url: { 
              url: publicUrl,
              detail: 'high' // Higher detail for text extraction
            } 
          }
        ]
      }],
      max_tokens: 500,
      temperature: 0.0 // Zero temperature for accuracy
    });
    
    const text = response.choices[0]?.message?.content?.trim() ?? '';
    
    // Return empty string if no text found
    if (text === '—' || text === '-' || text.toLowerCase() === 'none') {
      return '';
    }
    
    console.log(`OCR extracted ${text.length} characters from image`);
    return text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    // Non-critical failure, return empty string
    return '';
  }
}

/**
 * Analyze image for specific attributes (faces, complexity, etc.)
 * @param publicUrl - Public URL of the image
 * @returns Analysis results
 */
export async function analyzeImage(publicUrl: string): Promise<{
  hasFaces: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  primaryColors: string[];
  mood: string;
}> {
  try {
    const model = process.env.VISION_MODEL ?? 'gpt-4o-mini';
    
    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: `Analyze this image and provide a JSON response with these exact fields:
{
  "hasFaces": boolean (true if human faces are visible),
  "complexity": "simple" | "moderate" | "complex" (visual complexity),
  "primaryColors": ["color1", "color2", "color3"] (3 dominant colors),
  "mood": "word" (single word describing the emotional tone)
}` 
          },
          { 
            type: 'image_url', 
            image_url: { 
              url: publicUrl,
              detail: 'auto'
            } 
          }
        ]
      }],
      max_tokens: 150,
      temperature: 0.0,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');
    
    return {
      hasFaces: result.hasFaces ?? false,
      complexity: result.complexity ?? 'moderate',
      primaryColors: result.primaryColors ?? [],
      mood: result.mood ?? 'neutral'
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    // Return defaults on failure
    return {
      hasFaces: false,
      complexity: 'moderate',
      primaryColors: [],
      mood: 'neutral'
    };
  }
}