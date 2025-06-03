"use strict";
// src/routes/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const memoryRoutes_1 = __importDefault(require("./memoryRoutes"));
const journal_routes_1 = __importDefault(require("./journal.routes"));
const survey_routes_1 = __importDefault(require("./survey.routes"));
const session_routes_1 = __importDefault(require("./session.routes"));
const storyGenerator_routes_1 = __importDefault(require("./storyGenerator.routes"));
const symbolicTrends_routes_1 = __importDefault(require("./symbolicTrends.routes"));
const learning_routes_1 = __importDefault(require("./learning.routes"));
const facilitator_routes_1 = __importDefault(require("./facilitator.routes"));
const symbolicMemory_routes_1 = __importDefault(require("./symbolicMemory.routes"));
const personalOracle_routes_1 = __importDefault(require("./oracle/personalOracle.routes"));
const personalGuide_routes_1 = __importDefault(require("./oracle/personalGuide.routes"));
const dream_routes_1 = __importDefault(require("./oracle/dream.routes"));
const modeSelector_routes_1 = __importDefault(require("./oracle/modeSelector.routes"));
const founder_routes_1 = __importDefault(require("./founder.routes"));
const retreat_routes_1 = __importDefault(require("./retreat.routes"));
const retreatOnboarding_routes_1 = __importDefault(require("./retreatOnboarding.routes"));
const retreatSupport_routes_1 = __importDefault(require("./retreatSupport.routes"));
const postRetreat_routes_1 = __importDefault(require("./postRetreat.routes"));
const holoflower_routes_1 = require("./holoflower.routes");
const elementalAlchemy_routes_1 = require("./elementalAlchemy.routes");
const astrology_routes_1 = require("./astrology.routes");
const facilitatorDashboard_routes_1 = require("./facilitatorDashboard.routes");
const automation_routes_1 = __importDefault(require("./automation.routes"));
const router = (0, express_1.Router)();
/**
 * 🌐 Root index route for healthcheck or greeting
 */
router.get('/', (req, res) => {
    res.send('🔮 Oracle Backend is Alive');
});
/**
 * 🧩 API Aggregation
 */
router.use('/auth', authRoutes_1.default);
router.use('/memory', memoryRoutes_1.default);
router.use('/personal-guide', personalGuide_routes_1.default);
router.use('/api/oracle/dream', dream_routes_1.default);
router.use('/oracle/personal', personalOracle_routes_1.default);
router.use('/api/oracle', modeSelector_routes_1.default);
router.use('/symbolic-tags', symbolicMemory_routes_1.default);
router.use('/journal', journal_routes_1.default);
router.use('/survey', survey_routes_1.default);
router.use('/session', session_routes_1.default);
router.use('/oracle/story-generator', storyGenerator_routes_1.default);
router.use('/symbolic-trends', symbolicTrends_routes_1.default);
router.use('/learning', learning_routes_1.default);
router.use('/facilitator', facilitator_routes_1.default);
router.use('/founder', founder_routes_1.default);
router.use('/retreat', retreat_routes_1.default);
router.use('/retreat/onboarding', retreatOnboarding_routes_1.default);
router.use('/retreat/support', retreatSupport_routes_1.default);
router.use('/post-retreat', postRetreat_routes_1.default);
router.use('/holoflower', holoflower_routes_1.holoflowerRouter);
router.use('/elemental-alchemy', elementalAlchemy_routes_1.elementalAlchemyRouter);
router.use('/astrology', astrology_routes_1.astrologyRouter);
router.use('/facilitator', facilitatorDashboard_routes_1.facilitatorDashboardRouter);
router.use('/automation', automation_routes_1.default);
exports.default = router;
