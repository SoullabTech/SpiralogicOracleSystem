"use strict";
// src/routes/survey.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const survey_controller_1 = require("../controllers/survey.controller");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Define the expected shape of the survey submission
const SurveySubmissionSchema = zod_1.z.object({
    crystalFocus: zod_1.z.object({
        type: zod_1.z.enum([
            'career',
            'spiritual',
            'relational',
            'health',
            'creative',
            'other',
        ]),
        customDescription: zod_1.z.string().optional(),
        challenges: zod_1.z.string(),
        aspirations: zod_1.z.string(),
    }),
    responses: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string(),
        answer: zod_1.z.number().min(1).max(5),
    })),
});
// POST /api/oracle/survey
router.post('/', async (req, res) => {
    try {
        const result = SurveySubmissionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission',
                details: result.error.flatten(),
            });
        }
        // Attach to request object for controller
        req.body = { ...result.data };
        return (0, survey_controller_1.handleSurveySubmission)(req, res);
    }
    catch (err) {
        console.error('❌ Survey processing error:', err);
        return res.status(500).json({
            success: false,
            error: 'Unexpected server error',
        });
    }
});
exports.default = router;
