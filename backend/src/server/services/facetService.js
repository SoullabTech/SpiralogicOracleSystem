"use strict";
// src/services/facetService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.facetService = void 0;
const mockFacets = {
    'fire-1': {
        id: 'fire-1',
        name: 'Visionary Spark',
        description: 'Initiates new ideas and ignites purpose.',
        element: 'Fire',
    },
    'water-2': {
        id: 'water-2',
        name: 'Emotional Alchemy',
        description: 'Facilitates emotional integration and healing.',
        element: 'Water',
    },
    'earth-1': {
        id: 'earth-1',
        name: 'Stabilizing Root',
        description: 'Grounds vision into structure and practice.',
        element: 'Earth',
    },
};
exports.facetService = {
    getFacet: (id) => {
        return mockFacets[id] || null;
    },
    listFacets: () => {
        return Object.values(mockFacets);
    },
    createFacet: (facet) => {
        mockFacets[facet.id] = facet;
        return facet;
    },
};
