import { ContextPack } from '../context/buildContext';
import { TrainingInteraction, SpiralogicEvaluation } from './chatgptOracle2Integration';

export interface CollectionConfig {
  enabled: boolean;
  samplingRate: number;           // 0.0 - 1.0, what fraction of interactions to collect
  includeAnonymous: boolean;      // Whether to collect from anonymous users
  privacyMode: 'full' | 'anonymized' | 'metadata_only';
  qualityThreshold: number;       // Only collect interactions above this quality
  storageBackend: 'supabase' | 'local' | 'encrypted_file';
}

export interface TrainingDataPoint {
  id: string;
  timestamp: number;
  
  // Input data
  userInput: string;
  context: ContextPack;
  conversationId: string;
  userId?: string; // Optional for privacy
  
  // Response data
  claudeResponse: string;
  sacredSynthesis?: string;
  mayaApplication?: string;
  finalResponse: string;
  
  // System state
  micropsiModulation: any;
  validationResult: any;
  processingTime: number;
  providers: string[];
  
  // Quality indicators
  userFeedback?: {
    rating: number;
    helpful: boolean;
    comments?: string;
  };
  systemQuality?: {
    coherence: number;
    relevance: number;
    spiralogicAlignment: number;
  };
  
  // Metadata
  source: 'voice' | 'text';
  sessionLength: number;
  isFirstTurn: boolean;
  
  // Privacy flags
  anonymized: boolean;
  consentGiven: boolean;
  retentionExpiry?: number;
}

export class TrainingDataCollector {
  private config: CollectionConfig;
  private buffer: TrainingDataPoint[] = [];
  private bufferSize = 100;

  constructor(config: CollectionConfig) {
    this.config = config;
    this.setupPeriodicFlush();
  }

  async collectInteraction(data: {
    userInput: string;
    context: ContextPack;
    response: string;
    metadata: any;
    conversationId: string;
    userId?: string;
    source: 'voice' | 'text';
  }): Promise<boolean> {
    // Check if collection is enabled and should sample this interaction
    if (!this.config.enabled || Math.random() > this.config.samplingRate) {
      return false;
    }

    // Skip anonymous users if not configured to include them
    if (!data.userId && !this.config.includeAnonymous) {
      return false;
    }

    try {
      const dataPoint = await this.createTrainingDataPoint(data);
      
      // Apply privacy filters
      const processedDataPoint = this.applyPrivacyFilters(dataPoint);
      
      // Add to buffer
      this.buffer.push(processedDataPoint);
      
      // Flush if buffer is full
      if (this.buffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }

      return true;
    } catch (error) {
      console.error('Failed to collect training data:', error);
      return false;
    }
  }

