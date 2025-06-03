"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveySubmissionSchema = exports.surveyResponseSchema = exports.crystalFocusSchema = exports.CRYSTAL_FOCUS_OPTIONS = void 0;
const zod_1 = require("zod");
// 🎯 Crystal Focus Options
exports.CRYSTAL_FOCUS_OPTIONS = [
    {
        type: 'career',
        title: 'Career Crystal',
        description: 'Focus on professional growth, leadership, and purpose in work.',
        elements: ['earth', 'air'],
    },
    {
        type: 'spiritual',
        title: 'Spiritual Crystal',
        description: 'Explore consciousness, meaning, and connection to higher purpose.',
        elements: ['fire', 'aether'],
    },
    {
        type: 'relational',
        title: 'Relational Crystal',
        description: 'Develop deeper connections and emotional intelligence in relationships.',
        elements: ['water', 'air'],
    },
    {
        type: 'health',
        title: 'Health Crystal',
        description: 'Balance physical wellbeing, vitality, and holistic health practices.',
        elements: ['earth', 'water'],
    },
    {
        type: 'creative',
        title: 'Creative Crystal',
        description: 'Unlock creative potential and artistic expression.',
        elements: ['fire', 'water'],
    },
    {
        type: 'other',
        title: 'Custom Crystal',
        description: 'Define your own unique focus area.',
        elements: [],
    },
];
// ✅ Zod Schemas
exports.crystalFocusSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'career',
        'spiritual',
        'relational',
        'health',
        'creative',
        'other',
    ]),
    customDescription: zod_1.z.string().optional(),
    challenges: zod_1.z.string().min(1, 'Please describe a challenge.'),
    aspirations: zod_1.z.string().min(1, 'Please describe an aspiration.'),
});
exports.surveyResponseSchema = zod_1.z.object({
    questionId: zod_1.z.string(),
    answer: zod_1.z.number().int().min(1).max(5),
});
exports.surveySubmissionSchema = zod_1.z.object({
    userId: zod_1.z.string().min(3),
    responses: zod_1.z.array(exports.surveyResponseSchema).min(1),
    crystalFocus: exports.crystalFocusSchema,
});
