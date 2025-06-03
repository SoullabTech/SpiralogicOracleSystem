"use strict";
// src/utils/voiceService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeVoice = synthesizeVoice;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
async function synthesizeVoice({ text, voiceId, }) {
    try {
        const response = await axios_1.default.post(`${ELEVENLABS_VOICE_URL}/${voiceId}`, {
            text,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
            },
        }, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
                Accept: 'audio/mpeg',
            },
            responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(response.data, 'binary');
        const filename = `${(0, uuid_1.v4)()}.mp3`;
        const outputPath = path_1.default.resolve(__dirname, '../../public/audio', filename);
        fs_1.default.writeFileSync(outputPath, buffer);
        return `/audio/${filename}`;
    }
    catch (err) {
        console.error('[VoiceService] Synthesis error:', err);
        throw new Error('Failed to synthesize voice');
    }
}
