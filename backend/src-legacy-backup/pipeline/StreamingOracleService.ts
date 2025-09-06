/**
 * 🌊 Streaming Oracle Service - Real-Time Voice Synthesis & Audio Delivery
 *
 * Handles real-time voice synthesis with Eleven Labs, streaming audio chunks,
 * and ceremonial pacing for spiritually intelligent voice delivery.
 */

import { EventEmitter } from "events";
import { logger } from "../../utils/logger";
import { ElevenLabsService } from "../../services/ElevenLabsService";
import { ArchetypalVoiceEngine } from "../../config/archetypalVoices";
import * as fs from "fs";
import * as path from "path";

export interface StreamingConfig {
  voiceId: string;
  voiceSettings: any;
  archetype: string;
  ritualPacing?: "slow" | "medium" | "fast" | "ceremonial";
  enableBreathPauses?: boolean;
  chunkSize?: number;
}

export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  sequenceNumber: number;
  isLast: boolean;
  metadata: {
    archetype: string;
    duration: number;
    energyLevel: number;
  };
}

export class StreamingOracleService extends EventEmitter {
  private elevenLabsService: ElevenLabsService;
  private activeStreams = new Map<string, any>();
  private voiceCache = new Map<string, Buffer>();
  private preloadedFragments = new Map<string, string>();

  constructor() {
    super();
    this.elevenLabsService = new ElevenLabsService();
    this.initializeVoiceFragments();
  }

  /**
   * 🎵 Synthesize Complete Audio (Traditional Mode)
   */
  async synthesizeComplete(
    text: string,
    config: StreamingConfig,
  ): Promise<string> {
    try {
      const startTime = Date.now();

      // Enhance text with ritual pacing
      const enhancedText = this.enhanceTextForRitualPacing(text, config);

      // Check cache first
      const cacheKey = this.generateCacheKey(enhancedText, config);
      if (this.voiceCache.has(cacheKey)) {
        const cached = this.voiceCache.get(cacheKey)!;
        const audioUrl = await this.saveCachedAudio(cached);

        logger.info(&quot;Voice synthesis cache hit:&quot;, {
          cacheKey,
          responseTime: Date.now() - startTime,
        });

        return audioUrl;
      }

      // Generate voice with Eleven Labs
      const audioBuffer = await this.elevenLabsService.synthesizeSpeech(
        enhancedText,
        config.voiceId,
        config.voiceSettings,
      );

      // Save to file and cache
      const audioUrl = await this.saveAudioBuffer(
        audioBuffer,
        config.archetype,
      );
      this.voiceCache.set(cacheKey, audioBuffer);

      const responseTime = Date.now() - startTime;
      logger.info("Voice synthesis completed:", {
        archetype: config.archetype,
        textLength: text.length,
        responseTime,
        audioUrl: audioUrl.substring(0, 50) + "...",
      });

      return audioUrl;
    } catch (error) {
      logger.error("Voice synthesis error:", error);
      throw error;
    }
  }

