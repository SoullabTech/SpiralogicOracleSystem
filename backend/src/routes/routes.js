"use strict";
// 📁 File: /routes/routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import individual route files with explicit '.js' extensions for ESM compatibility
const authRoutes_js_1 = __importDefault(require("./authRoutes.js"));
const chatRoutes_js_1 = __importDefault(require("./chatRoutes.js"));
const facet_routes_js_1 = __importDefault(require("./facet.routes.js"));
const facetMap_routes_js_1 = __importDefault(require("./facetMap.routes.js"));
const facilitatorRoutes_js_1 = __importDefault(require("./facilitatorRoutes.js"));
const feedback_routes_js_1 = __importDefault(require("./feedback.routes.js"));
const fieldpulse_routes_js_1 = __importDefault(require("./fieldpulse.routes.js"));
const flow_routes_js_1 = __importDefault(require("./flow.routes.js"));
const insightHistory_routes_js_1 = __importDefault(require("./insightHistory.routes.js"));
const journal_routes_js_1 = __importDefault(require("./journal.routes.js"));
const memory_routes_js_1 = __importDefault(require("./memory.routes.js"));
const notionIngest_routes_js_1 = __importDefault(require("./notionIngest.routes.js"));
const personalGuide_routes_js_1 = __importDefault(require("./oracle/personalGuide.routes.js"));
const personalOracle_routes_js_1 = __importDefault(require("./oracle/personalOracle.routes.js"));
const profileSettings_routes_js_1 = __importDefault(require("./profileSettings.routes.js"));
const session_routes_js_1 = __importDefault(require("./session.routes.js"));
const storyGenerator_routes_js_1 = __importDefault(require("./storyGenerator.routes.js"));
const survey_routes_js_1 = __importDefault(require("./survey.routes.js"));
const symbolicMemory_routes_js_1 = __importDefault(require("./symbolicMemory.routes.js"));
const symbolicTrends_routes_js_1 = __importDefault(require("./symbolicTrends.routes.js"));
const user_routes_js_1 = __importDefault(require("./user.routes.js"));
const userProfile_routes_js_1 = __importDefault(require("./userProfile.routes.js"));
const personal_routes_js_1 = __importDefault(require("./oracle/personal.routes.js")); // Corrected import path with .js extension
const router = express_1.default.Router();
// Register routes
router.use('/auth', authRoutes_js_1.default);
router.use('/chat', chatRoutes_js_1.default);
router.use('/facets', facet_routes_js_1.default);
router.use('/facet-map', facetMap_routes_js_1.default);
router.use('/facilitator', facilitatorRoutes_js_1.default);
router.use('/feedback', feedback_routes_js_1.default);
router.use('/fieldpulse', fieldpulse_routes_js_1.default);
router.use('/flow', flow_routes_js_1.default);
router.use('/insights', insightHistory_routes_js_1.default);
router.use('/journal', journal_routes_js_1.default);
router.use('/memory', memory_routes_js_1.default);
router.use('/notion', notionIngest_routes_js_1.default);
router.use('/personal-guide', personalGuide_routes_js_1.default);
router.use('/personal-oracle', personalOracle_routes_js_1.default);
router.use('/profile-settings', profileSettings_routes_js_1.default);
router.use('/sessions', session_routes_js_1.default);
router.use('/story-generator', storyGenerator_routes_js_1.default);
router.use('/survey', survey_routes_js_1.default);
router.use('/symbolic-memory', symbolicMemory_routes_js_1.default);
router.use('/symbolic-trends', symbolicTrends_routes_js_1.default);
router.use('/users', user_routes_js_1.default);
router.use('/user-profile', userProfile_routes_js_1.default);
router.use('/personal', personal_routes_js_1.default);
exports.default = router;
