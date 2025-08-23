import crypto from 'crypto';

export interface SpiralogicIPConfig {
  encryptionKey: string;
  accessLevels: Record<string, number>; // agent -> access level
  auditEnabled: boolean;
  watermarkEnabled: boolean;
  gradualDisclosure: boolean;
}

export interface AccessLevel {
  level: number;
  name: string;
  description: string;
  allowedKnowledge: string[];
  restrictions: string[];
}

export interface KnowledgeItem {
  id: string;
  type: 'principle' | 'archetype' | 'transformation' | 'technique' | 'insight';
  accessLevel: number;
  content: string;
  metadata: {
    sensitivity: 'public' | 'restricted' | 'confidential' | 'top_secret';
    source: string;
    dateCreated: number;
    lastAccessed?: number;
    accessCount: number;
  };
  watermark?: string;
  fingerprint: string;
}

export interface AccessRequest {
  agentId: string;
  knowledgeId: string;
  timestamp: number;
  purpose: string;
  context?: any;
}

export interface AccessAudit {
  id: string;
  timestamp: number;
  agentId: string;
  knowledgeId: string;
  accessGranted: boolean;
  reason?: string;
  context: any;
  ipAddress?: string;
  fingerprint: string;
}

export class SpiralogicIPProtector {
  private config: SpiralogicIPConfig;
  private knowledgeBase: Map<string, KnowledgeItem> = new Map();
  private accessLevels: Map<number, AccessLevel> = new Map();
  private auditLog: AccessAudit[] = [];

  constructor(config: SpiralogicIPConfig) {
    this.config = config;
    this.initializeAccessLevels();
    this.loadEncryptedKnowledge();
  }

  private initializeAccessLevels(): void {
    const levels: AccessLevel[] = [
      {
        level: 0,
        name: 'Public',
        description: 'Publicly available Spiralogic concepts',
        allowedKnowledge: ['basic_principles', 'public_archetypes'],
        restrictions: []
      },
      {
        level: 1,
        name: 'Foundational',
        description: 'Core Spiralogic principles for basic training',
        allowedKnowledge: ['core_principles', 'basic_archetypes', 'simple_transformations'],
        restrictions: ['no_advanced_techniques']
      },
      {
        level: 2,
        name: 'Intermediate',
        description: 'Deeper Spiralogic knowledge for advanced agents',
        allowedKnowledge: ['advanced_principles', 'complex_archetypes', 'transformation_paths'],
        restrictions: ['no_master_techniques', 'no_proprietary_insights']
      },
      {
        level: 3,
        name: 'Advanced',
        description: 'Comprehensive Spiralogic knowledge',
        allowedKnowledge: ['all_principles', 'all_archetypes', 'all_transformations', 'advanced_techniques'],
        restrictions: ['no_proprietary_insights', 'no_personal_work']
      },
      {
        level: 4,
        name: 'Master',
        description: 'Full access to Spiralogic IP',
        allowedKnowledge: ['everything'],
        restrictions: []
      }
    ];

    levels.forEach(level => {
      this.accessLevels.set(level.level, level);
    });
  }

  private async loadEncryptedKnowledge(): Promise<void> {
    // In production, this would load from an encrypted knowledge base
    // For now, we'll create a mock structure
    const mockKnowledge: KnowledgeItem[] = [
      {
        id: 'sp_001',
        type: 'principle',
        accessLevel: 1,
        content: this.encrypt('Safe container principle: Creating psychological safety for deep exploration'),
        metadata: {
          sensitivity: 'restricted',
          source: 'Spiralogic Core v2.0',
          dateCreated: Date.now(),
          accessCount: 0
        },
        fingerprint: this.createFingerprint('safe_container_principle')
      },
      {
        id: 'sp_002',
        type: 'archetype',
        accessLevel: 2,
        content: this.encrypt('Hero archetype: The journey of transformation through challenge and growth'),
        metadata: {
          sensitivity: 'confidential',
          source: 'Spiralogic Archetypes v1.5',
          dateCreated: Date.now(),
          accessCount: 0
        },
        fingerprint: this.createFingerprint('hero_archetype')
      },
      {
        id: 'sp_003',
        type: 'transformation',
        accessLevel: 3,
        content: this.encrypt('Shadow integration technique: Safe methods for embracing rejected aspects'),
        metadata: {
          sensitivity: 'top_secret',
          source: 'Spiralogic Mastery v3.0',
          dateCreated: Date.now(),
          accessCount: 0
        },
        fingerprint: this.createFingerprint('shadow_integration')
      }
    ];

    mockKnowledge.forEach(item => {
      this.knowledgeBase.set(item.id, item);
    });
  }

