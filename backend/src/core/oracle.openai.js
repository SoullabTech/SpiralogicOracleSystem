"use strict";
/**
 * @openapi
 * /api/oracle:
 *   post:
 *     summary: Ask the Oracle a question.
 *     tags:
 *       - Oracle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               userId:
 *                 type: string
 *               context:
 *                 type: object
 *             required:
 *               - query
 *               - userId
 *     responses:
 *       200:
 *         description: AI Oracle response.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 */
/**
 * @openapi
 * /api/oracle/facet-lookup:
 *   post:
 *     summary: Detect the elemental facet of input text.
 *     tags:
 *       - Facets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *             required:
 *               - input
 *     responses:
 *       200:
 *         description: The detected facet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facet:
 *                   type: string
 */
/**
 * @openapi
 * /api/oracle/insight-history:
 *   get:
 *     summary: Retrieve past oracle insights.
 *     tags:
 *       - Insights
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of past insights for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     AIResponse:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *         provider:
 *           type: string
 *         model:
 *           type: string
 *         confidence:
 *           type: number
 *         metadata:
 *           type: object
 */
