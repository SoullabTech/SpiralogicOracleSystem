import { PersonalOracleAgent } from '../src/core/agents/PersonalOracleAgent';
export interface SoulMemoryConfig {
    userId: string;
    storageType: 'sqlite' | 'redis';
    databasePath?: string;
    semanticIndexPath?: string;
    memoryDepth: number;
}
export interface Memory {
    id: string;
    userId: string;
    timestamp: Date;
    type: MemoryType;
    content: string;
    element: ElementalType;
    archetype?: string;
    spiralPhase?: string;
    emotionalTone?: string;
    shadowContent?: boolean;
    transformationMarker?: boolean;
    sacredMoment?: boolean;
    ritualContext?: string;
    oracleResponse?: string;
    metadata?: Record<string, any>;
}
export interface EnhancedMemory extends Memory {
    wisdomMode?: 'jung' | 'buddha' | 'hybrid';
    integrationMarkers?: string[];
    liberationMarkers?: string[];
    paradoxResolution?: boolean;
    jungArchetype?: string;
    buddhaAttachment?: string;
    wisdomType?: WisdomMemoryType;
}
export type MemoryType = 'journal_entry' | 'oracle_exchange' | 'ritual_moment' | 'dream_record' | 'shadow_work' | 'breakthrough' | 'integration' | 'sacred_pause' | 'elemental_shift' | 'archetypal_emergence' | 'shadow_integration' | 'identity_release' | 'paradox_holding' | 'myth_creation' | 'emptiness_recognition' | 'sacred_balance';
export type WisdomMemoryType = 'shadow_integration' | 'identity_release' | 'paradox_holding' | 'myth_creation' | 'emptiness_recognition' | 'sacred_balance';
export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export interface MemoryThread {
    id: string;
    userId: string;
    threadName: string;
    threadType: 'ritual' | 'shadow_work' | 'transformation' | 'integration';
    createdAt: Date;
    lastUpdated: Date;
    memories: string[];
    state: {
        phase: string;
        progress: number;
        milestones: any[];
    };
}
export interface ArchetypalPattern {
    id: string;
    userId: string;
    archetype: string;
    activationCount: number;
    lastActivated: Date;
    patternStrength: number;
    relatedMemories: string[];
}
export interface TransformationJourney {
    userId: string;
    milestones: any[];
    currentPhase: string;
    nextSpiralSuggestion: string;
}
export declare class SoulMemorySystem {
    private config;
    private db;
    private semanticIndex;
    private activeMemories;
    private memoryThreads;
    constructor(config: SoulMemoryConfig);
    private initializeDatabase;
    private initializeSemanticIndex;
    storeMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory>;
    retrieveMemories(userId: string, options?: {
        type?: MemoryType;
        element?: ElementalType;
        limit?: number;
        sacred?: boolean;
        transformations?: boolean;
        dateRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<Memory[]>;
    semanticSearch(userId: string, query: string, options?: {
        topK?: number;
        memoryTypes?: MemoryType[];
        includeArchetypal?: boolean;
    }): Promise<Memory[]>;
    private indexMemory;
    createMemoryThread(userId: string, threadName: string, threadType: 'ritual' | 'shadow_work' | 'transformation' | 'integration'): Promise<MemoryThread>;
    addToThread(threadId: string, memoryId: string): Promise<void>;
    private detectArchetypalPatterns;
    getActiveArchetypes(userId: string): Promise<ArchetypalPattern[]>;
    recordRitualMoment(userId: string, ritualType: string, content: string, element: ElementalType, oracleGuidance?: string): Promise<Memory>;
    getSacredMoments(userId: string, limit?: number): Promise<Memory[]>;
    markTransformation(memoryId: string, transformationType: string, insights: string): Promise<void>;
    getTransformationJourney(userId: string): Promise<TransformationJourney>;
    integrateWithOracle(oracle: PersonalOracleAgent, userId: string): Promise<void>;
    private updateActiveMemories;
    private updateMemoryThreads;
    private memoryBelongsToThread;
    private extractThemes;
    private determineCurrentPhase;
    private suggestNextSpiral;
    private generateMemoryId;
    private generateThreadId;
    private generatePatternId;
    private getMemoryById;
    getMemoryThread(threadId: string): Promise<MemoryThread | null>;
    getUserThreads(userId: string): Promise<MemoryThread[]>;
    closeDatabase(): Promise<void>;
}
export { SoulMemorySystem };
export default SoulMemorySystem;
