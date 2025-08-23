export interface IDreamService {
  interpretDreamSymbols(dreamContent: string): Promise<any>;
  interpretDreamInput(input: any): Promise<any>;
}