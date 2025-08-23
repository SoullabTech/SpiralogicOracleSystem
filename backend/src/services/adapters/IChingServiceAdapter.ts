import type { IIChingService } from "@/lib/shared/interfaces/IIChingService";
import { castIChingHexagram, castYiJingReading, getDailyIChing } from "../ichingService";

export class IChingServiceAdapter implements IIChingService {
  castIChingHexagram(query: string): any {
    return castIChingHexagram(query);
  }

  castYiJingReading(query: string): any {
    return castYiJingReading(query);
  }

  getDailyIChing(): any {
    return getDailyIChing();
  }
}

export const ichingService = new IChingServiceAdapter();