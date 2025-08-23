/**
 * DEPRECATED: ElevenLabsService
 * This service has been moved to infrastructure/adapters/ElevenLabsAdapter.ts
 * Please use the adapter instead for proper architectural separation
 */

import { ElevenLabsAdapter } from "../infrastructure/adapters/ElevenLabsAdapter";

// Create adapter instance for backward compatibility
const elevenLabsAdapter = new ElevenLabsAdapter();

/**
 * @deprecated Use ElevenLabsAdapter directly
 */
export class ElevenLabsService {
  private adapter: ElevenLabsAdapter;

  constructor() {
    this.adapter = elevenLabsAdapter;
    console.warn("⚠️  ElevenLabsService is deprecated. Use ElevenLabsAdapter directly.");
  }

  /**
   * Synthesize speech with specified voice and settings
   */
  async synthesizeSpeech(
    text: string,
    voiceId: string,
    voiceSettings: any,
  ): Promise<Buffer> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        },
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error(
        "Eleven Labs synthesis error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to synthesize speech");
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      return [];
    }
  }

  /**
   * Verify voice exists
   */
  async verifyVoice(voiceId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test all archetypal voices
   */
  async testArchetypalVoices(): Promise<void> {
    const { ARCHETYPAL_VOICE_PROFILES } = await import(
      "../config/archetypalVoiceProfiles.js"
    );

    console.log("🎤 Testing Archetypal Voices...\n");

    for (const [archetype, profile] of Object.entries(
      ARCHETYPAL_VOICE_PROFILES,
    )) {
      const exists = await this.verifyVoice(profile.voiceId);
      console.log(
        `${exists ? "✅" : "❌"} ${archetype}: ${profile.voiceId} - ${profile.personality}`,
      );
    }
  }
}

export default ElevenLabsService;
