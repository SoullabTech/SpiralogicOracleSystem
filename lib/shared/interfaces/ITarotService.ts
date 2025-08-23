export interface ITarotService {
  getTarotReading(query: string, spreadType?: string): any;
  getDailyTarot(): any;
}