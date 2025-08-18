// AIN Provider - Memory storage and contextual retrieval
// Handles conversation memory, user preferences, and contextual information

export interface AINInput {
  text: string;
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
  conversationId: string;
}

export interface AINResponse {
  relevantMemories: Array<{
    id: string;
    content: string;
    timestamp: number;
    relevanceScore: number;
    type: 'conversation' | 'preference' | 'insight' | 'goal';
  }>;
  contextualHints: string[];
  userProfile: {
    preferredElements: string[];
    commonTopics: string[];
    communicationPreferences: any;
  };
  confidence: number;
}

export interface MemoryStoreInput {
  text: string;
  response: string;
  context?: any;
  conversationId: string;
}

// In-memory storage for development (replace with database in production)
interface StoredMemory {
  id: string;
  content: string;
  response?: string;
  timestamp: number;
  conversationId: string;
  type: 'conversation' | 'preference' | 'insight' | 'goal';
  tags: string[];
  elementalContext?: string;
  importance: number; // 1-10 scale
}

// Mock memory store (in production, this would be a database)
const memoryStore: StoredMemory[] = [];
let memoryIdCounter = 1;

// Semantic similarity thresholds
const RELEVANCE_THRESHOLD = 0.3;
const MAX_MEMORIES = 5;

export async function retrieveAINContext(input: AINInput): Promise<AINResponse> {
  const { text, context, conversationId } = input;
  
  // Retrieve relevant memories
  const relevantMemories = await findRelevantMemories(text, conversationId);
  
  // Generate contextual hints
  const contextualHints = generateContextualHints(relevantMemories, context);
  
  // Build user profile from stored memories
  const userProfile = buildUserProfile(conversationId);
  
  // Calculate confidence based on memory quality and quantity
  const confidence = calculateAINConfidence(relevantMemories, text);
  
  return {
    relevantMemories,
    contextualHints,
    userProfile,
    confidence,
  };
}

export async function storeAINMemory(input: MemoryStoreInput): Promise<void> {
  const { text, response, context, conversationId } = input;
  
  // Create memory entry
  const memory: StoredMemory = {
    id: `mem_${memoryIdCounter++}`,
    content: text,
    response,
    timestamp: Date.now(),
    conversationId,
    type: determineMemoryType(text),
    tags: extractTags(text),
    elementalContext: context?.elementFocus,
    importance: calculateImportance(text, response),
  };
  
  // Store memory
  memoryStore.push(memory);
  
  // Clean up old memories if needed (keep only last 100 per conversation)
  await cleanupMemories(conversationId);
  
  console.log(`Stored memory: ${memory.id} (${memory.type})`);
}

async function findRelevantMemories(text: string, conversationId: string): Promise<Array<{
  id: string;
  content: string;
  timestamp: number;
  relevanceScore: number;
  type: 'conversation' | 'preference' | 'insight' | 'goal';
}>> {
  // Get memories for this conversation
  const conversationMemories = memoryStore.filter(m => m.conversationId === conversationId);
  
  // Calculate relevance scores
  const scoredMemories = conversationMemories.map(memory => ({
    id: memory.id,
    content: memory.content,
    timestamp: memory.timestamp,
    type: memory.type,
    relevanceScore: calculateSemanticSimilarity(text, memory.content) * 
                   (memory.importance / 10) * 
                   calculateRecencyBoost(memory.timestamp),
  }));
  
  // Return top relevant memories above threshold
  return scoredMemories
    .filter(m => m.relevanceScore > RELEVANCE_THRESHOLD)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_MEMORIES);
}

function calculateSemanticSimilarity(text1: string, text2: string): number {
  // Simple keyword-based similarity (in production, use embeddings)
  const words1 = extractKeywords(text1.toLowerCase());
  const words2 = extractKeywords(text2.toLowerCase());
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = Array.from(new Set([...words1, ...words2]));
  
  return intersection.length / union.length;
}

function extractKeywords(text: string): string[] {
  // Remove stop words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);
  
  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20); // Limit keywords
}

