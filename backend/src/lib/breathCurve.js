// 📁 BACKEND/src/lib/breathCurve.ts
export function voiceToBreathCurve(voiceSample) {
    return voiceSample.map((v, i) => `${i * 10},${v * 100}`).join(' ');
}
