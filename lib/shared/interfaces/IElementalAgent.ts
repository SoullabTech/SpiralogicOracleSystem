// Interface for Elemental Agents to break circular dependencies
export interface IElementalAgent {
  element: string;
  process(query: any): Promise<any>;
  getGuidance(input: string, context?: any): Promise<string>;
}

export interface IFireAgent extends IElementalAgent {
  element: "fire";
  processActionQuery(input: string, context?: any): Promise<any>;
  getMotivationalGuidance(context: any): Promise<string>;
}

export interface IWaterAgent extends IElementalAgent {
  element: "water";
  processEmotionalQuery(input: string, context?: any): Promise<any>;
  getEmotionalGuidance(context: any): Promise<string>;
}

export interface IEarthAgent extends IElementalAgent {
  element: "earth";
  processPracticalQuery(input: string, context?: any): Promise<any>;
  getGroundingGuidance(context: any): Promise<string>;
}

export interface IAirAgent extends IElementalAgent {
  element: "air";
  processMentalQuery(input: string, context?: any): Promise<any>;
  getClarityGuidance(context: any): Promise<string>;
}

export interface IAetherAgent extends IElementalAgent {
  element: "aether";
  processSpiritualQuery(input: string, context?: any): Promise<any>;
  getSpiritualGuidance(context: any): Promise<string>;
}

export interface IElementalOrchestrator {
  routeToElement(element: string, query: any): Promise<any>;
  detectElementalNeed(input: string, context?: any): Promise<string>;
  getAvailableElements(): string[];
}