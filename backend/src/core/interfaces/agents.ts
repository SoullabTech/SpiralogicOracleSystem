export interface PersonalOracleAgentPort {
  generateReflection(input: { userId: string; text: string }): Promise<string>;
}