  /**
   * 🌊 Synthesize Streaming Audio (Real-Time Mode)
   */
  async synthesizeStreaming(
    text: string,
    config: StreamingConfig,
    ritualTiming?: any,
  ): Promise<ReadableStream> {
    const streamId = this.generateStreamId();

    logger.info(&quot;Starting streaming synthesis:&quot;, {
      streamId,
      archetype: config.archetype,
      textLength: text.length,
      ritualPacing: config.ritualPacing,
    });

    // Create readable stream
    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          await this.processStreamingSynthesis(
            text,
            config,
            ritualTiming,
            controller,
            streamId,
          );
        } catch (error) {
          logger.error("Streaming synthesis error:", error);
          controller.error(error);
        }
      },

      cancel: () => {
        this.activeStreams.delete(streamId);
        logger.info("Stream cancelled:", { streamId });
      },
    });

    this.activeStreams.set(streamId, { stream, config, startTime: Date.now() });
    return stream;
  }

  /**
   * 🎭 Preload Voice for Performance
   */
  async preloadVoice(voiceConfig: any): Promise<void> {
    const preloadTexts = [
      &quot;You already know what I&apos;m going to say, don&apos;t you?&quot;,
      "The oracle speaks through silence and symbols.",
      "In the sacred space between breaths, wisdom awakens.",
    ];

    for (const text of preloadTexts) {
      try {
        const audioBuffer = await this.elevenLabsService.synthesizeSpeech(
          text,
          voiceConfig.voiceId,
          voiceConfig.baseSettings,
        );

        const cacheKey = this.generateCacheKey(text, {
          voiceId: voiceConfig.voiceId,
          voiceSettings: voiceConfig.baseSettings,
          archetype: voiceConfig.element,
        });

        this.voiceCache.set(cacheKey, audioBuffer);
      } catch (error) {
        logger.warn("Voice preload failed:", {
          voiceId: voiceConfig.voiceId,
          error: error.message,
        });
      }
    }
  }

  /**
   * 🔧 Private Methods
   */
  private async processStreamingSynthesis(
    text: string,
    config: StreamingConfig,
    ritualTiming: any,
    controller: ReadableStreamDefaultController,
    streamId: string,
  ): Promise<void> {
    // Split text into chunks for streaming
    const textChunks = this.splitTextForStreaming(
      text,
      config.chunkSize || 100,
    );

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const isLast = i === textChunks.length - 1;

      // Add ritual pauses between chunks
      if (i > 0 && config.enableBreathPauses) {
        await this.addRitualPause(config.ritualPacing, ritualTiming);
      }

      try {
        // Synthesize chunk
        const audioBuffer = await this.elevenLabsService.synthesizeSpeech(
          chunk,
          config.voiceId,
          config.voiceSettings,
        );

        // Create audio chunk
        const audioChunk: AudioChunk = {
          data: audioBuffer,
          timestamp: Date.now(),
          sequenceNumber: i,
          isLast,
          metadata: {
            archetype: config.archetype,
            duration: this.estimateAudioDuration(chunk),
            energyLevel: this.calculateEnergyLevel(chunk, config.archetype),
          },
        };

        // Enqueue chunk
        controller.enqueue(audioChunk);

        // Emit progress event
        this.emit(&quot;streamProgress&quot;, {
          streamId,
          progress: (i + 1) / textChunks.length,
          chunk: audioChunk,
        });
      } catch (error) {
        logger.error("Chunk synthesis error:", {
          streamId,
          chunkIndex: i,
          error: error.message,
        });

        // Try to continue with next chunk
        continue;
      }
    }

    // Complete stream
    controller.close();
    this.activeStreams.delete(streamId);

    this.emit("streamComplete", {
      streamId,
      totalChunks: textChunks.length,
      archetype: config.archetype,
    });
  }

  private enhanceTextForRitualPacing(
    text: string,
    config: StreamingConfig,
  ): string {
    if (!config.ritualPacing || config.ritualPacing === "medium") {
      return text;
    }

    let enhancedText = text;

    // Add ceremonial pauses
    if (config.ritualPacing === "ceremonial") {
      enhancedText = ArchetypalVoiceEngine.enhanceTextForRitual(
        text,
        config.archetype,
        "deep",
      );
    } else if (config.ritualPacing === "slow") {
      enhancedText = ArchetypalVoiceEngine.enhanceTextForRitual(
        text,
        config.archetype,
        "medium",
      );
    }

    // Add breath-based pauses
    if (config.enableBreathPauses) {
      enhancedText = enhancedText.replace(/\.\s+/g, '.<break time="800ms"/> ');
      enhancedText = enhancedText.replace(/\?\s+/g, '?<break time="600ms"/> ');
      enhancedText = enhancedText.replace(/!\s+/g, '!<break time="500ms"/> ');
    }

    return enhancedText;
  }

  private splitTextForStreaming(text: string, chunkSize: number): string[] {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = "&quot;;

    for (const sentence of sentences) {
      if (
        currentChunk.length + sentence.length > chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk.length > 0 ? ". " : "") + sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private async addRitualPause(
    ritualPacing: string = "medium",
    ritualTiming?: any,
  ): Promise<void> {
    const pauseDurations = {
      slow: 1000,
      medium: 500,
      fast: 200,
      ceremonial: 1500,
    };

    const pauseMs = pauseDurations[ritualPacing] || 500;

    return new Promise((resolve) => {
      setTimeout(resolve, pauseMs);
    });
  }

  private async saveAudioBuffer(
    audioBuffer: Buffer,
    archetype: string,
  ): Promise<string> {
    const fileName = `oracle_${archetype}_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, &quot;../../../public/audio", fileName);

    // Ensure directory exists
    const audioDir = path.dirname(filePath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(filePath, audioBuffer);
    return `/audio/${fileName}`;
  }

  private async saveCachedAudio(audioBuffer: Buffer): Promise<string> {
    const fileName = `cached_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "../../../public/audio", fileName);

    fs.writeFileSync(filePath, audioBuffer);
    return `/audio/${fileName}`;
  }

  private generateCacheKey(text: string, config: any): string {
    const textHash = Buffer.from(text).toString("base64").substring(0, 20);
    const configHash = JSON.stringify(config).substring(0, 20);
    return `${textHash}_${configHash}`;
  }

  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateAudioDuration(text: string): number {
    // Rough estimate: 150 words per minute
    const wordCount = text.split(" ").length;
    return (wordCount / 150) * 60 * 1000; // Convert to milliseconds
  }

  private calculateEnergyLevel(text: string, archetype: string): number {
    const energyWords = {
      fire: ["ignite", "passion", "transform", "breakthrough"],
      water: ["flow", "heal", "nurture", "gentle"],
      earth: ["ground", "stable", "strong", "foundation"],
      air: ["clarity", "insight", "understanding", "clear"],
      aether: ["unity", "transcend", "sacred", "divine"],
    };

    const archetypeWords = energyWords[archetype] || [];
    const lowercaseText = text.toLowerCase();

    let energy = 0.5; // Base energy
    archetypeWords.forEach((word) => {
      if (lowercaseText.includes(word)) {
        energy += 0.1;
      }
    });

    return Math.min(energy, 1.0);
  }

  private initializeVoiceFragments(): void {
    // Initialize pre-generated voice fragments for emergencies
    this.preloadedFragments.set(
      "fire_presence",
      "/audio/fragments/fire_presence.mp3",
    );
    this.preloadedFragments.set(
      "water_presence",
      "/audio/fragments/water_presence.mp3",
    );
    this.preloadedFragments.set(
      "earth_presence",
      "/audio/fragments/earth_presence.mp3",
    );
    this.preloadedFragments.set(
      "air_presence",
      "/audio/fragments/air_presence.mp3",
    );
    this.preloadedFragments.set(
      "aether_presence",
      "/audio/fragments/aether_presence.mp3",
    );
  }

  /**
   * 📊 Service Status & Analytics
   */
  getServiceStatus(): any {
    return {
      activeStreams: this.activeStreams.size,
      cacheSize: this.voiceCache.size,
      preloadedFragments: this.preloadedFragments.size,
      totalSynthesisTime: 0, // Would track in production
      averageLatency: 0, // Would calculate from metrics
    };
  }

  clearCache(): void {
    this.voiceCache.clear();
    logger.info("Voice cache cleared");
  }
}