  async requestAccess(request: AccessRequest): Promise<{
    granted: boolean;
    knowledge?: string;
    watermarked?: string;
    reason?: string;
  }> {
    const agentLevel = this.config.accessLevels[request.agentId] || 0;
    const knowledge = this.knowledgeBase.get(request.knowledgeId);

    if (!knowledge) {
      await this.auditAccess(request, false, 'Knowledge item not found');
      return { granted: false, reason: 'Knowledge item not found' };
    }

    if (agentLevel < knowledge.accessLevel) {
      await this.auditAccess(request, false, 'Insufficient access level');
      return { 
        granted: false, 
        reason: `Requires level ${knowledge.accessLevel}, agent has level ${agentLevel}` 
      };
    }

    // Grant access
    const decryptedContent = this.decrypt(knowledge.content);
    const watermarkedContent = this.config.watermarkEnabled 
      ? this.addWatermark(decryptedContent, request.agentId, request.timestamp)
      : decryptedContent;

    // Update access tracking
    knowledge.metadata.lastAccessed = request.timestamp;
    knowledge.metadata.accessCount++;

    await this.auditAccess(request, true, 'Access granted');

    return {
      granted: true,
      knowledge: decryptedContent,
      watermarked: watermarkedContent
    };
  }

  async getGradualKnowledge(agentId: string, trainingLevel: number): Promise<KnowledgeItem[]> {
    if (!this.config.gradualDisclosure) {
      // Return all accessible knowledge at once
      return this.getAllAccessibleKnowledge(agentId);
    }

    const agentLevel = this.config.accessLevels[agentId] || 0;
    const availableKnowledge: KnowledgeItem[] = [];

    // Gradually increase knowledge based on training progress
    const effectiveLevel = Math.min(agentLevel, Math.floor(trainingLevel / 2));

    for (const [id, item] of this.knowledgeBase) {
      if (item.accessLevel <= effectiveLevel) {
        // Create a copy with decrypted content
        const decryptedItem = {
          ...item,
          content: this.decrypt(item.content)
        };
        
        if (this.config.watermarkEnabled) {
          decryptedItem.watermark = this.createWatermark(agentId, Date.now());
        }
        
        availableKnowledge.push(decryptedItem);
      }
    }

    return availableKnowledge;
  }

  private async getAllAccessibleKnowledge(agentId: string): Promise<KnowledgeItem[]> {
    const agentLevel = this.config.accessLevels[agentId] || 0;
    const accessible: KnowledgeItem[] = [];

    for (const [id, item] of this.knowledgeBase) {
      if (item.accessLevel <= agentLevel) {
        accessible.push({
          ...item,
          content: this.decrypt(item.content)
        });
      }
    }

    return accessible;
  }

  private async auditAccess(request: AccessRequest, granted: boolean, reason?: string): Promise<void> {
    if (!this.config.auditEnabled) return;

    const audit: AccessAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: request.timestamp,
      agentId: request.agentId,
      knowledgeId: request.knowledgeId,
      accessGranted: granted,
      reason,
      context: request.context || {},
      fingerprint: this.createFingerprint(`${request.agentId}_${request.knowledgeId}_${request.timestamp}`)
    };

    this.auditLog.push(audit);

