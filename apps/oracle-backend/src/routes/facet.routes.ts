// src/routes/facet.routes.ts

import express from 'express';
import { facetService } from '../services/facetService';

const router = express.Router();

// 🔹 GET all facets
router.get('/', (req, res) => {
  const facets = getAllFacetMappings();
  res.json(facets);
});

// 🔹 GET single facet by ID
router.get('/:id', (req, res) => {
  const facet = facetService.getFacet(req.params.id);
  if (!facet) {
    return res.status(404).json({ error: 'Facet not found' });
  }
  res.json(facet);
});

// 🔹 POST new facet (for mock/testing)
router.post('/', (req, res) => {
  const { id, name, description, element } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing required fields: id or name' });
  }

  const newFacet = facetService.createFacet({ id, name, description, element });
  res.status(201).json(newFacet);
});

export default router;
