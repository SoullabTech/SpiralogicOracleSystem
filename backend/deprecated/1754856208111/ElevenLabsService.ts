/**
 * Eleven Labs Voice Synthesis Service
 * Handles archetypal voice generation for consciousness responses
 */

import axios from "axios";
import FormData from "form-data";

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string = "https://api.elevenlabs.io/v1";

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️  ELEVENLABS_API_KEY not found in environment");
    }
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
