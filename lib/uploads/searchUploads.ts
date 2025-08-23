import { createClient } from '@supabase/supabase-js';
import { embedText } from './embeddings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export interface SearchResult {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  // Matched content
  matched_text: string;
  match_score: number;
  // Context around match
  context_before?: string;
  context_after?: string;
  // Metadata
  start_position?: number;
  end_position?: number;
  quote_number?: number;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  fileTypes?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  conversationId?: string;
}

/**
 * Search through uploads using semantic embeddings first, then fallback to text search
 */
export async function searchUploads(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    minScore = 0.7,
    fileTypes,
    dateRange,
    conversationId
  } = options;

  try {
    // Try semantic search first if embeddings are available
    const semanticResults = await semanticSearchUploads(userId, query, limit);
    if (semanticResults.length > 0) {
      return semanticResults;
    }

    // Fallback to text-based search
    return await textSearchUploads(userId, query, options);

  } catch (error) {
    console.error('Search uploads failed:', error);
    // Fallback to text search on error
    try {
      return await textSearchUploads(userId, query, options);
    } catch {
      return [];
    }
  }
}

/**
 * Semantic search using vector embeddings
 */
export async function semanticSearchUploads(
  userId: string,
  query: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embedText(query);
    
    // Use the database function for semantic search
    const { data, error } = await supabaseServer
      .rpc('search_uploads_semantic', {
        p_user_id: userId,
        p_query_embedding: `[${queryEmbedding.join(',')}]`,
        p_match_threshold: threshold,
        p_limit: limit
      });

    if (error) {
      console.error('Semantic search failed:', error);
      return [];
    }

    // Transform results to SearchResult format
    return (data || []).map((item: any) => ({
      id: item.id,
      file_name: item.file_name,
      file_type: item.file_type,
      created_at: item.created_at,
      matched_text: item.text_snippet || '',
      match_score: item.similarity,
      context_before: '',
      context_after: ''
    }));

  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

/**
 * Text-based search as fallback
 */
async function textSearchUploads(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    minScore = 0.3,
    fileTypes,
    dateRange,
    conversationId
  } = options;

  // Build query with filters
  let dbQuery = supabaseServer
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  // Apply filters
  if (conversationId) {
    dbQuery = dbQuery.eq('conversation_id', conversationId);
  }

  if (fileTypes && fileTypes.length > 0) {
    dbQuery = dbQuery.in('file_type', fileTypes);
  }

  if (dateRange?.start) {
    dbQuery = dbQuery.gte('created_at', dateRange.start.toISOString());
  }

  if (dateRange?.end) {
    dbQuery = dbQuery.lte('created_at', dateRange.end.toISOString());
  }

  const { data: uploads, error } = await dbQuery;

  if (error) {
    console.error('Text search failed:', error);
    return [];
  }

  // Search through all text content
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  for (const upload of uploads || []) {
    const searchableContent = [
      upload.text_content || '',
      upload.image_caption || '',
      upload.ocr_text || '',
      upload.transcript?.text || '',
      upload.summary || ''
    ].join(' ').toLowerCase();

    if (!searchableContent) continue;

    // Simple scoring based on word matches
    let score = 0;
    const matches: { text: string; position: number }[] = [];

    // Check for exact phrase match
    if (searchableContent.includes(queryLower)) {
      score += 1.0;
      const position = searchableContent.indexOf(queryLower);
      matches.push({
        text: searchableContent.substring(position, position + queryLower.length),
        position
      });
    }

    // Check for individual word matches
    for (const word of queryWords) {
      const wordCount = (searchableContent.match(new RegExp(word, 'g')) || []).length;
      score += wordCount * 0.2;
    }

    // Only include if score meets threshold
    if (score >= minScore) {
      // Find the best matching excerpt
      let matchedText = '';
      let contextBefore = '';
      let contextAfter = '';

      if (matches.length > 0) {
        const match = matches[0];
        const fullText = upload.text_content || upload.transcript?.text || upload.summary || '';
        const start = Math.max(0, match.position - 150);
        const end = Math.min(fullText.length, match.position + 150);
        
        matchedText = fullText.substring(match.position, match.position + query.length);
        contextBefore = fullText.substring(start, match.position);
        contextAfter = fullText.substring(match.position + query.length, end);
      } else {
        // Use first 200 chars as excerpt if no exact match
        const fullText = upload.text_content || upload.transcript?.text || upload.summary || '';
        matchedText = fullText.substring(0, 200);
      }

      results.push({
        id: upload.id,
        file_name: upload.file_name,
        file_type: upload.file_type,
        created_at: upload.created_at,
        matched_text: matchedText,
        match_score: score,
        context_before: contextBefore,
        context_after: contextAfter
      });
    }
  }

  // Sort by score and limit
  return results
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);
}

