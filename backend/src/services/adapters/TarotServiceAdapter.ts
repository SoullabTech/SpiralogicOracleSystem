import type { ITarotService } from "@/lib/shared/interfaces/ITarotService";
import { getTarotReading, getDailyTarot } from "../tarotService";

export class TarotServiceAdapter implements ITarotService {
  getTarotReading(query: string, spreadType?: string): any {
    return getTarotReading(query, spreadType);
  }

  getDailyTarot(): any {
    return getDailyTarot();
  }
}

export const tarotService = new TarotServiceAdapter();