function calculateRecencyBoost(timestamp: number): number {
  const now = Date.now();
  const daysSince = (now - timestamp) / (1000 * 60 * 60 * 24);
  
  // Decay over time, but not too aggressively
  if (daysSince < 1) return 1.0;
  if (daysSince < 7) return 0.9;
  if (daysSince < 30) return 0.7;
  if (daysSince < 90) return 0.5;
  return 0.3;
}

function generateContextualHints(
  memories: Array<{ content: string; type: string }>,
  context?: any
): string[] {
  const hints: string[] = [];
  
  // Add hints based on memory types
  const conversationMemories = memories.filter(m => m.type === 'conversation');
  const preferenceMemories = memories.filter(m => m.type === 'preference');
  const insightMemories = memories.filter(m => m.type === 'insight');
  const goalMemories = memories.filter(m => m.type === 'goal');
  
  if (conversationMemories.length > 0) {
    hints.push("Continuing our previous conversation");
  }
  
  if (preferenceMemories.length > 0) {
    hints.push("Based on your stated preferences");
  }
  
  if (insightMemories.length > 0) {
    hints.push("Building on your past insights");
  }
  
  if (goalMemories.length > 0) {
    hints.push("Considering your goals and aspirations");
  }
  
  // Add context-specific hints
  if (context?.currentPage) {
    hints.push(`Contextual to ${context.currentPage} page`);
  }
  
  if (context?.elementFocus) {
    hints.push(`Aligned with ${context.elementFocus} energy`);
  }
  
  return hints;
}

function buildUserProfile(conversationId: string): {
  preferredElements: string[];
  commonTopics: string[];
  communicationPreferences: any;
} {
  const userMemories = memoryStore.filter(m => m.conversationId === conversationId);
  
  // Extract preferred elements from memory tags
  const elementCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};
  
  userMemories.forEach(memory => {
    if (memory.elementalContext) {
      elementCounts[memory.elementalContext] = (elementCounts[memory.elementalContext] || 0) + 1;
    }
    
    memory.tags.forEach(tag => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });
  });
  
  const preferredElements = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([element]) => element);
  
  const commonTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);
  
  // Analyze communication preferences from memory patterns
  const communicationPreferences = {
    responseLength: analyzePreferredResponseLength(userMemories),
    formality: analyzePreferredFormality(userMemories),
    depth: analyzePreferredDepth(userMemories),
  };
  
  return {
    preferredElements,
    commonTopics,
    communicationPreferences,
  };
}

function determineMemoryType(text: string): 'conversation' | 'preference' | 'insight' | 'goal' {
  const lowerText = text.toLowerCase();
  
  // Preference indicators
  if (lowerText.includes('prefer') || lowerText.includes('like') || lowerText.includes('enjoy')) {
    return 'preference';
  }
  
  // Goal indicators
  if (lowerText.includes('goal') || lowerText.includes('want to') || lowerText.includes('plan to')) {
    return 'goal';
  }
  
  // Insight indicators
  if (lowerText.includes('realize') || lowerText.includes('understand') || lowerText.includes('insight')) {
    return 'insight';
  }
  
  // Default to conversation
  return 'conversation';
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  
  // Extract elemental words
  const elements = ['fire', 'water', 'earth', 'air', 'aether'];
  elements.forEach(element => {
    if (text.toLowerCase().includes(element)) {
      tags.push(element);
    }
  });
  
  // Extract topic words
  const topics = [
    'relationship', 'career', 'spiritual', 'growth', 'decision',
    'oracle', 'journal', 'meditation', 'healing', 'balance',
    'purpose', 'meaning', 'wisdom', 'guidance', 'transformation'
  ];
  
  topics.forEach(topic => {
    if (text.toLowerCase().includes(topic)) {
      tags.push(topic);
    }
  });
  
  return Array.from(new Set(tags)); // Remove duplicates
}

