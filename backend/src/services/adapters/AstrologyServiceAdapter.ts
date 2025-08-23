import type { IAstrologyService } from "@/lib/shared/interfaces/IAstrologyService";
import { generateAstroOracle, getDailyAstroGuidance } from "../astroOracleService";

export class AstrologyServiceAdapter implements IAstrologyService {
  generateAstroOracle(birthData?: any): any {
    return generateAstroOracle(birthData);
  }

  getDailyAstroGuidance(): any {
    return getDailyAstroGuidance();
  }
}

export const astrologyService = new AstrologyServiceAdapter();