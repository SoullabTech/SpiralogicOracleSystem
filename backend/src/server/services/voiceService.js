"use strict";
// src/services/voiceService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeVoice = synthesizeVoice;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';
async function synthesizeVoice({ text, voiceId, outputPath, }) {
    const url = `${BASE_URL}/text-to-speech/${voiceId}`;
    const response = await axios_1.default.post(url, { text }, {
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
        },
        responseType: 'stream',
    });
    const fullPath = path_1.default.resolve(outputPath);
    const writer = fs_1.default.createWriteStream(fullPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(fullPath));
        writer.on('error', reject);
    });
}
