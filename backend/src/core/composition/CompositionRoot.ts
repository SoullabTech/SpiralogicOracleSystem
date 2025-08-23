// 🏗️ COMPOSITION ROOT - Dependency Injection Container
// Breaks circular dependencies by providing all concrete implementations

import { FireAgent } from "../agents/elemental/fireAgent";
import { WaterAgent } from "../agents/elemental/waterAgent";
import { EarthAgent } from "../agents/elemental/earthAgent";
import { AirAgent } from "../agents/elemental/airAgent";
import { AetherAgent } from "../agents/elemental/aetherAgent";
import { ArchetypeAgentFactory } from "../agents/ArchetypeAgentFactory";
import { PersonalOracleAgent } from "../agents/PersonalOracleAgent";
import { SoullabFounderAgent } from "../agents/soullabFounderAgent";

// Services
import { OracleService } from "../../services/OracleService";
import { AgentOrchestrator } from "../../services/agentOrchestrator";

// Interfaces
import { IFireAgent, IWaterAgent, IEarthAgent, IAirAgent, IAetherAgent, IElementalOrchestrator } from "@/lib/shared/interfaces/IElementalAgent";
import { IArchetypeAgent, IArchetypeAgentFactory } from "@/lib/shared/interfaces/IArchetypeAgent";
import { IPersonalOracleAgent } from "@/lib/shared/interfaces/IPersonalOracleAgent";
import { IFounderAgent } from "@/lib/shared/interfaces/IFounderAgent";
import { IOracleService } from "@/lib/shared/interfaces/IOracleService";

export class CompositionRoot {
  private static instance: CompositionRoot;
  
  // Agent instances
  private fireAgent: IFireAgent;
  private waterAgent: IWaterAgent;
  private earthAgent: IEarthAgent;
  private airAgent: IAirAgent;
  private aetherAgent: IAetherAgent;
  private founderAgent: IFounderAgent;
  private archetypeAgentFactory: IArchetypeAgentFactory;
  
  // Service instances
  private oracleService: IOracleService;
  private agentOrchestrator: IElementalOrchestrator;

  private constructor() {
    this.initializeAgents();
    this.initializeServices();
  }

  public static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  private initializeAgents(): void {
    // Elemental agents - no dependencies
    this.fireAgent = new FireAgent();
    this.waterAgent = new WaterAgent(); 
    this.earthAgent = new EarthAgent();
    this.airAgent = new AirAgent();
    this.aetherAgent = new AetherAgent();
    
    // Founder agent - no circular dependencies
    this.founderAgent = new SoullabFounderAgent();
    
    // Factory - depends only on agent constructors
    this.archetypeAgentFactory = new ArchetypeAgentFactory();
  }

  private initializeServices(): void {
    // Oracle service - depends on archetype factory
    this.oracleService = new OracleService(this.archetypeAgentFactory);
    
    // Agent orchestrator - depends on elemental agents
    this.agentOrchestrator = new AgentOrchestrator(this.fireAgent, this.waterAgent);
  }

  // Agent getters
  public getFireAgent(): IFireAgent {
    return this.fireAgent;
  }

  public getWaterAgent(): IWaterAgent {
    return this.waterAgent;
  }

  public getEarthAgent(): IEarthAgent {
    return this.earthAgent;
  }

  public getAirAgent(): IAirAgent {
    return this.airAgent;
  }

  public getAetherAgent(): IAetherAgent {
    return this.aetherAgent;
  }

  public getFounderAgent(): IFounderAgent {
    return this.founderAgent;
  }

  public getArchetypeAgentFactory(): IArchetypeAgentFactory {
    return this.archetypeAgentFactory;
  }

  // Service getters
  public getOracleService(): IOracleService {
    return this.oracleService;
  }

  public getAgentOrchestrator(): IElementalOrchestrator {
    return this.agentOrchestrator;
  }

  // Convenience method to get a configured personal oracle agent
  public async getPersonalOracleAgent(config: any): Promise<IPersonalOracleAgent> {
    return this.archetypeAgentFactory.createAgent("personal", config) as Promise<IPersonalOracleAgent>;
  }

  // Factory method for creating new agent orchestrator instances if needed
  public createAgentOrchestrator(): IElementalOrchestrator {
    return new AgentOrchestrator(this.fireAgent, this.waterAgent);
  }
}

// Global composition root instance
export const compositionRoot = CompositionRoot.getInstance();

// Convenience exports for common dependencies
export const getFireAgent = () => compositionRoot.getFireAgent();
export const getWaterAgent = () => compositionRoot.getWaterAgent();
export const getEarthAgent = () => compositionRoot.getEarthAgent();
export const getAirAgent = () => compositionRoot.getAirAgent();
export const getAetherAgent = () => compositionRoot.getAetherAgent();
export const getFounderAgent = () => compositionRoot.getFounderAgent();
export const getArchetypeAgentFactory = () => compositionRoot.getArchetypeAgentFactory();
export const getOracleService = () => compositionRoot.getOracleService();
export const getAgentOrchestrator = () => compositionRoot.getAgentOrchestrator();