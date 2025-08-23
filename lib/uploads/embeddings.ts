import OpenAI from 'openai';

const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate embeddings for text content using OpenAI's embedding API
 * @param text - Text to embed
 * @param model - Embedding model to use
 * @returns Vector embedding as number array
 */
export async function embedText(
  text: string,
  model: string = process.env.EMBEDDINGS_MODEL ?? 'text-embedding-3-large'
): Promise<number[]> {
  try {
    // Clean and truncate text to safe limits
    const cleanText = text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim()
      .slice(0, 8000);      // OpenAI embedding limit is ~8k tokens
    
    if (cleanText.length === 0) {
      throw new Error('Empty text provided for embedding');
    }
    
    const response = await client.embeddings.create({
      model,
      input: cleanText,
      encoding_format: 'float'
    });
    
    const embedding = response.data[0]?.embedding;
    if (!embedding || embedding.length === 0) {
      throw new Error('No embedding returned from API');
    }
    
    console.log(`Generated ${embedding.length}-dimensional embedding for ${cleanText.length} characters`);
    return embedding;
  } catch (error) {
    console.error('Text embedding failed:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @param model - Embedding model to use
 * @returns Array of embeddings
 */
export async function embedTexts(
  texts: string[],
  model: string = process.env.EMBEDDINGS_MODEL ?? 'text-embedding-3-large'
): Promise<number[][]> {
  try {
    if (texts.length === 0) {
      return [];
    }
    
    // Clean all texts
    const cleanTexts = texts.map(text => 
      text.replace(/\s+/g, ' ').trim().slice(0, 8000)
    ).filter(text => text.length > 0);
    
    if (cleanTexts.length === 0) {
      throw new Error('No valid texts provided for embedding');
    }
    
    const response = await client.embeddings.create({
      model,
      input: cleanTexts,
      encoding_format: 'float'
    });
    
    const embeddings = response.data.map(item => item.embedding);
    console.log(`Generated ${embeddings.length} embeddings`);
    
    return embeddings;
  } catch (error) {
    console.error('Batch embedding failed:', error);
    throw new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * @param embeddingA - First embedding
 * @param embeddingB - Second embedding
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same dimension');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    normA += embeddingA[i] * embeddingA[i];
    normB += embeddingB[i] * embeddingB[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Find the most similar embeddings from a list
 * @param queryEmbedding - Query embedding to compare against
 * @param embeddings - List of embeddings with metadata
 * @param topK - Number of top results to return
 * @returns Sorted list of most similar items
 */
export function findMostSimilar<T>(
  queryEmbedding: number[],
  embeddings: Array<{ embedding: number[]; item: T }>,
  topK: number = 5
): Array<{ similarity: number; item: T }> {
  const similarities = embeddings.map(({ embedding, item }) => ({
    similarity: cosineSimilarity(queryEmbedding, embedding),
    item
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Prepare text content for embedding by combining multiple fields
 * @param fields - Object with text fields to combine
 * @returns Combined text ready for embedding
 */
export function prepareTextForEmbedding(fields: {
  title?: string;
  content?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}): string {
  const parts: string[] = [];
  
  // Add title with extra weight
  if (fields.title) {
    parts.push(`Title: ${fields.title}`);
  }
  
  // Add main content
  if (fields.content) {
    parts.push(`Content: ${fields.content}`);
  }
  
  // Add description
  if (fields.description) {
    parts.push(`Description: ${fields.description}`);
  }
  
  // Add tags
  if (fields.tags && fields.tags.length > 0) {
    parts.push(`Tags: ${fields.tags.join(', ')}`);
  }
  
  // Add any other string fields
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && 
        !['title', 'content', 'description'].includes(key) &&
        value.trim().length > 0) {
      parts.push(`${key}: ${value}`);
    }
  }
  
  return parts.join('\n').trim();
}

/**
 * Get embedding model dimensions
 * @param model - Model name
 * @returns Number of dimensions
 */
export function getEmbeddingDimensions(model: string): number {
  const dimensions: Record<string, number> = {
    'text-embedding-3-large': 3072,
    'text-embedding-3-small': 1536,
    'text-embedding-ada-002': 1536
  };
  
  return dimensions[model] ?? 1536; // Default to 1536
}