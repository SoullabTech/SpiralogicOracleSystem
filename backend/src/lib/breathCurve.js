"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceToBreathCurve = voiceToBreathCurve;
// 📁 BACKEND/src/lib/breathCurve.ts
function voiceToBreathCurve(voiceSample) {
    return voiceSample.map((v, i) => `${i * 10},${v * 100}`).join(' ');
}