function calculateImportance(text: string, response?: string): number {
  let importance = 5; // Base importance
  
  // Longer interactions tend to be more important
  if (text.length > 100) importance += 1;
  if (text.length > 200) importance += 1;
  
  // Emotional content is important
  const emotionalWords = text.match(/\b(love|hate|fear|joy|anger|peace|excited|worried)\b/gi) || [];
  importance += Math.min(emotionalWords.length, 2);
  
  // Questions about deep topics are important
  if (text.includes('?') && 
      /\b(purpose|meaning|life|death|love|spiritual|soul)\b/i.test(text)) {
    importance += 2;
  }
  
  // Oracle consultations are important
  if (text.toLowerCase().includes('oracle') || 
      (response && response.length > 200)) {
    importance += 1;
  }
  
  return Math.min(importance, 10);
}

function analyzePreferredResponseLength(memories: StoredMemory[]): 'short' | 'medium' | 'long' {
  const responseLengths = memories
    .filter(m => m.response)
    .map(m => m.response!.length);
  
  if (responseLengths.length === 0) return 'medium';
  
  const avgLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;
  
  if (avgLength < 100) return 'short';
  if (avgLength < 300) return 'medium';
  return 'long';
}

function analyzePreferredFormality(memories: StoredMemory[]): 'casual' | 'professional' | 'mystical' {
  const formalityScores = { casual: 0, professional: 0, mystical: 0 };
  
  memories.forEach(memory => {
    const content = memory.content.toLowerCase();
    
    // Casual indicators
    if (/\b(yeah|ok|cool|awesome|totally)\b/.test(content)) {
      formalityScores.casual++;
    }
    
    // Professional indicators
    if (/\b(analyze|evaluate|implement|strategy)\b/.test(content)) {
      formalityScores.professional++;
    }
    
    // Mystical indicators
    if (/\b(spiritual|sacred|divine|mystical|soul)\b/.test(content)) {
      formalityScores.mystical++;
    }
  });
  
  const topFormality = Object.entries(formalityScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return (topFormality?.[0] as any) || 'casual';
}

function analyzePreferredDepth(memories: StoredMemory[]): 'surface' | 'moderate' | 'deep' {
  const deepTopics = memories.filter(m => 
    /\b(purpose|meaning|spiritual|soul|consciousness|wisdom)\b/i.test(m.content)
  ).length;
  
  const totalMemories = memories.length;
  if (totalMemories === 0) return 'moderate';
  
  const deepRatio = deepTopics / totalMemories;
  
  if (deepRatio > 0.3) return 'deep';
  if (deepRatio > 0.1) return 'moderate';
  return 'surface';
}

async function cleanupMemories(conversationId: string): Promise<void> {
  const conversationMemories = memoryStore.filter(m => m.conversationId === conversationId);
  
  if (conversationMemories.length > 100) {
    // Keep only the most recent and most important memories
    const sortedMemories = conversationMemories
      .sort((a, b) => {
        const aScore = a.importance + calculateRecencyBoost(a.timestamp) * 10;
        const bScore = b.importance + calculateRecencyBoost(b.timestamp) * 10;
        return bScore - aScore;
      })
      .slice(0, 100);
    
    // Remove old memories from store
    const memoryIds = new Set(sortedMemories.map(m => m.id));
    for (let i = memoryStore.length - 1; i >= 0; i--) {
      if (memoryStore[i].conversationId === conversationId && 
          !memoryIds.has(memoryStore[i].id)) {
        memoryStore.splice(i, 1);
      }
    }
  }
}

function calculateAINConfidence(
  memories: Array<{ relevanceScore: number }>,
  text: string
): number {
  let confidence = 0.3; // Base confidence
  
  // More relevant memories = higher confidence
  const avgRelevance = memories.length > 0 
    ? memories.reduce((sum, m) => sum + m.relevanceScore, 0) / memories.length
    : 0;
  
  confidence += avgRelevance * 0.4;
  
  // More memories = higher confidence (up to a point)
  confidence += Math.min(memories.length * 0.05, 0.2);
  
  // Longer queries tend to have better context matching
  if (text.length > 50) confidence += 0.1;
  
  return Math.min(confidence, 0.8); // Cap at 80%
}