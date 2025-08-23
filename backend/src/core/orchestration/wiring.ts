import { memoryService } from "../../services/memoryService";
import { PersonalOracleAgent } from "../agents/PersonalOracleAgent";
import { FireAgent } from "../agents/elemental/fireAgent";
import { WaterAgent } from "../agents/elemental/waterAgent";
import { EarthAgent } from "../agents/elemental/earthAgent";
import { AirAgent } from "../agents/elemental/airAgent";
import { AetherAgent } from "../agents/elemental/aetherAgent";
import { DivinationAgent } from "../agents/divinationAgent";
import { SoullabFounderAgent } from "../agents/soullabFounderAgent";
import { FacilitatorAgent } from "../agents/facilitatorAgent";

// Service adapters
import { tarotService } from "../../services/adapters/TarotServiceAdapter";
import { ichingService } from "../../services/adapters/IChingServiceAdapter";
import { astrologyService } from "../../services/adapters/AstrologyServiceAdapter";
import { profileService } from "../../services/adapters/ProfileServiceAdapter";

// Core agents with memory service injection
export const personalOracleAgent = new PersonalOracleAgent({
  userId: 'system',
  oracleName: 'System Oracle'
}, memoryService);

// Elemental agents
export const fireAgent = new FireAgent(memoryService, "Ignis");
export const waterAgent = new WaterAgent(memoryService, "Aquaria");
export const earthAgent = new EarthAgent(memoryService, "Terra");
export const airAgent = new AirAgent(memoryService, "Ventus");
export const aetherAgent = new AetherAgent(memoryService, "Nyra");

// Specialized agents
export const divinationAgent = new DivinationAgent(tarotService, ichingService, astrologyService);
export const soullabFounderAgent = new SoullabFounderAgent(memoryService);
export const facilitatorAgent = new FacilitatorAgent("system-facilitator", profileService);