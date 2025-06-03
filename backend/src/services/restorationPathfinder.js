"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestorationPath = getRestorationPath;
// 📁 BACKEND/src/services/restorationPathfinder.ts
function getRestorationPath(phase) {
    switch (phase) {
        case 'Water 2':
            return ['Dream journaling', 'Ritual bath', 'Shadow invocation'];
        case 'Fire 3':
            return ['Creative expression', 'Fire breathwork', 'Sacred rage ritual'];
        default:
            return ['Grounding walk', 'Nature time', 'Breath coherence'];
    }
}
