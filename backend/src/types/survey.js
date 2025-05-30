import { z } from 'zod';
// 🎯 Crystal Focus Options
export const CRYSTAL_FOCUS_OPTIONS = [
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
export const crystalFocusSchema = z.object({
    type: z.enum([
        'career',
        'spiritual',
        'relational',
        'health',
        'creative',
        'other',
    ]),
    customDescription: z.string().optional(),
    challenges: z.string().min(1, 'Please describe a challenge.'),
    aspirations: z.string().min(1, 'Please describe an aspiration.'),
});
export const surveyResponseSchema = z.object({
    questionId: z.string(),
    answer: z.number().int().min(1).max(5),
});
export const surveySubmissionSchema = z.object({
    userId: z.string().min(3),
    responses: z.array(surveyResponseSchema).min(1),
    crystalFocus: crystalFocusSchema,
});