    // In production, persist to secure audit database
    if (process.env.NODE_ENV === 'development') {
      console.log('[IP Protection] Access audit:', audit);
    }
  }

  private encrypt(content: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    return cipher.update(content, 'utf8', 'hex') + cipher.final('hex');
  }

  private decrypt(encryptedContent: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    return decipher.update(encryptedContent, 'hex', 'utf8') + decipher.final('utf8');
  }

  private createFingerprint(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private createWatermark(agentId: string, timestamp: number): string {
    const data = `${agentId}_${timestamp}_spiralogic`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
  }

  private addWatermark(content: string, agentId: string, timestamp: number): string {
    const watermark = this.createWatermark(agentId, timestamp);
    // Embed watermark in content (could be more sophisticated)
    return `${content}\n\n<!-- Spiralogic IP - Agent: ${agentId} - Access: ${watermark} -->`;
  }

  // Administrative methods
  async addKnowledgeItem(item: Omit<KnowledgeItem, 'fingerprint'>): Promise<void> {
    const itemWithFingerprint: KnowledgeItem = {
      ...item,
      content: this.encrypt(item.content),
      fingerprint: this.createFingerprint(item.id + item.content)
    };

    this.knowledgeBase.set(item.id, itemWithFingerprint);
  }

  async updateAgentAccessLevel(agentId: string, newLevel: number): Promise<void> {
    if (!this.accessLevels.has(newLevel)) {
      throw new Error(`Invalid access level: ${newLevel}`);
    }

    this.config.accessLevels[agentId] = newLevel;

    if (this.config.auditEnabled) {
      await this.auditAccess({
        agentId: 'system',
        knowledgeId: 'access_level_change',
        timestamp: Date.now(),
        purpose: `Updated ${agentId} access level to ${newLevel}`,
        context: { targetAgent: agentId, newLevel }
      }, true, 'Access level updated');
    }
  }

  getAccessLevels(): AccessLevel[] {
    return Array.from(this.accessLevels.values());
  }

  getAuditLog(filters?: {
    agentId?: string;
    startDate?: number;
    endDate?: number;
    accessGranted?: boolean;
  }): AccessAudit[] {
    let filtered = this.auditLog;

    if (filters) {
      if (filters.agentId) {
        filtered = filtered.filter(a => a.agentId === filters.agentId);
      }
      if (filters.startDate) {
        filtered = filtered.filter(a => a.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(a => a.timestamp <= filters.endDate!);
      }
      if (filters.accessGranted !== undefined) {
        filtered = filtered.filter(a => a.accessGranted === filters.accessGranted);
      }
    }

    return filtered;
  }

  async detectUnauthorizedUsage(content: string): Promise<{
    isViolation: boolean;
    violationType?: string;
    confidence: number;
    details?: string;
  }> {
    // Simple pattern matching for Spiralogic IP
    const spiralogicPatterns = [
      /spiralogic/i,
      /sacred container/i,
      /threshold recognition/i,
      /shadow integration/i,
      /archetypal guidance/i
    ];

    let violations = 0;
    const detectedPatterns: string[] = [];

    for (const pattern of spiralogicPatterns) {
      if (pattern.test(content)) {
        violations++;
        detectedPatterns.push(pattern.toString());
      }
    }

    const confidence = violations / spiralogicPatterns.length;

    if (violations > 2) {
      return {
        isViolation: true,
        violationType: 'potential_ip_usage',
        confidence,
        details: `Detected ${violations} Spiralogic patterns: ${detectedPatterns.join(', ')}`
      };
    }

    return {
      isViolation: false,
      confidence
    };
  }

  // Export methods for backup/migration
  async exportEncryptedKnowledge(): Promise<string> {
    const exportData = {
      timestamp: Date.now(),
      version: '1.0',
      knowledge: Array.from(this.knowledgeBase.entries()),
      accessLevels: Array.from(this.accessLevels.entries()),
      checksum: this.createFingerprint(JSON.stringify(Array.from(this.knowledgeBase.keys())))
    };

    return this.encrypt(JSON.stringify(exportData));
  }

  async importEncryptedKnowledge(encryptedData: string): Promise<void> {
    try {
      const decryptedData = this.decrypt(encryptedData);
      const importData = JSON.parse(decryptedData);

      // Verify checksum
      const expectedChecksum = this.createFingerprint(JSON.stringify(importData.knowledge.map((k: any) => k[0])));
      if (expectedChecksum !== importData.checksum) {
        throw new Error('Knowledge base integrity check failed');
      }

      // Import knowledge
      this.knowledgeBase.clear();
      importData.knowledge.forEach(([id, item]: [string, KnowledgeItem]) => {
        this.knowledgeBase.set(id, item);
      });

      // Import access levels
      this.accessLevels.clear();
      importData.accessLevels.forEach(([level, data]: [number, AccessLevel]) => {
        this.accessLevels.set(level, data);
      });

      console.log(`Imported ${this.knowledgeBase.size} knowledge items`);
    } catch (error) {
      console.error('Failed to import knowledge:', error);
      throw new Error('Knowledge import failed');
    }
  }
}

// Factory function
export function createIPProtector(overrides: Partial<SpiralogicIPConfig> = {}): SpiralogicIPProtector {
  const defaultConfig: SpiralogicIPConfig = {
    encryptionKey: process.env.SPIRALOGIC_ENCRYPTION_KEY || 'default_development_key_change_in_production',
    accessLevels: {
      'claude_oracle': 2,
      'sacred_intelligence': 3,
      'micropsi_bach': 1,
      'chatgpt_oracle_2': 4
    },
    auditEnabled: process.env.NODE_ENV === 'production' || process.env.IP_AUDIT_ENABLED === 'true',
    watermarkEnabled: process.env.IP_WATERMARK_ENABLED === 'true',
    gradualDisclosure: process.env.IP_GRADUAL_DISCLOSURE === 'true'
  };

  const config = { ...defaultConfig, ...overrides };
  return new SpiralogicIPProtector(config);
}