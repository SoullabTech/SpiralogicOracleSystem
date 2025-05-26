// oracle-backend/src/routes/facetMap.routes.ts

import { Router } from 'express';
import { detectFacetFromInput } from '../services/facetService';
import { elementalFacetMap } from '../constants/elementalFacetMap';

const router = Router();

/**
 * GET /api/oracle/facet-map
 * Returns the entire static facet map
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      facets: elementalFacetMap,
    },
  });
});

/**
 * POST /api/oracle/facet-map/detect
 * Request body should include: { input: string }
 * Returns detected element and matching facet info
 */
router.post('/detect', (req, res) => {
  const { input } = req.body;

  if (typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing `input`.',
    });
  }

  try {
    const element = detectFacetFromInput(input);
    const facetInfo = elementalFacetMap[element as keyof typeof elementalFacetMap];

    if (!facetInfo) {
      return res.status(404).json({
        success: false,
        error: `No facets for element "${element}".`,
      });
    }

    return res.json({
      success: true,
      data: {
        element,
        facet: facetInfo,
      },
    });
  } catch (err) {
    console.error('❌ Error in facet-map detection:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
