"use strict";
// src/routes/facet.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facetService_1 = require("../services/facetService");
const router = (0, express_1.Router)();
/**
 * GET /api/oracle/facet-lookup
 * Fetches and returns all Spiralogic facets from the database.
 */
router.get('/', async (_req, res) => {
    try {
        const facets = await (0, facetService_1.getAllFacetMappings)();
        return res.status(200).json({ success: true, facets });
    }
    catch (err) {
        console.error('❌ Error fetching facets:', err.message || err);
        return res.status(500).json({ success: false, error: 'Failed to fetch facets' });
    }
});
exports.default = router;