  private async createTrainingDataPoint(data: any): Promise<TrainingDataPoint> {
    const id = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      timestamp: Date.now(),
      userInput: data.userInput,
      context: data.context,
      conversationId: data.conversationId,
      userId: data.userId,
      claudeResponse: data.metadata.claudeResponse || '',
      sacredSynthesis: data.metadata.sacredSynthesis,
      mayaApplication: data.metadata.mayaApplication,
      finalResponse: data.response,
      micropsiModulation: data.metadata.micropsi,
      validationResult: data.metadata.validation,
      processingTime: data.metadata.processingTime || 0,
      providers: data.metadata.providers || [],
      source: data.source,
      sessionLength: await this.getSessionLength(data.conversationId),
      isFirstTurn: this.isFirstTurn(data.conversationId),
      anonymized: this.config.privacyMode !== 'full',
      consentGiven: await this.checkUserConsent(data.userId),
      retentionExpiry: this.calculateRetentionExpiry()
    };
  }

  private applyPrivacyFilters(dataPoint: TrainingDataPoint): TrainingDataPoint {
    const filtered = { ...dataPoint };

    switch (this.config.privacyMode) {
      case 'anonymized':
        // Remove direct identifiers but keep interaction data
        filtered.userId = undefined;
        filtered.conversationId = this.hashConversationId(dataPoint.conversationId);
        filtered.anonymized = true;
        break;
        
      case 'metadata_only':
        // Keep only system metadata, remove user content
        filtered.userInput = '[REDACTED]';
        filtered.claudeResponse = '[REDACTED]';
        filtered.finalResponse = '[REDACTED]';
        filtered.userId = undefined;
        filtered.anonymized = true;
        break;
        
      case 'full':
        // Keep all data (requires explicit consent)
        if (!dataPoint.consentGiven) {
          throw new Error('Full data collection requires user consent');
        }
        break;
    }

    return filtered;
  }

  async flushBuffer(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      await this.persistTrainingData(this.buffer);
      this.buffer = [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[training] Flushed ${this.buffer.length} training data points`);
      }
    } catch (error) {
      console.error('Failed to flush training data:', error);
      // Keep data in buffer for retry
    }
  }

  private async persistTrainingData(dataPoints: TrainingDataPoint[]): Promise<void> {
    switch (this.config.storageBackend) {
      case 'supabase':
        await this.persistToSupabase(dataPoints);
        break;
      case 'local':
        await this.persistToLocal(dataPoints);
        break;
      case 'encrypted_file':
        await this.persistToEncryptedFile(dataPoints);
        break;
      default:
        throw new Error(`Unknown storage backend: ${this.config.storageBackend}`);
    }
  }

  private async persistToSupabase(dataPoints: TrainingDataPoint[]): Promise<void> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('training_data')
        .insert(dataPoints);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Supabase persistence failed:', error);
      throw error;
    }
  }

  private async persistToLocal(dataPoints: TrainingDataPoint[]): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data', 'training');
    const filePath = path.join(dataDir, `training_${Date.now()}.json`);
    
    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(filePath, JSON.stringify(dataPoints, null, 2));
  }

  private async persistToEncryptedFile(dataPoints: TrainingDataPoint[]): Promise<void> {
    // Implement encryption and file storage
    const crypto = await import('crypto');
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const key = process.env.TRAINING_DATA_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not configured');
    }
    
    const cipher = crypto.createCipher('aes-256-cbc', key);
    const encrypted = cipher.update(JSON.stringify(dataPoints), 'utf8', 'hex') + cipher.final('hex');
    
    const dataDir = path.join(process.cwd(), 'data', 'training', 'encrypted');
    const filePath = path.join(dataDir, `encrypted_${Date.now()}.dat`);
    
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, encrypted);
  }

  // Helper methods
  private async getSessionLength(conversationId: string): Promise<number> {
    // Query database or cache for conversation turn count
    try {
      // Mock implementation - replace with actual query
      return Math.floor(Math.random() * 10) + 1;
    } catch {
      return 1;
    }
  }

  private isFirstTurn(conversationId: string): boolean {
    return conversationId.includes('_0') || conversationId.startsWith('conv_');
  }

  private async checkUserConsent(userId?: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // Check user preferences or consent table
      // Mock implementation
      return true;
    } catch {
      return false;
    }
  }

  private calculateRetentionExpiry(): number {
    // 90 days from now by default
    return Date.now() + (90 * 24 * 60 * 60 * 1000);
  }

  private hashConversationId(conversationId: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(conversationId).digest('hex').substring(0, 16);
  }

  private setupPeriodicFlush(): void {
    // Flush buffer every 5 minutes
    setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flushBuffer();
      }
    }, 5 * 60 * 1000);
  }

  // Public methods for training data management
  async getTrainingData(filters: {
    startDate?: number;
    endDate?: number;
    userId?: string;
    qualityThreshold?: number;
    limit?: number;
  }): Promise<TrainingDataPoint[]> {
    // Implementation depends on storage backend
    switch (this.config.storageBackend) {
      case 'supabase':
        return this.getTrainingDataFromSupabase(filters);
      case 'local':
        return this.getTrainingDataFromLocal(filters);
      default:
        throw new Error('Training data retrieval not implemented for this backend');
    }
  }

  private async getTrainingDataFromSupabase(filters: any): Promise<TrainingDataPoint[]> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      let query = supabase.from('training_data').select('*');

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters.userId) {
        query = query.eq('userId', filters.userId);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to retrieve training data:', error);
      return [];
    }
  }

  private async getTrainingDataFromLocal(filters: any): Promise<TrainingDataPoint[]> {
    // Read from local JSON files
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data', 'training');
    
    try {
      const files = await fs.readdir(dataDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData: TrainingDataPoint[] = [];
      
      for (const file of jsonFiles) {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        allData = allData.concat(data);
      }
      
      // Apply filters
      return this.applyFilters(allData, filters);
    } catch (error) {
      console.error('Failed to read local training data:', error);
      return [];
    }
  }

  private applyFilters(data: TrainingDataPoint[], filters: any): TrainingDataPoint[] {
    let filtered = data;

    if (filters.startDate) {
      filtered = filtered.filter(d => d.timestamp >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(d => d.timestamp <= filters.endDate);
    }
    if (filters.userId) {
      filtered = filtered.filter(d => d.userId === filters.userId);
    }
    if (filters.qualityThreshold && filters.qualityThreshold > 0) {
      filtered = filtered.filter(d => 
        (d.systemQuality?.spiralogicAlignment || 0) >= filters.qualityThreshold
      );
    }
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  // Cleanup and maintenance
  async cleanupExpiredData(): Promise<number> {
    const now = Date.now();
    
    switch (this.config.storageBackend) {
      case 'supabase':
        return this.cleanupSupabaseData(now);
      case 'local':
        return this.cleanupLocalData(now);
      default:
        return 0;
    }
  }

  private async cleanupSupabaseData(now: number): Promise<number> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { count, error } = await supabase
        .from('training_data')
        .delete()
        .lt('retentionExpiry', now);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to cleanup expired training data:', error);
      return 0;
    }
  }

  private async cleanupLocalData(now: number): Promise<number> {
    // Implement local file cleanup based on retention policies
    return 0;
  }
}

// Factory function for easy setup
export function createTrainingDataCollector(overrides: Partial<CollectionConfig> = {}): TrainingDataCollector {
  const defaultConfig: CollectionConfig = {
    enabled: process.env.TRAINING_DATA_COLLECTION === 'true',
    samplingRate: Number(process.env.TRAINING_SAMPLING_RATE) || 0.1,
    includeAnonymous: process.env.TRAINING_INCLUDE_ANONYMOUS === 'true',
    privacyMode: (process.env.TRAINING_PRIVACY_MODE as any) || 'anonymized',
    qualityThreshold: Number(process.env.TRAINING_QUALITY_THRESHOLD) || 6.0,
    storageBackend: (process.env.TRAINING_STORAGE_BACKEND as any) || 'supabase'
  };

  const config = { ...defaultConfig, ...overrides };
  return new TrainingDataCollector(config);
}