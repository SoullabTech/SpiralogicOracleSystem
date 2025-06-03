"use strict";
// oracle-backend/src/routes/facetMap.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
// Get the full elemental facet map
router.get('/', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const { data, error } = await server_1.supabase
        .from('facet_map')
        .select('*')
        .order('element')
        .order('facet');
    if (error) {
        logger_1.logger.error('Error fetching facet map:', error);
        throw (0, errorHandler_1.createError)('Unable to retrieve facet map', 500);
    }
    res.json({ facets: data });
}));
// Get a specific facet by ID or name
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const facetId = req.params.id;
    const { data, error } = await server_1.supabase
        .from('facet_map')
        .select('*')
        .or(`id.eq.${facetId},facet.eq.${facetId}`)
        .single();
    if (error) {
        logger_1.logger.error('Error fetching specific facet:', error);
        throw (0, errorHandler_1.createError)('Facet not found', 404);
    }
    res.json({ facet: data });
}));
exports.default = router;
