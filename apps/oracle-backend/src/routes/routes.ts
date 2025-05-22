import express from 'express';

// Import individual route files
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import facetRoutes from './facet.routes';
import facetMapRoutes from './facetMap.routes';
import facilitatorRoutes from './facilitatorRoutes';
import feedbackRoutes from './feedback.routes';
import fieldpulseRoutes from './fieldpulse.routes';
import flowRoutes from './flow.routes';
import insightHistoryRoutes from './insightHistory.routes';
import journalRoutes from './journal.routes';
import memoryRoutes from './memory.routes';
import notionIngestRoutes from './notionIngest.routes';
import personalGuideRoutes from './oracle/personalGuide.routes';
import personalOracleRoutes from './oracle/personalOracle.routes';
import profileSettingsRoutes from './profileSettings.routes';
import sessionRoutes from './session.routes';
import storyGeneratorRoutes from './storyGenerator.routes';
import surveyRoutes from './survey.routes';
import symbolicMemoryRoutes from './symbolicMemory.routes';
import symbolicTrendsRoutes from './symbolicTrends.routes';
import userRoutes from './user.routes';
import userProfileRoutes from './userProfile.routes';
import personalRoutes from './personal.routes';

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/facets', facetRoutes);
router.use('/facet-map', facetMapRoutes);
router.use('/facilitator', facilitatorRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/fieldpulse', fieldpulseRoutes);
router.use('/flow', flowRoutes);
router.use('/insights', insightHistoryRoutes);
router.use('/journal', journalRoutes);
router.use('/memory', memoryRoutes);
router.use('/notion', notionIngestRoutes);
router.use('/personal-guide', personalGuideRoutes);
router.use('/personal-oracle', personalOracleRoutes);
router.use('/profile-settings', profileSettingsRoutes);
router.use('/sessions', sessionRoutes);
router.use('/story-generator', storyGeneratorRoutes);
router.use('/survey', surveyRoutes);
router.use('/symbolic-memory', symbolicMemoryRoutes);
router.use('/symbolic-trends', symbolicTrendsRoutes);
router.use('/users', userRoutes);
router.use('/user-profile', userProfileRoutes);
router.use('/personal', personalRoutes);

export default router;
