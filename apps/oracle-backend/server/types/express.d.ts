import { Router } from 'express';
import { handleSurveySubmission } from '../controllers/survey.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * POST /api/survey/submit
 * Requires valid JWT (authenticate middleware)
 * Handles survey submission and stores elemental profile
 */
router.post('/submit', authenticate, handleSurveySubmission);

export default router;
