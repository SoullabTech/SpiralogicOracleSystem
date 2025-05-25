// src/routes/index.ts

import { Router } from 'express';

import authRoutes from './authRoutes';
import memoryRoutes from './memoryRoutes';
import journalRoutes from './journal.routes';
import surveyRoutes from './survey.routes';
import sessionRoutes from './session.routes';
import storyRoutes from './storyGenerator.routes';
import symbolicTrendsRoutes from './symbolicTrends.routes';
import learningRoutes from './learning.routes';
import facilitatorRoutes from './facilitator.routes';
import symbolicMemoryRoutes from './symbolicMemory.routes';
import personalOracleRoutes from './oracle/personalOracle.routes';
import personalGuideRoutes from './oracle/personalGuide.routes';
import dreamRoutes from './oracle/dream.routes';

const router = Router();

/**
 * 🌐 Root index route for healthcheck or greeting
 */
router.get('/', (req, res) => {
  res.send('🔮 Oracle Backend is Alive');
});

/**
 * 🧩 API Aggregation
 */
router.use('/auth', authRoutes);
router.use('/memory', memoryRoutes);
router.use('/personal-guide', personalGuideRoutes);
router.use('/api/oracle/dream', dreamRoutes);
router.use('/oracle/personal', personalOracleRoutes);
router.use('/symbolic-tags', symbolicMemoryRoutes);
router.use('/journal', journalRoutes);
router.use('/survey', surveyRoutes);
router.use('/session', sessionRoutes);
router.use('/oracle/story-generator', storyRoutes);
router.use('/symbolic-trends', symbolicTrendsRoutes);
router.use('/learning', learningRoutes);
router.use('/facilitator', facilitatorRoutes);

export default router;
