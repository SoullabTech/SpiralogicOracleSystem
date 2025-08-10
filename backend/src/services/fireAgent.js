export class FireAgent {
  async getOracleResponse(input) {
    return {
      archetype: "Fire",
      message: `Your vision "${input}" carries the seeds of transformation. What is the first flame you will kindle?`,
      metadata: { voice_profile: "fire_archetype" },
    };
  }
}
export const fireAgent = new FireAgent();
