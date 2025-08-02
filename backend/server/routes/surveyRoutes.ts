import { Router } from 'express';
import { surveyQuestions } from '../data/questions.js';
import type { ElementalProfile, SurveySubmission } from '../../src/types/survey.js';

const router = Router();

// In-memory storage (replace with database in production)
const profiles = new Map<string, ElementalProfile>();

// Get survey questions
router.get('/questions', (_req, res) => {
  res.json({ questions: surveyQuestions });
});

// Get user's elemental profile
router.get('/profile/:userId', (req, res) => {
  const profile = profiles.get(req.params.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ profile });
});

// Submit survey responses
router.post('/submit', (req, res) => {
  try {
    const submission: SurveySubmission = req.body;

    // Calculate elemental scores
    const scores = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    };

    // Process each response
    submission.responses.forEach(response => {
      const question = surveyQuestions.find(q => q.id === response.questionId);
      if (question) {
        scores[question.element] += response.answer * question.weight;
      }
    });

    // Normalize scores to 0-100 range
    Object.keys(scores).forEach(element => {
      const key = element as keyof typeof scores;
      scores[key] = Math.round((scores[key] / (5 * surveyQuestions.filter(q => q.element === key).length)) * 100);
    });

    // Create profile
    const profile: ElementalProfile = {
      ...scores,
      userId: submission.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile
    profiles.set(submission.userId, profile);

    res.json({ profile });
  } catch (error) {
    console.error('Error processing survey submission:', error);
    res.status(400).json({ error: 'Invalid submission' });
  }
});

export default router;