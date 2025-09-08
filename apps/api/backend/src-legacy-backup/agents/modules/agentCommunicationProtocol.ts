// 🌐 Agent-to-Agent Communication Protocol
// Enables collective intelligence through inter-agent wisdom sharing

import { logger } from "../../../utils/logger";
import { supabase } from "../../../services/supabaseClient";

export interface AgentMessage {
  from: string;
  to: string;
  type: "wisdom" | "pattern" | "request" | "update" | "broadcast";
  content: string;
  context?: {
    userId?: string;
    element?: string;
    pattern?: string;
    urgency?: "low" | "medium" | "high";
    [key: string]: any;
  };
  timestamp: string;
}

export interface AgentWisdomExchange {
  exchange_id?: string;
  from_agent: string;
  to_agent: string;
  wisdom_content: string;
  context: Record<string, any>;
  exchange_type: string;
  relevance_score?: number;
  applied_count?: number;
  created_at?: string;
}

export interface AgentLearning {
  agent_name: string;
  learning_type:
    | "pattern_recognition"
    | "wisdom_integration"
    | "user_feedback"
    | "collective_insight";
  content: string;
  integration_successful: boolean;
  impact_metrics: {
    confidence_increase?: number;
    pattern_strength?: number;
    user_satisfaction?: number;
  };
}

export class AgentCommunicationProtocol {
  private static instance: AgentCommunicationProtocol;
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private wisdomRepository: Map<string, AgentWisdomExchange[]> = new Map();
  private broadcastChannel: AgentMessage[] = [];
  private maxBroadcastSize = 100;
  private learningThreshold = 0.75; // Minimum relevance score to integrate wisdom

  private constructor() {
    // Initialize message queues for each agent
    const agents = [
      "FireAgent",
      "WaterAgent",
      "EarthAgent",
      "AirAgent",
      "AetherAgent",
      "ShadowAgent",
      "MainOracleAgent",
    ];
    agents.forEach((agent) => {
      this.messageQueue.set(agent, []);
      this.wisdomRepository.set(agent, []);
    });
  }

  static getInstance(): AgentCommunicationProtocol {
    if (!AgentCommunicationProtocol.instance) {
      AgentCommunicationProtocol.instance = new AgentCommunicationProtocol();
    }
    return AgentCommunicationProtocol.instance;
  }

