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
import modeSelectorRoutes from './oracle/modeSelector.routes';
import founderRoutes from './founder.routes';
import retreatRoutes from './retreat.routes';
import retreatOnboardingRoutes from './retreatOnboarding.routes';
import retreatSupportRoutes from './retreatSupport.routes';
import postRetreatRoutes from './postRetreat.routes';
import { holoflowerRouter } from './holoflower.routes';
import { elementalAlchemyRouter } from './elementalAlchemy.routes';
import { astrologyRouter } from './astrology.routes';
import { facilitatorDashboardRouter } from './facilitatorDashboard.routes';
import automationRoutes from './automation.routes';

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
router.use('/api/oracle', modeSelectorRoutes);
router.use('/symbolic-tags', symbolicMemoryRoutes);
router.use('/journal', journalRoutes);
router.use('/survey', surveyRoutes);
router.use('/session', sessionRoutes);
router.use('/oracle/story-generator', storyRoutes);
router.use('/symbolic-trends', symbolicTrendsRoutes);
router.use('/learning', learningRoutes);
router.use('/facilitator', facilitatorRoutes);
router.use('/founder', founderRoutes);
router.use('/retreat', retreatRoutes);
router.use('/retreat/onboarding', retreatOnboardingRoutes);
router.use('/retreat/support', retreatSupportRoutes);
router.use('/post-retreat', postRetreatRoutes);
router.use('/holoflower', holoflowerRouter);
router.use('/elemental-alchemy', elementalAlchemyRouter);
router.use('/astrology', astrologyRouter);
router.use('/facilitator', facilitatorDashboardRouter);
router.use('/automation', automationRoutes);

export default router;
