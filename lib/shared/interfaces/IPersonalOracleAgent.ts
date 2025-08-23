export interface IPersonalOracleAgent {
  generateReflection(input: { userId: string; text: string }): Promise<string>;
  // add more methods here as needed, but keep minimal for now
}