  // Send a message from one agent to another
  async sendMessage(message: AgentMessage): Promise<void> {
    try {
      // Validate agents exist
      if (!this.messageQueue.has(message.to)) {
        throw new Error(`Unknown recipient agent: ${message.to}`);
      }

      // Add timestamp if not provided
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }

<<<<<<< HEAD
      // Add to recipient's queue
=======
      // Add to recipient&apos;s queue
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      const queue = this.messageQueue.get(message.to) || [];
      queue.push(message);
      this.messageQueue.set(message.to, queue);

<<<<<<< HEAD
      // If it's a wisdom exchange, store it
=======
      // If it&apos;s a wisdom exchange, store it
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      if (message.type === "wisdom" || message.type === "pattern") {
        await this.storeWisdomExchange(message);
      }

      // If it's a broadcast, add to broadcast channel
      if (message.type === "broadcast") {
        this.addToBroadcastChannel(message);
      }

      logger.info("Agent message sent", {
        from: message.from,
        to: message.to,
        type: message.type,
        timestamp: message.timestamp,
      });
    } catch (error) {
      logger.error("Error sending agent message:", error);
      throw error;
    }
  }

  // Receive messages for a specific agent
  async receiveMessages(agentName: string): Promise<AgentMessage[]> {
    const messages = this.messageQueue.get(agentName) || [];
    // Clear the queue after reading
    this.messageQueue.set(agentName, []);
    return messages;
  }

  // Broadcast a message to all agents
  async broadcast(message: Omit<AgentMessage, "to">): Promise<void> {
    const agents = Array.from(this.messageQueue.keys()).filter(
      (agent) => agent !== message.from,
    );

    for (const agent of agents) {
      await this.sendMessage({
        ...message,
        to: agent,
        type: "broadcast",
      });
    }
  }

  // Store wisdom exchange in database
  private async storeWisdomExchange(message: AgentMessage): Promise<void> {
    try {
      const exchange: AgentWisdomExchange = {
        from_agent: message.from,
        to_agent: message.to,
        wisdom_content: message.content,
        context: message.context || {},
        exchange_type: message.type,
        relevance_score: 0.5, // Default, would be calculated based on context
      };

      const { error } = await supabase
        .from("agent_wisdom_exchanges")
        .insert(exchange);

      if (error) throw error;

      // Also store in local repository for quick access
      const repo = this.wisdomRepository.get(message.to) || [];
      repo.push(exchange);
      this.wisdomRepository.set(message.to, repo);
    } catch (error) {
      logger.error("Error storing wisdom exchange:", error);
    }
  }

  // Get relevant wisdom for an agent based on context
  async getRelevantWisdom(
    agentName: string,
    context: any,
  ): Promise<AgentWisdomExchange[]> {
    try {
      // Query from database for persistent wisdom
      const { data, error } = await supabase
        .from("agent_wisdom_exchanges")
        .select("*")
        .eq("to_agent", agentName)
        .gte("relevance_score", this.learningThreshold)
        .order("relevance_score", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter based on context relevance
      const relevantWisdom =
        data?.filter((wisdom) => {
          // Context matching logic
          if (context.element && wisdom.context.element === context.element)
            return true;
          if (context.pattern && wisdom.context.pattern === context.pattern)
            return true;
          if (context.userId && wisdom.context.userId === context.userId)
            return true;
          return wisdom.relevance_score > 0.8; // High general relevance
        }) || [];

      return relevantWisdom;
    } catch (error) {
      logger.error("Error retrieving relevant wisdom:", error);
      return [];
    }
  }

  // Log agent learning for evolution tracking
  async logLearning(learning: AgentLearning): Promise<void> {
    try {
      const { error } = await supabase.from("agent_learning_log").insert({
        agent_name: learning.agent_name,
        learning_type: learning.learning_type,
        content: learning.content,
        integration_successful: learning.integration_successful,
        impact_metrics: learning.impact_metrics,
      });

      if (error) throw error;

      logger.info("Agent learning logged", {
        agent: learning.agent_name,
        type: learning.learning_type,
        success: learning.integration_successful,
      });
    } catch (error) {
      logger.error("Error logging agent learning:", error);
    }
  }

  // Calculate relevance score for wisdom exchange
  calculateRelevanceScore(
    message: AgentMessage,
    recipientContext: any,
  ): number {
    let score = 0.5; // Base score

    // Element match
    if (message.context?.element === recipientContext.element) {
      score += 0.2;
    }

    // Pattern similarity
    if (
      message.context?.pattern &&
      recipientContext.patterns?.includes(message.context.pattern)
    ) {
      score += 0.2;
    }

    // Urgency factor
    if (message.context?.urgency === "high") {
      score += 0.1;
    }

    // User context match
    if (message.context?.userId === recipientContext.userId) {
      score += 0.15;
    }

    // Time relevance (more recent = more relevant)
    const messageAge = Date.now() - new Date(message.timestamp).getTime();
    const hoursSinceMessage = messageAge / (1000 * 60 * 60);
    if (hoursSinceMessage < 24) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  // Get broadcast messages
  getBroadcastMessages(limit: number = 10): AgentMessage[] {
    return this.broadcastChannel.slice(-limit);
  }

  // Add to broadcast channel with size limit
  private addToBroadcastChannel(message: AgentMessage): void {
    this.broadcastChannel.push(message);

    // Maintain size limit
    if (this.broadcastChannel.length > this.maxBroadcastSize) {
      this.broadcastChannel = this.broadcastChannel.slice(
        -this.maxBroadcastSize,
      );
    }
  }

  // Share pattern discovery between agents
  async sharePatternDiscovery(pattern: {
    discoveredBy: string;
    pattern_id: string;
    elements: string[];
    wisdom: string;
    strength: number;
  }): Promise<void> {
    // Determine which agents should receive this pattern
    const interestedAgents = this.determineInterestedAgents(pattern.elements);

    for (const agent of interestedAgents) {
      await this.sendMessage({
        from: pattern.discoveredBy,
        to: agent,
        type: "pattern",
        content: `New pattern discovered: ${pattern.wisdom}`,
        context: {
          pattern_id: pattern.pattern_id,
          elements: pattern.elements,
          strength: pattern.strength,
          urgency: pattern.strength > 0.8 ? "high" : "medium",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Also broadcast if pattern is highly significant
    if (pattern.strength > 0.85) {
      await this.broadcast({
        from: pattern.discoveredBy,
        type: "broadcast",
        content: `Significant pattern discovered: ${pattern.wisdom}`,
        context: {
          pattern_id: pattern.pattern_id,
          elements: pattern.elements,
          strength: pattern.strength,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Determine which agents are interested in specific elements
  private determineInterestedAgents(elements: string[]): string[] {
    const elementAgentMap: Record<string, string> = {
      fire: "FireAgent",
      water: "WaterAgent",
      earth: "EarthAgent",
      air: "AirAgent",
      aether: "AetherAgent",
      shadow: "ShadowAgent",
    };

    const agents = new Set<string>();

    // Add elemental agents
    elements.forEach((element) => {
      const agent = elementAgentMap[element];
      if (agent) agents.add(agent);
    });

    // Always include MainOracleAgent for oversight
    agents.add("MainOracleAgent");

    // Include AetherAgent for multi-element patterns
    if (elements.length > 1) {
      agents.add("AetherAgent");
    }

    // Include ShadowAgent for complex patterns
    if (elements.length > 2) {
      agents.add("ShadowAgent");
    }

    return Array.from(agents);
  }

  // Request wisdom from other agents
  async requestWisdom(
    requestingAgent: string,
    topic: string,
    context: any,
  ): Promise<AgentWisdomExchange[]> {
    // Send request to all agents
    await this.broadcast({
      from: requestingAgent,
      type: "request",
      content: `Requesting wisdom on: ${topic}`,
      context: {
        ...context,
        topic,
        urgency: "medium",
      },
      timestamp: new Date().toISOString(),
    });

    // Wait a moment for responses
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Collect relevant wisdom from repository
    return this.getRelevantWisdom(requestingAgent, { ...context, topic });
  }

  // Update agent capabilities based on learning
  async updateAgentCapabilities(
    agentName: string,
    newCapability: string,
  ): Promise<void> {
    await this.broadcast({
      from: agentName,
      type: "update",
      content: `Agent ${agentName} has learned: ${newCapability}`,
      context: {
        capability: newCapability,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const agentComms = AgentCommunicationProtocol.getInstance();
