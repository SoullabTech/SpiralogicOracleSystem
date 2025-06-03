"use strict";
// src/services/guideService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalGuideSettings = getPersonalGuideSettings;
exports.getVoiceSynthesisConfig = getVoiceSynthesisConfig;
const profileService_1 = require("./profileService");
/**
 * Retrieves the guide settings for the user's personal guide.
 */
async function getPersonalGuideSettings(userId) {
    const profile = await (0, profileService_1.getUserProfile)(userId);
    return {
        name: profile.personal_guide_name || 'Your Inner Guide',
        voiceId: profile.guide_voice_id || 'LcfcDJNUP1GQjkzn1xUU', // Default to Emily
        gender: profile.guide_gender || 'neutral',
        language: profile.guide_language || 'en',
    };
}
/**
 * Returns the text-to-speech personalization block for ElevenLabs or other integrations.
 */
function getVoiceSynthesisConfig(guide) {
    return {
        voice_id: guide.voiceId,
        language: guide.language,
        metadata: {
            speaker: guide.name,
            gender: guide.gender,
        },
    };
}