/**
 * Search for specific quotes or phrases in transcripts
 */
export async function findQuotesInTranscripts(
  userId: string,
  searchPhrase: string,
  options: { 
    fuzzy?: boolean; 
    caseSensitive?: boolean;
    limit?: number;
  } = {}
): Promise<Array<{
  uploadId: string;
  fileName: string;
  quote: string;
  context: string;
  timestamp?: string;
}>> {
  const { fuzzy = true, caseSensitive = false, limit = 10 } = options;

  try {
    const { data: uploads, error } = await supabaseServer
      .from('uploads')
      .select('id, file_name, transcript, created_at')
      .eq('user_id', userId)
      .eq('status', 'ready')
      .not('transcript', 'is', null)
      .order('created_at', { ascending: false });

    if (error || !uploads) {
      return [];
    }

    const results: any[] = [];
    const searchPattern = caseSensitive ? searchPhrase : searchPhrase.toLowerCase();

    for (const upload of uploads) {
      const transcriptText = upload.transcript?.text || '';
      const searchText = caseSensitive ? transcriptText : transcriptText.toLowerCase();

      if (!searchText) continue;

      // Find all occurrences
      let position = 0;
      while (position < searchText.length) {
        let foundIndex = -1;

        if (fuzzy) {
          // Fuzzy search: look for all words in order but not necessarily adjacent
          const words = searchPattern.split(/\s+/);
          let currentPos = position;
          let matched = true;

          for (const word of words) {
            const wordIndex = searchText.indexOf(word, currentPos);
            if (wordIndex === -1) {
              matched = false;
              break;
            }
            if (foundIndex === -1) foundIndex = wordIndex;
            currentPos = wordIndex + word.length;
          }

          if (!matched) break;
        } else {
          // Exact phrase search
          foundIndex = searchText.indexOf(searchPattern, position);
          if (foundIndex === -1) break;
        }

        // Extract quote with context
        const contextRadius = 150;
        const start = Math.max(0, foundIndex - contextRadius);
        const end = Math.min(transcriptText.length, foundIndex + searchPhrase.length + contextRadius);
        
        const quote = transcriptText.substring(foundIndex, foundIndex + searchPhrase.length);
        const context = transcriptText.substring(start, end);

        results.push({
          uploadId: upload.id,
          fileName: upload.file_name,
          quote,
          context,
          timestamp: upload.created_at
        });

        position = foundIndex + 1; // Move past this match
        
        if (results.length >= limit) break;
      }

      if (results.length >= limit) break;
    }

    return results.slice(0, limit);

  } catch (error) {
    console.error('Quote search failed:', error);
    return [];
  }
}

/**
 * Get upload content by time range with semantic grouping
 */
export async function getUploadsByTimeAndTheme(
  userId: string,
  timeRange: 'today' | 'week' | 'month' | 'all',
  theme?: string
): Promise<Map<string, SearchResult[]>> {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(0); // Beginning of time
  }

  const results = await searchUploads(userId, theme || '', {
    dateRange: { start: startDate },
    limit: 50
  });

  // Group by date
  const grouped = new Map<string, SearchResult[]>();
  
  for (const result of results) {
    const date = new Date(result.created_at).toLocaleDateString();
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(result);
  }

  return grouped;
}


/**
 * Format search results for Oracle context
 */
export function formatSearchResultsForContext(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const sections = results.map((result, index) => {
    const lines = [
      `### Match ${index + 1}: ${result.file_name}`,
      `Score: ${result.match_score.toFixed(2)} | ${new Date(result.created_at).toLocaleDateString()}`,
    ];

    if (result.context_before || result.context_after) {
      lines.push(`"...${result.context_before}**${result.matched_text}**${result.context_after}..."`);
    } else {
      lines.push(`"${result.matched_text}"`);
    }

    return lines.join('\n');
  });

  return [
    '## Upload Search Results',
    `Found ${results.length} matches for your search:`,
    '',
    ...sections
  ].join('\n');
}